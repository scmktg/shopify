import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Box,
  Check,
  ClipboardList,
  Droplets,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  RefreshCw,
  ShieldCheck,
  Truck,
  Wrench,
} from 'lucide-react';
import { BUSINESS_INFO } from '@/content/business-info';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { breadcrumbSchema } from '@/lib/seo/jsonld';

const PATH = '/plumbers-and-installers/';
const EMAIL_SUBJECT = 'Plumber & Installer Supply Enquiry';
const enquiryHref = `mailto:${BUSINESS_INFO.email}?subject=${encodeURIComponent(EMAIL_SUBJECT)}`;

export const metadata: Metadata = {
  title: 'For Plumbers & Installers | Water Filtration Supply',
  description:
    'Water filtration, drinking fountains, replacement cartridges and installation components for Australian plumbers. Upfront wholesale prices, no trade account required, Australia-wide delivery.',
  alternates: { canonical: PATH },
  openGraph: {
    title: 'For Plumbers & Installers | Enviro Aqua',
    description:
      'Your water filtration supply partner for installations, replacements and ongoing maintenance. Explore the range or talk to our Wyong team.',
    url: PATH,
    type: 'website',
  },
};

const BENEFITS = [
  {
    icon: BadgeCheck,
    title: 'Straightforward pricing',
    body: 'Upfront wholesale pricing for everyone. No trade account, minimum order or quote request needed to see our product prices.',
  },
  {
    icon: PackageCheck,
    title: 'One place for the essentials',
    body: 'Source complete filtration systems, drinking fountains, replacement cartridges, fittings and related components from one supplier.',
  },
  {
    icon: Truck,
    title: 'Australian stock and dispatch',
    body: 'We dispatch from Wyong, NSW and deliver Australia-wide. Check individual product pages for availability and delivery options.',
  },
  {
    icon: Wrench,
    title: 'Talk to a specialist',
    body: 'Need help checking cartridge compatibility, selecting a system or planning a multi-unit order? Our team can help you work through the options.',
  },
] as const;

const CATEGORIES = [
  {
    label: 'Water filtration systems',
    detail: 'Under-sink, whole-house, reverse osmosis and commercial filtration.',
    href: '/water-filters/',
    icon: Droplets,
  },
  {
    label: 'Drinking fountains & coolers',
    detail: 'Water bubblers, chilled fountains, coolers and replacement parts.',
    href: '/bubblers-and-coolers/',
    icon: Wrench,
  },
  {
    label: 'Replacement cartridges',
    detail: 'Sediment, carbon, specialty cartridges and multi-stage replacement sets.',
    href: '/cartridges/',
    icon: RefreshCw,
  },
  {
    label: 'Pumps, tanks & components',
    detail: 'Pressure equipment, dosing tanks, fittings and supporting accessories.',
    href: '/pumps-and-tanks/',
    icon: Box,
  },
] as const;

const STEPS = [
  {
    number: '01',
    title: 'Tell us what you are working on',
    body: 'Share the type of installation, product requirements, quantity and location, or start with our online catalogue.',
  },
  {
    number: '02',
    title: 'Choose the right equipment',
    body: 'Browse product specifications and pricing, or contact our team for product and compatibility guidance.',
  },
  {
    number: '03',
    title: 'Order now, return when you need more',
    body: 'Place orders online as needed. Come back for cartridges, fittings and replacement components as your projects and servicing needs grow.',
  },
] as const;

