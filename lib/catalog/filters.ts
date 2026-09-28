export interface CatalogFilterOption {
  value: string;
  label: string;
  query: string;
}

export interface CatalogFilterGroup {
  id: string;
  param: string;
  label: string;
  multiple: boolean;
  options: ReadonlyArray<CatalogFilterOption>;
}

export type CatalogFilterState = Record<string, ReadonlyArray<string>>;

const NEED_OPTIONS: ReadonlyArray<CatalogFilterOption> = [
  {
    value: 'chlorine-and-taste',
    label: 'Chlorine & taste',
    query: "tag:'problem:chlorine-and-taste'",
  },
  {
    value: 'sediment-and-rust',
    label: 'Sediment & rust',
    query: "tag:'problem:sediment-and-rust'",
  },
  {
    value: 'fluoride-removal',
    label: 'Fluoride',
    query: "tag:'problem:fluoride-removal'",
  },
  {
    value: 'bacteria-and-pathogens',
    label: 'Bacteria & pathogens',
    query: "tag:'problem:bacteria-and-pathogens'",
  },
  {
    value: 'hard-water-and-scale',
    label: 'Hard water & scale',
    query: "tag:'problem:hard-water-and-scale'",
  },
];

const USE_OPTIONS: ReadonlyArray<CatalogFilterOption> = [
  {
    value: 'home-drinking-water',
    label: 'Home drinking water',
    query: "tag:'use:home-drinking-water'",
  },
  {
    value: 'whole-home-filtration',
    label: 'Whole home',
    query: "tag:'use:whole-home-filtration'",
  },
  {
    value: 'rural-tank-water',
    label: 'Rain / tank water',
    query: "tag:'use:rural-tank-water'",
  },
  {
    value: 'commercial-and-cafe',
    label: 'Commercial',
    query: "tag:'use:commercial-and-cafe'",
  },
];

const PRICE_OPTIONS: ReadonlyArray<CatalogFilterOption> = [
  {
    value: 'under-100',
    label: 'Under $100',
    query: 'variants.price:<100',
  },
  {
    value: '100-250',
    label: '$100–$250',
    query: 'variants.price:>=100 AND variants.price:<=250',
  },
  {
    value: '250-500',
    label: '$250–$500',
    query: 'variants.price:>250 AND variants.price:<=500',
  },
  {
    value: '500-1000',
    label: '$500–$1,000',
    query: 'variants.price:>500 AND variants.price:<=1000',
  },
  {
    value: '1000-plus',
    label: '$1,000+',
    query: 'variants.price:>1000',
  },
];

const WATER_FILTER_SYSTEMS: ReadonlyArray<CatalogFilterOption> = [
  { value: 'under-sink', label: 'Under sink', query: "tag:'sub-cat:under-sink'" },
  {
    value: 'reverse-osmosis',
    label: 'Reverse osmosis',
    query: "tag:'sub-cat:reverse-osmosis'",
  },
  {
    value: 'whole-house',
    label: 'Whole house',
    query: "tag:'sub-cat:whole-house'",
  },
  {
    value: 'uv-sterilisation',
    label: 'UV sterilisation',
    query: "tag:'sub-cat:uv-sterilisation'",
  },
  { value: 'bench-top', label: 'Bench top', query: "tag:'sub-cat:bench-top'" },
  { value: 'commercial', label: 'Commercial', query: "tag:'sub-cat:commercial'" },
];

