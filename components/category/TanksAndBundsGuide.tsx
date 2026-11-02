import Link from 'next/link';

const options = [
  {
    title: 'Chemical Dosing Tanks',
    subtitle: 'Standalone tanks',
    detail: 'Polyethylene tanks from 40L to 500L. Select a capacity to compare dimensions and fittings.',
    href: '/tanks-and-bunds/chemical-dosing-tanks',
    capacities: ['40L', '50L', '60L', '100L', '200L', '300L', '500L'],
  },
  {
    title: 'Chemical Bunds',
    subtitle: 'Secondary containment',
    detail: 'Shop bunds separately for existing tanks. Check compatibility and required containment capacity.',
    href: '/tanks-and-bunds/chemical-bunds',
    capacities: ['50L', '100L', '200L', '400L'],
  },
  {
    title: 'Tank & Bund Packages',
    subtitle: 'Matched combinations',
    detail: 'Buy a compatible tank and bund together, with the individual components clearly identified.',
    href: '/tanks-and-bunds/tank-and-bund-packages',
    capacities: ['50L', '100L', '200L', '300L'],
  },
] as const;

export function TanksAndBundsGuide() {
  return (
    <section aria-labelledby="tanks-bunds-choose" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.13em] text-brand-blue">Choose your configuration</p>
        <h2 id="tanks-bunds-choose" className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-black">Find the right tank or bund</h2>
        <p className="mt-2 max-w-3xl text-sm text-black/65">Start with what you need: a tank, a bund for an existing tank, or both components together. Confirm dimensions and chemical suitability before ordering.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {options.map((option) => (
          <article key={option.href} className="flex flex-col rounded-2xl border border-black/10 bg-white p-5 transition-shadow hover:shadow-md">
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-blue">{option.subtitle}</span>
            <h3 className="mt-2 text-xl font-semibold text-black">{option.title}</h3>
            <p className="mt-2 min-h-16 text-sm leading-relaxed text-black/70">{option.detail}</p>
            <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Available capacities">
              {option.capacities.map((capacity) => (
                <span key={capacity} className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-medium text-black/70">{capacity}</span>
              ))}
            </div>
            <Link href={option.href} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue">
              Shop {option.title}
            </Link>
          </article>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-black/10 bg-gray-50 p-4 sm:p-5">
        <h3 className="font-semibold text-black">Not sure if you need a bund?</h3>
        <p className="mt-1 text-sm leading-relaxed text-black/70">A chemical bund provides secondary containment if a tank leaks or spills. The required containment volume and material compatibility depend on the chemical and the site's requirements. Check those details before selecting a tank-and-bund combination.</p>
      </div>
    </section>
  );
}
