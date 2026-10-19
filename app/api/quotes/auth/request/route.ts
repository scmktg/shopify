import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { newAccessToken, normaliseEmail, quoteDb, quoteDbConfigured, tokenDigest } from '@/lib/quotes/server';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!quoteDbConfigured() || !process.env.RESEND_API_KEY || !process.env.QUOTES_EMAIL_FROM) return NextResponse.json({ error: 'Quote portal is not configured.' }, { status: 503 });
  let body: { email?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  const email = normaliseEmail(String(body.email ?? ''));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) return NextResponse.json({ error: 'Enter a valid email.' }, { status: 400 });

  const response = NextResponse.json({ message: 'If your email is valid, a verification link will arrive shortly.' });
  try {
    // Account-independent response to avoid leaking quote existence. Per-email cap is not
    // a replacement for edge/IP rate limiting; configure WAF rate limiting before launch.
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const prior = await quoteDb<{ token_digest: string }[]>('quote_access_challenges', 'GET',
      'select=token_digest&email=eq.' + encodeURIComponent(email) + '&created_at=gte.' + encodeURIComponent(since) + '&limit=6');
    if (prior.length >= 5) return response;
    const token = newAccessToken();
    await quoteDb('quote_access_challenges', 'POST', 'select=token_digest', [{
      token_digest: tokenDigest(token), email,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    }]);
    const origin = process.env.QUOTES_PUBLIC_ORIGIN || 'https://www.enviroaqua.com.au';
    const link = new URL('/api/quotes/auth/verify', origin);
    link.searchParams.set('token', token);
    await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: process.env.QUOTES_EMAIL_FROM,
      to: [email],
      subject: 'Sign in to your Enviro Aqua quotations',
      text: 'Use this one-time verification link within 15 minutes to view your Enviro Aqua quotations:\n' + link.toString() +
        '\n\nIf you did not request this, you can safely ignore this email.',
    });
  } catch {
    // Do not leak whether an account or quote exists.
  }
  return response;
}
