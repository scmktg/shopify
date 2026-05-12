import { CATEGORIES } from '@/content/categories';
import { listMarkdownSlugs } from '@/lib/content/markdown';
import { BUSINESS_INFO } from '@/content/business-info';
import { getSiteUrl } from '@/lib/seo/siteUrl';

export const revalidate = 3600;

/**
 * Serves /llms.txt — the proposed standard from llmstxt.org for
 * AI-assistant discovery. A concise, link-rich markdown index of the
 * site so LLMs can map the catalogue and editorial surfaces in one
 * fetch. The full content companion lives at /llms-full.txt.
 *
 * Source-of-truth files are imported directly so the index never
 * drifts from the live catalogue or content tree.
 */
export async function GET(): Promise<Response> {
  const base = getSiteUrl();
  const u = (path: string) => `${base}${path}`;

  const [helpSlugs, useSlugs, waterProblemSlugs, locationSlugs] =
    await Promise.all([
      listMarkdownSlugs('help'),
      listMarkdownSlugs('use'),
      listMarkdownSlugs('water-problems'),
      listMarkdownSlugs('locations'),
    ]);

  const lines: string[] = [];

  lines.push(`# ${BUSINESS_INFO.name} — Australia's water filtration specialist`);
  lines.push('');
  lines.push(
    "> Wholesale prices on water filters, cartridges, and filtration systems. One price for everyone — homeowners, tradies, and commercial. No accounts, no quote requests, no trade gates.",
  );
  lines.push('');
  lines.push(
    `${BUSINESS_INFO.name} is an Australian-owned water-filtration retailer based at ${BUSINESS_INFO.address.locality}, ${BUSINESS_INFO.address.region} ${BUSINESS_INFO.address.postalCode}. WaterMark-certified products are clearly labelled with their licence numbers on every product page. Orders before ${BUSINESS_INFO.orderCutoff} on a business day ship the same day. ${BUSINESS_INFO.returnsSummary}. Phone ${BUSINESS_INFO.phone.display}, email ${BUSINESS_INFO.email}.`,
  );
  lines.push('');

  lines.push('## Top categories');
  lines.push('');
  for (const category of CATEGORIES) {
    lines.push(`- [${category.label}](${u(`/${category.slug}/`)})`);
  }
  lines.push('');

  lines.push('## Subcategories (specific product types)');
  lines.push('');
  for (const category of CATEGORIES) {
    for (const sub of category.subcategories) {
      lines.push(
        `- [${category.label} — ${sub.label}](${u(`/${category.slug}/${sub.slug}/`)})`,
      );
    }
  }
  lines.push('');

  lines.push('## Buying guides and help');
  lines.push('');
  lines.push(`- [Help index](${u('/help/')})`);
  lines.push(`- [Which water filter should I choose?](${u('/help/which-filter/')})`);
  for (const slug of helpSlugs) {
    if (slug === 'which-filter') continue;
    lines.push(`- [${prettifySlug(slug)}](${u(`/help/${slug}/`)})`);
  }
  lines.push('');

  lines.push('## Use cases');
  lines.push('');
  lines.push(`- [Use-case index](${u('/use/')})`);
  for (const slug of useSlugs) {
    lines.push(`- [${prettifySlug(slug)}](${u(`/use/${slug}/`)})`);
  }
  lines.push('');

  lines.push('## Water problems');
  lines.push('');
  lines.push(`- [Water-problems index](${u('/water-problems/')})`);
  for (const slug of waterProblemSlugs) {
    lines.push(`- [${prettifySlug(slug)}](${u(`/water-problems/${slug}/`)})`);
  }
  lines.push('');

  lines.push('## Trust signals and compliance');
  lines.push('');
  lines.push(
    `- [WaterMark certified products](${u('/watermark-certified/')}) — every certified product shows its Australian licence number`,
  );
  lines.push(`- [Whole-house installation package (Central Coast NSW)](${u('/whole-house-installation-package/')})`);
  lines.push(`- [Customer reviews](${u('/reviews/')})`);
  lines.push(`- [Our pricing model](${u('/about/our-pricing/')}) — one wholesale price for everyone`);
  lines.push('');

  lines.push('## Local service area');
  lines.push('');
  lines.push(`- [Showroom](${u('/showroom/')}) — Wyong NSW, ${BUSINESS_INFO.showroom.hours}`);
  lines.push(`- [Locations index](${u('/locations/')})`);
  for (const slug of locationSlugs) {
    lines.push(`- [${prettifySlug(slug)}](${u(`/locations/${slug}/`)})`);
  }
  lines.push('');

  lines.push('## Policies and customer service');
  lines.push('');
  lines.push(`- [Shipping](${u('/shipping/')}) — tracked Australia-wide from $9.95; free on whole-house systems, UV, and freestanding coolers`);
  lines.push(`- [Returns](${u('/returns/')}) — 14-day window for damaged-or-faulty items; manufacturer warranty separate`);
  lines.push(`- [About](${u('/about/')})`);
  lines.push(`- [Contact](${u('/contact/')})`);
  lines.push(`- [Privacy](${u('/privacy/')})`);
  lines.push(`- [Terms](${u('/terms/')})`);
  lines.push('');

  lines.push('## Machine-readable indexes');
  lines.push('');
  lines.push(`- [Full content (llms-full.txt)](${u('/llms-full.txt')})`);
  lines.push(`- [Sitemap (XML)](${u('/sitemap.xml')})`);
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

function prettifySlug(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
