import type { Metadata } from 'next';
import Link from 'next/link';
import { BUSINESS_INFO } from '@/content/business-info';
import { Breadcrumbs } from '@/components/editorial/Breadcrumbs';
import { FaqAccordion } from '@/components/editorial/FaqAccordion';
import { InstallationLeadForm } from '@/components/install/InstallationLeadForm';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { breadcrumbSchema, faqPageSchema, type JsonLd } from '@/lib/seo/jsonld';
import { absoluteUrl, getSiteUrl } from '@/lib/seo/siteUrl';

const PATH = '/locations/sydney-nsw/whole-house-water-filter-installation';
const PRICE = 2399;
const PRODUCT_PATH = '/water-filters/whole-house/wm-3-stages-20-x-4-5-triple-big-blue-whole-house-water-filter-system/';

export const metadata: Metadata = {
  title: 'Whole House Water Filter Installation Sydney | $2,399',
  description: 'Whole-house water filter supplied and professionally installed across eligible Sydney properties for $2,399 inc GST. Standard installation conditions and service coverage apply.',
  alternates: { canonical: PATH },
};

const FAQ_ITEMS = [
  { q: 'How much does whole-house water filter installation cost in Sydney?', a: "Enviro Aqua's standard whole-house installation package is $2,399 inc GST supplied and installed, subject to confirmed service coverage and standard installation conditions." },
  { q: 'Where in Sydney do you install?', a: 'Sydney service coverage is confirmed before booking. We do not publish suburb-by-suburb coverage until availability is confirmed for the property.' },
  { q: 'What does the system treat?', a: 'The supplied configuration uses sediment and activated-carbon filtration to reduce suspended sediment and improve chlorine, taste and odour on suitable mains-water supplies.' },
  { q: 'Where is the system installed?', a: 'The system is generally installed on the incoming cold-water main before water is distributed through the property where the plumbing layout and access make that appropriate.' },
];

function serviceSchema(): JsonLd {
  return {
    '@context': 'https://schema.org', '@type': 'Service',
    name: 'Whole House Water Filter Installation Sydney',
    serviceType: 'Whole-house water filter installation',
    provider: { '@type': 'Organization', name: BUSINESS_INFO.name, telephone: BUSINESS_INFO.phone.tel, url: getSiteUrl() },
    areaServed: { '@type': 'City', name: 'Sydney NSW' },
    offers: { '@type': 'Offer', url: absoluteUrl(PATH), price: PRICE.toFixed(2), priceCurrency: 'AUD', description: 'Standard whole-house filtration system supplied and installed; service coverage and conditions apply.' },
  };
}

const breadcrumbs = [
  { name: 'Home', href: '/' },
  { name: 'Locations', href: '/locations' },
  { name: 'Sydney NSW', href: '/locations/sydney-nsw' },
  { name: 'Whole House Water Filter Installation', href: PATH },
];

export default function SydneyInstallationPage() {
  return <>
    <JsonLdScript data={[breadcrumbSchema(breadcrumbs.map((b) => ({ name: b.name, path: b.href }))), faqPageSchema(FAQ_ITEMS), serviceSchema()]} />
    <article className="bg-white">
      <section className="bg-gray-50 border-b border-gray-200"><div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 md:py-16"><Breadcrumbs items={breadcrumbs} /><h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-black">Whole House Water Filter Installation Sydney</h1><p className="mt-5 text-xl text-black/70">Complete whole-house filtration supplied and professionally installed for <strong>$2,399 inc GST</strong> across eligible Sydney service areas.</p><p className="mt-3 text-sm text-black/60">Service coverage and standard installation conditions apply.</p><div className="mt-7 flex flex-wrap gap-3"><a href="#quote-form" className="rounded bg-brand-blue px-6 py-3 font-semibold text-white">Book Installation</a><Link href="/locations/sydney-nsw" className="rounded border border-gray-300 px-6 py-3 font-semibold text-black">Sydney Service Area</Link></div></div></section>
      <section className="border-b border-gray-200"><div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12"><h2 className="text-3xl font-semibold">Whole-home filtration for Sydney mains water</h2><p className="mt-4 text-black/70">This service is designed for suitable Sydney mains-water properties where the goal is whole-property sediment and activated-carbon treatment before water reaches taps, showers and appliances.</p><p className="mt-4 text-black/70">We confirm whether the property is within the current Sydney installation area before booking. No Sydney business address is represented on this page.</p></div></section>
      <section className="border-b border-gray-200"><div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12"><h2 className="text-3xl font-semibold">$2,399 inc GST supplied &amp; installed</h2><p className="mt-4 text-black/70">The standard package includes the whole-house filtration system, supplied cartridges, mounting hardware, standard fittings, professional plumbing installation, testing and commissioning.</p><p className="mt-4 text-sm text-black/60">Unusual access, extensive pipework, excavation, non-standard plumbing or extra components may require a revised quote before work proceeds.</p></div></section>
      <section className="border-b border-gray-200"><div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12"><h2 className="text-3xl font-semibold">System and installation details</h2><p className="mt-4 text-black/70">The supplied 3-stage system uses sediment and activated-carbon filtration. Installation is normally on the incoming cold-water main before distribution through the property where appropriate.</p><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm"><Link className="text-brand-blue hover:underline" href={PRODUCT_PATH}>Exact system supplied</Link><Link className="text-brand-blue hover:underline" href="/water-filters/whole-house">Whole-house filters</Link><Link className="text-brand-blue hover:underline" href="/help/whole-house-cost">Installation cost guide</Link><Link className="text-brand-blue hover:underline" href="/whole-house-installation-package">NSW installation hub</Link></div></div></section>
      <section id="quote-form" className="border-b border-gray-200"><div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12"><h2 className="text-3xl font-semibold">Check Sydney installation availability</h2><p className="mt-3 text-black/70">Tell us about the property so we can confirm Sydney service coverage and standard-install suitability.</p><InstallationLeadForm productUrl={PRODUCT_PATH} /></div></section>
      <section><div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12"><h2 className="text-3xl font-semibold">Sydney installation FAQs</h2><div className="mt-6"><FaqAccordion items={FAQ_ITEMS} /></div></div></section>
    </article>
  </>;
}
