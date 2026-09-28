import { swatchBackground } from '@/lib/products/colourSwatches';

interface ColourSwatchProps {
  value: string;
  selected?: boolean;
  unavailable?: boolean;
  size?: 'sm' | 'md';
}

export function ColourSwatch({
  value,
  selected = false,
  unavailable = false,
  size = 'md',
}: ColourSwatchProps) {
  const dimension = size === 'sm' ? 'h-5 w-5' : 'h-7 w-7';

  return (
    <span
      aria-hidden="true"
      className={[
        'relative inline-block shrink-0 rounded-full border',
        dimension,
        selected ? 'border-black ring-2 ring-black ring-offset-2' : 'border-black/20',
        unavailable ? 'opacity-40' : '',
      ].join(' ')}
      style={{ background: swatchBackground(value) }}
    >
      {unavailable && (
        <span className="absolute left-1/2 top-1/2 h-px w-[130%] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-black/50" />
      )}
    </span>
  );
}
