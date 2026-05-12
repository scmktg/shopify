export type WatermarkStatus =
  | 'certified'
  | 'not_required'
  | 'not_certified'
  | 'pending';

export type InstallationType =
  | 'under-sink'
  | 'whole-house'
  | 'bench-top'
  | 'inline'
  | 'countertop'
  | 'commercial';

export type CartridgeType =
  | 'sediment'
  | 'carbon-cto'
  | 'carbon-gac'
  | 'ro-membrane'
  | 'alkaline'
  | 'fluoride'
  | 't33'
  | 'pleated'
  | 'uf';

export type ShippingTier = 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'T7';

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface ProductImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  sku: string | null;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: ReadonlyArray<SelectedOption>;
}

export interface ProductSeo {
  title: string | null;
  description: string | null;
}

export interface ProductMetafields {
  watermark_status: WatermarkStatus | null;
  watermark_licence_number: string | null;
  watermark_certifier: string | null;
  /** ISO-8601 string. */
  watermark_valid_until: string | null;
  /** Shopify GID for the certificate file; resolve via a separate query if rendering. */
  watermark_certificate_pdf: string | null;
  wels_rating_stars: number | null;
  wels_registration_number: string | null;
  installation_type: InstallationType | null;
  stages: number | null;
  cartridge_type: CartridgeType | null;
  micron_rating: number | null;
  housing_size: string | null;
  connection_size: string | null;
  flow_rate_lpm: number | null;
  voltage: string | null;
  capacity_l: number | null;
  bunded: boolean | null;
  compatible_with_systems: ReadonlyArray<string> | null;
  key_benefits: ReadonlyArray<string> | null;
  country_of_origin: string | null;
  warranty_months: number | null;
  shipping_tier: ShippingTier | null;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  vendor: string;
  tags: ReadonlyArray<string>;
  featuredImage: ProductImage | null;
  images: ReadonlyArray<ProductImage>;
  priceRange: { minVariantPrice: Money };
  variants: ReadonlyArray<ProductVariant>;
  seo: ProductSeo;
  metafields: ProductMetafields;
}

/**
 * Lightweight projection used in product grids, search suggestions,
 * and homepage tiles. Avoids fetching the full metafield set when
 * all we need is image, title, price, and certification tags.
 *
 * `housingSize` is the only metafield carried on the card — needed
 * for the "compatible cartridges" cross-sell on system product
 * pages. Null when the product is not housing-sized (most non-
 * filter products).
 */
export interface ProductCardData {
  id: string;
  handle: string;
  title: string;
  productType: string;
  tags: ReadonlyArray<string>;
  featuredImage: ProductImage | null;
  price: Money;
  housingSize: string | null;
}
