import type { ReactNode } from 'react';

export function FountainDetailSection({ title, children, id, desktopClassName = '' }: {
  title: string;
  children: ReactNode;
  id: string;
  desktopClassName?: string;
}) {
  return (
    <div id={id} className={`scroll-mt-40 ${desktopClassName}`}>
      <details className="group rounded-xl border border-neutral-200 bg-white md:contents">
        <summary className="flex min-h-[76px] cursor-pointer list-none items-center justify-between gap-5 px-5 py-6 text-base font-semibold text-neutral-900 transition-colors hover:text-brand-blue focus-visible:outline-2 focus-visible:outline-brand-blue [&::-webkit-details-marker]:hidden md:hidden">
          {title}
          <span aria-hidden="true" className="relative flex h-6 w-6 shrink-0 items-center justify-center text-neutral-500">
            <span className="absolute h-px w-4 bg-current" />
            <span className="absolute h-4 w-px bg-current transition-transform group-open:scale-y-0 motion-reduce:transition-none" />
          </span>
        </summary>
        <div className="min-w-0 px-5 pb-8 text-sm leading-relaxed md:p-0 md:text-base">{children}</div>
      </details>
    </div>
  );
}

export function RoundBubblerTabs({ description, specifications }: {
  description: ReactNode;
  specifications: ReactNode;
}) {
  return (
    <div className="space-y-4 md:space-y-16">
      <FountainDetailSection id="fountain-description" title="Description" desktopClassName="md:pt-6">{description}</FountainDetailSection>
      <FountainDetailSection id="fountain-specifications" title="Specifications" desktopClassName="md:border-t md:border-black/10 md:pt-14">{specifications}</FountainDetailSection>
    </div>
  );
}
