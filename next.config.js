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
    return rules;
  },
};

module.exports = nextConfig;
