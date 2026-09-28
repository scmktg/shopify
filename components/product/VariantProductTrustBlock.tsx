'use client';

import { DEFAULT_LOW_STOCK_THRESHOLD } from '@/lib/site-config';
import { ProductTrustBlock, type StockStatus } from './ProductTrustBlock';
import { useVariantSelection } from './VariantSelectionProvider';

interface VariantProductTrustBlockProps {
  productId: string;
  className?: string;
}

export function VariantProductTrustBlock({
  productId,
  className,
}: VariantProductTrustBlockProps) {
  const { selectedVariant } = useVariantSelection();
  const inStock = selectedVariant.availableForSale;
  const quantity = selectedVariant.quantityAvailable;

  const stockStatus: StockStatus = !inStock
    ? 'out_of_stock'
    : quantity !== null && quantity <= DEFAULT_LOW_STOCK_THRESHOLD
      ? 'low_stock'
      : 'in_stock';

  return (
    <ProductTrustBlock
      productId={productId}
      sku={selectedVariant.sku}
      stockStatus={stockStatus}
      stockCount={quantity ?? undefined}
      className={className}
    />
  );
}
