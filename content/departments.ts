/**
 * Customer-facing shopping departments. Existing catalogue URLs are preserved:
 * a department changes navigation, not canonical product taxonomy.
 */
export interface DepartmentLink {
  label: string;
  href: string;
  children?: ReadonlyArray<{ label: string; href: string }>;
}

export type DepartmentId = 'water' | 'bathroom';

export const DEPARTMENTS: Record<DepartmentId, {
  label: string;
  href: string;
  links: ReadonlyArray<DepartmentLink>;
}> = {
  water: {
    label: 'Water Filtration',
    href: '/',
    links: [
      { label: 'Water Filters', href: '/water-filters/', children: [
        { label: 'Under Sink', href: '/water-filters/under-sink/' },
        { label: 'Whole House', href: '/water-filters/whole-house/' },
        { label: 'Reverse Osmosis', href: '/water-filters/reverse-osmosis/' },
        { label: 'UV Sterilisation', href: '/water-filters/uv-sterilisation/' },
        { label: 'Bench Top', href: '/water-filters/bench-top/' },
        { label: 'Commercial', href: '/water-filters/commercial/' },
        { label: 'Parts & Fittings', href: '/plumbing/parts/' },
      ] },
      { label: 'Cartridges', href: '/cartridges/', children: [
        { label: 'Sediment Cartridges', href: '/cartridges/sediment/' },
        { label: 'Carbon Cartridges', href: '/cartridges/carbon/' },
        { label: 'RO Membranes', href: '/cartridges/reverse-osmosis-membranes/' },
        { label: 'Specialty Cartridges', href: '/cartridges/specialty-cartridges/' },
        { label: 'Cartridge Sets', href: '/cartridges/cartridge-sets/' },
      ] },
      { label: 'Fountains & Coolers', href: '/bubblers-and-coolers/', children: [
        { label: 'Drinking Fountains', href: '/bubblers-and-coolers/bubblers/' },
        { label: 'Coolers & Chillers', href: '/bubblers-and-coolers/coolers-and-chillers/' },
      ] },
      { label: 'Tanks & Bunds', href: '/tanks-and-bunds/', children: [
        { label: 'Chemical Dosing Tanks', href: '/tanks-and-bunds/chemical-dosing-tanks/' },
        { label: 'Chemical Bunds', href: '/tanks-and-bunds/chemical-bunds/' },
        { label: 'Tank & Bund Packages', href: '/tanks-and-bunds/tank-and-bund-packages/' },
      ] },
      { label: 'Taps', href: '/plumbing/ro-filter-taps/' },
    ],
  },
  bathroom: {
    label: 'Bathroom Supplies',
    href: '/bathroom/',
    links: [
      { label: 'Toilets', href: '/plumbing/toilets/' },
      { label: 'Bathroom Tapware', href: '/plumbing/bathroom-taps/' },
      { label: 'Kitchen Tapware', href: '/plumbing/kitchen-taps/' },
      { label: 'Bathroom Packages', href: '/plumbing/bundles/' },
    ],
  },
};


/** Presentation-only groupings. All links retain their existing canonical URLs. */
export const MEGA_MENU_GROUPS: Record<string, ReadonlyArray<{
  heading: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}>> = {
  '/water-filters/': [
    { heading: 'Home Filtration', links: [
      { label: 'Under Sink', href: '/water-filters/under-sink/' },
      { label: 'Whole House', href: '/water-filters/whole-house/' },
      { label: 'Reverse Osmosis', href: '/water-filters/reverse-osmosis/' },
      { label: 'Bench Top', href: '/water-filters/bench-top/' },
    ] },
    { heading: 'Specialised Filtration', links: [
      { label: 'UV Sterilisation', href: '/water-filters/uv-sterilisation/' },
      { label: 'Commercial', href: '/water-filters/commercial/' },
    ] },
    { heading: 'Parts & Accessories', links: [
      { label: 'Parts & Fittings', href: '/plumbing/parts/' },
    ] },
  ],
  '/cartridges/': [
    { heading: 'Filter Cartridges', links: [
      { label: 'Sediment', href: '/cartridges/sediment/' },
      { label: 'Carbon', href: '/cartridges/carbon/' },
      { label: 'Specialty', href: '/cartridges/specialty-cartridges/' },
    ] },
    { heading: 'Reverse Osmosis', links: [
      { label: 'RO Membranes', href: '/cartridges/reverse-osmosis-membranes/' },
    ] },
    { heading: 'Cartridge Sets', links: [
      { label: 'Replacement Sets', href: '/cartridges/cartridge-sets/' },
    ] },
  ],
  '/bubblers-and-coolers/': [
    { heading: 'Drinking Fountains', links: [
      { label: 'Shop Drinking Fountains', href: '/bubblers-and-coolers/bubblers/' },
    ] },
    { heading: 'Coolers & Chillers', links: [
      { label: 'Shop Coolers & Chillers', href: '/bubblers-and-coolers/coolers-and-chillers/' },
    ] },
  ],
  '/tanks-and-bunds/': [
    { heading: 'Dosing Tanks', links: [
      { label: 'Chemical Dosing Tanks', href: '/tanks-and-bunds/chemical-dosing-tanks/' },
    ] },
    { heading: 'Bunds', links: [
      { label: 'Chemical Bunds', href: '/tanks-and-bunds/chemical-bunds/' },
    ] },
    { heading: 'Packages', links: [
      { label: 'Tank & Bund Packages', href: '/tanks-and-bunds/tank-and-bund-packages/' },
    ] },
  ],
};

/** Canonical legacy plumbing paths still belong to their proper department. */
export function departmentForPath(pathname: string): DepartmentId {
  const path = pathname.toLowerCase();
  if (path === '/bathroom' || path.startsWith('/bathroom/')) return 'bathroom';
  if (
    path.startsWith('/plumbing/toilets') ||
    path.startsWith('/plumbing/bathroom-taps') ||
    path.startsWith('/plumbing/kitchen-taps') ||
    path.startsWith('/plumbing/bundles')
  ) return 'bathroom';
  return 'water';
}
