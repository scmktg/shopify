import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cartridges',
  description:
    'Replacement filter cartridges — sediment, carbon, RO membranes, alkaline, fluoride removal, and full sets. Coming soon.',
};

export default function CartridgesPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl sm:text-4xl font-semibold text-black">
        Cartridges
      </h1>
      <p className="mt-4 text-base text-black">
        Coming soon. Sediment, carbon, RO membranes, alkaline, fluoride removal, and full cartridge sets.
      </p>
    </section>
  );
}
