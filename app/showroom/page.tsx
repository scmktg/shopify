import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';
import { BUSINESS_INFO, fullAddress } from '@/content/business-info';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { breadcrumbSchema, faqPageSchema, storeSchema } from '@/lib/seo/jsonld';

export const metadata: Metadata = {
  title: 'Visit Our Wyong Showroom - Water Filters Central Coast NSW',
  description:
    'Walk-in water filter showroom in Wyong NSW Central Coast. Big Blue systems on display, cartridges in stock, free Click & Collect and local whole-house installation advice.',
  alternates: { canonical: '/showroom' },
};

const SHOWROOM_LAT = -33.2802;
const SHOWROOM_LNG = 151.4257;
const CENTRAL_COAST_INSTALL = '/locations/central-coast-nsw/whole-house-water-filter-installation';

const SUBURBS_NEAREST = ['Wyong', 'Tuggerah', 'Lake Haven', 'The Entrance', 'Bateau Bay', 'Long Jetty', 'Toukley', 'Charmhaven'];
const SUBURBS_GREATER = ['Gosford', 'Erina', 'Terrigal', 'Avoca Beach', 'Woy Woy', 'Umina Beach'];

const FAQS = [
  { q: 'Where is the Enviro Aqua showroom?', a: `${fullAddress()}. We are in the Amsterdam Circuit industrial area in Wyong on the NSW Central Coast.` },
  { q: 'What are your opening hours?', a: 'The Wyong showroom is open Monday to Thursday, 9am to 3pm AEST, and Friday, 9am to 1pm AEST. We are closed on weekends and public holidays.' },
  { q: 'Do you offer Click & Collect?', a: 'Yes. Click & Collect is free with no minimum order. Most orders placed during business hours are ready within about one hour, and we send confirmation when they are ready.' },
  { q: 'Do you offer whole-house water filter installation on the Central Coast?', a: 'Yes. The standard whole-house installation package is $2,399 inc GST supplied and installed for eligible Central Coast properties, subject to standard installation conditions.' },
];

const GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress())}`;
const GOOGLE_MAPS_EMBED = `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress())}&z=15&output=embed`;

export default function ShowroomPage() {
  return (
    <>
      <JsonLdScript
        data={[
          storeSchema({ latitude: SHOWROOM_LAT, longitude: SHOWROOM_LNG, areaServed: [...SUBURBS_NEAREST, ...SUBURBS_GREATER], mapUrl: GOOGLE_MAPS_URL }),
          breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Showroom', path: '/showroom' }]),
          faqPageSchema(FAQS),
        ]}
      />

      <article className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div>
            <p className="text-sm font-semibold tracking-wider uppercase text-brand-blue">Showroom</p>
            <h1 className="mt-2 text-4xl md:text-5xl font-semibold text-black tracking-tight">Visit our Wyong showroom - Central Coast NSW</h1>
            <p className="mt-4 text-lg text-black/80 leading-snug">See whole-house systems, cartridges and water filtration products in person, talk through the right setup for your property, or collect an online order locally.</p>
            <dl className="mt-8 space-y-4">
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-black/60">Address</dt><dd className="mt-1 text-xl font-semibold text-black">{BUSINESS_INFO.address.street}<br />{BUSINESS_INFO.address.locality} {BUSINESS_INFO.address.region} {BUSINESS_INFO.address.postalCode}</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-black/60">Phone</dt><dd className="mt-1 text-xl font-semibold text-black"><a href={`tel:${BUSINESS_INFO.phone.tel}`} className="hover:text-brand-blue">{BUSINESS_INFO.phone.display}</a></dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-black/60">Hours</dt><dd className="mt-1 text-base text-black">Mon-Thu 9am-3pm · Fri 9am-1pm AEST · Closed weekends</dd></div>
            </dl>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold py-3 px-6 rounded"><MapPin className="h-4 w-4" aria-hidden="true" />Get directions</a>
              <a href={`tel:${BUSINESS_INFO.phone.tel}`} className="inline-flex items-center justify-center gap-2 bg-white border border-black hover:bg-gray-50 text-black font-semibold py-3 px-6 rounded"><Phone className="h-4 w-4" aria-hidden="true" />Call now</a>
            </div>
          </div>
          <div className="aspect-square lg:aspect-[4/5] w-full rounded overflow-hidden border border-gray-200"><iframe title="Map of the Enviro Aqua showroom in Wyong NSW" src={GOOGLE_MAPS_EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="w-full h-full" /></div>
        </section>

        <section className="mt-16 border-t border-gray-100 pt-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-black tracking-tight">What you can compare in the showroom</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div><h3 className="text-xl font-semibold text-black">Whole-house systems</h3><p className="mt-3 text-black/80">See the size, housings, connections and servicing access of a Big Blue whole-house system before ordering.</p></div>
            <div><h3 className="text-xl font-semibold text-black">Cartridges</h3><p className="mt-3 text-black/80">Compare sediment, carbon and other cartridge formats and bring an old cartridge if you need help matching the replacement size.</p></div>
            <div><h3 className="text-xl font-semibold text-black">Taps and filtration options</h3><p className="mt-3 text-black/80">Talk through under-sink, reverse osmosis and whole-house options based on where you want filtration and your water source.</p></div>
          </div>
        </section>

        <section className="mt-16 border-t border-gray-100 pt-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-black tracking-tight">Click &amp; Collect from Wyong</h2>
          <p className="mt-4 max-w-3xl text-black/80">Choose Click &amp; Collect at checkout. Most orders placed during business hours are ready within about one hour, and we email or text when the order is ready.</p>
        </section>

        <section className="mt-16 border-t border-gray-100 pt-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-black tracking-tight">Central Coast NSW suburbs we serve</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div><h3 className="text-sm font-semibold uppercase tracking-wide text-black/60">Closest to the showroom</h3><ul className="mt-3 grid grid-cols-2 gap-y-1 text-black">{SUBURBS_NEAREST.map((s) => <li key={s}>{s}</li>)}</ul></div>
            <div><h3 className="text-sm font-semibold uppercase tracking-wide text-black/60">Greater Central Coast</h3><ul className="mt-3 grid grid-cols-2 gap-y-1 text-black">{SUBURBS_GREATER.map((s) => <li key={s}>{s}</li>)}</ul></div>
          </div>
        </section>

        <section className="mt-16">
          <div className="bg-brand-blue-light border border-brand-blue/20 rounded-lg p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">Need a whole-house filter installed on the Central Coast?</h2>
            <p className="mt-3 text-base text-black/80 max-w-2xl">Our standard whole-house package is <strong>$2,399 inc GST supplied and installed</strong> for eligible Central Coast properties, subject to standard installation conditions.</p>
            <Link href={CENTRAL_COAST_INSTALL} className="mt-5 inline-flex items-center bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold py-3 px-6 rounded">View Central Coast installation →</Link>
          </div>
        </section>

        <section className="mt-16 border-t border-gray-100 pt-12">
          <h2 className="text-xl font-semibold text-black">Related</h2>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-2">
            <li><Link href="/water-filters/whole-house" className="text-brand-blue hover:underline">Whole-house water filters →</Link></li>
            <li><Link href={CENTRAL_COAST_INSTALL} className="text-brand-blue hover:underline">Central Coast installation →</Link></li>
            <li><Link href="/whole-house-installation-package" className="text-brand-blue hover:underline">NSW installation package →</Link></li>
            <li><Link href="/shipping" className="text-brand-blue hover:underline">Shipping &amp; Click &amp; Collect →</Link></li>
          </ul>
        </section>
      </article>
    </>
  );
}
