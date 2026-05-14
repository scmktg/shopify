/** @type {import('next').NextConfig} */

// Site canonical URLs have no trailing slash. All destinations here are
// slashless so legacy WP traffic resolves in one hop instead of chaining
// 308 -> /foo/ -> 308 -> /foo.
//
// Phase 2 (2026-05): comprehensive WordPress -> new site redirect map for
// the enviroaqua.com.au DNS cutover. Phase 1 (BLOG_MIGRATION_REDIRECTS,
// below) was merged earlier and is untouched.

// products.json provides the source-of-truth (category, subcategory)
// tuple for every Shopify handle. We use it below to auto-upgrade any
// /product/<slug>/ or /bathroom/product/<slug>/ redirect whose
// destination is currently a category PLP — if the slug exists as a
// real product, we rewrite the destination to the specific product
// path, eliminating soft-404 behaviour for slug-matched URLs.
//
// SEO audit 2026-05 (Fix 3): the GSC audit reported 52 bathroom
// product URLs and ~80 /product/<slug> URLs whose destinations were
// the category landing page even though the slug existed on the new
// site. Rather than hand-edit every entry, this helper recomputes the
// correct destination at build time so the rule list stays in
// click-rank order (and stays auditable).
const PRODUCTS_DATA = require('./data/products.json');
function productPathForSlug(slug) {
  const entry = PRODUCTS_DATA[slug];
  if (!entry || !Array.isArray(entry.categories)) return null;
  const [cat, sub] = entry.categories;
  if (!cat || !sub) return null;
  return `/${cat}/${sub}/${slug}`;
}
function maybeUpgradeProductDestination(source, destination) {
  const m = source.match(/^\/(?:bathroom\/)?product\/([^/]+)$/);
  if (!m) return destination;
  const upgraded = productPathForSlug(m[1]);
  return upgraded ?? destination;
}

