import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Droplets, Gauge, House, ShieldCheck, Wrench } from 'lucide-react';

const productUrl = '/water-filters/whole-house/wm-3-stages-20-x-4-5-triple-big-blue-whole-house-water-filter-system';
const photos = {
  applications: 'https://cdn.shopify.com/s/files/1/0984/4693/4337/files/3-BB5.png?v=1777988539',
  details: 'https://cdn.shopify.com/s/files/1/0984/4693/4337/files/WM-3-St-WH-BB.png-7.png?v=1777988539',
  diagram: 'https://cdn.shopify.com/s/files/1/0984/4693/4337/files/3-BB6.png-6.png?v=1777988539',
};

export const metadata: Metadata = {
  title: '3 Stage Stainless Steel Whole House Water Filter | WaterMark | Enviro Aqua',
  description: 'Discover Enviro Aqua’s 20″ x 4.5″ triple-stage stainless steel whole house water filter. Learn how a single point-of-entry filtration system serves taps, showers and appliances.',
  robots: { index: false, follow: false },
};

const features = [
  { title: 'Three-stage filtration', description: 'Three filter stages in one streamlined point-of-entry system.', icon: Droplets },
  { title: 'Stainless steel enclosure', description: 'A sturdy, clean-lined finish designed for practical installation.', icon: ShieldCheck },
  { title: 'Pressure monitoring', description: 'Individual pressure gauges help you keep an eye on system performance.', icon: Gauge },
  { title: 'Straightforward servicing', description: 'Accessible filter housings designed to make cartridge changes easier.', icon: Wrench },
];

