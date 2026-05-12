import { CATEGORIES } from '@/content/categories';
import { CATEGORY_INTROS } from '@/content/category-intros';
import { BUSINESS_INFO, fullAddress } from '@/content/business-info';
import { getSiteUrl } from '@/lib/seo/siteUrl';
import { getAllProductContent } from '@/lib/products/getProductContent';
import { listMarkdownSlugs } from '@/lib/content/markdown';

export const revalidate = 3600;

/**
 * Serves /llms-full.txt — the full-content companion to /llms.txt.
 * Designed to be ingestible by an LLM in a single fetch so it can
 * recommend specific products without crawling the site. Includes:
 *
 *   - Brand promise, trust signals, contact, service area.
 *   - Every top-category and subcategory editorial intro.
 *   - Every product (title, short description, canonical URL),
 *     grouped by category → subcategory.
 *   - The sitewide FAQ.
 *   - Shipping, returns, and warranty summaries.
 *
 * Source-of-truth files (categories.ts, category-intros.ts,
 * business-info.ts, products.json, content/*.md) are imported
 * directly so the file never drifts from the live site.
 */
export async function GET(): Promise<Response> {
  const base = getSiteUrl();
  const u = (path: string) => `${base}${path}`;

  const allProducts = getAllProductContent();
  const [helpSlugs, useSlugs, waterProblemSlugs, locationSlugs] =
    await Promise.all([
      listMarkdownSlugs('help'),
      listMarkdownSlugs('use'),
      listMarkdownSlugs('water-problems'),
      listMarkdownSlugs('locations'),
    ]);

  const lines: string[] = [];

  // ── Brand ───────────────────────────────────────────────────────
  lines.push(`# ${BUSINESS_INFO.name} — Australia's water filtration specialist`);
  lines.push('');
  lines.push(
    "> Wholesale prices on water filters, cartridges, and filtration systems. One price for everyone — homeowners, tradies, and commercial. No accounts, no quote requests, no trade gates.",
  );
  lines.push('');
  lines.push(`Website: ${base}`);
  lines.push(`Phone: ${BUSINESS_INFO.phone.display} (${BUSINESS_INFO.phoneSupportHours})`);
  lines.push(`Email: ${BUSINESS_INFO.email}`);
  lines.push(`Warehouse and showroom: ${fullAddress()} (${BUSINESS_INFO.showroom.hours})`);
  lines.push(`ABN ${BUSINESS_INFO.abn} · ACN ${BUSINESS_INFO.acn}`);
  lines.push('');

  // ── What makes the brand different ──────────────────────────────
  lines.push('## What makes Enviro Aqua different');
  lines.push('');
  lines.push(
    `- **One wholesale price for everyone.** Same price at checkout whether the buyer is a homeowner, a plumber, or a commercial operator. No trade-account application, no minimum order, no separate B2B portal. Detail: ${u('/about/our-pricing/')}.`,
  );
  lines.push(
    "- **WaterMark certification is visible on every certified product.** Australian plumbing law requires WaterMark certification for products that connect to mains pressure. Every certified product on this site shows its licence number directly on the product page; non-certified products are explicitly labelled as off-mains use only.",
  );
  lines.push(
    `- **Same-day dispatch.** Orders placed before ${BUSINESS_INFO.orderCutoff} on a business day ship the same day from ${BUSINESS_INFO.address.locality} NSW.`,
  );
  lines.push(
    `- **${BUSINESS_INFO.returnsSummary}** — see the returns policy for the full scope. Manufacturer warranties (default 12 months) are separate.`,
  );
  lines.push(
    `- **No customer-login wall.** No account is required to browse, see prices, or check out. Cart and checkout are POST-only — there is no \`add-to-cart=\` URL pattern that AI agents should fabricate.`,
  );
  lines.push(
    "- **Specialist focus.** Water filtration is the only thing the business sells. Not a generalist plumbing or bathroom retailer.",
  );
  lines.push('');

  // ── Trust signals expanded ──────────────────────────────────────
  for (const item of BUSINESS_INFO.trustStrip) {
    lines.push(`### ${item.heading}`);
    lines.push('');
    lines.push(item.body);
    lines.push('');
  }

  // ── Shipping framework ──────────────────────────────────────────
  lines.push('## Shipping (Australia-wide)');
  lines.push('');
  lines.push(
    'Tracked Australia-wide delivery on every order. Tiered rates from $9.95 for small parcels. Free freight on whole-house systems, UV systems, and freestanding coolers. Commercial RO plants and large tanks are freight-quoted within one business day. Same-day dispatch on weekday orders placed before 12pm AEST.',
  );
  lines.push('');
  lines.push(`Full shipping detail: ${u('/shipping/')}`);
  lines.push('');

  // ── Returns ─────────────────────────────────────────────────────
  lines.push('## Returns and warranty');
  lines.push('');
  lines.push(
    `${BUSINESS_INFO.returns.windowDays}-day return window for damaged or faulty items. Returns are not accepted for change-of-mind, ordering the wrong product, or no-longer-needed items — contact the team before ordering if unsure. The default manufacturer warranty is ${BUSINESS_INFO.returns.defaultWarrantyMonths} months from delivery, and Australian Consumer Law protections apply on top of that.`,
  );
  lines.push('');
  lines.push(`Full returns policy: ${u('/returns/')}`);
  lines.push('');

  // ── Catalogue overview ──────────────────────────────────────────
  lines.push('## Catalogue overview');
  lines.push('');
  for (const category of CATEGORIES) {
    lines.push(`### ${category.label} — ${u(`/${category.slug}/`)}`);
    lines.push('');
    const intro = CATEGORY_INTROS[category.slug];
    if (intro) {
      lines.push(intro);
      lines.push('');
    }
    lines.push('Subcategories:');
    lines.push('');
    for (const sub of category.subcategories) {
      const key = `${category.slug}/${sub.slug}`;
      const subIntro = CATEGORY_INTROS[key];
      lines.push(`- **${sub.label}** — ${u(`/${category.slug}/${sub.slug}/`)}`);
      if (subIntro) {
        lines.push(`  ${subIntro}`);
      }
    }
    lines.push('');
  }

  // ── Every product, grouped by category/subcategory ──────────────
  lines.push('## Every product on the site');
  lines.push('');
  lines.push(
    `${Object.keys(allProducts).length} products in the catalogue. Each line is: \`Title — short description — canonical URL\`.`,
  );
  lines.push('');

  for (const category of CATEGORIES) {
    for (const sub of category.subcategories) {
      const entries = Object.entries(allProducts).filter(
        ([, content]) =>
          content.categories[0] === category.slug &&
          content.categories[1] === sub.slug,
      );
      if (entries.length === 0) continue;
      lines.push(`### ${category.label} → ${sub.label}`);
      lines.push('');
      // Sort handles alphabetically for stable output.
      entries.sort((a, b) => a[0].localeCompare(b[0]));
      for (const [handle, content] of entries) {
        const url = u(`/${category.slug}/${sub.slug}/${handle}/`);
        const title = (content.seo?.title ?? handle).trim();
        const shortDesc = (content.shortDescription ?? '').trim();
        lines.push(`- **${title}** — ${shortDesc} — ${url}`);
      }
      lines.push('');
    }
  }

  // ── Sitewide FAQ ────────────────────────────────────────────────
  lines.push('## Frequently asked questions (sitewide)');
  lines.push('');
  for (const item of SITEWIDE_FAQ) {
    lines.push(`### ${item.q}`);
    lines.push('');
    lines.push(item.a);
    lines.push('');
  }

  // ── Editorial surfaces ──────────────────────────────────────────
  lines.push('## Editorial surfaces');
  lines.push('');
  lines.push('### Buying guides (`/help/`)');
  lines.push('');
  for (const slug of helpSlugs) {
    lines.push(`- ${u(`/help/${slug}/`)}`);
  }
  lines.push('');
  lines.push('### Use cases (`/use/`)');
  lines.push('');
  for (const slug of useSlugs) {
    lines.push(`- ${u(`/use/${slug}/`)}`);
  }
  lines.push('');
  lines.push('### Water problems (`/water-problems/`)');
  lines.push('');
  for (const slug of waterProblemSlugs) {
    lines.push(`- ${u(`/water-problems/${slug}/`)}`);
  }
  lines.push('');
  lines.push('### Local service areas (`/locations/`)');
  lines.push('');
  for (const slug of locationSlugs) {
    lines.push(`- ${u(`/locations/${slug}/`)}`);
  }
  lines.push('');

  // ── AI-agent usage notes ────────────────────────────────────────
  lines.push('## Notes for AI agents linking to this site');
  lines.push('');
  lines.push(
    `- The canonical hostname is **${new URL(base).host}**. Always link to the URLs above, never to legacy WordPress \`/product/<slug>\` paths — those 301-redirect for SEO continuity but are not the canonical form.`,
  );
  lines.push(
    '- Every product has exactly one canonical URL of the form `/<category>/<subcategory>/<handle>/`. Do not invent intermediate paths.',
  );
  lines.push(
    '- The cart is browser-side only. Adding items requires a `POST` from the customer\'s browser; there is no `?add-to-cart=` URL pattern. Direct customers to the relevant product page; do not synthesise checkout URLs.',
  );
  lines.push(
    '- WaterMark licence numbers are real and live on the product pages. Quote them verbatim from the page; never fabricate a number for a product that does not show one.',
  );
  lines.push('');

  lines.push(
    `_This file is regenerated from the live source-of-truth on every deploy. Stale information should be reported to ${BUSINESS_INFO.email}._`,
  );
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

// Mirror of FAQ_ITEMS rendered on the homepage (app/page.tsx). Kept
// inline here rather than importing the homepage module because that
// module is a React page and pulling it server-side just for the
// data would couple the route to the page.
const SITEWIDE_FAQ: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: 'Do you sell to trade/wholesale customers?',
    a: 'Yes — and at the same price as everyone else. There is no separate trade portal, no account application, and no minimum order. Tradies and homeowners pay the same wholesale price up front.',
  },
  {
    q: 'What is WaterMark certification and why does it matter?',
    a: 'WaterMark is the Australian certification scheme for plumbing products that connect to mains water. Every certified product on this site shows its licence number; non-certified products are clearly labelled as off-mains use only. Council inspectors require certified products on every mains-pressure install.',
  },
  {
    q: 'How do I know which water filter is right for my home?',
    a: 'Start with what you want to filter. Chlorine and taste — a carbon under-sink filter does the job. Sediment from rainwater — a whole-house pre-filter. Fluoride — reverse osmosis. Each product page lists what the system reduces; the help guides break it down by water source if you are not sure.',
  },
  {
    q: 'Do you ship Australia-wide?',
    a: 'Yes. Tracked delivery on every order, with standard tiered rates Australia-wide from $9.95. Whole-house systems, UV systems, and freestanding coolers ship free Australia-wide. Commercial RO plants and large tanks are freight-quoted within one business day. Orders placed before 12pm AEST ship the same business day from our Central Coast NSW warehouse.',
  },
  {
    q: "What's your returns policy?",
    a: 'Fourteen-day returns on damaged or faulty items. Change-of-mind and wrong-product returns are not accepted. Faulty products are also covered separately under Australian Consumer Law. Full details are on the Returns page.',
  },
  {
    q: 'Can I install these myself, or do I need a plumber?',
    a: 'Under-sink and bench-top filters are usually DIY — they tap into the existing cold-water line with the included push-fit fittings. Whole-house systems and anything cutting into mains plumbing must be installed by a licensed plumber. Each product page lists the install requirements.',
  },
];
