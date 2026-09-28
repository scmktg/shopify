import { Check } from 'lucide-react';

const BENEFITS = [
  'Hot, cold and filtered water from one tap',
  'All required connection fittings included',
  'Works with standard 1/4" filtered-water connections - not tied to our systems',
  'WaterMark certified and WELS 4 Star',
] as const;

export function ThreeWayTapHeroBenefits() {
  return (
    <div className="mt-4 rounded-lg border border-brand-blue/20 bg-brand-blue-light/50 p-4">
      <p className="text-sm font-semibold text-black">
        One tap. Three water functions. Everything needed to connect it.
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
