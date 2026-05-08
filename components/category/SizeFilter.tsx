'use client';

import clsx from 'clsx';
import {
  CARTRIDGE_SIZE_OPTIONS,
  type CartridgeSize,
} from '@/lib/utils/cartridgeSize';

interface SizeFilterProps {
  /** null = "All sizes". */
  value: CartridgeSize | null;
  onChange: (next: CartridgeSize | null) => void;
  /** Optional count next to each pill (e.g. "10×2.5 (8)"). */
  counts?: Readonly<Record<CartridgeSize, number>>;
}

/**
 * Cartridge-size pill filter for the cartridges category pages.
 *
 * State is in-memory only (parent owns it). No URL search-param
 * wiring per CLAUDE.md hard rule #3 ("No URL filter parameters that
 * get indexed"). If the URL needs to reflect the filter at some
 * point, switch to non-indexable hash params at that time.
 */
export function SizeFilter({ value, onChange, counts }: SizeFilterProps) {
  const allCount = counts
    ? CARTRIDGE_SIZE_OPTIONS.reduce(
        (sum, opt) => sum + (counts[opt.value] ?? 0),
        0,
      )
    : null;

  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="text-sm font-medium text-black/70 mr-2">
        Size
      </legend>

      <Pill
        active={value === null}
        onClick={() => onChange(null)}
        label={allCount === null ? 'All sizes' : `All (${allCount})`}
      />

      {CARTRIDGE_SIZE_OPTIONS.map((opt) => {
        const count = counts?.[opt.value];
        const disabled = count === 0;
        const label =
          count !== undefined ? `${opt.label} (${count})` : opt.label;
        return (
          <Pill
            key={opt.value}
            active={value === opt.value}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            label={label}
          />
        );
      })}
    </fieldset>
  );
}

interface PillProps {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
}

function Pill({ active, disabled = false, onClick, label }: PillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={clsx(
        'inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors tabular-nums',
        active
          ? 'bg-black text-white border-black'
          : 'bg-white text-black border-gray-300 hover:border-black',
        disabled && 'opacity-40 cursor-not-allowed hover:border-gray-300',
      )}
    >
      {label}
    </button>
  );
}
