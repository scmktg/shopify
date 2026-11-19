/** Build matching editorial content for the same three physical fountain models.
 * The new configurations omit filtration only; all hardware specifications
 * and certifications are inherited from the existing product pages.
 */
const PAIRS = [
  {
    source: 'commercial-rust-free-filtered-cold-water-bubbler-wm',
    handle: 'hdpe-drinking-fountain-water-bubbler-with-tap-chilled-non-filtered-20l-hr',
    model: 'YL-600P',
    label: 'Granite-inspired HDPE water fountain with bubbler and tap',
    material: 'granite-inspired HDPE',
    dimensions: '99.5 cm H × 40 cm W × 40 cm D',
    totalHeight: '125 cm',
  },
  {
    source: 'commercial-stainless-steel-filtered-cold-water-bubbler-round-wm',
    handle: 'round-stainless-steel-drinking-fountain-water-bubbler-chilled-non-filtered-20l-hr',
    model: 'YL-600R',
    label: 'Round stainless steel water fountain with bubbler',
    material: '304 stainless steel',
    dimensions: '98 cm H × 35 cm W × 35 cm D',
    totalHeight: '106.5 cm',
  },
  {
    source: 'commercial-water-bubbler-filtered-stainless-steel-watermark-certified-square-des',
    handle: 'stainless-steel-drinking-fountain-water-bubbler-with-tap-chilled-non-filtered-20l-hr',
    model: 'YL-600C',
    label: 'Square stainless steel water fountain with bubbler and tap',
    material: 'SUS304 stainless steel',
    dimensions: '99 cm H × 30 cm W × 30 cm D',
    totalHeight: '124.5 cm',
  },
];

function nonFilteredFountainCatalog(catalog) {
  return Object.fromEntries(PAIRS.map((pair) => {
    const original = catalog[pair.source];
    if (!original) throw new Error('Missing fountain source: ' + pair.source);
    const entry = JSON.parse(JSON.stringify(original));
    entry.tags = [...entry.tags.filter(tag => tag !== 'filtered'), 'non-filtered'];
    entry.shortDescription = pair.label + ', with 20 L/hr chilled-water capacity and direct mains connection. Supplied without a filtration cartridge.';
    entry.description = [
      'The **' + pair.label + '** delivers approximately **20 litres per hour** of chilled water at around **8 - 12°C**. This is the same fountain hardware as our filtered configuration, supplied **without the filter cartridge**, for sites that do not require additional water filtration.',
      'The ' + pair.material + ' cabinet, dispensing fixtures, cooling system, power requirements, dimensions and installation connections are unchanged. It connects directly to the mains water supply.',
      'WaterMark-certified fountain model **' + pair.model + '** under licence 23484 / WMTS-105:2016, with lead-free wetted components. A licensed plumber should handle installation.',
      '**Filtration:** Not included. Choose the filtered configuration if you would like a filter cartridge supplied.',
    ].join('\n\n');
    entry.features = [...entry.features.filter(feature => !/filtrat|filter cartridge|filtered/i.test(feature)), 'Supplied without a filtration cartridge'];
    entry.headlineSpecs = [...entry.headlineSpecs.filter(spec => spec.label !== 'Filtration'), {label: 'Filtration', value: 'Not included'}];
    entry.fullSpecs = entry.fullSpecs.filter(spec => spec.label !== 'Dimensions').map(spec => {
      if (spec.label === 'Filtration') return {...spec, value: 'Not included'};
      if (spec.label === 'Product type') return {...spec, value: 'Chilled non-filtered water bubbler / drinking fountain'};
      return spec;
    });
    if (!entry.fullSpecs.some(spec => spec.label === 'Filtration')) entry.fullSpecs.push({label: 'Filtration', value: 'Not included'});
    for (const label of ['Unit height', 'Width', 'Depth', 'Total height']) {
      if (!entry.fullSpecs.some(spec => spec.label === label)) throw new Error('Missing separate fountain measurement: ' + pair.model + ' / ' + label);
    }
    if (!entry.fullSpecs.some(spec => spec.label === 'Cooling capacity')) entry.fullSpecs.push({label: 'Cooling capacity', value: '20 L/hr'});
    entry.faq = (entry.faq || []).filter(item => !/filter|filtrat/i.test(item.q + ' ' + item.a));
    entry.faq.push({
      q: 'Is a filter cartridge included?',
      a: 'No. This is the non-filtered configuration of the same fountain. The filtered version is available separately for customers who require filtration.',
    });
    entry.seo = {
      ...entry.seo,
      title: pair.label + ' | Non-Filtered | Enviro Aqua',
      description: 'Non-filtered ' + pair.label.toLowerCase() + ' with chilled water, 20 L/hr cooling capacity and WaterMark certification. Supplied without a filter cartridge.',
    };
    return [pair.handle, entry];
  }));
}

module.exports = { PAIRS, nonFilteredFountainCatalog };
