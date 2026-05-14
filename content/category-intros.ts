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

/**
 * Unique meta descriptions for every catalogue subcategory page.
 *
 * Keys use the composite '<category>/<subcategory>' form to match
 * getCategoryIntro. Each string is hand-written, front-loads the
 * primary keyword, stays under the ~155-character Google truncation
 * window, and avoids the boilerplate template the page previously
 * generated (which produced duplicate descriptions across the 24
 * subcategory pages and tanked CTR on the same-shaped snippets).
 *
 * Australian English, no exclamation marks, no AI giveaways, per
 * docs/06-content-rules.md.
 */
export const SUBCATEGORY_META_DESCRIPTIONS: Readonly<Record<string, string>> = {
  // Water Filters
  'water-filters/under-sink':
    'Under-sink water filters for Australian kitchens. Single-stage carbon through to multi-stage RO, WaterMark certified options, replacement cartridges in stock.',
  'water-filters/whole-house':
    'Whole-house water filters that treat every tap at the point of entry. Big Blue 20" × 4.5" housings, WaterMark certified, sized for Australian mains.',
  'water-filters/reverse-osmosis':
    'Reverse osmosis water filter systems — 4, 5, and 6-stage RO for fluoride, PFAS, heavy metals, and dissolved solids. TFC membranes, 12L pressure tanks, AU stock.',
  'water-filters/uv-sterilisation':
    'UV sterilisation systems for tank water, bore water, and rural supplies. 254 nm UV-C disinfection paired with sediment and carbon pre-filtration. Australian voltage.',
  'water-filters/bench-top':
    'Bench-top water filters for renters and homeowners without plumbing access. Diverter-fitted, no drilling, 1- to 3-stage carbon and sediment configurations.',
  'water-filters/commercial':
    'Commercial water filtration for cafes, offices, schools, and hospitality. High-flow housings, WaterMark certified manifolds, scale-control and chlorine reduction.',
  'water-filters/parts':
    'Replacement parts for water filter systems — housings, brackets, pressure gauges, spanners, O-rings, and fittings. Sized for the Australian 10" and 20" standards.',

  // Cartridges
  'cartridges/sediment':
    'Sediment filter cartridges in 1, 5, and 20 micron — PP spun and pleated. Fits standard Australian 10" × 2.5" and 20" × 4.5" Big Blue housings.',
  'cartridges/carbon':
    'Carbon filter cartridges for chlorine, taste, and odour reduction. Coconut carbon block (CTO) and GAC granular options in every standard Australian housing size.',
  'cartridges/reverse-osmosis-membranes':
    'Replacement reverse osmosis membranes — 50, 75, and 100 GPD TFC elements that fit standard 10" × 2.5" RO membrane housings used in Australian under-sink systems.',
  'cartridges/specialty-cartridges':
    'Specialty filter cartridges — alkaline mineral, fluoride removal, post-carbon T33, ultrafiltration, and pleated washable. Sized for Australian standard housings.',
  'cartridges/cartridge-sets':
    'Pre-built cartridge sets matched to 2, 3, 5, and 6-stage systems. One SKU covers the full service interval — sediment, carbon, and membrane where applicable.',

  // Bubblers & Coolers
  'bubblers-and-coolers/bubblers':
    'Stainless steel drinking bubblers for schools, offices, gyms, and public venues. WaterMark certified, push-button activation, integrated filtration and cooling.',
  'bubblers-and-coolers/coolers-and-chillers':
    'Water coolers and chillers — hot, cold, and ambient direct-connect dispensers plus under-counter chillers paired with a feature tap. Australian mains compatible.',
  'bubblers-and-coolers/parts':
    'Replacement parts for bubblers and water coolers — bubbler heads, push-button valves, filter cartridges, taps, and service kits for every model we stock.',

  // Pumps & Tanks
  'pumps-and-tanks/pumps':
    'Water pumps for caravans, RVs, bore, rainwater, and RO systems. 12V, RO booster, pressure, solar, and submersible options with full Australian voltage compliance.',
  'pumps-and-tanks/pressure-tanks':
    'Pressure tanks and replacement bladders for Australian pump systems — 12L through 100L vertical and horizontal models, drinking-water-safe bladders.',
  'pumps-and-tanks/dosing-tanks':
    'Chemical dosing tanks in 50L, 100L, and 200L. Bunded options for agricultural, industrial, and bore-water chemical handling. Australian compliance flagged.',
  'pumps-and-tanks/components':
    'Fittings, connectors, valves, and components for water pump, pressure tank, and RO installations. 1/4", 6mm, and BSP sizes in stock for fast dispatch.',

  // Plumbing
  'plumbing/kitchen-taps':
    'Kitchen taps that pair with filtration systems — three-way mixers, pull-down sprays, and dedicated filtered outlets. WELS rated, WaterMark where mains-connected.',
  'plumbing/bathroom-taps':
    'Bathroom taps for filtered-water installs — basin mixers, shower mixers, and wall-mount sets in chrome, matte black, and brushed nickel. WaterMark and WELS rated.',
  'plumbing/ro-filter-taps':
    'Dedicated filtered-water taps for reverse osmosis and under-sink systems. Spring-loaded and tri-flow designs with 1/4" inlets to match standard RO tubing.',
  'plumbing/toilets':
    'Toilet suites and pans matched to Australian bathroom installs. WELS water-efficiency ratings shown on every product, WaterMark certified where mains-connected.',
  'plumbing/bundles':
    'Complete bathroom and kitchen plumbing bundles — taps, mixers, and accessories packaged for a single delivery. WELS rated, WaterMark certified, finish-matched.',
};

export function getSubcategoryMetaDescription(
  categorySlug: string,
  subcategorySlug: string,
): string | null {
  return (
    SUBCATEGORY_META_DESCRIPTIONS[`${categorySlug}/${subcategorySlug}`] ?? null
  );
}
