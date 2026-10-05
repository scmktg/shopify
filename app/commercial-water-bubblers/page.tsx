import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Droplet, ShieldCheck } from 'lucide-react';
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
  modelId: string;
  modelName: string;
  tagline: string;
  badge: string;
  highlights: ReadonlyArray<string>;
}

const CABINETS: ReadonlyArray<CabinetSpec> = [
  {
    key: 'round',
    handle: 'commercial-stainless-steel-filtered-cold-water-bubbler-round-wm',
    shortName: 'Round Stainless',
    modelId: 'YL-600R',
    modelName: 'Water Bubbler Round',
    tagline: 'Compact stainless commercial bubbler for direct chilled drinking in indoor and sheltered locations.',
    badge: 'Compact indoor',
    highlights: ['20 L/hr', 'Approx. 8–12 °C', '304 stainless', 'WaterMark 023484'],
  },
  {
    key: 'square',
    handle: 'commercial-water-bubbler-filtered-stainless-steel-watermark-certified-square-des',
    shortName: 'Square Stainless',
    modelId: 'YL-600C',
    modelName: 'Water Bubbler Square',
    tagline: 'Stainless commercial bubbler with a separate side tap for bottles, glasses and jugs.',
    badge: 'Best all-round',
    highlights: ['20 L/hr', 'Approx. 8–12 °C', 'Bottle-fill side tap', 'WaterMark 023484'],
  },
  {
    key: 'hdpe',
    handle: 'commercial-rust-free-filtered-cold-water-bubbler-wm',
    shortName: 'Outdoor HDPE',
    modelId: 'YL-600P',
    modelName: 'Water Bubbler Grey',
    tagline: 'Rust-free HDPE commercial bubbler for exposed outdoor locations, with a separate side tap.',
    badge: 'Outdoor',
    highlights: ['20 L/hr', 'Approx. 8–12 °C', 'Rust-free HDPE', 'WaterMark 023484'],
  },
];

const FAQ_ITEMS = [
  {
    q: 'What is a commercial water bubbler?',
    a: 'A commercial water bubbler is a mains-connected drinking-water unit designed for frequent shared use in places such as schools, offices, factories, gyms and public facilities. Chilled models cool incoming water before dispensing, while filtered models also treat the drinking water before it reaches the outlet.',
  },
  {
    q: 'What is the difference between a water bubbler and a drinking fountain?',
    a: 'In Australia, water bubbler and drinking fountain are often used for the same type of fixture. Bubbler usually refers to the upward drinking spout, while drinking fountain can describe the complete fixture.',
  },
  {
    q: 'How much chilled water do the Enviro Aqua commercial bubblers produce?',
    a: 'All three current Enviro Aqua commercial bubbler models are rated at 20 litres per hour and deliver chilled water at approximately 8–12 °C.',
  },
  {
    q: 'What are the WaterMark identities of the three Enviro Aqua bubblers?',
    a: 'Enviro Aqua YL-600C is Water Bubbler Square, YL-600R is Water Bubbler Round and YL-600P is Water Bubbler Grey. All three are certified under WaterMark Certificate 023484.',
  },
  {
    q: 'Which models include a bottle-filling outlet?',
    a: 'The YL-600C Water Bubbler Square and YL-600P Water Bubbler Grey include a separate side tap for filling bottles, glasses or jugs. The YL-600R Water Bubbler Round is the simpler direct-drinking model.',
  },
  {
    q: 'Which Enviro Aqua bubbler is best for an exposed outdoor location?',
    a: 'The YL-600P Water Bubbler Grey uses a rust-free, UV-stable HDPE outer cabinet and is the range option intended for exposed outdoor commercial locations. The stainless models are better suited to indoor or sheltered positions.',
  },
  {
    q: 'Do commercial water bubblers need WaterMark certification in Australia?',
    a: 'WaterMark requirements depend on the product type and intended plumbing application. Product types listed on the WaterMark Schedule of Products require appropriate certification. All three Enviro Aqua commercial bubbler models are WaterMark certified under Certificate 023484.',
  },
  {
    q: 'Who should install a mains-connected commercial water bubbler?',
    a: 'Use an appropriately licensed plumbing practitioner for the mains-water connection and any drainage work, and confirm the site-specific plumbing and electrical requirements before installation.',
  },
];

