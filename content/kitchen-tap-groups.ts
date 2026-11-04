/**
 * Customer-facing Kitchen Taps groupings. These groupings do not change any
 * Shopify product tags or existing canonical product URLs.
 *
 * A multifunction three-way mixer can appear in Pull Down & Spray Taps too.
 */
export const KITCHEN_TAP_GROUPS = [
  { value: 'three-way-filter-mixers', label: 'Three Way Filter Mixers' },
  { value: 'pull-down-spray-taps', label: 'Pull Down & Spray Taps' },
  { value: 'dedicated-filter-taps', label: 'Dedicated Filter Taps' },
] as const;

export type KitchenTapGroup = (typeof KITCHEN_TAP_GROUPS)[number]['value'];

export const KITCHEN_TAP_GROUP_HANDLES: Record<KitchenTapGroup, ReadonlyArray<string>> = {
  'three-way-filter-mixers': [
    '3-way-filtered-kitchen-tap-for-ro-water-filters-mixer-in-black-nickel-gold-and-c',
    '3-way-pull-down-spray-tap-kitchen-mixer-in-black-chrome-and-nickel',
    'luxurious-3-way-tap-for-ro-water-filters-kitchen-mixer-in-black-or-nickel',
    'spring-loaded-3-way-ro-tap-kitchen-mixer-in-black-chrome-and-nickel',
    'sembowell-pull-out-3way-kitchen-mixer-wels-rated-watermark-certified-aus',
  ],
  'pull-down-spray-taps': [
    '3-way-pull-down-spray-tap-kitchen-mixer-in-black-chrome-and-nickel',
    'spring-loaded-3-way-ro-tap-kitchen-mixer-in-black-chrome-and-nickel',
    'sembowell-pull-out-3way-kitchen-mixer-wels-rated-watermark-certified-aus',
    'spring-loaded-tap-kitchen-mixer-in-brushed-nickel',
    'tall-spring-loaded-kitchen-mixer-with-pull-out-spray-in-polished-chrome',
    'pull-down-modern-kitchen-tap-mixer-in-brushed-nickel',
    'pull-down-spray-tap-kitchen-mixer-in-brushed-nickel',
  ],
  'dedicated-filter-taps': [
    'double-handle-reverse-osmosis-water-filter-tap-ro-kitchen-faucet-in-chrome',
    'premium-ro-filter-tap-sus304-nsf-approved-in-black-nickel-and-gold',
    'premium-water-filter-faucet-tap-reverse-osmosis-drinking-ro-nsf',
  ],
};

export function isKitchenTapGroup(value: string | undefined): value is KitchenTapGroup {
  return KITCHEN_TAP_GROUPS.some((group) => group.value === value);
}

export function getKitchenTapGroupLabel(value: KitchenTapGroup): string {
  return KITCHEN_TAP_GROUPS.find((group) => group.value === value)?.label ?? 'Kitchen Taps';
}
