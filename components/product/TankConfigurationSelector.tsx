'use client';

import { useState } from 'react';
import Link from 'next/link';

type Configuration = 'tank' | 'package';
const sizes = [50, 100, 200, 300, 500] as const;
const packageSizes = new Set<number>([50, 100, 200, 300]);
const tankHandle: Record<number, string> = {
  50: 'chemical-dosing-tank-50l',
  100: 'chemical-dosing-tank-100l',
  200: 'chemical-dosing-tank-200l',
  300: 'chemical-dosing-tank-300l',
  500: 'chemical-dosing-tank-500l',
};
const urlFor = (size: number, configuration: Configuration) =>
  `/pumps-and-tanks/dosing-tanks/${configuration === 'package' ? `chemical-dosing-tank-and-bund-${size}l` : tankHandle[size]}`;

export function TankConfigurationSelector({
  initialSize = 100,
  initialConfiguration = 'tank',
}: {
  initialSize?: number;
  initialConfiguration?: Configuration;
}) {
  const initialIndex = Math.max(0, sizes.findIndex((size) => size === initialSize));
  const [index, setIndex] = useState(initialIndex);
  const [configuration, setConfiguration] = useState<Configuration>(initialConfiguration);
  const size = sizes[index];
  const bundAvailable = packageSizes.has(size);
  const available = configuration === 'tank' || bundAvailable;
  const changeCapacity = (nextIndex: number) => {
    setIndex(nextIndex);
    if (!packageSizes.has(sizes[nextIndex])) setConfiguration('tank');
  };
  const matchesPage = size === initialSize && configuration === initialConfiguration;
  const destination = available ? urlFor(size, configuration) : null;

  return (
    <section aria-labelledby="tank-configuration-title" className="mt-5 rounded-2xl border border-black/10 bg-[#f7f7f8] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 id="tank-configuration-title" className="text-base font-semibold tracking-tight text-black">Configure your tank</h2>
        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black/65 shadow-sm">{size}L · {configuration === 'tank' ? 'Tank only' : 'Tank + bund'}</span>
      </div>

      <div className="mt-7 flex items-end justify-between gap-2">
        <label htmlFor="tank-capacity-slider" className="text-sm font-semibold text-black">Tank capacity</label>
        <span className="text-2xl font-semibold tracking-tight text-black" aria-live="polite">{size}<span className="ml-0.5 text-sm font-medium text-black/55">L</span></span>
      </div>
      <input
        id="tank-capacity-slider"
        type="range"
        min={0}
        max={sizes.length - 1}
        step={1}
        value={index}
        onChange={(event) => changeCapacity(Number(event.target.value))}
        aria-valuetext={`${size} litres`}
        className="mt-4 h-2 w-full cursor-pointer accent-black"
      />
      <div className="mt-3 flex justify-between gap-1" aria-hidden="true">
        {sizes.map((capacity, i) => (
          <span key={capacity} className={`px-1 text-xs ${index === i ? 'font-semibold text-black' : 'text-black/45'}`}>{capacity}L</span>
        ))}
      </div>

      <div className="mt-6 border-t border-black/10 pt-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-black">Add chemical bund</p>
            <p className="mt-1 text-xs leading-5 text-black/55">{bundAvailable ? 'Matching secondary containment for your tank.' : 'Not available for the 500L tank.'}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-label="Add chemical bund"
            aria-checked={configuration === 'package'}
            disabled={!bundAvailable}
            aria-describedby={!bundAvailable ? 'bund-unavailable-message' : undefined}
            onClick={() => { if (bundAvailable) setConfiguration((current) => current === 'tank' ? 'package' : 'tank'); }}
            className={`relative h-9 w-[62px] shrink-0 rounded-full p-[3px] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-60 ${configuration === 'package' ? 'bg-black' : 'bg-[#d1d1d6]'}`}
          >
            <span className={`block h-[30px] w-[30px] rounded-full bg-white shadow-sm transition-transform duration-200 ${configuration === 'package' ? 'translate-x-[26px]' : 'translate-x-0'}`} />
          </button>
        </div>
        {!bundAvailable && <p id="bund-unavailable-message" role="status" className="mt-3 rounded-lg border border-black/10 bg-white px-4 py-3 text-xs leading-5 text-black/65">The 500L tank doesn't currently have a matching tank + bund package available online. Choose another size to enable this option.</p>}
      </div>

      <div className="mt-6 border-t border-black/10 pt-5">
        {!available ? (
          <p role="status" className="text-sm leading-6 text-black/65">A 500L tank-and-bund package is not currently listed. Select Tank only or a supported package capacity.</p>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-black">{size}L {configuration === 'tank' ? 'Chemical Dosing Tank' : 'Tank + Bund Package'}</p>
              <p className="mt-1 text-xs text-black/55">{matchesPage ? 'This is your current product.' : 'View the selected product for its live price and availability.'}</p>
            </div>
            {matchesPage ? (
              <span className="rounded-full border border-black/15 bg-white px-4 py-2.5 text-xs font-semibold text-black/65">Selected</span>
            ) : (
              <Link href={destination!} className="inline-flex min-h-11 items-center justify-center rounded-full bg-black px-5 text-xs font-semibold text-white transition-colors hover:bg-neutral-800">View selection ↗</Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
