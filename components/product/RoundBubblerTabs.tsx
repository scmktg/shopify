import type { ReactNode } from 'react';

export function FountainDetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group border-b border-neutral-200">
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-semibold text-neutral-900 transition-colors hover:text-brand-blue focus-visible:outline-2 focus-visible:outline-brand-blue [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden="true" className="relative flex h-6 w-6 shrink-0 items-center justify-center text-neutral-500">
          <span className="absolute h-px w-4 bg-current" />
          <span className="absolute h-4 w-px bg-current transition-transform group-open:scale-y-0 motion-reduce:transition-none" />
        </span>
      </summary>
      <div className="min-w-0 pb-7 text-sm leading-relaxed">{children}</div>
    </details>
  );
}

export function RoundBubblerTabs({ description, specifications }: {
  description: ReactNode;
  specifications: ReactNode;
}) {
  return (
    <>
      <FountainDetailSection title="Description">{description}</FountainDetailSection>
      <FountainDetailSection title="Specifications">{specifications}</FountainDetailSection>
    </>
  );
}
