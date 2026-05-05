/**
 * Editorial copy for the top-level category landing pages.
 *
 * Written per docs/06-content-rules.md (direct, knowledgeable,
 * Australian English, no exclamation marks, no AI giveaways) and the
 * SEO patterns in docs/04-seo-strategy.md.
 *
 * Each intro front-loads the primary keyword, mentions WaterMark or
 * WELS where relevant, and lists the sub-categories so the page
 * naturally cross-links to deeper URLs.
 */
export const CATEGORY_INTROS: Readonly<Record<string, string>> = {
  'water-filters':
    'Water filters for every Australian home and trade — under-sink, whole-house, reverse osmosis, UV, bench-top, inline, and commercial systems at wholesale prices. WaterMark certified options are clearly labelled, with licence numbers shown on every certified product. Choose under-sink for filtered drinking water, whole-house if you want every tap covered, reverse osmosis for the strictest contaminant reduction (including fluoride), or UV sterilisation for tank water and bore water. Replacement parts are stocked for every system we sell.',
  cartridges:
    'Replacement filter cartridges in every size and stage — sediment, carbon (CTO and GAC), reverse osmosis membranes, alkaline, fluoride removal, post-carbon T33, and pleated washable types, plus pre-built cartridge sets that match common 3-stage and 6-stage systems. Sizes follow the Australian standard 10" × 2.5" and 20" × 4.5" housings, with micron ratings printed on every product. If you tell us which system you have, we will tell you which cartridges fit. Same wholesale price whether you replace one or twelve.',
  bubblers:
    'Drinking bubblers for commercial sites, schools, sporting clubs, and residential applications. Commercial bubblers are built for high-traffic use with stainless-steel basins and serviceable filtration; residential models are compact units for kitchens and rumpus rooms. Replacement parts — bubbler heads, push-button valves, filter cartridges — are stocked for every model we sell, so you are not left chasing parts when something wears out.',
  'pumps-and-tanks':
    '12V pumps for caravans and RVs, RO booster pumps to lift filtered output pressure, pressure pumps and tanks for bore and rainwater systems, dosing tanks (50L, 100L, 200L — bunded options for chemical handling), and replacement bladders for the most common pressure-tank brands sold in Australia. Voltage, flow rate, and connection size are listed on every product so you can match to your install without guessing.',
  plumbing:
    'Plumbing fixtures that pair with our water filtration systems — kitchen taps with three-way and dedicated filtered outlets, bathroom taps, showers, toilets, and complete bathroom bundles. WELS ratings and WaterMark certification are shown wherever they apply. Off-mains and rainwater installations are flagged separately from mains-pressure products so you order the correct fitting first time.',
};

export function getCategoryIntro(slug: string): string | null {
  return CATEGORY_INTROS[slug] ?? null;
}
