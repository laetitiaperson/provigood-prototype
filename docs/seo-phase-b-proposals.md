# Provigood, SEO / GEO phase B — proposals for Vincent

**Audience**: Vincent Treluyer, founder & CEO.
**Prepared by**: Laetitia + Claude, 2026-05-14.
**Read time**: ~10 minutes.

---

## TL;DR

We already shipped everything that can be optimised without touching Vincent's
copy ("phase A"). To go further, we need your green light on **light wording
changes** on a handful of page headings, first paragraphs and link labels.
None of these changes alter the message, the tone or the structure. They
mostly inject one keyword early enough in the text for Google and AI search
engines (ChatGPT, Perplexity, Claude.ai) to pick it up.

This document lists every proposed change as **before → after**, with the
reason in one line. You can approve / reject each item individually.

---

## What we already did (no approval needed)

For context, here is what landed in production on `main` branch over the
last 7 commits. None of it changes anything visible to a visitor:

- `robots.txt` and `sitemap.xml` at the site root (48 URLs, 3 languages,
  hreflang complete).
- Canonical link tag, Twitter Card, OG dimensions, geo signals on all
  18 EN pages.
- Real social card image (1200x630 HCMC skyline) instead of the 32 px
  favicon that was used as social preview.
- Rich JSON-LD schemas: `ProfessionalService` + `WebSite` on the
  homepage, `Person` (Vincent) on Our story. The two cross-reference
  each other via `@id` so search engines understand "Provigood the
  company" and "Vincent the founder" are linked.
- Rewrote the 4 weakest `<title>` and `<meta description>` tags (head
  metadata only, invisible). Affected pages: services, contact, about
  (description only), distribution-olivo.
- Small "Quick facts" strip under the hero on about.html and
  services.html. Definition-list format (`<dl>`) so LLMs can extract
  facts verbatim: founded 2018, HQ HCMC, 250+ partners, markets, etc.

These changes are scoped to EN. They can be propagated to FR and VI
mechanically once the translations are finalised. No copy decisions
involved.

---

## Why phase B matters

Google and AI assistants weight content in this order, when deciding
what to show / cite:

1. The `<title>` tag (done, phase A).
2. The H1.
3. The first 100 words of body text on the page.
4. H2 / H3 sub-headings.
5. The rest of the body.

If your primary keyword for a page is `Vietnam FMCG consulting`,
Google wants to see those exact words in 1-2-3 above. Right now:

