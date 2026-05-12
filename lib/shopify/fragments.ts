/**
 * Lightweight product fragment used in grids, search suggestions, and
 * any list-style surface. Drops metafields, variants, and the full image
 * set to keep response size and Shopify call cost low.
 */
export const PRODUCT_CARD_FRAGMENT = /* GraphQL */ `
  fragment ProductCardFields on Product {
    id
    handle
    title
    productType
    tags
    featuredImage {
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    metafields(
      identifiers: [
        { namespace: "enviroaqua", key: "housing_size" }
      ]
    ) {
      key
      value
      type
    }
  }
`;

/**
 * Full product fragment for the canonical product detail page. Single
 * source of truth for the field list — every product-shaped detail
 * query must spread `ProductFields` rather than re-listing fields.
 *
 * `metafields(identifiers: [...])` returns an array in the same order
 * as the request, with `null` at any position where the metafield is
 * unset. The transformer indexes the result by `key`, so the order
 * here is informational.
 */
export const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    productType
    vendor
    tags
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 10) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 100) {
      edges {
        node {
          id
          sku
          title
          availableForSale
          quantityAvailable
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
    metafields(
      identifiers: [
        { namespace: "enviroaqua", key: "watermark_status" }
        { namespace: "enviroaqua", key: "watermark_licence_number" }
        { namespace: "enviroaqua", key: "watermark_certifier" }
        { namespace: "enviroaqua", key: "watermark_valid_until" }
        { namespace: "enviroaqua", key: "watermark_certificate_pdf" }
        { namespace: "enviroaqua", key: "wels_rating_stars" }
        { namespace: "enviroaqua", key: "wels_registration_number" }
        { namespace: "enviroaqua", key: "installation_type" }
        { namespace: "enviroaqua", key: "stages" }
        { namespace: "enviroaqua", key: "cartridge_type" }
        { namespace: "enviroaqua", key: "micron_rating" }
        { namespace: "enviroaqua", key: "housing_size" }
        { namespace: "enviroaqua", key: "connection_size" }
        { namespace: "enviroaqua", key: "flow_rate_lpm" }
        { namespace: "enviroaqua", key: "voltage" }
        { namespace: "enviroaqua", key: "capacity_l" }
        { namespace: "enviroaqua", key: "bunded" }
        { namespace: "enviroaqua", key: "compatible_with_systems" }
        { namespace: "enviroaqua", key: "key_benefits" }
        { namespace: "enviroaqua", key: "country_of_origin" }
        { namespace: "enviroaqua", key: "warranty_months" }
        { namespace: "enviroaqua", key: "shipping_tier" }
      ]
    ) {
      key
      value
      type
    }
    seo {
      title
      description
    }
  }
`;
