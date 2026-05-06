interface RecommendedForProps {
  items?: ReadonlyArray<string>;
}

/**
 * "Recommended for" list — the audiences the merchant has flagged as
 * good fit for this product. Renders as a tight bullet list so the
 * scanner can pattern-match to their own situation in two seconds.
 */
export function RecommendedFor({ items }: RecommendedForProps) {
  if (!items || items.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-black tracking-tight">
        Recommended for
      </h2>
      <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-black list-disc pl-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
