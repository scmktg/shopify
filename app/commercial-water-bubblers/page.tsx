import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Building2,
  Check,
  Droplet,
  Dumbbell,
  Factory,
  GraduationCap,
  Mail,
  Minus,
  Phone,
  ShieldCheck,
  Truck,
  Wrench,
} from 'lucide-react';
import { BUSINESS_INFO } from '@/content/business-info';
import { Breadcrumbs } from '@/components/editorial/Breadcrumbs';
import { FaqAccordion } from '@/components/editorial/FaqAccordion';
import { WatermarkBadge, LeadFreeBadge } from '@/components/product/WatermarkBadge';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import { getProductUrl } from '@/lib/utils/productUrl';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import {
  breadcrumbSchema,
  collectionSchema,
  faqPageSchema,
  productListSchema,
} from '@/lib/seo/jsonld';
import type { Product } from '@/types/product';

export const revalidate = 3600;

const PATH = '/commercial-water-bubblers';

type CabinetKey = 'round' | 'square' | 'hdpe';

interface CabinetSpec {
  key: CabinetKey;
  handle: string;
  shortName: string;
  tagline: string;
  badge: string;
  highlights: ReadonlyArray<string>;
}

const CABINETS: ReadonlyArray<CabinetSpec> = [
  {
    key: 'round',
    handle: 'commercial-stainless-steel-filtered-cold-water-bubbler-round-wm',
    shortName: 'Round Stainless',
    tagline: 'Round 304 stainless steel cabinet with direct mains connection and integrated filtration.',
    badge: 'Stainless',
    highlights: ['304 stainless', 'Filtered', 'Direct mains', 'WaterMark'],
  },
  {
    key: 'square',
    handle:
      'commercial-water-bubbler-filtered-stainless-steel-watermark-certified-square-des',
    shortName: 'Square Stainless',
    tagline: 'Flat-sided stainless cabinet with bubbler spout and side tap.',
    badge: 'Bottle fill',
    highlights: ['20 L/hr', '8–12 °C', 'Side tap', 'WaterMark'],
  },
  {
    key: 'hdpe',
    handle: 'commercial-rust-free-filtered-cold-water-bubbler-wm',
    shortName: 'HDPE Granite',
    tagline: 'Rust-free HDPE cabinet with chilled, filtered drinking water.',
    badge: 'Rust-free',
    highlights: ['20 L/hr', '8–12 °C', 'Rust-free', 'WaterMark'],
  },
];

interface SpecRow {
  label: string;
  values: Record<CabinetKey, string>;
  yes?: Partial<Record<CabinetKey, boolean>>;
}

const SPEC_ROWS: ReadonlyArray<SpecRow> = [
  {
    label: 'Cabinet material',
    values: {
      round: '304 stainless steel',
      square: 'SUS304 stainless steel',
      hdpe: 'HDPE polymer',
    },
  },
  {
    label: 'Profile',
    values: {
      round: 'Cylindrical',
      square: 'Square / flat-sided',
      hdpe: 'Tapered, granite-look',
    },
  },
  {
    label: 'Height',
    values: { round: 'Not published', square: '99 cm', hdpe: '122 cm' },
  },
  {
    label: 'Footprint',
    values: { round: 'Not published', square: '30 × 30 cm', hdpe: '41 × 41 cm' },
  },
  {
    label: 'Cooling capacity',
    values: { round: 'Not published', square: '20 L/hr', hdpe: '20 L/hr' },
  },
  {
    label: 'Chilled water temperature',
    values: { round: 'Not published', square: '8–12 °C', hdpe: '8–12 °C' },
  },
  {
    label: 'Filtration',
    values: {
      round: 'Integrated filtration cartridge',
      square: 'Sediment + activated carbon',
      hdpe: 'PP sediment + activated carbon',
    },
  },
  {
    label: 'Bottle / glass fill side tap',
    values: { round: '—', square: 'Yes', hdpe: 'Yes' },
    yes: { square: true, hdpe: true },
  },
  {
    label: 'WaterMark certified',
    values: {
      round: 'Yes · licence 23484',
      square: 'Yes · licence 23484',
      hdpe: 'Yes · licence 23484',
    },
    yes: { round: true, square: true, hdpe: true },
  },
  {
    label: 'Lead free',
    values: { round: 'Yes', square: 'Yes', hdpe: 'Yes' },
    yes: { round: true, square: true, hdpe: true },
  },
  {
    label: 'Location',
    values: {
      round: 'Commercial / institutional',
      square: 'Commercial / institutional',
      hdpe: 'Commercial / institutional',
    },
  },
  {
    label: 'Best fit',
    values: {
      round: 'Offices · foyers · workshops',
      square: 'Schools · offices · gyms',
      hdpe: 'Schoolyards · factories · sports facilities',
    },
  },
];

