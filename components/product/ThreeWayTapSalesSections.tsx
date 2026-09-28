import Link from 'next/link';
import { Check, Droplets, Flame, GlassWater, Wrench } from 'lucide-react';


export function ThreeWayTapSalesSections() {
  return (
    <>
      <section className="mt-12 rounded-xl border border-gray-200 bg-gray-50 px-5 py-8 sm:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
            How a 3-way tap works
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
            Hot, cold and filtered water. One kitchen tap.
          </h2>
          <p className="mt-3 text-base leading-7 text-black/70">
            The tap keeps the filtered-water pathway separate from the normal
            hot and cold mixer supply. Your filter or RO system connects to the
            dedicated filtered-water inlet, so you can keep a clean,
            single-fixture benchtop.
          </p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <FunctionCard
            icon={<Flame size={22} aria-hidden="true" />}
            title="Hot water"
            body="Connects to the normal household hot-water supply."
          />
          <FunctionCard
            icon={<Droplets size={22} aria-hidden="true" />}
            title="Cold water"
            body="Connects to the normal household cold-water supply."
          />
          <FunctionCard
            icon={<GlassWater size={22} aria-hidden="true" />}
            title="Filtered water"
            body="Dedicated inlet for your RO or under-sink filtration system."
          />
        </div>
      </section>

      <section className="mt-12 border-t border-gray-100 pt-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
            Why choose a 3-way mixer?
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black">
            Avoid the extra drinking-water tap
          </h2>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
          <div className="grid grid-cols-[1.4fr_1fr_1fr] bg-gray-50 text-sm font-semibold text-black">
            <div className="p-3 sm:p-4">Kitchen setup</div>
            <div className="p-3 text-center sm:p-4">3-way mixer</div>
            <div className="p-3 text-center sm:p-4">Separate filter tap</div>
          </div>
          {[
            ['Hot + cold water', true, true],
            ['Filtered drinking water', true, true],
            ['Only one tap fixture', true, false],
            ['Only one bench hole', true, false],
            ['Clean, uncluttered sink area', true, false],
          ].map(([label, threeWay, separate]) => (
            <div
              key={String(label)}
              className="grid grid-cols-[1.4fr_1fr_1fr] border-t border-gray-100 text-sm"
            >
              <div className="p-3 font-medium text-black/80 sm:p-4">
                {String(label)}
              </div>
              <ComparisonValue value={Boolean(threeWay)} />
              <ComparisonValue value={Boolean(separate)} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-6 rounded-xl border border-gray-200 p-5 sm:p-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="flex items-center gap-2 text-brand-blue">
            <Wrench size={22} aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-wide">
              Compatibility & installation
            </p>
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-black">
            Works with standard filtered-water systems - not just ours
          </h2>
          <p className="mt-3 text-sm leading-6 text-black/70">
            The dedicated filtered-water inlet uses a standard 1/4&quot;
            filtered-water connection, so you do not need an Enviro Aqua
            filtration system to use this tap. It is designed to connect to
            compatible under-sink and reverse osmosis systems using the same
            standard outlet format.
          </p>
          <div className="mt-5 rounded-lg border border-brand-blue/20 bg-brand-blue-light/50 p-4">
            <p className="font-semibold text-black">
              Installation fittings included
            </p>
            <p className="mt-1 text-sm leading-6 text-black/70">
              The tap is supplied with the connection fittings required for a
              standard installation, helping make the changeover straightforward
              and quick. A licensed plumber should complete mains plumbing work
              where required by local regulations.
            </p>
          </div>
          <ul className="mt-5 grid gap-3 text-sm text-black/75">
            <Benefit>5-stage reverse osmosis systems</Benefit>
            <Benefit>6-stage reverse osmosis systems</Benefit>
            <Benefit>2-stage under-sink sediment + carbon systems</Benefit>
            <Benefit>3-stage under-sink sediment + carbon + alkaline systems</Benefit>
            <Benefit>
              Other brands and compatible systems using a standard 1/4&quot;
              filtered-water outlet
            </Benefit>
          </ul>
        </div>

        <div className="rounded-lg bg-black p-5 text-white sm:p-6">
          <p className="text-sm font-semibold text-white/70">
            Need a filter system too?
          </p>
          <h3 className="mt-2 text-xl font-semibold">
            Choose the filtration level that suits your water
          </h3>
          <p className="mt-3 text-sm leading-6 text-white/75">
            Use this tap with any compatible under-sink filter or reverse
            osmosis system that has a standard 1/4&quot; filtered-water outlet.
            It is not locked to Enviro Aqua filtration systems.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/water-filters/reverse-osmosis/"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
            >
              View reverse osmosis systems
            </Link>
            <Link
              href="/water-filters/under-sink/"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              View under-sink filters
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function FunctionCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="text-brand-blue">{icon}</div>
      <h3 className="mt-3 font-semibold text-black">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-black/65">{body}</p>
    </div>
  );
}

function ComparisonValue({ value }: { value: boolean }) {
  return (
    <div className="flex items-center justify-center p-3 text-center sm:p-4">
      {value ? (
        <span className="inline-flex items-center gap-1 font-semibold text-black">
          <Check size={17} aria-hidden="true" className="text-brand-blue" />
          Yes
        </span>
      ) : (
        <span className="text-black/45">No</span>
      )}
    </div>
  );
}

function Benefit({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check
        size={17}
        strokeWidth={2.5}
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-brand-blue"
      />
      <span>{children}</span>
    </li>
  );
}
