import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import {
  breadcrumbSchema,
  faqPageSchema,
} from '@/lib/seo/jsonld';
import { BUSINESS_INFO } from '@/content/business-info';

export const metadata: Metadata = {
  title:
    'How to Choose a Water Filter — Australian Buying Guide',
  description:
    "Three decisions in order: where the water comes from, where you want it filtered, and which technology matches your concern. Town water, tank, bore — every situation. AU-stocked, same-day dispatch from Wyong NSW.",
  alternates: { canonical: '/help/which-filter/' },
  openGraph: {
    title:
      'How to Choose a Water Filter — Australian Buying Guide',
    description:
      'Three decisions in order: where the water comes from, where you want it filtered, and which technology matches your concern.',
    url: '/help/which-filter/',
    type: 'article',
  },
  twitter: {
    title:
      'How to Choose a Water Filter — Australian Buying Guide',
    description:
      'Three decisions in order: where the water comes from, where you want it filtered, and which technology matches your concern.',
  },
};

const FAQS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: 'Do I need WaterMark certification?',
    a: 'Yes, if the system is plumbed permanently into a mains water line. Under Australian plumbing law any device connected to mains supply must carry WaterMark certification — that includes whole-house systems and most under-sink units. Bench-top and shower filters are not plumbed in and do not require WaterMark.',
  },
  {
    q: "Carbon block vs GAC carbon — what's the difference?",
    a: 'GAC (granular activated carbon) is loose carbon granules — water flows through the gaps between particles, which gives it high flow but less contact time. Carbon block compresses carbon into a dense matrix — slower but with finer filtration and more uniform contact. For chloramine (used by Sydney, Melbourne, Brisbane, Adelaide, Canberra mains), specify catalytic carbon. For chlorine alone, either works.',
  },
  {
    q: 'Is reverse osmosis worth it?',
    a: 'Yes if your concern is fluoride, PFAS / forever chemicals, or dissolved heavy metals — RO is the only domestic technology that meaningfully reduces them. No if your concern is chlorine, taste, or sediment — RO is over-spec, slower, and wastes a few litres of brine for every litre of filtered water. Match the technology to the contaminant.',
  },
  {
    q: 'How often do I need to change cartridges?',
    a: "Every 6–12 months for most systems, depending on water quality and household usage. Big Blue 20-inch cartridges last toward the longer end of that range because of their larger media volume; standard 10-inch cartridges land closer to 6 months. The pressure gauges on the Big Blue system tell you objectively when the differential rises — no guessing.",
  },
  {
    q: 'Can I install this myself?',
    a: 'Bench-top filters and shower filters yes — they connect to existing taps with no plumbing. Under-sink and whole-house systems should be installed by a licensed plumber, both for warranty / insurance reasons and because Australian plumbing law requires it on mains-connected installations.',
  },
];