const FAQ_ITEMS = [
  {
    q: 'What is a commercial water bubbler?',
    a: 'A commercial water bubbler is a mains-connected drinking-water unit designed for frequent shared use in places such as schools, offices, factories, gyms and public facilities. A chilled model cools the incoming water and dispenses it through a bubbler spout; filtered models also treat the water before dispensing.',
  },
  {
    q: 'What is the difference between a water bubbler and a drinking fountain?',
    a: 'In Australia, “water bubbler” and “drinking fountain” are often used for the same type of fixture. “Bubbler” usually refers to the upward drinking spout, while “drinking fountain” can describe the complete fixture. Some commercial units also include a separate bottle or glass-filling tap.',
  },
  {
    q: 'What is the difference between a water bubbler and a water cooler?',
    a: 'A bubbler lets a person drink directly from an upward-flowing spout. A water cooler usually dispenses into a cup or bottle. Commercial mains-connected units can combine both functions, so the best choice depends on how people will use the station.',
  },
  {
    q: 'Do commercial water bubblers need WaterMark certification in Australia?',
    a: 'WaterMark requirements depend on the product type and its intended plumbing application. The National Construction Code requires product types listed on the WaterMark Schedule of Products to be WaterMark certified before installation. All three commercial bubblers in this Enviro Aqua range are WaterMark certified under licence 23484.',
  },
  {
    q: 'Who should install a mains-connected water bubbler?',
    a: 'Use an appropriately licensed plumbing practitioner for the mains-water connection and any drainage work required by the installation. Your plumber should also confirm local plumbing requirements for the site before installation.',
  },
  {
    q: 'How much cooling capacity does a commercial water bubbler need?',
    a: 'Cooling capacity is measured in litres per hour, but the right capacity depends on peak demand rather than just the total number of people at a site. The square stainless and rust-free HDPE Enviro Aqua models are verified at 20 L/hr. The round stainless model’s capacity is not published here until model-specific documentation is confirmed. For unusually high peak demand or multiple simultaneous users, consider more than one station rather than relying on a single unit.',
  },
  {
    q: 'Are these water bubblers filtered?',
    a: 'Yes. All three models include filtration. The square stainless model uses sediment plus activated carbon, the rust-free HDPE model uses PP sediment plus activated carbon, and the round stainless model has an integrated filtration cartridge.',
  },
  {
    q: 'Which water bubbler is best where a rust-free outer cabinet matters?',
    a: 'Choose the HDPE granite-look model where you specifically want a rust-free outer cabinet. Confirm the actual site conditions, drainage, power and plumbing access before ordering rather than assuming cabinet material alone determines location suitability.',
  },
  {
    q: 'How often should a commercial water bubbler filter be changed?',
    a: 'Filter life depends on water quality and usage. Inspect and replace filters as part of a planned maintenance schedule rather than waiting for taste, flow or pressure to noticeably decline. High-use schools, factories and gyms may need more frequent servicing than low-use offices.',
  },
  {
    q: 'What should I confirm before ordering replacement filters?',
    a: 'Match replacements to the exact bubbler model and existing cartridge configuration. The square and rust-free models have verified sediment and activated-carbon stages; the round model uses an integrated filtration cartridge.',
  },
  {
    q: 'Do you ship commercial water bubblers Australia-wide?',
    a: `Yes. Enviro Aqua ships Australia-wide from Wyong NSW. Stocked orders placed before ${BUSINESS_INFO.orderCutoff} on business days are dispatched the same day where applicable.`,
  },
];

