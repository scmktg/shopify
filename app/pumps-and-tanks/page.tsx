import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pumps & Tanks',
  description:
    '12V pumps, RO booster pumps, pressure pumps and tanks, dosing tanks, and replacement bladders. Coming soon.',
};

export default function PumpsAndTanksPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl sm:text-4xl font-semibold text-black">
        Pumps &amp; Tanks
      </h1>
      <p className="mt-4 text-base text-black">
        Coming soon. 12V pumps, RO booster pumps, pressure pumps and tanks, dosing tanks, and replacement bladders.
      </p>
    </section>
  );
}
