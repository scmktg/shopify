'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ProductVariant } from '@/types/product';

interface VariantSelectionContextValue {
  variants: ReadonlyArray<ProductVariant>;
  selectedVariant: ProductVariant;
  optionNames: ReadonlyArray<string>;
  selectedOptions: ReadonlyMap<string, string>;
  selectOption: (name: string, value: string) => void;
}

const VariantSelectionContext =
  createContext<VariantSelectionContextValue | null>(null);

interface VariantSelectionProviderProps {
  variants: ReadonlyArray<ProductVariant>;
  initialVariantId?: string | null;
  children: ReactNode;
}

export function VariantSelectionProvider({
  variants,
  initialVariantId = null,
  children,
}: VariantSelectionProviderProps) {
  const initial =
    variants.find((variant) => variant.id === initialVariantId) ?? variants[0]!;
  const [selectedVariantId, setSelectedVariantId] = useState(initial.id);
  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ?? initial;

  const setVariant = (variant: ProductVariant) => {
    setSelectedVariantId(variant.id);
    const url = new URL(window.location.href);
    url.searchParams.set('variant', variant.id);
    window.history.replaceState(null, '', url);
  };

  const optionNames = useMemo(() => {
    const seen = new Set<string>();
    for (const variant of variants) {
      for (const option of variant.selectedOptions) {
        if (
          option.name.toLowerCase() !== 'title' &&
          option.value.toLowerCase() !== 'default title'
        ) {
          seen.add(option.name);
        }
      }
    }
    return Array.from(seen);
  }, [variants]);

  const selectedOptions = useMemo(
    () =>
      new Map(
        selectedVariant.selectedOptions.map((option) => [
          option.name,
          option.value,
        ]),
      ),
    [selectedVariant],
  );

  const selectOption = (name: string, value: string) => {
    const desired = new Map(selectedOptions);
    desired.set(name, value);

    const exact = variants.find((variant) =>
      optionNames.every((optionName) => {
        const variantValue = variant.selectedOptions.find(
          (option) => option.name === optionName,
        )?.value;
        return variantValue === desired.get(optionName);
      }),
    );

    if (exact) {
      setVariant(exact);
      return;
    }

    const fallback = variants.find((variant) =>
      variant.selectedOptions.some(
        (option) => option.name === name && option.value === value,
      ),
    );
    if (fallback) setVariant(fallback);
  };

  return (
    <VariantSelectionContext.Provider
      value={{
        variants,
        selectedVariant,
        optionNames,
        selectedOptions,
        selectOption,
      }}
    >
      {children}
    </VariantSelectionContext.Provider>
  );
}

export function useVariantSelection(): VariantSelectionContextValue {
  const context = useContext(VariantSelectionContext);
  if (!context) {
    throw new Error(
      'useVariantSelection must be used inside VariantSelectionProvider',
    );
  }
  return context;
}