// Each tuple is [source, destination]. The helper below expands every
// entry into /path and /path/ source variants so old crawls and external
// links resolve regardless of trailing-slash formatting.
//
// GSC audit 2026-05: the first 30 entries below are the top click-drivers
// from the legacy WordPress site (≈915 clicks / 147k impressions over
// the prior 16 months — ~42% of all site clicks). Pre-audit, each of
// these 308'd to a category PLP, which Google treats as a soft 404 and
// drops link equity for. They now redirect to their specific product
// page where one exists. Five entries kept their category destination —
// see inline comments — pending manual resolution; those are tracked in
// `redirect-map.json`, `needs-review.txt`, and `unmapped.txt` at the
// repo root. Entries below the 30 are tail products; a follow-up audit
// will reclassify them.
const WORDPRESS_PRODUCT_REDIRECTS = [
  // ── GSC top 30 — ordered by click rank, highest first ─────────────
  // #1 (156 clicks)
  ['/product/12v-self-priming-garden-caravan-electric-water-pump-faucet-tap-kit-5m-pipe', '/pumps-and-tanks/pumps/12v-self-priming-water-pump-kit-includes-tap-plus-5m-pipe'],
  // #2 (120 clicks)
  ['/product/rimless-watermark-back-to-wall-toilet-soft-close-wels', '/plumbing/toilets/rimless-watermark-back-to-wall-toilet-soft-close-seat-wels-rated-local-pickup-ce'],
  // #3 (112 clicks) — consolidated 50L/100L/200L listing per audit note
  ['/product/100l-chemical-dosing-tank-water-tank-poly-tank-and-bund', '/pumps-and-tanks/dosing-tanks/chemical-dosing-tank-with-bunding-available-in-50l-100l-and-200l'],
  // #4 (109 clicks)
  ['/product/typ-4000-bypass-pressure-adjustable-diaphragm-booster-pump-24-vdc-400gpd', '/pumps-and-tanks/pumps/typ-4000-bypass-pressure-adjustable-diaphragm-booster-pump-24-vdc-400gpd'],
  // #5 (43 clicks)
  ['/product/uv-water-filter-ultraviolet-sterilisation-0-5-1-gpm-6w-12vdc', '/water-filters/uv-sterilisation/uv-water-filter-ultraviolet-sterilisation-0-5-1-gpm-6w-12vdc'],
  // #6 (28 clicks)
  ['/product/shower-filter-15-stages-includes-extra-cartridge', '/water-filters/parts/shower-filter-15-stages-includes-extra-cartridge'],
  // #7 (26 clicks)
  ['/product/3-way-pull-down-spray-tap-kitchen-mixer-in-black-chrome-and-nickel', '/plumbing/ro-filter-taps/3-way-pull-down-spray-tap-kitchen-mixer-in-black-chrome-and-nickel'],
  // #8 (23 clicks)
  ['/product/drinking-fountain-tap-for-bubbler-cooler-chrome-tap-faucet', '/bubblers-and-coolers/parts/drinking-fountain-tap-for-bubbler-cooler-chrome-tap-faucet'],
  // #9 (22 clicks)
  ['/product/1-inch-flexible-stainless-steel-hose-for-pressure-tank', '/pumps-and-tanks/pressure-tanks/1-inch-flexible-stainless-steel-hose-for-pressure-tank'],
  // #10 (20 clicks) — NEEDS REVIEW: three plausible cooler candidates, kept on category
  ['/product/hot-cold-water-cooler-direct-connect', '/bubblers-and-coolers/coolers-and-chillers'],
  // #11 (18 clicks) — UNMAPPED: bulk aquarium carbon, no equivalent SKU on new site
  ['/product/aquarium-fish-tank-carbon-activated-carbon-filter-500g-1kg-2kg-3kg-5kg-25kg', '/cartridges/carbon'],
  // #12 (18 clicks)
  ['/product/premium-ro-filter-tap-sus304-nsf-approved-in-black-nickel-and-gold', '/plumbing/ro-filter-taps/premium-ro-filter-tap-sus304-nsf-approved-in-black-nickel-and-gold'],
  // #13 (17 clicks) — NEEDS REVIEW: 1100ml/min flow-rate variant not on new site, kept on category
  ['/product/diaphragm-booster-pump-ro-water-pump-24vdc-1100ml-min', '/pumps-and-tanks/pumps'],
  // #14 (15 clicks)
  ['/product/inline-water-filter-t33-activated-post-carbon-5-micron-10x2', '/cartridges/specialty-cartridges/inline-water-filter-t33-activated-post-carbon-5-micron-10-x-2'],
  // #15 (14 clicks) — old slug ends in "-square", maps to the watermark-certified-square SKU
  ['/product/commercial-stainless-steel-filtered-cold-water-bubbler-square', '/bubblers-and-coolers/bubblers/commercial-water-bubbler-filtered-stainless-steel-watermark-certified-square-des'],
  // #16 (14 clicks)
  ['/product/ro-water-filter-24v-dc-diaphragm-pump-reverse-osmosis-pressure-booster-pump', '/pumps-and-tanks/pumps/ro-water-filter-24v-dc-diaphragm-pump-reverse-osmosis-pressure-booster-pump'],
  // #17 (13 clicks)
  ['/product/water-pressure-reducing-valve-with-quick-connect-fitting-1-4-6mm-tube', '/water-filters/parts/water-pressure-reducing-valve-with-quick-connect-fitting-1-4-6mm-tube'],
  // #18 (13 clicks)
  ['/product/twin-pair-of-water-filter-cartridges-carbon-cto-sediment-pp-10-x-2-5', '/cartridges/sediment/twin-pair-of-water-filter-cartridges-carbon-cto-plus-sediment-pp-10-x-2-5-5-micr'],
  // #19 (13 clicks) — UNMAPPED: 12.5L/25mm twin-port short tank not on new site
  ['/product/vessel-tank-12-5l-short-tank1-25mm-ports-suitable-for-twin-tanks', '/pumps-and-tanks/pressure-tanks'],
  // #20 (12 clicks)
  ['/product/under-sink-water-filter-6-stage-reverse-osmosis-system', '/water-filters/reverse-osmosis/under-sink-water-filter-6-stage-reverse-osmosis-system'],
  // #21 (12 clicks)
  ['/product/big-blue-whole-house-water-filter-and-uv-ultraviolet-sterilization-system', '/water-filters/whole-house/big-blue-whole-house-water-filter-and-uv-ultraviolet-sterilization-system'],
  // #22 (12 clicks)
  ['/product/tap-thread-adaptor-suitable-for-countertop-systems-22mm-to-24mm', '/water-filters/parts/tap-thread-adaptor-suitable-for-countertop-systems-22mm-to-24mm'],
  // #23 (11 clicks)
  ['/product/inline-water-filter-fluoride-removal-10x2', '/cartridges/specialty-cartridges/inline-water-filter-fluoride-removal-10-x-2'],
  // #24 (11 clicks)
  ['/product/ultraviolet-water-sterilizer-stainless-steel-unit-55w-2700lph-phillip-lamp', '/water-filters/uv-sterilisation/ultraviolet-water-sterilizer-stainless-steel-unit-55w-2700lph-phillip-lamp'],
  // #25 (11 clicks)
  ['/product/ultraviolet-water-sterilizer-stainless-steel-unit-40w-2700lph-full-set-4-pins', '/water-filters/uv-sterilisation/ultraviolet-water-sterilizer-stainless-steel-unit-40w-2700lph-full-set-4-pins'],
  // #26 (11 clicks) — "with pressure tank" suffix matches the desalination-plant-with-pressu SKU
  ['/product/commercial-reverse-osmosis-ro-3000-lpd-800-gpd-with-pressure-tank', '/water-filters/commercial/commercial-reverse-osmosis-ro-desalination-plant-ro-3000-lpd-800-gpd-with-pressu'],
  // #27 (11 clicks) — NEEDS REVIEW: no 1-stage 20x4.5 washable on new site, kept on category
  ['/product/whole-house-water-filter-1-stage-20x4-5-inch-washable-reusable', '/water-filters/whole-house'],
  // #28 (10 clicks)
  ['/product/uv-water-filter-ultraviolet-sterilisation-0-5-1-gpm-6w-220v', '/water-filters/uv-sterilisation/uv-water-filter-ultraviolet-sterilisation-0-5-1-gpm-6w-220v'],
  // #29 (10 clicks) — old slug ends in "-circular"; new "-round-wm" SKU is the circular variant
  ['/product/commercial-stainless-steel-filtered-cold-water-bubbler-circular', '/bubblers-and-coolers/bubblers/commercial-stainless-steel-filtered-cold-water-bubbler-round-wm'],
  // #30 (10 clicks)
  ['/product/toilet-rimless-modern-watermark-ceramic-p-trap-commode-modern-2piece-toilet-wels', '/plumbing/toilets/toilet-rimless-modern-watermark-ceramic-p-trap-commode-modern-2piece-toilet-wels'],
  // ── Tail products — pending category-to-product re-audit ──────────
  ['/product/spring-loaded-3-way-tap-kitchen-mixer-in-black-chrome-nickel', '/plumbing/ro-filter-taps'],
  ['/product/reusable-100-micron-strainer-water-filter-washable-filter-sediment-10x2-5', '/cartridges/sediment'],
  ['/product/premium-water-filter-faucet-tap-reverse-osmosis-drinking-ro-nsf', '/plumbing/ro-filter-taps'],
  ['/product/spring-loaded-tap-kitchen-mixer-in-brushed-nickel', '/plumbing/kitchen-taps'],
  ['/product/vessel-tank-12-5l-short-tank', '/pumps-and-tanks/pressure-tanks'],
  ['/product/whole-house-water-filter-1-stage-20x4-5-inch-sediment', '/water-filters/whole-house'],
  ['/product/uv-water-filter-ultraviolet-sterilisation-2700lph-55w-220v-240v', '/water-filters/uv-sterilisation'],
  ['/product/double-water-filter-tap', '/plumbing/ro-filter-taps'],
  ['/product/dc12v-180w-submersible-solar-power-water-well-pump-garden-farm-ranch-23ft-lift', '/pumps-and-tanks/pumps'],
  ['/product/single-phase-submersible-clean-water-pump-370w-lift-10m', '/pumps-and-tanks/pumps'],
  ['/product/bladder-for-8l-pressure-water-tank-drinking-water-compatible-made-in-italy', '/pumps-and-tanks/pressure-tanks'],
  ['/product/plastic-opening-handle-spanner-wrench-for-10x2-5water-filter-housing-universal', '/water-filters/parts'],
  ['/product/4-stages-whole-house-water-filter-and-uv-ultraviolet-sterilization-system-40w', '/water-filters/uv-sterilisation'],
  ['/product/under-sink-water-filter-4-stage-reverse-osmosis-system', '/water-filters/reverse-osmosis'],
  ['/product/commercial-reverse-osmosis-ro-1500-lpd-400gpd', '/water-filters/commercial'],
  ['/product/premium-three-stage-big-blue-whole-house-water-filter-system', '/water-filters/whole-house'],
  ['/product/standard-10-x-2-5-water-filter-standard-water-filter-housing-white-universal', '/water-filters/parts'],
  ['/product/commercial-reverse-osmosis-ro-3000-lpd-800-gpd', '/water-filters/commercial'],
  ['/product/rimless-watermark-wash-down-toilet-soft-close-wels-central-coast', '/plumbing/toilets'],
  ['/product/commercial-rust-free-filtered-cold-water-bubbler', '/bubblers-and-coolers/bubblers'],
  ['/product/bench-top-water-filter-sediment-1-stage', '/water-filters/bench-top'],
  ['/product/water-filter-tube-high-pressure-nsf-pipe-1-4-inch-6mm-lldpe', '/water-filters/parts'],
  ['/product/12v-uv-water-sterilizer-filter', '/water-filters/uv-sterilisation'],
  ['/product/3-8-quick-od-50psi-pressure-limiting-protection-dual-check-valve-water-filter', '/water-filters/parts'],
  ['/product/diverter-valve-tap-rubber-connector-adapter-to-fit-benchtop-to-old-taps', '/water-filters/bench-top'],
  ['/product/inline-uf-ultrafiltration-filter-cartridge', '/cartridges/specialty-cartridges'],
  ['/product/water-pressure-tank-vessel-50l-steel-drinking-water-compatible-bladder-almond', '/pumps-and-tanks/pressure-tanks'],
  ['/product/inline-water-filter-alkaline-ph-neutralising-10-x-2', '/cartridges/specialty-cartridges'],
  ['/product/id-8mm-5m-plastic-clear-pvc-hose-pipe-tube-air-water-food-home-washer', '/water-filters/parts'],
  ['/product/whole-house-water-filter-clear-sediment-1-stage', '/water-filters/whole-house'],
  ['/product/3-way-filtered-kitchen-mixer-tap-black-nickel-gold-chrome', '/plumbing/ro-filter-taps'],
  ['/product/gooseneck-kitchen-mixer-tap-polished-chrome', '/plumbing/kitchen-taps'],
  ['/product/bench-top-water-filter-sediment-carbon-2-stage', '/water-filters/bench-top'],
  ['/product/water-filter-tube-high-pressure-nsf-pipe-3-4-lldpe', '/water-filters/parts'],
  ['/product/washable-reusable-water-filter-pleated-5-micron-10x4-5', '/water-filters'],
  ['/product/24v-low-pressure-switch-for-pump-ro-water-fitlers-with-quick-connect', '/pumps-and-tanks/pumps'],
  ['/product/30-pics-3-8-locking-clips-clamps-for-reverse-osmosis-water-filter-fittings-6mm-3', '/water-filters/reverse-osmosis'],
  ['/product/20-x-4-5-whole-house-rain-tank-water-filter-system-5mic-sediment-steel-bracket', '/water-filters/whole-house'],
  ['/product/complete-bathroom-package-2c-polished-chrome-watermark-certified-wels-rated', '/plumbing/bundles'],
  ['/product/whole-house-water-filter-clear-carbon-1-stage', '/water-filters/whole-house'],
  ['/product/in-wall-concealed-cistern-toilet-rimless-floor-mount-pan-chrome-buttons-wels', '/plumbing/toilets'],
  ['/product/whole-house-water-filter-clear-sediment-carbon-2-stage', '/water-filters/whole-house'],
  ['/product/under-sink-water-filter-2-stage-sediment-carbon', '/water-filters/under-sink'],
  ['/product/twin-20-x-4-5-big-blue-whole-house-water-filter-system-2-stage-bb-bracketca', '/water-filters/whole-house'],
  ['/product/water-filter-tube-high-pressure-nsf-pipe-1-4-inch-lldpe', '/water-filters/parts'],
  ['/product/100l-vertical-solar-system-water-pressure-tank-expansion-tank-with-legs', '/pumps-and-tanks/pressure-tanks'],
  ['/product/1-4-tank-ball-valve-quick-connect-aquarium-ro-water-pressure-tank-switch', '/pumps-and-tanks/pressure-tanks'],
  ['/product/reverse-osmosis-ro-residential-1-4-drain-clamp-2', '/water-filters/reverse-osmosis'],
  ['/product/whole-house-water-filter-2-stage-10x4-5-inch-washable-reusable', '/water-filters/whole-house'],
  ['/product/under-sink-water-filter-5-stage-reverse-osmosis-system', '/water-filters/reverse-osmosis'],
  ['/product/3-speed-hot-water-circulator-boiler-pump-switch-heating-sys-1-male-1-5-female', '/pumps-and-tanks/pumps'],
  ['/product/polypropylene-sediment-water-filter-pp-5-micron-10x4-5', '/cartridges/sediment'],
  ['/product/inline-shutoff-ball-valve-push-fit-quick-connect-1-4-inch', '/water-filters/parts'],
  ['/product/12v-self-priming-water-pump-kit-with-tap-pipe-and-12l-tank', '/pumps-and-tanks/pumps'],
  ['/product/3-way-kitchen-tap-ro-water-filters-mixer-shiny-gold', '/plumbing/ro-filter-taps'],
  ['/product/premium-three-stage-big-blue-whole-house-water-filter-system-stainless', '/water-filters/whole-house'],
  ['/product/whole-house-water-filter-2-stage-10x4-5-inch-sediment-carbon', '/water-filters/whole-house'],
  ['/product/granular-activated-carbon-water-filter-gac-5-micron-20x4-5', '/cartridges/carbon'],
  ['/product/smart-led-bathroom-mirror-oval', '/plumbing'],
  ['/product/12cm-bathroom-mixer-tap-in-polished-chrome-extended-sprout', '/plumbing/bathroom-taps'],
  ['/product/automatic-self-priming-hot-cold-water-pressure-pump-with-flow-control-380w-220v', '/pumps-and-tanks/pumps'],
  ['/product/polypropylene-sediment-water-filter-pp-5-micron-10x2-5', '/cartridges/sediment'],
  ['/product/bench-top-water-filter-carbon-1-stage', '/water-filters/bench-top'],
  ['/product/bladder-for-50l-pressure-water-tank-drinking-water-compatible-made-in-italy', '/pumps-and-tanks/pressure-tanks'],
  ['/product/uv-water-filter-ultraviolet-sterilisation-1500lph-25w-220v-240v', '/water-filters/uv-sterilisation'],
  ['/product/polypropylene-sediment-water-filter-pp-5-micron-20x2-5', '/cartridges/sediment'],
  ['/product/water-filter-replacement-set-standard-6-stage-5-micron-10-inch', '/cartridges/cartridge-sets'],
  ['/product/5-x-1-4-push-fit-pipe-fitting-elbow-tube-connector-joiner-water-filter-fridge-ro', '/water-filters/parts'],
  ['/product/coconut-activated-carbon-water-filter-cto-5-micron-10x2-5', '/cartridges/carbon'],
  ['/product/coconut-activated-carbon-water-filter-cto-5-micron-10x4-5', '/cartridges/carbon'],
  ['/product/polypropylene-sediment-water-filter-pp-5-micron-20x4-5', '/cartridges/sediment'],
  ['/product/12-litre-reverse-osmosis-water-holding-tank-ro-3-2g-plastic-rust-free', '/water-filters/reverse-osmosis'],
  ['/product/24v-high-pressure-switch-for-pump-ro-water-fitlers-with-quick-connect', '/pumps-and-tanks/pumps'],
  ['/product/twin-water-filter-cartridges-premium-carbon-sediment-10x2-5-5-micron', '/cartridges/cartridge-sets'],
  ['/product/6-stage-reverse-osmosis-water-filters-set-with-75gpd-ro-membrane-alkaline-cart', '/cartridges/cartridge-sets'],
  ['/product/whole-house-water-filter-1-stage-10x4-5-inch-sediment', '/water-filters/whole-house'],
  ['/product/5-stage-reverse-osmosis-ro-full-replacement-set-with-75-gpd-membrane-nsf', '/cartridges/cartridge-sets'],
  ['/product/diverter-valve-tap-connector-for-1-4-tube-benchtop-countertop-water-filters', '/water-filters/bench-top'],
  ['/product/15-stage-shower-filter-great-for-chlorine-skin-allergies-extra-cartridge', '/water-filters/whole-house'],
  ['/product/standard-carbon-water-filter-cartridge-coconut-activated-carbon-filter-cto-20-x-4-5-5-micron', '/cartridges/carbon'],
  ['/product/deluxe-ro-water-filter-tap-nsf-certified-faucet-in-polished-chrome', '/plumbing/ro-filter-taps'],
  ['/product/4-stage-rodi-in-line-water-filter-replacement-set-with-ro-membrane-aquarium-fish', '/cartridges/cartridge-sets'],
  ['/product/home-plastic-3-way-water-purifier-filters-tube-quick-connect-fitting-white', '/water-filters/parts'],
  ['/product/6-stages-ro-cartridges-replacement-set-for-6-stages-ro-water-filter-system-5mic', '/cartridges/cartridge-sets'],
  ['/product/4-stage-aquarium-tank-reverse-osmosis-water-filters-ro-di-resin-filter', '/water-filters/reverse-osmosis'],
  ['/product/under-sink-water-filter-3-stage-sediment-carbon-alkaline', '/water-filters/under-sink'],
  ['/product/premium-twin-undersink-water-filter-system-with-three-way-tap', '/water-filters/under-sink'],
  ['/product/5-stage-undersink-home-drinking-ro-water-filter-system-with-3-way-tap', '/water-filters/reverse-osmosis'],
  ['/product/luxurious-3-way-tap-for-ro-water-filters-kitchen-mixer-in-black-or-nickel', '/plumbing/ro-filter-taps'],
  ['/product/filtered-hot-cold-water-cooler-direct-connect', '/bubblers-and-coolers/coolers-and-chillers'],
  ['/product/granular-activated-carbon-water-filter-gac-5-micron-10x2-5', '/cartridges/carbon'],
  ['/product/pull-down-modern-kitchen-tap-mixer-in-brushed-nickel', '/plumbing/kitchen-taps'],
  ['/product/whole-house-water-filter-replacement-set-3-stage-5-micron-20x2-5', '/cartridges/cartridge-sets'],
  ['/product/inline-water-filter-replacement-set-3-stages-sediment-carbon-ro-membrane-10', '/cartridges/cartridge-sets'],
  ['/product/3-way-ro-system-water-shut-off-stop-valve-1-4x-1-4-quick-connect-x-1-2', '/water-filters/parts'],
  // /product/4647 and /product/4148 were WP numeric post IDs. Without a
  // post-ID -> slug map from the old DB we can't redirect them to a
  // specific product, so they fall through to middleware 410 rather
  // than soft-404 on /water-filters. (Audit 2026-05 Fix 8.)
  ['/product/bladder-for-12l-pressure-water-tank-drinking-water-compatible-made-in-italy', '/pumps-and-tanks/pressure-tanks'],
  ['/product/5-x-fridge-water-filter-fitting-threaded-elbow-quick-connect-6mm-x-1-4-push-fit', '/water-filters/parts'],
  ['/product/bathroom-sink-pop-up-waste-overflow-basin-vanity-chrome-push-plug-drain-40mm', '/plumbing/bathroom-taps'],
  ['/product/5-x-1-4-push-fit-pipe-fitting-elbow-tube-connector-joiner-water-filter-fridge', '/water-filters/parts'],
  ['/product/coconut-activated-carbon-water-filter-cto-5-micron-20x4-5', '/cartridges/carbon'],
  ['/product/premium-stainless-steel-three-stage-big-blue-whole-house-water-filter-system-steel', '/water-filters/whole-house'],
  ['/product/bladder-for-100l-pressure-water-tank-drinking-water-compatible-made-in-italy', '/pumps-and-tanks/pressure-tanks'],
  ['/product/whole-house-water-filter-replacement-set-3-stage-5-micron-20x4-5', '/cartridges/cartridge-sets'],
  ['/product/whole-house-water-filter-1-stage-10x4-5-inch-carbon', '/water-filters/whole-house'],
  ['/product/uv-0-5-1-gpm-11w-filters-uv-water-sterilizer-filter-220v-phillip-lamp', '/water-filters/uv-sterilisation'],
  ['/product/30-pics-1-4-locking-clips-clamps-for-reverse-osmosis-water-filter-fittings-6mm', '/water-filters/parts'],
  ['/product/complete-bathroom-package-2b-matte-black-watermark-certified-wels-rated', '/plumbing/bundles'],
  ['/product/3-stages-inline-water-filter-pp-gac-cto-10x2-5-portable', '/cartridges/cartridge-sets'],
  ['/product/100m-1-4-flexible-nylon-tube-hose-pneumatic-air-line-tubing', '/water-filters/parts'],
  ['/product/3-stages-inline-ro-water-filters-replacement-set-with-ro-membrane', '/cartridges/cartridge-sets'],
  ['/product/washable-reusable-water-filter-pleated-5-micron-20x4-5', '/cartridges/sediment'],
  ['/product/complete-bathroom-package-3b-matte-black-watermark-certified-wels-rated', '/plumbing/bundles'],
  ['/product/20m-1-4-6mm-high-pressure-water-filter-tube-reverse-osmosis-tubing', '/water-filters/parts'],
  ['/product/complete-bathroom-package-4b-matte-black-watermark-certified-wels-rated', '/plumbing/bundles'],
  ['/product/10-x-2-5-single-stage-counter-top-water-filter-system-with-carbon-filter', '/water-filters/bench-top'],
  ['/product/bladder-for-19l-pressure-water-tank-drinking-water-compatible-made-in-italy', '/pumps-and-tanks/pressure-tanks'],
  ['/product/complete-bathroom-package-3c-polished-chrome-watermark-certified-wels-rated', '/plumbing/bundles'],
  ['/product/smart-led-bathroom-mirror-circle', '/plumbing'],
  ['/product/uv-0-5-1-gpm-6w-filters-uv-water-steriliser-filter-220vdc', '/water-filters/uv-sterilisation'],
  ['/product/3-stages-whole-house-water-filter-and-uv-ultraviolet-sterilization-system', '/water-filters/uv-sterilisation'],
  ['/product/ultraviolet-water-sterilizer-filter', '/water-filters/uv-sterilisation'],
  ['/product/8l-vertical-solar-system-water-pressure-tank-expantion-tank-2-13-gallons', '/pumps-and-tanks/pressure-tanks'],
  ['/product/12-litre-reverse-osmosis-water-holding-tank', '/water-filters/reverse-osmosis'],
  ['/product/complete-bathroom-package-3g-matte-black-watermark-certified-wels-rated', '/plumbing/bundles'],
  ['/product/5-stages-ro-cartridges-replacement-set-for-5-stages-ro-water-filter-system-5mic', '/cartridges/cartridge-sets'],
  ['/product/10″-x-4-5″-heavy-duty-water-filter-with-1-brass-ports-sediment-filter-included', '/water-filters/whole-house'],
  ['/product/10-x-2-5-5-stage-undersink-water-filter-system-with-stainless-steel-tap-and-12l-tank-sediment-gac-carbon-ro-membrane-t33', '/water-filters/under-sink'],
  ['/product/12l-reverse-osmosis-water-holding-tank-ro-3-2g-plastic-rust-free', '/water-filters/reverse-osmosis'],
  ['/product/5-x-premium-quality-cto-carbon-cartridges-10-x-2-5', '/cartridges/carbon'],
  ['/product/premium-single-water-filter-system-with-2-cartridgesspanner-caravan-whole-house', '/water-filters/whole-house'],
  ['/product/uv-0-5-1-gpm-6w-filters-uv-water-sterilizer-filter-12vdc-for-caravan-solar', '/water-filters/uv-sterilisation'],
  ['/product/20″-x-4-5″-heavy-duty-water-filter-with-1-brass-ports-carbon-filter-included', '/water-filters/whole-house'],
  ['/product/commercial-reverses-osmosis-ro-500lph-water-treatment-machinery-equipment', '/water-filters/commercial'],
  ['/product/rimless-toilet-suite-back-to-wall-faced-close-soft-close-seat-back-inlet-wels', '/plumbing/toilets'],
  ['/product/granular-activated-carbon-water-filter-gac-5-micron-20x2-5', '/cartridges/carbon'],
  ['/product/115mm-square-tile-insert-100mm-waste-outlet-floor-drain-shower-grate', '/plumbing'],
  ['/product/wall-mounted-towel-robe-hook-polished-chrome', '/plumbing'],
  ['/product/good-quality-rectangle-vitreous-vessel-bathroom-sink-white', '/plumbing/bathroom-taps'],
  ['/product/tall-spring-loaded-kitchen-mixer-pull-out-spray-polished-chrome', '/plumbing/kitchen-taps'],
  ['/product/ceramic-counter-top-wash-sink-rectangle-glossy-white-50-cm-washbasin-bathroom', '/plumbing/bathroom-taps'],
  ['/product/wm-3-stages-20-x-4-5-triple-big-blue-whole-house-water-filter-system', '/water-filters/whole-house'],
  ['/product/digital-ph-meter-tds-tester-analysis-monitor-for-aquarium-pool-r1bo', '/cartridges/specialty-cartridges'],
  ['/product/digital-meter-tds-tester-aquarium-pool-spa-hydroponic-water-monitor-da', '/cartridges/specialty-cartridges'],
  ['/product/twin-counter-top-bench-top-double-drinking-water-filter-system-include-filters', '/water-filters/bench-top'],
  ['/product/pull-down-spray-tap-kitchen-mixer-in-brushed-nickel', '/plumbing/kitchen-taps'],
  ['/product/counter-top-basin-high-quality-modern-luxury-ce-sink-simple-single-hand-wash-art', '/plumbing/bathroom-taps'],
  ['/product/vanity-cabinetceramic-basin-top-whit-finish-pvc-tap-drainage-not-inc-60cm-f-s', '/plumbing'],
  ['/product/deluxe-water-filter-reverse-osmosis-ro-drinking-water-faucet-tap-2', '/plumbing/ro-filter-taps'],
  ['/product/bathroom-water-saving-round-shower-set-round-rainfall-head-shower-wels-watermark', '/plumbing/bathroom-taps'],
  ['/product/desktop-water-filter-portable-water-purifier-with-3in1-fillter-adapter-diy', '/water-filters/bench-top'],
  ['/product/coconut-activated-carbon-water-filter-cto-5-micron-20x2-5', '/cartridges/carbon'],
  ['/product/16cm-bathroom-mixer-tap-in-polished-chrome', '/plumbing/bathroom-taps'],
  ['/product/single-stage-counter-top-water-filter-desktop-water-purifiercartridge-included', '/water-filters/bench-top'],
  ['/product/water-filter-fitting-joiner-quick-connect-3-8-enviro-aqua', '/water-filters/parts'],
  ['/product/premium-pair-water-filter-cartridges-5-mic-carbon-5-mic-sediment-10x2-5', '/cartridges/cartridge-sets'],
  ['/product/wall-mounted-round-towel-ring-in-polished-chrome', '/plumbing'],
  ['/product/in-wall-dual-flush-toilet-button-faceplate-circular-design-in-black-chrome-gold-nickel', '/plumbing/toilets'],
  ['/product/5-stages-ro-system-stainless-steel-tap', '/water-filters/reverse-osmosis'],
  ['/product/standard-carbon-water-filter-cartridge-coconut-carbon-filter-cto-10-x-2-5-5-micron', '/cartridges/carbon'],
  ['/product/complete-bathroom-package-1c-polished-chrome-watermark-certified-wels-rated', '/plumbing/bundles'],
  ['/product/vanity-cabinet-stone-basin-top-pvc-white-tap-drainage-not-inc-1200-mm-f-s', '/plumbing'],
  ['/product/3-way-tap-for-ro-water-filters-kitchen-mixer-in-black-nickel-gold-and-chrome', '/plumbing/ro-filter-taps'],
  ['/product/3-stage-whole-house-water-filter-replacement-set-20-x-4-5', '/cartridges/cartridge-sets'],
  ['/product/whole-house-water-filter-1-stage-20x4-5-inch-carbon', '/water-filters/whole-house'],
  ['/product/2x-poly-spun-water-filter-cartridge-5-micron-sediment-20-x-4-5-whole-house', '/cartridges/sediment'],
  ['/product/granular-activated-carbon-water-filter-cartridge-gac-10-x-2-5-5-micron', '/cartridges/carbon'],
  ['/product/ro-wrench-for-water-filter-wrenching-1812-housing-of-reverse-osmosis-membrane', '/water-filters/parts'],
  ['/product/whole-house-water-filter-1-stage-10x2-5-inch-sediment', '/water-filters/whole-house'],
  ['/product/five-way-brass-fittings-quick-connect-fittings-water-pump-connector', '/water-filters/parts'],
  ['/product/back-to-wall-rimless-dual-flush-ceramic-toilet-suite-soft-close-seat-p-trap-wels', '/plumbing/toilets'],
  ['/product/pleated-water-filter-cartridge-washable-and-reusable-20-x-4-5-5-micron', '/cartridges/sediment'],
  ['/product/water-and-air-pressure-oil-gauge-new-1-4-brass-bspt-thread-60-150-300-psi', '/water-filters/parts'],
  ['/product/5-x-water-filter-fitting-joiner-quick-connect-1-4-6mm-fridge-enviro-aqua', '/water-filters/parts'],
  ['/product/19l-vertical-solar-system-water-pressure-tank-expantion-tank-5-06-gallons', '/pumps-and-tanks/pressure-tanks'],
  ['/product/shower-filter-with-kdf-carbon-great-for-chlorine-skin-allergies-enviro-aqua', '/water-filters/whole-house'],
  ['/product/water-filter-fitting-tee-quick-connect-3-8enviro-aqua', '/water-filters/parts'],
  ['/product/standard-carbon-water-filter-cartridge-coconut-activated-carbon-filter-cto-20-x-2-5-5-micron', '/cartridges/carbon'],
  ['/product/2-x-water-filter-fitting-tee-quick-connect-1-4-tee-6mm-fridge-enviro-aqua', '/water-filters/parts'],
  ['/product/whole-house-water-filter-1-stage-10x2-5-inch-carbon', '/water-filters/whole-house'],
  ['/product/ro-fridge-water-filter-pipe-tube-hose-1-4-6mm-tubing-high-pressure-nsf', '/water-filters/parts'],
  ['/product/complete-bathroom-package-1b-matte-black-watermark-certified-wels-rated', '/plumbing/bundles'],
  ['/product/complete-bathroom-package-1g-brushed-gold-watermark-certified-wels-rated', '/plumbing/bundles'],
  ['/product/12l-vertical-solar-system-water-pressure-tank-expantion-tank-3-2-gallons', '/pumps-and-tanks/pressure-tanks'],
  ['/product/granular-activated-carbon-water-filter-cartridges-gac-20-x-2-5-5-micron', '/cartridges/carbon'],
  ['/product/50m-1-4-6mm-high-pressure-water-filter-tube-reverse-osmosis-tubing', '/water-filters/parts'],
  ['/product/standard-sediment-water-filter-cartridge-polypropylene-pp-10-x-2-5-5-micron', '/cartridges/sediment'],
  ['/product/standard-sediment-water-filter-cartridge-spun-polypropylene-pp-20-x-4-5-5-micron', '/cartridges/sediment'],
  ['/product/10-x-4-5-whole-house-rain-tank-water-filter-5mic-bracket-extra-2-cartridge', '/water-filters/whole-house'],
  ['/product/twin-20-x-4-5-big-blue-whole-house-water-filter-sys-bb-2-cartridges-setbrac', '/water-filters/whole-house'],
  ['/product/twin-pair-water-filter-cartridges-carbon-sediment-5-micron-20x4-5', '/cartridges/cartridge-sets'],
  ['/product/diverter-valve-tap-connector-for-1-4-tube-benchtop-water-filters', '/water-filters/bench-top'],
  ['/product/complete-bathroom-package-2g-brushed-gold-watermark-certified-wels-rated-2', '/plumbing/bundles'],
  ['/product/t33-inline-activated-post-carbon-water-filter-cartridges-10-x-2-5', '/cartridges/specialty-cartridges'],
  ['/product/water-filter-replacement-set-premium-6-stages-5-micron-10', '/cartridges/cartridge-sets'],
  ['/product/10m-1-4-6mm-high-pressure-water-filter-tube-reverse-osmosis-tubing', '/water-filters/parts'],
  ['/product/reverse-osmosis-ro-membrane-400-gpd-approx-1500-litres-per-day', '/cartridges/reverse-osmosis-membranes'],
  ['/product/1-4-inline-ball-valve-push-fit-ro-reverse-osmosis-water-filter', '/water-filters/parts'],
  ['/product/commercial-reverse-osmosis-ro-desalination-plant-ro-1500-lpd-400gpd', '/water-filters/commercial'],
  ['/product/pleated-water-filter-cartridge-10-x-4-5-5-micron', '/cartridges/sediment'],
  ['/product/10-x-4-5-whole-house-rain-tank-water-filter-system-5mic-big-blue-steel-bracket', '/water-filters/whole-house'],
  ['/product/6-stage-ro-75-gpd-reverse-osmosis-water-filter-with-alkaline-filter-s304-tap', '/water-filters/reverse-osmosis'],
  ['/product/2-stages-10-clear-water-filter-1-2-brass-ports-suit-house-caravan-tank-boat', '/water-filters/whole-house'],
  ['/product/5-stage-undersink-home-drinking-ro-water-filter-system-3-way-black-tap', '/water-filters/reverse-osmosis'],
  ['/product/10-x-2-5-single-stage-counter-top-water-filter-system-with-sediment-filter', '/water-filters/bench-top'],
  ['/product/digital-ph-meter-tds-tester-analysis-monitor-for-aquarium-pool-r1bo-2', '/cartridges/specialty-cartridges'],
  ['/product/in-wall-dual-flush-toilet-button-faceplate-rectangular-design-in-black-chrome-gold-nickel', '/plumbing/toilets'],
  ['/product/5-pics-in-line-alkaline-water-filter-ph-neutralising-cartridge-10', '/cartridges/specialty-cartridges'],
  ['/product/5-stage-undersink-home-drinking-reverse-osmosis-ro-water-filter-system-75gpd', '/water-filters/reverse-osmosis'],
  ['/product/poly-spun-water-filter-cartridge-5-micron-sediment-20-x-4-5-whole-house', '/cartridges/sediment'],
  ['/product/10-clear-sediment-water-filter-1-brass-ports-suit-house-caravan-tank-boat', '/water-filters/whole-house'],
  ['/product/10-x-4-5-whole-house-rain-tank-water-filter-system-5mic-big-blue-steel-bracket-2', '/water-filters/whole-house'],
  ['/product/20″-x-4-5″-heavy-duty-water-filter-with-1-bsp-ports-sediment-filter-included', '/water-filters/whole-house'],
  ['/product/alkaline-water-filter', '/cartridges/specialty-cartridges'],
  ['/product/20″-x-4-5″-heavy-duty-water-filter-with-1-bsp-ports-reusable-pleated-filter-included', '/water-filters/whole-house'],
  ['/product/10″-x-4-5″-heavy-duty-two-stage-water-filter-with-1-brass-ports-reusable-pleated-filters-included', '/water-filters/whole-house'],
  ['/product/new-4-x-pleated-water-filter-cartridge-20-x-4-5-5-micron-reusable', '/cartridges/sediment'],
  ['/product/2-stages-undersink-water-filter-system-free-installation', '/water-filters/under-sink'],
  ['/product/twin-counter-top-bench-top-double-drinking-water-filter-systemextra-cartridges', '/water-filters/bench-top'],
  ['/product/twin-undersink-water-filter-systemstainless-stee-tap-extra-replacement-set', '/water-filters/under-sink'],
  ['/product/premium-pair-water-filter-cartridges-5-mic-carbon-5-mic-sediment-10x2-5-2', '/cartridges/cartridge-sets'],
  ['/product/6w-filters-uv-water-sterilizer-filter-220v', '/water-filters/uv-sterilisation'],
  ['/product/bathroom-wall-basin-sink-shower-mixer-tap-faucet-round-chrome-bath-spout-wels', '/plumbing/bathroom-taps'],
  ['/product/10″-x-4-5″-heavy-duty-water-filter-with-1-brass-ports-carbon-filter-included', '/water-filters/whole-house'],
  ['/product/25kg-aqua-aquarium-fish-tank-carbon', '/cartridges/carbon'],
  ['/product/3-stage-whole-house-water-filter-replacement-set-20-x-2-5-5-micron', '/cartridges/cartridge-sets'],
  ['/product/20-x-4-5-whole-house-rain-tank-water-filter-system-5mic-reusablesteel-bracket', '/water-filters/whole-house'],
  ['/product/wall-mounted-toilet-paper-holder-with-cover-polished-chrome', '/plumbing/toilets'],
  ['/product/25-pics-activated-post-carbon-water-filter-5-mic10-smell-remover-t33-inline', '/cartridges/specialty-cartridges'],
  ['/product/gac-carbon-water-filter-10-x-2-5', '/cartridges/carbon'],
  ['/product/10-x-2-5-three-stage-undersink-water-filter-system-with-stainless-steel-tap-sediment-carbon-alkaline', '/water-filters/under-sink'],
  ['/product/2-pics-75gpd-reverse-osmosis-membrane-membrane-replacement-filter-280l-per-day', '/cartridges/reverse-osmosis-membranes'],
  ['/product/5-x-inline-uf-ultrafiltration-filter-cartridge', '/cartridges/specialty-cartridges'],
  ['/product/tall-29cm-round-basin-mixer-tap-matte-black-polished-chrome', '/plumbing/bathroom-taps'],
  // /product/4148 — see /product/4647 comment above. Numeric WP post IDs
  // are 410'd by middleware so we don't soft-404 them to /water-filters.
  ['/product/water-filter-cartridges-0-5-mic-sediment-10x2-5-standard-pp', '/cartridges/sediment'],
  ['/product/complete-bathroom-package-4g-brushed-gold-watermark-certified-wels-rated', '/plumbing/bundles'],
  ['/product/rimless-wash-down-water-closet-commode-p-trap-wc-ceramic-2-piece-toilet-wels', '/plumbing/toilets'],
  ['/product/10″-x-4-5″-heavy-duty-two-stage-water-filter-with-1-brass-ports-sediment-and-carbon-filters-included', '/water-filters/whole-house'],
  ['/product/twin-counter-bench-top-water-filter-system-include-filtersextra-replacement-set', '/water-filters/bench-top'],
  ['/product/10″-x-2-5″-premium-water-filter-with-3-4-brass-ports-carbon-filter-included', '/water-filters/whole-house'],
  ['/product/premium-3-stages-undersink-water-filter-sys-0-01-mic-uf-fittingstapcartridges', '/water-filters/under-sink'],
  ['/product/premium-single-water-filter-system-with-cartridgespanner-caravan-whole-house', '/water-filters/whole-house'],
  ['/product/12cm-bathroom-mixer-tap-in-polished-chrome', '/plumbing/bathroom-taps'],

  // Bathroom subtree products
  ['/bathroom/product/toilet-rimless-modern-watermark-ceramic-p-trap-commode-modern-2piece-toilet-wels', '/plumbing/toilets'],
  ['/bathroom/product/rimless-toilet-suite-back-to-wall-faced-close-soft-close-seat-back-inlet-wels', '/plumbing/toilets'],
  ['/bathroom/product/toilet-rimless-modern-watermark-ceramic-p-trap-commode-modern-2piece-toilet-wels-2', '/plumbing/toilets'],
  ['/bathroom/product/rimless-toilet-suite-back-to-wall-faced-close-soft-close-seat-back-inlet-wels-2', '/plumbing/toilets'],
  ['/bathroom/product/vanity-cabinetceramic-basin-top-wood-wall-mount-pvc-800mmtap-drainage-not-inc', '/plumbing'],
  ['/bathroom/product/brass-durable-kitchen-mixer-tap-360-swivel-sink-faucet-taps-chrome-wels', '/plumbing/kitchen-taps'],
  ['/bathroom/product/115mm-square-tile-insert-100mm-waste-outlet-floor-drain-shower-grate', '/plumbing'],
  ['/bathroom/product/brass-kitchen-mixer-tap-long-swivel-spout-laundry-faucet-sink-taps-chrome-durabl-2', '/plumbing/kitchen-taps'],
  ['/bathroom/product/shower-filter-kdf-carbon-great-for-chlorine-skin-allergies-extra-cartridge', '/water-filters/whole-house'],
  ['/bathroom/product/vanity-cabinetceramic-basin-top-white-wall-hung-pvc-800mmtap-drainage-not-inc', '/plumbing'],
  ['/bathroom/product/in-wall-concealed-cistern-toilet-rimless-floor-mount-pan-chrome-buttons-wels-cer-2', '/plumbing/toilets'],
  ['/bathroom/product/brushed-nickel-pull-out-down-kitchen-tap-swivel-spout-laundry-sink-mixer-2', '/plumbing/kitchen-taps'],
  ['/bathroom/product/rimless-wash-down-water-closet-commode-p-trap-wc-ceramic-2-piece-toilet-wels', '/plumbing/toilets'],
  ['/bathroom/product/in-wall-concealed-cistern-toilet-rimless-floor-mount-pan-chrome-buttons-wels-cer', '/plumbing/toilets'],
  ['/bathroom/product/white-vanity-cabinet-stone-basin-top-pvc-tap-drainage-not-inc900mm-free-sand-2', '/plumbing'],
  ['/bathroom/product/vanity-cabinet-stone-basin-top-pvc-white-tap-drainage-not-inc-1200-mm-f-s-3', '/plumbing'],
  ['/bathroom/product/wels-chrome-round-basin-mixer-bathroom-sink-vanity-faucet-tap-spout', '/plumbing/bathroom-taps'],
  ['/bathroom/product/vanity-cabinet-stone-basin-top-pvc-white-tap-drainage-not-inc-1200-mm-f-s-4', '/plumbing'],
  ['/bathroom/product/vanity-cabinetceramic-basin-top-white-wall-hung-pvc-600mmtap-drainage-not-inc', '/plumbing'],
  ['/bathroom/product/brush-surface-flexible-hose-single-handle-pull-out-kitchen-tap-pull-down-wels', '/plumbing/kitchen-taps'],
  ['/bathroom/product/counter-top-basin-high-quality-modern-luxury-ce-sink-simple-single-hand-wash-art', '/plumbing/bathroom-taps'],
  ['/bathroom/product/rimless-wash-down-water-closet-commode-p-trap-wc-ceramic-2-piece-toilet-wels-2', '/plumbing/toilets'],
  ['/bathroom/product/bathroom-sink-pop-up-waste-overflow-basin-vanity-chrome-push-plug-drain-40mm', '/plumbing/bathroom-taps'],
  ['/bathroom/product/brass-kitchen-mixer-tap-long-swivel-spout-laundry-faucet-sink-taps-chrome-durabl', '/plumbing/kitchen-taps'],
  ['/bathroom/product/ceramic-counter-top-wash-sink-rectangle-glossy-white-50-cm-washbasin-bathroom', '/plumbing/bathroom-taps'],
  ['/bathroom/product/vanity-cabinetceramic-basin-top-wood-wall-hung-pvc-600mmtap-drainage-not-inc-2', '/plumbing'],
  ['/bathroom/product/white-vanity-cabinet-stone-basin-top-pvc-tap-drainage-not-inc900mm-free-sand', '/plumbing'],
  ['/bathroom/product/wels-chrome-round-basin-mixer-bathroom-sink-vanity-faucet-tap-spout-3', '/plumbing/bathroom-taps'],
  ['/bathroom/product/bathroom-wall-basin-sink-shower-mixer-tap-faucet-round-chrome-bath-spout-wels', '/plumbing/bathroom-taps'],
  ['/bathroom/product/brush-surface-flexible-hose-single-handle-pull-out-kitchen-tap-pull-down-wels-2', '/plumbing/kitchen-taps'],
  ['/bathroom/product/brushed-nickel-pull-out-down-kitchen-tap-swivel-spout-laundry-sink-mixer', '/plumbing/kitchen-taps'],
  ['/bathroom/product/chrome-round-basin-mixer-bathroom-sink-vanity-faucet-tap-spout-h-13cm', '/plumbing/bathroom-taps'],
  ['/bathroom/product/vanity-cabinetceramic-basin-top-wood-wall-hung-pvc-600mmtap-drainage-not-inc', '/plumbing'],
  ['/bathroom/product/bathroom-wall-basin-sink-shower-mixer-tap-faucet-square-chrome-bath-spout-wels', '/plumbing/bathroom-taps'],
  ['/bathroom/product/led-oval-bathroom-mirror-smart-makeup-wall-mirror-90cmx60cm', '/plumbing'],
  ['/bathroom/product/led-round-bathroom-mirror-smart-makeup-wall-mirror-100cmx50cm', '/plumbing'],
  ['/bathroom/product/vanity-cabinet-stone-basin-top-pvc-white-tap-drainage-not-inc-1200-mm-f-s', '/plumbing'],
  ['/bathroom/product/wels-chrome-round-basin-mixer-bathroom-sink-vanity-faucet-tap-spout-2', '/plumbing/bathroom-taps'],
  ['/bathroom/product/vanity-cabinetceramic-basin-top-white-wall-hung-pvc-800mmtap-drainage-not-inc-2', '/plumbing'],
  ['/bathroom/product/vanity-cabinetceramic-basin-top-white-wall-hung-pvc-600mmtap-drainage-not-inc-2', '/plumbing'],
  ['/bathroom/product/good-quality-rectangle-vitreous-vessel-bathroom-sink-white', '/plumbing/bathroom-taps'],
  ['/bathroom/product/brass-kitchen-mixer-tap-long-swivel-spout-laundry-faucet-sink-tap-nickel-brushed', '/plumbing/kitchen-taps'],
  ['/bathroom/product/back-to-wall-rimless-dual-flush-ceramic-toilet-suite-soft-close-seat-p-trap-wels-2', '/plumbing/toilets'],
  ['/bathroom/product/vanity-cabinetceramic-basin-top-whit-finish-pvc-tap-drainage-not-inc-60cm-f-s-2', '/plumbing'],
  ['/bathroom/product/led-oval-bathroom-mirror-smart-makeup-wall-mirror-100cmx50cm', '/plumbing'],
  ['/bathroom/product/vanity-cabinetceramic-basin-top-wood-finish-pvc-tap-drainage-not-inc-60cm-f-s-2', '/plumbing'],
  ['/bathroom/product/back-to-wall-rimless-dual-flush-ceramic-toilet-suite-soft-close-seat-p-trap-wels', '/plumbing/toilets'],
  ['/bathroom/product/vanity-cabinetceramic-basin-top-wood-wall-mount-pvc-800mmtap-drainage-not-inc-2', '/plumbing'],
  ['/bathroom/product/bathroom-water-saving-round-shower-set-round-rainfall-head-shower-wels-watermark', '/plumbing/bathroom-taps'],
  ['/bathroom/product/white-vanity-cabinet-stone-basin-top-pvc-tap-drainage-not-inc-900mm-f-s-2', '/plumbing'],
  ['/bathroom/product/black-round-basin-mixer-bathroom-sink-vanity-faucet-tap-spout-h-29cm-2', '/plumbing/bathroom-taps'],
  ['/bathroom/product/vanity-cabinetceramic-basin-top-wood-finish-pvc-tap-drainage-not-inc-60cm-f-s', '/plumbing'],
];

