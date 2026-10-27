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
  const [rotation,setRotation]=useState(18);
  const available=configuration==='tank'||packageSizes.has(size);
  const destination=available?urlFor(size,configuration):null;
  const matchesPage=size===initialSize&&configuration===initialConfiguration;
  const visualHeight = ({50:190,100:240,200:285,300:325,500:355} as Record<number,number>)[size] || 240;
  const visualWidth = ({50:136,100:148,200:174,300:186,500:214} as Record<number,number>)[size] || 148;
  const left = 260-visualWidth/2;
  const top = 430-visualHeight;
  const frontOffset = Math.sin(rotation*Math.PI/180)*18;
  return <section aria-labelledby="tank-configuration-title" className="my-9 rounded-xl border border-black/10 bg-[#f7f8f8] p-5 sm:p-7">
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="min-w-0 rounded-xl bg-gradient-to-b from-[#edf0f1] to-[#dce2e4] px-3 py-5 sm:p-6">
        <div className="mb-1 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/55">Interactive tank model</p>
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-black/65">{size}L · {configuration==='tank'?'Tank only':'With bund'}</span>
        </div>
        <svg viewBox="0 0 520 500" role="img" aria-label={`Illustrative three-dimensional view of ${size} litre chemical tank ${configuration==='package'?'with bund':'without bund'}`} className="mx-auto block w-full max-w-[520px]">
          <defs>
            <linearGradient id="tank-body-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#809199"/>
              <stop offset=".16" stopColor="#c9d3d7"/>
              <stop offset=".42" stopColor="#eff3f4"/>
              <stop offset=".67" stopColor="#d7e0e3"/>
              <stop offset="1" stopColor="#7d8e95"/>
            </linearGradient>
            <linearGradient id="tank-bund-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#657780"/>
              <stop offset=".5" stopColor="#9bacb3"/>
              <stop offset="1" stopColor="#4d606b"/>
            </linearGradient>
            <radialGradient id="tank-shadow"><stop stopColor="#4c5b61" stopOpacity=".24"/><stop offset="1" stopColor="#4c5b61" stopOpacity="0"/></radialGradient>
          </defs>
          <ellipse cx="260" cy="447" rx="170" ry="26" fill="url(#tank-shadow)"/>
          <g transform={`translate(${frontOffset},0)`}>
            {configuration==='package' && <>
              <path d={`M${left-29} 406 Q260 374 ${left+visualWidth+29} 406 L${left+visualWidth+29} 442 Q260 482 ${left-29} 442Z`} fill="url(#tank-bund-gradient)" stroke="#61747d" strokeWidth="3"/>
              <ellipse cx="260" cy="405" rx={visualWidth/2+29} ry="26" fill="#b8c7cc" stroke="#61747d" strokeWidth="5"/>
            </>}
            <rect x={left} y={top+18} width={visualWidth} height={visualHeight-18} fill="url(#tank-body-gradient)" stroke="#83969e" strokeWidth="1.5"/>
            <ellipse cx="260" cy={430} rx={visualWidth/2} ry="18" fill="#8799a1"/>
            <ellipse cx="260" cy={top+18} rx={visualWidth/2} ry="20" fill="#eef3f3" stroke="#8b9ca3" strokeWidth="2"/>
            <rect x={260-visualWidth*.23} y={top-2} width={visualWidth*.46} height="18" fill="#c4d0d4" stroke="#83969e" strokeWidth="1.5"/>
            <ellipse cx="260" cy={top-2} rx={visualWidth*.23} ry="9" fill="#e1e9ec" stroke="#8799a1" strokeWidth="1.5"/>
            <ellipse cx="260" cy={top-2} rx={visualWidth*.16} ry="5" fill="#90a2aa"/>
            <path d={`M${left+visualWidth*.23} ${top+30} Q${left+visualWidth*.16} ${top+visualHeight*.5} ${left+visualWidth*.24} 407`} stroke="white" strokeOpacity=".48" strokeWidth="8" fill="none"/>
            <text x="260" y={top+visualHeight*.56} textAnchor="middle" fontSize="18" fontWeight="700" fill="#5c707a">{size}L</text>
          </g>
          <text x="260" y="486" textAnchor="middle" fontSize="12" fill="#63757c">Illustrative model · not to scale</text>
        </svg>
        <label htmlFor="tank-model-rotation" className="flex justify-between text-xs font-medium text-black/60"><span>Rotate view</span><span>{rotation}°</span></label>
        <input id="tank-model-rotation" type="range" min="-60" max="60" step="5" value={rotation} onChange={event=>setRotation(Number(event.target.value))} className="mt-2 w-full accent-black" aria-label="Rotate the tank preview"/>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/45">Build your setup</p>
        <h2 id="tank-configuration-title" className="mt-2 text-xl font-semibold tracking-tight text-black sm:text-2xl">Choose your tank configuration</h2>
        <p className="mt-2 text-sm leading-6 text-black/60">Select a capacity and add secondary containment to preview the setup.</p>
        <p className="mt-4 inline-block rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black">{size}L · {configuration==='tank'?'Tank only':'Tank + bund'}</p>
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
      </div>
    </div>
  </section>;
}
