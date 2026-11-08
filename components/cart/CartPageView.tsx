'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { trackViewCart } from '@/lib/analytics/client';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { ZipMessaging } from '@/components/payments/ZipMessaging';
import { useCart } from './CartProvider';
import { CartLineRow } from './CartLineRow';

export function CartPageView() {
  const { cart, isReady, isMutating, error, checkout, orderNote, setOrderNote } = useCart();
  const viewedCart = useRef<string | null>(null);
  useEffect(() => {
    if (!cart || cart.lines.length === 0 || viewedCart.current === cart.id) return;
    viewedCart.current = cart.id;
    trackViewCart(cart);
  }, [cart]);

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
          <ZipMessaging money={cart.subtotalAmount} className="mt-3" />
          <p className="mt-2 text-xs text-black/60">
            Shipping and taxes calculated at checkout.
          </p>
          <div className="mt-5">
            <label htmlFor="cart-order-notes" className="block text-sm font-medium text-black">
              Order notes <span className="font-normal text-black/60">(optional)</span>
            </label>
            <textarea
              id="cart-order-notes"
              value={orderNote}
              onChange={(event) => setOrderNote(event.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Special delivery instructions or requests? Let us know here."
              className="mt-2 block w-full resize-y rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-black/50 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
            />
            <p className="mt-2 text-xs text-black/60">
              For deliveries to multiple addresses, our team will confirm any additional freight costs before dispatch.
            </p>
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
          <a
            href={cart.checkoutUrl}
            onClick={(event) => { event.preventDefault(); void checkout(); }}
            aria-disabled={isMutating}
            className="mt-5 block w-full text-center bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold py-3 px-6 rounded transition-colors aria-disabled:opacity-60 aria-disabled:pointer-events-none"
          >
            {isMutating ? 'Preparing checkout…' : 'Checkout'}
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