// Product category PLPs (WordPress /product-category/<slug>) plus all
// paginated and faceted variants. Emit a base rule and a wildcard rule
// per category so `/product-category/foo` and `/product-category/foo/page/2`
// both resolve.
const WORDPRESS_CATEGORY_REDIRECTS = [
  ['/product-category/water-filters', '/water-filters'],
  ['/product-category/filter-cartridges', '/cartridges'],
  ['/product-category/whole-house', '/water-filters/whole-house'],
  ['/product-category/bubblers-coolers', '/bubblers-and-coolers'],
  ['/product-category/water-pumps', '/pumps-and-tanks/pumps'],
  ['/product-category/tanks-bladders', '/pumps-and-tanks'],
  ['/product-category/kitchen-taps', '/plumbing/kitchen-taps'],
  ['/product-category/bathroom-taps', '/plumbing/bathroom-taps'],
  ['/product-category/toilets', '/plumbing/toilets'],
  ['/product-category/bundles', '/plumbing/bundles'],
  ['/product-category/fittings-parts', '/water-filters/parts'],
  ['/product-category/installation-packages', '/whole-house-installation-package'],
  ['/product-category/taps', '/plumbing'],
  ['/product-category/basins', '/plumbing/bathroom-taps'],
  ['/product-category/bathroom-accessories', '/plumbing'],
  ['/product-category/cabinets', '/plumbing'],
  ['/product-category/mirrors', '/plumbing'],
  ['/product-category/showers', '/plumbing/bathroom-taps'],
  ['/product-category/plumbing-parts', '/water-filters/parts'],
  ['/product-category/accessories', '/water-filters/parts'],
];