function Button({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return <Link href={productUrl} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all hover:-translate-y-0.5 ${dark ? 'bg-slate-950 text-white hover:bg-slate-800' : 'bg-[#0879bd] text-white hover:bg-[#086aa4]'}`}>{children}<ArrowRight size={17} aria-hidden="true" /></Link>;
}

export default function WholeHouseFilterLandingPage() {
  return <main className="overflow-hidden bg-white text-slate-900">
    <section className="relative bg-[#eff7fa]">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:px-8 md:py-24 lg:grid-cols-[1.06fr_.94fr] lg:gap-16">
        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#0879bd]">WaterMark certified whole-house filtration</p>
          <h1 className="max-w-[750px] text-[clamp(2.8rem,5.6vw,5.5rem)] font-bold leading-[1.03] tracking-[-0.055em]">Every tap.<br />Every shower.<br /><span className="text-[#0879bd]">Every appliance.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-600">Why filter just one tap? Make filtration part of your entire home with a three-stage, stainless steel whole-house system designed to treat water at the point of entry.</p>
          <div className="mt-9 flex flex-wrap gap-3"><Button>Shop the whole-house filter</Button><a href="#how-it-works" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">How it works</a></div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-700"><span className="flex items-center gap-2"><Check size={16} className="text-[#0879bd]" />3-stage filtration</span><span className="flex items-center gap-2"><Check size={16} className="text-[#0879bd]" />20″ × 4.5″ format</span><span className="flex items-center gap-2"><Check size={16} className="text-[#0879bd]" />WaterMark certified</span></div>
        </div>
        <div className="relative">
          <div className="absolute -inset-5 rounded-[2.5rem] bg-[#d8eaf2] blur-2xl" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-[2rem] border border-[#dbe7ec] bg-white p-5 shadow-[0_25px_80px_-35px_rgba(16,65,92,.25)] sm:p-8">
            <img src={photos.details} alt="Three-stage stainless steel whole-house filter showing pressure gauges, one-inch connections and service features" className="mx-auto aspect-square w-full object-contain" />
          </div>
          <div className="absolute -bottom-5 left-4 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-xl sm:left-8">One system. Whole-house coverage.</div>
        </div>
      </div>
    </section>

    <section className="border-b border-slate-100 bg-white px-6 py-9 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 text-center sm:grid-cols-3">
        <div><p className="text-2xl font-bold tracking-tight">3 stages</p><p className="mt-1 text-sm text-slate-500">One integrated filtration system</p></div>
        <div className="sm:border-x sm:border-slate-200"><p className="text-2xl font-bold tracking-tight">20″ × 4.5″</p><p className="mt-1 text-sm text-slate-500">Large-format cartridge size</p></div>
        <div><p className="text-2xl font-bold tracking-tight">WaterMark</p><p className="mt-1 text-sm text-slate-500">Certified product</p></div>
      </div>
    </section>

    <section id="how-it-works" className="px-6 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0879bd]">Whole-house protection</p>
          <h2 className="mt-4 text-4xl font-bold leading-[1.12] tracking-[-0.04em] md:text-5xl">Filter water before it reaches the rest of your home.</h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">Installed on the incoming water supply, a whole-house system treats water centrally, before it travels to your kitchen, bathrooms, laundry and connected appliances.</p>
          <p className="mt-4 leading-relaxed text-slate-600">Depending on the cartridges fitted and your water conditions, filtration can help reduce common sediment and certain taste- and odour-causing contaminants. For the best results, choose cartridges suited to your water supply.</p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm font-semibold text-slate-800">{['Kitchen taps','Showers & bathrooms','Laundry','Connected appliances'].map(x=><div key={x} className="flex items-center gap-2"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e6f4fb] text-[#0879bd]"><Check size={15}/></span>{x}</div>)}</div>
        </div>
        <figure className="rounded-[1.75rem] bg-[#f3f8fa] p-4 sm:p-7"><img loading="lazy" src={photos.diagram} alt="Illustrated diagram of whole-house filtration feeding a house, dishwasher, washing machine, water heater and drinking water" className="w-full rounded-xl object-contain" /><figcaption className="px-2 pt-4 text-center text-xs leading-relaxed text-slate-500">Illustration of a typical whole-house filtration arrangement. Final plumbing layout depends on the property and installation.</figcaption></figure>
      </div>
    </section>

    <section className="bg-[#f5f8fa] px-6 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0879bd]">Built for practical performance</p><h2 className="mt-4 text-4xl font-bold tracking-[-0.04em] md:text-5xl">The details make the difference.</h2><p className="mt-5 text-lg text-slate-600">A clean stainless steel exterior with service-friendly filtration components inside.</p></div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{features.map(({title,description,icon:Icon})=><div key={title} className="rounded-2xl border border-slate-200 bg-white p-7"><div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e7f3f9] text-[#0879bd]"><Icon size={24} strokeWidth={1.8}/></div><h3 className="text-lg font-bold tracking-tight">{title}</h3><p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p></div>)}</div>
        <div className="mt-12 grid items-center gap-8 overflow-hidden rounded-[1.75rem] bg-white p-5 shadow-sm sm:p-8 lg:grid-cols-[.92fr_1.08fr] lg:p-12"><div><h3 className="text-3xl font-bold tracking-tight">Designed with maintenance in mind.</h3><p className="mt-4 leading-relaxed text-slate-600">From the pressure gauges to the filter-access design, see the key components and connections in the product overview.</p><div className="mt-6"><Button dark>View product details</Button></div></div><img loading="lazy" src={photos.details} className="w-full rounded-xl object-contain" alt="Detailed product image highlighting stainless steel frame, pressure gauges, brass connections and filter servicing" /></div>
      </div>
    </section>

    <section className="px-6 py-20 md:px-8 md:py-28"><div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
      <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0879bd]">Versatile applications</p><h2 className="mt-4 text-4xl font-bold leading-tight tracking-[-0.04em] md:text-5xl">At home. At work. Wherever water matters.</h2><p className="mt-6 text-lg leading-relaxed text-slate-600">Whole-building filtration isn't just for homes. Explore the range of settings where a point-of-entry filtration solution may be useful, subject to site requirements and appropriate system sizing.</p><p className="mt-4 leading-relaxed text-slate-600">From cafés and restaurants to offices, clinics and other commercial spaces, the right setup starts with understanding the water supply and expected demand.</p><div className="mt-8"><Button>Explore this system</Button></div></div>
      <figure className="rounded-[1.75rem] bg-[#f5f8fa] p-4 sm:p-6"><img loading="lazy" src={photos.applications} alt="Commercial applications infographic featuring restaurants, coffee shops, bars, offices, hydroponic gardens and clinics" className="w-full rounded-xl object-contain" /><figcaption className="pt-4 text-center text-xs text-slate-500">Applications pictured are illustrative; confirm suitability and capacity for your project.</figcaption></figure>
    </div></section>

    <section className="bg-slate-950 px-6 py-20 text-white md:px-8 md:py-24"><div className="mx-auto grid max-w-7xl items-center gap-9 lg:grid-cols-[1fr_auto]"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">Specifications at a glance</p><h2 className="mt-4 text-4xl font-bold tracking-[-0.04em]">Ready to upgrade your water?</h2><p className="mt-5 max-w-2xl text-slate-300">Three filtration stages. 20″ × 4.5″ cartridge format. Stainless steel enclosure. WaterMark certification. See full cartridge inclusions, availability, pricing and installation details on the product page.</p></div><div><Link href={productUrl} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-slate-950 hover:bg-sky-100">View price &amp; shop now <ArrowRight size={18}/></Link></div></div></section>

    <section className="px-6 py-20 md:px-8"><div className="mx-auto max-w-4xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0879bd]">Good to know</p><h2 className="mt-3 text-4xl font-bold tracking-[-0.04em]">Common questions</h2><div className="mt-9 divide-y divide-slate-200 border-y border-slate-200">{[
      ['Does a whole-house filter cover every tap?', 'A point-of-entry filter is designed to treat the water passing through its installation point. Coverage depends on the property plumbing layout and whether any supply lines bypass the system.'],
      ['What does three-stage filtration mean?', 'Water flows through three filtration stages in sequence. The specific contaminants reduced depend on the cartridges installed, so check the supplied cartridge media and specifications before purchasing.'],
      ['Can it be used for a business?', 'Potentially. Commercial suitability depends on the flow rate, water quality, operating conditions and building requirements. Confirm these against the product specifications before installation.'],
      ['Who should install the filter?', 'Have a suitably licensed plumber assess and install the unit in accordance with applicable plumbing requirements and the manufacturer instructions.'],
    ].map(([q,a])=><details key={q} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-bold sm:text-lg">{q}<span className="text-2xl font-light text-[#0879bd] group-open:rotate-45 transition-transform">+</span></summary><p className="max-w-3xl pt-3 leading-relaxed text-slate-600">{a}</p></details>)}</div></div></section>
  </main>;
}
