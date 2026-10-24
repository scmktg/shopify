import type { Metadata } from 'next';

const ZIP_MERCHANT_PUBLIC_KEY = 'bb5be3cd-da3b-4a78-8e40-6a979eb021a0';

export const metadata: Metadata = {
  title: 'Zip Payments',
  description:
    'Learn how to pay with Zip at Enviro Aqua. Zip is available as a payment option at checkout on eligible orders.',
  alternates: {
    canonical: '/zip/',
  },
};

export default function ZipPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 md:mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-blue">
            Payment options
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black md:text-4xl">
            Pay with Zip
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-black/70">
            Zip is available at checkout on eligible Enviro Aqua purchases. The
            information below is provided directly by Zip so you can review the
            current payment options, eligibility information and terms before
            you buy.
          </p>
        </div>

        <section
          aria-label="About Zip"
          className="min-h-[520px] overflow-hidden rounded-lg border border-black/10 bg-white"
        >
          <div
            zm-asset="landingpage"
            data-env="production"
            data-zm-merchant={ZIP_MERCHANT_PUBLIC_KEY}
            zm-widget="inline"
            data-zm-region="au"
          />
        </section>

        <p className="mt-6 text-xs leading-5 text-black/55">
          Zip is provided by Zip Co. Availability, approval, limits, fees and
          other terms are determined by Zip. Final payment options are shown at
          checkout.
        </p>
      </div>
    </main>
  );
}
