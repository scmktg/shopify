interface ZipMessagingProps {
  className?: string;
  compact?: boolean;
}

export function ZipMessaging({
  className = '',
  compact = false,
}: ZipMessagingProps) {
  return (
    <p
      className={`flex items-center gap-2 text-black/65 ${
        compact ? 'text-xs' : 'text-sm'
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className="inline-flex items-center justify-center rounded border border-black/15 bg-white px-1.5 py-0.5 text-[11px] font-bold leading-none tracking-tight text-black"
      >
        Zip
      </span>
      <span>Zip available at checkout</span>
    </p>
  );
}
