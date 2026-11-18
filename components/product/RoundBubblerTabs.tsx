'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { FountainManualDownload } from './FountainManualDownload';

type Tab = 'description' | 'specifications' | 'downloads';

export function RoundBubblerTabs({ description, specifications }: {
  description: ReactNode;
  specifications: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const tabs: Tab[] = ['description', 'specifications', 'downloads'];

  return (
    <div className="mt-10 border-t border-black/10 pt-2">
      <div role="tablist" aria-label="Product information" className="flex w-full items-center justify-center gap-8 overflow-x-auto border-b border-black/10 sm:gap-16">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            id={`round-bubbler-tab-${tab}`}
            aria-controls={`round-bubbler-panel-${tab}`}
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`relative min-h-14 shrink-0 px-1 py-4 text-sm font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${activeTab === tab ? 'text-black after:absolute after:inset-x-0 after:bottom-[-1px] after:h-[2px] after:bg-black' : 'text-black/50 hover:text-black'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="round-bubbler-panel-description" aria-labelledby="round-bubbler-tab-description" hidden={activeTab !== 'description'} className="pt-4">
        {description}
      </div>
      <div role="tabpanel" id="round-bubbler-panel-specifications" aria-labelledby="round-bubbler-tab-specifications" hidden={activeTab !== 'specifications'} className="pt-4">
        {specifications}
      </div>
      <div role="tabpanel" id="round-bubbler-panel-downloads" aria-labelledby="round-bubbler-tab-downloads" hidden={activeTab !== 'downloads'} className="pt-9">
        <FountainManualDownload />
      </div>
    </div>
  );
}