export default function FilterFinderPage() {
  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Help & guides', path: '/help/' },
            {
              name: 'How to choose a water filter',
              path: '/help/which-filter/',
            },
          ]),
          faqPageSchema(FAQS.map((f) => ({ q: f.q, a: f.a }))),
        ]}
      />

      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* HERO */}
        <header>
          <p className="text-sm font-semibold tracking-wider uppercase text-brand-blue">
            Buying guide
          </p>
          <h1 className="mt-2 text-4xl md:text-5xl font-semibold text-black tracking-tight">
            How to choose a water filter
          </h1>
          <p className="mt-4 text-lg text-black/80 leading-snug max-w-2xl">
            Three decisions in order. Start with the source, then
            decide where you want the filtration, then pick the
            technology that matches your contaminants of concern.
            No upsell, no marketing — just the architecture.
          </p>
        </header>

        {/* EDUCATIONAL CONTENT */}
        <section className="mt-12 prose max-w-none">
          <h2>Start with where the water comes from</h2>
          <p>
            <strong>Town water (mains)</strong> in Australia is
            treated to AS/NZS 3500 with chlorine or chloramine for
            disinfection. The water that arrives at your property is
            generally safe to drink, but the chlorine dose affects
            taste and odour and the supply network can pick up
            sediment and rust between the treatment plant and your
            house. Carbon filtration is the standard answer.
          </p>
          <p>
            <strong>Rainwater tank</strong> is collected from your
            roof and never disinfected. It carries leaf debris,
            dust, bird droppings, and live bacterial load including
            E. coli and Giardia. Tank water needs both physical
            filtration (sediment + carbon) and UV sterilisation —
            UV alone leaves sediment, filtration alone leaves
            bacteria.
          </p>
          <p>
            <strong>Bore or spring water</strong> varies by location
            and depth. Without a recent water test, specifying the
            right system is guesswork. Get a test first — your local
            council usually offers low-cost residential tests, or
            we can recommend a private testing service.
          </p>

          <h2>Decide where you want it filtered</h2>
          <p>
            <strong>Whole-house</strong> systems plumb into the
            mains supply line where it enters your property and
            filter every tap, shower, and appliance. They need a
            licensed plumber to install (Australian plumbing law),
            they need WaterMark certification (same reason), and
            they make sense when you own the property and care
            about more than just drinking water — chlorinated
            showers irritate skin, sediment-laden water shortens
            the life of dishwashers and washing machines.
          </p>
          <p>
            <strong>Point-of-use</strong> systems filter one
            outlet — typically a kitchen tap with a dedicated
            filtered-water faucet. Cheaper, simpler, often the
            right answer if you only care about drinking water.
            Under-sink models are tidier; bench-top models pack up
            and move with you.
          </p>

          <h2>Pick the technology that matches your concern</h2>
          <ul>
            <li>
              <strong>Carbon (block or GAC):</strong> chlorine,
              chloramine, taste, odour, basic chemicals. The
              workhorse stage in almost every system.
            </li>
            <li>
              <strong>Reverse osmosis:</strong> fluoride, PFAS /
              forever chemicals, dissolved heavy metals (lead,
              copper), nitrate, total dissolved solids. Slow but
              thorough.
            </li>
            <li>
              <strong>UV sterilisation:</strong> bacteria, viruses,
              protozoa. Doesn&apos;t filter — it inactivates
              pathogens with 254 nm UV-C light. Always paired with
              sediment + carbon upstream.
            </li>
            <li>
              <strong>Sediment:</strong> rust, sand, silt, suspended
              solids. Always the first stage on tank or bore water;
              protects the carbon stages downstream.
            </li>
          </ul>
          <p>
            Most homes need a combination. Town water on a property
            you own typically wants sediment + carbon + polishing
            carbon at the mains line. Tank water adds UV after the
            carbon stages. Drinking-only setups concerned about
            PFAS or fluoride add a small RO unit at the kitchen tap.
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-16 border-t border-gray-100 pt-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-black tracking-tight">
            FAQs — water filter selection
          </h2>
          <dl className="mt-8 space-y-6">
            {FAQS.map((faq) => (
              <div key={faq.q}>
                <dt className="text-lg font-semibold text-black">
                  {faq.q}
                </dt>
                <dd className="mt-2 text-base text-black/80 leading-snug">
                  {faq.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* TALK TO US CTA */}
        <section className="mt-12">
          <div className="bg-brand-blue-light border border-brand-blue/20 rounded-lg p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
              Still unsure?
            </h2>
            <p className="mt-3 text-base text-black/80 leading-snug max-w-2xl">
              Bore water, mixed sources, very high TDS readings, or
              a multi-property setup all need a conversation, not a
              guide. Bring a recent water test if you have one — call
              us or visit the Wyong showroom and we&apos;ll spec the
              right system.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <a
                href={`tel:${BUSINESS_INFO.phone.tel}`}
                className="inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold py-3 px-6 rounded transition-colors tabular-nums"
              >
                Call {BUSINESS_INFO.phone.display}
              </a>
              <Link
                href="/showroom/"
                className="inline-flex items-center justify-center bg-white border border-black hover:bg-gray-50 text-black font-semibold py-3 px-6 rounded transition-colors"
              >
                Visit the Wyong showroom →
              </Link>
            </div>
          </div>
        </section>

        {/* RELATED LINKS */}
        <section className="mt-16 border-t border-gray-100 pt-12">
          <h2 className="text-xl font-semibold text-black tracking-tight">
            Related
          </h2>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-2 list-none">
            <li>
              <Link
                href="/showroom/"
                className="text-brand-blue hover:underline underline-offset-4"
              >
                Visit our Wyong showroom →
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
                href="/water-filters/"
                className="text-brand-blue hover:underline underline-offset-4"
              >
                Browse water filter systems →
              </Link>
            </li>
            <li>
              <Link
                href="/water-problems/"
                className="text-brand-blue hover:underline underline-offset-4"
              >
                Common water problems →
              </Link>
            </li>
            <li>
              <Link
                href="/help/"
                className="text-brand-blue hover:underline underline-offset-4"
              >
                All help &amp; buying guides →
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
