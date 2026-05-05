import type { Metadata } from 'next';
import { CartPageView } from '@/components/cart/CartPageView';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Review the items in your cart and check out.',
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartPageView />;
}
