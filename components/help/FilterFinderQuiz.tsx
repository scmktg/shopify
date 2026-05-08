'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import type { Money, ProductImage } from '@/types/product';
import { BUSINESS_INFO } from '@/content/business-info';

/**
 * Interactive Filter Finder.
 *
 * State machine:
 *   q1 (water source) →
 *     mains       → q2 (where to filter) →
 *       whole-house → q3 (own/rent) → result A | C
 *       one-tap     → q4 (concerns multi-select) → q5 (own/rent) → B-basic | B-ro | F | C
 *       showers     → result I
 *     tank        → result D
 *     bore | mixed → result H
 *
 * Result panel scrolls into view on selection. Quiz state lives in
 * component memory only — no persistence, per the brief.
 *
 * The product cards (image, title, price, "View product" link) are
 * pre-resolved on the server in app/help/which-filter/page.tsx and
 * passed in as a Record<handle, ProductCardInfo>. Handles that
 * don't resolve (Shopify-side or products.json-side) silently fall
 * out of the recommendation — better than rendering a broken card.
 */

export interface ProductCardInfo {
  handle: string;
  title: string;
  href: string;
  price: Money;
  image: ProductImage | null;
}

type WaterSource = 'mains' | 'tank' | 'bore' | 'mixed';
type Placement = 'whole-house' | 'one-tap' | 'showers';
type OwnRent = 'own' | 'rent';
type Concern =
  | 'chlorine'
  | 'fluoride'
  | 'pfas'
  | 'bacteria'
  | 'general'
  | 'metals';
type ResultPath =
  | 'A'
  | 'B-basic'
  | 'B-ro'
  | 'C'
  | 'D'
  | 'F'
  | 'H'
  | 'I';

type Step = 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'result';

interface Answers {
  source?: WaterSource;
  placement?: Placement;
  ownRent?: OwnRent;
  concerns?: ReadonlyArray<Concern>;
}

interface FilterFinderQuizProps {
  /** Map of handle → product card info, hydrated server-side. */
  productMap: Readonly<Record<string, ProductCardInfo>>;
}

const TOTAL_STEPS_LABEL: Record<Step, string> = {
  q1: 'Question 1 of 4',
  q2: 'Question 2 of 4',
  q3: 'Question 3 of 3',
  q4: 'Question 3 of 4',
  q5: 'Question 4 of 4',
  result: 'Done',
};

// Brief: B-ro primary = 5-stage with 3-way tap, alternative = 6-stage
const PRIMARY_HANDLE: Record<ResultPath, string | null> = {
  A: 'wm-3-stages-20-x-4-5-triple-big-blue-whole-house-water-filter-system',
  'B-basic': 'under-sink-water-filter-2-stage-sediment-carbon',
  'B-ro': '5-stage-undersink-home-drinking-ro-water-filter-system-with-3-way-tap',
  C: 'bench-top-water-filter-sediment-carbon-2-stage',
  D: 'big-blue-whole-house-water-filter-and-uv-ultraviolet-sterilization-system',
  F: 'uv-water-filter-ultraviolet-sterilisation-1500lph-25w-220v-240v',
  H: null,
  I: null,
};

const ALTERNATIVE_HANDLE: Record<ResultPath, string | null> = {
  A: null,
  'B-basic': null,
  'B-ro': 'under-sink-water-filter-6-stage-reverse-osmosis-system',
  C: null,
  D: '3-stages-whole-house-water-filter-and-uv-ultraviolet-sterilization-system',
  F: 'uv-water-filter-ultraviolet-sterilisation-0-5-1-gpm-6w-220v',
  H: null,
  I: null,
};

interface ResultCopy {
  heading: string;
  why: string;
  whyNotCheaper?: string;
  whyNotPricier?: string;
  /** Show the install-package secondary CTA for whole-house owners. */
  installPackage?: boolean;
}

