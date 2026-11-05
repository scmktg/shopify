# Enviro Aqua — self-service quotations (PR #62)

This feature remains **disabled until configured and verified**. Do not merge as a completed production release without completing all the steps below.

## Dedicated database
Create a **dedicated Supabase project** for customer quotation records. Do not reuse the inventory application's service-role key or mix customer PII into its existing data.

Run these SQL files in order in the new project:
1. `db/quotes-schema.sql`
2. `db/quotes-auth.sql`
3. `db/quotes-purchase-orders.sql`

Tables use closed RLS and no public grants. Keep the service-role key exclusively in server-side environment variables.

## Server-side Vercel configuration
Set values in the preview and production environments separately:
- `QUOTES_SUPABASE_URL` — dedicated quotation Supabase project's API URL.
- `QUOTES_SUPABASE_SERVICE_ROLE_KEY` — server-only key for that same project.
- `RESEND_API_KEY` — email provider API key; already used elsewhere in the app, but confirm this is an approved sending environment.
- `QUOTES_EMAIL_FROM` — verified sender address (e.g. quotes@your-verified-domain).
- `QUOTES_ADMIN_EMAIL` — authorised internal PO-review mailbox.
- `QUOTES_PUBLIC_ORIGIN` — exact environment URL for verification links. Set this to the preview URL during preview testing.
- `SHOPIFY_ORDER_WEBHOOK_SECRET` — Shopify order webhook signing secret, server only.
- Existing `SHOPIFY_STOREFRONT_PRIVATE_TOKEN`, `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_API_VERSION` must continue to be valid.

Do not prefix secrets with `NEXT_PUBLIC_`. Set up a Shopify `orders/paid` webhook pointing at `/api/webhooks/shopify/quote-orders`; validate payload format and ensure order `note_attributes` contains `enviro_aqua_quote` from the cart. The webhook accepts authenticated orders only and requires the saved email and line items to match. `orders/paid` delivery and event lifecycle must be tested against actual transactions before conversion metrics are trusted.

## Current boundaries and limitations
- Each issued quote is a **product-only quote**. Freight is explicitly excluded; final tax and delivery costs come from Shopify checkout. Do not promise an all-inclusive quote before delivery rates can be determined reliably.
- Shopify catalogue prices are snapshotted at issue time and checked again when starting checkout. There is **no automatic 14-day locked-price override**; a changed price requires a new quote.
- Quote-to-checkout opens a fresh Shopify cart; a Shopify order webhook is what marks a verified purchase. Merely starting checkout does not mark a sale.
- Purchase-order submission is **for manual review only**. No MYOB invoices, credit terms or purchase orders are automatically approved.
- PDFs are server-generated and accessible only after verified email access. Issuance emails attach the PDF to the addressed recipient.
- Customer portal access uses 15-minute one-use verification links and 24-hour HttpOnly quote sessions. A reference number never grants access alone.
- Add Vercel WAF/IP rate limiting, bot screening, delivery monitoring and alerting **before release**. Per-email application limits alone are not enough protection.
- Set and document a customer-data retention policy, privacy disclosure, deletion/export workflow and automatic cleanup for expired login challenges and customer records.
- Test Australian tax handling, invoice terminology, exact business entity/ABN details and quote expiry requirements against the live MYOB/Shopify setup before enabling commercial usage.
- Add an internal admin UI or existing approved operations workflow to review incoming PO submissions and send responses.
- Do not add quote buttons or links to product pages until separately requested.

## Release checks
- `npm ci`
- `npm run type-check`
- `npm run prebuild`
- `npm run build`
- Browser tests: selection, multi-line totals, quote issuance, emailed PDF, verified login, email isolation, logout/session expiry, secure PDF download, quote history, changed prices, cart checkout, completed-order webhook, PO request and duplicate submissions.
- Security tests: tampered line prices, cross-user quote reads, guessable references, expired/reused tokens, mass email requests, invalid webhooks, and database key non-disclosure.
- Verify the exact preview deployment, staging credentials and WAF behavior; only then merge to main after approval.

**Deployment note:** Access to Vercel's `scmktgs-projects` team returned 403 during this implementation, so the current branch has not been build-verified on Vercel, and no migration has been applied to an approved quotation database.
