interface ReviewStarsProps {
  value: number;
  className?: string;
}

/**
 * Inline 5-star bar tinted to the visible rating. Same overlay
 * technique as ProductCardStars but tuned for the review surface —
 * larger text size, screen-reader-only numeric label so the
 * decorative glyphs don't get read twice.
 */
export function ReviewStars({ value, className = '' }: ReviewStarsProps) {
  const clamped = Math.max(0, Math.min(5, value));
  const pct = (clamped / 5) * 100;
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block leading-none ${className}`}
      style={{ width: '5em' }}
    >
      <span className="text-black/15">★★★★★</span>
      <span
        className="absolute inset-0 overflow-hidden text-amber-500"
        style={{ width: `${pct}%` }}
      >
        ★★★★★
      </span>
    </span>
  );
}
