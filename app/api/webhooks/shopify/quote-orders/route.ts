import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { normaliseEmail, quoteDb, type SavedQuote } from '@/lib/quotes/server';

export const runtime = 'nodejs';

type ShopifyOrder = {
  id?: number;
  email?: string;
  financial_status?: string;
  note_attributes?: Array<{ name?: string; value?: string }>;
  line_items?: Array<{ variant_id?: number; quantity?: number }>;
};

export async function POST(request: NextRequest) {
  const secret = process.env.SHOPIFY_ORDER_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'Webhook is not configured.' }, { status: 503 });
  const raw = Buffer.from(await request.arrayBuffer());
  if (raw.length > 1024 * 1024) return NextResponse.json({ error: 'Payload too large.' }, { status: 413 });
  const supplied = request.headers.get('x-shopify-hmac-sha256') || '';
  const expected = createHmac('sha256', secret).update(raw).digest('base64');
  const given = Buffer.from(supplied, 'utf8');
  const computed = Buffer.from(expected, 'utf8');
  if (given.length !== computed.length || !timingSafeEqual(given, computed)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  let order: ShopifyOrder;
  try { order = JSON.parse(raw.toString('utf8')) as ShopifyOrder; }
  catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }); }
  const reference = order.note_attributes?.find(v => v.name === 'enviro_aqua_quote')?.value;
  if (!reference || !/^EA-Q-[A-F0-9]{16}$/.test(reference) || !order.id || !order.email) {
    return NextResponse.json({ ok: true });
  }
  try {
    const [quote] = await quoteDb<SavedQuote[]>('quotes', 'GET', 'select=*&reference=eq.' + reference + '&limit=1');
    if (!quote || quote.customer_email !== normaliseEmail(order.email)) return NextResponse.json({ ok: true });
    // Do not mistake manually attached or spoofed quote references for conversions.
    const ordered = new Map((order.line_items || []).map(row => [String(row.variant_id), Number(row.quantity)]));
    const matches = quote.items.every(item => {
      const match = item.variant_id.match(/ProductVariant\/(\d+)$/);
      return Boolean(match && ordered.get(match[1]) === item.quantity);
    });
    if (!matches) return NextResponse.json({ ok: true });
    const eligible = order.financial_status === 'paid';
    if (!eligible) return NextResponse.json({ ok: true });
    await quoteDb('quotes', 'PATCH',
      'reference=eq.' + reference + '&shopify_order_id=is.null',
      { status: 'purchased', invoice_status: 'paid', invoice_paid_at: new Date().toISOString(), shopify_order_id: String(order.id), confirmed_at: new Date().toISOString() });
    return NextResponse.json({ ok: true });
  } catch {
    // Shopify retries on non-2xx status.
    return NextResponse.json({ error: 'Quote conversion update failed.' }, { status: 503 });
  }
}