const WORDPRESS_UTILITY_REDIRECTS = [
  ['/our-contacts', '/about'],
  ['/contact', '/about'],
  ['/delivery-return', '/shipping'],
  ['/showroom', '/showroom'],
  ['/privacy-policy', '/privacy'],
  ['/watermark-policy', '/help/watermark-certification-explained'],
  ['/parcel-panel', '/about'],
  ['/promotions', '/water-filters'],
  ['/outlet', '/water-filters'],
  ['/compare', '/water-filters'],
  ['/whole-house-water-filter-australia', '/use/whole-home-filtration'],
  ['/water-bubblers', '/bubblers-and-coolers/bubblers'],
  ['/whole-house', '/water-filters/whole-house'],
  ['/chemical-tanks', '/pumps-and-tanks/dosing-tanks'],
  ['/watermark-certified-commercial-water-bubblers-wholesale-pricing-australia-wide', '/use/commercial-and-cafe'],
  ['/home-fashion', '/'],
  ['/about-us', '/about'],
  ['/about', '/about'],
  ['/shop', '/water-filters'],
  // /author/steve had 5 clicks at position 8.7 — likely searches for
  // "Steve" looking for a person to talk to. 301 to /about (not /contact:
  // the WP /contact rule above already redirects to /about, so going via
  // /contact would be a chained hop). Without this rule, middleware.ts
  // would 410 the URL — for 5 clicks of likely user intent, a 301 wins.
  ['/author/steve', '/about'],
  // /bathroom was the legacy section landing — map to the closest new
  // section. /bathroom/<unknown-path> (other than the /bathroom/product
  // slug mappings handled above) falls through to middleware 410, since
  // a category-level catch-all there would soft-404 (Fix 8).
  ['/bathroom', '/plumbing'],
];

