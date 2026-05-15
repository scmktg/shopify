import { INSTALL_PACKAGE } from '@/content/install-package';
import { formatAud } from '@/lib/utils/formatPrice';

/**
 * Short, above-grid intro for catalogue landing pages.
 *
 * Top-level keys are the category slug (e.g. 'water-filters').
 * Subcategory keys use the composite '<category>/<subcategory>' form
 * so the page can do a single getCategoryIntro lookup regardless of
 * level.
 *
 * Per docs/04-seo-strategy.md, the priority subcategory pages
 * (whole-house, under-sink, reverse-osmosis) carry a short 40–60
 * word intro above the product grid plus a longer
 * `CATEGORY_EDITORIAL` body below the grid. Parent category pages
 * and lower-priority subcategories use this map only.
 *
 * Written per docs/06-content-rules.md (direct, knowledgeable,
 * Australian English, no exclamation marks, no AI giveaways) and the
 * SEO patterns in docs/04-seo-strategy.md. Each intro front-loads the
 * primary keyword and mentions WaterMark or WELS where relevant.
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

  // Priority subcategory pages — short intros above the grid. Longer
  // below-grid editorial lives in CATEGORY_EDITORIAL.
  'water-filters/whole-house':
    'Whole house water filters sit on the cold-water mains and treat every tap in the house. The systems below are WaterMark certified for Australian mains-pressure installs, with licence numbers on every product page. For chlorine and sediment, a two-stage system is usually enough. Chloramine needs catalytic carbon; rural tank water needs UV.',
  'water-filters/under-sink':
    'Under sink water filters tuck into the cabinet below the kitchen sink and feed filtered water to a dedicated tap. Every system here is sized for Australian fittings, with WaterMark certified options labelled on the page. Single-stage carbon handles chlorine and taste; multi-stage adds sediment and polishing; reverse osmosis covers fluoride and PFAS.',
  'water-filters/reverse-osmosis':
    'Reverse osmosis systems strip dissolved contaminants — fluoride, PFAS, heavy metals, and most everything else — by pushing water through a semi-permeable membrane. Every RO system here is built for Australian mains pressure and connections, with WaterMark certified options labelled on the page. Four to six stages cover sediment, carbon pre-treatment, the membrane, and an optional alkaline post-filter.',

  // Cartridge subcategories — short intros only. The
  // /help/cartridge-compatibility-guide/ page carries the longer
  // sizing and configuration content; intros here just route the
  // shopper to the right SKU fast.
  'cartridges/sediment':
    'Sediment filter cartridges in 1, 5, and 20 micron — polypropylene spun and pleated. Sized for the Australian standard 10" × 2.5" and 20" × 4.5" (Big Blue) housings. Not sure what fits your system? The [cartridge compatibility guide](/help/cartridge-compatibility-guide/) covers the common 3-stage and 6-stage configurations.',
  'cartridges/carbon':
    'Carbon filter cartridges for chlorine, taste, and odour — coconut carbon block (CTO), granular activated carbon (GAC), and catalytic carbon for chloramine. Stocked in 10" × 2.5" and 20" × 4.5" (Big Blue) Australian standard sizes. Match cartridges to your housing with the [cartridge compatibility guide](/help/cartridge-compatibility-guide/).',
  'cartridges/reverse-osmosis-membranes':
    'Replacement reverse osmosis membranes in 50, 75, and 100 GPD TFC elements that fit standard 10" × 2.5" RO membrane housings used in Australian under-sink systems. Pair the membrane with the right pre- and post-filter set using the [cartridge compatibility guide](/help/cartridge-compatibility-guide/).',
  'cartridges/cartridge-sets':
    'Pre-built cartridge sets matched to 2-, 3-, 5-, and 6-stage systems — one SKU covers the full service interval with sediment, carbon, and membrane where applicable. Sized for the Australian 10" × 2.5" and 20" × 4.5" Big Blue standards. See the [cartridge compatibility guide](/help/cartridge-compatibility-guide/) to confirm fit before you order.',

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
 * One H2 + body block in the below-grid editorial. The `body` is
 * authored as markdown and rendered through the shared remark
 * pipeline. Markdown heading syntax (`#`, `##`, ...) is rejected by
 * `getCategoryEditorial()` so the page outline stays clean:
 * `<h1>` from CategoryHero, `<h2>` from `heading` here, `<h3>` from
 * the FAQ accordion below.
 */
