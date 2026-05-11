/**
 * Cartridge-size detection.
 *
 * Australian water-filter cartridges come in a small fixed set of
 * sizes: 10" or 20" length × 2.5" or 4.5" diameter (the 4.5" is the
 * "Big Blue" format), plus a 10"×2" inline cartridge body used for
 * post-RO and quick-connect inline filters (alkaline, fluoride,
 * T33).
 *
 * Size is sourced, in order of preference, from:
 *   1. The `housing_size` metafield (canonical, e.g. "10x2.5").
 *   2. The `10x25` / `10x45` / `20x25` / `20x45` / `10x2` tag.
 *   3. The trailing `-LL-x-DD(-D)?` slug on the handle.
 *
 * The tag and metafield paths exist because handles in this
 * catalogue aren't a reliable source — some omit the size token
 * (RO membranes, multi-stage replacement sets), some run the digits
 * together (`-10x2-5` rather than `-10-x-2-5`), and a couple are
 * truncated mid-token. The metafield and the size tags are set
 * explicitly per product, so they're authoritative.
 *
 * Used by `components/category/SizeFilter.tsx` and the cartridge
 * filtering logic in `CategoryView`.
 */

export type CartridgeSize =
  | '10x2'
  | '10x2.5'
  | '10x4.5'
  | '20x2.5'
  | '20x4.5';

export const CARTRIDGE_SIZE_OPTIONS: ReadonlyArray<{
  value: CartridgeSize;
  label: string;
}> = [
  { value: '10x2', label: '10" × 2"' },
  { value: '10x2.5', label: '10" × 2.5"' },
  { value: '10x4.5', label: '10" × 4.5"' },
  { value: '20x2.5', label: '20" × 2.5"' },
  { value: '20x4.5', label: '20" × 4.5"' },
];

const TAG_TO_SIZE: Readonly<Record<string, CartridgeSize>> = {
  '10x2': '10x2',
  '10x25': '10x2.5',
  '10x45': '10x4.5',
  '20x25': '20x2.5',
  '20x45': '20x4.5',
};

// Matches `-10-x-2-5`, `-10-x-2`, and the concatenated `-10x2-5`
// variant. Anchored to start-of-string or a preceding `-` so a
// handle that begins with the size token (e.g.
// `20-x-2-5-whole-house-...`) is still picked up.
const SIZE_REGEX = /(?:^|-)(\d+)-?x-?(\d+(?:-\d+)?)(?:-|$)/;

interface CartridgeSizeInput {
  handle: string;
  tags?: ReadonlyArray<string>;
  housingSize?: string | null;
}

/**
 * Resolve a cartridge size from a product's metafield, tags, or
 * handle (in that order). Returns null when no recognisable size is
 * present.
 */
export function getProductCartridgeSize(
  product: CartridgeSizeInput,
): CartridgeSize | null {
  if (product.housingSize && isCartridgeSize(product.housingSize)) {
    return product.housingSize;
  }
  if (product.tags) {
    for (const tag of product.tags) {
      const mapped = TAG_TO_SIZE[tag];
      if (mapped) return mapped;
    }
  }
  return getCartridgeSize(product.handle);
}

/**
 * Handle-only fallback. Parses a trailing/embedded size token and
 * returns the canonical `{length}x{diameter}` string, or null when
 * the handle doesn't carry a recognisable size.
 */
export function getCartridgeSize(handle: string): CartridgeSize | null {
  const match = handle.match(SIZE_REGEX);
  if (!match) return null;
  const length = match[1];
  const diameterRaw = match[2];
  if (!length || !diameterRaw) return null;
  const diameter = diameterRaw.replace(/-/g, '.');
  const candidate = `${length}x${diameter}`;
  return isCartridgeSize(candidate) ? candidate : null;
}

function isCartridgeSize(value: string): value is CartridgeSize {
  return (
    value === '10x2' ||
    value === '10x2.5' ||
    value === '10x4.5' ||
    value === '20x2.5' ||
    value === '20x4.5'
  );
}
