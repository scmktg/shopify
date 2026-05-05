'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { useCart } from './CartProvider';
import { CartLineRow } from './CartLineRow';

const FREE_SHIPPING_THRESHOLD = 200;

export function CartDrawer() {
  const { cart, isOpen, closeDrawer, error } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeDrawer]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={closeDrawer}
        className={clsx(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        inert={!isOpen}
        className={clsx(
          'fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white text-black flex flex-col shadow-xl transition-transform duration-200 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold">
            Your cart
            {cart && cart.totalQuantity > 0 ? ` (${cart.totalQuantity})` : ''}
          </h2>
          <button
            type="button"
            aria-label="Close cart"
            onClick={closeDrawer}
            className="inline-flex items-center justify-center h-10 w-10 rounded hover:bg-gray-100"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {!cart || cart.lines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <p className="text-base text-black">Your cart is empty.</p>
            <Link
              href="/water-filters/"
              onClick={closeDrawer}
              className="mt-6 inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold px-6 py-3 rounded transition-colors"
            >
              Shop water filters
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              <FreeShippingProgress
                subtotal={Number.parseFloat(cart.subtotalAmount.amount)}
                currency={cart.subtotalAmount.currencyCode}
              />
              <ul className="-mt-2">
                {cart.lines.map((line) => (
                  <CartLineRow
                    key={line.id}
                    line={line}
                    onNavigate={closeDrawer}
                  />
                ))}
              </ul>
              {error && (
                <p role="alert" className="mt-4 text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>

            <div className="border-t border-gray-200 px-4 py-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-black/70">Subtotal</span>
                <PriceDisplay
                  money={cart.subtotalAmount}
                  className="text-base font-semibold text-black"
                />
              </div>
              <p className="text-xs text-black/60 mb-3">
                Shipping and taxes calculated at checkout.
              </p>
              <a
                href={cart.checkoutUrl}
                className="block w-full text-center bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold py-3 px-6 rounded transition-colors"
              >
                Checkout
              </a>
              <button
                type="button"
                onClick={closeDrawer}
                className="block w-full text-center mt-2 py-3 px-6 text-sm font-medium text-black/70 hover:text-black"
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

interface FreeShippingProgressProps {
  subtotal: number;
  currency: string;
}

function FreeShippingProgress({ subtotal, currency }: FreeShippingProgressProps) {
  if (currency !== 'AUD') return null;
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  const pct = Math.min(
    100,
    Math.max(0, (subtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );
  const message =
    remaining <= 0
      ? "You've unlocked free shipping."
      : `Spend $${remaining.toFixed(2)} more to unlock free shipping over $${FREE_SHIPPING_THRESHOLD}.`;
  return (
    <div className="py-3">
      <p className="text-xs text-black/70">{message}</p>
      <div
        className="mt-1.5 h-1.5 bg-gray-200 rounded overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-label="Free shipping progress"
      >
        <div
          className="h-full bg-brand-blue transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
