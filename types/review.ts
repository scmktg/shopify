export type ReviewSource = 'google' | 'facebook';

export interface Review {
  /** Stable slug used as React key and (for moderation) audit trail. */
  id: string;
  source: ReviewSource;
  /** Display name as it appears on the source platform. */
  authorName: string;
  /** 1–5 inclusive. Facebook "recommends" map to 5. */
  rating: 1 | 2 | 3 | 4 | 5;
  /** Review body. Plain text only — no HTML, no markdown. */
  text: string;
  /** ISO 8601 date string (YYYY-MM-DD). Source platform date. */
  date: string;
  /**
   * True when the review should appear in featured surfaces (homepage,
   * PDP slot). False keeps it on /reviews only. Curated for variety —
   * not a quality signal, since all stored reviews are 5★.
   */
  featured: boolean;
  /**
   * Google-only signal. Reviewers flagged as "Local Guide" on the
   * source platform get a small muted label next to their name.
   */
  isLocalGuide?: boolean;
}

export interface ReviewStats {
  /** Combined total across all sources, including reviews not stored locally. */
  total: number;
  totalGoogle: number;
  totalFacebook: number;
  /** Weighted average across all sources, rounded to one decimal. */
  averageRating: number;
  /** 0–1, recommend rate on Facebook (separate metric from the star average). */
  recommendRate: number;
  /** Count of reviews actually present in data/reviews.ts. */
  reviewsShownLocally: number;
}
