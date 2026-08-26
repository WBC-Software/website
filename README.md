# WBC Software — website

Static single-page site. No build step, no dependencies, no runtime.
Open `index.html` in a browser, or serve the folder.

```
index.html    markup + metadata
styles.css    reset / variables / typography / layout / nav / hero /
              components / sections / footer / motion / accessibility
i18n.js       English + Portuguese copy (data only)
script.js     language switching, nav state, mobile menu, reveals, scrollspy
assets/       brand marks, favicons, Open Graph image
```

## Languages

The page ships in English and Brazilian Portuguese, switched in place with the
`EN / PT` control in the nav (and at the foot of the mobile menu).

- **All copy lives in `i18n.js`** — never in `index.html`. To edit text, edit
  that file. Elements are wired up with `data-i18n="key"`; attributes use
  `data-i18n-aria-label="key"`.
- **Language is chosen** by `?lang=pt` in the URL first, then a previous choice
  in `localStorage`, then the browser's own language. So `?lang=pt` is a
  shareable link to the Portuguese version.
- The swap runs before first paint, so a Portuguese visitor never sees English
  flash past. `<html lang>`, `<title>` and the meta description update too.
- Adding a language means adding a block to `i18n.js` with the same keys and a
  button to the two `.lang-switch` groups. Nothing else changes.

**SEO caveat:** both languages live at one URL and are swapped client-side.
Search engines render JavaScript, and `hreflang` tags point at `?lang=en` /
`?lang=pt`, but two separate static pages would index more reliably. Worth
doing if organic search in Portuguese matters.

## Brand

Everything derives from the WBC mark — a petrol-teal wolf head.

| Token | Value | Role |
|---|---|---|
| `--brand` | `#064C53` | the mark's own teal; a **fill**, never text (too dark to read on) |
| `--brand-deep` | `#04353A` | ink on teal surfaces, e.g. the primary button label |
| `--accent` | `#A3C8CE` | the mark's antialiased edge tone — the light end of the same hue axis |
| `--bg` | `#080B0C` | near-black, nudged a few degrees toward the brand hue |

Colour is scarce by design: it marks the brand and nothing else. The only solid
brand fill on the page is the WBC band in the engagement-model diagram.

### Assets

| File | Use |
|---|---|
| `assets/wbc-logo.png` | the original mark, teal on light — supplied artwork |
| `assets/wbc-mark.png` | silhouette tinted `#A3C8CE` on transparency — for dark backgrounds (nav, footer) |
| `assets/wbc-mark-brand.png` | silhouette tinted `#064C53` on transparency — for light backgrounds |
| `assets/favicon-32.png`, `favicon-180.png` | browser tab and touch icon |
| `assets/og-cover.png` | 1200×630 link preview, rendered in the site's own typefaces |

The marks are 53×63 raster, sized for UI use at 20–26px. If you ever need the
logo large (print, signage), have the original vectorised — upscaling this
bitmap will not hold up.

## Before deploying

Replace every placeholder. `grep -rn "_HERE" .` finds them all.

| Placeholder | Where | What it is |
|---|---|---|
| `YOUR_EMAIL_HERE` | contact button, Email link | Contact email address |
| `YOUR_WHATSAPP_NUMBER_HERE` | hero + contact WhatsApp buttons | Digits only, country code, no `+` — e.g. `5511999999999` |
| `YOUR_LINKEDIN_URL_HERE` | contact links | LinkedIn profile URL |
| `YOUR_GITHUB_URL_HERE` | contact links | GitHub profile URL |
| `YOUR_DOMAIN_HERE` | canonical, `og:url`, `og:image`, `twitter:image` | Deployed domain |

## Local preview

```bash
python3 -m http.server 8080
# http://localhost:8080
```

## Deploy to GitHub Pages

Push to a repository, then **Settings → Pages → Source: Deploy from a branch**,
branch `main`, folder `/ (root)`. No workflow or build configuration is needed.

## Notes

- Fonts load from Google Fonts (IBM Plex Sans, Inter, JetBrains Mono). If the
  request fails the page falls back to the system stack without layout breakage.
- Animations are disabled under `prefers-reduced-motion: reduce`.
- Scroll reveals are guarded on a `js` class, so the page is fully readable
  with JavaScript disabled.
- All text clears WCAG AA contrast (4.5:1 for small text) against its background.
- The WhatsApp buttons carry a prefilled opening message that follows the
  selected language. They are styled in the site palette rather than WhatsApp
  green — the glyph carries the recognition. Swap `.btn-whatsapp` to `#25D366`
  if you would rather have the louder conversion signal.
