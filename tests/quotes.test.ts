import assert from 'node:assert/strict';
import { test } from 'node:test';
import { quotePdf } from '../lib/quotes/pdf';
import type { SavedQuote } from '../lib/quotes/server';

const example: SavedQuote = {
  id: 'example-id',
  reference: 'EA-Q-0123456789ABCDEF',
  customer_email: 'test@example.com',
  organisation: 'Example Primary School',
  contact_name: 'School Business Manager',
  postcode: '3000',
  items: [{
    handle: 'test-water-bubbler',
    variant_id: 'gid://shopify/ProductVariant/1234',
    name: 'Stainless Steel Drinking Fountain',
    variant: 'Square + Side Tap',
    quantity: 2,
    unit_price_cents: 149500,
  }],
  product_total_cents: 299000,
  freight_status: 'to_be_confirmed',
  status: 'issued',
  created_at: '2026-10-19T00:00:00.000Z',
  expires_at: '2026-11-02T00:00:00.000Z',
  shopify_cart_id: null,
  shopify_order_id: null,
};

test('generates a valid PDF header, quotation reference and business identity', () => {
  const pdf = quotePdf(example).toString('latin1');
  assert.ok(pdf.startsWith('%PDF-1.4'));
  assert.match(pdf, /EA-Q-0123456789ABCDEF/);
  assert.match(pdf, /ABN 24 638 197 734/);
  assert.match(pdf, /Example Primary School/);
  assert.match(pdf, /2990\.00/);
  assert.match(pdf, /%%EOF/);
});

test('escapes PDF strings and creates multiple pages for long quotations', () => {
  const withLongName = {
    ...example,
    organisation: 'Example (Primary) \\ School',
    items: Array.from({ length: 45 }, (_, index) => ({
      ...example.items[0],
      name: 'Drinking Fountain ' + index + ' Very Long Product Name With Several Descriptive Words',
    })),
  };
  const pdf = quotePdf(withLongName).toString('latin1');
  assert.match(pdf, /Example \\(Primary\\) \\\\ School/);
  assert.match(pdf, /\/Count [2-9]/);
  assert.match(pdf, /%%EOF/);
});
