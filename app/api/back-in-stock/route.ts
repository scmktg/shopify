import { NextResponse, type NextRequest } from 'next/server';
import { Resend } from 'resend';
import { BUSINESS_INFO } from '@/content/business-info';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// In-memory rate limit. Per-process and resets on cold start; good
// enough to block casual abuse from a single IP without standing up
// Redis for v1. Mirrors the pattern used by /api/lead-installation.
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const rateLimitState = new Map<string, number[]>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

function rateLimitOk(ip: string): boolean {
  const now = Date.now();
  const previous = rateLimitState.get(ip) ?? [];
  const recent = previous.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitState.set(ip, recent);
    return false;
  }
  recent.push(now);
  rateLimitState.set(ip, recent);
  return true;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface BackInStockBody {
  productId: unknown;
  sku: unknown;
  email: unknown;
}

interface Subscription {
  productId: string;
  sku: string | null;
  email: string;
}

function buildEmailHtml(
  sub: Subscription,
  meta: { ip: string; userAgent: string; submittedAt: string },
): string {
  const rows: Array<[string, string]> = [
    ['Customer email', sub.email],
    ['Product ID', sub.productId],
    ['SKU', sub.sku ?? '(none)'],
    ['Submitted at', meta.submittedAt],
    ['IP', meta.ip],
    ['User-Agent', meta.userAgent],
  ];
  const body = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e5e5;font-weight:600;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e5e5;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
    )
    .join('');
  return `<table style="font-family:system-ui,sans-serif;border-collapse:collapse;width:100%;max-width:640px">${body}</table>`;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimitOk(ip)) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests' },
      { status: 429 },
    );
  }

  let body: BackInStockBody;
  try {
    body = (await request.json()) as BackInStockBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON' },
      { status: 400 },
    );
  }

  const productId = typeof body.productId === 'string' ? body.productId : '';
  const sku = typeof body.sku === 'string' ? body.sku : null;
  const email =
    typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!productId) {
    return NextResponse.json(
      { ok: false, error: 'Missing productId' },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: 'Invalid email' },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    console.warn(
      '[back-in-stock] RESEND_API_KEY or RESEND_FROM_EMAIL missing — submission accepted in form, but no email sent.',
    );
    return NextResponse.json(
      {
        ok: false,
        error:
          'Email delivery is not configured yet. Please email info@enviroaqua.com.au directly while we sort this out.',
      },
      { status: 503 },
    );
  }

  const sub: Subscription = { productId, sku, email };
  const meta = {
    ip,
    userAgent: request.headers.get('user-agent') ?? 'unknown',
    submittedAt: new Date().toISOString(),
  };

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: BUSINESS_INFO.email,
      replyTo: sub.email,
      subject: `Back-in-stock request — ${sub.sku ?? sub.productId}`,
      html: buildEmailHtml(sub, meta),
    });
    if (error) {
      console.error('[back-in-stock] Resend error:', error);
      return NextResponse.json(
        { ok: false, error: 'Could not send your request. Please try again shortly.' },
        { status: 502 },
      );
    }
  } catch (caught) {
    console.error('[back-in-stock] unexpected send failure:', caught);
    return NextResponse.json(
      { ok: false, error: 'Could not send your request. Please try again shortly.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
