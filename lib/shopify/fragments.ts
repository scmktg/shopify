/**
 * Shared GraphQL fragments. Single source of truth for the product field
 * list — every product-shaped query must spread `ProductFields` rather than
 * re-listing fields.
 *
 * `metafields(identifiers: [...])` returns an array in the same order as the
 * request, with `null` at any position where the metafield is unset. The
 * transformer indexes the result by `key`, so the order here is informational.
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
