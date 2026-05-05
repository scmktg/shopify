# Design System

## Visual identity (locked)

**Minimalist. Clean. Utilitarian. Professional.**

Three colours, that's it for v1:

| Colour | Hex | Use |
|---|---|---|
| White | `#FFFFFF` | Page background |
| Black | `#000000` | Header banner, footer, primary text, borders |
| Blue | `#0066CC` | All buttons, CTAs, links, focus states |

Tailwind config:

```ts
colors: {
  brand: {
    blue: '#0066CC',
    'blue-hover': '#0052A3',
    'blue-light': '#E6F0FA',
  }
}
```

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
│ ENVIRO AQUA      Water Filters | Cartridges | ... | 🔍 🛒 │  <- Black header
└─────────────────────────────────────────────────────────────┘
```

- Top utility bar: black background, white text, ~32px tall, displays the wholesale message + maybe phone number
- Main header: black background, white text + logo, sticky on scroll
- Logo on left (text-only for v1: "ENVIRO AQUA" in semibold)
- Nav in centre/right
- Search icon + cart icon on far right
- Mobile: hamburger menu, full-screen overlay nav

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

1. White backgrounds for content. Black only for header/footer.
2. Blue is for action. If it's not clickable, it's not blue.
3. No gradients. No drop shadows. No rounded corners larger than `rounded` (4px).
4. Borders are 1px, gray-200 or gray-300. Never colourful.
5. Whitespace > visual decoration. If in doubt, simpler.