const RESULT_COPY: Record<ResultPath, ResultCopy> = {
  A: {
    heading: 'A WaterMark-certified whole-house system',
    why: "Town water on a property you own and want every tap covered. The Three-Stage Big Blue is WaterMark-certified for plumbed-in mains use, runs at up to 75 L/min so multiple showers don't drop pressure, and uses open-standard 20\" × 4.5\" cartridges any plumber can service.",
    whyNotCheaper:
      "Smaller 10\" or 2.5\" housings can't carry whole-house flow rates without dropping pressure when two outlets run at once. They're fine for a single tap; not for a household.",
    whyNotPricier:
      "Adding a UV stage makes sense for tank water and bore water, where bacterial load is the issue. Town water already arrives chlorinated to AS/NZS 3500 — UV is redundant on top of that.",
    installPackage: true,
  },
  'B-basic': {
    heading: 'A 2-stage under-sink filter for one tap',
    why: 'Town water, one tap, no plumbing complications. A 2-stage sediment + carbon system removes chlorine, taste, odour, sediment, and rust before the water reaches your kitchen. Plumber installs once and you replace the cartridges yourself every 12 months.',
    whyNotCheaper:
      'A bench-top filter sits on the counter and ties up your kitchen tap. Under-sink puts the hardware out of sight on its own outlet — a one-time plumbing investment that pays back in counter space.',
    whyNotPricier:
      "Reverse osmosis is the right answer if you're worried about fluoride, PFAS, or heavy metals. If your concern is chlorine and taste, RO is over-spec — and slower (a few litres per hour vs unlimited flow).",
  },
  'B-ro': {
    heading: 'A 5-stage reverse-osmosis under-sink system',
    why: 'Reverse osmosis is the only domestic technology that meaningfully reduces fluoride, PFAS / forever chemicals, and dissolved heavy metals. The 5-stage adds a sediment pre-filter, two carbon stages either side of the RO membrane, and a final polishing carbon — so taste is not compromised.',
    whyNotCheaper:
      'A 2-stage sediment + carbon system handles chlorine and taste but leaves fluoride and PFAS untouched. If those are on your list, RO is the only answer.',
    whyNotPricier:
      'A 6-stage RO adds an alkaline / mineralising cartridge. Worth the upgrade if pH or mineral re-introduction matters to you; otherwise the 5-stage is the same filtration with one less consumable.',
  },
  C: {
    heading: 'A bench-top filter you can take with you',
    why: 'No plumber needed. Connects to your existing kitchen tap with a diverter and sits on the counter. Uninstalls cleanly in five minutes when you move — important if you rent or expect to relocate.',
    whyNotCheaper:
      "A simple jug filter is fine for a glass at a time, but it's slow, low-capacity, and the cartridges don't last. Bench-top gives you mains-pressure filtered water on demand without plumbing.",
    whyNotPricier:
      'Under-sink systems are tidier and have higher flow rates, but they need a plumber to fit and a plumber to remove. Bench-top is the right answer when you might move.',
  },
  D: {
    heading: 'Whole-house filtration plus UV sterilisation',
    why: "Tank water needs both filtration AND UV sterilisation — UV alone doesn't filter sediment, filtration alone doesn't kill bacteria. This combination handles physical debris (leaves, sediment), removes taste and odour, and sterilises against E. coli, Giardia, and Cryptosporidium before the water reaches a tap.",
    whyNotCheaper:
      "A filter without UV leaves you exposed to bacterial pathogens that cartridges can't physically remove. UV alone leaves sediment and taste. On tank water, the two stages work together.",
    whyNotPricier:
      'Reverse osmosis on a whole-house scale is uneconomical (slow flow, high waste-water ratio). Filtration + UV is the right architecture for the job.',
  },
  F: {
    heading: 'A UV sterilisation unit',
    why: "When the water is already filtered or you're addressing pathogens specifically, a standalone UV unit is the targeted answer. Inactivates bacteria, viruses, and protozoa with a 254 nm UV-C lamp at the line rate of your supply.",
    whyNotCheaper:
      "Boiling kills bacteria but isn't continuous. UV runs whenever water flows, so every tap is treated every time — no remembering, no waiting.",
    whyNotPricier:
      "A whole-house filter + UV combo is overkill if your water is already filtered upstream and you only need the bacterial step. Pick the standalone UV if you've separated the concerns.",
  },
  H: {
    heading: 'Your situation has a few moving parts',
    why: 'Bore water, mixed sources, very high TDS readings, and multi-property setups need a conversation, not a quiz. Bring a recent water test if you have one — call us or visit the Wyong showroom and we&rsquo;ll spec the right system.',
  },
  I: {
    heading: 'A shower filter',
    why: "Shower filters are point-of-use carbon devices that remove chlorine, chloramine, and rough sediment from a single shower outlet. They install between your shower arm and head — no plumbing, no electricity. Replace the cartridge every 6&ndash;12 months.",
    whyNotCheaper:
      "Skipping the shower filter on chlorinated mains water leaves the chlorine on your skin and hair. The cost is small; the upgrade is noticeable within a week.",
    whyNotPricier:
      'Whole-house filtration covers showers along with every other tap. If you only care about the shower, a single-point filter is the cheaper, simpler answer.',
  },
};

