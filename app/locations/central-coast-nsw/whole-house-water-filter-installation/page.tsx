import type { Metadata } from 'next';
import Link from 'next/link';
import { BUSINESS_INFO } from '@/content/business-info';
import { Breadcrumbs } from '@/components/editorial/Breadcrumbs';
import { FaqAccordion } from '@/components/editorial/FaqAccordion';
import { InstallationLeadForm } from '@/components/install/InstallationLeadForm';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { breadcrumbSchema, faqPageSchema, type JsonLd } from '@/lib/seo/jsonld';
import { absoluteUrl, getSiteUrl } from '@/lib/seo/siteUrl';

const PATH = '/locations/central-coast-nsw/whole-house-water-filter-installation';
const PRICE = 2399;
const PRODUCT_PATH = '/water-filters/whole-house/wm-3-stages-20-x-4-5-triple-big-blue-whole-house-water-filter-system/';

export const metadata: Metadata = {
  title: 'Whole House Water Filter Installation Central Coast | $2,399',
  description: 'Whole-house water filter supplied and professionally installed across eligible Central Coast NSW properties for $2,399 inc GST. Standard installation conditions apply.',
  alternates: { canonical: PATH },
};

const FAQ_ITEMS = [
  { q: 'How much does whole-house water filter installation cost on the Central Coast?', a: "Enviro Aqua's standard package is $2,399 inc GST supplied and installed, subject to standard installation conditions." },
  { q: 'Which Central Coast areas do you service?', a: 'We coordinate installations across the Central Coast including Wyong, Tuggerah, Gosford, Erina, Terrigal, The Entrance, Woy Woy, Umina and surrounding areas. Availability is confirmed before booking.' },
  { q: 'Where is Enviro Aqua based?', a: 'Enviro Aqua has a showroom and warehouse in Wyong on the NSW Central Coast, which supports local product pickup, advice and installation coordination.' },
  { q: 'Can the standard package be used for tank water?', a: 'Not automatically. Rural and tank-water properties can require a different treatment configuration, including UV where appropriate. We confirm the water source before recommending the system.' },
];

function serviceSchema(): JsonLd {
  return {
    '@context': 'https://schema.org', '@type': 'Service',
    name: 'Whole House Water Filter Installation Central Coast',
    serviceType: 'Whole-house water filter installation',
    provider: { '@type': 'LocalBusiness', name: BUSINESS_INFO.name, telephone: BUSINESS_INFO.phone.tel, url: getSiteUrl(), address: { '@type': 'PostalAddress', streetAddress: BUSINESS_INFO.address.street, addressLocality: BUSINESS_INFO.address.locality, addressRegion: BUSINESS_INFO.address.region, postalCode: BUSINESS_INFO.address.postalCode, addressCountry: BUSINESS_INFO.address.country } },
    areaServed: { '@type': 'AdministrativeArea', name: 'Central Coast NSW' },
    offers: { '@type': 'Offer', url: absoluteUrl(PATH), price: PRICE.toFixed(2), priceCurrency: 'AUD', description: 'Standard whole-house filtration system supplied and installed; conditions apply.' },
  };
}

const breadcrumbs = [
  { name: 'Home', href: '/' },
  { name: 'Locations', href: '/locations' },
  { name: 'Central Coast NSW', href: '/locations/central-coast-nsw' },
  { name: 'Whole House Water Filter Installation', href: PATH },
];

export default function CentralCoastInstallationPage() {
  return <>
    <JsonLdScript data={[breadcrumbSchema(breadcrumbs.map((b) => ({ name: b.name, path: b.href }))), faqPageSchema(FAQ_ITEMS), serviceSchema()]} />
    <article className="bg-white">
      <section className="bg-gray-50 border-b border-gray-200"><div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 md:py-16"><Breadcrumbs items={breadcrumbs} /><h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-black">Whole House Water Filter Installation Central Coast</h1><p className="mt-5 text-xl text-black/70">Complete whole-house filtration supplied and professionally installed for <strong>$2,399 inc GST</strong>, subject to standard installation conditions.</p><div className="mt-7 flex flex-wrap gap-3"><a href="#quote-form" className="rounded bg-brand-blue px-6 py-3 font-semibold text-white">Book Installation</a><Link href="/showroom" className="rounded border border-gray-300 px-6 py-3 font-semibold text-black">Visit Wyong Showroom</Link></div></div></section>
      <section className="border-b border-gray-200"><div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12"><h2 className="text-3xl font-semibold">Local Central Coast installation</h2><p className="mt-4 text-black/70">Enviro Aqua is based in Wyong, with local installation coordination for Central Coast homes. Service coverage includes Wyong, Tuggerah, Gosford, Erina, Terrigal, The Entrance, Woy Woy, Umina and surrounding Central Coast suburbs.</p><p className="mt-4 text-black/70">The standard package is intended for suitable mains-water properties. Rural and tank-water properties are assessed separately because treatment requirements can differ.</p></div></section>
      <section className="border-b border-gray-200"><div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12"><h2 className="text-3xl font-semibold">$2,399 inc GST supplied &amp; installed</h2><p className="mt-4 text-black/70">The package includes the whole-house filtration system, supplied cartridges, mounting hardware, standard fittings, professional plumbing installation, testing and commissioning.</p><p className="mt-4 text-sm text-black/60">Standard installation requires reasonable access to the incoming water main and typical plumbing requirements. Unusual access, extensive pipework, excavation, non-standard plumbing or additional components may require a revised quote before work proceeds.</p></div></section>
      <section className="border-b border-gray-200"><div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12"><h2 className="text-3xl font-semibold">System and installation details</h2><p className="mt-4 text-black/70">The supplied 3-stage whole-house system uses sediment and activated-carbon filtration. It is typically installed on the incoming cold-water main before distribution through the property where the plumbing layout makes that appropriate.</p><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm"><Link className="text-brand-blue hover:underline" href={PRODUCT_PATH}>Exact system supplied</Link><Link className="text-brand-blue hover:underline" href="/water-filters/whole-house">Whole-house filters</Link><Link className="text-brand-blue hover:underline" href="/help/whole-house-cost">Installation cost guide</Link><Link className="text-brand-blue hover:underline" href="/whole-house-installation-package">NSW installation hub</Link></div></div></section>
      <section id="quote-form" className="border-b border-gray-200"><div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12"><h2 className="text-3xl font-semibold">Check Central Coast installation availability</h2><p className="mt-3 text-black/70">Tell us about the property so we can confirm service coverage and standard-install suitability.</p><InstallationLeadForm productUrl={PRODUCT_PATH} /></div></section>
      <section><div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12"><h2 className="text-3xl font-semibold">Central Coast installation FAQs</h2><div className="mt-6"><FaqAccordion items={FAQ_ITEMS} /></div></div></section>
    </article>
  </>;
}
