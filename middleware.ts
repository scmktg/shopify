import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Phase 2 (2026-05) WordPress migration: legacy URL patterns that should
// not redirect and should not 404. Author archives, RSS feeds, WP admin
// surface, colour/brand/tag taxonomies and dated archives all return
// 410 Gone so search engines drop them from the index instead of
// retrying. Redirects live in next.config.js; 410s belong here because
// the redirects() API only supports 3xx responses.
//
// SEO audit 2026-05 (Fix 8): /product/* and /bathroom/* are also here.
// Explicit slug mappings in next.config.js fire first (the redirects
// engine matches before middleware), so this only catches /product/
// and /bathroom/ URLs we never mapped — including the numeric
// /product/4647-style URLs flagged as soft-404s in the audit. 410 is
// the correct migration signal for a genuinely-removed product.

const GONE_PREFIXES = [
  '/author',
  '/feed',
  '/comments/feed',
  '/wp-content',
  '/wp-includes',
  '/wp-admin',
  '/wp-json',
  '/colour/',
  '/brand/',
  '/category/',
  '/tag/',
  '/2024/',
  '/2025/',
  '/2026/',
  // Unmapped legacy WordPress product/bathroom URLs fall through to
  // 410 instead of soft-404ing on a category PLP. Explicit slug
  // mappings in next.config.js fire before middleware, so this only
  // catches genuinely-removed products. The previous narrower entries
  // for `/bathroom/elements` and `/bathroom/featured_item_category`
  // are subsumed by the broader `/bathroom` rule.
  '/product',
  '/bathroom',
];

const GONE_EXACT = new Set(['/wp-login.php', '/xmlrpc.php']);

function isGone(pathname: string): boolean {
  if (GONE_EXACT.has(pathname)) return true;
  for (const prefix of GONE_PREFIXES) {
    const bare = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
    if (pathname === bare || pathname.startsWith(`${bare}/`)) return true;
  }
  return false;
}

// Apex -> www canonical host redirect. Vercel's dashboard-level redirect
// fires as 307 (temporary), which leaks link equity during the SEO
// migration — Google won't transfer ranking from enviroaqua.com.au to
// www.enviroaqua.com.au unless the redirect is permanent. Emitting 301
// here in middleware overrides the dashboard behaviour.
const CANONICAL_HOST = 'www.enviroaqua.com.au';
const APEX_HOST = 'enviroaqua.com.au';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.toLowerCase() ?? '';
  if (host === APEX_HOST) {
    const target = new URL(request.nextUrl);
    target.host = CANONICAL_HOST;
    target.protocol = 'https:';
    target.port = '';
    return NextResponse.redirect(target, 301);
  }

  if (isGone(request.nextUrl.pathname)) {
    return new NextResponse(null, { status: 410 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
