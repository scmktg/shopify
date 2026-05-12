import type { Review, ReviewStats } from '@/types/review';

/**
 * Single source of truth for customer reviews surfaced on the site.
 *
 * Sourcing rules:
 *   - Google reviews: copied verbatim from the public Google Business
 *     Profile. Light editorial: expanded apostrophes, normalised
 *     punctuation, no rewording.
 *   - Facebook reviews: copied verbatim from the public Facebook page
 *     recommendations. Same editorial rules.
 *
 * Hard rule (per CLAUDE.md §7 spirit): never invent reviewer names,
 * dates, or text. If the source data is incomplete, leave the entry
 * out rather than guess.
 *
 * `reviewStats` below carries the headline numbers for the public
 * platforms in full — `reviewsShown` is the count actually displayed
 * on the site. Updating one without the other will mislead shoppers.
 */
export const reviews: ReadonlyArray<Review> = [
  // ---- GOOGLE REVIEWS ----
  // 8 of 64 total. Add more by pasting verbatim into this array.
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
  },
  {
    id: 'google-robert-m-2025-06',
    source: 'google',
    authorName: 'Robert M.',
    rating: 5,
    text: 'Just discovered this place. Huge variety of stock. Prices are excellent. Service top notch. My new go-to place for all things water filters.',
    date: '2025-06-10',
    featured: true,
  },
  {
    id: 'google-tarwk-n-2025-08',
    source: 'google',
    authorName: 'Tarwk N.',
    rating: 5,
    text: 'I had a great experience with Enviro Aqua — what you see is truly what you get, and most of all not misleading like other shops I have experienced. These guys are honest and humble.',
    date: '2025-08-10',
    featured: true,
  },
  {
    id: 'google-max-b-2025-10',
    source: 'google',
    authorName: 'Max B.',
    rating: 5,
    text: "Best thing I have ever got. Enviro Aqua have now done the water filters at both mine and my mum's house and it's the best thing I've ever had done. Great people and cost effective. Thank you.",
    date: '2025-10-15',
    featured: true,
  },
  {
    id: 'google-jordan-m-2025-10',
    source: 'google',
    authorName: 'Jordan M.',
    rating: 5,
    text: 'Adam and his son were very pleasant. Very punctual and very professional. Good guys doing good work. Would recommend.',
    date: '2025-10-15',
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
  },

  // ---- FACEBOOK REVIEWS ----
  // PENDING. Paste each as { id, source: 'facebook', authorName, rating,
  // text, date, featured } following the same shape as the Google
  // entries above. Use rating: 5 for plain "recommends" entries.
  // Once added, increment `reviewStats.reviewsShown` and (if the count
  // of public reviews on Facebook has moved) `reviewStats.totalFacebook`
  // and `reviewStats.total` to match.
];

export const reviewStats: ReviewStats = {
  total: 74,
  totalGoogle: 64,
  totalFacebook: 10,
  averageRating: 5.0,
  recommendRate: 1.0,
  // Updated when the Facebook reviews land. Until then this is 8 (the
  // Google count), not 18 — we don't claim to show reviews we don't
  // have.
  reviewsShown: 8,
};