const Q4_OPTIONS: ReadonlyArray<{
  value: Concern;
  label: string;
}> = [
  { value: 'chlorine', label: 'Chlorine taste / smell' },
  { value: 'fluoride', label: 'Fluoride' },
  { value: 'pfas', label: 'PFAS / forever chemicals' },
  { value: 'bacteria', label: 'Bacteria / pathogens (tank/bore)' },
  { value: 'general', label: 'Just want cleaner drinking water' },
  { value: 'metals', label: 'Heavy metals (lead, copper)' },
];

function deriveResult(answers: Answers): ResultPath | null {
  if (answers.source === 'tank') return 'D';
  if (answers.source === 'bore' || answers.source === 'mixed') return 'H';
  if (!answers.placement) return null;
  if (answers.placement === 'showers') return 'I';
  if (answers.placement === 'whole-house') {
    if (!answers.ownRent) return null;
    return answers.ownRent === 'own' ? 'A' : 'C';
  }
  // one-tap path
  if (!answers.concerns?.length) return null;
  if (answers.concerns.includes('bacteria')) return 'F';
  const requiresRo = answers.concerns.some((c) =>
    (['fluoride', 'pfas', 'metals'] as Concern[]).includes(c),
  );
  if (requiresRo) {
    if (!answers.ownRent) return null;
    return answers.ownRent === 'own' ? 'B-ro' : 'C';
  }
  // chlorine / general only
  if (!answers.ownRent) return null;
  return answers.ownRent === 'own' ? 'B-basic' : 'C';
}

function nextStep(current: Step, answers: Answers): Step {
  if (current === 'q1') {
    if (answers.source === 'mains') return 'q2';
    return 'result';
  }
  if (current === 'q2') {
    if (answers.placement === 'whole-house') return 'q3';
    if (answers.placement === 'one-tap') return 'q4';
    return 'result';
  }
  if (current === 'q3') return 'result';
  if (current === 'q4') return 'q5';
  if (current === 'q5') return 'result';
  return 'result';
}

