import type { Review, ReviewStats } from '@/types/review';

/**
 * Single source of truth for customer reviews surfaced on the site.
 *
 * Sourcing rules:
 *   - Google reviews: copied verbatim from the public Google Business
 *     Profile. Light editorial: expanded apostrophes, normalised
 *     punctuation, full surnames reduced to initials. No rewording.
 *   - Facebook reviews: copied verbatim from the public Facebook page
 *     recommendations. Same editorial rules. A Facebook "recommends"
 *     entry maps to a 5-star rating.
 *
 * Hard rule (per CLAUDE.md §7 spirit): never invent reviewer names,
 * dates, or text. If the source data is incomplete, leave the entry
 * out rather than guess.
 *
 * IMPORTANT — these totals (`reviewStats.total` etc) drive the
 * visible on-page numbers ONLY. They are deliberately NOT plumbed
 * into JSON-LD `aggregateRating` because Google's review snippet
 * policy reserves that field for first-party reviews collected on
 * our own surfaces. Aggregating external platform counts into
 * structured data would risk a manual action. See lib/seo/jsonld.ts.
 */
export const reviews: ReadonlyArray<Review> = [
  // ---- GOOGLE REVIEWS ----
  // 8 of 64 public Google reviews. Add more by pasting verbatim into
  // this array; keep date in YYYY-MM-DD form.
  {
    id: 'google-justin-jm-2025-02',
    source: 'google',
    authorName: 'Justin J.',
    rating: 5,
    text: 'I recently had a whole house water filter system installed and was extremely pleased with the entire experience. Adam demonstrated exceptional knowledge and took the time to explain every aspect of the system clearly.',
    date: '2025-02-15',
    featured: true,
  },
  {
    id: 'google-colin-m-2025-06',
    source: 'google',
    authorName: 'Colin M.',
    rating: 5,
    text: 'Excellent service and outstanding products. I purchased a 900mm bathroom vanity with stoneware top and chrome tap and am very happy with the customer service provided by Adam. The bathroom vanity looks great. I would highly recommend this business.',
    date: '2025-06-10',
    featured: true,
  },
  {
    id: 'google-frank-p-2025-05',
    source: 'google',
    authorName: 'Frank P.',
    rating: 5,
    text: 'I had an issue with my caravan water filtration and the guys at Enviro Aqua got me sorted with a new system that is far better than my old one and for less than the cost of the previous filters alone. If you have to replace filters in your caravan, look here first.',
    date: '2025-05-10',
    featured: true,
    isLocalGuide: true,
  },
  {
    id: 'google-robert-m-2024-12',
    source: 'google',
    authorName: 'Robert M.',
    rating: 5,
    text: 'Just discovered this place. Huge variety of stock. Prices are excellent. Service top notch. My new go-to place for all things water filters.',
    date: '2024-12-10',
    featured: true,
  },
  {
    id: 'google-tarwk-n-2026-02',
    source: 'google',
    authorName: 'Tarwk N.',
    rating: 5,
    text: 'I had a great experience with Enviro Aqua — what you see is truly what you get, and most of all not misleading like other shops I have experienced. These guys are honest and humble.',
    date: '2026-02-10',
    featured: true,
    isLocalGuide: true,
  },
  {
    id: 'google-max-b-2026-04',
    source: 'google',
    authorName: 'Max B.',
    rating: 5,
    text: "Best thing I have ever got. Enviro Aqua have now done the water filters at both mine and my mum's house and it's the best thing I've ever had done. Great people and cost effective. Thank you.",
    date: '2026-04-10',
    featured: true,
    isLocalGuide: true,
  },
  {
    id: 'google-jordan-m-2026-04',
    source: 'google',
    authorName: 'Jordan M.',
    rating: 5,
    text: 'Adam and his son were very pleasant. Very punctual and very professional. Good guys doing good work. Would recommend.',
    date: '2026-04-10',
    featured: false,
  },
  {
    id: 'google-ibrahim-a-2024-11',
    source: 'google',
    authorName: 'Ibrahim A.',
    rating: 5,
    text: 'Finally someone who knows exactly what you need for your health, unlike the others that sell the products but really have no idea. Clean and quick and professional install. Highly recommend. Great honest price.',
    date: '2024-11-15',
    featured: false,
    isLocalGuide: true,
  },

  // ---- FACEBOOK REVIEWS ----
  // Complete public set from facebook.com/EnviroAqua.com.au. All
  // entries are Facebook "recommends" and map to rating: 5.
  {
    id: 'fb-shada-h-2025-05',
    source: 'facebook',
    authorName: 'Shada H.',
    rating: 5,
    text: 'Highly recommended. Unique parts with reasonable prices and great after sales service.',
    date: '2025-05-03',
    featured: true,
  },
  {
    id: 'fb-bargain-cars-2024-02',
    source: 'facebook',
    authorName: 'Bargain Cars',
    rating: 5,
    text: 'Great product, competitive prices.',
    date: '2024-02-21',
    featured: false,
  },
  {
    id: 'fb-jamaleddine-s-2020-10',
    source: 'facebook',
    authorName: 'Jamaleddine S.',
    rating: 5,
    text: 'Great customer service, highly recommended.',
    date: '2020-10-06',
    featured: false,
  },
  {
    id: 'fb-michael-m-2020-08',
    source: 'facebook',
    authorName: 'Michael M.',
    rating: 5,
    text: 'Great product and great after sales support.',
    date: '2020-08-28',
    featured: false,
  },
  {
    id: 'fb-ayman-i-2020-08',
    source: 'facebook',
    authorName: 'Ayman I.',
    rating: 5,
    text: 'Great service, highly recommended.',
    date: '2020-08-15',
    featured: false,
  },
  {
    id: 'fb-bhavya-s-2020-07',
    source: 'facebook',
    authorName: 'Bhavya S.',
    rating: 5,
    text: 'Great service, Sam was really helpful and great products.',
    date: '2020-07-26',
    featured: false,
  },
  {
    id: 'fb-aj-a-2020-07',
    source: 'facebook',
    authorName: 'AJ A.',
    rating: 5,
    text: 'Brilliant — everything supplied including pressure limiting valve. Very easy to fit. Best water ever. Best service and communication with the supplier.',
    date: '2020-07-15',
    featured: true,
  },
  {
    id: 'fb-salah-a-2020-06',
    source: 'facebook',
    authorName: 'Salah A.',
    rating: 5,
    text: 'Great product quality with a fair price. Honestly, the best solution to stop buying bottled water and spending hundreds of dollars!',
    date: '2020-06-19',
    featured: false,
  },
  {
    id: 'fb-emad-a-2020-06',
    source: 'facebook',
    authorName: 'Emad A.',
    rating: 5,
    text: 'Great product, great service. Stop wasting plastic and get this done. Highly recommended. Hussam was super helpful.',
    date: '2020-06-18',
    featured: true,
  },
  {
    id: 'fb-leo-s-2020-06',
    source: 'facebook',
    authorName: 'Leo S.',
    rating: 5,
    text: 'Great product. Professional service!',
    date: '2020-06-18',
    featured: false,
  },
];

export const reviewStats: ReviewStats = {
  // Real platform totals: 64 public Google reviews + 10 public
  // Facebook recommendations = 74. Used for visible on-page numbers
  // only — see the file header for why these are NOT fed into
  // structured-data aggregateRating.
  total: 74,
  totalGoogle: 64,
  totalFacebook: 10,
  averageRating: 5.0,
  recommendRate: 1.0,
  // 8 Google + 10 Facebook entries actually present in this file.
  reviewsShownLocally: 18,
};
