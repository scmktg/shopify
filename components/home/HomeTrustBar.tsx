'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, DollarSign, MapPin, Pause, Play, ShieldCheck, Truck } from 'lucide-react';

const BENEFITS = [
  {
    icon: DollarSign,
    title: 'Wholesale-style pricing',
    body: 'The same public pricing for homeowners, tradies and commercial customers.',
  },
  {
    icon: Truck,
    title: 'Australian stock',
    body: 'Most stocked parcel orders placed before 12pm AEST dispatch the same business day.',
  },
  {
    icon: ShieldCheck,
    title: 'Compliance made clear',
    body: 'WaterMark, WELS and other compliance information is shown where applicable.',
  },
  {
    icon: MapPin,
    title: 'Filtration specialists',
    body: 'Australian owned and based in Wyong on the Central Coast NSW.',
  },
] as const;

export function HomeTrustBar() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    const interval = window.setInterval(() => {
      setActive((index) => (index + 1) % BENEFITS.length);
    }, 5500);
    return () => window.clearInterval(interval);
  }, [playing, reducedMotion]);

  const benefit = BENEFITS[active];
  const Icon = benefit.icon;

  return (
    <section aria-label="Why shop with Enviro Aqua" className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-[138px] max-w-7xl items-center gap-2 px-5 py-5 sm:min-h-[112px] sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => { setActive((active - 1 + BENEFITS.length) % BENEFITS.length); setPlaying(false); }}
          aria-label="Previous benefit"
          className="flex h-10 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue sm:w-10"
        >
          <ChevronLeft size={19} aria-hidden="true" />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-3 sm:gap-4" aria-live="off">
          <Icon size={27} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-brand-blue sm:h-8 sm:w-8" />
          <div className="min-w-0 max-w-2xl">
            <p className="text-sm font-semibold leading-snug text-slate-950 sm:text-base">{benefit.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">{benefit.body}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { setActive((active + 1) % BENEFITS.length); setPlaying(false); }}
          aria-label="Next benefit"
          className="flex h-10 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue sm:w-10"
        >
          <ChevronRight size={19} aria-hidden="true" />
        </button>
      </div>
      <div className="flex items-center justify-center gap-3 pb-4">
        {BENEFITS.map((item, index) => (
          <button
            type="button"
            key={item.title}
            onClick={() => { setActive(index); setPlaying(false); }}
            aria-label={`Show benefit ${index + 1}: ${item.title}`}
            aria-current={index === active ? 'true' : undefined}
            className={`h-2.5 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${index === active ? 'w-6 bg-brand-blue' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`}
          />
        ))}
        <button
          type="button"
          onClick={() => setPlaying((value) => !value)}
          aria-label={playing && !reducedMotion ? 'Pause rotating benefits' : 'Play rotating benefits'}
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
        >
          {playing && !reducedMotion ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
        </button>
      </div>
    </section>
  );
}
