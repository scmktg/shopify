import { NextRequest, NextResponse } from 'next/server';
import { quoteSessionEmail } from '@/lib/quotes/session';
import { quoteDb, type SavedQuote } from '@/lib/quotes/server';
import { fetchProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import { shopifyClient } from '@/lib/shopify/client';

export const runtime = 'nodejs';

const CREATE_CART = /* GraphQL */ `
 mutation QuoteCartCreate($input: CartInput!) {
   cartCreate(input: $input) {
     cart { id checkoutUrl }
     userErrors { field message }
   }
 }
`;
type CartResponse = { cartCreate: { cart: { id: string; checkoutUrl: string } | null; userErrors: { message: string }[] } };

export async function POST(_request: NextRequest, { params }: { params: Promise<{ reference: string }> }) {
  try {
    const email = await quoteSessionEmail();
    if (!email) return NextResponse.json({ error: 'Please verify your email before checkout.' }, { status: 401 });
    const { reference } = await params;
    if (!/^EA-Q-[A-F0-9]{16}$/.test(reference)) return NextResponse.json({ error: 'Invalid quote.' }, { status: 400 });
    const [quote] = await quoteDb<SavedQuote[]>('quotes', 'GET',
      'select=*&reference=eq.' + reference + '&customer_email=eq.' + encodeURIComponent(email) + '&limit=1');
    if (!quote) return NextResponse.json({ error: 'Quote not found.' }, { status: 404 });
    if (quote.status === 'cancelled' || quote.status === 'purchased' || Date.parse(quote.expires_at) <= Date.now())
      return NextResponse.json({ error: 'This quotation cannot be purchased. Request a new quotation.' }, { status: 409 });

    // Checkout is a new Shopify cart. Refresh pricing and stock, and require
    // an explicit new quotation if a quoted price has changed. This implementation
    // does not claim locked-in quote pricing.
    for (const item of quote.items) {
      const product = await fetchProductByHandle(item.handle);
      const variant = product?.variants.find(v => v.id === item.variant_id);
      if (!variant?.availableForSale || variant.price.currencyCode !== 'AUD' ||
          Math.round(Number(variant.price.amount) * 100) !== item.unit_price_cents)
        return NextResponse.json({ error: 'Product prices or availability changed. Please generate a new quotation.' }, { status: 409 });
    }

    const result = await shopifyClient.request<CartResponse>(CREATE_CART, {
      variables: {
        input: {
          lines: quote.items.map(i => ({ merchandiseId: i.variant_id, quantity: i.quantity })),
          attributes: [{ key: 'enviro_aqua_quote', value: reference }],
          buyerIdentity: { email: quote.customer_email, countryCode: 'AU' },
        },
      },
    });
    const cart = result.data?.cartCreate?.cart;
    if (result.errors || !cart || result.data?.cartCreate?.userErrors?.length)
      return NextResponse.json({ error: 'Shopify checkout is temporarily unavailable.' }, { status: 503 });
    await quoteDb('quotes', 'PATCH', 'reference=eq.' + reference + '&customer_email=eq.' + encodeURIComponent(email),
      { status: 'checkout_started', checkout_started_at: new Date().toISOString(), shopify_cart_id: cart.id });
    return NextResponse.json({ checkoutUrl: cart.checkoutUrl }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Unable to open checkout.' }, { status: 503 });
  }
}
