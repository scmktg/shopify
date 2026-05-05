import type {
  Money,
  ProductImage,
  ProductSeo,
  SelectedOption,
} from './product';

export interface ShopifyEdge<T> {
  node: T;
}

export interface ShopifyConnection<T> {
  edges: ReadonlyArray<ShopifyEdge<T>>;
}

export interface ShopifyMetafield {
  key: string;
  value: string;
  type: string;
}

export interface ShopifyVariantNode {
  id: string;
  sku: string | null;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: ReadonlyArray<SelectedOption>;
}

export interface ShopifyProductRaw {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  vendor: string;
  tags: ReadonlyArray<string>;
  featuredImage: ProductImage | null;
  images: ShopifyConnection<ProductImage>;
  priceRange: { minVariantPrice: Money };
  variants: ShopifyConnection<ShopifyVariantNode>;
  /**
   * `metafields(identifiers: [...])` returns the same length as the request,
   * with `null` at any position where the metafield is unset.
   */
  metafields: ReadonlyArray<ShopifyMetafield | null>;
  seo: ProductSeo;
}

export interface ShopifyProductByHandleResponse {
  product: ShopifyProductRaw | null;
}
