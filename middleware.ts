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
  '/shop/page',
  '/brand/',
  '/category/',
  '/tag/',
  '/project-cat/',
  '/portfolio',
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

const GONE_EXACT = new Set([
  '/wp-login.php',
  '/xmlrpc.php',
  // 2026-09 Merchant cleanup: retired current-site product URLs that
  // remained cached in Google's automatic Merchant source after the
  // Shopify catalogue was consolidated. Explicit 410s tell Google these
  // offers are intentionally gone rather than temporarily missing.
  '/water-filters/parts/shower-filter-15-stages-includes-extra-cartridge',
  '/water-filters/whole-house/whole-house-water-filter-2-stage-10-x-4-5-sediment-carbon',
  '/water-filters/whole-house/whole-house-water-filter-2-stage-10-x-4-5-washable-reusable',
]);

// Known legacy product URLs that still have valid replacements. Keep these
// ahead of the broad /product 410 handling and the dynamic product route.
// The dosing-tank handle aliases also protect backlinks and indexed URLs
// created before the bunds were split into separate products.
const LEGACY_PRODUCT_REDIRECTS = new Map<string, string>([
  [
    '/product/chemical-dosing-tank-with-bunding-available-in-50l-100l-and-200l',
    '/pumps-and-tanks/dosing-tanks',
  ],
  [
    '/pumps-and-tanks/dosing-tanks/chemical-dosing-tank-bunded-50l',
    '/pumps-and-tanks/dosing-tanks/chemical-dosing-tank-50l',
  ],
  [
    '/pumps-and-tanks/dosing-tanks/chemical-dosing-tank-bunded-100l',
    '/pumps-and-tanks/dosing-tanks/chemical-dosing-tank-100l',
  ],
  [
    '/pumps-and-tanks/dosing-tanks/chemical-dosing-tank-bunded-200l',
    '/pumps-and-tanks/dosing-tanks/chemical-dosing-tank-200l',
  ],
]);

// WooCommerce query parameters from the retired WordPress storefront.
// Next.js preserves incoming query strings across redirects, so a legacy
// URL such as /product-category/water-filters/?filter_filter=carbon can
// otherwise become /water-filters?filter_filter=carbon on the new site.
// Strip only these known legacy keys; current parameters such as ?after=
// for catalogue pagination and marketing UTMs are intentionally preserved.
const LEGACY_WOOCOMMERCE_QUERY_KEYS = new Set([
  'orderby',
  'shop_view',
  'per_page',
  'per_row',
  'add-to-cart',
  'min_price',
  'max_price',
  'rating_filter',
  'remove_item',
  'undo_item',
  '_wpnonce',
]);

function isLegacyWooCommerceQueryKey(key: string): boolean {
  return (
    LEGACY_WOOCOMMERCE_QUERY_KEYS.has(key) ||
    key.startsWith('filter_') ||
    key.startsWith('query_type_')
  );
}

function stripLegacyWooCommerceQuery(request: NextRequest): NextResponse | null {
  const cleanUrl = request.nextUrl.clone();
  let removed = false;

  for (const key of Array.from(cleanUrl.searchParams.keys())) {
    if (!isLegacyWooCommerceQueryKey(key)) continue;
    cleanUrl.searchParams.delete(key);
    removed = true;
  }

  if (!removed) return null;
  return NextResponse.redirect(cleanUrl, 308);
}

function redirectLegacyProduct(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const normalizedPath =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  const destination = LEGACY_PRODUCT_REDIRECTS.get(normalizedPath);
  if (!destination) return null;

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = destination;

  // Do not carry retired WooCommerce filter/cart parameters onto the
  // replacement URL. Keep normal marketing parameters such as UTMs.
  for (const key of Array.from(redirectUrl.searchParams.keys())) {
    if (isLegacyWooCommerceQueryKey(key)) {
      redirectUrl.searchParams.delete(key);
    }
  }

  // These are permanent URL migrations. Use an explicit 301 so historical
  // backlinks and indexed URLs consolidate onto the clean canonical path.
  return NextResponse.redirect(redirectUrl, 301);
}

function isGone(pathname: string): boolean {
  if (GONE_EXACT.has(pathname)) return true;
  if (/\/feed\/?$/.test(pathname)) return true;
  for (const prefix of GONE_PREFIXES) {
    const bare = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
    if (pathname === bare || pathname.startsWith(`${bare}/`)) return true;
  }
  return false;
}

// Cookie name kept in sync with lib/admin/auth.ts. Middleware only
// checks for the cookie's presence — full HMAC verification happens
// in the page/server-action layer (middleware can't import Node crypto
// in every runtime).
const ADMIN_SESSION_COOKIE = 'ea_admin_session';

function isAdminRoute(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const legacyProductRedirect = redirectLegacyProduct(request);
  if (legacyProductRedirect) return legacyProductRedirect;

  if (isGone(pathname)) {
    return new NextResponse(null, { status: 410 });
  }

  const legacyQueryRedirect = stripLegacyWooCommerceQuery(request);
  if (legacyQueryRedirect) return legacyQueryRedirect;

  // Gate admin pages: unauthenticated traffic gets bounced to /admin/login.
  // The login page itself, and any auth-related sub-routes, stay reachable.
  if (isAdminRoute(pathname) && pathname !== '/admin/login') {
    const hasSession = Boolean(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
    if (!hasSession) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      loginUrl.search = '';
      return NextResponse.redirect(loginUrl);
    }
  }

  // Expose pathname to the root layout so it can suppress storefront
  // chrome (header/footer/cart) on admin routes. Must be set on the
  // forwarded request headers — server components read it via
  // `headers()`, which mirrors request headers, not response headers.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
