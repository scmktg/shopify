/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
  },
  async redirects() {
    // Permanent (308) redirects for the 2026-05 subcategory
    // consolidation. See docs/02-site-structure.md for the full
    // mapping. Each rule is duplicated with and without a trailing
    // slash so old crawl paths and external links resolve regardless
    // of how they are formatted.
    const SUBCAT_REDIRECTS = [
      ['/cartridges/post-carbon-t33', '/cartridges/specialty-cartridges'],
      ['/cartridges/alkaline', '/cartridges/specialty-cartridges'],
      ['/cartridges/fluoride-removal', '/cartridges/specialty-cartridges'],
      ['/cartridges/pleated-washable', '/cartridges/specialty-cartridges'],
      ['/pumps-and-tanks/12v-pumps', '/pumps-and-tanks/pumps'],
      ['/pumps-and-tanks/ro-booster-pumps', '/pumps-and-tanks/pumps'],
      ['/pumps-and-tanks/pressure-pumps', '/pumps-and-tanks/pumps'],
      [
        '/pumps-and-tanks/replacement-bladders',
        '/pumps-and-tanks/pressure-tanks',
      ],
      ['/plumbing/showers', '/plumbing/bathroom-taps'],
    ];

    // 2026-05 bubblers restructure: `/bubblers/` becomes
    // `/bubblers-and-coolers/`, the old commercial/residential split
    // is replaced by bubblers / coolers-and-chillers / parts.
    //
    // One product (the under-counter chiller) previously lived in
    // /bubblers/commercial/ but now belongs in coolers-and-chillers;
    // it gets an explicit override so the wildcard below does not
    // bounce it through the wrong subcategory.
    const BUBBLER_PRODUCT_OVERRIDES = [
      [
        '/bubblers/commercial/stainless-steel-under-counter-drinking-water-chiller-plus-stainless-steel-tap',
        '/bubblers-and-coolers/coolers-and-chillers/stainless-steel-under-counter-drinking-water-chiller-plus-stainless-steel-tap',
      ],
    ];

    const BUBBLER_PATH_REDIRECTS = [
      ['/bubblers/commercial', '/bubblers-and-coolers/bubblers'],
      ['/bubblers/residential', '/bubblers-and-coolers/coolers-and-chillers'],
      ['/bubblers/parts', '/bubblers-and-coolers/parts'],
      ['/bubblers', '/bubblers-and-coolers'],
    ];

    // 2026-05 blog migration. The legacy WordPress blog at
    // enviroaqua.com.au had 18 posts; every old URL is mapped to its
    // permanent destination in the Learn IA. Bucket 1 (merge) folds
    // into existing Learn pages; Bucket 2 (promote) lands on new
    // Phase 3 Learn pages; Bucket 3 (local) lands on /locations/*
    // suburb pages. The blog index and any /blog/* path go to the
    // Water problems hub.
    const BLOG_MIGRATION_REDIRECTS = [
      // Bucket 1 — MERGE (final targets exist)
      [
        '/best-whole-house-water-filter-australia-2026',
        '/use/whole-home-filtration',
      ],
      [
        '/benefits-of-installing-an-under-sink-water-filter',
        '/use/home-drinking-water',
      ],
      [
        '/whole-house-water-filters-central-coast',
        '/locations/central-coast-nsw',
      ],

      // Bucket 2 — PROMOTE (final pages live in the Learn IA)
      [
        '/whole-house-water-filter-chloramine-pfas-australia',
        '/water-problems/chloramine-and-pfas',
      ],
      ['/whole-house-water-filter-cost-australia', '/help/whole-house-cost'],
      [
        '/best-watermark-certified-water-bubblers-australian-schools-2026',
        '/use/commercial-and-cafe/schools',
      ],
      [
        '/watermark-certified-water-bubblers-australian-schools',
        '/use/commercial-and-cafe/schools',
      ],
      [
        '/commercial-drinking-fountain-gym-office-australia-2026',
        '/use/commercial-and-cafe/gyms-and-fitness',
      ],
      [
        '/commercial-water-bubblers-gyms-fitness-centres-australia',
        '/use/commercial-and-cafe/gyms-and-fitness',
      ],
      [
        '/commercial-water-bubblers-vs-water-coolers-australia',
        '/help/bubblers-vs-coolers',
      ],
      [
        '/chemical-dosing-tank-bore-water-treatment-australia',
        '/use/bore-water-treatment',
      ],
      [
        '/chemical-dosing-tanks-australia-buyers-guide',
        '/use/bore-water-treatment',
      ],
      [
        '/bunded-chemical-tank-australia-regulations-compliance',
        '/help/bunded-tank-regulations',
      ],

      // Bucket 3 — LOCAL (final /locations/* pages live alongside the
      // existing /locations/central-coast-nsw hub — the brief's
      // planned /serving/ section was consolidated into the existing
      // /locations/ route to avoid two parallel local sections).
      ['/water-filters-central-coast-nsw', '/locations/central-coast-nsw'],
      ['/whole-house-water-filters-gosford-nsw', '/locations/gosford-nsw'],
      [
        '/whole-house-water-filters-tuggerah-wyong-nsw',
        '/locations/tuggerah-wyong-nsw',
      ],
      [
        '/whole-house-water-filters-terrigal-kincumber-nsw',
        '/locations/terrigal-kincumber-nsw',
      ],
      [
        '/whole-house-water-filters-umina-beach-woy-woy',
        '/locations/umina-woy-woy-nsw',
      ],

      // Blog index — kill it. The wildcard catches paginated pages,
      // category/tag/author archives, and the RSS feed.
      ['/blog', '/water-problems'],
    ];

    const rules = [];
    for (const [oldPath, newPath] of SUBCAT_REDIRECTS) {
      rules.push({
        source: oldPath,
        destination: `${newPath}/`,
        permanent: true,
      });
      rules.push({
        source: `${oldPath}/`,
        destination: `${newPath}/`,
        permanent: true,
      });
    }

    // Per-product overrides have to win over the path-level
    // wildcards, so register them first.
    for (const [oldPath, newPath] of BUBBLER_PRODUCT_OVERRIDES) {
      rules.push({
        source: oldPath,
        destination: `${newPath}/`,
        permanent: true,
      });
      rules.push({
        source: `${oldPath}/`,
        destination: `${newPath}/`,
        permanent: true,
      });
    }

    for (const [oldPath, newPath] of BUBBLER_PATH_REDIRECTS) {
      rules.push({
        source: oldPath,
        destination: `${newPath}/`,
        permanent: true,
      });
      rules.push({
        source: `${oldPath}/`,
        destination: `${newPath}/`,
        permanent: true,
      });
      rules.push({
        source: `${oldPath}/:handle`,
        destination: `${newPath}/:handle/`,
        permanent: true,
      });
      rules.push({
        source: `${oldPath}/:handle/`,
        destination: `${newPath}/:handle/`,
        permanent: true,
      });
    }

    for (const [oldPath, newPath] of BLOG_MIGRATION_REDIRECTS) {
      // Site canonical URLs have no trailing slash — emit slashless
      // destinations so legacy WP traffic resolves in one hop instead
      // of chaining 308 → /foo/ → 308 → /foo.
      rules.push({
        source: oldPath,
        destination: newPath,
        permanent: true,
      });
      rules.push({
        source: `${oldPath}/`,
        destination: newPath,
        permanent: true,
      });
    }

    // Catch every other path under /blog/ — paginated indexes,
    // category/tag/author archives, the RSS feed — and send them to
    // the Water problems hub. The exact /blog landing page is handled
    // by the entry above.
    rules.push({
      source: '/blog/:path*',
      destination: '/water-problems',
      permanent: true,
    });

    return rules;
  },
};

module.exports = nextConfig;
