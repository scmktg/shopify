'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { FountainManualDownload } from './FountainManualDownload';
import { FOUNTAIN_TAB_LIST_CLASS, fountainTabClass } from './fountainTabStyles';

type Tab = 'description' | 'specifications' | 'downloads';

export function RoundBubblerTabs({ description, specifications, showDownloads = true }: {
  description: ReactNode;
  specifications: ReactNode;
  showDownloads?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const tabs: Tab[] = showDownloads ? ['description', 'specifications', 'downloads'] : ['description', 'specifications'];

  return (
    <div className="mt-10 border-t border-black/10 pt-2">
      <div role="tablist" aria-label="Product information" className={FOUNTAIN_TAB_LIST_CLASS}>
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            id={`round-bubbler-tab-${tab}`}
            aria-controls={`round-bubbler-panel-${tab}`}
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={fountainTabClass(activeTab === tab)}
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
      {showDownloads && <div role="tabpanel" id="round-bubbler-panel-downloads" aria-labelledby="round-bubbler-tab-downloads" hidden={activeTab !== 'downloads'} className="pt-9">
        <FountainManualDownload />
      </div>}
    </div>
  );
}
