'use client';

import { useState } from 'react';
import Link from 'next/link';

type Configuration = 'tank' | 'package';
const sizes = [50, 100, 200, 300, 500] as const;
const packageSizes = new Set<number>([50, 100, 200, 300]);
const tankHandle: Record<number,string> = {
  50:'chemical-dosing-tank-50l',100:'chemical-dosing-tank-100l',
  200:'chemical-dosing-tank-200l',300:'chemical-dosing-tank-300l',500:'chemical-dosing-tank-500l'
};
const urlFor = (size:number,config:Configuration) =>
  `/pumps-and-tanks/dosing-tanks/${config==='package' ? `chemical-dosing-tank-and-bund-${size}l` : tankHandle[size]}`;

export function TankConfigurationSelector({ initialSize = 100, initialConfiguration = 'tank' }:
  {initialSize?:number;initialConfiguration?:Configuration}) {
  const [size,setSize]=useState(initialSize);
  const [configuration,setConfiguration]=useState<Configuration>(initialConfiguration);
  const available=configuration==='tank'||packageSizes.has(size);
  const destination=available?urlFor(size,configuration):null;
  const matchesPage=size===initialSize&&configuration===initialConfiguration;
  return <section aria-labelledby="tank-configuration-title" className="my-9 rounded-xl border border-black/10 bg-[#f7f8f8] p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/45">Build your setup</p>
        <h2 id="tank-configuration-title" className="mt-2 text-xl font-semibold tracking-tight text-black sm:text-2xl">Choose your tank configuration</h2>
        <p className="mt-2 text-sm leading-6 text-black/60">Explore capacities and containment options before choosing the product to buy.</p>
      </div>
      <span className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black">{size}L · {configuration==='tank'?'Tank only':'Tank + bund'}</span>
    </div>
    <fieldset className="mt-7">
      <legend className="text-sm font-semibold text-black">Tank capacity</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {sizes.map(n=><button key={n} type="button" aria-pressed={size===n} onClick={()=>setSize(n)}
          className={`min-h-11 min-w-16 rounded-lg border px-4 text-sm font-semibold transition-colors ${size===n?'border-black bg-black text-white':'border-black/15 bg-white text-black hover:border-black/50'}`}>{n}L</button>)}
      </div>
    </fieldset>
    <fieldset className="mt-7">
      <legend className="text-sm font-semibold text-black">Configuration</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {([{value:'tank',title:'Tank only',description:'Primary storage vessel; no bund included'},{value:'package',title:'Tank + bund',description:'Matched tank and secondary containment package'}] as const).map(v=>
          <button type="button" key={v.value} onClick={()=>setConfiguration(v.value)} aria-pressed={configuration===v.value}
            className={`rounded-lg border p-4 text-left transition-colors ${configuration===v.value?'border-black bg-white ring-1 ring-black':'border-black/10 bg-white/50 hover:border-black/35'}`}>
            <span className="flex items-center gap-2 text-sm font-semibold text-black"><span className={`flex h-4 w-4 items-center justify-center rounded-full border ${configuration===v.value?'border-black':'border-black/30'}`}>{configuration===v.value&&<span className="h-2 w-2 rounded-full bg-black"/>}</span>{v.title}</span>
            <span className="mt-2 block text-xs leading-5 text-black/55">{v.description}</span>
          </button>)}
      </div>
    </fieldset>
    <div className="mt-7 border-t border-black/10 pt-6">
      {!available ? <p role="status" className="text-sm text-black/70">We don't currently have a 500L tank + bund package listed online. You can choose the 500L tank only, or select another package size.</p> :
       <div className="flex flex-wrap items-center justify-between gap-4">
         <div>
           <p className="text-base font-semibold text-black">{size}L {configuration==='tank'?'Chemical Dosing Tank':'Chemical Dosing Tank + Bund Package'}</p>
           <p className="mt-1 text-xs text-black/55">{matchesPage?'This product is currently selected.':'Your selection is ready. Open the matching product to see its current price, images and availability.'}</p>
         </div>
         {matchesPage ? <span className="rounded-full border border-black/20 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wide text-black">Current product</span> :
           <Link href={destination!} className="inline-flex min-h-12 items-center rounded-full bg-black px-6 text-sm font-semibold text-white hover:bg-neutral-800">View selected product ↗</Link>}
       </div>}
    </div>
  </section>;
}
