# Static assets

Files in this folder are served from the site root.

- `/public/logo.svg` → served at `/logo.svg`
- `/public/favicon.ico` → served at `/favicon.ico`
- `/public/robots.txt` → managed by Next.js `robots.ts` (don't put one here)
- `/public/sitemap.xml` → managed by Next.js `sitemap.ts` (don't put one here)
- `/public/wmk-logo.svg` → official WaterMark Certification Scheme mark, rendered on red by `components/product/WatermarkBadge.tsx`. Should be a **single-colour white-foreground** SVG (transparent or red background) so it sits on the red badge cleanly. Drop the official mark file here; do not invent or stylise the logo.

Keep files small. Optimise SVGs with `svgo`. Use the Next.js `<Image>` component for optimisation when referencing these assets in components.