export interface CategoryEditorialSection {
  /** Rendered as the section's <h2>. Plain text, no markdown. */
  heading: string;
  /** Markdown body — paragraphs, lists, inline links via
   *  `[text](/path)`. Must not contain heading syntax. */
  body: string;
}

/**
 * Below-grid buyer guidance for priority subcategory pages. Slug
 * keys mirror the composite '<category>/<subcategory>' form used by
 * CATEGORY_INTROS. Pages without an entry render nothing below the
 * grid — only the three priority subs in docs/04-seo-strategy.md
 * (whole-house, under-sink, reverse-osmosis) get a body for PR 1.
 */
export const CATEGORY_EDITORIAL: Readonly<
  Record<string, ReadonlyArray<CategoryEditorialSection>>
> = {
  'water-filters/whole-house': [
    {
      heading: 'How to size a whole-house filter',
      body: `Match the housing size to peak flow, not average use. Big Blue is the industry name for 4.5-inch-diameter housings — they hold roughly five times more cartridge media than the 2.5-inch standard size, so they keep flow up when two or three outlets run at once, and they go longer between cartridge changes.

A three-bedroom home with two bathrooms wants a 20" × 4.5" two- or three-stage. Smaller properties and single-occupant cottages can run a 10" × 2.5". Every product on this page lists rated flow in L/min — match it to your peak demand, not the average.`,
    },
    {
      heading: 'What to look for in the cartridges',
      body: `Three cartridge specs decide whether a whole-house system actually does its job.

**Sediment** — 5 micron is the standard pre-filter; step up to a 20 micron + 5 micron pair for rural tank water or any sediment-heavy supply.

**Carbon block** beats granular carbon for contact time and contaminant capture; it's the default second stage.

**Catalytic carbon** is required if your supply uses chloramine — Sydney, Melbourne, Brisbane, Adelaide, and Canberra all do. Standard carbon does not remove chloramine at whole-house flow rates. See [chloramine and PFAS](/water-problems/chloramine-and-pfas/) for the full picture.

Standard whole-house carbon does not remove fluoride — for that, see [reverse osmosis](/water-filters/reverse-osmosis/), which sits under the kitchen sink and treats drinking water specifically.`,
    },
    {
      heading: 'Install requirements',
      body: `Whole-house systems plumb into the cold-water mains and must be fitted by a licensed plumber — DIY mains-pressure work fails inspection and voids most home insurance. Every product on this page is WaterMark certified with its Australian licence number on the page, which is what your plumber and your council inspector both need to see.

For a fixed-price install on the NSW Central Coast, the [whole house installation package](${INSTALL_PACKAGE.path}) covers product, plumber, and commissioning at ${formatAud(INSTALL_PACKAGE.priceAud)}. Cartridge changes after that are five-minute jobs and don't need a plumber.`,
    },
  ],
  'water-filters/under-sink': [
    {
      heading: 'How to choose an under-sink system',
      body: `Decide what you want filtered, then count the stages. A single-stage carbon filter handles chlorine taste and odour on town water — cheapest install, lowest pressure drop, one cartridge to change. A three-stage system adds a sediment pre-filter and a polishing carbon stage, which extends cartridge life and catches the rust and grit that show up after upstream mains maintenance.

Reverse osmosis is the under-sink option for [fluoride, PFAS, and heavy metals](/water-filters/reverse-osmosis/) — different membrane technology, listed separately. Don't buy more stages than you need; every added stage is another cartridge and another connection to leak.`,
    },
    {
      heading: 'What to look for',
      body: `Three specs cover most under-sink decisions.

**Number of stages** — single-stage carbon for chlorine and taste only; three-stage for sediment plus chlorine plus polishing; five- or six-stage when reverse osmosis is in the mix.

**Carbon type** — carbon block beats granular activated carbon for under-sink installs. It gives the water longer contact time at low flow, doubles as a fine sediment filter, and removes more contaminants per litre.

**Tap style** — a dedicated filtered tap on the bench keeps filtered water clearly distinct, and is required for RO output. Three-way mixers combine cold, hot, and filtered through a single fixture if you prefer one tap on the bench.`,
    },
    {
      heading: 'Install requirements',
      body: `Standard under-sink filters connect to the cold-water line under the sink with push-fit fittings — most homeowners can install one in about an hour with no plumbing licence required. The full kit (housing, bracket, tubing, T-piece, isolation valve) ships with every system; the [under-sink install guide](/help/installing-an-under-sink-filter/) walks through the steps.

Systems that cut into the mains, or any install with a dedicated filtered tap drilled through the bench, are easier for a licensed plumber. WaterMark certification is required for under-sink units permanently fitted to mains-pressure plumbing — every certified product on this page shows its licence number.`,
    },
  ],
  'water-filters/reverse-osmosis': [
    {
      heading: 'When to choose reverse osmosis',
      body: `Reverse osmosis removes more contaminants than any other residential filtration method. The semi-permeable membrane rejects 90–99% of dissolved solids, which means it removes [fluoride](/water-problems/fluoride-removal/), [PFAS](/water-problems/chloramine-and-pfas/), lead, sodium, nitrates, and the same chlorine and sediment a carbon under-sink handles.

The trade-off is throughput and waste water — RO produces 1–2 litres of filtered water for every 2–4 litres in, and the filtered output is buffered in a small pressure tank under the sink. For the rest of the house, pair RO at the kitchen sink with a [whole-house carbon system](/water-filters/whole-house/) for showers, washing machines, and outside taps.`,
    },
    {
      heading: 'What to look for',
      body: `Three specs decide whether an RO system is right for your install.

**Membrane GPD** — gallons per day, the rated output. 50 GPD suits a household of one or two; 75 GPD is the standard family size; 100 GPD systems pair well with a permeate pump if your incoming pressure is low.

**Pre-filters** — sediment and carbon stages ahead of the membrane protect it from chlorine (which destroys TFC membranes) and silt. Most residential systems run two pre-filter stages; six-stage systems add a finer pre-treatment for difficult supplies.

**Post-filter** — a polishing carbon stage on the way to the tap removes any residual taste from the storage tank. Alkaline or remineralisation post-filters add back the calcium and magnesium the membrane strips out, if you prefer mineralised water.`,
    },
    {
      heading: 'Install and running notes',
      body: `Most under-sink RO systems are DIY-installable with the included push-fit fittings — the kit covers the housing assembly, mounting bracket, dedicated filtered tap, and the drain saddle for the brine line. A licensed plumber is required if the system permanently connects to the cold-water mains rather than the existing under-sink shut-off; WaterMark certification is mandatory in that case and is shown on every certified product.

Membrane life is typically 2–3 years on town water; pre- and post-filter cartridges change every 6–12 months. Replacement [reverse osmosis membranes](/cartridges/reverse-osmosis-membranes/) and matched [cartridge sets](/cartridges/cartridge-sets/) are stocked for every system we sell.`,
    },
  ],
};

/**
 * Returns the editorial sections for a slug, or null when none are
 * authored. Asserts at module load that no body contains markdown
 * heading syntax — the section's <h2> is owned by `heading`, so
 * bodies must stay at paragraph level (see docs/08-conventions.md).
 */
const HEADING_SYNTAX_RE = /(^|\n)\s{0,3}#{1,6}\s/;
for (const [slug, sections] of Object.entries(CATEGORY_EDITORIAL)) {
  for (const section of sections) {
    if (HEADING_SYNTAX_RE.test(section.body)) {
      throw new Error(
        `CATEGORY_EDITORIAL['${slug}'] section "${section.heading}" contains markdown heading syntax in its body. Split it into a new section instead.`,
      );
    }
  }
}

export function getCategoryEditorial(
  slug: string,
): ReadonlyArray<CategoryEditorialSection> | null {
  const sections = CATEGORY_EDITORIAL[slug];
  return sections && sections.length > 0 ? sections : null;
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
