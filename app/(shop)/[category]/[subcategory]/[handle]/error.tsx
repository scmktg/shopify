'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ProductErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Route-scoped error boundary for the product page.
 *
 * Without this, an uncaught error in the [handle] subtree bubbles to
 * the global error.tsx — and Vercel can occasionally surface that
 * crash as an opaque 401 instead of a 500. With this boundary in
 * place, we always render a real product-page error UI plus the
 * Vercel digest, which lets us cross-reference the runtime log on
 * the next walkthrough.
 */
export default function ProductErrorPage({
  error,
  reset,
}: ProductErrorPageProps) {
  useEffect(() => {
    console.error('[product-page error]', error);
  }, [error]);

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
      <p className="text-sm font-semibold tracking-wider uppercase text-brand-blue">
        Error
      </p>
      <h1 className="mt-3 text-4xl md:text-5xl font-semibold text-black">
        We couldn&apos;t load this product
      </h1>
      <p className="mt-4 text-base text-black/70">
        Our server hit an unexpected error rendering this product. Try
        refreshing — most of the time that&apos;s enough.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-black/50">
          Reference: <span className="font-mono">{error.digest}</span>
        </p>
      )}
      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold px-6 py-3 rounded transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="bg-white border border-black hover:bg-gray-50 text-black font-semibold px-6 py-3 rounded transition-colors"
        >
          Go home
        </Link>
      </div>
    </section>
  );
}
