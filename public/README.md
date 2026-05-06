# Static assets

Files in this folder are served from the site root.

- `/public/logo.svg` → served at `/logo.svg`
- `/public/favicon.ico` → served at `/favicon.ico`
- `/public/robots.txt` → managed by Next.js `robots.ts` (don't put one here)
- `/public/sitemap.xml` → managed by Next.js `sitemap.ts` (don't put one here)

Keep files small. Optimise SVGs with `svgo`. Use the Next.js `<Image>` component for optimisation when referencing these assets in components.
