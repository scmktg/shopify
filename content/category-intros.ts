/**
 * Editorial copy for the catalogue landing pages.
 *
 * Top-level keys are the category slug (e.g. 'water-filters').
 * Subcategory keys use the composite '<category>/<subcategory>' form
 * so the page can do a single getCategoryIntro lookup regardless of
 * level.
 *
 * Written per docs/06-content-rules.md (direct, knowledgeable,
 * Australian English, no exclamation marks, no AI giveaways) and the
 * SEO patterns in docs/04-seo-strategy.md. Each intro front-loads the
 * primary keyword, mentions WaterMark or WELS where relevant, and
 * lists the sub-categories so the page naturally cross-links to
 * deeper URLs.
 */
export const CATEGORY_INTROS: Readonly<Record<string, string>> = {
  'water-filters':
    'Water filters for every Australian home and trade — under-sink, whole-house, reverse osmosis, UV, bench-top, and commercial systems at wholesale prices. WaterMark certified options are clearly labelled, with licence numbers shown on every certified product. Choose under-sink for filtered drinking water, whole-house if you want every tap covered, reverse osmosis for the strictest contaminant reduction (including fluoride), or UV sterilisation for tank water and bore water. Replacement parts are stocked for every system we sell.',
  cartridges:
    'Replacement filter cartridges in every size and stage — sediment, carbon (CTO and GAC), reverse osmosis membranes, plus pre-built cartridge sets that match common 3-stage and 6-stage systems, and a specialty range covering alkaline, fluoride removal, post-carbon T33, ultrafiltration, and pleated washable elements. Sizes follow the Australian standard 10" × 2.5" and 20" × 4.5" housings, with micron ratings printed on every product. If you tell us which system you have, we will tell you which cartridges fit. Same wholesale price whether you replace one or twelve.',
  'bubblers-and-coolers':
    'Drinking bubblers, water coolers, and chillers for commercial sites, schools, sporting clubs, cafes, and homes. Stainless-steel bubblers are built for high-traffic public use with serviceable filtration. Coolers and chillers cover hot, cold, and room-temperature direct-connect dispensers as well as under-counter chillers paired with a feature tap. Replacement parts — bubbler heads, push-button valves, filter cartridges, taps — are stocked for every model we sell, so you are not left chasing parts when something wears out.',
  'pumps-and-tanks':
    'Water pumps for caravans, RVs, RO systems, bore, and rainwater. Pressure tanks and replacement bladders for the common Australian brands. Dosing tanks in 50L, 100L, and 200L sizes with bunded options for chemical handling. Components and fittings to round out a build. Voltage, flow rate, and connection size are listed on every product so you can match to your install without guessing.',
  plumbing:
    'Plumbing fixtures that pair with our water filtration systems — kitchen taps with three-way and dedicated filtered outlets, bathroom taps, dedicated RO filter taps, toilets, and complete bundles. WELS ratings and WaterMark certification are shown wherever they apply. Off-mains and rainwater installations are flagged separately from mains-pressure products so you order the correct fitting first time.',

  'cartridges/specialty-cartridges':
    'Specialty filter cartridges that handle the contaminants standard sediment and carbon stages cannot — alkaline mineralisation, fluoride removal, post-carbon T33 polishing, ultrafiltration membranes, and pleated washable elements that can be cleaned and reused. Each cartridge here is sized for the Australian standard 10" × 2.5" or 20" × 4.5" housings unless noted, with micron ratings, flow rates, and rated lifespan listed on every product. Use this section when you are building a custom multi-stage system or replacing a single problem stage in an existing setup. Most products ship the same business day from our Central Coast NSW warehouse.',
  'pumps-and-tanks/pumps':
    'Water pumps for every Australian application — 12V pumps for caravans and RVs, RO booster pumps to lift filtered output pressure, pressure pumps for bore and rainwater systems, plus solar and submersible options. Voltage, flow rate (L/min), maximum head, and connection size are listed on every product so you can match the pump to the install without guessing. Use the filter pills above to narrow by pump type. WaterMark certification and electrical compliance are flagged where they apply. Most pumps ship the same business day from Central Coast NSW.',
  'plumbing/bathroom-taps':
    'Bathroom taps that pair cleanly with our water filtration systems — basin mixers, shower mixers, wall-mount sets, and three-way taps for filtered drinking outlets. WaterMark certification and WELS star ratings are shown on every product (mandatory for mains-pressure installs in Australia). Finishes available include chrome, matte black, and brushed nickel. Connection sizes match the Australian standard 1/2" and 3/8" inlets unless noted. If you want a tap with a dedicated filtered-water outlet, the RO Filter Taps subcategory has the spring-loaded and tri-flow designs that work with reverse-osmosis systems.',
  'plumbing/ro-filter-taps':
    'Dedicated filtered-water taps designed to pair with reverse-osmosis and under-sink filtration systems. Spring-loaded designs handle the lower-pressure output from RO membranes; tri-flow models combine cold, hot, and filtered outlets in a single fixture. All taps shown here have a 1/4" inlet to match standard RO output tubing, with optional reducers for 3/8" connections. WaterMark certification is shown where it applies — most filtered-only outlets are not required to be certified, but those mounted into mains-pressure manifolds will be. Finishes available include chrome, matte black, and brushed nickel.',
};

export function getCategoryIntro(slug: string): string | null {
  return CATEGORY_INTROS[slug] ?? null;
}
