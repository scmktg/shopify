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


/** Presentation-only groupings. Paths remain canonical existing collection URLs. */
export const MEGA_MENU_GROUPS: Record<string, ReadonlyArray<{
  heading: string;
  description: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}>> = {
  '/water-filters/': [
    { heading: 'Home Filtration', description: 'Find the right system for your home', links: [
      { label: 'Under Sink', href: '/water-filters/under-sink/' },
      { label: 'Whole House', href: '/water-filters/whole-house/' },
      { label: 'Reverse Osmosis', href: '/water-filters/reverse-osmosis/' },
      { label: 'Bench Top', href: '/water-filters/bench-top/' },
    ] },
    { heading: 'Specialised Filtration', description: 'For advanced treatment needs', links: [
      { label: 'UV Sterilisation', href: '/water-filters/uv-sterilisation/' },
      { label: 'Commercial', href: '/water-filters/commercial/' },
    ] },
    { heading: 'Parts & Accessories', description: 'Maintain and install your system', links: [
      { label: 'Parts & Fittings', href: '/plumbing/parts/' },
    ] },
  ],
  '/cartridges/': [
    { heading: 'Shop by Filter Type', description: 'Replacement media for your system', links: [
      { label: 'Sediment Cartridges', href: '/cartridges/sediment/' },
      { label: 'Carbon Cartridges', href: '/cartridges/carbon/' },
      { label: 'Specialty Cartridges', href: '/cartridges/specialty-cartridges/' },
    ] },
    { heading: 'Reverse Osmosis', description: 'Membranes for RO filtration', links: [
      { label: 'RO Membranes', href: '/cartridges/reverse-osmosis-membranes/' },
    ] },
    { heading: 'Replacement Sets', description: 'Replace multiple stages together', links: [
      { label: 'Cartridge Sets', href: '/cartridges/cartridge-sets/' },
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
