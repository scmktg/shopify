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
export interface ProductCardRating {
  /** 0–5, one decimal. Renders nothing when undefined — no fake stars. */
  value: number;
  count: number;
}

export interface ProductCardData {
  id: string;
  handle: string;
  title: string;
  productType: string;
  tags: ReadonlyArray<string>;
  featuredImage: ProductImage | null;
  /** Lowest variant price — used directly for single-price products, and as the "from" anchor on multi-price ranges. */
  price: Money;
  /** Highest variant price. Used to detect price-range products ("from $X"). */
  priceMax: Money;
  housingSize: string | null;
  /**
   * Optional one-line differentiator surfaced on the card, e.g.
   * "Removes: chlorine, sediment, taste". Sourced from the
   * `enviroaqua.card_key_spec` Shopify metafield. Null when unset —
   * the card omits the row entirely rather than rendering a
   * placeholder.
   */
  keySpec: string | null;
  /**
   * WaterMark licence number for the badge on the card. Null when
   * unset — the badge is hidden, not stubbed out.
   */
  watermarkLicence: string | null;
  /**
   * Customer rating + review count. Currently not populated (no
   * reviews integration); kept on the type as a stable insertion
   * point so wiring in Judge.me / Stamped later is a single-call
   * change. ProductCard renders nothing when this is omitted.
   */
  rating?: ProductCardRating;
}
