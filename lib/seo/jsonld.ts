import type { Product } from '@/types/product';
import type { FaqItem } from '@/lib/content/markdown';
import { absoluteUrl, getSiteUrl } from './siteUrl';

export type JsonLd = Record<string, unknown>;

export function organisationSchema(): JsonLd {
  const url = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Enviro Aqua',
    url,
    logo: absoluteUrl('/logo.svg'),
    description:
      "Australia's specialist water filtration retailer — wholesale prices for everyone.",
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AU',
      addressRegion: 'NSW',
    },
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

export function productSchema(product: Product, pathname: string): JsonLd {
  const firstVariant = product.variants[0];
  const images = product.images.map((image) => image.url);
  const offerAvailability = firstVariant?.availableForSale
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';

  const additionalProperty: JsonLd[] = [];
  const m = product.metafields;

  if (m.watermark_status) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: 'WaterMark Status',
      value: m.watermark_status,
      ...(m.watermark_licence_number
        ? { identifier: m.watermark_licence_number }
        : {}),
    });
  }
  if (m.installation_type) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: 'Installation Type',
      value: m.installation_type,
    });
  }
  if (m.stages !== null) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: 'Stages',
      value: m.stages,
    });
  }
  if (m.micron_rating !== null) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: 'Micron Rating',
      value: m.micron_rating,
      unitText: 'micron',
    });
  }
  if (m.flow_rate_lpm !== null) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: 'Flow Rate',
      value: m.flow_rate_lpm,
      unitText: 'L/min',
    });
  }
  if (m.capacity_l !== null) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: 'Capacity',
      value: m.capacity_l,
      unitText: 'L',
    });
  }

  const schema: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: images.length > 0 ? images : undefined,
    sku: firstVariant?.sku ?? undefined,
    brand: {
      '@type': 'Brand',
      name: product.vendor || 'Enviro Aqua',
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

  if (
    m.watermark_status === 'certified' &&
    m.watermark_licence_number &&
    m.watermark_certifier
  ) {
    schema.hasCertification = {
      '@type': 'Certification',
      name: 'WaterMark Certification Scheme (Australia)',
      issuedBy: {
        '@type': 'Organization',
        name: m.watermark_certifier,
      },
      identifier: m.watermark_licence_number,
      ...(m.watermark_valid_until
        ? { validUntil: m.watermark_valid_until }
        : {}),
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
