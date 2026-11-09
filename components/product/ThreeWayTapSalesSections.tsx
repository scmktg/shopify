export function ThreeWayTapSalesSections() {
  return (
    <div className="mt-12 border-t border-black/10 pt-12 sm:mt-16 sm:pt-16">
      <section className="mx-auto max-w-5xl text-center" aria-labelledby="three-way-tap-editorial-title">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
          Designed for beautiful kitchens
        </p>
        <h2
          id="three-way-tap-editorial-title"
          className="mx-auto mt-5 max-w-4xl text-[clamp(2.1rem,4.5vw,4rem)] font-light leading-[1.12] tracking-tight text-black"
        >
          Complete the look of <span className="font-semibold">your kitchen.</span>
        </h2>
        <div className="mx-auto mt-7 max-w-3xl space-y-4 text-base leading-8 text-black/65">
          <p>
            A beautiful new kitchen deserves a tap that feels just as considered.
            With its sleek matte black finish and understated profile, this
            3-way mixer brings a sophisticated finishing touch to your sink.
          </p>
          <p>
            Enjoy hot, cold and filtered drinking water from one elegant tap.
            No separate drinking-water faucet competing for space or disrupting
            the clean lines of your benchtop.
          </p>
        </div>
      </section>

      <section
        className="mx-auto mt-14 grid max-w-5xl items-center gap-9 border-y border-black/10 py-12 md:mt-20 md:grid-cols-2 md:gap-16 md:py-16"
        aria-labelledby="three-way-tap-stone-title"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
            One tap. One clean benchtop.
          </p>
          <h3
            id="three-way-tap-stone-title"
            className="mt-4 text-[clamp(1.75rem,3vw,2.75rem)] font-light leading-tight tracking-tight text-black"
          >
            Your beautiful stone benchtop deserves <span className="font-semibold">fewer holes.</span>
          </h3>
        </div>
        <div className="space-y-4 text-base leading-8 text-black/65">
          <p>
            When you have invested in stone, porcelain or another premium
            benchtop material, the last thing you want is an unnecessary second
            tap and another hole drilled beside your sink.
          </p>
          <p>
            This 3-way mixer combines your everyday hot and cold water with a
            dedicated connection for filtered drinking water, so a compatible
            under-sink filtration system can use the same tap fixture.
          </p>
          <p className="font-medium text-black">
            A cleaner look, less clutter and one beautifully coordinated finish.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-5xl md:mt-20" aria-labelledby="three-way-tap-benefits-title">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
            Thoughtfully practical
          </p>
          <h3
            id="three-way-tap-benefits-title"
            className="mt-4 text-[clamp(1.75rem,3vw,2.75rem)] font-light leading-tight tracking-tight text-black"
          >
            Three ways to use water. <span className="font-semibold">One sleek tap.</span>
          </h3>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-10">
          {[
            {
              number: '01',
              title: 'Hot & cold',
              description: 'All the everyday convenience of a kitchen mixer, exactly where you need it.',
            },
            {
              number: '02',
              title: 'Filtered drinking water',
              description: 'A dedicated filtered-water pathway connects to a compatible under-sink filter or RO system.',
            },
            {
              number: '03',
              title: 'Matte black finish',
              description: 'A bold, refined finishing touch for contemporary kitchens and coordinated fixtures.',
            },
          ].map((item) => (
            <div key={item.number} className="border-t border-black/15 pt-5">
              <span className="text-xs font-medium tracking-widest text-black/40">{item.number}</span>
              <h4 className="mt-5 text-lg font-semibold tracking-tight text-black">{item.title}</h4>
              <p className="mt-2 text-sm leading-7 text-black/60">{item.description}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-12 max-w-3xl text-center text-sm leading-7 text-black/55">
          Planning a new kitchen or replacing an existing mixer? Ask your licensed plumber
          to confirm your benchtop opening, fittings and filtration compatibility before installation.
          A filtration system is required for filtered-water delivery.
        </p>
      </section>
    </div>
  );
}
