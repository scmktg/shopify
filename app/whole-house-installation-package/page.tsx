import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Droplet, ShieldCheck, Wrench } from 'lucide-react';
import { BUSINESS_INFO } from '@/content/business-info';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import { FaqAccordion } from '@/components/editorial/FaqAccordion';
import { Breadcrumbs } from '@/components/editorial/Breadcrumbs';
import { InstallationLeadForm } from '@/components/install/InstallationLeadForm';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import {
  breadcrumbSchema,
  faqPageSchema,
  type JsonLd,
} from '@/lib/seo/jsonld';
import { absoluteUrl, getSiteUrl } from '@/lib/seo/siteUrl';

export const revalidate = 3600;

const PATH = '/whole-house-installation-package/';
const PRODUCT_HANDLE =
  'wm-3-stages-20-x-4-5-triple-big-blue-whole-house-water-filter-system';
const PRODUCT_PATH = `/water-filters/whole-house/${PRODUCT_HANDLE}/`;
const BUNDLED_PRICE = 2299;
const PRODUCT_PRICE = 1199.95;
const INSTALL_PRICE = 1099.05;

const FAQ_ITEMS = [
  {
    q: 'What is included in the $2,299 price?',
    a: 'The WaterMark certified 3-stage Big Blue filter system, professional installation by a licensed plumber we coordinate, mounting and commissioning, and a 12-month product warranty. GST is included.',
  },
  {
    q: 'Why is this only available on the Central Coast?',
    a: 'The fixed price covers a local plumber we work with regularly — they install our systems most weeks. Outside the Central Coast we cannot guarantee the same install quality at a fixed price, so we sell the system on its own and you arrange your own plumber.',
  },
  {
    q: 'How long does installation take?',
    a: 'Most standard whole-house installs take 2–3 hours on site. The plumber confirms a time window with you in advance. If the plumbing access turns out to be unusual on the day, the plumber will discuss options before doing extra work.',
  },
  {
    q: 'What if my installation has unusual requirements?',
    a: 'Standard scope covers a single-storey installation on the cold-water mains within reasonable reach of an external wall or garage. Multi-storey runs, isolated mains, or extensive new pipework can quote higher. We let you know before booking — no surprise costs after the fact.',
  },
  {
    q: 'Do I pay upfront?',
    a: 'No. Submit the form, we email you within 1–2 business days with confirmed install time options. Once you accept the time, we send a Shopify invoice. Once that is paid, the install is locked in and the plumber turns up on the agreed date.',
  },
  {
    q: 'What is the warranty on the product and the install?',
    a: '12-month manufacturer warranty on the product (longer if specifically noted). The plumber warrants their own workmanship under normal industry terms. Faulty product issues go through us; install issues go through the plumber — we coordinate either way.',
  },
  {
    q: 'Can I get just the product without install?',
    a: 'Yes. The system is on its own product page at $1,199.95 with tracked Australia-wide shipping or free Click & Collect from our Wyong showroom. The install package is the bundled option for local customers who want it done by a known plumber for a fixed price.',
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Whole House Water Filter — Installed for $2,299 | Central Coast NSW',
    description:
      'WaterMark certified whole-house water filter installed by a local plumber. Fixed $2,299 for NSW Central Coast residents. Get a quote in 60 seconds.',
    alternates: { canonical: PATH },
    openGraph: {
      title: 'Whole House Water Filter — Installed for $2,299',
      description:
        'WaterMark certified system + local plumber install. Fixed price for NSW Central Coast residents.',
      url: absoluteUrl(PATH),
    },
  };
}

function serviceSchema(productImage: string | null): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Whole House Water Filter Installation Package',
    serviceType: 'Plumbing Installation',
    description:
      'WaterMark certified whole-house water filter system supplied and installed by a licensed local plumber. Fixed price covers product, install, mounting, and commissioning.',
    provider: {
      '@type': 'LocalBusiness',
      name: BUSINESS_INFO.name,
      telephone: BUSINESS_INFO.phone.tel,
      email: BUSINESS_INFO.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: BUSINESS_INFO.address.street,
        addressLocality: BUSINESS_INFO.address.locality,
        addressRegion: BUSINESS_INFO.address.region,
        postalCode: BUSINESS_INFO.address.postalCode,
        addressCountry: BUSINESS_INFO.address.country,
      },
      url: getSiteUrl(),
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Central Coast NSW',
    },
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(PATH),
      price: BUNDLED_PRICE.toFixed(2),
      priceCurrency: 'AUD',
      availability: 'https://schema.org/InStock',
    },
    ...(productImage ? { image: productImage } : {}),
  };
}

const PROPERTY_FIT = [
  'Central Coast NSW homeowners',
  'Properties on rural tank water needing whole-of-home filtration',
  'Properties on chlorinated mains where you want filtration at every tap',
  'Renovating and want filtration installed once, properly',
];

const HOW_IT_WORKS = [
  'Submit your details below — takes 60 seconds.',
  'We arrange a time with our local plumber and email you within 1–2 business days.',
  'You confirm the time. We send an invoice.',
  'Once paid, your install is locked in. The plumber turns up, fits it, you have filtered water at every tap.',
];

const RELATED_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Buy the system on its own ($1,199.95)', href: PRODUCT_PATH },
  { label: 'Whole-home filtration', href: '/use/whole-home-filtration/' },
  { label: 'Chlorine and taste removal', href: '/water-problems/chlorine-and-taste/' },
  { label: 'Sediment and rust filters', href: '/water-problems/sediment-and-rust/' },
];

