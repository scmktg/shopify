'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { FountainManualDownload } from './FountainManualDownload';
import { FOUNTAIN_TAB_LIST_CLASS, fountainTabClass } from './fountainTabStyles';

type Tab = 'description' | 'specifications' | 'certification' | 'warranty' | 'downloads';

export function RoundBubblerTabs({ description, specifications, showDownloads = true, certification, warranty, prominent = false }: {
  description: ReactNode;
  specifications: ReactNode;
  showDownloads?: boolean;
  certification?: ReactNode;
  warranty?: ReactNode;
  prominent?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const tabs: Tab[] = ['description', 'specifications'];
  if (certification != null) tabs.push('certification');
  if (warranty != null) tabs.push('warranty');
  if (showDownloads) tabs.push('downloads');

  return (
    <div className="mt-10 border-t border-black/10 pt-2">
      <div role="tablist" aria-label="Product information" className={prominent ? 'grid grid-cols-2 gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2 sm:grid-cols-4' : FOUNTAIN_TAB_LIST_CLASS}>
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            id={`round-bubbler-tab-${tab}`}
            aria-controls={`round-bubbler-panel-${tab}`}
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={prominent ? `min-h-12 rounded-md px-3 py-3 text-sm font-semibold capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${activeTab === tab ? 'bg-brand-blue text-white shadow-sm' : 'bg-white text-black/75 hover:bg-gray-100 hover:text-black'}` : fountainTabClass(activeTab === tab)}
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
      {certification != null && <div role="tabpanel" id="round-bubbler-panel-certification" aria-labelledby="round-bubbler-tab-certification" hidden={activeTab !== 'certification'} className="pt-4">{certification}</div>}
      {warranty != null && <div role="tabpanel" id="round-bubbler-panel-warranty" aria-labelledby="round-bubbler-tab-warranty" hidden={activeTab !== 'warranty'} className="pt-4">{warranty}</div>}
      {showDownloads && <div role="tabpanel" id="round-bubbler-panel-downloads" aria-labelledby="round-bubbler-tab-downloads" hidden={activeTab !== 'downloads'} className="pt-9">
        <FountainManualDownload />
      </div>}
    </div>
  );
}
