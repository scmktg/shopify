'use server';

import { shopifyClient } from './client';
import type { Cart, CartLine, CartLineMerchandise } from '@/types/cart';
import type { Money, ProductImage, SelectedOption } from '@/types/product';

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    totalQuantity
    checkoutUrl
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              sku
              selectedOptions {
                name
                value
              }
              image {
                url
                altText
                width
                height
              }
              price {
                amount
                currencyCode
              }
              product {
                handle
                title
                tags
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

const CART_QUERY = /* GraphQL */ `
  ${CART_FRAGMENT}
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
`;

const CART_CREATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartCreate {
    cartCreate {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

interface RawCartLineNode {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    sku: string | null;
    selectedOptions: ReadonlyArray<SelectedOption>;
    image: ProductImage | null;
    price: Money;
    product: {
      handle: string;
      title: string;
      tags: ReadonlyArray<string>;
    };
  };
  cost: { totalAmount: Money };
}

interface RawCart {
  id: string;
  totalQuantity: number;
  checkoutUrl: string;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
  lines: {
    edges: ReadonlyArray<{ node: RawCartLineNode }>;
  };
}

interface UserError {
  field: ReadonlyArray<string> | null;
  message: string;
}

function transformLine(node: RawCartLineNode): CartLine {
  const merchandise: CartLineMerchandise = {
    id: node.merchandise.id,
    title: node.merchandise.title,
    sku: node.merchandise.sku,
    selectedOptions: node.merchandise.selectedOptions,
    image: node.merchandise.image,
    price: node.merchandise.price,
    product: node.merchandise.product,
  };
  return {
    id: node.id,
    quantity: node.quantity,
    merchandise,
    totalAmount: node.cost.totalAmount,
  };
}

function transformCart(raw: RawCart): Cart {
  return {
    id: raw.id,
    totalQuantity: raw.totalQuantity,
    subtotalAmount: raw.cost.subtotalAmount,
    totalAmount: raw.cost.totalAmount,
    checkoutUrl: raw.checkoutUrl,
    lines: raw.lines.edges.map((edge) => transformLine(edge.node)),
  };
}

function logShopifyErrors(label: string, errors: unknown): void {
  console.error(`[shopify] ${label}:`, JSON.stringify(errors, null, 2));
}

function throwOnUserErrors(label: string, userErrors: ReadonlyArray<UserError>): void {
  if (userErrors.length === 0) return;
  const message = userErrors.map((e) => e.message).join('; ');
  throw new Error(`${label} failed: ${message}`, { cause: userErrors });
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const { data, errors } = await shopifyClient.request<{
    cart: RawCart | null;
  }>(CART_QUERY, {
    variables: { cartId },
  });

  if (errors) {
    logShopifyErrors('getCart errors', errors);
    return null;
  }
  if (!data?.cart) return null;
  return transformCart(data.cart);
}

export async function createCart(): Promise<Cart> {
  const { data, errors } = await shopifyClient.request<{
    cartCreate: { cart: RawCart | null; userErrors: ReadonlyArray<UserError> };
  }>(CART_CREATE_MUTATION);

  if (errors) {
    logShopifyErrors('createCart errors', errors);
    throw new Error('Could not create cart', { cause: errors });
  }
  throwOnUserErrors('cartCreate', data?.cartCreate.userErrors ?? []);
  if (!data?.cartCreate.cart) throw new Error('cartCreate returned no cart');
  return transformCart(data.cartCreate.cart);
}

export async function addToCart(
  cartId: string,
  merchandiseId: string,
  quantity: number,
): Promise<Cart> {
  const safeQty = Math.min(Math.max(Math.floor(quantity), 1), 999);
  const { data, errors } = await shopifyClient.request<{
    cartLinesAdd: { cart: RawCart | null; userErrors: ReadonlyArray<UserError> };
  }>(CART_LINES_ADD_MUTATION, {
    variables: {
      cartId,
      lines: [{ merchandiseId, quantity: safeQty }],
    },
  });

  if (errors) {
    logShopifyErrors('addToCart errors', errors);
    throw new Error('Could not add to cart', { cause: errors });
  }
  throwOnUserErrors('cartLinesAdd', data?.cartLinesAdd.userErrors ?? []);
  if (!data?.cartLinesAdd.cart) {
    throw new Error('cartLinesAdd returned no cart');
  }
  return transformCart(data.cartLinesAdd.cart);
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<Cart> {
  const safeQty = Math.min(Math.max(Math.floor(quantity), 0), 999);
  if (safeQty === 0) {
    return removeCartLine(cartId, lineId);
  }

  const { data, errors } = await shopifyClient.request<{
    cartLinesUpdate: {
      cart: RawCart | null;
      userErrors: ReadonlyArray<UserError>;
    };
  }>(CART_LINES_UPDATE_MUTATION, {
    variables: {
      cartId,
      lines: [{ id: lineId, quantity: safeQty }],
    },
  });

  if (errors) {
    logShopifyErrors('updateCartLine errors', errors);
    throw new Error('Could not update cart line', { cause: errors });
  }
  throwOnUserErrors('cartLinesUpdate', data?.cartLinesUpdate.userErrors ?? []);
  if (!data?.cartLinesUpdate.cart) {
    throw new Error('cartLinesUpdate returned no cart');
  }
  return transformCart(data.cartLinesUpdate.cart);
}

export async function removeCartLine(
  cartId: string,
  lineId: string,
): Promise<Cart> {
  const { data, errors } = await shopifyClient.request<{
    cartLinesRemove: {
      cart: RawCart | null;
      userErrors: ReadonlyArray<UserError>;
    };
  }>(CART_LINES_REMOVE_MUTATION, {
    variables: { cartId, lineIds: [lineId] },
  });

  if (errors) {
    logShopifyErrors('removeCartLine errors', errors);
    throw new Error('Could not remove cart line', { cause: errors });
  }
  throwOnUserErrors('cartLinesRemove', data?.cartLinesRemove.userErrors ?? []);
  if (!data?.cartLinesRemove.cart) {
    throw new Error('cartLinesRemove returned no cart');
  }
  return transformCart(data.cartLinesRemove.cart);
}
