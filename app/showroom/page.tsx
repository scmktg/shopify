import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';
import { BUSINESS_INFO, fullAddress } from '@/content/business-info';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import {
  breadcrumbSchema,
  faqPageSchema,
  storeSchema,
} from '@/lib/seo/jsonld';

export const metadata: Metadata = {
  title:
    'Visit Our Wyong Showroom — Water Filters Central Coast NSW',
  description:
    'Walk-in water filter showroom in Wyong NSW Central Coast. Big Blue systems on display, cartridges in stock, free Click & Collect. Same-day dispatch on orders before 12pm. Mon–Fri 9–5.',
  alternates: { canonical: '/showroom/' },
  openGraph: {
    title:
      'Visit Our Wyong Showroom — Water Filters Central Coast NSW',
    description:
      'Walk-in water filter showroom in Wyong NSW Central Coast. Big Blue systems on display, cartridges in stock, free Click & Collect.',
    url: '/showroom/',
    type: 'website',
  },
  twitter: {
    title:
      'Visit Our Wyong Showroom — Water Filters Central Coast NSW',
    description:
      'Walk-in water filter showroom in Wyong NSW Central Coast. Big Blue systems on display, cartridges in stock, free Click & Collect.',
  },
};

const SHOWROOM_LAT = -33.2802;
const SHOWROOM_LNG = 151.4257;

const SUBURBS_NEAREST: ReadonlyArray<string> = [
  'Wyong',
  'Tuggerah',
  'Lake Haven',
  'The Entrance',
  'Bateau Bay',
  'Long Jetty',
  'Toukley',
  'Charmhaven',
];

const SUBURBS_GREATER: ReadonlyArray<string> = [
  'Gosford',
  'Erina',
  'Terrigal',
  'Avoca Beach',
  'Woy Woy',
  'Umina Beach',
];

const FAQS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: 'Where is the Enviro Aqua showroom?',
    a: `${fullAddress()}. We're in the Amsterdam Circuit industrial area, two minutes off the M1 at the Wyong/Toukley exit.`,
  },
  {
    q: 'What are your opening hours?',
    a: 'The Wyong showroom is open Monday to Friday, 9am to 5pm AEST. We are closed on weekends and public holidays.',
  },
  {
    q: 'Do you offer Click & Collect?',
    a: 'Yes — Click & Collect is free with no minimum order. Order online before 12pm and most orders are ready within an hour. You will get an email confirmation when it is ready to collect.',
  },
  {
    q: 'Can I bring my old cartridge in for a replacement match?',
    a: 'Yes. Bring your old cartridge into the showroom and we will identify it on the spot — every standard 10-inch and 20-inch cartridge size is on the wall, and we can match by housing diameter, length, or thread type in 30 seconds.',
  },
  {
    q: 'Do you offer trade pricing?',
    a: 'No — and that is the point. Same wholesale price for everyone, retail or trade, with no accounts and no minimum orders. The price you see online is the price every customer pays.',
  },
];

const GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress())}`;
const GOOGLE_MAPS_EMBED = `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress())}&z=15&output=embed`;

export default function ShowroomPage() {
  return (
    <>
      <JsonLdScript
        data={[
          storeSchema({
            latitude: SHOWROOM_LAT,
            longitude: SHOWROOM_LNG,
            areaServed: [...SUBURBS_NEAREST, ...SUBURBS_GREATER],
            mapUrl: GOOGLE_MAPS_URL,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Showroom', path: '/showroom/' },
          ]),
          faqPageSchema(FAQS.map((f) => ({ q: f.q, a: f.a }))),
        ]}
      />

      <article className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* HERO */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div>
            <p className="text-sm font-semibold tracking-wider uppercase text-brand-blue">
              Showroom
            </p>
            <h1 className="mt-2 text-4xl md:text-5xl font-semibold text-black tracking-tight">
              Visit our Wyong showroom — Central Coast NSW
            </h1>
            <p className="mt-4 text-lg text-black/80 leading-snug">
              Walk in, see the systems running, talk to a real
              person. Same-day dispatch from this same warehouse on
              orders placed before 12pm.
            </p>

            <dl className="mt-8 space-y-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-black/60">
                  Address
                </dt>
                <dd className="mt-1 text-xl font-semibold text-black">
                  {BUSINESS_INFO.address.street}
                  <br />
                  {BUSINESS_INFO.address.locality}{' '}
                  {BUSINESS_INFO.address.region}{' '}
                  <span className="tabular-nums">
                    {BUSINESS_INFO.address.postalCode}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-black/60">
                  Phone
                </dt>
                <dd className="mt-1 text-xl font-semibold text-black">
                  <a
                    href={`tel:${BUSINESS_INFO.phone.tel}`}
                    className="hover:text-brand-blue tabular-nums"
                  >
                    {BUSINESS_INFO.phone.display}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-black/60">
                  Hours
                </dt>
                <dd className="mt-1 text-base text-black">
                  Mon–Fri 9am–5pm AEST · Closed weekends
                </dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold py-3 px-6 rounded transition-colors"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Get directions
              </a>
              <a
                href={`tel:${BUSINESS_INFO.phone.tel}`}
                className="inline-flex items-center justify-center gap-2 bg-white border border-black hover:bg-gray-50 text-black font-semibold py-3 px-6 rounded transition-colors"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call now
              </a>
            </div>
          </div>

          <div className="aspect-square lg:aspect-[4/5] w-full rounded overflow-hidden border border-gray-200">
            <iframe
              title="Map of the Enviro Aqua showroom in Wyong NSW"
              src={GOOGLE_MAPS_EMBED}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
        </section>

        {/* WHAT'S IN THE SHOWROOM */}
        <section className="mt-16 border-t border-gray-100 pt-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-black tracking-tight">
            What you&apos;ll see when you walk in
          </h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-black tracking-tight">
                The Big Blue stack on display
              </h3>
              <p className="mt-3 text-base text-black/80 leading-snug">
                The Three-Stage Big Blue Whole House system fully
                assembled and running on the showroom wall — see the
                housings, the stainless enclosure, the brass
                connections, the pressure gauges in action.
                Customers regularly ask &quot;is this what it
                actually looks like installed?&quot; and the answer
                is yes.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-black tracking-tight">
                Working cartridge demonstrations
              </h3>
              <p className="mt-3 text-base text-black/80 leading-snug">
                Cut-away filter housings showing the carbon block,
                sediment, and RO membrane media. Useful when
                comparing systems — visual confirmation of what is
                inside the cartridge changes the conversation.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-black tracking-tight">
                Replacement parts wall
              </h3>
              <p className="mt-3 text-base text-black/80 leading-snug">
                Every standard 10-inch and 20-inch cartridge in
                stock, plus housings, fittings, taps, and pressure
                tanks. Bring your old cartridge in for a match —
                we&apos;ll tell you what it is in 30 seconds.
              </p>
            </div>
          </div>
        </section>

        {/* HOW TO FIND US */}
        <section className="mt-16 border-t border-gray-100 pt-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-black tracking-tight">
            Getting here
          </h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-black tracking-tight">
                From the M1 (Sydney-bound)
              </h3>
              <p className="mt-2 text-base text-black/80 leading-snug">
                Take the Wyong / Toukley exit (signed at the
                interchange) and follow the Pacific Highway south
                for approximately one kilometre. Turn into Amsterdam
                Circuit just past the industrial area on the right;
                the showroom is in unit 6 of number 45.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-black tracking-tight">
                From the M1 (Newcastle-bound)
              </h3>
              <p className="mt-2 text-base text-black/80 leading-snug">
                Take the Wyong / Tuggerah exit and head north on the
                Pacific Highway. Continue for about two kilometres
                and turn left into Amsterdam Circuit, set back from
                the highway in the industrial precinct.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-black tracking-tight">
                By train
              </h3>
              <p className="mt-2 text-base text-black/80 leading-snug">
                Wyong railway station is approximately 1.5km from
                the showroom — about a 20-minute walk via Watanobbi
                Road, or a short taxi ride from the rank out the
                front of the station.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-black tracking-tight">
                Parking
              </h3>
              <p className="mt-2 text-base text-black/80 leading-snug">
                Free off-street parking at the front of the unit.
                Trade vehicles welcome — there is room to pull a ute
                or van right up to the roller door for loading.
              </p>
            </div>
          </div>
        </section>

        {/* CLICK & COLLECT */}
        <section className="mt-16 border-t border-gray-100 pt-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-black tracking-tight">
            Click &amp; Collect from Wyong
          </h2>
          <ol className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 list-none">
            <li>
              <p className="text-sm font-semibold text-brand-blue tabular-nums">
                Step 1
              </p>
              <p className="mt-1 text-base text-black/80 leading-snug">
                Order online before 12pm. Choose &quot;Click &amp;
                Collect&quot; at checkout — free, no minimum order.
              </p>
            </li>
            <li>
              <p className="text-sm font-semibold text-brand-blue tabular-nums">
                Step 2
              </p>
              <p className="mt-1 text-base text-black/80 leading-snug">
                We pack and confirm by email within 2 hours.
                You&apos;ll get a &quot;ready for collection&quot;
                notification.
              </p>
            </li>
            <li>
              <p className="text-sm font-semibold text-brand-blue tabular-nums">
                Step 3
              </p>
              <p className="mt-1 text-base text-black/80 leading-snug">
                Walk in any time during showroom hours. Bring photo
                ID or your order number. We&apos;ll have your order
                at the counter.
              </p>
            </li>
          </ol>
          <p className="mt-6 text-sm text-black/70">
            No appointment needed. Most orders are ready within an
            hour.
          </p>
        </section>

        {/* SUBURBS WE SERVE */}
        <section className="mt-16 border-t border-gray-100 pt-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-black tracking-tight">
            Central Coast NSW suburbs we serve
          </h2>
          <p className="mt-3 text-base text-black/80">
            Walk-in, Click &amp; Collect, and same-day dispatch
            across the Central Coast.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-black/60">
                Closest to the showroom
              </h3>
              <ul className="mt-3 grid grid-cols-2 gap-y-1 text-base text-black list-none">
                {SUBURBS_NEAREST.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-black/60">
                Greater Central Coast
              </h3>
              <ul className="mt-3 grid grid-cols-2 gap-y-1 text-base text-black list-none">
                {SUBURBS_GREATER.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-6 text-sm text-black/70">
            Outside the Central Coast? We ship Australia-wide via
            tracked freight — see{' '}
            <Link
              href="/shipping/"
              className="text-brand-blue underline underline-offset-4 hover:text-brand-blue-hover"
            >
              shipping
            </Link>{' '}
            for rates and timing.
          </p>
        </section>

        {/* INSTALL PACKAGE CALLOUT */}
        <section className="mt-16">
          <div className="bg-brand-blue-light border border-brand-blue/20 rounded-lg p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
              Live on the Central Coast NSW?
            </h2>
            <p className="mt-3 text-base text-black/80 leading-snug max-w-2xl">
              We offer professional whole-house water filter
              installation by licensed local plumbers. WaterMark-
              certified Big Blue system, installation, and 12 months
              of replacement cartridges — all-inclusive for{' '}
              <span className="tabular-nums font-semibold">$2,299</span>.
            </p>
            <Link
              href="/whole-house-installation-package/"
              className="mt-5 inline-flex items-center bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold py-3 px-6 rounded transition-colors"
            >
              See the install package →
            </Link>
          </div>
        </section>

        {/* WHAT TO EXPECT */}
        <section className="mt-16 border-t border-gray-100 pt-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-black tracking-tight">
            First time visiting?
          </h2>
          <ul className="mt-6 space-y-3 text-base text-black/80 list-disc pl-6">
            <li>
              Walk in, no appointment. Someone will be with you
              within a minute.
            </li>
            <li>
              Bring your old cartridge if you&apos;re unsure what
              fits — we stock matches for every standard 10-inch and
              20-inch housing.
            </li>
            <li>
              Trade and retail welcome. Same wholesale price for
              everyone, no accounts, no minimums.
            </li>
          </ul>
        </section>

        {/* RELATED LINKS */}
        <section className="mt-16 border-t border-gray-100 pt-12">
          <h2 className="text-xl font-semibold text-black tracking-tight">
            Related
          </h2>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-2 list-none">
            <li>
              <Link
                href="/water-filters/"
                className="text-brand-blue hover:underline underline-offset-4"
              >
                Browse water filter systems →
              </Link>
            </li>
            <li>
              <Link
                href="/cartridges/"
                className="text-brand-blue hover:underline underline-offset-4"
              >
                Replacement cartridges →
              </Link>
            </li>
            <li>
              <Link
                href="/whole-house-installation-package/"
                className="text-brand-blue hover:underline underline-offset-4"
              >
                Whole-house installation package →
              </Link>
            </li>
            <li>
              <Link
                href="/shipping/"
                className="text-brand-blue hover:underline underline-offset-4"
              >
                Shipping &amp; Click &amp; Collect →
              </Link>
            </li>
            <li>
              <Link
                href="/help/which-filter/"
                className="text-brand-blue hover:underline underline-offset-4"
              >
                Not sure which filter? Run the quiz →
              </Link>
            </li>
            <li>
              <Link
                href="/contact/"
                className="text-brand-blue hover:underline underline-offset-4"
              >
                Contact →
              </Link>
            </li>
          </ul>
        </section>
      </article>
    </>
  );
}
