import type { Product } from '@/types/product';
import type { ProductContent } from '@/lib/products/schema';
import type { JsonLd } from './jsonld';
import { absoluteUrl } from './siteUrl';

interface BubblerSchemaProfile {
  alternateNames: readonly string[];
  material: string;
  applications: readonly string[];
  properties: ReadonlyArray<readonly [name: string, value: string]>;
}

const BUBBLER_SCHEMA_PROFILES: Readonly<Record<string, BubblerSchemaProfile>> = {
  'commercial-water-bubbler-filtered-stainless-steel-watermark-certified-square-des': {
    alternateNames: [
      'Stainless steel water bubbler',
      'Stainless steel drinking fountain',
      'Commercial water bubbler',
      'Commercial drinking fountain',
      'Drinking water fountain',
    ],
    material: 'SUS304 stainless steel',
    applications: [
      'Schools',
      'Offices',
      'Factories',
      'Warehouses',
      'Gyms',
      'Sporting facilities',
      'Hospitality venues',
      'Public facilities',
    ],
    properties: [
      ['Product type', 'Chilled and filtered water bubbler / drinking fountain'],
      ['Installation format', 'Freestanding, direct mains connection'],
      ['Cooling capacity', '20 L/hr'],
      ['Chilled water temperature', 'Approximately 8–12°C'],
      ['Filtration', '2-stage sediment + activated carbon'],
      ['Cabinet profile', 'Square / flat-sided'],
      ['WaterMark standard', 'WMTS-105:2016'],
    ],
  },
  'commercial-stainless-steel-filtered-cold-water-bubbler-round-wm': {
    alternateNames: [
      'Round stainless steel water bubbler',
      'Round stainless steel drinking fountain',
      'Commercial water bubbler',
      'Commercial drinking fountain',
      'Drinking water fountain',
    ],
    material: '304 stainless steel',
    applications: [
      'Schools',
      'Offices',
      'Gyms',
      'Retail venues',
      'Public facilities',
    ],
    properties: [
      ['Product type', 'Filtered water bubbler / drinking fountain'],
      ['Installation format', 'Freestanding, direct mains connection'],
      ['Cabinet profile', 'Round / cylindrical'],
      ['Filtration', 'Integrated filtration cartridge'],
      ['WaterMark standard', 'WMTS-105:2016'],
    ],
  },
  'commercial-rust-free-filtered-cold-water-bubbler-wm': {
    alternateNames: [
      'Rust-free water bubbler',
      'Rust-free drinking fountain',
      'Commercial water bubbler',
      'Commercial drinking fountain',
      'Drinking water fountain',
    ],
    material: 'High-density polyethylene (HDPE)',
    applications: [
      'Schools',
      'Universities and TAFE campuses',
      'Offices',
      'Gyms and leisure centres',
      'Sporting clubs',
      'Retail venues',
      'Public facilities',
    ],
    properties: [
      ['Product type', 'Chilled and filtered water bubbler / drinking fountain'],
      ['Installation format', 'Freestanding, direct mains connection'],
      ['Cooling capacity', '20 L/hr'],
      ['Chilled water temperature', 'Approximately 8–12°C'],
      ['Filtration', '2-stage PP sediment + activated carbon'],
      ['Cabinet finish', 'Rust-free HDPE with granite-stone appearance'],
      ['WaterMark standard', 'WMTS-105:2016'],
    ],
  },
};

function normalisePropertyName(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

/**
 * Adds verified bubbler-specific semantics to the standard Product JSON-LD.
 *
 * The base schema remains the source of truth for price, availability, SKU,
 * images, offers, returns and certification. This layer only adds terminology,
 * material, applications and technical facts that are useful to search engines
 * and AI systems. It deliberately avoids inferring unverified specifications,
 * particularly for the round model.
 */
export function enrichBubblerProductSchema(
  schema: JsonLd,
  product: Product,
  content: ProductContent,
  pathname: string,
): JsonLd {
  const profile = BUBBLER_SCHEMA_PROFILES[product.handle];
  if (!profile) return schema;

  const existingProperties = Array.isArray(schema.additionalProperty)
    ? [...schema.additionalProperty]
    : [];
  const propertyNames = new Set(
    existingProperties
      .filter((item): item is JsonLd => Boolean(item) && typeof item === 'object')
      .map((item) => normalisePropertyName(item.name))
      .filter(Boolean),
  );

  const addProperty = (name: string, value: string) => {
    const key = normalisePropertyName(name);
    if (propertyNames.has(key)) return;
    existingProperties.push({
      '@type': 'PropertyValue',
      name,
      value,
    });
    propertyNames.add(key);
  };

  addProperty(
    'Common product terminology',
    'Water bubbler; drinking fountain; drinking water fountain',
  );

  const applications =
    content.recommendedFor && content.recommendedFor.length > 0
      ? content.recommendedFor
      : profile.applications;
  addProperty('Recommended applications', applications.join('; '));

  for (const [name, value] of profile.properties) {
    addProperty(name, value);
  }

  const canonicalUrl = absoluteUrl(pathname);

  return {
    ...schema,
    '@id':
      typeof schema['@id'] === 'string'
        ? schema['@id']
        : `${canonicalUrl}#product`,
    url: typeof schema.url === 'string' ? schema.url : canonicalUrl,
    alternateName: profile.alternateNames,
    material: profile.material,
    additionalProperty: existingProperties,
  };
}
