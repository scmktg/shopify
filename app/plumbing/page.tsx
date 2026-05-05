import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plumbing',
  description:
    'Toilets, kitchen taps, bathroom taps, showers, and bundles. Coming soon.',
};

export default function PlumbingPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl sm:text-4xl font-semibold text-black">
        Plumbing
      </h1>
      <p className="mt-4 text-base text-black">
        Coming soon. Toilets, kitchen taps, bathroom taps, showers, and bundles.
      </p>
    </section>
  );
}
