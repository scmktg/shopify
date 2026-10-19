import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { quoteSessionEmail } from '@/lib/quotes/session';
import { quoteDb, type SavedQuote } from '@/lib/quotes/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: Promise<{ reference: string }> }) {
  try {
    const email = await quoteSessionEmail();
    if (!email) return NextResponse.json({ error: 'Please verify your email first.' }, { status: 401 });
    const { reference } = await params;
    if (!/^EA-Q-[A-F0-9]{16}$/.test(reference)) return NextResponse.json({ error: 'Invalid quotation.' }, { status: 400 });
    const body = await request.json() as { po_number?: unknown; notes?: unknown };
    const poNumber = String(body.po_number ?? '').trim();
    const notes = String(body.notes ?? '').trim();
    if (!/^[A-Za-z0-9_./# -]{1,80}$/.test(poNumber) || notes.length > 1000)
      return NextResponse.json({ error: 'Enter a valid purchase order reference.' }, { status: 400 });
    const [quote] = await quoteDb<SavedQuote[]>('quotes', 'GET',
      'select=*&reference=eq.' + reference + '&customer_email=eq.' + encodeURIComponent(email) + '&limit=1');
    if (!quote) return NextResponse.json({ error: 'Quotation not found.' }, { status: 404 });
    if (['cancelled', 'purchased'].includes(quote.status) || Date.parse(quote.expires_at) <= Date.now())
      return NextResponse.json({ error: 'A current quotation is required.' }, { status: 409 });
    // A PO is a request for manual review, not a promise of credit or an invoice.
    const saved = await quoteDb<{ id: string }[]>('quote_purchase_order_requests', 'POST', 'select=id', [{
      quote_id: quote.id, customer_email: email, purchase_order_number: poNumber, notes,
    }], 'return=representation');
    if (!saved[0]) throw new Error('Purchase order was not saved.');
    if (process.env.RESEND_API_KEY && process.env.QUOTES_EMAIL_FROM && process.env.QUOTES_ADMIN_EMAIL) {
      await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: process.env.QUOTES_EMAIL_FROM,
        to: [process.env.QUOTES_ADMIN_EMAIL],
        subject: 'Purchase order review requested: ' + reference,
        text: 'Quotation: ' + reference + '\nCustomer: ' + quote.organisation + '\nPO reference: ' + poNumber + '\nNotes: ' + notes + '\n\nReview the request and invoice manually in MYOB only if approved.',
      });
    }
    return NextResponse.json({ status: 'pending_review' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to submit purchase order request, or it has already been submitted.' }, { status: 503 });
  }
}
