import { NextResponse, type NextRequest } from 'next/server';

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

interface BackInStockBody {
  productId: unknown;
  sku: unknown;
  email: unknown;
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

  // TODO: wire up the real back-in-stock subscriber. The likely
  // integration is Shopify's "Notify me when available" via the
  // Customer Privacy / Subscription APIs, or Klaviyo's back-in-stock
  // list (server-side identify + add-to-list). For now we just
  // accept the submission so the UI can be built and shipped.
  console.info('[back-in-stock] subscribe', { productId, sku, email });

  return NextResponse.json({ ok: true });
}
