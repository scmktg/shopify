'use client';

import { useEffect, useRef, useState } from 'react';
import type { ProductCardData } from '@/types/product';

type Finish = 'Matte Black' | 'Brushed Nickel' | 'Polished Chrome' | 'Brushed Gold';

const FINISH_ORDER: Finish[] = ['Matte Black', 'Brushed Nickel', 'Polished Chrome', 'Brushed Gold'];
const SWATCHES: Record<Finish, string> = {
  'Matte Black': 'linear-gradient(135deg,#55585c,#151719)',
  'Brushed Nickel': 'repeating-linear-gradient(100deg,#cdd0cc 0px,#9fa5a4 2px,#d4d7d4 4px,#9da5a5 6px)',
  'Polished Chrome': 'linear-gradient(120deg,#7f8891,#fafafa 35%,#8e999f 55%,#f8f8f8 75%,#66717a)',
  'Brushed Gold': 'linear-gradient(135deg,#f3dba3,#bb9856 36%,#d8b979 65%,#9f7b40)',
};

function finishFromTitle(title: string): Finish | null {
  if (/matte black/i.test(title)) return 'Matte Black';
  if (/brushed nickel|stainless steel/i.test(title)) return 'Brushed Nickel';
  if (/polished chrome/i.test(title)) return 'Polished Chrome';
  if (/brushed gold/i.test(title)) return 'Brushed Gold';
  return null;
}

interface Props {
  products: ReadonlyArray<ProductCardData | null>;
}

type Measure = {
  value: string;
  label: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tx: number;
  ty: number;
  vertical?: boolean;
};

const MEASURES: Measure[] = [
  { value: '23.5 cm', label: 'Spout reach', x1: 320, y1: 77, x2: 705, y2: 77, tx: 512, ty: 52 },
  { value: '41.5 cm', label: 'Overall height', x1: 194, y1: 129, x2: 194, y2: 673, tx: 167, ty: 401, vertical: true },
  { value: '28 cm', label: 'Outlet height', x1: 283, y1: 331, x2: 283, y2: 673, tx: 257, ty: 502, vertical: true },
  { value: '14 cm', label: 'Handle span', x1: 594, y1: 712, x2: 790, y2: 712, tx: 692, ty: 746 },
  { value: '11 cm', label: 'Handle height', x1: 833, y1: 497, x2: 833, y2: 655, tx: 861, ty: 576, vertical: true },
  { value: '5 cm', label: 'Small handle', x1: 475, y1: 566, x2: 475, y2: 638, tx: 445, ty: 601, vertical: true },
];

function DimensionLine({ measure, index, visible }: { measure: Measure; index: number; visible: boolean }) {
  const { x1, y1, x2, y2, tx, ty, vertical, value } = measure;
  const endCap = 12;
  return (
    <g className={visible ? 'ea-measure ea-measure-visible' : 'ea-measure'} style={{ animationDelay: `${index * 170}ms` }}>
      <path d={`M ${x1} ${y1} L ${x2} ${y2}`} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className="ea-dimension-draw" />
      <path d={vertical
        ? `M ${x1 - endCap} ${y1} h ${endCap * 2} M ${x2 - endCap} ${y2} h ${endCap * 2}`
        : `M ${x1} ${y1 - endCap} v ${endCap * 2} M ${x2} ${y2 - endCap} v ${endCap * 2}`}
        stroke="currentColor" strokeWidth="1.7" fill="none" />
      <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
        transform={vertical ? `rotate(-90 ${tx} ${ty})` : undefined}
        className="fill-current text-[21px] font-medium tracking-tight">{value}</text>
    </g>
  );
}

