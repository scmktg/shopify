import Link from 'next/link';
import { Check } from 'lucide-react';

interface WaterFilterStageGuideProps {
  subcategory: string;
}

const UNDER_SINK = [
  {
    stages: '2 Stage',
    title: 'Standard under-sink filtration',
    steps: ['Sediment', 'Carbon block'],
    summary:
      'For sediment, chlorine, taste and odour reduction without reverse osmosis.',
  },
  {
    stages: '3 Stage',
    title: 'Under-sink filtration + alkaline',
    steps: ['Sediment', 'Carbon block', 'Alkaline mineral'],
    summary:
      'Adds a mineral/alkaline stage while remaining a non-RO filtration system.',
  },
] as const;

const RO = [
  {
    stages: '5 Stage RO',
    title: 'Full reverse osmosis purification',
    steps: ['Sediment', 'GAC carbon', 'Carbon block', 'RO membrane', 'Post-carbon'],
    summary:
      'The core residential RO system for high-level dissolved-solids and contaminant reduction.',
  },
  {
    stages: '6 Stage RO',
    title: 'RO + remineralisation',
    steps: [
      'Sediment',
      'GAC carbon',
      'Carbon block',
      'RO membrane',
      'Post-carbon',
      'Alkaline mineral',
    ],
    summary:
      'Adds an alkaline mineral stage after RO for remineralisation and pH lift.',
  },
] as const;

export function WaterFilterStageGuide({
  subcategory,
}: WaterFilterStageGuideProps) {
  if (subcategory === 'under-sink') {
    return (
      <StageSection
        eyebrow="Under-sink filtration"
        title="Choose by what you want the filter to do"
        intro="Our standard under-sink systems are 2-stage and 3-stage filters. They do not use a reverse osmosis membrane. If you want RO purification, move to the 5-stage or 6-stage Reverse Osmosis range."
        systems={UNDER_SINK}
        footer={
          <>
            Want reverse osmosis?{' '}
            <Link
              href="/water-filters/reverse-osmosis/"
              className="font-semibold underline underline-offset-4 hover:text-brand-blue"
            >
              Compare 5-stage and 6-stage RO systems
            </Link>
            .
          </>
        }
      />
    );
  }

  if (subcategory === 'reverse-osmosis') {
    return (
      <StageSection
        eyebrow="Residential reverse osmosis"
        title="The household RO range starts at 5 stages"
        intro="For Enviro Aqua residential drinking-water systems, 5-stage is the core RO configuration and 6-stage adds alkaline remineralisation. Lower stage counts in our catalogue are conventional filtration, not smaller versions of the same household RO system."
        systems={RO}
        footer={
          <>
            Both residential RO systems use standard 1/4&quot; filtered-water tubing
            and can connect to suitable dedicated filter taps or 3-way kitchen
            mixers.
          </>
        }
      />
    );
  }

  return null;
}

function StageSection({
  eyebrow,
  title,
  intro,
  systems,
  footer,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  systems: ReadonlyArray<{
    stages: string;
    title: string;
    steps: ReadonlyArray<string>;
    summary: string;
  }>;
  footer: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black">
          {title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-black/70">
          {intro}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {systems.map((system) => (
            <article
              key={system.stages}
              className="rounded-lg border border-gray-200 bg-white p-5"
            >
              <p className="text-sm font-semibold text-brand-blue">
                {system.stages}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-black">
                {system.title}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {system.steps.map((step, index) => (
                  <span
                    key={step}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-black/75"
                  >
                    <span className="font-semibold text-black">
                      {index + 1}
                    </span>
                    {step}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-black/65">
                {system.summary}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-5 flex items-start gap-2 text-sm text-black/75">
          <Check
            size={17}
            strokeWidth={2.5}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-brand-blue"
          />
          <span>{footer}</span>
        </p>
      </div>
    </section>
  );
}