const ANSWERS = [
  {
    q: 'What should I buy for a school?',
    a: 'Choose a WaterMark-certified, lead-free, robust unit that suits the exposure level. The square stainless and rust-free HDPE models add a side tap for bottle or glass filling, while the round stainless model is a simpler filtered drinking-fountain format. Confirm site conditions and installation requirements separately.',
  },
  {
    q: 'What should I buy for an office?',
    a: 'A compact stainless model is usually the simplest fit. The square model works well where bottle filling is important; the round model is a straightforward chilled bubbler where direct drinking is the main use.',
  },
  {
    q: 'What should I buy for a factory or warehouse?',
    a: 'Prioritise durability, easy cleaning and access during shift peaks. The rust-free HDPE cabinet is useful where corrosion resistance is a priority, while the stainless models provide a clean commercial finish for workplace drinking-water stations.',
  },
  {
    q: 'Do I need a bottle filler as well?',
    a: 'Choose a side-tap model if people regularly refill drink bottles or jugs. If the station is mainly for direct drinking, a bubbler-only model keeps the fixture simpler.',
  },
];

const USE_CASES = [
  {
    icon: GraduationCap,
    title: 'Schools & childcare',
    body: 'Frequent use, simple push-button operation and robust materials matter most. Match the cabinet to whether the unit is sheltered or fully exposed.',
    points: ['WaterMark-certified range', 'Lead-free', 'Bottle-fill options available'],
  },
  {
    icon: Building2,
    title: 'Offices & workplaces',
    body: 'Mains-connected chilled water removes bottle deliveries and suits shared kitchens, foyers and staff areas.',
    points: ['Compact stainless options', 'Mains-connected drinking water', 'Filtered options'],
  },
  {
    icon: Factory,
    title: 'Factories & warehouses',
    body: 'For industrial sites, select for peak-shift demand, cabinet durability, cleaning access and whether the location is exposed to weather.',
    points: ['Rust-free HDPE option', 'Filtered drinking water', 'Multiple stations for large sites'],
  },
  {
    icon: Dumbbell,
    title: 'Gyms & sporting facilities',
    body: 'Bottle filling and chilled output are especially useful where demand comes in short peaks before and after classes or training.',
    points: ['Bottle-fill models', 'Chilled filtered options', 'Multiple cabinet styles'],
  },
];

export const metadata: Metadata = {
  title: 'Water Bubblers & Drinking Fountains Australia | Commercial & School',
  description:
    'Shop water bubblers and drinking fountains for Australian schools, offices, factories, warehouses, gyms and public facilities. Compare filtered, chilled and WaterMark-certified models.',
  alternates: { canonical: PATH },
  openGraph: {
    title: 'Water Bubblers & Drinking Fountains Australia | Enviro Aqua',
    description:
      'Compare water bubblers and drinking fountains for schools, offices, factories, warehouses, gyms and public facilities, with verified specifications for each model.',
    url: PATH,
  },
};

