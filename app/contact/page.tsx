import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import { BUSINESS_INFO, fullAddress } from '@/content/business-info';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { breadcrumbSchema } from '@/lib/seo/jsonld';

const PATH = '/contact';

export const metadata: Metadata = {
  title: 'Contact Enviro Aqua — Phone, Email, Wyong NSW Showroom',
  description:
    'Talk to a real person about water filtration. Phone (02) 8772 8162, email info@enviroaqua.com.au, or visit our Wyong NSW Central Coast showroom. One business day response.',
  alternates: { canonical: PATH },
  openGraph: {
    title: 'Contact Enviro Aqua — Phone, Email, Wyong NSW Showroom',
    description:
      'Talk to a real person about water filtration. Phone, email, and walk-in showroom on the NSW Central Coast.',
    url: PATH,
    type: 'website',
  },
};

const GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress())}`;
const GOOGLE_MAPS_EMBED = `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress())}&z=15&output=embed`;

const HELP_WITH: ReadonlyArray<string> = [
  'Product compatibility — "which cartridge fits my system?"',
  'Sizing advice for whole-house and rural setups',
  'Order status, tracking, and delivery questions',
  'Returns, warranty claims, and faulty-product reports',
  'Trade-account setup for installers ordering regularly',
  'WaterMark licence number verification',
];

export default function ContactPage() {
  return (
    <>
      <JsonLdScript
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Contact', path: PATH },
        ])}
      />

      <article className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* HERO */}
        <section>
          <p className="text-sm font-semibold tracking-wider uppercase text-brand-blue">
            Contact
          </p>
          <h1 className="mt-2 text-4xl md:text-5xl font-semibold text-black tracking-tight">
            Talk to a real person about water filtration
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-black/80 leading-snug">
            Phone, email, or walk in. We answer every enquiry within
            one business day — usually within an hour during showroom
            hours. No call centres, no scripts.
          </p>
        </section>

        {/* CONTACT METHOD CARDS */}
        <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="border border-gray-200 rounded-lg p-6 flex flex-col">
            <Phone
              className="h-6 w-6 text-brand-blue"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-xs font-semibold uppercase tracking-wide text-black/60">
              Phone
            </h2>
            <a
              href={`tel:${BUSINESS_INFO.phone.tel}`}
              className="mt-1 text-2xl font-semibold text-black tabular-nums hover:text-brand-blue"
            >
              {BUSINESS_INFO.phone.display}
            </a>
            <p className="mt-3 text-sm text-black/70 leading-snug">
              {BUSINESS_INFO.phoneSupportHours} AEST. Outside those
              hours, leave a voicemail and we will call back the next
              business day.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 flex flex-col">
            <Mail
              className="h-6 w-6 text-brand-blue"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-xs font-semibold uppercase tracking-wide text-black/60">
              Email
            </h2>
            <a
              href={`mailto:${BUSINESS_INFO.email}`}
              className="mt-1 text-xl font-semibold text-black break-all hover:text-brand-blue"
            >
              {BUSINESS_INFO.email}
            </a>
            <p className="mt-3 text-sm text-black/70 leading-snug">
              One business day response. Include your order number if
              your enquiry is about an existing order.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 flex flex-col">
            <Clock
              className="h-6 w-6 text-brand-blue"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-xs font-semibold uppercase tracking-wide text-black/60">
              Hours
            </h2>
            <p className="mt-1 text-xl font-semibold text-black">
              {BUSINESS_INFO.showroom.hours}
            </p>
            <p className="mt-3 text-sm text-black/70 leading-snug">
              Showroom and phone support, Monday to Friday. Closed on
              weekends and NSW public holidays.
            </p>
          </div>
        </section>

        {/* SHOWROOM + MAP */}
        <section className="mt-16 border-t border-gray-100 pt-12">
          <p className="text-sm font-semibold tracking-wider uppercase text-brand-blue">
            Visit in person
          </p>
          <h2 className="mt-2 text-3xl md:text-4xl font-semibold text-black tracking-tight">
            Wyong showroom — Central Coast NSW
          </h2>
          <p className="mt-3 max-w-2xl text-base text-black/80 leading-snug">
            Walk in any time during business hours. No appointment
            needed. Big Blue systems on display, every standard
            cartridge in stock, free Click &amp; Collect.
          </p>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div>
              <dl className="space-y-5">
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
                    Hours
                  </dt>
                  <dd className="mt-1 text-base text-black">
                    Monday to Friday, 9am – 5pm AEST
                    <br />
                    <span className="text-black/70">
                      Closed weekends and NSW public holidays
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-black/60">
                    Click &amp; Collect
                  </dt>
                  <dd className="mt-1 text-base text-black leading-snug">
                    Free pickup on every order, no minimum. Most orders
                    ready within two hours during business hours — we
                    email or text when yours is ready.
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

              <p className="mt-6 text-sm text-black/70">
                For a full walkthrough of what is on display and how
                to get here, see the{' '}
                <Link
                  href="/showroom/"
                  className="text-brand-blue underline underline-offset-4 hover:text-brand-blue-hover"
                >
                  showroom page
                </Link>
                .
              </p>
            </div>

            <div className="aspect-video lg:aspect-[4/5] w-full rounded overflow-hidden border border-gray-200">
              <iframe
                title="Map of the Enviro Aqua showroom in Wyong NSW"
                src={GOOGLE_MAPS_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
          </div>
        </section>

        {/* WHAT WE CAN HELP WITH */}
        <section className="mt-16 border-t border-gray-100 pt-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-black tracking-tight">
            What we can help with
          </h2>
          <ul className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 list-disc pl-6 text-base text-black/80">
            {HELP_WITH.map((item) => (
              <li key={item} className="leading-snug">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-2xl text-sm text-black/70 leading-snug">
            We do not currently offer installation across Australia.
            If you need a licensed plumber on the Central Coast NSW,
            see our{' '}
            <Link
              href="/whole-house-installation-package/"
              className="text-brand-blue underline underline-offset-4 hover:text-brand-blue-hover"
            >
              whole-house installation package
            </Link>{' '}
            — elsewhere, get in touch with the system you are
            installing and we can recommend installers we work with.
          </p>
        </section>

        {/* SOCIAL */}
        <section className="mt-16 border-t border-gray-100 pt-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-black tracking-tight">
            Follow along
          </h2>
          <p className="mt-3 max-w-2xl text-base text-black/80 leading-snug">
            Install photos, product breakdowns, and the occasional
            showroom update.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href={BUSINESS_INFO.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 border border-gray-200 hover:border-black rounded-lg px-5 py-3 text-black transition-colors"
            >
              <Facebook
                className="h-5 w-5 text-brand-blue"
                aria-hidden="true"
              />
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-black/60">
                  Facebook
                </span>
                <span className="block text-base font-semibold">
                  facebook.com/EnviroAqua.com.au
                </span>
              </span>
            </a>
            <a
              href={BUSINESS_INFO.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 border border-gray-200 hover:border-black rounded-lg px-5 py-3 text-black transition-colors"
            >
              <Instagram
                className="h-5 w-5 text-brand-blue"
                aria-hidden="true"
              />
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-black/60">
                  Instagram
                </span>
                <span className="block text-base font-semibold">
                  @enviro_aqua
                </span>
              </span>
            </a>
          </div>
        </section>

        {/* PRIVACY + RELATED */}
        <section className="mt-16 border-t border-gray-100 pt-12">
          <h2 className="text-xl font-semibold text-black tracking-tight">
            Related
          </h2>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-2 list-none">
            <li>
              <Link
                href="/help/"
                className="text-brand-blue hover:underline underline-offset-4"
              >
                Help &amp; buying guides →
              </Link>
            </li>
            <li>
              <Link
                href="/shipping/"
                className="text-brand-blue hover:underline underline-offset-4"
              >
                Shipping &amp; delivery →
              </Link>
            </li>
            <li>
              <Link
                href="/returns/"
                className="text-brand-blue hover:underline underline-offset-4"
              >
                Returns &amp; warranty →
              </Link>
            </li>
            <li>
              <Link
                href="/showroom/"
                className="text-brand-blue hover:underline underline-offset-4"
              >
                Visit our showroom →
              </Link>
            </li>
          </ul>
          <p className="mt-8 text-sm text-black/70 leading-snug">
            Information you send us is handled per our{' '}
            <Link
              href="/privacy/"
              className="text-brand-blue underline underline-offset-4 hover:text-brand-blue-hover"
            >
              privacy policy
            </Link>
            . We use your contact details to respond to your enquiry
            and nothing else.
          </p>
        </section>
      </article>
    </>
  );
}