export default function PlumbersAndInstallersPage() {
  return (
    <>
      <JsonLdScript
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Plumbers & Installers', path: PATH },
        ])}
      />
      <div className="bg-white text-slate-950">
        <section className="relative overflow-hidden border-b border-slate-200 bg-[#f3f7f9]">
          <div aria-hidden="true" className="absolute -right-24 -top-32 h-[30rem] w-[30rem] rounded-full bg-blue-100/60 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-16 lg:px-8 lg:py-24">
            <div>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-brand-blue">
                For plumbers &amp; installers
              </p>
              <h1 className="max-w-3xl text-[clamp(2.7rem,6.2vw,5.3rem)] font-semibold leading-[1.05] tracking-[-0.055em]">
                A reliable supply partner for every water project.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
                From a single cartridge replacement to a commercial drinking fountain installation,
                Enviro Aqua makes it easier to source the water filtration products you need,
                when you need them.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href={enquiryHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-blue px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-hover">
                  Discuss your project <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <Link href="/water-filters/" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50">
                  Explore our range <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <p className="mt-5 text-sm text-slate-500">No trade account required. No minimum order. Australia-wide supply.</p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_20px_70px_rgba(15,23,42,0.07)] sm:p-9">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-brand-blue">
                  <ClipboardList className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Working on a project?</p>
              </div>
              <h2 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">Tell us what you need.</h2>
              <p className="mt-3 leading-relaxed text-slate-600">We can help you narrow down suitable products for new installations, replacements or ongoing servicing.</p>
              <ul className="mt-7 space-y-4">
                {[
                  'Product selection and compatibility',
                  'Multiple units for commercial sites',
                  'Replacement cartridges and consumables',
                  'Installation fittings and accessories',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm font-medium text-slate-800">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 border-t border-slate-100 pt-6">
                <a href={`tel:${BUSINESS_INFO.phone.tel}`} className="inline-flex items-center gap-2 text-base font-semibold text-slate-950 hover:text-brand-blue">
                  <Phone className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                  {BUSINESS_INFO.phone.display}
                </a>
                <p className="mt-2 text-xs text-slate-500">{BUSINESS_INFO.phoneSupportHours} AEST</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-blue">Built for repeat business</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">More than a one-off order.</h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Whether you install one system a month or manage ongoing maintenance across several sites,
              we want to make sourcing the right products straightforward.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map(({icon: Icon, title, body}) => (
              <div key={title} className="rounded-2xl border border-slate-200 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-brand-blue">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-tight">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-blue">What we supply</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">The products behind the installation.</h2>
              <p className="mt-4 text-slate-600">Browse our core ranges or get in touch for help finding the right combination.</p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {CATEGORIES.map(({icon: Icon, label, detail, href}) => (
                <Link key={href} href={href} className="group flex items-start gap-5 rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-md sm:p-7">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-blue">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold tracking-tight">{label}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{detail}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue">
                      Browse products <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-blue">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Simple from the first enquiry.</h2>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="border-t-2 border-slate-900 pt-6">
                <span className="text-sm font-semibold tracking-wide text-brand-blue">{step.number}</span>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-950 text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-8 lg:py-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">Let's work together</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">Got an installation coming up?</h2>
              <p className="mt-4 max-w-xl leading-relaxed text-slate-300">
                Tell us what you are planning, the products you need and the quantities involved.
                We would love to become a dependable part of your supply process.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={enquiryHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-100">
                  <Mail className="h-4 w-4" aria-hidden="true" /> Email our team
                </a>
                <a href={`tel:${BUSINESS_INFO.phone.tel}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-500 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white">
                  <Phone className="h-4 w-4" aria-hidden="true" /> Call {BUSINESS_INFO.phone.display}
                </a>
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-7">
              <div className="flex items-center gap-3 text-sky-300"><MapPin className="h-5 w-5" aria-hidden="true" /><span className="text-sm font-semibold uppercase tracking-wider">Australian owned</span></div>
              <h3 className="mt-5 text-xl font-semibold">Based in Wyong, NSW.</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Visit our Central Coast showroom or contact us for Australia-wide product supply.
              </p>
              <p className="mt-6 border-t border-white/15 pt-5 text-sm text-slate-300">
                {BUSINESS_INFO.address.street}, {BUSINESS_INFO.address.locality} {BUSINESS_INFO.address.region} {BUSINESS_INFO.address.postalCode}
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-16 sm:px-6 lg:py-20">
          <h2 className="text-3xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
            {[
              {
                question: 'Do I need a trade account to order?',
                answer: 'No. Our product prices are available upfront to plumbers, businesses and homeowners. You can order through the website without applying for an account.',
              },
              {
                question: 'Can you help me source products for multiple installations?',
                answer: 'Yes. Contact us with your product requirements, quantities and project location. Our team can help you identify suitable products and discuss supply options.',
              },
              {
                question: 'Can I order replacement filters for ongoing servicing?',
                answer: 'Absolutely. We carry replacement cartridges, membranes, filter housings and components. Check the product specifications or contact us to confirm compatibility.',
              },
              {
                question: 'Do you deliver outside New South Wales?',
                answer: 'Yes. We supply customers Australia-wide. Delivery options and costs depend on the products and destination, particularly for larger equipment.',
              },
            ].map(({question,answer})=>(
              <div key={question} className="py-6">
                <h3 className="text-base font-semibold">{question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{answer}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-start gap-3 text-sm text-slate-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" aria-hidden="true" />
            Installation work involving regulated plumbing must be carried out by appropriately licensed professionals. Always check the relevant product specifications and local requirements.
          </div>
        </section>
      </div>
    </>
  );
}
