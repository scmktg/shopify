import type { Metadata } from 'next';
import Link from 'next/link';
import { Droplet, MapPin, Wrench } from 'lucide-react';
import { BUSINESS_INFO } from '@/content/business-info';
import { FaqAccordion } from '@/components/editorial/FaqAccordion';
import { Breadcrumbs } from '@/components/editorial/Breadcrumbs';
import { InstallationLeadForm } from '@/components/install/InstallationLeadForm';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { breadcrumbSchema, faqPageSchema, type JsonLd } from '@/lib/seo/jsonld';
import { absoluteUrl, getSiteUrl } from '@/lib/seo/siteUrl';

export const revalidate = 3600;

const PATH = '/whole-house-installation-package';
const PRICE = 2399;
const PRODUCT_HANDLE = 'wm-3-stages-20-x-4-5-triple-big-blue-whole-house-water-filter-system';
const PRODUCT_PATH = `/water-filters/whole-house/${PRODUCT_HANDLE}/`;
const CENTRAL_COAST_PATH = '/locations/central-coast-nsw/whole-house-water-filter-installation';
const SYDNEY_PATH = '/locations/sydney-nsw/whole-house-water-filter-installation';

const FAQ_ITEMS = [
  {
    q: 'How much does whole-house water filter installation cost on the Central Coast?',
    a: "Enviro Aqua's standard whole-house installation package is $2,399 + GST, including the filtration system and professional installation, subject to standard installation conditions.",
  },
  {
    q: 'How much does whole-house water filter installation cost in Sydney?',
    a: "Enviro Aqua's standard whole-house installation package is $2,399 + GST, including the filtration system and professional installation, subject to service-area availability and standard installation conditions.",
  },
  {
    q: 'What whole-house filter is included?',
    a: 'The package uses the Enviro Aqua 3-stage 20-inch Big Blue whole-house system shown on the linked product page. Check that product page for the current exact product specifications.',
  },
  {
    q: 'What does the system filter?',
    a: 'The supplied filtration configuration uses sediment and activated-carbon stages to reduce suspended sediment and improve chlorine, taste and odour. Treatment suitability depends on the incoming water and the cartridges supplied for the installation.',
  },
  {
    q: 'Where is a whole-house filter installed?',
    a: 'A whole-house filter is normally installed on the incoming cold-water main before water is distributed through the property, where the plumbing layout and access make that appropriate.',
  },
  {
    q: 'What counts as a standard installation?',
    a: 'The $2,399 + GST package applies where there is reasonable access to the incoming water main and typical plumbing requirements. Unusual access, extensive pipework, difficult excavation, non-standard plumbing or extra components may require a revised quote before work proceeds.',
  },
  {
    q: 'Can the standard package be used for rainwater or tank water?',
    a: 'Tank water can require a different treatment setup, including sediment filtration, carbon treatment and UV where appropriate. We confirm the water source and treatment requirements before recommending the standard mains-water package.',
  },
];

export const metadata: Metadata = {
  title: 'Whole House Water Filter Installation NSW | $2,399 + GST',
  description:
    'Whole-house water filter supplied and professionally installed for $2,399 excluding GST across eligible Central Coast and Sydney service areas. Standard installation conditions apply.',
  alternates: { canonical: PATH },
  openGraph: {
    title: 'Whole House Water Filter Installation NSW | $2,399 + GST',
    description:
      'Complete whole-house filtration system plus professional installation for $2,399 excluding GST across eligible Central Coast and Sydney service areas.',
    url: absoluteUrl(PATH),
  },
};

function serviceSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Whole House Water Filter Installation NSW',
    serviceType: 'Whole-house water filter installation',
    description:
      'Whole-house filtration system supplied and professionally installed for eligible properties across the NSW Central Coast and Sydney.',
    provider: {
      '@type': 'Organization',
      name: BUSINESS_INFO.name,
      telephone: BUSINESS_INFO.phone.tel,
      email: BUSINESS_INFO.email,
      url: getSiteUrl(),
    },
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Central Coast NSW' },
      { '@type': 'City', name: 'Sydney NSW' },
    ],
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(PATH),
      price: PRICE.toFixed(2),
      priceCurrency: 'AUD',
      description: 'Standard whole-house filtration system supply and installation package: $2,399 excluding GST; conditions apply.',
    },
  };
}

const breadcrumbs = [
  { name: 'Home', href: '/' },
  { name: 'Whole House Water Filter Installation', href: PATH },
];

