import assert from 'node:assert/strict';
import test from 'node:test';
import {
  acquisitionCartAttributes,
  captureAcquisition,
  clearAcquisition,
  deriveAcquisition,
} from '../lib/attribution/client';

test('ad click marker classifies Google paid without retaining click ID in metadata', () => {
  const touch = deriveAcquisition(
    'https://www.enviroaqua.com.au/bubblers?gclid=private-click-id&utm_campaign=schools',
    '', '2026-10-14T00:00:00.000Z');
  assert.equal(touch.source, 'google');
  assert.equal(touch.medium, 'cpc');
  assert.equal(touch.campaign, 'schools');
  assert.equal(JSON.stringify(touch).includes('private-click-id'), false);
});
test('first-party and internal referrers are never counted as external referrals', () => {
  const t = deriveAcquisition('https://www.enviroaqua.com.au/cart',
    'https://www.enviroaqua.com.au/bubblers', '2026-10-14T00:00:00Z');
  assert.equal(t.source, 'direct');
  assert.equal(t.referrerHost, '');
});
test('ChatGPT gets its actual referral hostname', () => {
  const t = deriveAcquisition('https://www.enviroaqua.com.au/water-filters?session=secret',
    'https://chatgpt.com/share/id?private=true', '2026-10-14T00:00:00Z');
  assert.equal(t.source, 'chatgpt.com');
  assert.equal(t.medium, 'referral');
  assert.equal(t.landingPath, '/water-filters');
  assert.equal(JSON.stringify(t).includes('secret'), false);
});
test('UTMs override inferred source while unsafe labels are sanitized', () => {
  const t = deriveAcquisition('https://www.enviroaqua.com.au/?utm_source=newsletter&utm_medium=email&utm_campaign=schools%0D%0Ainjection',
    'https://google.com/', '2026-10-14T00:00:00Z');
  assert.equal(t.source, 'newsletter');
  assert.equal(t.medium, 'email');
  assert.equal(t.campaign, 'schools  injection');
});
test('storage and cart attributes require affirmative consent', () => {
  const store = new Map<string,string>();
  const win = { location: { href: 'https://www.enviroaqua.com.au/?utm_source=google&utm_medium=cpc' },
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => { store.set(key,value); },
      removeItem: (key: string) => { store.delete(key); },
    } };
  Object.assign(globalThis, { window: win, document: { referrer: '' } });
  captureAcquisition();
  assert.deepEqual(acquisitionCartAttributes(), []);
  store.set('enviroaqua:analytics-consent','granted');
  captureAcquisition();
  const attrs = acquisitionCartAttributes();
  assert.equal(attrs.find(a => a.key === '_ea_first_source')?.value, 'google');
  assert.equal(attrs.find(a => a.key === '_ea_latest_medium')?.value, 'cpc');
  assert.equal(attrs.some(a => /gclid/.test(a.key) || /private-click/.test(a.value)), false);
  store.set('enviroaqua:analytics-consent','denied');
  captureAcquisition();
  assert.deepEqual(acquisitionCartAttributes(), []);
  assert.equal(store.has('enviroaqua:acquisition:v1'),false);
  clearAcquisition();
});
