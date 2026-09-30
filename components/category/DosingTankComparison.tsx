const TANKS = [
  { capacity: '40L', shape: 'Square', dimensions: '340 × 380 × 390 mm high', bund: '—' },
  { capacity: '60L', shape: 'Square', dimensions: '340 × 380 × 550 mm high', bund: '—' },
  { capacity: '50L', shape: 'Round', dimensions: 'Ø390 × 460 mm high', bund: '50L Chemical Bund' },
  { capacity: '100L', shape: 'Round', dimensions: 'Ø460 × 820 mm high', bund: '100L Chemical Bund' },
  { capacity: '200L', shape: 'Round', dimensions: 'Ø560 × 950 mm high', bund: '200L Chemical Bund' },
  { capacity: '300L', shape: 'Round', dimensions: 'Ø710 × 960 mm high', bund: '400L Chemical Bund' },
  { capacity: '500L', shape: 'Round', dimensions: 'Ø840 × 1060 mm high', bund: '—' },
] as const;

const BUNDS = [
  { capacity: '50L Chemical Bund', dimensions: 'Ø480 top / Ø360 bottom × 425 mm high', matchedTank: '50L Chemical Dosing Tank' },
  { capacity: '100L Chemical Bund', dimensions: 'Ø625 top / Ø515 bottom × 440 mm high', matchedTank: '100L Chemical Dosing Tank' },
  { capacity: '200L Chemical Bund', dimensions: 'Ø725 top / Ø580 bottom × 732 mm high', matchedTank: '200L Chemical Dosing Tank' },
  { capacity: '400L Chemical Bund', dimensions: 'Ø945 top / Ø790 bottom × 743 mm high', matchedTank: '300L Chemical Dosing Tank' },
] as const;

export function DosingTankComparison() {
  return (
    <section className="mt-10">
      <div className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/55">Compare sizes</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black">Chemical dosing tanks & bunds</h2>
          <p className="mt-2 text-sm leading-6 text-black/70">
            Tanks and chemical bunds are sold separately. Use the table below to compare the range and select the matching bund for each tank size.
          </p>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-black/15 text-xs uppercase tracking-wider text-black/55">
                <th className="px-3 py-3 font-semibold">Tank capacity</th>
                <th className="px-3 py-3 font-semibold">Shape</th>
                <th className="px-3 py-3 font-semibold">Tank dimensions</th>
                <th className="px-3 py-3 font-semibold">Chemical bund</th>
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
          <summary className="cursor-pointer text-sm font-semibold text-black">Bund dimensions</summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-black/15 text-xs uppercase tracking-wider text-black/55">
                  <th className="px-3 py-3 font-semibold">Bund</th>
                  <th className="px-3 py-3 font-semibold">Outside dimensions</th>
                  <th className="px-3 py-3 font-semibold">Tank</th>
                </tr>
              </thead>
              <tbody>
                {BUNDS.map((bund) => (
                  <tr key={bund.capacity} className="border-b border-black/10 last:border-0">
                    <td className="px-3 py-3 font-semibold text-black">{bund.capacity}</td>
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
