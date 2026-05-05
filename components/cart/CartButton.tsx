'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from './CartProvider';

interface CartButtonProps {
  className?: string;
}

export function CartButton({ className }: CartButtonProps) {
  const { cart, openDrawer } = useCart();
  const count = cart?.totalQuantity ?? 0;

  return (
    <button
      type="button"
      aria-label={count > 0 ? `Cart, ${count} item${count === 1 ? '' : 's'}` : 'Cart'}
      onClick={openDrawer}
      className={
        className ??
        'relative inline-flex items-center justify-center h-10 w-10 rounded hover:opacity-80'
      }
    >
      <ShoppingCart size={20} aria-hidden="true" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-brand-blue text-white text-[10px] font-semibold leading-none"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
