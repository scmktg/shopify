# Content Rules

## Tone of voice

- **Direct, not chatty.** "This filter removes chlorine" not "Hey, fed up with chlorine? We've got you!"
- **Knowledgeable, not jargony.** Use technical terms but define them. "5 micron rating (filters particles down to 5 micrometres — about 1/15th the width of a human hair)."
- **Honest, not overselling.** "This system reduces fluoride by approximately 95%" not "miraculously eliminates ALL fluoride forever!"
- **Australian English.** Colour, organise, behaviour, customise. Not color, organize, behavior, customize.
- **Trade-friendly.** Tradies skim. Use clear specs, structured info, real numbers.

## What every product description must include

In this exact order:

1. **Overview** (60–120 words, 1–2 paragraphs)
   - What it is
   - Who it's for
   - The single most important reason to buy it
2. **Key Features** (4–8 bullets)
   - Each bullet leads with a feature, then explains the benefit
3. **Technical Specifications** (definition list)
   - Match the metafield schema in `/docs/03-data-model.md`
   - Include flow rate, dimensions, connection size, materials, voltage where relevant
4. **What's Included**
   - Itemised list of everything in the box
5. **Installation Notes** (where applicable)
   - DIY vs licensed plumber required
   - Tools needed
   - Approximate install time
6. **Compliance & Certification** (mandatory)
   - WaterMark status (certified / not required / not certified)
   - WELS rating where relevant
   - If certified: licence number, link to certificate

**Minimum 600 characters.**

**No duplicate descriptions across products. Every product is uniquely written.**

## What every category landing page must include

1. **H1 with the category name** ("Under Sink Water Filters")
2. **Editorial intro** (300–500 words above the product grid)
   - What this category is for
   - Who it suits
   - How to choose between options
   - Linked references to relevant problem pages
3. **Product grid** with filtering UX
4. **Buying guide section below the grid** (optional, 200–400 words)
5. **FAQ section** (4–6 genuinely useful questions, FAQPage schema)
6. **Internal links** to related categories, problem pages, use-case pages

## What every problem page must include

1. **H1: "[Problem] in your water — how to fix it"** or similar
2. **Diagnostic intro** (300 words): "How do you know if you have this problem?"
3. **Why it matters** (200 words): health impact, plumbing impact, taste impact
4. **Recommended solutions** (the products): 4–8 product cards with explanation of why each works
5. **DIY vs professional** (when relevant)
6. **FAQ** (4–6 questions)
7. **Internal links** to relevant categories, related problems, use-cases

**Minimum 1,500 words. Target 2,000–2,500 for high-priority problems (fluoride, bacteria, chlorine).**

## What every use-case page must include

1. **H1 targeting the audience** ("Caravan & RV water filtration")
2. **Audience intro** (200 words): who this is for, what their needs are
3. **Recommended setup** (300 words): "Here's what we recommend for [use case]"
4. **Curated product collection** (6–12 products)
5. **Common questions** (FAQ, 4–6 questions)
6. **Internal links** to relevant categories and problems

**Minimum 1,000 words.**

## What every location page must include

1. **H1 with location name** ("Water Filters in Central Coast NSW")
2. **Local intro** (200–300 words): water quality issues common to the area
3. **Service offering** (200 words): what we offer locally — installation, pickup, etc.
4. **Featured products** (6–8 products)
5. **NAP** (name, address, phone) — consistent format
6. **LocalBusiness schema**
7. **Internal links** to category pages

## SEO copywriting rules

1. **One H1 per page.** Always.
2. **Keyword in H1 and first 100 words.** Don't stuff. Just include it naturally.
3. **Internal links use descriptive anchor text.** "Reverse osmosis systems" not "click here."
4. **No fluff.** Every sentence earns its place.
5. **No AI giveaways.** Don't use "delve into," "in today's fast-paced world," "embark on a journey," etc.
6. **No exclamation marks.** This is not Black Friday at Spotlight.
7. **Specifics over generalities.** "Removes fluoride to under 0.1ppm" beats "removes harmful fluoride."

## Title tag conventions

- Max 60 characters (Google truncates beyond this)
- Brand name suffix: ` | Enviro Aqua`
- Pipe `|` as separator
- No ALL CAPS
- No clickbait

## Meta description conventions

- Max 155 characters
- Lead with value prop or product spec
- Include a call-to-action ("Shop now," "Free shipping over $200")
- Don't repeat the title verbatim

## Image alt text rules

- Required on every image
- Describe what the image shows AND why it matters for the product
- Include product type and key feature
- Example: `6-stage reverse osmosis water filter system installed under kitchen sink, with alkaline cartridge and 3-way filtered tap`

## Forbidden phrases

Never appear in customer-facing copy:
- "Best on the market"
- "Number one [anything]"
- "Revolutionary"
- "Game-changing"
- "Cutting-edge"
- "World-class"
- "Premium" (used to mean "expensive" — only use when factually true and specific)
- "Up to" without a specific maximum

## Required phrases (when relevant)

- WaterMark-certified products: badge + "WaterMark Certified" text + licence number visible
- Non-certified plumbing products: clear "Not WaterMark certified — for off-mains use only" warning
- Free shipping threshold: visible on every product page (currently: "Free shipping on orders over $200")
- Wholesale pricing: "Wholesale price — same for everyone, no account needed"
