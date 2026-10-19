import { NextRequest, NextResponse } from 'next/server';
import { fetchProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import { newQuoteReference, normaliseEmail, quoteDb, quoteDbConfigured, type QuoteItem, type SavedQuote } from '@/lib/quotes/server';
import { Resend } from 'resend';
import { quotePdf } from '@/lib/quotes/pdf';

export const runtime = 'nodejs';

function invalid(message: string) { return NextResponse.json({ error: message }, { status: 400 }); }

export async function POST(request: NextRequest) {
  if (!quoteDbConfigured() || !process.env.RESEND_API_KEY || !process.env.QUOTES_EMAIL_FROM) {
    return NextResponse.json({ error: 'Official quotations are not yet available.' }, { status: 503 });
  }
  const length = Number(request.headers.get('content-length') || 0);
  if (length > 16000) return invalid('Request too large.');
  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return invalid('Invalid request.'); }
  const email = normaliseEmail(String(input.email ?? ''));
  const organisation = String(input.organisation ?? '').trim();
  const contactName = String(input.contact_name ?? '').trim();
  const postcode = String(input.postcode ?? '').trim();
  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email) || email.length > 160 ||
      !organisation || organisation.length > 120 || !contactName || contactName.length > 100 ||
      !/^\d{4}$/.test(postcode)) return invalid('Please enter valid organisation and contact information.');
  if (!Array.isArray(input.items) || input.items.length < 1 || input.items.length > 20) return invalid('Select between one and twenty items.');

  const rawItems = input.items as unknown[];
  const parsed: { handle: string; variant_id: string; quantity: number }[] = [];
  for (const item of rawItems) {
    if (!item || typeof item !== 'object') return invalid('Invalid product.');
    const row = item as Record<string, unknown>;
    const handle = String(row.handle ?? '');
    const variant_id = String(row.variant_id ?? '');
    const quantity = Number(row.quantity);
    if (!/^[a-z0-9-]{2,160}$/.test(handle) || !/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(variant_id) ||
      !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return invalid('Invalid product selection.');
    parsed.push({ handle, variant_id, quantity });
  }
  if (new Set(parsed.map(i => i.variant_id)).size !== parsed.length) return invalid('Combine duplicate variants.');
  try {
    // Per-address issuance limit. Production deployment additionally requires WAF/IP limits.
    const recent = await quoteDb<{ id: string }[]>('quotes', 'GET',
      'select=id&customer_email=eq.' + encodeURIComponent(email) +
      '&created_at=gte.' + encodeURIComponent(new Date(Date.now() - 60 * 60 * 1000).toISOString()) + '&limit=4');
    if (recent.length >= 3) return NextResponse.json({ error: 'Too many quotation requests. Please try later.' }, { status: 429 });
    const items: QuoteItem[] = [];
    for (const row of parsed) {
      const product = await fetchProductByHandle(row.handle);
      const variant = product?.variants.find(v => v.id === row.variant_id);
      if (!product || !variant || !variant.availableForSale || variant.price.currencyCode !== 'AUD') return invalid('A selected product is unavailable.');
      const cents = Math.round(Number(variant.price.amount) * 100);
      if (!Number.isSafeInteger(cents) || cents < 0) return invalid('Unable to quote this product.');
      items.push({ handle: product.handle, variant_id: variant.id, name: product.title, variant: variant.title, quantity: row.quantity, unit_price_cents: cents });
    }
    const total = items.reduce((sum, i) => sum + i.unit_price_cents * i.quantity, 0);
    const reference = newQuoteReference();
    const records = await quoteDb<SavedQuote[]>('quotes', 'POST', 'select=*', [{
      reference, customer_email: email, organisation, contact_name: contactName, postcode,
      items, product_total_cents: total, freight_status: 'to_be_confirmed', status: 'issued',
    }], 'return=representation');
    const saved = records[0];
    if (!saved) throw new Error('No quotation created.');
    // Never email a public lookup token: only the verified portal may read the full record.
    const result = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: process.env.QUOTES_EMAIL_FROM,
      to: [email],
      subject: 'Enviro Aqua quotation ' + reference,
      attachments: [{ filename: reference + '.pdf', content: quotePdf(saved).toString('base64') }],
      text: [
        'Your quotation reference: ' + reference,
        'Organisation: ' + organisation,
        'Product subtotal: AUD ' + (total / 100).toFixed(2),
        'Freight is not yet included and must be confirmed.',
        'Your quote expires in 14 days.',
        'To view, download and purchase your quotation, verify your email at https://www.enviroaqua.com.au/quotes.',
      ].join('\n'),
    });
    if (result.error) {
      return NextResponse.json({ reference, delivery: 'failed', message: 'Quotation saved, but email delivery failed. Contact Enviro Aqua with your reference.' }, { status: 202 });
    }
    return NextResponse.json({ reference, delivery: 'sent' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to issue quotation at this time.' }, { status: 503 });
  }
}
