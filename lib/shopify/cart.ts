'use server';

import {
  shopifyClient,
  type ShopifyClientResponse,
} from './client';
import type { Cart, CartLine, CartLineMerchandise } from '@/types/cart';
import type { Money, ProductImage, SelectedOption } from '@/types/product';

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    totalQuantity
    checkoutUrl
    attributes { key value }
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

const CART_ATTRIBUTES_UPDATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {
    cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
      cart { ...CartFields }
      userErrors { field message }
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
  attributes: ReadonlyArray<{ key: string; value: string }>;
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

/**
 * Force the checkout URL onto the configured Shopify-served checkout
 * subdomain (e.g. `checkout.enviroaqua.com.au`). Needed because the
 * storefront's primary domain is the headless apex (`enviroaqua.com.au`),
 * which is served by Vercel — Shopify's returned `checkoutUrl` uses
 * the primary domain by default and would 404 on the Next.js side.
 * No-op when SHOPIFY_CHECKOUT_DOMAIN is unset.
 */
function rewriteCheckoutHost(url: string): string {
  const checkoutDomain = process.env.SHOPIFY_CHECKOUT_DOMAIN;
  if (!checkoutDomain) return url;
  try {
    const parsed = new URL(url);
    parsed.host = checkoutDomain;
    parsed.protocol = 'https:';
    return parsed.toString();
  } catch {
    return url;
  }
}

function transformCart(raw: RawCart): Cart {
  return {
    id: raw.id,
    totalQuantity: raw.totalQuantity,
    subtotalAmount: raw.cost.subtotalAmount,
    totalAmount: raw.cost.totalAmount,
    checkoutUrl: rewriteCheckoutHost(raw.checkoutUrl),
    attributes: raw.attributes ?? [],
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
  const result: ShopifyClientResponse<{ cart: RawCart | null }> =
    await shopifyClient.request<{ cart: RawCart | null }>(CART_QUERY, {
      variables: { cartId },
    });
  const { data, errors } = result;

  if (errors) {
    logShopifyErrors('getCart errors', errors);
    return null;
  }
  if (!data?.cart) return null;
  return transformCart(data.cart);
}

/**
 * Merge only our attribution namespace with current Shopify cart attributes.
 * This avoids erasing gift notes, delivery preferences or other integrations.
 * Do not send ad click identifiers or personal data in these attributes.
 */
export async function syncCartAcquisition(
  cartId: string,
  attribution: ReadonlyArray<{ key: string; value: string }>,
): Promise<Cart> {
  const current = await getCart(cartId);
  if (!current) throw new Error('Cart no longer exists');
  const keys = new Set(attribution.map(attribute => attribute.key));
  const existing = current.attributes.filter(attribute => !keys.has(attribute.key));
  // Clearing our namespace when permission is withdrawn is deliberate.
  const merged = [
    ...existing.filter(attribute => !attribute.key.startsWith('_ea_first_') &&
      !attribute.key.startsWith('_ea_latest_') && attribute.key !== '_ea_attribution_version'),
    ...attribution,
  ];
  const unchanged = merged.length === current.attributes.length &&
    merged.every((attribute, index) => attribute.key === current.attributes[index]?.key &&
      attribute.value === current.attributes[index]?.value);
  if (unchanged) return current;
  type Data = { cartAttributesUpdate: {
    cart: RawCart | null; userErrors: ReadonlyArray<UserError>
  } };
  const result: ShopifyClientResponse<Data> = await shopifyClient.request<Data>(
    CART_ATTRIBUTES_UPDATE_MUTATION, { variables: { cartId, attributes: merged } },
  );
  if (result.errors) throw new Error('Could not synchronize cart attribution');
  throwOnUserErrors('cartAttributesUpdate', result.data?.cartAttributesUpdate.userErrors ?? []);
  if (!result.data?.cartAttributesUpdate.cart) throw new Error('No updated cart returned');
  return transformCart(result.data.cartAttributesUpdate.cart);
}

export async function createCart(): Promise<Cart> {
  type CartCreateData = {
    cartCreate: { cart: RawCart | null; userErrors: ReadonlyArray<UserError> };
  };
  const result: ShopifyClientResponse<CartCreateData> =
    await shopifyClient.request<CartCreateData>(CART_CREATE_MUTATION);
  const { data, errors } = result;

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
  type CartLinesAddData = {
    cartLinesAdd: {
      cart: RawCart | null;
      userErrors: ReadonlyArray<UserError>;
    };
  };
  const result: ShopifyClientResponse<CartLinesAddData> =
    await shopifyClient.request<CartLinesAddData>(CART_LINES_ADD_MUTATION, {
      variables: {
        cartId,
        lines: [{ merchandiseId, quantity: safeQty }],
      },
    });
  const { data, errors } = result;

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

  type CartLinesUpdateData = {
    cartLinesUpdate: {
      cart: RawCart | null;
      userErrors: ReadonlyArray<UserError>;
    };
  };
  const result: ShopifyClientResponse<CartLinesUpdateData> =
    await shopifyClient.request<CartLinesUpdateData>(
      CART_LINES_UPDATE_MUTATION,
      {
        variables: {
          cartId,
          lines: [{ id: lineId, quantity: safeQty }],
        },
      },
    );
  const { data, errors } = result;

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
  type CartLinesRemoveData = {
    cartLinesRemove: {
      cart: RawCart | null;
      userErrors: ReadonlyArray<UserError>;
    };
  };
  const result: ShopifyClientResponse<CartLinesRemoveData> =
    await shopifyClient.request<CartLinesRemoveData>(
      CART_LINES_REMOVE_MUTATION,
      {
        variables: { cartId, lineIds: [lineId] },
      },
    );
  const { data, errors } = result;

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


export interface ShippingEstimateOption {
  title: string | null;
  deliveryMethodType: string;
  estimatedCost: Money;
}

export interface ShippingEstimateResult {
  ok: boolean;
  postcode: string;
  provinceCode: string | null;
  options: ReadonlyArray<ShippingEstimateOption>;
  error: string | null;
}

const SHIPPING_ESTIMATE_MUTATION = /* GraphQL */ `
  mutation ShippingEstimate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        deliveryGroups(first: 10) {
          nodes {
            deliveryOptions {
              title
              deliveryMethodType
              estimatedCost {
                amount
                currencyCode
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

interface RawShippingEstimateCart {
  deliveryGroups: {
    nodes: ReadonlyArray<{
      deliveryOptions: ReadonlyArray<ShippingEstimateOption>;
    }>;
  };
}

function provinceForAustralianPostcode(postcode: string): string | null {
  const numeric = Number.parseInt(postcode, 10);
  if (!/^\d{4}$/.test(postcode) || !Number.isFinite(numeric)) return null;

  if ((numeric >= 200 && numeric <= 299) || (numeric >= 2600 && numeric <= 2618) || (numeric >= 2900 && numeric <= 2920)) {
    return 'ACT';
  }
  if (
    (numeric >= 1000 && numeric <= 2599) ||
    (numeric >= 2619 && numeric <= 2899) ||
    (numeric >= 2921 && numeric <= 2999)
  ) {
    return 'NSW';
  }
  if ((numeric >= 3000 && numeric <= 3999) || (numeric >= 8000 && numeric <= 8999)) {
    return 'VIC';
  }
  if ((numeric >= 4000 && numeric <= 4999) || (numeric >= 9000 && numeric <= 9999)) {
    return 'QLD';
  }
  if (numeric >= 5000 && numeric <= 5999) return 'SA';
  if (numeric >= 6000 && numeric <= 6999) return 'WA';
  if (numeric >= 7000 && numeric <= 7999) return 'TAS';
  if ((numeric >= 800 && numeric <= 899) || (numeric >= 900 && numeric <= 999)) {
    return 'NT';
  }
  return null;
}

/**
 * Returns Shopify's actual delivery options for one product and postcode.
 * Uses a short-lived one-item cart so checking a rate never changes the
 * customer's real cart.
 */
export async function estimateProductShipping(
  variantId: string,
  postcodeInput: string,
): Promise<ShippingEstimateResult> {
  const postcode = postcodeInput.trim();
  const provinceCode = provinceForAustralianPostcode(postcode);

  if (!provinceCode) {
    return {
      ok: false,
      postcode,
      provinceCode: null,
      options: [],
      error: 'Enter a valid 4-digit Australian postcode.',
    };
  }

  if (!variantId.startsWith('gid://shopify/ProductVariant/')) {
    return {
      ok: false,
      postcode,
      provinceCode,
      options: [],
      error: 'This product cannot be quoted right now.',
    };
  }

  type ShippingEstimateData = {
    cartCreate: {
      cart: RawShippingEstimateCart | null;
      userErrors: ReadonlyArray<UserError>;
    };
  };

  try {
    const result: ShopifyClientResponse<ShippingEstimateData> =
      await shopifyClient.request<ShippingEstimateData>(
        SHIPPING_ESTIMATE_MUTATION,
        {
          variables: {
            input: {
              lines: [{ merchandiseId: variantId, quantity: 1 }],
              buyerIdentity: { countryCode: 'AU' },
              delivery: {
                addresses: [
                  {
                    selected: true,
                    oneTimeUse: true,
                    validationStrategy: 'COUNTRY_CODE_ONLY',
                    address: {
                      deliveryAddress: {
                        countryCode: 'AU',
                        provinceCode,
                        zip: postcode,
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      );

    const { data, errors } = result;
    if (errors) {
      logShopifyErrors('estimateProductShipping errors', errors);
      return {
        ok: false,
        postcode,
        provinceCode,
        options: [],
        error: 'Could not calculate delivery right now.',
      };
    }

    const userErrors = data?.cartCreate.userErrors ?? [];
    if (userErrors.length > 0) {
      logShopifyErrors('estimateProductShipping userErrors', userErrors);
      return {
        ok: false,
        postcode,
        provinceCode,
        options: [],
        error: userErrors.map((e) => e.message).join('; '),
      };
    }

    const cart = data?.cartCreate.cart;
    if (!cart) {
      return {
        ok: false,
        postcode,
        provinceCode,
        options: [],
        error: 'Could not calculate delivery right now.',
      };
    }

    const options = cart.deliveryGroups.nodes
      .flatMap((group) => group.deliveryOptions)
      .filter((option) => option.deliveryMethodType === 'SHIPPING');

    return {
      ok: true,
      postcode,
      provinceCode,
      options,
      error: null,
    };
  } catch (caught) {
    console.error('[shopify] estimateProductShipping failed:', caught);
    return {
      ok: false,
      postcode,
      provinceCode,
      options: [],
      error: 'Could not calculate delivery right now.',
    };
  }
}


const QUOTE_CART_CREATE = /* GraphQL */ `
 mutation QuoteCartCreate($input:CartInput!){cartCreate(input:$input){cart{id} userErrors{field message}}}
`;
const QUOTE_DELIVERY_ADD = /* GraphQL */ `
 mutation QuoteDeliveryAdd($cartId:ID!,$addresses:[CartSelectableAddressInput!]!){
  cartDeliveryAddressesAdd(cartId:$cartId,addresses:$addresses){
   cart{id deliveryGroups(first:20){nodes{deliveryOptions{title deliveryMethodType estimatedCost{amount currencyCode}}}}}
   userErrors{field message}
  }
 }
`;
const QUOTE_CART_RATES = /* GraphQL */ `
 query QuoteCartRates($id:ID!){cart(id:$id){deliveryGroups(first:20){nodes{deliveryOptions{title deliveryMethodType estimatedCost{amount currencyCode}}}}}}
`;
/** Obtain actual Shopify rates for the combined basket and delivery postcode. */
export async function estimateQuoteShipping(lines: ReadonlyArray<{variantId:string;quantity:number}>, destination:{street:string;city:string;provinceCode:string;postcode:string}):Promise<ShippingEstimateResult>{
 const postcode=destination.postcode.trim();const provinceCode=provinceForAustralianPostcode(postcode);
 const failure=(error:string):ShippingEstimateResult=>({ok:false,postcode,provinceCode,options:[],error});
 if(!provinceCode||provinceCode!==destination.provinceCode||!destination.street.trim()||!destination.city.trim())return failure('Enter a complete delivery address with matching state and postcode.');
 if(!lines.length||lines.length>50||lines.some(l=>!l.variantId.startsWith('gid://shopify/ProductVariant/')||!Number.isSafeInteger(l.quantity)||l.quantity<1||l.quantity>99))return failure('Invalid products or quantities.');
 try{
  type CartCreated={cartCreate:{cart:{id:string}|null;userErrors:ReadonlyArray<UserError>}};
  const created=await shopifyClient.request<CartCreated>(QUOTE_CART_CREATE,{variables:{input:{lines:lines.map(l=>({merchandiseId:l.variantId,quantity:l.quantity})),buyerIdentity:{countryCode:'AU'}}}});
  const id=created.data?.cartCreate.cart?.id;
  if(created.errors||!id||created.data?.cartCreate.userErrors.length)return failure('Shopify could not create a delivery estimate.');
  type Added={cartDeliveryAddressesAdd:{cart:{id:string;deliveryGroups:RawShippingEstimateCart['deliveryGroups']}|null;userErrors:ReadonlyArray<UserError>}};
  const addresses=[{selected:true,oneTimeUse:true,validationStrategy:'COUNTRY_CODE_ONLY',address:{deliveryAddress:{countryCode:'AU',provinceCode,zip:postcode,address1:destination.street.trim(),city:destination.city.trim()}}}];
  const added=await shopifyClient.request<Added>(QUOTE_DELIVERY_ADD,{variables:{cartId:id,addresses}});
  if(added.errors||added.data?.cartDeliveryAddressesAdd.userErrors.length)return failure('Shopify could not apply this delivery postcode.');
  let groups=added.data?.cartDeliveryAddressesAdd.cart?.deliveryGroups.nodes??[];
  if(!groups.length){
   const reread=await shopifyClient.request<{cart:{deliveryGroups:RawShippingEstimateCart['deliveryGroups']}|null}>(QUOTE_CART_RATES,{variables:{id}});
   if(reread.errors)return failure('Shopify could not retrieve shipping options.');
   groups=reread.data?.cart?.deliveryGroups.nodes??[];
  }
  if(!groups.length)return failure('Shopify returned no shipping options for this basket and postcode. Pickup-only products or incomplete shipping configuration may prevent delivery.');
  const rates=groups.map(g=>g.deliveryOptions.filter(o=>o.deliveryMethodType==='SHIPPING'&&o.estimatedCost.currencyCode==='AUD'&&Number.isFinite(Number(o.estimatedCost.amount))).sort((a,b)=>Number(a.estimatedCost.amount)-Number(b.estimatedCost.amount))[0]);
  if(rates.some(r=>!r))return failure('Delivery unavailable for at least one selected product. Contact Enviro Aqua about freight or pickup.');
  const cents=rates.reduce((n,r)=>n+Math.round(Number(r.estimatedCost.amount)*100),0);
  return {ok:true,postcode,provinceCode,options:[{title:'Shopify delivery estimate',deliveryMethodType:'SHIPPING',estimatedCost:{amount:(cents/100).toFixed(2),currencyCode:'AUD'}}],error:null};
 }catch(e){console.error('[shopify] quote shipping estimate failed',e);return failure('Shipping rates temporarily unavailable.');}
}
