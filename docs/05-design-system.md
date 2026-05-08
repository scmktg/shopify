# Design System

## Revision history

- **2026-05** — Header switched from black background to **white background with black text** and a `border-b border-gray-200` bottom border. The black top utility bar above the header is unchanged. The black footer is unchanged. Mobile menu now slides in as a white overlay.
- **2026-04** — Initial system locked: white page, black header, black footer, brand-blue (`#0066CC`) actions only. Tailwind v4 brand tokens via `@theme` in `app/globals.css`.

## Visual identity (locked)

**Minimalist. Clean. Utilitarian. Professional.**

Three colours, that's it for v1:

| Colour | Hex | Use |
|---|---|---|
| White | `#FFFFFF` | Page background, header background |
| Black | `#000000` | Top banner background, footer background, primary text, borders |
| Blue | `#0066CC` | All buttons, CTAs, links, focus states, link hover on the white header |

Tailwind v4 configuration is CSS-first — there is no `tailwind.config.ts`. Brand colours are declared in `app/globals.css` under the `@theme` directive, which Tailwind compiles into utility classes (`bg-brand-blue`, `text-brand-blue-hover`, etc.):

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-brand-blue: #0066CC;
  --color-brand-blue-hover: #0052A3;
  --color-brand-blue-light: #E6F0FA;
}
```

Same values, same rules — only the configuration mechanism has changed:
- White is the page and header background
- Black is reserved for the top utility bar and the footer
- Blue is reserved for actions (buttons, CTAs, links, focus states, link-hover); never decorative

Do not introduce additional brand colours. If a new shade is needed, justify it against `docs/01-architecture-decisions.md` first.

## Typography

- **Font**: System font stack (no web fonts in v1 — keeps it fast)
- **Body**: `font-sans` (Tailwind default → ui-sans-serif, system-ui)
- **Sizes**:
  - Body: 16px (1rem) base
  - Small: 14px
  - Headings: clear hierarchy via `text-2xl`, `text-3xl`, `text-4xl`, `text-5xl`
- **Weights**: 400 (regular), 600 (semibold for headings/buttons), 700 (bold for emphasis)
- **Line heights**: 1.5 for body, 1.2 for headings

## Layout

- **Max content width**: `max-w-7xl mx-auto` (1280px)
- **Section padding**: `px-4 sm:px-6 lg:px-8`
- **Vertical rhythm**: `py-12 md:py-16` between major sections
- **Mobile-first.** Desktop is the enhancement, not the default.

## Header

```
┌─────────────────────────────────────────────────────────────┐
│ Black banner: "Wholesale prices for everyone..."           │  <- Top utility bar
├─────────────────────────────────────────────────────────────┤
│ ENVIRO AQUA      Water Filters | Cartridges | ... | 🔍 🛒 │  <- White header
└─────────────────────────────────────────────────────────────┘
                                                                  ↑ border-b border-gray-200
