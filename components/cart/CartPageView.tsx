'use client';

import Link from 'next/link';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { useCart } from './CartProvider';
import { CartLineRow } from './CartLineRow';

export function CartPageView() {
  const { cart, isReady, error } = useCart();

  if (!isReady) {
    return (
      <p className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-sm text-black/70">
        Loading your cart…
      </p>
    );
  }

  if (!cart || cart.lines.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-semibold text-black">Your cart is empty</h1>
        <p className="mt-3 text-base text-black/70">
          Once you add something it will show up here.
        </p>
        <Link
          href="/water-filters/"
          className="mt-8 inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold px-6 py-3 rounded transition-colors"
        >
          Shop water filters
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-semibold text-black">Your cart</h1>
      <p className="mt-2 text-sm text-black/70">
        {cart.totalQuantity} {cart.totalQuantity === 1 ? 'item' : 'items'}
      </p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <ul className="border-t border-gray-200">
          {cart.lines.map((line) => (
            <CartLineRow key={line.id} line={line} />
          ))}
        </ul>

        <aside className="lg:sticky lg:top-24 self-start border border-gray-200 rounded p-5">
          <h2 className="text-base font-semibold">Order summary</h2>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-black/70">Subtotal</span>
            <PriceDisplay
              money={cart.subtotalAmount}
              className="font-semibold text-black"
            />
          </div>
          <p className="mt-1 text-xs text-black/60">
            Shipping and taxes calculated at checkout.
          </p>
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
          <a
            href={cart.checkoutUrl}
            className="mt-5 block w-full text-center bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold py-3 px-6 rounded transition-colors"
          >
            Checkout
          </a>
          <Link
            href="/water-filters/"
            className="mt-3 block w-full text-center py-3 px-6 text-sm font-medium text-black/70 hover:text-black"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </section>
  );
}
