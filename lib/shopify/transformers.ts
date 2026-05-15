import type {
  CartridgeType,
  InstallationType,
  Product,
  ProductCardData,
  ProductMetafields,
  ShippingTier,
  WatermarkStatus,
} from '@/types/product';
import type {
  ShopifyMetafield,
  ShopifyProductCardRaw,
  ShopifyProductRaw,
} from '@/types/shopify';

const WATERMARK_STATUSES: ReadonlyArray<WatermarkStatus> = [
  'certified',
  'not_required',
  'not_certified',
  'pending',
];

const INSTALLATION_TYPES: ReadonlyArray<InstallationType> = [
  'under-sink',
  'whole-house',
  'bench-top',
  'inline',
  'countertop',
  'commercial',
];

const SHIPPING_TIERS: ReadonlyArray<ShippingTier> = [
  'T1',
  'T2',
  'T3',
  'T4',
  'T5',
  'T6',
  'T7',
];

const CARTRIDGE_TYPES: ReadonlyArray<CartridgeType> = [
  'sediment',
  'carbon-cto',
  'carbon-gac',
  'ro-membrane',
  'alkaline',
  'fluoride',
  't33',
  'pleated',
  'uf',
];

function isOneOf<T extends string>(
  value: string,
  allowed: ReadonlyArray<T>,
): value is T {
  return (allowed as ReadonlyArray<string>).includes(value);
}

function indexMetafields(
  raw: ReadonlyArray<ShopifyMetafield | null>,
): Map<string, ShopifyMetafield> {
  const map = new Map<string, ShopifyMetafield>();
  for (const mf of raw) {
    if (mf) map.set(mf.key, mf);
  }
  return map;
}

function asString(mf: ShopifyMetafield | undefined): string | null {
  return mf?.value ?? null;
}

function asInt(mf: ShopifyMetafield | undefined): number | null {
  if (!mf) return null;
  const n = Number.parseInt(mf.value, 10);
  return Number.isFinite(n) ? n : null;
}

function asFloat(mf: ShopifyMetafield | undefined): number | null {
  if (!mf) return null;
  const n = Number.parseFloat(mf.value);
  return Number.isFinite(n) ? n : null;
}

function asBoolean(mf: ShopifyMetafield | undefined): boolean | null {
  if (!mf) return null;
  if (mf.value === 'true') return true;
  if (mf.value === 'false') return false;
  return null;
}

function asDateIso(mf: ShopifyMetafield | undefined): string | null {
  if (!mf) return null;
  const date = new Date(mf.value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function asStringList(
  mf: ShopifyMetafield | undefined,
): ReadonlyArray<string> | null {
  if (!mf) return null;
  try {
    const parsed: unknown = JSON.parse(mf.value);
    if (
      Array.isArray(parsed) &&
      parsed.every((item) => typeof item === 'string')
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function asEnum<T extends string>(
  mf: ShopifyMetafield | undefined,
  allowed: ReadonlyArray<T>,
): T | null {
  if (!mf) return null;
  return isOneOf(mf.value, allowed) ? mf.value : null;
}

function buildMetafields(
  raw: ReadonlyArray<ShopifyMetafield | null>,
): ProductMetafields {
  const m = indexMetafields(raw);
  return {
    watermark_status: asEnum(m.get('watermark_status'), WATERMARK_STATUSES),
    watermark_licence_number: asString(m.get('watermark_licence_number')),
    watermark_certifier: asString(m.get('watermark_certifier')),
    watermark_valid_until: asDateIso(m.get('watermark_valid_until')),
    watermark_certificate_pdf: asString(m.get('watermark_certificate_pdf')),
    wels_rating_stars: asInt(m.get('wels_rating_stars')),
    wels_registration_number: asString(m.get('wels_registration_number')),
    installation_type: asEnum(m.get('installation_type'), INSTALLATION_TYPES),
    stages: asInt(m.get('stages')),
    cartridge_type: asEnum(m.get('cartridge_type'), CARTRIDGE_TYPES),
    micron_rating: asFloat(m.get('micron_rating')),
    housing_size: asString(m.get('housing_size')),
    connection_size: asString(m.get('connection_size')),
    flow_rate_lpm: asFloat(m.get('flow_rate_lpm')),
    voltage: asString(m.get('voltage')),
    capacity_l: asFloat(m.get('capacity_l')),
    bunded: asBoolean(m.get('bunded')),
    compatible_with_systems: asStringList(m.get('compatible_with_systems')),
    key_benefits: asStringList(m.get('key_benefits')),
    country_of_origin: asString(m.get('country_of_origin')),
    warranty_months: asInt(m.get('warranty_months')),
    shipping_tier: asEnum(m.get('shipping_tier'), SHIPPING_TIERS),
  };
}

export function transformShopifyProduct(raw: ShopifyProductRaw): Product {
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description,
    descriptionHtml: raw.descriptionHtml,
    productType: raw.productType,
    vendor: raw.vendor,
    tags: raw.tags,
    featuredImage: raw.featuredImage,
    images: raw.images.edges.map((edge) => edge.node),
    priceRange: raw.priceRange,
    variants: raw.variants.edges.map((edge) => edge.node),
    seo: raw.seo,
    metafields: buildMetafields(raw.metafields),
  };
}

export function transformShopifyProductCard(
  raw: ShopifyProductCardRaw,
): ProductCardData {
  const byKey = (key: string) =>
    raw.metafields.find(
      (mf): mf is NonNullable<typeof mf> => mf?.key === key,
    ) ?? null;
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    productType: raw.productType,
    tags: raw.tags,
    featuredImage: raw.featuredImage,
    price: raw.priceRange.minVariantPrice,
    priceMax: raw.priceRange.maxVariantPrice,
    housingSize: byKey('housing_size')?.value ?? null,
    keySpec: byKey('card_key_spec')?.value?.trim() || null,
    watermarkLicence: byKey('watermark_licence_number')?.value?.trim() || null,
  };
}
