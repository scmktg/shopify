import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bubblers',
  description:
    'Commercial and residential drinking bubblers, plus replacement parts. Coming soon.',
};

export default function BubblersPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl sm:text-4xl font-semibold text-black">
        Bubblers
      </h1>
      <p className="mt-4 text-base text-black">
        Coming soon. Commercial and residential drinking bubblers, plus replacement parts.
      </p>
    </section>
  );
}