// Pattern catch-alls. These run LAST, after every explicit rule above
// has failed to match.
//
// SEO audit 2026-05 (Fix 8): we previously had `/product/:slug*` ->
// `/water-filters` and `/bathroom/product/:slug*` -> `/plumbing` here
// as a safety net. That makes every unmapped legacy URL resolve 200 on
// the closest category landing — i.e. a classic soft-404. Google
// treats soft-404s as duplicate signals on the destination PLP, which
// dilutes that PLP's relevance and keeps the source URL in the index
// indefinitely. We've removed those wildcards so unmapped legacy
// /product/* and /bathroom/* URLs fall through to middleware.ts and
// return a real 410 Gone, which is the correct migration signal.
//
// The /shop/:path*, /my-account, /checkout/* wildcards stay: shop and
// account/checkout landing pages don't dilute a PLP because the
// destination is the same /water-filters hub that every WordPress
// shop entry-point pointed at. Numeric /product/<id>/ URLs (the
// soft-404 example flagged in the audit, e.g. /product/4647) are
// 410'd by middleware.ts via GONE_PREFIXES.
const WORDPRESS_FALLBACK_REDIRECTS = [
  { source: '/shop/:path*', destination: '/water-filters', permanent: true },
  { source: '/my-account', destination: '/water-filters', permanent: true },
  { source: '/my-account/:path*', destination: '/water-filters', permanent: true },
  { source: '/checkout', destination: '/water-filters', permanent: true },
  { source: '/checkout/:path*', destination: '/water-filters', permanent: true },
  // WooCommerce colour attribute archive (/colour/<attr>/, plus paginated
  // variants). 7 URLs, ~1 click total — not worth per-attribute precision.
  // Without this rule, middleware.ts would 410 the URLs; the redirect runs
  // first per Next's order so the colour entry in middleware is harmless
  // but dead.
  { source: '/colour/:slug*', destination: '/water-filters', permanent: true },
];