export function ThreeWayTapDimensions({ products }: Props) {
  const finishes = FINISH_ORDER.flatMap((name) => {
    const item = products.find((product) => product && finishFromTitle(product.title) === name);
    return item?.featuredImage?.url ? [{ name, image: item.featuredImage.url }] : [];
  });
  const [selected, setSelected] = useState<Finish>('Matte Black');
  const [entered, setEntered] = useState(false);
  const [cycle, setCycle] = useState(0);
  const root = useRef<HTMLElement>(null);
  const selectedFinish = finishes.find((finish) => finish.name === selected) ?? finishes[0];

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEntered(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setEntered(true);
        observer.disconnect();
      }
    }, { threshold: 0.18 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (!selectedFinish) return null;

  return (
    <section ref={root} aria-labelledby="tap-dimensions-heading" className="mx-auto mt-16 max-w-6xl border-t border-black/10 pt-14 md:mt-20 md:pt-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">The finishing details</p>
        <h3 id="tap-dimensions-heading" className="mt-4 text-[clamp(1.85rem,3.5vw,3.3rem)] font-light leading-tight tracking-tight text-black">
          Beautifully designed. <span className="font-semibold">Thoughtfully sized.</span>
        </h3>
        <p className="mt-5 text-base leading-8 text-black/65">
          See exactly how your new tap will fit into your kitchen.
          Select a finish to explore the dimensions of the 3 way mixer.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-2xl bg-[#f7f7f7] px-2 py-6 sm:px-6 sm:py-9">
        <div className="relative mx-auto w-full max-w-[900px]" role="img" aria-label={`${selectedFinish.name} 3 way mixer dimensions: overall height 41.5 centimetres, spout reach 23.5 centimetres, outlet height 28 centimetres, handle span 14 centimetres, handle height 11 centimetres and small handle 5 centimetres.`}>
          <svg viewBox="0 0 1000 790" className="block w-full" xmlns="http://www.w3.org/2000/svg">
            {/* Measured positions follow the supplied matte-black dimension drawing.
                The transparent catalogue render is illustrative, not an installation template. */}
            <foreignObject x="307" y="102" width="515" height="602">
              <div className="flex h-full w-full items-center justify-center">
                <img key={selectedFinish.image} src={selectedFinish.image}
                  alt="" loading="lazy" decoding="async"
                  className={entered ? 'ea-tap-dimension-image h-full w-full object-contain' : 'h-full w-full object-contain opacity-0'}
                />
              </div>
            </foreignObject>
            <g key={`${selected}-${cycle}`} className="text-[#3d4145]" fill="none">
              {MEASURES.map((measure, index) => (
                <DimensionLine key={measure.label} measure={measure} index={index} visible={entered} />
              ))}
            </g>
          </svg>
        </div>
        <div className="mx-auto mt-3 flex max-w-lg flex-wrap justify-center gap-2" role="group" aria-label="View tap finish">
          {finishes.map((finish) => (
            <button key={finish.name} type="button" aria-pressed={selected === finish.name}
              onClick={() => { setSelected(finish.name); setCycle((previous) => previous + 1); }}
              className={`flex min-h-11 items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${selected === finish.name ? 'border-black bg-white text-black' : 'border-black/10 bg-white/60 text-black/60 hover:border-black/35 hover:text-black'}`}
            >
              <span className="h-4 w-4 shrink-0 rounded-full border border-black/10" style={{ background: SWATCHES[finish.name] }} aria-hidden="true" />
              {finish.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-7 grid max-w-4xl grid-cols-2 gap-x-7 gap-y-5 border-y border-black/10 py-7 sm:grid-cols-3">
        {MEASURES.map((measure) => (
          <div key={measure.label}>
            <p className="text-lg font-semibold tracking-tight text-black">{measure.value}</p>
            <p className="mt-1 text-xs text-black/55">{measure.label}</p>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-5 max-w-3xl text-center text-xs leading-6 text-black/50">
        Dimensions are based on the supplied product drawing. Confirm sink clearance and installation requirements with your licensed plumber.
      </p>

      <style>{`
        .ea-tap-dimension-image { animation: ea-tap-appear 850ms cubic-bezier(.2,.75,.2,1) both; }
        .ea-measure { opacity: 0; }
        .ea-measure-visible { animation: ea-label-appear 480ms ease-out both; }
        .ea-dimension-draw { stroke-dasharray: 1100; stroke-dashoffset: 1100; }
        .ea-measure-visible .ea-dimension-draw { animation: ea-dimension-draw 900ms ease-out both; }
        @keyframes ea-tap-appear {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ea-label-appear { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ea-dimension-draw { to { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .ea-tap-dimension-image, .ea-measure-visible, .ea-measure-visible .ea-dimension-draw { animation: none; opacity: 1; stroke-dashoffset: 0; }
        }
      `}</style>
    </section>
  );
}