export default async function InstallPackagePage() {
  const product = await getProductByHandle(PRODUCT_HANDLE);
  const productImage = product?.featuredImage?.url ?? null;
  const productImageAlt = product?.title ?? 'Whole house water filter system';

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Whole House Install Package', href: PATH },
  ];

  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbSchema(
            breadcrumbs.map((b) => ({ name: b.name, path: b.href })),
          ),
          faqPageSchema(FAQ_ITEMS),
          serviceSchema(productImage),
        ]}
      />

      <article className="bg-white">
        {/* Hero */}
        <section className="bg-gray-50 border-b border-gray-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <Breadcrumbs items={breadcrumbs} />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
              <div>
                <span className="inline-flex items-center bg-brand-blue text-white text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded">
                  Local offer — Central Coast NSW
                </span>
                <h1 className="mt-4 text-4xl md:text-5xl font-bold text-black tracking-tight leading-tight">
                  Whole House Water Filter — Installed by a Local Plumber
                </h1>
                <p className="mt-4 text-lg md:text-xl text-black/70">
                  WaterMark certified, NSW Central Coast — ${BUNDLED_PRICE.toLocaleString()} complete with professional install.
                </p>
                <div className="mt-6">
                  <a
                    href="#quote-form"
                    className="inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold px-6 py-3 rounded transition-colors"
                  >
                    Get a quote
                  </a>
                </div>
              </div>
              <div className="relative aspect-square bg-white border border-gray-200 rounded overflow-hidden">
                {productImage ? (
                  <Image
                    src={productImage}
                    alt={productImageAlt}
                    fill
                    priority
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-contain p-4"
                  />
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* What's included */}
        <section className="border-b border-gray-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <h2 className="text-2xl font-semibold text-black">
              What&apos;s included
            </h2>
            <ul
              role="list"
              className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <IncludedCard
                icon={Droplet}
                title="The product"
                body="WaterMark 3-Stage Big Blue Filter System. WaterMark certified for permanent mains-water connection."
              />
              <IncludedCard
                icon={Wrench}
                title="Installation"
                body="Licensed local plumber. Plumbing, mounting, and commissioning."
              />
              <IncludedCard
                icon={ShieldCheck}
                title="Aftercare"
                body="12-month product warranty. We're 5 minutes away in Wyong if you need us."
              />
            </ul>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-b border-gray-200">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
            <h2 className="text-2xl font-semibold text-black">Bundled price</h2>
            <p className="mt-6 text-6xl md:text-7xl font-bold text-black tracking-tight">
              ${BUNDLED_PRICE.toLocaleString()}
            </p>
            <dl className="mt-8 max-w-sm mx-auto text-sm text-black/80">
              <div className="flex justify-between border-b border-gray-200 py-2">
                <dt>Product</dt>
                <dd>${PRODUCT_PRICE.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between border-b border-gray-200 py-2">
                <dt>Professional install</dt>
                <dd>${INSTALL_PRICE.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between py-2 font-semibold text-black">
                <dt>Total</dt>
                <dd>${BUNDLED_PRICE.toLocaleString()}.00</dd>
              </div>
            </dl>
            <p className="mt-6 text-sm text-black/70">
              GST included. Price valid for NSW Central Coast residents within
              standard installation scope. Complex installs may quote higher —
              we&apos;ll let you know before booking.
            </p>
          </div>
        </section>

        {/* Who this is for */}
        <section className="border-b border-gray-200">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <h2 className="text-2xl font-semibold text-black">
              Who this is for
            </h2>
            <ul role="list" className="mt-6 space-y-3">
              {PROPERTY_FIT.map((item) => (
                <li key={item} className="flex gap-3 text-base text-black/80">
                  <span aria-hidden="true" className="text-brand-blue mt-1">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-gray-200">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <h2 className="text-2xl font-semibold text-black">How it works</h2>
            <ol role="list" className="mt-8 space-y-6">
              {HOW_IT_WORKS.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 bg-brand-blue text-white text-sm font-semibold rounded-full"
                  >
                    {index + 1}
                  </span>
                  <p className="text-base text-black/80">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Lead form */}
        <section id="quote-form" className="border-b border-gray-200">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <h2 className="text-2xl font-semibold text-black">
              Get a quote
            </h2>
            <p className="mt-2 text-sm text-black/70">
              Takes about 60 seconds. We&apos;ll come back to you within 1–2
              business days.
            </p>
            <InstallationLeadForm productUrl={PRODUCT_PATH} />
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b border-gray-200">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <h2 className="text-2xl font-semibold text-black">
              Frequently asked questions
            </h2>
            <div className="mt-6">
              <FaqAccordion items={FAQ_ITEMS} />
            </div>
          </div>
        </section>

        {/* Related */}
        <section>
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
            <h2 className="text-base font-semibold text-black uppercase tracking-wider">
              Related
            </h2>
            <ul role="list" className="mt-3 space-y-1">
              {RELATED_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-brand-blue hover:underline underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </article>
    </>
  );
}

interface IncludedCardProps {
  icon: typeof Droplet;
  title: string;
  body: string;
}

function IncludedCard({ icon: Icon, title, body }: IncludedCardProps) {
  return (
    <li className="p-6 border border-gray-200 rounded">
      <Icon
        size={32}
        strokeWidth={1.75}
        aria-hidden="true"
        className="text-brand-blue"
      />
      <h3 className="mt-4 text-lg font-semibold text-black">{title}</h3>
      <p className="mt-2 text-sm text-black/70">{body}</p>
    </li>
  );
}