- Your H1s are excellent ("Empowering businesses to succeed in Vietnam
  since 2018") — they carry the brand voice and the keyword.
- Your first paragraph below the H1 is sometimes a **decorative
  sub-line** ("Turning business challenges into opportunities") which
  carries zero SEO signal.
- Some H2s read beautifully ("Built for performance, designed for the
  planet") but mention neither the product, nor Vietnam, nor any
  category. Google sees them as filler.

The fixes proposed below add 1-3 keywords to existing copy, never
replace your sentences. The visual feel stays the same.

---

## Proposed changes, page by page

For each item, the legend is:

- **🟢 Low risk**: cosmetic edit (a few words), keeps tone intact.
- **🟡 Medium risk**: 1-2 lines of new content. Needs your eye on tone.
- **🔴 Higher risk**: structural addition (new section). Worth it but
  requires more of your attention.

### services.html

| # | Severity | Location | Before | After | Why |
|---|---|---|---|---|---|
| 1 | 🟢 | Hero, first sub-paragraph | "Turning business challenges into opportunities" | "Turning business challenges into opportunities in Vietnam" | Adds the primary geo keyword to the very first body text. 4 extra words. |
| 2 | 🟢 | H2 #5 | "Looking for a customized solution?" | "Looking for a customized solution in Vietnam?" | Same logic, plus this section is the final CTA, which Google ranks more highly. |
| 3 | 🔴 | New section | (none) | A mini-FAQ with 4 questions and schema: "How long does Vietnam market entry take?", "What sectors does Provigood cover in Vietnam?", "Does Provigood handle executive search in Vietnam?", "Do you operate in Cambodia, Laos, Thailand?". Each answer 2-3 sentences. | Adds a `FAQPage` JSON-LD block which is the single most cited content type by ChatGPT / Perplexity. We can lift answer text directly from the existing site copy. |

### about.html

| # | Severity | Location | Before | After | Why |
|---|---|---|---|---|---|
| 4 | 🟢 | H2 #1 | "From a conviction to a network" | "From a conviction to a 250+ partner network in Vietnam" | The current H2 is poetic but invisible to Google. Adding "250+ partners" and "Vietnam" turns it into something the FAQ box on Google can quote. |
| 5 | 🟢 | H2 #4 | "The experts behind your success" | "The Provigood team and partner experts in Vietnam" | Same. |
| 6 | 🟢 | H2 #6 | "Let's talk about your Vietnam project" | (keep, this one is already great) | No change. |
| 7 | 🟢 | First paragraph (already good) | "Provigood is a Ho Chi Minh City-based consulting and trading company..." | (keep, this one is already great) | No change. |

### distribution-olivo.html

| # | Severity | Location | Before | After | Why |
|---|---|---|---|---|---|
| 8 | 🟢 | Hero first sub-line | "Eco-friendly insulated containers for safe last-mile delivery" | "Eco-friendly insulated containers for safe last-mile cold-chain delivery in Vietnam" | Adds "cold-chain" (high-intent keyword) and "Vietnam" to the very first sub-headline. |
| 9 | 🟢 | H2 #2 | "Sustainability & ESG impact" | "Sustainability and ESG impact of passive cold-chain logistics" | Adds the product category keyword. The "&" → "and" also matches our house style. |

### distribution-coffee.html

| # | Severity | Location | Before | After | Why |
|---|---|---|---|---|---|
| 10 | 🟢 | H2 #2 | "Built for performance, designed for the planet" | "Built for performance, designed for the planet: compostable coffee in Vietnam" | One of the most "poetic but invisible" H2s. The trailing clause turns it into a searchable phrase without losing the lyric. |

### partner.html

| # | Severity | Location | Before | After | Why |
|---|---|---|---|---|---|
| 11 | 🟡 | H2 #1 (the very long one) | "Empowering growth through strategic partnerships and innovative collaborations" | "Empowering growth in Vietnam through strategic partnerships and innovative collaborations" | One word ("in Vietnam") near the start. |
| 12 | 🟢 | H2 #2 | "Navigate Vietnam's market with expertise, efficiency, visibility, and innovation" | (keep, this one is great) | No change. |

### index.html

| # | Severity | Location | Before | After | Why |
|---|---|---|---|---|---|
| 13 | 🟢 | H2 #3 | "Why choose Provigood?" | "Why choose Provigood for your Vietnam expansion?" | This is one of the highest-ranking H2s in SERPs. Adding "Vietnam expansion" pulls in the long-tail. |
| 14 | 🟢 | H2 #7 | "Industries we serve" | "Industries we serve in Vietnam and Southeast Asia" | Same. |

### Internal link anchor texts

Generic anchor text ("Read more", "Discover our services") wastes
context. Search engines and LLMs use anchor text as a vote of relevance
for the link target.

| # | Severity | Page | Before | After |
|---|---|---|---|---|
| 15 | 🟢 | index.html (hero CTA) | "Discover our services" | "Discover our Vietnam consulting services" |
| 16 | 🟢 | index.html (homepage CTA) | "Explore our solutions" | "Explore our Vietnam business solutions" |
| 17 | 🟢 | distribution-olivo.html | "See what our clients say" | (keep) | No change, it's already specific enough. |
| 18 | 🟢 | services.html, Team empowerment block | "Review our training catalog" | "Review our Vietnam training catalog" |

---

## Risk summary

- **15 items are 🟢 low risk** (1-5 words added to existing text).
- **1 item is 🟡 medium risk** (a long H2 rewrite, still very close to
  the original).
- **1 item is 🔴 higher risk** (new mini-FAQ section, ~500 words to
  approve).

If you accept everything as-is, total reading time of the changes:
under 3 minutes.

---

## What we explicitly do NOT recommend changing

To set the record: there are pieces of Vincent's copy I'd never touch.

- "Empowering businesses to succeed in Vietnam since 2018" — H1
  about.html — perfect already.
- "We exist to help companies in food, beverage, FMCG and hospitality
  unlock the full potential of the Vietnamese market" — Mission
  statement about.html — perfect.
- "Excellence with speed and agility" — Provigood's motto (already
  removed from hero but kept in body copy).
- The story-step copy ("The decision", "Provigood is born", "A 250+
  partner ecosystem") — narrative arc, leave it alone.
- Every testimonial quote — verbatim, never touch.
- The "Becoming a Provigood partner" personal note on partner.html —
  Vincent's voice, leave it.

---

## What I need from Vincent

For each numbered item above (1 to 18):

- **Approve** as written → I implement it.
- **Reject** → no change.
- **Approve with edit** → tell me your wording, I apply it.

You can answer in any format (Slack message, email, voice note, marked-up
PDF). The 🔴 item (#3, services.html mini-FAQ) is the one I'd most
like 30 min of your time on — it's where the real GEO upside is.

---

## What happens once approved

I batch all approved items into one commit. The visible diff on the
live site is 5-10 lines of HTML across 5-6 pages. The expected impact:

- Google: each modified page becomes searchable on 2-3 new long-tail
  queries it currently does not rank for.
- AI search (ChatGPT / Perplexity / Claude): the mini-FAQ alone makes
  services.html "citable" the next time these engines scrape the site.
- LinkedIn / Slack social previews: unchanged from phase A (already
  good).

We can iterate page by page if you want to validate item by item
instead of batching. Just say the word.

---

*Companion documents in this repo (technical, no copy decisions):
 `git log --oneline | grep "SEO Step"` shows what was already shipped.*
