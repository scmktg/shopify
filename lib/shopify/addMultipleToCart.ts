'use server';

import { addToCart } from './cart';
import type { Cart } from '@/types/cart';

export interface CartItemInput {
  variantId: string;
  quantity: number;
}

/**
 * Adds several merchandise lines to the same Shopify cart and returns
 * the final cart snapshot. Kept as a small wrapper around the existing
 * single-line cart action so the rest of the cart implementation remains
 * unchanged.
 */
export async function addMultipleToCart(
  cartId: string,
  items: ReadonlyArray<CartItemInput>,
): Promise<Cart> {
  if (items.length === 0) {
    throw new Error('No cart items supplied.');
  }

  let updated: Cart | null = null;
  for (const item of items) {
    updated = await addToCart(cartId, item.variantId, item.quantity);
  }

  if (!updated) throw new Error('Could not update cart.');
  return updated;
}
