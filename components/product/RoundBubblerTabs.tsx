import type { ReactNode } from 'react';

export function RoundBubblerTabs({ description, specifications }: {
  description: ReactNode;
  specifications: ReactNode;
}) {
  return (
    <div className="space-y-12 md:space-y-16">
      <div id="fountain-description" className="scroll-mt-40 pt-6">{description}</div>
      <div id="fountain-specifications" className="scroll-mt-40 border-t border-black/10 pt-10 md:pt-14">{specifications}</div>
    </div>
  );
}