export const metadata: Metadata = {
  title: 'Water Bubblers & Drinking Fountains Australia | Commercial & School',
  description:
    'Compare Enviro Aqua commercial water bubblers and drinking fountains for schools, offices, factories and gyms. All three models: 20 L/hr, approx. 8–12 °C and WaterMark Certificate 023484.',
  alternates: { canonical: PATH },
  openGraph: {
    title: 'Commercial Water Bubblers & Drinking Fountains | Enviro Aqua',
    description:
      'Compare YL-600C, YL-600R and YL-600P commercial water bubblers with verified cooling specifications and WaterMark identities.',
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
    product ? [{ name: product.title, path: getProductUrl(product.handle) }] : [],
  );

  return (
    <>
      <JsonLdScript
        data={[
          collectionSchema(
            'Water Bubblers & Drinking Fountains Australia',
            PATH,
            'Enviro Aqua commercial water bubblers YL-600C, YL-600R and YL-600P. All three are rated at 20 L/hr with approximately 8–12 °C chilled-water output and are WaterMark certified under Certificate 023484.',
          ),
          productListSchema(productItems),
          breadcrumbSchema(breadcrumbs.map((item) => ({ name: item.name, path: item.href }))),
          faqPageSchema(FAQ_ITEMS),
        ]}
      />

      <article className="bg-white">
        <Hero breadcrumbs={breadcrumbs} products={products} />
        <RangeSection products={products} />
        <ComparisonSection />
        <WaterMarkIdentitySection />
        <ApplicationSection />
        <FaqSection />
      </article>
    </>
  );
}

