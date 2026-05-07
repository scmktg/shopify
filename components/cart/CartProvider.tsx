'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  addToCart,
  createCart,
  getCart,
  removeCartLine,
  updateCartLine,
} from '@/lib/shopify/cart';
import type { Cart } from '@/types/cart';

const STORAGE_KEY = 'enviroaqua:cart-id';

interface CartContextValue {
  cart: Cart | null;
  isReady: boolean;
  isMutating: boolean;
  error: string | null;
  isOpen: boolean;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  /**
   * Add a variant to the cart and redirect to the Shopify checkout
   * URL. Does not open the drawer — the user is leaving the
   * storefront. Uses `window.location.assign` so the redirect is a
   * real navigation rather than a client-side route push.
   */
  buyNow: (variantId: string, quantity?: number) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Single-flight cart creation so two near-simultaneous addItem calls
  // share one createCart promise rather than producing two carts.
  const pendingCartRef = useRef<Promise<Cart> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cartId = readStoredCartId();
    if (!cartId) {
      setIsReady(true);
      return;
    }
    void (async () => {
      try {
        const fetched = await getCart(cartId);
        if (cancelled) return;
        if (fetched) {
          setCart(fetched);
        } else {
          clearStoredCartId();
        }
      } catch {
        clearStoredCartId();
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ensureCart = useCallback(async (): Promise<Cart> => {
    if (cart) return cart;
    if (pendingCartRef.current) return pendingCartRef.current;
    const promise = createCart().then((created) => {
      writeStoredCartId(created.id);
      setCart(created);
      pendingCartRef.current = null;
      return created;
    });
    pendingCartRef.current = promise;
    return promise;
  }, [cart]);

  const addItem = useCallback(
    async (variantId: string, quantity = 1) => {
      setError(null);
      setIsMutating(true);
      try {
        const current = await ensureCart();
        const updated = await addToCart(current.id, variantId, quantity);
        setCart(updated);
        setIsOpen(true);
      } catch (caught) {
        setError(extractMessage(caught, 'Could not add to cart.'));
      } finally {
        setIsMutating(false);
      }
    },
    [ensureCart],
  );

  const buyNow = useCallback(
    async (variantId: string, quantity = 1) => {
      setError(null);
      setIsMutating(true);
      try {
        const current = await ensureCart();
        const updated = await addToCart(current.id, variantId, quantity);
        setCart(updated);
        // Hard nav off the storefront; client-side router is irrelevant
        // for an external Shopify checkout URL.
        if (typeof window !== 'undefined') {
          window.location.assign(updated.checkoutUrl);
        }
      } catch (caught) {
        setError(extractMessage(caught, 'Could not start checkout.'));
        setIsMutating(false);
      }
      // Note: no finally — on success we're navigating away, so we leave
      // isMutating=true to keep buttons disabled until the page unloads.
    },
    [ensureCart],
  );

  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart) return;
      setError(null);
      setIsMutating(true);
      try {
        const updated = await updateCartLine(cart.id, lineId, quantity);
        setCart(updated);
      } catch (caught) {
        setError(extractMessage(caught, 'Could not update cart.'));
      } finally {
        setIsMutating(false);
      }
    },
    [cart],
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      if (!cart) return;
      setError(null);
      setIsMutating(true);
      try {
        const updated = await removeCartLine(cart.id, lineId);
        setCart(updated);
      } catch (caught) {
        setError(extractMessage(caught, 'Could not remove item.'));
      } finally {
        setIsMutating(false);
      }
    },
    [cart],
  );

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);
  const toggleDrawer = useCallback(() => setIsOpen((v) => !v), []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isReady,
      isMutating,
      error,
      isOpen,
      addItem,
      buyNow,
      updateItem,
      removeItem,
      openDrawer,
      closeDrawer,
      toggleDrawer,
    }),
    [
      cart,
      isReady,
      isMutating,
      error,
      isOpen,
      addItem,
      buyNow,
      updateItem,
      removeItem,
      openDrawer,
      closeDrawer,
      toggleDrawer,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}

function readStoredCartId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredCartId(cartId: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, cartId);
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

function clearStoredCartId(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function extractMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
