# MLS Design System

An unofficial, open design system and brand reference for **Major League Soccer**, built to be read by both people and by Claude.

Point Claude Design at this repository and every design it produces will inherit the league's colour logic, typography, spacing, graphic devices, component patterns, editorial voice and controlled vocabulary — including the ability to re-theme any layout to any of the 30 clubs with a single attribute.

```html
<link rel="stylesheet" href="dist/mls.css" />

<div data-club="por">
  <button class="mls-btn mls-btn--primary">Buy tickets</button>
</div>
```

That button is now Ponderosa Green. Change `por` to `clb` and it is Columbus gold, contrast-corrected so the label stays legible. Nothing else in the markup changes.

---

## Read this first

**This is not an official MLS product.** It is an independently researched reference, assembled from public sources in August 2026. Major League Soccer, the MLS crest, club names and club crests are trademarks of Major League Soccer, L.L.C. and its member clubs.

Three things this repo deliberately does **not** contain:

| Not included | Why | What to do |
|---|---|---|
| MLS or club logo files | Trademarked. Not ours to redistribute. | Drop official assets into `assets/logo/`. The `.mls-crest` component is the socket, and it already enforces the published clear-space and minimum-size rules. |
| MLS Tifo, MLS Streets, DIN Next Pro font binaries | Commercially licensed. | Every font stack names the licensed original **first**, so a machine with the real fonts uses them. Everyone else falls back to a vetted open-source substitute. See [`assets/fonts/README.md`](assets/fonts/README.md). |
| Invented "official" values | MLS publishes no public brand-colour specification. | Every value carries a confidence rating. See [`docs/15-sourcing-and-confidence.md`](docs/15-sourcing-and-confidence.md). Verify with MLS Brand before any print, licensing or partner use. |

The honesty is the point. A brand system that quietly guesses is worse than one that says which parts it knows.

---

## The one idea that matters

MLS's crest was designed in 2014 by Athletics and Berliner Benson as **a template, not a fixed mark**. The shield is split in two — one half for the league, one half the clubs occupy — and each club receives the crest in its own colours. Athletics' own description calls it "a flexible template."

So the crest is chromatically parasitic. Its default red and navy matter far less than its ability to become 30 other things.

This system is built around that:

- **`--mls-color-accent-*` is a slot, not a colour.** It defaults to the league red and is overridden wholesale by any club theme. Product code references `accent`; it never references `brand.red` directly.
- **Every club colour exists twice, and the distinction is load-bearing.** `--mls-club-primary` is the true brand value, never altered, for crests and badges where fidelity is a licensing requirement. `--mls-color-accent-base` is a contrast-corrected derivative for UI chrome.
- Without that correction, **24 of 30 club themes would fail WCAG**. Columbus gold on white is 1.5:1. LAFC's black is invisible as a dark-mode accent. The build fixes both, in OKLab, preserving hue and chroma, and prints exactly what it changed.

---

## Install

```bash
git clone <this-repo> && cd mls-design-system
npm install          # no runtime dependencies; scripts only
npm run build        # regenerate everything in dist/
npm run verify       # contrast audit + token integrity + render check
npm start            # serve the gallery at :4173
```

Or just use the built files — `dist/` is committed.

| File | Use |
|---|---|
| `dist/mls.css` | Everything. Tokens, reset, base, utilities, components, all 30 club themes. |
| `dist/mls.tokens.css` | Custom properties only. |
| `dist/mls.tokens.scss` | Sass variables. |
| `dist/mls.tokens.js` / `.d.ts` | Typed JS object. |
| `dist/tailwind.preset.js` | Tailwind preset. |
| `dist/mls.clubs.css` | Club themes only. |
| `dist/mls.clubs.json` | Club data with computed accents and contrast ratios. |

Nothing in `dist/` is hand-edited. Sources are `tokens/tokens.json` and `data/clubs.json`.

---

## Using it with Claude Design

Push it:

```bash
git init && git add -A && git commit -m "MLS Design System v1.0.0"
gh repo create mls-design-system --private --source=. --push
```

Then in Claude Design, open design system setup and link the repository.

Claude reads `claude/CLAUDE.md` first — a compressed, machine-first brief covering the rules that matter and the mistakes to avoid. Everything else is progressive detail.

Every file in `previews/` opens with a `@dsCard` marker, so each one registers as a card in the Design System pane:

```html
<!-- @dsCard group="Components" name="Buttons" subtitle="5 variants, 3 sizes" width="900" height="520" -->
```

Groups used: `Brand`, `Colors`, `Type`, `Spacing`, `Components`, `Clubs`.

---

## Repository map

```
claude/CLAUDE.md          Machine-first brief. Claude reads this first.
docs/                     The brand book. 16 chapters, human-readable.
tokens/tokens.json        Token source of truth (W3C DTCG format).
data/clubs.json           All 30 clubs: names, tricodes, colours, confidence ratings.
css/                      Authored CSS: reset, base, utilities, 8 component files.
previews/                 @dsCard preview pages, one per surface.
dist/                     Generated. Do not edit.
scripts/build.mjs         Token pipeline + club theme generator.
scripts/verify.mjs        Contrast audit and integrity checks.
assets/                   Empty slots for logos and fonts, with instructions.
index.html                Gallery. Open it to see the whole system at once.
```

---

## Documentation

**Visual**
[Overview](docs/00-overview.md) ·
[Brand foundation](docs/01-brand-foundation.md) ·
[Logo & crest](docs/02-logo-and-crest.md) ·
[Colour](docs/03-color.md) ·
[Typography](docs/04-typography.md) ·
[Space, layout & motion](docs/05-space-layout-motion.md) ·
[Graphic devices](docs/06-graphic-devices.md) ·
[Components](docs/07-components.md)

**Verbal**
[Voice & tone](docs/08-voice-and-tone.md) ·
[Vocabulary](docs/09-vocabulary.md) ·
[Editorial style](docs/10-editorial-style.md) ·
[Inclusive language](docs/11-inclusive-language.md)

**Reference**
[Accessibility](docs/12-accessibility.md) ·
[Clubs](docs/13-clubs.md) ·
[The 2027 transition](docs/14-the-2027-transition.md) ·
[Sourcing & confidence](docs/15-sourcing-and-confidence.md)

---

## Licence

Code and documentation: [MIT](LICENSE). Trademarks and brand assets: not licensed here. See [NOTICE.md](NOTICE.md).
