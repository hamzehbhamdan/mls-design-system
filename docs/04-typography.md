# Typography

## What MLS actually uses

### MLS Tifo — the current brand typeface

A bespoke variable super-family by **F37 Foundry**, commissioned by MLS. Three sub-families:

- **MLS Headline** — display
- **MLS Standard** — text
- **MLS Micro** — small sizes

Range runs Light to Extra Bold, widths Regular to Wide, with optical sizes from text to display. **Four variable axes in a single file**, engineered so one font load serves the whole system and the same face renders crisply at 11px and with impact at 96px. Deployed across "stadium displays, phone screens, print, broadcast, and general brand communications."

### MLS Streets / Stands / Pitch — the kit typeface

Also F37, designed by Rick Banks, launched 2020 for the league's 25th season across all clubs. Three weights with distinct jobs:

- **MLS Streets** — shirts and shorts
- **MLS Stands** — banners and stadium signage
- **MLS Pitch** — online and social

The three layer on top of one another to create a **tri-line effect**, described at launch as "something never before seen in football shirt lettering." Concept: the Penrose Triangle and Necker Cube.

The detail that matters most for a brand system: **the tri-line references the three stars of the crest, and the number terminals are angled to follow the star points.** The kit face is structurally derived from the mark. That is a genuinely tight identity system, and it is the reason nothing else should be substituted into a kit-numbering context.

### DIN Next Pro — legacy

The 2015 Partner Brand Guidelines specify DIN Next Pro as the brand typeface. MLS Tifo appears to have superseded it, though no document states the changeover explicitly. **Treat DIN Next Pro as correct only for 2015-era material.**

## What this system ships

**No font binaries.** All of the above are commercially licensed.

Every stack names the licensed original **first**, then falls back:

| Token | Stack | Job |
|---|---|---|
| `--mls-font-display` | `"MLS Tifo Headline", "MLS Headline", "Archivo Expanded", Archivo, …` | Headlines, scorelines, buttons, labels |
| `--mls-font-text` | `"MLS Tifo Standard", "MLS Standard", Inter, …` | Body, UI, long-form |
| `--mls-font-micro` | `"MLS Tifo Micro", "MLS Micro", Inter, …` | Under 13px |
| `--mls-font-numeric` | `"MLS Tifo Headline", Archivo, …` | Scores, standings, clocks |
| `--mls-font-mono` | `"JetBrains Mono", "SF Mono", …` | Code and IDs. Not a brand face. |

**Do not strip the licensed names.** They are what makes a properly licensed machine render the real thing. Costs nothing on machines without them.

### Why these substitutes

| Original | Substitute | Reasoning |
|---|---|---|
| MLS Tifo (text) | **Inter** (SIL OFL) | The closest available analogue: a variable neo-grotesque with a genuine optical-size axis, engineered for screen legibility at small sizes — which is precisely the job MLS Micro does. |
| MLS Tifo (display/wide) | **Archivo** (SIL OFL) | One of very few open grotesques with **both** a weight axis and a real width axis, through Archivo Expanded. Inter alone cannot reproduce Tifo's Regular→Wide range. Use Archivo where width behaviour matters. |
| DIN Next Pro | **Barlow** (SIL OFL), or **D-DIN** for literal fidelity | D-DIN is a direct DIN 1451 derivative and matches the skeleton closely, but runs out of range fast. Barlow is the better system choice: low-contrast grotesk on a DIN-adjacent skeleton, nine weights, Condensed and Semi Condensed widths. |
| MLS Streets/Stands/Pitch | **None.** | Streets is a proprietary display face whose entire premise is a three-layer chromatic stack built on an optical illusion. **Bungee** (SIL OFL) is the only well-made open family designed around layerable components, so it reproduces the *mechanism* — but not the skeleton, and not the star-derived terminals. Be honest with stakeholders: this one has no substitute. Do not fake kit numbering. |

Load Inter and Archivo from Google Fonts or self-host. See `assets/fonts/README.md`.

## The scale

Type classes are named by **job**, not by size. `.mls-heading-2` tells you where it goes; `text-3xl` only tells you how big it is, which is how design systems drift.

| Class | Font | Size | Notes |
|---|---|---|---|
| `.mls-display-1` | display | `clamp(2.5rem → 4.5rem)` | Uppercase, extrabold, tightest tracking |
| `.mls-display-2` | display | `clamp(2rem → 3.75rem)` | |
| `.mls-display-3` | display | `clamp(1.75rem → 3rem)` | |
| `.mls-heading-1` | display | 2.25rem | Bold, sentence case |
| `.mls-heading-2` | display | 1.875rem | |
| `.mls-heading-3` | display | 1.5rem | |
| `.mls-heading-4` | display | 1.25rem | |
| `.mls-body-lg` | text | 1.125rem | Relaxed leading |
| `.mls-body` | text | 1rem | Default |
| `.mls-body-sm` | text | 0.875rem | |
| `.mls-prose` | text | 1.125rem | Long-form. Capped at **68ch** |
| `.mls-caption` | micro | 0.75rem | |
| `.mls-eyebrow` | display | 0.6875rem | Uppercase, widest tracking |
| `.mls-tricode` | display | inherit | Uppercase, extrabold, tabular |
| `.mls-numeric` | numeric | inherit | Tabular lining figures |

Display sizes are fluid via `clamp()` so a hero scoreline behaves on a phone without a media query.

The raw scale runs `3xs` (0.625rem) to `9xl` (8rem). The top two steps exist for scorelines and stadium screens, not for headings.

## Rules

**1. Every figure that sits in a column or ticks over in place is tabular.**

```html
<td data-numeric>47</td>
<span class="mls-numeric">2 - 1</span>
```

Without `tabular-nums`, a standings table does not align and a live clock jitters as it moves from 9 to 10. This is the single most common typographic failure in sports interfaces.

**2. Small caps always get tracking.** `--mls-letterSpacing-widest` on anything uppercase below 13px. Caps at small sizes without tracking are genuinely hard to read.

**3. Extrabold has a floor.** Never below 24px — it closes up and turns to mud.

**4. Long-form gets a measure.** `.mls-prose` caps at 68ch. MLS editorial runs long; an unbounded column is unreadable.

**5. Uppercase is for display, labels and buttons.** Not for body, not for headings 2 and below, never for a paragraph. Uppercase destroys word-shape recognition and slows reading measurably.

**6. Diacritics are mandatory.** Luiz Araújo, Cucho Hernández, CF Montréal, El Tráfico, Querétaro. Any font chosen for this system must carry full Latin Extended coverage. Inter and Archivo both do. Stripping an accent is a factual error, not a typographic one.

**7. `font-synthesis: none`.** Set in base. A faux-bold Archivo is worse than a regular one.

## Pairing in practice

```html
<p class="mls-eyebrow">Matchday 24</p>
<h1 class="mls-display-2">Timbers take the Cascadia derby</h1>
<p class="mls-body-lg">Portland leave Seattle with three points…</p>
```

Eyebrow sets context in the display face at small size. Headline carries the weight. Body drops to the text face for reading. Three sizes, two faces, no decoration — the hierarchy does the work.
