# Provigood — HTML/CSS prototype

Static prototype of the Provigood website (Ho Chi Minh City–based F&B / FMCG / hospitality consulting, founded 2018).

Pure HTML + CSS + minimal vanilla JS. No build step, no dependencies.

## How to view

The simplest way:

```
open index.html
```

(or double-click `index.html` in Finder)

If you prefer a local server (recommended for accurate behavior of the Google Fonts preload):

```bash
# Python 3
python3 -m http.server 8000
# then open http://localhost:8000
```

## File structure

```
provigood-prototype/
├── index.html              # Home page (fully built)
├── services.html           # Placeholder
├── consulting.html         # Placeholder
├── provigoodpeople.html    # Placeholder
├── distribution.html       # Placeholder
├── about.html              # Placeholder
├── blog.html               # Placeholder
├── faq.html                # Placeholder
├── partner.html            # Placeholder
├── contact.html            # Placeholder
├── styles.css              # Full design system + page styles
├── script.js               # Mobile drawer, dropdown, sticky header, FAQ
├── images/                 # (currently empty — uses Google Fonts CDN only)
└── README.md
```

## Design system

- **Font**: Urbanist (400 / 500 / 600 / 700) via Google Fonts
- **Colors**: pink `#E91E63`, lime `#C5DA3B`, dark `#1F2937`, soft white `#F9FAFB`
- **Spacing**: 8px grid (8 / 16 / 24 / 32 / 48 / 64 / 96 / 128)
- **Container**: max 1200px, padding 24px (mobile) / 48px (desktop)
- **Radius**: 8 / 12 / 16 / 24 px
- **Breakpoints**: 768px (tablet), 1024px (desktop)

All tokens are exposed as CSS custom properties at the top of `styles.css`.

## Brand cues drawn from the brochure

- Lime triangle accent over the **i** in the **Provigood** logo
- Lime underline below pink section titles (`.accent-underline`)
- Soft, organic blob backgrounds in mint→cyan, pink→orange and pink→peach gradients
- Pink section accents kept restrained for a B2B premium feel
