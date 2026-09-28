'use client';

import type { Cart, CartLine } from '@/types/cart';
import type { Money } from '@/types/product';

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  price?: number;
  quantity?: number;
  item_category?: string;
  item_variant?: string;
  item_brand?: string;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function moneyValue(money: Money): number {
  const value = Number.parseFloat(money.amount);
  return Number.isFinite(value) ? value : 0;
}

function emit(eventName: string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', eventName, params);
}

export function cartLineToAnalyticsItem(
  line: CartLine,
  quantity = line.quantity,
): AnalyticsItem {
  return {
    item_id: line.merchandise.sku || line.merchandise.product.handle,
    item_name: line.merchandise.product.title,
    price: moneyValue(line.merchandise.price),
    quantity,
    item_variant: line.merchandise.id,
    item_brand: 'Enviro Aqua',
  };
}

export function trackPageView(url: string, title?: string): void {
  emit('page_view', {
    page_location: url,
    page_title: title,
  });
}

export function trackViewItem(item: AnalyticsItem, currency: string): void {
  emit('view_item', {
    currency,
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [item],
  });
}

export function trackSelectItem(item: AnalyticsItem): void {
  emit('select_item', { items: [item] });
}

export function trackAddToCart(
  cart: Cart,
  variantId: string,
  quantity: number,
): void {
  const line = cart.lines.find((candidate) => candidate.merchandise.id === variantId);
  if (!line) return;
  const item = cartLineToAnalyticsItem(line, quantity);
  emit('add_to_cart', {
    currency: line.merchandise.price.currencyCode,
    value: (item.price ?? 0) * quantity,
    items: [item],
  });
}

export function trackRemoveFromCart(line: CartLine, quantity: number): void {
  const item = cartLineToAnalyticsItem(line, quantity);
  emit('remove_from_cart', {
    currency: line.merchandise.price.currencyCode,
    value: (item.price ?? 0) * quantity,
    items: [item],
  });
}

export function trackViewCart(cart: Cart): void {
  emit('view_cart', {
    currency: cart.subtotalAmount.currencyCode,
    value: moneyValue(cart.subtotalAmount),
    items: cart.lines.map((line) => cartLineToAnalyticsItem(line)),
  });
}

export function trackBeginCheckout(cart: Cart): void {
  emit('begin_checkout', {
    currency: cart.subtotalAmount.currencyCode,
    value: moneyValue(cart.subtotalAmount),
    items: cart.lines.map((line) => cartLineToAnalyticsItem(line)),
  });
}
