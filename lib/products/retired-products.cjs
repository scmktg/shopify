// Retired pressure vessels and replacement bladders. The 12L RO holding tank is NOT retired.
// Keep handles here until the Shopify catalogue retirement is finished.
const RETIRED_PRODUCT_HANDLES = Object.freeze([
  "100l-vertical-solar-system-water-pressure-tank-expansion-tank-with-legs",
  "12l-vertical-solar-system-water-pressure-tank-expantion-tank-3-2-gallons",
  "19l-vertical-solar-system-water-pressure-tank-expantion-tank-5-06-gallons",
  "bladder-for-100l-pressure-water-tank-drinking-water-compatible-made-in-italy",
  "bladder-for-12l-pressure-water-tank-drinking-water-compatible-made-in-italy",
  "bladder-for-19l-pressure-water-tank-drinking-water-compatible-made-in-italy",
  "bladder-for-50l-pressure-water-tank-drinking-water-compatible-made-in-italy",
  "bladder-for-8l-pressure-water-tank-drinking-water-compatible-made-in-italy",
  "water-pressure-tank-vessel-50l-steel-drinking-water-compatible-bladder-almond"
]);
const RETIRED_PRODUCT_HANDLE_SET = new Set(RETIRED_PRODUCT_HANDLES);
function isRetiredProductHandle(handle) { return RETIRED_PRODUCT_HANDLE_SET.has(handle); }
module.exports = { RETIRED_PRODUCT_HANDLES, isRetiredProductHandle };
