import { CircleHelp, MapPin, PackageCheck } from 'lucide-react';

interface BrandTrustStripProps {
  category: string;
  subcategory?: string;
}

interface TrustItem {
  heading: string;
  body: string;
}

const CATEGORY_TRUST: Record<string, ReadonlyArray<TrustItem>> = {
  'water-filters': [
    {
      heading: 'Australian-owned',
      body: 'Real Wyong NSW warehouse and showroom, with local product support.',
    },
    {
      heading: 'Replacement support',
      body: 'We stock replacement cartridges and consumables for the filtration systems we sell.',
    },
    {
      heading: 'Clear technical information',
      body: 'Stages, connections, filtration targets and installation requirements are listed before you buy.',
    },
  ],
  cartridges: [
    {
      heading: 'Australian-owned',
      body: 'Real Wyong NSW warehouse and showroom, with local product support.',
    },
    {
      heading: 'Compatibility first',
      body: 'Cartridge size, format and intended use are shown clearly so you can match the right replacement.',
    },
    {
      heading: 'Standard replacement formats',
      body: 'Our range focuses on widely used cartridge formats rather than locking you into one replacement source.',
    },
  ],
  'bubblers-and-coolers': [
    {
      heading: 'Australian-owned',
      body: 'Real Wyong NSW warehouse and showroom, with local product support.',
    },
    {
      heading: 'Commercial product support',
      body: 'We can help with model selection, replacement filters and service-related product questions.',
    },
    {
      heading: 'Clear installation details',
      body: 'Connection, cooling and compliance information is shown on the product page where applicable.',
    },
  ],
  'pumps-and-tanks': [
    {
      heading: 'Australian-owned',
      body: 'Real Wyong NSW warehouse and showroom, with local product support.',
    },
    {
      heading: 'Technical sizing information',
      body: 'Capacity, connection and application details are listed to help you choose the correct component.',
    },
    {
      heading: 'Replacement components',
      body: 'Compatible accessories and service parts are surfaced where they are relevant to the product.',
    },
  ],
  plumbing: [
    {
      heading: 'Australian-owned',
      body: 'Real Wyong NSW warehouse and showroom, with local product support.',
    },
    {
      heading: 'Compatibility made clear',
      body: 'Connections, dimensions, finishes and installation requirements are listed before purchase.',
    },
    {
      heading: 'Compliance details',
      body: 'WaterMark and WELS information is shown where it applies to the specific product.',
    },
  ],
};

const DEFAULT_TRUST: ReadonlyArray<TrustItem> = [
  {
    heading: 'Australian-owned',
    body: 'Real Wyong NSW warehouse and showroom, with local product support.',
  },
  {
    heading: 'Specialist support',
    body: 'Product information and compatibility guidance are available before and after purchase.',
  },
  {
    heading: 'Clear product information',
    body: 'Key specifications and installation details are listed on the product page.',
  },
];

const ICONS = [MapPin, PackageCheck, CircleHelp] as const;

export function BrandTrustStrip({
  category,
}: BrandTrustStripProps) {
  const items = CATEGORY_TRUST[category] ?? DEFAULT_TRUST;

  return (
    <section
      aria-label="Why buy from Enviro Aqua"
      className="mt-12 border-t border-gray-100 pt-6"
    >
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
        {items.map((item, index) => {
          const Icon = ICONS[index] ?? CircleHelp;
          return (
            <li key={item.heading} className="flex items-start gap-3 text-sm">
              <Icon
                className="h-4 w-4 mt-1 flex-shrink-0 text-brand-blue"
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold text-black">{item.heading}</p>
                <p className="mt-0.5 text-black/70 leading-snug">
                  {item.body}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
