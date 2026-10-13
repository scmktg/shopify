import type { CartLine } from '@/types/cart';
import type { Money, ProductCardData } from '@/types/product';

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  price?: number;
  quantity?: number;
  item_brand?: string;
  item_category?: string;
  item_variant?: string;
  item_sku?: string;
  item_handle?: string;
  shopify_product_id?: string;
  index?: number;
}

export function moneyValue(money: Money): number {
  const value = Number.parseFloat(money.amount);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

// Shopify ProductVariant GID is our canonical item_id on every event.
// SKU and handle are supplementary metadata, never alternate item_ids.
export function cartLineToAnalyticsItem(
  line: CartLine,
  quantity = line.quantity,
): AnalyticsItem {
  return {
    item_id: line.merchandise.id,
    item_name: line.merchandise.product.title,
    price: moneyValue(line.merchandise.price),
    quantity,
    item_variant: line.merchandise.title,
    ...(line.merchandise.sku ? { item_sku: line.merchandise.sku } : {}),
    item_handle: line.merchandise.product.handle,
    item_brand: 'Enviro Aqua',
  };
}

export function cardToAnalyticsItem(
  product: ProductCardData,
  variantId?: string | null,
): AnalyticsItem {
  const variant = product.variants.find((item) => item.id === variantId)
    ?? product.variants[0];
  return {
    item_id: variant?.id ?? product.id,
    item_name: product.title,
    price: variant?.price ? moneyValue(variant.price) : moneyValue(product.price),
    quantity: 1,
    item_brand: 'Enviro Aqua',
    item_category: product.productType || undefined,
    item_variant: variant?.title,
    ...(variant?.sku ? { item_sku: variant.sku } : {}),
    item_handle: product.handle,
    shopify_product_id: product.id,
  };
}

export interface QueuedEvent {
  name: string;
  params: Record<string, unknown>;
  queuedAt: number;
}

export function createEventQueue(limit = 40, ttlMs = 30000) {
  const pending: QueuedEvent[] = [];
  return {
    enqueue(name: string, params: Record<string, unknown>, now = Date.now()) {
      pending.push({ name, params, queuedAt: now });
      if (pending.length > limit) pending.splice(0, pending.length - limit);
    },
    drain(now = Date.now()): QueuedEvent[] {
      const ready = pending.filter((event) => now - event.queuedAt <= ttlMs);
      pending.length = 0;
      return ready;
    },
    clear() { pending.length = 0; },
    get length() { return pending.length; },
  };
}

export function buildRefundParameters(input: {
  transactionId: string;
  currency: string;
  value: number;
  items?: AnalyticsItem[];
}): Record<string, unknown> {
  if (!input.transactionId.trim()) throw new Error('Refund requires transaction ID');
  if (!/^[A-Z]{3}$/.test(input.currency)) throw new Error('Invalid currency');
  if (!Number.isFinite(input.value) || input.value < 0) throw new Error('Invalid refund value');
  return {
    transaction_id: input.transactionId,
    currency: input.currency,
    value: input.value,
    ...(input.items?.length ? { items: input.items } : {}),
  };
}

