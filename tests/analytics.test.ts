import assert from 'node:assert/strict';
import test from 'node:test';
import { flushPendingAnalytics, getAnalyticsConsent, setAnalyticsConsent, trackAddToCart, trackBeginCheckout, trackPageView, trackRemoveFromCart, trackSearch, trackSelectItem, trackSelectPromotion, trackViewCart, trackViewItem, trackViewItemList, trackViewPromotion } from '../lib/analytics/client';
import {
  buildRefundParameters,
  cardToAnalyticsItem,
  cartLineToAnalyticsItem,
  createEventQueue,
  moneyValue,
} from '../lib/analytics/model';

const money = { amount: '999.95', currencyCode: 'AUD' };
const variantId = 'gid://shopify/ProductVariant/123';

test('currency values stay in dollars rather than cents', () => {
  assert.equal(moneyValue(money), 999.95);
  assert.equal(moneyValue({ amount: 'bad', currencyCode: 'AUD' }), 0);
});
test('list and cart use the same Shopify variant ID', () => {
  const card = {
    id: 'gid://shopify/Product/9',
    handle: 'bubbler',
    title: 'Bubbler',
    productType: 'Water Bubblers',
    tags: [],
    featuredImage: null,
    housingSize: null,
    price: money,
    variants: [{
      id: variantId, title: 'Stainless Steel', sku: 'BUB-001',
      price: money, availableForSale: true, image: null, selectedOptions: [],
    }],
  };
  const line = {
    id: 'line-1', quantity: 2, totalAmount: money,
    merchandise: {
      id: variantId, title: 'Stainless Steel', sku: 'BUB-001',
      selectedOptions: [], image: null, price: money,
      product: { handle: 'bubbler', title: 'Bubbler', tags: [] },
    },
  };
  const listItem = cardToAnalyticsItem(card);
  const cartItem = cartLineToAnalyticsItem(line);
  assert.equal(listItem.item_id, variantId);
  assert.equal(cartItem.item_id, variantId);
  assert.equal(cartItem.item_sku, 'BUB-001');
  assert.equal(cartLineToAnalyticsItem(line, 1).quantity, 1);
  assert.equal(cartItem.price! * cartItem.quantity!, 1999.90);
});
test('queue bounds memory and expires stale events', () => {
  const queue = createEventQueue(2, 100);
  queue.enqueue('first', {}, 1);
  queue.enqueue('second', {}, 2);
  queue.enqueue('third', {}, 3);
  assert.equal(queue.length, 2);
  assert.deepEqual(queue.drain(50).map((event) => event.name),
    ['second', 'third']);
  queue.enqueue('expired', {}, 1);
  assert.deepEqual(queue.drain(200), []);
  assert.equal(queue.length, 0);
});
test('refund payload requires a stable transaction identifier', () => {
  const refund = buildRefundParameters({
    transactionId: 'SHOPIFY-123', currency: 'AUD', value: 25.5,
  });
  assert.equal(refund.transaction_id, 'SHOPIFY-123');
  assert.equal(refund.value, 25.5);
  assert.throws(() => buildRefundParameters({
    transactionId: '', currency: 'AUD', value: 1,
  }));
});


