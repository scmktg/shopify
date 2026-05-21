/**
 * Single source of truth for Enviro Aqua's real business details.
 *
 * Anywhere the site renders a phone number, address, ABN, ACN, social
 * link, opening hours, or returns/shipping policy reference should
 * import from here rather than re-hardcoding the value. Markdown
 * editorial content cannot import TS — those files have the values
 * baked in by hand at the time of last update; when something here
 * changes, search the repo for the old value and update both.
 */
export const BUSINESS_INFO = {
  name: 'Enviro Aqua',
  legalName: 'Enviro Aqua',
  acn: '638 197 734',
  abn: '24 638 197 734',
  email: 'info@enviroaqua.com.au',
  phone: {
    /** Human-readable display form. */
    display: '(02) 8772 8162',
    /** E.164 form for the tel: link. */
    tel: '+61287728162',
  },
  address: {
    street: '6/45 Amsterdam Cct',
    locality: 'Wyong',
    region: 'NSW',
    postalCode: '2259',
    country: 'AU',
  },
  showroom: {
    locality: 'Wyong, NSW',
    /** Plain-English summary; same as opening hours. */
    hours: 'Mon–Fri 9am–5pm AEST',
    /** Schema.org openingHours format. */
    schemaHours: 'Mo-Fr 09:00-17:00',
  },
  /** Same-day dispatch cutoff for orders received on a business day. */
  orderCutoff: '12:00pm AEST',
  /**
   * Structured form of the dispatch cutoff for the live countdown on
   * product pages. Locked to Australia/Sydney regardless of the
   * visitor's timezone.
   */
  orderCutoffTime: {
    hour: 12,
    minute: 0,
    timeZone: 'Australia/Sydney',
  },
  /**
   * Phone-support window — narrower than the showroom hours.
   * Surfaced under the Add to cart "Questions?" line.
   */
  phoneSupportHours: 'Mon–Thu 9am–3pm',
  /** One-line returns summary used in the buy-box meta and footer. */
  returnsSummary: '14-day returns on damaged or faulty items',
  /**
   * Pickup window quoted on the click-and-collect buy-box line. The
   * showroom locality and link are composed in the component.
   */
  clickAndCollectPickupWindow: 'usually ready in 2 hours',
  /**
   * Three short copy items for the brand trust strip rendered below
   * every product page. Single line each, no card boxes — see
   * components/product/BrandTrustStrip.tsx. Edit copy here, never
   * in the component.
   */
  trustStrip: [
    {
      heading: 'Australian-owned',
      body: 'Real Wyong NSW warehouse and showroom. ABN 24 638 197 734. Proper tax invoices on every order.',
    },
    {
      heading: 'Same-day dispatch',
      body: 'Orders placed before 12pm AEST on a business day ship the same day from Wyong. Tracked Australia-wide.',
    },
    {
      heading: 'No proprietary lock-in',
      body: 'Standard 10" and 20" Australian housings. Buy replacement cartridges from any supplier.',
    },
  ],
  /**
   * Below this on-hand quantity, product pages render an amber
   * "Only N left in stock" indicator instead of plain "In stock".
   */
  defaultLowStockThreshold: 3,
  returns: {
    /** Days from delivery during which a return can be requested. */
    windowDays: 14,
    /** What's eligible — damaged/faulty only, not change-of-mind. */
    scope: 'damaged-or-faulty',
    defaultWarrantyMonths: 12,
  },
  social: {
    facebook: 'https://www.facebook.com/EnviroAqua.com.au/',
    instagram: 'https://www.instagram.com/enviro_aqua/',
    // Canonical Google Business Profile URL. Leave empty until the
    // exact g.page / maps profile URL is confirmed — emitting a Maps
    // search URL as sameAs is weaker than a true profile link and
    // Google may ignore it. Filtered out of sameAs when empty.
    googleBusiness: '',
  },
  /**
   * NSW Central Coast postcodes eligible for the Whole House
   * Installation Package. Used by both the lead-form client
   * validation and the /api/lead-installation route, so this
   * is the single source of truth.
   */
  installPackagePostcodes: [
    '2250',
    '2251',
    '2256',
    '2257',
    '2258',
    '2259',
    '2260',
    '2261',
    '2262',
    '2263',
    '2775',
    '2778',
    '2779',
  ],
} as const;

/** "6/45 Amsterdam Cct, Wyong, NSW 2259". */
export function fullAddress(): string {
  const a = BUSINESS_INFO.address;
  return `${a.street}, ${a.locality}, ${a.region} ${a.postalCode}`;
}

/** "ABN 24 638 197 734 · ACN 638 197 734". */
export function abnAcnLine(): string {
  return `ABN ${BUSINESS_INFO.abn} · ACN ${BUSINESS_INFO.acn}`;
}