```

- **Top utility bar** — see "Promotional banner" section below. The black strip above the white header.
- **Main header** — `bg-white text-black border-b border-gray-200`, sticky on scroll. The bottom border is the visual separator from page content (no shadow per the design rules).
- **Wordmark** — text-only "ENVIRO AQUA" in `font-semibold text-black` on the left. No logo image; the wordmark is the brand mark.
- **Nav** — black text in centre/right; hover state is `hover:text-brand-blue` (no underline shift).
- **Search and cart icons** — black, hover to brand-blue. Cart badge stays brand-blue with white text (it stands out on the white header).
- **Mega menu dropdown** — `bg-white text-black` with a 1px gray-200 border for separation. Hover state on dropdown items is `hover:bg-gray-50` (subtle); active link is `text-brand-blue`.
- **Mobile** — hamburger button (black icon) opens a full-screen white overlay with black text and a black X close button. Nav items are large tappable rows with `hover:text-brand-blue`.

## Promotional banner

The black strip running across the very top of every page, above the white header. Rendered by `components/layout/PromoBanner.tsx` and mounted in `app/layout.tsx`.

```
┌─────────────────────────────────────────────────────────────┐
│ Same price retail or trade…       Same-day dispatch from W… │ <- 36–40px, black bg
└─────────────────────────────────────────────────────────────┘
```

- **Background** — black, white text, no border.
- **Height** — `h-9` mobile (~36px), `h-10` (`sm+`) desktop (~40px). Fixed so mounting the banner doesn't shift the page below.
- **Type** — `text-[12px]` mobile, `text-[13px]` desktop. Normal weight. Subtle, not bold.
- **Padding** — horizontal padding matches the page gutter (`px-4 sm:px-6 lg:px-8`). Vertical padding is implicit from the row height.
- **Sticky behaviour** — banner does **not** sticky on scroll. The header sticks; the banner scrolls away.
- **Layout (sm+)** — two columns sharing the row: a static line on the left, a rotating message on the right.
- **Layout (mobile, < 640px)** — static line is hidden; only the rotating side renders, centre-aligned.
- **Rotation** — the right side carousels through ~4 messages, one at a time, auto-advancing every 5 seconds. Crossfade transition (500ms). Pauses on hover and on focus so users can read and click. Each rotating item is a real `<a>` link.
- **Accessibility** — `aria-live="polite"` on the rotating container; only the active item has `aria-hidden={false}` and `tabIndex={0}`. Inactive items are non-focusable and pointer-events-none.

**Editing copy or links:** edit `PROMO_STATIC_LINE`, `PROMO_ROTATING_ITEMS`, and `PROMO_ROTATION_MS` in `lib/site-config.ts`. The component is purely structural — no copy or link strings live in `PromoBanner.tsx`.

## Footer

```
┌─────────────────────────────────────────────────────────────┐
│ Black footer                                                │
│  ┌─────────────┬─────────────┬─────────────┬────────────┐  │
│  │ SHOP        │ LEARN       │ ABOUT       │ CONTACT    │  │
│  │ Water Filt. │ Guides      │ Our Pricing │ Phone      │  │
│  │ Cartridges  │ Problems    │ About Us    │ Email      │  │
│  │ Bubblers    │ Use Cases   │ Shipping    │ Hours      │  │
│  │ Pumps       │             │ Returns     │            │  │
│  │ Plumbing    │             │             │            │  │
│  └─────────────┴─────────────┴─────────────┴────────────┘  │
│  ─────────────────────────────────────────────────────────  │
│  © 2026 Enviro Aqua    |    ABN  |   Privacy   Terms        │
└─────────────────────────────────────────────────────────────┘
```

- Black background, white text
- 4-column layout on desktop, stacks on mobile
- Bottom bar: copyright + legal links

## Buttons

```tsx
// Primary
className="bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold px-6 py-3 rounded transition-colors"

// Secondary
className="bg-white border border-black hover:bg-gray-50 text-black font-semibold px-6 py-3 rounded transition-colors"

// Tertiary (text link)
className="text-brand-blue hover:underline font-semibold"
```

Buttons are always blue. CTAs are always blue. There is no other accent colour.

## Cards (product cards, content cards)

```tsx
className="border border-gray-200 hover:border-gray-400 transition-colors p-4 rounded"
```

Subtle borders, no shadows, no hover-lift effects. Clean.

## Spacing scale

Use Tailwind defaults: `2, 4, 6, 8, 12, 16, 20, 24`. Don't invent new spacing values.

## Imagery

- Product images on white backgrounds
- Editorial images (use-cases, problems): real, unposed, Australian-context where possible
- No stock photos that look stocky
- All images use `<Image>` from `next/image` for optimisation

## Iconography

- Use Lucide React (`lucide-react` package) — clean, consistent, free
- Icons at 20px or 24px, never larger in nav
- All icons monochrome (black or blue)

## Motion

Minimal. Specifically:
- `transition-colors` on hover states (150ms default)
- `transition-opacity` for fade-ins
- No carousels with auto-advance
- No parallax
- No scroll-triggered animations in v1

## Trust signals (always visible somewhere)

- Wholesale pricing message (top banner — sitewide)
- Free shipping threshold (header strip or near add-to-cart)
- WaterMark certification badge on certified products (clear visual treatment)
- Stock status near add-to-cart
- Australian-owned messaging in footer

## Design rules (enforced)

1. White backgrounds for content and the main header. Black only for the top utility bar and the footer.
2. Blue is for action. If it's not clickable, it's not blue.
3. No gradients. No drop shadows. No rounded corners larger than `rounded` (4px).
4. Borders are 1px, gray-200 or gray-300. Never colourful.
5. Whitespace > visual decoration. If in doubt, simpler.