const card = {
  id: 'gid://shopify/Product/9', handle: 'bubbler', title: 'Bubbler',
  productType: 'Bubblers', tags: [], featuredImage: null,
  housingSize: null, price: money,
  variants: [{ id: variantId, title: 'Steel', sku: 'BUB-001',
    price: money, availableForSale: true, image: null, selectedOptions: [] }],
};
const line = {
  id: 'line-1', quantity: 2, totalAmount: money,
  merchandise: {
    id: variantId, title: 'Steel', sku: 'BUB-001',
    price: money, selectedOptions: [], image: null,
    product: { handle: 'bubbler', title: 'Bubbler', tags: [] },
  },
};
const cart = {
  id: 'gid://shopify/Cart/123', totalQuantity: 2,
  subtotalAmount: { amount: '1999.90', currencyCode: 'AUD' },
  totalAmount: { amount: '1999.90', currencyCode: 'AUD' },
  checkoutUrl: 'https://checkout.enviroaqua.com.au/checkouts/test',
  attributes: [],
  lines: [line],
};
const storage = new Map<string, string>([['enviroaqua:analytics-consent','granted']]);
const calls: unknown[][] = [];
const browser = {
  __eaAnalyticsConfigured: true,
  localStorage: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value); },
  },
  gtag: (...args: unknown[]) => { calls.push(args); },
  dispatchEvent: (_event: Event) => true,
};
Object.assign(globalThis, { window: browser });
function events(name: string): Array<unknown[]> {
  const matches = calls.filter((args) => args[0] === 'event' && args[1] === name);
  calls.length = 0;
  return matches;
}
test('cart and collection item IDs reconcile', () => {
  assert.equal(cardToAnalyticsItem(card).item_id, cartLineToAnalyticsItem(line).item_id);
});
test('chosen variant controls recorded price', () => {
  const another = { ...card, variants: [
    ...card.variants, { ...card.variants[0], id:'gid://shopify/ProductVariant/456',
      price:{amount:'10.25',currencyCode:'AUD'} }] };
  assert.equal(cardToAnalyticsItem(another,'gid://shopify/ProductVariant/456').price,10.25);
});
test('page view on first load', () => {
  trackPageView('https://www.enviroaqua.com.au/');
  assert.equal(events('page_view').length,1);
});
test('variant-only route updates do not duplicate page views', () => {
  trackPageView('https://www.enviroaqua.com.au/filter?variant=1');
  trackPageView('https://www.enviroaqua.com.au/filter?variant=2');
  assert.equal(events('page_view').length,1);
});
test('search-query changes create distinct page views', () => {
  trackPageView('https://www.enviroaqua.com.au/search?q=blue');
  trackPageView('https://www.enviroaqua.com.au/search?q=white');
  assert.equal(events('page_view').length,2);
});
test('product views carry AUD and true variant price', () => {
  trackViewItem(cardToAnalyticsItem(card),'AUD');
  assert.equal((events('view_item')[0][2] as { value:number }).value,999.95);
});
test('product list impression identifies Shopify variant', () => {
  trackViewItemList([card],'/bubblers','Bubblers');
  const e=events('view_item_list')[0][2] as {items:Array<{item_id:string}>};
  assert.equal(e.items[0].item_id,variantId);
});
test('product selection is recorded', () => {
  trackSelectItem(cardToAnalyticsItem(card));
  assert.equal(events('select_item').length,1);
});
test('successful cart additions use quantity deltas', () => {
  trackAddToCart(cart,variantId,2);
  assert.equal((events('add_to_cart')[0][2] as {value:number}).value,1999.9);
});
test('removed cart units are counted correctly', () => {
  trackRemoveFromCart(line,1);
  assert.equal((events('remove_from_cart')[0][2] as {value:number}).value,999.95);
});
test('cart view includes Shopify subtotal', () => {
  trackViewCart(cart);
  assert.equal((events('view_cart')[0][2] as {value:number}).value,1999.9);
});
test('rapid duplicate checkout initiations are suppressed', () => {
  trackBeginCheckout(cart);
  trackBeginCheckout(cart);
  assert.equal(events('begin_checkout').length,1);
});
test('search event only uses meaningful text', () => {
  trackSearch('x'); assert.equal(events('search').length,0);
  trackSearch('water'); assert.equal(events('search').length,1);
});
test('promotions distinguish views and selections', () => {
  trackViewPromotion('/bubblers','Bubblers');
  assert.equal(events('view_promotion').length,1);
  trackSelectPromotion('/bubblers','Bubblers');
  assert.equal(events('select_promotion').length,1);
});
test('consent denial prevents GA4 ecommerce dispatch', () => {
  setAnalyticsConsent(false);
  trackSearch('suppressed');
  assert.equal(events('search').length,0);
  assert.equal(getAnalyticsConsent(),'denied');
  setAnalyticsConsent(true);
  calls.length=0;
});
test('events queue when Google tag bootstrap is unavailable', () => {
  const original=browser.gtag;
  Object.assign(browser,{gtag:undefined});
  trackSearch('queued-pending-test');
  Object.assign(browser,{gtag:original});
  flushPendingAnalytics();
  assert.equal(events('search').length,1);
});
test('analytics transport errors never throw into commerce', () => {
  const original=browser.gtag;
  Object.assign(browser,{gtag:()=>{throw Error('blocked');}});
  assert.doesNotThrow(()=>trackSearch('transport-error'));
  Object.assign(browser,{gtag:original});
});

test('events are buffered until GA4 configuration is ready', () => {
  browser.__eaAnalyticsConfigured = false;
  trackSearch('config-pending-test');
  assert.equal(events('search').length, 0);
  browser.__eaAnalyticsConfigured = true;
  flushPendingAnalytics();
  assert.equal(events('search').length, 1);
});