const CATEGORY_SYSTEM_OPTIONS: Record<string, ReadonlyArray<CatalogFilterOption>> = {
  'water-filters': WATER_FILTER_SYSTEMS,
  cartridges: [
    {
      value: 'sediment',
      label: 'Sediment',
      query: "tag:'facet:cartridge-sediment'",
    },
    {
      value: 'carbon',
      label: 'Carbon',
      query: "tag:'facet:cartridge-carbon'",
    },
    {
      value: 'reverse-osmosis-membranes',
      label: 'RO membranes',
      query: "tag:'facet:cartridge-ro-membrane'",
    },
    {
      value: 'specialty-cartridges',
      label: 'Specialty',
      query: "tag:'facet:cartridge-specialty'",
    },
    {
      value: 'cartridge-sets',
      label: 'Cartridge sets',
      query: "tag:'facet:cartridge-set'",
    },
  ],
  'bubblers-and-coolers': [
    { value: 'bubblers', label: 'Bubblers', query: "tag:'sub-cat:bubblers'" },
    {
      value: 'coolers-and-chillers',
      label: 'Coolers & chillers',
      query: "tag:'sub-cat:coolers-and-chillers'",
    },
    { value: 'parts', label: 'Parts', query: "tag:'sub-cat:parts'" },
  ],
  'pumps-and-tanks': [
    { value: 'pumps', label: 'Pumps', query: "tag:'sub-cat:pumps'" },
    {
      value: 'pressure-tanks',
      label: 'Pressure tanks',
      query: "tag:'sub-cat:pressure-tanks'",
    },
    {
      value: 'dosing-tanks',
      label: 'Dosing tanks',
      query: "tag:'sub-cat:dosing-tanks'",
    },
  ],
  plumbing: [
    {
      value: 'kitchen-taps',
      label: 'Kitchen taps',
      query: "(tag:'sub-cat:kitchen-taps' OR tag:'sub-cat:ro-filter-taps')",
    },
    {
      value: 'bathroom-taps',
      label: 'Bathroom taps',
      query: "tag:'sub-cat:bathroom-taps'",
    },
    {
      value: 'ro-filter-taps',
      label: 'Filtered / RO taps',
      query: "tag:'sub-cat:ro-filter-taps'",
    },
    { value: 'toilets', label: 'Toilets', query: "tag:'sub-cat:toilets'" },
    { value: 'bundles', label: 'Bundles', query: "tag:'sub-cat:bundles'" },
    { value: 'parts', label: 'Parts', query: "tag:'sub-cat:parts'" },
  ],
};

export function getCatalogFilterGroups(
  category: string,
  activeSubcategory?: string | null,
): ReadonlyArray<CatalogFilterGroup> {
  const groups: CatalogFilterGroup[] = [];

  if (!activeSubcategory && CATEGORY_SYSTEM_OPTIONS[category]) {
    groups.push({
      id: 'system',
      param: 'system',
      label:
        category === 'plumbing'
          ? 'Product type'
          : category === 'cartridges'
            ? 'Cartridge type'
            : 'System type',
      multiple: true,
      options: CATEGORY_SYSTEM_OPTIONS[category],
    });
  }

  if (category === 'water-filters' || category === 'cartridges') {
    groups.push({
      id: 'need',
      param: 'need',
      label: 'What do you want to improve?',
      multiple: true,
      options: NEED_OPTIONS,
    });
  }

  if (
    category === 'water-filters' ||
    category === 'bubblers-and-coolers' ||
    category === 'pumps-and-tanks'
  ) {
    groups.push({
      id: 'use',
      param: 'use',
      label: 'Where will you use it?',
      multiple: true,
      options: USE_OPTIONS,
    });
  }

  if (category === 'water-filters' || category === 'bubblers-and-coolers') {
    groups.push({
      id: 'certification',
      param: 'cert',
      label: 'Certification',
      multiple: true,
      options: [
        {
          value: 'watermark',
          label: 'WaterMark certified',
          query: "tag:'cert:watermark'",
        },
      ],
    });
  }

  groups.push({
    id: 'price',
    param: 'price',
    label: 'Price',
    multiple: false,
    options: PRICE_OPTIONS,
  });

  return groups;
}

export function parseCatalogFilterState(
  searchParams: Record<string, string | string[] | undefined>,
  groups: ReadonlyArray<CatalogFilterGroup>,
): CatalogFilterState {
  const state: Record<string, ReadonlyArray<string>> = {};

  for (const group of groups) {
    const raw = searchParams[group.param];
    const joined = Array.isArray(raw) ? raw.join(',') : raw;
    if (!joined) continue;

    const allowed = new Set(group.options.map((option) => option.value));
    const values = joined
      .split(',')
      .map((value) => value.trim())
      .filter((value) => allowed.has(value));

    if (values.length > 0) {
      state[group.id] = group.multiple ? values : values.slice(0, 1);
    }
  }

  return state;
}

export function buildCatalogQuery(
  baseQuery: string,
  groups: ReadonlyArray<CatalogFilterGroup>,
  state: CatalogFilterState,
): string {
  const clauses: string[] = [baseQuery];

  for (const group of groups) {
    const selected = state[group.id] ?? [];
    if (selected.length === 0) continue;

    const queries = selected
      .map((value) => group.options.find((option) => option.value === value)?.query)
      .filter((query): query is string => Boolean(query));

    if (queries.length === 0) continue;

    if (group.multiple && queries.length > 1) {
      clauses.push(`(${queries.join(' OR ')})`);
    } else {
      clauses.push(`(${queries[0]})`);
    }
  }

  return clauses.join(' AND ');
}

export function hasCatalogFilters(state: CatalogFilterState): boolean {
  return Object.values(state).some((values) => values.length > 0);
}
