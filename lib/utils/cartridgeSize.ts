/**
 * Cartridge-size detection from a Shopify handle.
 *
 * Australian water-filter cartridges follow a small fixed set of
 * sizes (10" or 20" length × 2.5" or 4.5" diameter — "Big Blue" is
 * the 4.5" diameter). Handles in this catalogue encode the size as
 * a trailing `-LL-x-DD-D` slug (e.g. `polypropylene-sediment-water-
 * filter-pp-5-micron-20-x-4-5`). This helper parses that out so
 * the cartridge category pages can offer a client-side size filter
 * without needing a Shopify metafield read or a products.json
 * schema change.
 *
 * Used by `components/category/SizeFilter.tsx` and the cartridge
 * filtering logic in `CategoryView`.
 */

export type CartridgeSize = '10x2.5' | '10x4.5' | '20x2.5' | '20x4.5';

export const CARTRIDGE_SIZE_OPTIONS: ReadonlyArray<{
  value: CartridgeSize;
  label: string;
}> = [
  { value: '10x2.5', label: '10" × 2.5"' },
  { value: '10x4.5', label: '10" × 4.5"' },
  { value: '20x2.5', label: '20" × 2.5"' },
  { value: '20x4.5', label: '20" × 4.5"' },
];

const SIZE_REGEX = /-(\d+)-x-(\d+(?:-\d+)?)(?:-|$)/;

/**
 * Parses the trailing size token from a handle, returning a
 * canonical "{length}x{diameter}" string (e.g. "20x4.5") or null
 * when the handle doesn't carry a recognisable size.
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
    value === '10x2.5' ||
    value === '10x4.5' ||
    value === '20x2.5' ||
    value === '20x4.5'
  );
}
