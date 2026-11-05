import { NextResponse } from 'next/server';
import { quoteSessionEmail } from '@/lib/quotes/session';
import { quoteDb, type SavedQuote } from '@/lib/quotes/server';

export const runtime = 'nodejs';
export async function GET() {
  try {
    const email = await quoteSessionEmail();
    if (!email) return NextResponse.json({ error: 'Please verify your email to view quotations.' }, { status: 401 });
    const quotes = await quoteDb<SavedQuote[]>('quotes', 'GET',
      'select=*&customer_email=eq.' + encodeURIComponent(email) + '&order=created_at.desc&limit=100');
    return NextResponse.json({ quotes }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Unable to retrieve quotations.' }, { status: 503 });
  }
}
