'use client';

import type { Cart } from '@/types/cart';
import type { ProductCardData } from '@/types/product';
import {
  cardToAnalyticsItem,
  cartLineToAnalyticsItem,
  createEventQueue,
  moneyValue,
  type AnalyticsItem,
} from './model';

export type { AnalyticsItem } from './model';
export { cartLineToAnalyticsItem, cardToAnalyticsItem } from './model';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __eaAnalyticsConfigured?: boolean;
  }
}

const CONSENT_KEY = 'enviroaqua:analytics-consent';
const pending = createEventQueue();
const recent = new Map<string, number>();
const debugEnabled =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true';

function logDiagnostic(reason: string, event: string) {
  if (debugEnabled) console.info('[analytics]', reason, event);
}

export function getAnalyticsConsent(): 'granted' | 'denied' | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(CONSENT_KEY);
    return stored === 'granted' || stored === 'denied' ? stored : null;
  } catch { return null; }
}

function canTrack(): boolean {
  return getAnalyticsConsent() === 'granted';
}

export function setAnalyticsConsent(granted: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');
  } catch { /* Privacy mode may block localStorage. */ }
  try {
    window.gtag?.('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: granted ? 'granted' : 'denied',
      ad_user_data: granted ? 'granted' : 'denied',
      ad_personalization: granted ? 'granted' : 'denied',
    });
    if (!granted) pending.clear();
    else flushPendingAnalytics();
    window.dispatchEvent(new Event('enviroaqua:analytics-consent-changed'));
  } catch { /* Consent controls must not interfere with commerce. */ }
}

function validate(name: string, params: Record<string, unknown>): boolean {
  const items = params.items;
  if (Array.isArray(items) && items.some((item) =>
    !item || typeof item !== 'object' ||
    typeof (item as AnalyticsItem).item_id !== 'string' ||
    !(item as AnalyticsItem).item_id
  )) {
    logDiagnostic('invalid product ID', name);
    return false;
  }
  if (typeof params.value === 'number' &&
      (!Number.isFinite(params.value) || params.value < 0)) {
    logDiagnostic('invalid event value', name);
    return false;
  }
  if (typeof params.value === 'number' &&
      typeof params.currency !== 'string') {
    logDiagnostic('missing currency', name);
    return false;
  }
  return true;
}

function emit(
  name: string,
  params: Record<string, unknown> = {},
  dedupKey?: string,
  dedupWindowMs = 1500,
): void {
  try {
    if (typeof window === 'undefined') return;
    if (!canTrack()) {
      logDiagnostic('suppressed by consent', name);
      return;
    }
    if (!validate(name, params)) return;
    const now = Date.now();
    if (dedupKey) {
      for (const [key, expires] of recent) {
        if (expires <= now) recent.delete(key);
      }
      if (recent.has(dedupKey)) {
        logDiagnostic('duplicate suppressed', name);
        return;
      }
      recent.set(dedupKey, now + dedupWindowMs);
      if (recent.size > 100) recent.clear();
    }
    if (typeof window.gtag !== 'function' || !window.__eaAnalyticsConfigured) {
      pending.enqueue(name, params, now);
      logDiagnostic('queued pending tag initialization', name);
      return;
    }
    window.gtag('event', name, params);
    logDiagnostic('dispatched', name);
  } catch {
    // The entire analytics path must fail open for normal shopping.
  }
}

export function flushPendingAnalytics(): void {
  if (typeof window === 'undefined') return;
  if (!canTrack()) { pending.clear(); return; }
  if (typeof window.gtag !== 'function' || !window.__eaAnalyticsConfigured) return;
  for (const event of pending.drain()) {
    try { window.gtag('event', event.name, event.params); }
    catch { logDiagnostic('dispatch failed', event.name); }
  }
}

export function trackPageView(url: string, title?: string): void {
  // Variant and marketing parameters alone must not create a new page view.
  let key = url;
  try {
    const parsed = new URL(url);
    for (const param of [...parsed.searchParams.keys()]) {
      if (/^(utm_|gclid$|gbraid$|wbraid$|variant$)/i.test(param)) {
        parsed.searchParams.delete(param);
      }
    }
    key = parsed.pathname + parsed.search;
  } catch { /* Fallback to original URL. */ }
  emit('page_view', { page_location: url, page_title: title }, 'page:' + key, 1200);
}

export function trackViewItem(item: AnalyticsItem, currency: string): void {
  emit('view_item', {
    currency,
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [item],
  }, 'item:' + item.item_id, 1500);
}

export function trackViewItemList(
  products: ReadonlyArray<ProductCardData>,
  listId: string,
  listName: string,
): void {
  const items = products.map((product, index) => ({
    ...cardToAnalyticsItem(product),
    index: index + 1,
  }));
  if (!items.length) return;
  emit('view_item_list', {
    item_list_id: listId,
    item_list_name: listName,
    items,
  }, 'list:' + listId + ':' + items.map((i) => i.item_id).join(','), 2000);
}

export function trackSelectItem(
  item: AnalyticsItem,
  listId?: string,
  listName?: string,
): void {
  emit('select_item', {
    ...(listId ? { item_list_id: listId } : {}),
    ...(listName ? { item_list_name: listName } : {}),
    items: [item],
  });
}

export function trackSearch(searchTerm: string): void {
  const trimmed = searchTerm.trim();
  if (trimmed.length >= 2) {
    emit('search', { search_term: trimmed }, 'search:' + trimmed, 2000);
  }
}

export function trackViewPromotion(id: string, name: string): void {
  emit('view_promotion', { promotion_id: id, promotion_name: name },
    'promotion:' + id, 60000);
}

export function trackSelectPromotion(id: string, name: string): void {
  emit('select_promotion', { promotion_id: id, promotion_name: name });
}

export function trackAddToCart(cart: Cart, variantId: string, quantity: number): void {
  const line = cart.lines.find((entry) => entry.merchandise.id === variantId);
  if (!line) return;
  const item = cartLineToAnalyticsItem(line, quantity);
  emit('add_to_cart', {
    currency: line.merchandise.price.currencyCode,
    value: (item.price ?? 0) * quantity,
    items: [item],
  });
}

export function trackRemoveFromCart(
  line: Cart['lines'][number],
  quantity: number,
): void {
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
  }, 'cart:' + cart.id, 1200);
}

export function trackBeginCheckout(cart: Cart): void {
  emit('begin_checkout', {
    currency: cart.subtotalAmount.currencyCode,
    value: moneyValue(cart.subtotalAmount),
    items: cart.lines.map((line) => cartLineToAnalyticsItem(line)),
  }, 'checkout:' + cart.id, 2500);
}

