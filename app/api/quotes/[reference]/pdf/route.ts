import { NextRequest, NextResponse } from 'next/server';
import { quoteSessionEmail } from '@/lib/quotes/session';
import { quoteDb, type SavedQuote } from '@/lib/quotes/server';
import { quotePdf } from '@/lib/quotes/pdf';
export const runtime = 'nodejs';
export async function GET(_request: NextRequest, { params }: { params: Promise<{ reference: string }> }) {
  try {
    const email = await quoteSessionEmail();
    if (!email) return NextResponse.json({ error: 'Please verify your email.' }, { status: 401 });
    const { reference } = await params;
    if (!/^EA-Q-(?:[A-F0-9]{16}|\\d{4,})$/.test(reference)) return NextResponse.json({ error: 'Invalid quote.' }, { status: 400 });
    const matches = await quoteDb<SavedQuote[]>('quotes', 'GET',
      'select=*&reference=eq.' + reference + '&customer_email=eq.' + encodeURIComponent(email) + '&limit=1');
    if (!matches[0]) return NextResponse.json({ error: 'Quote not found.' }, { status: 404 });
    const pdf = quotePdf(matches[0]);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="' + reference + '.pdf"',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Unable to download quotation.' }, { status: 503 });
  }
}
