import type { Product } from '@/types/product';
import type { FaqItem } from '@/lib/content/markdown';
import type { ProductContent } from '@/lib/products/schema';
import { BUSINESS_INFO } from '@/content/business-info';
import { findCategory } from '@/content/categories';
import { absoluteUrl, getSiteUrl } from './siteUrl';

export type JsonLd = Record<string, unknown>;

export function organisationSchema(): JsonLd {
  const url = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BUSINESS_INFO.name,
    url,
    logo: absoluteUrl('/logo.svg'),
    description:
      "Australia's specialist water filtration retailer — wholesale prices for everyone.",
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_INFO.address.street,
      addressLocality: BUSINESS_INFO.address.locality,
      addressRegion: BUSINESS_INFO.address.region,
      postalCode: BUSINESS_INFO.address.postalCode,
      addressCountry: BUSINESS_INFO.address.country,
    },
  };
}

/**
 * LocalBusiness extends Organization, so the LocalBusiness emitted at
 * the layout level covers Organization rich-results requirements as
 * well. Used sitewide in app/layout.tsx for local SEO ranking.
 */
export function localBusinessSchema(): JsonLd {
  const url = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: BUSINESS_INFO.name,
    url,
    logo: absoluteUrl('/logo.svg'),
    description:
      "Australia's specialist water filtration retailer — wholesale prices for everyone.",
    telephone: BUSINESS_INFO.phone.tel,
    email: BUSINESS_INFO.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_INFO.address.street,
      addressLocality: BUSINESS_INFO.address.locality,
      addressRegion: BUSINESS_INFO.address.region,
      postalCode: BUSINESS_INFO.address.postalCode,
      addressCountry: BUSINESS_INFO.address.country,
    },
    openingHours: BUSINESS_INFO.showroom.schemaHours,
    priceRange: '$$',
    sameAs: [BUSINESS_INFO.social.facebook, BUSINESS_INFO.social.instagram],
  };
}

/**
 * Store-scoped LocalBusiness schema for the /showroom landing page.
 * Augments the sitewide LocalBusiness with geo coordinates, a
 * full openingHoursSpecification (Mon–Fri 09:00–17:00), an
 * areaServed list (Central Coast suburbs), and a hasMap link to
 * Google Maps. Use this on the showroom page only — the layout
 * already emits the sitewide LocalBusiness on every page.
 */
export interface StoreSchemaInput {
  /** Latitude of the storefront. */
  latitude: number;
  /** Longitude of the storefront. */
  longitude: number;
  /** Suburb names for `areaServed`. Plain strings, no postcode. */
  areaServed: ReadonlyArray<string>;
  /** Google Maps URL the schema should link to via `hasMap`. */
  mapUrl: string;
}

export function storeSchema(input: StoreSchemaInput): JsonLd {
  const url = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: BUSINESS_INFO.name,
    url: `${url}/showroom/`,
    image: absoluteUrl('/logo.svg'),
    description:
      'Walk-in water filter showroom on the NSW Central Coast. Big Blue systems on display, full cartridge stock, free Click & Collect.',
    telephone: BUSINESS_INFO.phone.tel,
    email: BUSINESS_INFO.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_INFO.address.street,
      addressLocality: BUSINESS_INFO.address.locality,
      addressRegion: BUSINESS_INFO.address.region,
      postalCode: BUSINESS_INFO.address.postalCode,
      addressCountry: BUSINESS_INFO.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: input.latitude,
      longitude: input.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
        ],
        opens: '09:00',
        closes: '17:00',
      },
    ],
    hasMap: input.mapUrl,
    areaServed: input.areaServed.map((name) => ({
      '@type': 'City',
      name,
    })),
    priceRange: '$',
    sameAs: [BUSINESS_INFO.social.facebook, BUSINESS_INFO.social.instagram],
  };
}

export function websiteSchema(): JsonLd {
  const url = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Enviro Aqua',
    url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbSchema(items: ReadonlyArray<BreadcrumbItem>): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqPageSchema(items: ReadonlyArray<FaqItem>): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

export function productSchema(
  product: Product,
  content: ProductContent,
  pathname: string,
  descriptionPlainText: string,
): JsonLd {
  const firstVariant = product.variants[0];
  const images = product.images.map((image) => image.url);
  const offerAvailability = firstVariant?.availableForSale
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';

  // Spec rows under additionalProperty: pull from products.json
  // fullSpecs verbatim — JSON-LD just wants name + value pairs.
  const additionalProperty: JsonLd[] = (content.fullSpecs ?? []).map(
    (row) => ({
      '@type': 'PropertyValue',
      name: row.label,
      value: row.value,
    }),
  );

  // Category string (Schema.org expects a single value, slash-
  // delimited for multi-level). Resolve to human labels via the
  // category tree so search engines see "Water Filters / Whole
  // House" not "water-filters/whole-house".
  const [catSlug, subSlug] = content.categories;
  const category = findCategory(catSlug);
  const subcategoryLabel =
    category?.subcategories.find((s) => s.slug === subSlug)?.label ?? subSlug;
  const categoryString = category
    ? `${category.label} / ${subcategoryLabel}`
    : `${catSlug}/${subSlug}`;

  const schema: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: descriptionPlainText,
    image: images.length > 0 ? images : undefined,
    sku: firstVariant?.sku ?? undefined,
    category: categoryString,
    brand: {
      '@type': 'Brand',
      name: 'Enviro Aqua',
    },
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(pathname),
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      price: product.priceRange.minVariantPrice.amount,
      availability: offerAvailability,
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  if (additionalProperty.length > 0) {
    schema.additionalProperty = additionalProperty;
  }

  const wm = content.compliance?.watermark;
  if (wm?.status === 'certified' && wm.licenceNumber && wm.certifier) {
    schema.hasCertification = {
      '@type': 'Certification',
      name: 'WaterMark Certification Scheme (Australia)',
      issuedBy: {
        '@type': 'Organization',
        name: wm.certifier,
      },
      identifier: wm.licenceNumber,
      ...(wm.validUntil ? { validUntil: wm.validUntil } : {}),
    };
  }

  return schema;
}

export function collectionSchema(
  name: string,
  pathname: string,
  description: string | null,
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url: absoluteUrl(pathname),
    ...(description ? { description } : {}),
  };
}
