import { Check } from 'lucide-react';

const BENEFITS = [
  'Hot, cold and filtered water from one tap',
  'No separate filter tap or second bench hole',
  'WaterMark certified and WELS 4 Star',
  'Four premium finishes at the same price',
] as const;

export function ThreeWayTapHeroBenefits() {
  return (
    <div className="mt-4 rounded-lg border border-brand-blue/20 bg-brand-blue-light/50 p-4">
      <p className="text-sm font-semibold text-black">
        One tap. Three water functions. A cleaner benchtop.
      </p>
      <ul className="mt-3 grid gap-2 text-sm text-black/80">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2">
            <Check
              size={17}
              strokeWidth={2.5}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-brand-blue"
            />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