export default async function CommercialBubblersPage() {
  const products = await Promise.all(
    CABINETS.map((cabinet) => getProductByHandle(cabinet.handle)),
  );

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Water Bubblers & Drinking Fountains', href: PATH },
  ];

  const productItems = products.flatMap((product) =>
    product
      ? [{ name: product.title, path: getProductUrl(product.handle) }]
      : [],
  );

  return (
    <>
      <JsonLdScript
        data={[
          collectionSchema(
            'Water Bubblers & Drinking Fountains Australia',
            PATH,
            'Water bubblers and drinking fountains for Australian schools, workplaces, factories, warehouses, gyms and public facilities, with verified filtration, cooling and WaterMark information by model.',
          ),
          productListSchema(productItems),
          breadcrumbSchema(
            breadcrumbs.map((item) => ({ name: item.name, path: item.href })),
          ),
          faqPageSchema(FAQ_ITEMS),
        ]}
      />

      <article className="bg-white">
        <Hero products={products} breadcrumbs={breadcrumbs} />
        <QuickAnswerSection />
        <DecisionGuideSection />
        <RangeSection products={products} />
        <CompareSection />
        <WaterMarkSection />
        <CapacitySection />
        <UseCasesSection />
        <InstallationSection />
        <FaqSection />
        <BulkContactSection />
        <TrustStrip />
      </article>
    </>
  );
}

interface HeroProps {
  products: ReadonlyArray<Product | null>;
  breadcrumbs: ReadonlyArray<{ name: string; href: string }>;
}