export function FilterFinderQuiz({ productMap }: FilterFinderQuizProps) {
  const [step, setStep] = useState<Step>('q1');
  const [history, setHistory] = useState<ReadonlyArray<Step>>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const resultRef = useRef<HTMLDivElement | null>(null);

  const advance = (patch: Partial<Answers>) => {
    const merged = { ...answers, ...patch };
    setAnswers(merged);
    setHistory((h) => [...h, step]);
    setStep(nextStep(step, merged));
  };

  const back = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1]!;
    setHistory((h) => h.slice(0, -1));
    setStep(previous);
  };

  const restart = () => {
    setStep('q1');
    setHistory([]);
    setAnswers({});
  };

  const result = step === 'result' ? deriveResult(answers) : null;

  useEffect(() => {
    if (step === 'result' && resultRef.current) {
      resultRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [step]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-black/60">
          {TOTAL_STEPS_LABEL[step]}
        </p>
        {history.length > 0 && step !== 'result' && (
          <button
            type="button"
            onClick={back}
            className="inline-flex items-center gap-1 text-sm text-black/70 hover:text-black"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </button>
        )}
      </div>

      <div className="mt-6">
        {step === 'q1' && (
          <Question
            heading="Where does your water come from?"
            options={[
              { label: 'Town water (mains)', value: 'mains' },
              { label: 'Rainwater tank', value: 'tank' },
              { label: 'Bore / spring water', value: 'bore' },
              { label: 'Mixed (mains + tank)', value: 'mixed' },
            ]}
            onChoose={(value) =>
              advance({ source: value as WaterSource })
            }
          />
        )}

        {step === 'q2' && (
          <Question
            heading="Where do you want filtered water?"
            options={[
              { label: 'Every tap in the house', value: 'whole-house' },
              { label: 'One tap — drinking only', value: 'one-tap' },
              { label: 'Showers only', value: 'showers' },
            ]}
            onChoose={(value) =>
              advance({ placement: value as Placement })
            }
          />
        )}

        {step === 'q3' && (
          <Question
            heading="Do you own or rent?"
            options={[
              { label: 'Own / new build', value: 'own' },
              { label: 'Rent', value: 'rent' },
            ]}
            onChoose={(value) =>
              advance({ ownRent: value as OwnRent })
            }
          />
        )}

        {step === 'q4' && (
          <MultiSelectQuestion
            heading="Are you concerned about any of these?"
            helper="Tick everything that applies. We'll recommend a system that covers the toughest of your concerns."
            options={Q4_OPTIONS}
            onConfirm={(values) =>
              advance({ concerns: values as ReadonlyArray<Concern> })
            }
          />
        )}

        {step === 'q5' && (
          <Question
            heading="Are you the property owner?"
            options={[
              { label: 'Yes — I can have a plumber install', value: 'own' },
              { label: 'No — I rent or want no plumbing', value: 'rent' },
            ]}
            onChoose={(value) =>
              advance({ ownRent: value as OwnRent })
            }
          />
        )}

        {step === 'result' && (
          <div ref={resultRef}>
            <ResultPanel
              path={result}
              answers={answers}
              productMap={productMap}
              onRestart={restart}
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface QuestionProps {
  heading: string;
  options: ReadonlyArray<{ label: string; value: string }>;
  onChoose: (value: string) => void;
}

function Question({ heading, options, onChoose }: QuestionProps) {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
        {heading}
      </h2>
      <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 list-none">
        {options.map((opt) => (
          <li key={opt.value}>
            <button
              type="button"
              onClick={() => onChoose(opt.value)}
              className="w-full min-h-[48px] text-left bg-white border border-gray-300 hover:border-brand-blue hover:bg-brand-blue-light text-black font-medium py-3 px-4 rounded transition-colors"
            >
              {opt.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface MultiSelectQuestionProps {
  heading: string;
  helper: string;
  options: ReadonlyArray<{ label: string; value: Concern }>;
  onConfirm: (values: ReadonlyArray<Concern>) => void;
}

function MultiSelectQuestion({
  heading,
  helper,
  options,
  onConfirm,
}: MultiSelectQuestionProps) {
  const [selected, setSelected] = useState<ReadonlyArray<Concern>>([]);

  const toggle = (value: Concern) => {
    setSelected((current) =>
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    );
  };

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
        {heading}
      </h2>
      <p className="mt-2 text-sm text-black/70">{helper}</p>
      <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 list-none">
        {options.map((opt) => {
          const active = selected.includes(opt.value);
          return (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => toggle(opt.value)}
                aria-pressed={active}
                className={`w-full min-h-[48px] text-left border font-medium py-3 px-4 rounded transition-colors ${
                  active
                    ? 'border-brand-blue bg-brand-blue-light text-brand-blue'
                    : 'border-gray-300 bg-white text-black hover:border-brand-blue hover:bg-brand-blue-light'
                }`}
              >
                {opt.label}
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => onConfirm(selected)}
        disabled={selected.length === 0}
        className="mt-6 w-full sm:w-auto bg-brand-blue hover:bg-brand-blue-hover disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded transition-colors"
      >
        See my recommendation →
      </button>
    </div>
  );
}

interface ResultPanelProps {
  path: ResultPath | null;
  answers: Answers;
  productMap: Readonly<Record<string, ProductCardInfo>>;
  onRestart: () => void;
}

function ResultPanel({
  path,
  answers,
  productMap,
  onRestart,
}: ResultPanelProps) {
  if (!path) {
    return (
      <p className="text-base text-black">
        Something didn&apos;t resolve in your answers.{' '}
        <button
          type="button"
          onClick={onRestart}
          className="text-brand-blue underline underline-offset-4"
        >
          Restart the quiz.
        </button>
      </p>
    );
  }

  const copy = RESULT_COPY[path];
  const primaryHandle = PRIMARY_HANDLE[path];
  const primary = primaryHandle ? productMap[primaryHandle] : undefined;
  const alternativeHandle = ALTERNATIVE_HANDLE[path];
  const alternative = alternativeHandle
    ? productMap[alternativeHandle]
    : undefined;

  // Path H is the talk-to-us flow — no product card.
  if (path === 'H') {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-blue">
          Based on your answers
        </p>
        <h2 className="mt-2 text-3xl md:text-4xl font-semibold text-black tracking-tight">
          {copy.heading}
        </h2>
        <p
          className="mt-4 text-base text-black/80 leading-snug max-w-2xl"
          dangerouslySetInnerHTML={{ __html: copy.why }}
        />
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
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
        <RestartRow onRestart={onRestart} />
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-blue">
        Based on your answers, the right system is
      </p>
      <h2 className="mt-2 text-3xl md:text-4xl font-semibold text-black tracking-tight">
        {copy.heading}
      </h2>

      {primary ? (
        <ProductRecommendation product={primary} />
      ) : (
        <NoProductFallback onRestart={onRestart} />
      )}

      <p
        className="mt-6 text-base text-black/80 leading-snug max-w-2xl"
        dangerouslySetInnerHTML={{ __html: copy.why }}
      />

      {(copy.whyNotCheaper || copy.whyNotPricier || alternative) && (
        <details className="mt-6 group">
          <summary className="cursor-pointer text-sm font-semibold text-brand-blue hover:text-brand-blue-hover">
            Why not the next-cheaper or next-pricier option?
          </summary>
          <div className="mt-3 space-y-3 text-sm text-black/80 leading-snug max-w-2xl">
            {copy.whyNotCheaper && (
              <p>
                <span className="font-semibold text-black">Cheaper:</span>{' '}
                {copy.whyNotCheaper}
              </p>
            )}
            {copy.whyNotPricier && (
              <p>
                <span className="font-semibold text-black">Pricier:</span>{' '}
                {copy.whyNotPricier}
              </p>
            )}
            {alternative && (
              <p>
                <span className="font-semibold text-black">
                  Alternative:
                </span>{' '}
                {alternative.title} —{' '}
                <Link
                  href={alternative.href}
                  className="text-brand-blue underline underline-offset-4 hover:text-brand-blue-hover"
                >
                  view product
                </Link>
                .
              </p>
            )}
          </div>
        </details>
      )}

      {copy.installPackage && answers.placement === 'whole-house' && (
        <div className="mt-8 bg-brand-blue-light border border-brand-blue/20 rounded-lg p-5">
          <p className="text-base text-black">
            <span className="font-semibold">
              Live on the Central Coast NSW?
            </span>{' '}
            Get this installed by a licensed local plumber for{' '}
            <span className="font-semibold tabular-nums">$2,299</span>{' '}
            — system, installation, and 12 months of cartridges
            included.
          </p>
          <Link
            href="/whole-house-installation-package/"
            className="mt-3 inline-flex items-center text-brand-blue font-semibold hover:underline underline-offset-4"
          >
            See the install package →
          </Link>
        </div>
      )}

      <RestartRow onRestart={onRestart} />
    </div>
  );
}

function ProductRecommendation({
  product,
}: {
  product: ProductCardInfo;
}) {
  return (
    <div className="mt-6 flex flex-col sm:flex-row gap-5 border border-gray-200 rounded-lg p-5">
      <div className="relative w-full sm:w-40 aspect-square flex-shrink-0 bg-white border border-gray-100 rounded overflow-hidden">
        {product.image && (
          <Image
            src={product.image.url}
            alt=""
            fill
            sizes="(min-width: 640px) 160px, 100vw"
            className="object-contain p-2"
          />
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-black tracking-tight">
            {product.title}
          </h3>
          <PriceDisplay
            money={product.price}
            className="mt-2 block text-2xl font-bold text-black tracking-tight"
          />
          <span className="text-xs text-black/50">
            inc GST · same price retail or trade
          </span>
        </div>
        <Link
          href={product.href}
          className="self-start inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold py-3 px-6 rounded transition-colors"
        >
          View product →
        </Link>
      </div>
    </div>
  );
}

function NoProductFallback({
  onRestart,
}: {
  onRestart: () => void;
}) {
  return (
    <div className="mt-6 border border-gray-200 rounded-lg p-5">
      <p className="text-base text-black">
        We&apos;ve identified the right system shape for you, but the
        specific product isn&apos;t in this catalogue snapshot. Call
        us on{' '}
        <a
          href={`tel:${BUSINESS_INFO.phone.tel}`}
          className="text-brand-blue underline underline-offset-4 tabular-nums"
        >
          {BUSINESS_INFO.phone.display}
        </a>{' '}
        and we&apos;ll point you at the right one — or{' '}
        <button
          type="button"
          onClick={onRestart}
          className="text-brand-blue underline underline-offset-4"
        >
          adjust your answers
        </button>
        .
      </p>
    </div>
  );
}

function RestartRow({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="mt-10 flex flex-col sm:flex-row gap-4 text-sm text-black/70">
      <button
        type="button"
        onClick={onRestart}
        className="inline-flex items-center gap-1.5 hover:text-black"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        Not what you expected? Try again
      </button>
      <span aria-hidden="true" className="hidden sm:inline">
        ·
      </span>
      <Link
        href="/contact/"
        className="hover:text-black underline-offset-4 hover:underline"
      >
        Still unsure? Talk to us →
      </Link>
    </div>
  );
}