function Hero({
  breadcrumbs,
  products,
}: {
  breadcrumbs: ReadonlyArray<{ name: string; href: string }>;
  products: ReadonlyArray<Product | null>;
}) {
  const prices = products
    .filter((product): product is Product => Boolean(product))
    .map((product) => product.priceRange.minVariantPrice);
  const minPrice = prices[0] ?? null;

  return (
    <section className="bg-gray-50 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <Breadcrumbs items={breadcrumbs} />
        <div className="mt-6 max-w-4xl">
          <span className="inline-flex bg-brand-blue text-white text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded">
            Commercial drinking water
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold text-black tracking-tight leading-tight">
            Commercial water bubblers & drinking fountains
          </h1>
          <p className="mt-4 text-lg md:text-xl text-black/75 max-w-3xl">
            Three Enviro Aqua commercial models for schools, offices, factories,
            warehouses, gyms and public facilities. Every model is rated at{' '}
            <strong>20 L/hr</strong>, delivers chilled water at approximately{' '}
            <strong>8–12 °C</strong> and is WaterMark certified under{' '}
            <strong>Certificate 023484</strong>.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            {minPrice && (
              <p className="text-base text-black/80">
                <span className="font-semibold">From </span>
                <PriceDisplay money={minPrice} className="font-semibold text-black" />
                <span className="text-black/60"> inc GST</span>
              </p>
            )}
            <WatermarkBadge href="/watermark-certified/" />
            <LeadFreeBadge />
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#range" className="inline-flex bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold px-6 py-3 rounded transition-colors">
              Shop all three models
            </a>
            <a href="#compare" className="inline-flex bg-white border border-black hover:bg-gray-100 text-black font-semibold px-6 py-3 rounded transition-colors">
              Compare specifications
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function RangeSection({ products }: { products: ReadonlyArray<Product | null> }) {
  return (
    <section id="range" className="border-b border-gray-200 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
          Choose your commercial water bubbler
        </h2>
        <p className="mt-3 max-w-3xl text-black/70">
          Cooling performance is consistent across the range. Choose mainly by cabinet,
          installation environment and whether a separate bottle-fill side tap is needed.
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          {CABINETS.map((cabinet, index) => (
            <ProductCard key={cabinet.key} cabinet={cabinet} product={products[index]} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ cabinet, product }: { cabinet: CabinetSpec; product: Product | null }) {
  const href = product ? getProductUrl(product.handle) : `/${cabinet.handle}`;
  const image = product?.featuredImage ?? null;
  const price = product?.priceRange.minVariantPrice ?? null;

  return (
    <div className="border border-gray-200 rounded overflow-hidden flex flex-col">
      <Link href={href} className="relative aspect-square bg-gray-50 border-b border-gray-200 block">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? `${cabinet.shortName} commercial water bubbler`}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-contain p-5"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-black/20">
            <Droplet size={48} strokeWidth={1.25} aria-hidden="true" />
          </span>
        )}
        <span className="absolute top-3 right-3 bg-black text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded">
          {cabinet.badge}
        </span>
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue">{cabinet.shortName}</p>
        <h3 className="mt-1 text-xl font-semibold text-black">{cabinet.modelName}</h3>
        <p className="mt-1 text-sm font-mono text-black/60">{cabinet.modelId}</p>
        <p className="mt-3 text-sm text-black/70 leading-relaxed">{cabinet.tagline}</p>
        <ul className="mt-4 space-y-2 text-sm text-black/75">
          {cabinet.highlights.map((item) => (
            <li key={item} className="flex gap-2">
              <Check size={15} className="mt-0.5 text-brand-blue flex-shrink-0" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-5 flex items-center justify-between gap-3">
          {price ? <PriceDisplay money={price} className="font-semibold text-black" /> : <span />}
          <Link href={href} className="bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold text-sm px-4 py-2.5 rounded">
            View product
          </Link>
        </div>
      </div>
    </div>
  );
}

function ComparisonSection() {
  const rows = [
    ['Brand name', 'Enviro Aqua', 'Enviro Aqua', 'Enviro Aqua'],
    ['Model ID', 'YL-600R', 'YL-600C', 'YL-600P'],
    ['WaterMark model name', 'Water Bubbler Round', 'Water Bubbler Square', 'Water Bubbler Grey'],
    ['WaterMark certificate', '023484', '023484', '023484'],
    ['Cooling capacity', '20 L/hr', '20 L/hr', '20 L/hr'],
    ['Chilled water temperature', 'Approx. 8–12 °C', 'Approx. 8–12 °C', 'Approx. 8–12 °C'],
    ['Cabinet', '304 stainless steel', 'SUS304 stainless steel', 'Rust-free HDPE'],
    ['Filtration', 'Integrated drinking-water cartridge', 'Sediment + activated carbon', 'PP sediment + activated carbon'],
    ['Bottle / glass fill side tap', 'No', 'Yes', 'Yes'],
    ['Best location', 'Indoor / sheltered', 'Indoor / sheltered', 'Exposed outdoor / commercial'],
  ] as const;

  return (
    <section id="compare" className="border-b border-gray-200 bg-gray-50 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
          Compare all three Enviro Aqua commercial bubblers
        </h2>
        <p className="mt-3 max-w-3xl text-black/70">
          The cooling specification is the same across all three models. Cabinet style,
          bottle filling, filtration configuration and installation environment are the main differences.
        </p>
        <div className="mt-7 overflow-x-auto border border-gray-200 rounded bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold">Specification</th>
                <th className="text-left px-4 py-3 font-semibold">Round</th>
                <th className="text-left px-4 py-3 font-semibold">Square</th>
                <th className="text-left px-4 py-3 font-semibold">HDPE / Grey</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, round, square, hdpe]) => (
                <tr key={label} className="border-b border-gray-200 last:border-b-0">
                  <th scope="row" className="text-left px-4 py-3 font-medium text-black/70">{label}</th>
                  <td className="px-4 py-3">{round}</td>
                  <td className="px-4 py-3">{square}</td>
                  <td className="px-4 py-3">{hdpe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function WaterMarkIdentitySection() {
  return (
    <section className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-14">
          <div>
            <div className="inline-flex items-center gap-2 text-brand-blue">
              <ShieldCheck size={24} aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wider">WaterMark identity</span>
            </div>
            <h2 className="mt-3 text-3xl font-bold text-black tracking-tight">
              Exact certified model identities
            </h2>
            <p className="mt-4 text-black/75 leading-relaxed">
              Use these exact brand, model ID, model name and certificate details when checking certification,
              preparing specifications or comparing the products with the WaterMark database.
            </p>
          </div>
          <div className="space-y-4">
            {CABINETS.map((cabinet) => (
              <div key={cabinet.key} className="border border-gray-200 rounded p-5 bg-gray-50">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <IdentityRow label="Brand name" value="Enviro Aqua" />
                  <IdentityRow label="Model ID" value={cabinet.modelId} />
                  <IdentityRow label="Model name" value={cabinet.modelName} />
                  <IdentityRow label="Certificate" value="023484" />
                </dl>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function IdentityRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-black/50">{label}</dt>
      <dd className="mt-0.5 font-semibold text-black">{value}</dd>
    </div>
  );
}

function ApplicationSection() {
  const links = [
    ['Schools', '/use/commercial-and-cafe/schools/', 'Choose by indoor/outdoor position, bottle filling and peak break-time demand.'],
    ['Factories & warehouses', '/use/commercial-and-cafe/factories-and-warehouses/', 'Plan around shift peaks, work zones, heat, exposure and bottle filling.'],
    ['Offices', '/use/commercial-and-cafe/offices/', 'Compare compact direct-drinking and bottle-fill options for shared workplaces.'],
    ['Gyms & fitness centres', '/use/commercial-and-cafe/gyms-and-fitness/', 'Plan for class peaks, reusable bottles and indoor vs outdoor training areas.'],
  ] as const;

  return (
    <section className="border-b border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
          Choose a bubbler for your application
        </h2>
        <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map(([title, href, body]) => (
            <Link key={href} href={href} className="border border-gray-200 bg-white hover:border-gray-400 rounded p-5 transition-colors">
              <h3 className="font-semibold text-black">{title}</h3>
              <p className="mt-2 text-sm text-black/70">{body}</p>
              <span className="mt-3 inline-flex text-sm font-semibold text-brand-blue">Read guide →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-[0.75fr_1.25fr] gap-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">Commercial bubbler guide</span>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-black tracking-tight">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-black/70">
              Verified answers on cooling performance, WaterMark identities, bottle filling,
              outdoor selection and installation.
            </p>
          </div>
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </div>
    </section>
  );
}
