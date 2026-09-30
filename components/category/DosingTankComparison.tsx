const TANKS = [
  {
    capacity: '40L',
    shape: 'Square',
    dimensions: '340 × 380 × 390 mm high',
    bund: 'No matching bund',
  },
  {
    capacity: '60L',
    shape: 'Square',
    dimensions: '340 × 380 × 550 mm high',
    bund: 'No matching bund',
  },
  {
    capacity: '50L',
    shape: 'Round',
    dimensions: 'Ø390 × 460 mm high',
    bund: '50L bund',
  },
  {
    capacity: '100L',
    shape: 'Round',
    dimensions: 'Ø460 × 820 mm high',
    bund: '100L short bund',
  },
  {
    capacity: '200L',
    shape: 'Round',
    dimensions: 'Ø560 × 950 mm high',
    bund: '200L standard bund',
  },
  {
    capacity: '300L',
    shape: 'Round',
    dimensions: 'Ø710 × 960 mm high',
    bund: '400L standard bund',
  },
  {
    capacity: '500L',
    shape: 'Round',
    dimensions: 'Ø840 × 1060 mm high',
    bund: 'Bund option to be confirmed',
  },
] as const;

const BUNDS = [
  {
    capacity: '50L',
    style: 'Standard',
    dimensions: 'Ø480 top / Ø360 bottom × 425 mm high',
    matchedTank: '50L',
  },
  {
    capacity: '100L',
    style: 'Short / low',
    dimensions: 'Ø625 top / Ø515 bottom × 440 mm high',
    matchedTank: '100L',
  },
  {
    capacity: '200L',
    style: 'Standard',
    dimensions: 'Ø725 top / Ø580 bottom × 732 mm high',
    matchedTank: '200L',
  },
  {
    capacity: '200L',
    style: 'Basin / low profile',
    dimensions: 'Ø900 top / Ø770 bottom × 410 mm high',
    matchedTank: '200L',
  },
  {
    capacity: '400L',
    style: 'Standard',
    dimensions: 'Ø945 top / Ø790 bottom × 743 mm high',
    matchedTank: '300L',
  },
] as const;

export function DosingTankComparison() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/55">
            Compare the range
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black">
            Tank sizes and compatible bunds
          </h2>
          <p className="mt-2 text-sm leading-6 text-black/70">
            Tanks and secondary-containment bunds are sold separately. Compatibility shown below is based on the stocked range and confirmed fit. Check the individual product page for full specifications and chemical suitability.
          </p>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-black/15 text-xs uppercase tracking-wider text-black/55">
                <th className="px-3 py-3 font-semibold">Tank capacity</th>
                <th className="px-3 py-3 font-semibold">Shape</th>
                <th className="px-3 py-3 font-semibold">Tank dimensions</th>
                <th className="px-3 py-3 font-semibold">Compatible bund</th>
              </tr>
            </thead>
            <tbody>
              {TANKS.map((tank) => (
                <tr key={tank.capacity} className="border-b border-black/10 last:border-0">
                  <td className="px-3 py-3 font-semibold text-black">{tank.capacity}</td>
                  <td className="px-3 py-3 text-black/75">{tank.shape}</td>
                  <td className="px-3 py-3 text-black/75">{tank.dimensions}</td>
                  <td className="px-3 py-3 text-black/75">{tank.bund}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <details className="mt-5 rounded-xl bg-black/[0.035] px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-black">
            Bund dimensions
          </summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[660px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-black/15 text-xs uppercase tracking-wider text-black/55">
                  <th className="px-3 py-3 font-semibold">Bund</th>
                  <th className="px-3 py-3 font-semibold">Style</th>
                  <th className="px-3 py-3 font-semibold">Outside dimensions</th>
                  <th className="px-3 py-3 font-semibold">Matched tank</th>
                </tr>
              </thead>
              <tbody>
                {BUNDS.map((bund) => (
                  <tr
                    key={`${bund.capacity}-${bund.style}`}
                    className="border-b border-black/10 last:border-0"
                  >
                    <td className="px-3 py-3 font-semibold text-black">{bund.capacity}</td>
                    <td className="px-3 py-3 text-black/75">{bund.style}</td>
                    <td className="px-3 py-3 text-black/75">{bund.dimensions}</td>
                    <td className="px-3 py-3 text-black/75">{bund.matchedTank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </section>
  );
}
