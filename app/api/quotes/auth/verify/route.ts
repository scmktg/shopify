import { NextRequest, NextResponse } from 'next/server';
import { newAccessToken, quoteDb, tokenDigest } from '@/lib/quotes/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') ?? '';
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return new NextResponse('Invalid verification link.', { status: 400 });
  // Explicit confirmation avoids prefetchers and email security scanners consuming login links.
  return new NextResponse(
    '<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Verify email | Enviro Aqua</title><body style="font:16px system-ui;margin:10vh auto;max-width:400px;padding:24px">' +
    '<h1>Access your quotations</h1><p>Confirm to sign in securely with your verified email address.</p>' +
    '<form method="POST"><input type="hidden" name="token" value="' + token + '">' +
    '<button style="padding:14px 22px;background:#111;color:#fff;border:0;border-radius:10px;cursor:pointer">Verify and continue</button></form></body></html>',
    { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'" } },
  );
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const token = String(form.get('token') ?? '');
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return new NextResponse('Invalid verification link.', { status: 400 });
  const now = new Date().toISOString();
  try {
    const used = await quoteDb<{ email: string }[]>('quote_access_challenges', 'PATCH',
      'token_digest=eq.' + tokenDigest(token) + '&redeemed_at=is.null&expires_at=gt.' + encodeURIComponent(now) + '&select=email',
      { redeemed_at: now }, 'return=representation');
    if (used.length !== 1) return new NextResponse('This link has expired or has already been used.', { status: 403 });
    const session = newAccessToken();
    await quoteDb('quote_sessions', 'POST', 'select=token_digest', [{
      token_digest: tokenDigest(session), email: used[0].email,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }]);
    const response = NextResponse.redirect(new URL('/quotes?history=1', request.url), 303);
    response.cookies.set('ea_quote_session', session, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
      path: '/api/quotes', maxAge: 24 * 60 * 60,
    });
    return response;
  } catch {
    return new NextResponse('Quote verification is temporarily unavailable.', { status: 503 });
  }
}