export default function InstallPackagePage() {
  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbSchema(breadcrumbs.map((b) => ({ name: b.name, path: b.href }))),
          faqPageSchema(FAQ_ITEMS),
          serviceSchema(),
        ]}
      />
      <article className="bg-white">
        <section className="bg-gray-50 border-b border-gray-200">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <Breadcrumbs items={breadcrumbs} />
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-brand-blue">NSW installation service</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-black">
              Whole House Water Filter Installation — $2,399 + GST Supplied &amp; Installed
            </h1>
            <p className="mt-5 max-w-3xl text-lg text-black/70">
              Get a complete whole-house water filtration system supplied and professionally installed for $2,399 + GST. Available across eligible NSW Central Coast and Sydney service areas.
            </p>
            <p className="mt-3 text-sm text-black/60">Price excludes GST. Standard installation conditions apply.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#quote-form" className="inline-flex items-center justify-center rounded bg-brand-blue px-6 py-3 font-semibold text-white hover:bg-brand-blue-hover">Get Installed</a>
              <a href="#service-areas" className="inline-flex items-center justify-center rounded border border-gray-300 px-6 py-3 font-semibold text-black hover:bg-white">Check Service Area</a>
            </div>
          </div>
        </section>

        <section className="border-b border-gray-200">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="rounded-lg border border-gray-200 p-6 md:p-8">
              <p className="text-sm uppercase tracking-[0.14em] text-black/50">Standard package</p>
              <p className="mt-2 text-5xl font-bold text-black">$2,399 <span className="text-lg font-medium text-black/60">+ GST</span></p>
              <p className="mt-3 text-black/70">System + professional installation included. Price excludes GST. We confirm service area and standard-install suitability before booking.</p>
            </div>
          </div>
        </section>

        <section className="border-b border-gray-200">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-semibold text-black">What is included</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <InfoCard icon={Droplet} title="Whole-house filtration system" body="The complete 3-stage whole-house system, filter housings, supplied cartridges, mounting hardware and standard fittings for the package." />
              <InfoCard icon={Wrench} title="Professional installation" body="Installation on the incoming cold-water main where appropriate, plus standard plumbing work, testing and commissioning." />
              <InfoCard icon={MapPin} title="Central Coast + Sydney" body="Available across confirmed Central Coast service areas and eligible Sydney locations, subject to access and installation conditions." />
            </div>
            <p className="mt-6 text-sm text-black/60">For exact system specifications, see the <Link className="text-brand-blue hover:underline" href={PRODUCT_PATH}>whole-house product page</Link>.</p>
          </div>
        </section>

        <section className="border-b border-gray-200">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-semibold text-black">What is a standard installation?</h2>
            <p className="mt-4 text-black/70">The $2,399 + GST package applies to standard installations with reasonable access to the incoming water main and typical plumbing requirements. Unusual access, extensive pipework, difficult excavation, non-standard plumbing or additional components may require a revised quote before work proceeds.</p>
            <h2 className="mt-10 text-3xl font-semibold text-black">Where the system is installed</h2>
            <p className="mt-4 text-black/70">The system is typically installed on the incoming cold-water main, generally after the meter and before water is distributed through the property where the plumbing layout makes that suitable.</p>
            <h2 className="mt-10 text-3xl font-semibold text-black">What the system filters</h2>
            <p className="mt-4 text-black/70">The supplied configuration combines sediment filtration with activated-carbon stages. It is intended to reduce suspended sediment and improve chlorine, taste and odour. Tank-water and other non-standard sources may require a different treatment configuration.</p>
          </div>
        </section>

        <section id="service-areas" className="border-b border-gray-200 bg-gray-50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-semibold text-black">Choose your installation area</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <LocationCard title="Central Coast Whole House Water Filter Installation" body="Professional whole-house filter installation across the Central Coast, including Wyong, Tuggerah, Gosford, Erina, Terrigal, The Entrance, Woy Woy, Umina and surrounding areas." href={CENTRAL_COAST_PATH} cta="View Central Coast Installation" />
              <LocationCard title="Sydney Whole House Water Filter Installation" body="Professional whole-house water filter installation across eligible Sydney service areas, subject to service coverage and standard installation conditions." href={SYDNEY_PATH} cta="View Sydney Installation" />
            </div>
          </div>
        </section>

        <section className="border-b border-gray-200">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-semibold text-black">Installation process</h2>
            <ol className="mt-6 space-y-4 text-black/75">
              {['Confirm the property and service area.','Confirm standard-install suitability.','Book the installation.','The installer completes the plumbing installation.','The system is tested and commissioned.'].map((step, index) => (
                <li key={step} className="flex gap-4"><span className="font-semibold text-brand-blue">{index + 1}.</span><span>{step}</span></li>
              ))}
            </ol>
          </div>
        </section>

        <section id="quote-form" className="border-b border-gray-200">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-semibold text-black">Check installation availability</h2>
            <p className="mt-3 text-black/70">Tell us about the property and we can confirm service coverage and whether the standard package suits the installation.</p>
            <InstallationLeadForm productUrl={PRODUCT_PATH} />
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-semibold text-black">Frequently asked questions</h2>
            <div className="mt-6"><FaqAccordion items={FAQ_ITEMS} /></div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <Link className="text-brand-blue hover:underline" href="/water-filters/whole-house">Whole-house filters</Link>
              <Link className="text-brand-blue hover:underline" href="/help/whole-house-cost">Whole-house installation cost guide</Link>
              <Link className="text-brand-blue hover:underline" href={PRODUCT_PATH}>Exact system supplied</Link>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}

function InfoCard({ icon: Icon, title, body }: { icon: typeof Droplet; title: string; body: string }) {
  return <div className="rounded border border-gray-200 p-5"><Icon className="text-brand-blue" size={28} aria-hidden="true" /><h3 className="mt-4 font-semibold text-black">{title}</h3><p className="mt-2 text-sm text-black/70">{body}</p></div>;
}

function LocationCard({ title, body, href, cta }: { title: string; body: string; href: string; cta: string }) {
  return <div className="rounded-lg border border-gray-200 bg-white p-6"><h3 className="text-xl font-semibold text-black">{title}</h3><p className="mt-3 text-sm text-black/70">{body}</p><Link href={href} className="mt-5 inline-flex font-semibold text-brand-blue hover:underline">{cta}</Link></div>;
}