function Hero({ products, breadcrumbs }: HeroProps) {
  const heroProduct = products[1] ?? products.find(Boolean) ?? null;
  const heroImage = heroProduct?.featuredImage ?? null;
  const minPrice = lowestPrice(products);

  return (
    <section className="bg-gray-50 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <Breadcrumbs items={breadcrumbs} />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
          <div>
            <span className="inline-flex items-center bg-brand-blue text-white text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded">
              Water bubblers & drinking fountains
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold text-black tracking-tight leading-tight">
              Water bubblers & drinking fountains for schools, workplaces and public spaces.
            </h1>
            <p className="mt-4 text-lg md:text-xl text-black/75">
              Compare mains-connected drinking fountains and water bubblers with
              filtered and chilled options, stainless steel or rust-free cabinets,
              and WaterMark-certified models for Australian facilities.
            </p>
            <p className="mt-4 text-base text-black/70">
              Choose by cabinet material, filtration, bottle-filling requirements and
              verified cooling performance. The square stainless and rust-free
              HDPE models are rated at 20 L/hr and approximately 8–12 °C.
              Model-specific cooling figures for the round stainless unit are not
              published until its technical documentation is confirmed.
            </p>
            {minPrice && (
              <p className="mt-4 text-base text-black/80">
                <span className="font-semibold text-black">From </span>
                <PriceDisplay money={minPrice} className="font-semibold text-black" />
                <span className="text-black/60"> inc GST</span>
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <WatermarkBadge href="/watermark-certified/" />
              <LeadFreeBadge />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#choose"
                className="inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold px-6 py-3 rounded transition-colors"
              >
                Choose a bubbler
              </a>
              <a
                href="#compare"
                className="inline-flex items-center justify-center bg-white border border-black hover:bg-gray-50 text-black font-semibold px-6 py-3 rounded transition-colors"
              >
                Compare models
              </a>
            </div>
          </div>
          <div className="relative aspect-square bg-white border border-gray-200 rounded overflow-hidden">
            {heroImage ? (
              <Image
                src={heroImage.url}
                alt={heroImage.altText ?? heroProduct?.title ?? 'Commercial water bubbler'}
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-contain p-6"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-black/30">
                <Droplet size={64} strokeWidth={1.25} aria-hidden="true" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickAnswerSection() {
  return (
    <section className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
              Quick answer
            </span>
            <h2 className="mt-2 text-3xl font-bold text-black tracking-tight">
              What is a commercial water bubbler?
            </h2>
          </div>
          <div className="space-y-4 text-base md:text-lg text-black/80 leading-relaxed">
            <p>
              A commercial water bubbler is a mains-connected drinking-water
              fixture designed for frequent shared use. It is commonly used in
              schools, offices, factories, gyms, sporting facilities and public
              buildings.
            </p>
            <p>
              A chilled bubbler cools incoming mains water before dispensing it
              through an upward drinking spout. Filtered models also treat the
              water before chilling. In Australia, the terms{' '}
              <strong>water bubbler</strong> and{' '}
              <strong>drinking fountain</strong> are often used interchangeably.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function DecisionGuideSection() {
  return (
    <section id="choose" className="border-b border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
          Which commercial water bubbler should I choose?
        </h2>
        <p className="mt-3 max-w-3xl text-base text-black/70">
          Start with the installation environment, then decide whether bottle
          filling matters. Cooling and filtration are the same across this
          range, so the cabinet and dispensing format are the main differences.
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {ANSWERS.map((item) => (
            <div key={item.q} className="bg-white border border-gray-200 rounded p-5 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-black">{item.q}</h3>
              <p className="mt-2 text-sm md:text-base text-black/75 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 overflow-x-auto border border-gray-200 rounded bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-semibold">Need</th>
                <th className="px-4 py-3 text-left font-semibold">Best starting point</th>
                <th className="px-4 py-3 text-left font-semibold">Why</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Indoor office or foyer', 'Round stainless', 'Compact, chilled and simple'],
                ['School corridor or gym', 'Square stainless', 'Flat-sided cabinet plus bottle-fill tap'],
                ['Exposed schoolyard or outdoor site', 'HDPE granite', 'Rust-free, UV-stable cabinet'],
                ['Factory or warehouse', 'HDPE or stainless', 'Choose based on exposure and cleaning environment'],
                ['Bottle and jug filling', 'Square stainless or HDPE', 'Separate side tap'],
              ].map(([need, model, why]) => (
                <tr key={need} className="border-b border-gray-200 last:border-b-0">
                  <td className="px-4 py-3 font-medium text-black">{need}</td>
                  <td className="px-4 py-3 text-black/80">{model}</td>
                  <td className="px-4 py-3 text-black/70">{why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

interface RangeSectionProps {
  products: ReadonlyArray<Product | null>;
}

function RangeSection({ products }: RangeSectionProps) {
  return (
    <section id="range" className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
              Compare the Enviro Aqua commercial bubbler range
            </h2>
            <p className="mt-2 text-base text-black/70 max-w-3xl">
              Three cabinets with the same core 20 L/hr chilled-water platform.
              Choose by location, exposure and bottle-filling requirement.
            </p>
          </div>
          <a href="#compare" className="text-sm font-medium text-brand-blue hover:underline underline-offset-4">
            Full specifications →
          </a>
        </div>
        <ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {CABINETS.map((cabinet, index) => (
            <li key={cabinet.key}>
              <CabinetCard cabinet={cabinet} product={products[index]} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

interface CabinetCardProps {
  cabinet: CabinetSpec;
  product: Product | null;
}

function CabinetCard({ cabinet, product }: CabinetCardProps) {
  const href = product ? getProductUrl(product.handle) : `/${cabinet.handle}`;
  const image = product?.featuredImage ?? null;
  const title = product?.title ?? cabinet.shortName;
  const price = product?.priceRange.minVariantPrice ?? null;

  return (
    <article className="h-full flex flex-col border border-gray-200 hover:border-gray-400 transition-colors rounded">
      <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-t">
        <div className="relative aspect-square bg-gray-50 border-b border-gray-200 rounded-t overflow-hidden">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText ?? `${cabinet.shortName} commercial water bubbler`}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-contain p-4"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-black/20">
              <Droplet size={48} strokeWidth={1.25} aria-hidden="true" />
            </div>
          )}
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded px-2 py-1 text-[11px] font-semibold text-black">
            WaterMark
          </span>
          <span className="absolute top-3 right-3 bg-black text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded">
            {cabinet.badge}
          </span>
        </div>
      </Link>
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <h3 className="text-base font-semibold text-black leading-snug">
          <Link href={href} className="hover:underline underline-offset-4">{title}</Link>
        </h3>
        <p className="mt-1 text-sm text-black/60">{cabinet.tagline}</p>
        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-black/70">
          {cabinet.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
        </ul>
        <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-gray-200">
          {price ? (
            <PriceDisplay money={price} className="text-base font-semibold text-black" />
          ) : (
            <span className="text-sm text-black/60">See product page</span>
          )}
          <Link href={href} className="inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold px-4 py-2 rounded transition-colors">
            View model
          </Link>
        </div>
      </div>
    </article>
  );
}

function CompareSection() {
  return (
    <section id="compare" className="border-b border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
          Commercial water bubbler specifications
        </h2>
        <p className="mt-2 text-base text-black/70 max-w-3xl">
          Compare cabinet material, size, chilling, filtration, bottle filling,
          certification and intended installation environment side by side.
        </p>
        <div className="mt-8 overflow-x-auto border border-gray-200 rounded bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-white">
                <th scope="col" className="text-left font-semibold text-black px-4 py-3 w-1/4 min-w-[10rem]">Specification</th>
                {CABINETS.map((cabinet) => (
                  <th key={cabinet.key} scope="col" className="text-left font-semibold text-black px-4 py-3 min-w-[10rem]">
                    {cabinet.shortName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SPEC_ROWS.map((row) => (
                <tr key={row.label} className="border-b border-gray-200 last:border-b-0">
                  <th scope="row" className="text-left font-medium text-black/70 px-4 py-3 align-top">{row.label}</th>
                  {CABINETS.map((cabinet) => {
                    const value = row.values[cabinet.key];
                    const isYes = row.yes?.[cabinet.key];
                    const isDash = value === '—';
                    return (
                      <td key={cabinet.key} className="px-4 py-3 text-black align-top">
                        {isDash ? (
                          <span aria-label="not available" className="text-black/40"><Minus size={16} strokeWidth={2} aria-hidden="true" /></span>
                        ) : isYes ? (
                          <span className="inline-flex items-center gap-1.5 text-brand-blue font-medium">
                            <Check size={16} strokeWidth={2.25} aria-hidden="true" />{value}
                          </span>
                        ) : value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function WaterMarkSection() {
  return (
    <section className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-14 items-start">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">Australian compliance</span>
            <h2 className="mt-2 text-3xl font-bold text-black tracking-tight">
              Do commercial water bubblers need WaterMark certification?
            </h2>
            <div className="mt-4 space-y-4 text-base text-black/80 leading-relaxed">
              <p>
                In Australia, WaterMark requirements depend on the plumbing
                product type and intended installation. Under the National
                Construction Code, product types listed on the WaterMark
                Schedule of Products must be WaterMark certified before they
                are installed.
              </p>
              <p>
                All three commercial bubblers in this range are WaterMark
                certified under licence <strong>23484</strong>. For a mains
                installation, use an appropriately licensed plumbing
                practitioner and have them confirm the requirements that apply
                to your site.
              </p>
            </div>
            <Link href="/watermark-certified" className="mt-5 inline-flex text-sm font-semibold text-brand-blue hover:underline underline-offset-4">
              Learn more about WaterMark certification →
            </Link>
          </div>
          <aside className="border border-gray-200 rounded p-6 md:p-8 bg-gray-50">
            <WatermarkBadge />
            <dl className="mt-6 space-y-4 text-sm">
              <CertRow label="Licence" value="23484" mono />
              <CertRow label="Specification" value="WMTS-105:2016" mono />
              <CertRow label="Range" value="All three commercial bubbler models" />
              <CertRow label="Installation" value="Licensed plumbing practitioner" />
            </dl>
          </aside>
        </div>
      </div>
    </section>
  );
}

function CertRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3">
      <dt className="text-black/60">{label}</dt>
      <dd className={`text-black font-medium ${mono ? 'font-mono tracking-tight' : ''}`}>{value}</dd>
    </div>
  );
}

function CapacitySection() {
  return (
    <section className="border-b border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
              How much cooling capacity do I need?
            </h2>
            <p className="mt-3 text-base text-black/75 leading-relaxed">
              Commercial water-bubbler capacity is usually stated in litres
              per hour. The right figure depends on peak demand: a school at
              lunch, a factory at shift change and a gym after class can create
              much heavier short-term demand than their average daily use suggests.
            </p>
            <p className="mt-3 text-base text-black/75 leading-relaxed">
              Every model on this page is rated at <strong>20 L/hr</strong>.
              For large facilities or concentrated peak periods, multiple
              drinking stations can be a better solution than expecting one
              unit to serve the entire site.
            </p>
          </div>
          <div className="border border-gray-200 rounded bg-white p-6">
            <h3 className="font-semibold text-black">Before choosing capacity, check:</h3>
            <ul className="mt-4 space-y-3 text-sm text-black/75">
              {[
                'How many people may use the station within the same 15–30 minute period?',
                'Will users drink directly or mostly refill bottles?',
                'Is there another drinking-water point nearby?',
                'Is the location hot, exposed or used during physical activity?',
                'Can the site support a second unit if demand grows?',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <Check size={16} strokeWidth={2} aria-hidden="true" className="mt-0.5 flex-shrink-0 text-brand-blue" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function UseCasesSection() {
  return (
    <section className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
          Where are commercial water bubblers used?
        </h2>
        <p className="mt-2 text-base text-black/70 max-w-3xl">
          The core requirements are similar, but exposure, traffic patterns and
          bottle-filling needs change by site.
        </p>
        <ul role="list" className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {USE_CASES.map((use) => (
            <li key={use.title} className="p-5 border border-gray-200 rounded h-full">
              <use.icon size={30} strokeWidth={1.75} aria-hidden="true" className="text-brand-blue" />
              <h3 className="mt-4 text-lg font-semibold text-black">{use.title}</h3>
              <p className="mt-2 text-sm text-black/75">{use.body}</p>
              <ul className="mt-4 space-y-2 text-sm text-black/75">
                {use.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <Check size={15} strokeWidth={2} aria-hidden="true" className="mt-0.5 flex-shrink-0 text-brand-blue" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function InstallationSection() {
  return (
    <section className="border-b border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-10 md:gap-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
              How is a commercial water bubbler installed?
            </h2>
            <p className="mt-3 text-base text-black/70">
              These are mains-connected chilled appliances, so plan plumbing,
              drainage, power and servicing access before the unit arrives.
            </p>
          </div>
          <ol className="space-y-4">
            {[
              ['1', 'Choose the location', 'Confirm indoor, sheltered or exposed outdoor conditions and allow enough clearance for use and servicing.'],
              ['2', 'Confirm water and drainage', 'A licensed plumbing practitioner should confirm the mains connection, isolation, drainage and local plumbing requirements.'],
              ['3', 'Confirm power', 'Chilled models require a suitable 240 V power point positioned appropriately for the installation.'],
              ['4', 'Install and commission', 'The plumber connects the unit, checks drainage and flow, then the cooling system can be commissioned and tested.'],
              ['5', 'Plan filter servicing', 'Keep replacement sediment and carbon cartridges available and schedule maintenance based on usage and local water conditions.'],
            ].map(([number, title, body]) => (
              <li key={number} className="grid grid-cols-[2rem_1fr] gap-4 border-b border-gray-200 pb-4 last:border-b-0">
                <span className="font-mono text-sm text-black/50">{number}</span>
                <div>
                  <h3 className="font-semibold text-black">{title}</h3>
                  <p className="mt-1 text-sm text-black/70">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-[0.75fr_1.25fr] gap-10 md:gap-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">Commercial bubbler guide</span>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-black tracking-tight">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-base text-black/70">
              Clear answers on terminology, WaterMark, installation, cooling,
              filtration, outdoor use and maintenance.
            </p>
          </div>
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </div>
    </section>
  );
}

function BulkContactSection() {
  return (
    <section className="border-b border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="border border-gray-200 rounded bg-white p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-black/60">Commercial projects</span>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-black tracking-tight">
              Specifying multiple water bubblers?
            </h2>
            <p className="mt-3 text-base text-black/80">
              Enviro Aqua can help facilities managers, schools, builders,
              plumbers and project teams choose the right cabinet mix and
              coordinate supply across multiple locations.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-black/80">
              {[
                'Product specifications and WaterMark details',
                `Same-day dispatch on stocked orders placed before ${BUSINESS_INFO.orderCutoff}`,
                `Australian tax invoice · ABN ${BUSINESS_INFO.abn}`,
                'Standard replacement filter cartridges',
              ].map((point) => (
                <li key={point} className="flex gap-2">
                  <Check size={16} strokeWidth={2} aria-hidden="true" className="mt-0.5 flex-shrink-0 text-brand-blue" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <ContactRow icon={Phone} label="Call" value={BUSINESS_INFO.phone.display} sub={BUSINESS_INFO.phoneSupportHours} href={`tel:${BUSINESS_INFO.phone.tel}`} />
            <ContactRow icon={Mail} label="Email" value={BUSINESS_INFO.email} sub="Commercial bubbler enquiries" href={`mailto:${BUSINESS_INFO.email}?subject=Commercial%20water%20bubbler%20enquiry`} />
            <ContactRow icon={Wrench} label="Showroom" value={`${BUSINESS_INFO.address.street}, ${BUSINESS_INFO.address.locality} ${BUSINESS_INFO.address.region}`} sub={BUSINESS_INFO.showroom.hours} href="/showroom" />
          </div>
        </div>
      </div>
    </section>
  );
}

interface ContactRowProps {
  icon: typeof Phone;
  label: string;
  value: string;
  sub: string;
  href: string;
}

function ContactRow({ icon: Icon, label, value, sub, href }: ContactRowProps) {
  return (
    <Link href={href} className="flex items-start gap-4 p-4 border border-gray-200 rounded hover:border-gray-400 transition-colors">
      <span className="flex-shrink-0 inline-grid place-items-center w-10 h-10 bg-gray-50 border border-gray-200 rounded">
        <Icon size={18} strokeWidth={1.75} aria-hidden="true" className="text-brand-blue" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-xs font-semibold uppercase tracking-wider text-black/60">{label}</span>
        <span className="block text-base font-medium text-black truncate">{value}</span>
        <span className="block text-sm text-black/60">{sub}</span>
      </span>
    </Link>
  );
}

function TrustStrip() {
  const items: Array<{ icon: typeof Truck; title: string; body: string }> = [
    {
      icon: ShieldCheck,
      title: 'WaterMark certified range',
      body: 'All three commercial bubbler models are listed as WaterMark certified under licence 23484.',
    },
    {
      icon: Truck,
      title: 'Australia-wide delivery',
      body: `Stocked orders placed before ${BUSINESS_INFO.orderCutoff} on business days are dispatched the same day where applicable.`,
    },
    {
      icon: Wrench,
      title: 'Straightforward servicing',
      body: 'Standard 10-inch filter housings make replacement sediment and carbon cartridges easy to source.',
    },
  ];

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-14">
        <ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item) => (
            <li key={item.title}>
              <item.icon size={32} strokeWidth={1.75} aria-hidden="true" className="text-brand-blue" />
              <h3 className="mt-3 text-base font-semibold text-black">{item.title}</h3>
              <p className="mt-1.5 text-sm text-black/70">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function lowestPrice(products: ReadonlyArray<Product | null>) {
  const prices = products
    .map((product) => product?.priceRange.minVariantPrice)
    .filter((money): money is NonNullable<typeof money> => money !== null && money !== undefined);

  if (prices.length === 0) return null;

  return prices.reduce((lowest, price) =>
    Number(price.amount) < Number(lowest.amount) ? price : lowest,
  );
}
