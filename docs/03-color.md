# Colour

## Confidence warning, up front

**MLS publishes no public brand-colour specification.** No brand page, no downloadable spec sheet, no press-kit values. The one authentic MLS document that is publicly reachable — *Partner Brand Guidelines v1.0*, January 2015 — contains primary and secondary palette pages, but the accessible version does not expose their values.

The values below are the most-cited third-party figures. They are **internally coherent**: PMS 485 C and PMS 281 C are the canonical flag-red and flag-navy pairing, which is exactly consistent with MLS's own statement that the crest colours "pay homage to the nations MLS represents." The CMYK and RGB breakdowns are the correct standard conversions for those chips.

They are also **uncorroborated**. One aggregator carries them, citing no brand guideline. Five other colour references have no MLS league-level entry at all, which is itself informative — the league palette simply is not well documented in public.

**Treat as low confidence. Verify with MLS Brand before print, licensing, merchandise or partner use.**

## League palette

| Role | Hex | RGB | CMYK | Pantone | Confidence |
|---|---|---|---|---|---|
| MLS Red | `#E2231A` | 226 35 26 | 5 98 100 0 | 485 C | **Low — unverified** |
| MLS Navy | `#001F5B` | 0 31 91 | 100 91 32 34 | 281 C | **Low — unverified** |
| White | `#FFFFFF` | 255 255 255 | 0 0 0 0 | White | High |
| Near-black | `#0B0F16` | 11 15 22 | — | — | System decision, not a brand value |

Near-black is a deliberate choice rather than a documented one. Pure `#000000` crushes detail on OLED and clips badly on stadium LED; `#0B0F16` holds shadow detail and still reads as black.

## The architecture

Three tiers. Only reference the third from product code.

```
color.primitive.*   Raw ramps. No meaning. 14 steps × 6 hues.
color.brand.*       The league marks. Documentation and crest use only.
color.accent.*      A SLOT. Defaults to league red, overridden by club themes.
color.semantic.*    Role-based, theme-aware. ← use these
```

Referencing `--mls-color-brand-red` from a button breaks all thirty club themes at once. Reference `--mls-color-accent-base`.

### Primitive ramps

Six ramps, fourteen steps each (`0, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000`), generated in OKLCH by `scripts/gen_ramps.py` so the visual distance between adjacent steps is roughly constant. An sRGB or HSL ramp goes muddy through the mid-tones, which matters here because the neutral ramp is not neutral.

**The neutrals carry a navy cast**, hue borrowed from the league navy, chroma held between 0.003 and 0.030 and rising slightly at the dark end where a flat grey looks dead. The result reads as *MLS grey* rather than as generic grey, at a cost of almost nothing.

`red.600` and `navy.900` are pinned to the documented brand values rather than to computed steps. The ramp is scaffolding; the brand colour is the brand colour.

### Semantic tokens

Every one has a light and a dark counterpart. Light is the default under `:root`; dark is emitted under `[data-theme="dark"]` and under `prefers-color-scheme: dark` when no theme is pinned.

| Group | Tokens |
|---|---|
| Surface | `bg`, `bg-subtle`, `bg-muted`, `bg-inverse`, `surface`, `surface-raised`, `surface-sunken` |
| Text | `fg`, `fg-muted`, `fg-subtle`, `fg-inverse`, `fg-on-accent` |
| Line | `border`, `border-strong`, `border-accent`, `focus` |
| Status | `success`, `warning`, `danger`, `info` and their `-bg` pairs |
| Match | `live` |

`live` is reserved for genuinely live match state. It is not a decorative red.

## Club theming

```html
<div data-club="sea">…</div>
```

That is the whole API. It re-themes the subtree, works nested, works in both colour schemes, and works on any component in the system.

### Two values per club, and the distinction is load-bearing

| Token | Value | Use for |
|---|---|---|
| `--mls-club-primary` | The club's **true** colour, never altered | Crests, badges, kit swatches — anywhere fidelity is a brand or licensing requirement |
| `--mls-color-accent-base` | A contrast-corrected derivative, ≥3.2:1 on the active background | Buttons, links, rules, focus, UI chrome |

Altering the first would be a brand violation. Not correcting the second would make most of the league's themes illegible.

### Why correction is necessary

Club colours were chosen for kits and crests. Nobody picked them for a 14px link on white.

**24 of 30 club primaries fail** at least one of the two constraints. Columbus gold `#FEDD00` on white is 1.5:1. Inter Miami's pink, Sporting's light blue, NYCFC's skyline blue, Nashville's electric gold and Minnesota's sky blue all fail on white. Philadelphia's near-black navy, Vancouver's deep sea blue, LA Galaxy's navy and New England's navy all fail on near-black.

The build corrects by nudging **lightness only**, in OKLab, preserving hue and chroma:

```
CLB   #FEDD00  light→#AD8C00 (3.22:1)   dark→#FEDD00 (14.22:1)
PHI   #051C2C  light→#051C2C (17.37:1)  dark→#50697C (3.34:1)
SEA   #2CC84D  light→#00A729 (3.20:1)   dark→#2CC84D (8.66:1)
```

### The achromatic case

LAFC and D.C. United both have black primaries. Lightening black yields grey, and grey is not a brand colour — it is the absence of one.

So when a primary is achromatic (OKLab chroma ≤ 0.02) and fails, the accent is **promoted to the first chromatic club colour that can be made to pass**:

```
DC    #000000  →  #EF3E42  (club red)
LAFC  #000000  →  #C39E6D  (California Gold)
```

This is not a workaround. It is what both clubs already do in their own digital products — LAFC's gold is its interface colour everywhere.

`--mls-club-primary` still holds `#000000` for both.

### Reading the output

`dist/mls.clubs.json` carries every computed value and every ratio:

```json
"theme": {
  "raw": "#FEDD00",
  "accentLight": "#AD8C00",
  "accentDark": "#FEDD00",
  "corrected": true,
  "contrast": { "rawOnWhite": 1.5, "accentLightOnWhite": 3.22 }
}
```

## Rules

**1. Colour never carries meaning alone.** Roughly one in twelve men has a colour-vision deficiency, and a league product will be viewed in sunlight, on a stadium screen and in greyscale print. Every colour signal in this system is doubled:

| Signal | Colour | Second channel |
|---|---|---|
| Win / draw / loss | green / grey / red | the letters **W D L** |
| Qualification zone | blue / green / amber rule | a written legend |
| Stat movement | green / red | ↑ ↓ → arrow |
| Match result | dimmed loser | font weight on the winner |
| Form error | red border | icon + message text, driven by `aria-invalid` |

**2. Two accents is one too many.** A club theme replaces the accent; it does not add a second. Two competing accent colours in one composition reads as a broken theme.

**3. Do not tint a club's crest colours to fit your layout.** Change the layout.

**4. Status colours are not brand colours.** `danger` is not the MLS red. They sit at different hues and lightnesses precisely so an error state never reads as branding.

**5. Dark mode is not an afterthought.** League products live on broadcast overlays, stadium screens and phones at night. Dark is a first-class scheme here, and the default league accent is contrast-corrected for it too — `#E2231A` sits at roughly 4:1 on near-black, which is a near-miss, so the build lightens it.

## Gradients

An official gradient crest variant exists, so gradients are sanctioned in the identity. This system does not define a gradient token set, because a gradient built from unverified brand values compounds the uncertainty. If you need one, build it from the club accent and its `-emphasis` step, keep it to two stops, and run it on the 45° axis.