// Expand [source, destination] tuples into a flat array of redirect
// objects with /path and /path/ source variants, slashless destination.
// For /product/<slug>/ and /bathroom/product/<slug>/ sources whose
// destination is a category PLP, auto-upgrade to the specific product
// path when the slug exists in products.json (Fix 3, 2026-05).
function withSlashVariants(tuples) {
  const out = [];
  for (const [source, rawDestination] of tuples) {
    const destination = maybeUpgradeProductDestination(source, rawDestination);
    if (source !== destination) {
      out.push({ source, destination, permanent: true });
    }
    out.push({ source: `${source}/`, destination, permanent: true });
  }
  return out;
}

// Expand category rules: emit both the base path and a `:path*` wildcard
// that catches paginated and faceted variants.
function expandCategoryRules(tuples) {
  const out = [];
  for (const [source, destination] of tuples) {
    out.push({ source, destination, permanent: true });
    out.push({ source: `${source}/:path*`, destination, permanent: true });
  }
  return out;
}

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

    // Phase 2 (2026-05) WordPress migration map. Order matters: explicit
    // product slugs first, then category PLPs (with paginated wildcards),
    // then utility pages, then the catch-all fallback wildcards last so
    // an unmapped /product/foo lands on /water-filters instead of 404.
    rules.push(...withSlashVariants(WORDPRESS_PRODUCT_REDIRECTS));
    rules.push(...expandCategoryRules(WORDPRESS_CATEGORY_REDIRECTS));
    rules.push(...withSlashVariants(WORDPRESS_UTILITY_REDIRECTS));
    rules.push(...WORDPRESS_FALLBACK_REDIRECTS);

    return rules;
  },
};

module.exports = nextConfig;
