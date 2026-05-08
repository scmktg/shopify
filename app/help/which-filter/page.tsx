import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FilterFinderQuiz,
  type ProductCardInfo,
} from '@/components/help/FilterFinderQuiz';
import { fetchProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import { getProductUrl } from '@/lib/utils/productUrl';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import {
  breadcrumbSchema,
  faqPageSchema,
} from '@/lib/seo/jsonld';
import { BUSINESS_INFO } from '@/content/business-info';

export const metadata: Metadata = {
  title:
    'Filter Finder — Find the Right Water Filter in 60 Seconds',
  description:
    "Answer 3–4 questions and we'll recommend the exact water filter system for your home. Town water, tank water, bore water — every situation, every budget. AU-stocked, same-day dispatch.",
  alternates: { canonical: '/help/which-filter/' },
  openGraph: {
    title:
      'Filter Finder — Find the Right Water Filter in 60 Seconds',
    description:
      "Answer 3–4 questions and we'll recommend the exact water filter system for your home.",
    url: '/help/which-filter/',
    type: 'website',
  },
  twitter: {
    title:
      'Filter Finder — Find the Right Water Filter in 60 Seconds',
    description:
      "Answer 3–4 questions and we'll recommend the exact water filter system for your home.",
  },
};

// Force fresh price/availability per request — Shopify primitives
// drift, and a stale recommendation card with the wrong price reads
// worse than a fresh fetch on a low-traffic page.
export const revalidate = 0;

const QUIZ_PRODUCT_HANDLES: ReadonlyArray<string> = [
  'wm-3-stages-20-x-4-5-triple-big-blue-whole-house-water-filter-system',
  'under-sink-water-filter-2-stage-sediment-carbon',
  '5-stage-undersink-home-drinking-ro-water-filter-system-with-3-way-tap',
  'under-sink-water-filter-6-stage-reverse-osmosis-system',
  'bench-top-water-filter-sediment-carbon-2-stage',
  'big-blue-whole-house-water-filter-and-uv-ultraviolet-sterilization-system',
  '3-stages-whole-house-water-filter-and-uv-ultraviolet-sterilization-system',
  'uv-water-filter-ultraviolet-sterilisation-1500lph-25w-220v-240v',
  'uv-water-filter-ultraviolet-sterilisation-0-5-1-gpm-6w-220v',
];

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

async function loadProductMap(): Promise<
  Readonly<Record<string, ProductCardInfo>>
> {
  const entries = await Promise.all(
    QUIZ_PRODUCT_HANDLES.map(async (handle) => {
      try {
        const product = await fetchProductByHandle(handle);
        if (!product) return null;
        return [
          handle,
          {
            handle: product.handle,
            title: product.title,
            href: getProductUrl(product.handle),
            price: product.priceRange.minVariantPrice,
            image: product.featuredImage,
          } satisfies ProductCardInfo,
        ] as const;
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            `[which-filter] Failed to fetch ${handle}:`,
            error,
          );
        }
        return null;
      }
    }),
  );
  return Object.fromEntries(entries.filter((e): e is NonNullable<typeof e> => e !== null));
}

export default async function FilterFinderPage() {
  const productMap = await loadProductMap();

  return (
    <>
      <JsonLdScript
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Help & guides', path: '/help/' },
            { name: 'Filter finder', path: '/help/which-filter/' },
          ]),
          faqPageSchema(FAQS.map((f) => ({ q: f.q, a: f.a }))),
          {
            '@context': 'https://schema.org',
            '@type': 'QAPage',
            mainEntity: {
              '@type': 'Question',
              name: 'Which water filter do I need for my home?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: "Answer four short questions about your water source, where you want filtered water, and what you're concerned about. The recommended system follows from your answers — town water on a property you own and want every tap covered points at a Three-Stage Big Blue whole-house system; town water at one tap with PFAS or fluoride concerns points at a 5-stage reverse-osmosis under-sink system; tank water always pairs filtration with UV sterilisation.",
              },
            },
          },
        ]}
      />

      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* HERO */}
        <header>
          <p className="text-sm font-semibold tracking-wider uppercase text-brand-blue">
            Filter finder
          </p>
          <h1 className="mt-2 text-4xl md:text-5xl font-semibold text-black tracking-tight">
            Find the right water filter in 60 seconds
          </h1>
          <p className="mt-4 text-lg text-black/80 leading-snug max-w-2xl">
            Three to four questions about your water source, where
            you want it filtered, and what you&apos;re concerned
            about. We&apos;ll recommend the system that fits — no
            guesswork, no upsell.
          </p>
        </header>

        {/* QUIZ */}
        <div className="mt-10">
          <FilterFinderQuiz productMap={productMap} />
        </div>

        {/* EDUCATIONAL CONTENT */}
        <section className="mt-16 border-t border-gray-100 pt-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-black tracking-tight">
            How to choose a water filter — without the quiz
          </h2>
          <p className="mt-3 text-base text-black/70">
            Three decisions in order. Start with the source, then
            decide where you want the filtration, then pick the
            technology that matches the contaminants.
          </p>

          <div className="mt-8 prose max-w-none">
            <h3>Start with where the water comes from</h3>
            <p>
              <strong>Town water (mains)</strong> in Australia is
              treated to AS/NZS 3500 with chlorine or chloramine for
              disinfection. The water that arrives at your property
              is generally safe to drink, but the chlorine dose
              affects taste and odour and the supply network can
              pick up sediment and rust between the treatment plant
              and your house. Carbon filtration is the standard
              answer.
            </p>
            <p>
              <strong>Rainwater tank</strong> is collected from your
              roof and never disinfected. It carries leaf debris,
              dust, bird droppings, and live bacterial load
              including E. coli and Giardia. Tank water needs both
              physical filtration (sediment + carbon) and UV
              sterilisation — UV alone leaves sediment, filtration
              alone leaves bacteria.
            </p>
            <p>
              <strong>Bore or spring water</strong> varies by
              location and depth. Without a recent water test,
              specifying the right system is guesswork. Get a test
              first — your local council usually offers low-cost
              residential tests, or we can recommend a private
              testing service.
            </p>

            <h3>Decide where you want it filtered</h3>
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
              Under-sink models are tidier; bench-top models pack
              up and move with you.
            </p>

            <h3>Pick the technology that matches your concern</h3>
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
                <strong>UV sterilisation:</strong> bacteria,
                viruses, protozoa. Doesn&apos;t filter — it
                inactivates pathogens with 254 nm UV-C light. Always
                paired with sediment + carbon upstream.
              </li>
              <li>
                <strong>Sediment:</strong> rust, sand, silt,
                suspended solids. Always the first stage on tank or
                bore water; protects the carbon stages downstream.
              </li>
            </ul>
            <p>
              Most homes need a combination. Town water on a
              property you own typically wants sediment + carbon +
              polishing carbon at the mains line. Tank water adds UV
              after the carbon stages. Drinking-only setups concerned
              about PFAS or fluoride add a small RO unit at the
              kitchen tap.
            </p>
          </div>
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
              <a
                href={`tel:${BUSINESS_INFO.phone.tel}`}
                className="text-brand-blue hover:underline underline-offset-4 tabular-nums"
              >
                Call {BUSINESS_INFO.phone.display} →
              </a>
            </li>
          </ul>
        </section>
      </article>
    </>
  );
}
