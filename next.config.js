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

    return rules;
  },
};

module.exports = nextConfig;
