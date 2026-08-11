# Fonts

**This folder is intentionally empty.** No font binaries ship in this repository.

## What MLS actually licenses

| Family | Foundry | Role |
|---|---|---|
| **MLS Tifo** — Headline / Standard / Micro | F37 Foundry | Current brand typeface. Variable, four axes, one file. |
| **MLS Streets / Stands / Pitch** | F37 Foundry (Rick Banks, 2020) | Kit numbering and nameplates. Layers into a tri-line effect derived from the crest's three stars. |
| **DIN Next Pro** | Monotype / Linotype | Legacy brand typeface, per the 2015 guidelines. |

All commercially licensed. Acquire through MLS Brand or the foundry.

## How the stacks are built

Every font token names the licensed original **first**, then falls back:

```css
--mls-font-display: "MLS Tifo Headline", "MLS Headline", "Archivo Expanded", Archivo, …;
--mls-font-text:    "MLS Tifo Standard", "MLS Standard", Inter, …;
```

A machine with the real fonts installed renders the real thing. Everyone else gets a vetted substitute. **Do not strip the licensed names** — they cost nothing on machines without them.

If you have licensed the originals, drop the woff2 files here and add `@font-face` declarations. No token change is needed; the stacks already reference them by name.

## Open substitutes

Both are SIL Open Font License and free for commercial use.

| Original | Substitute | Why |
|---|---|---|
| MLS Tifo (text) | **[Inter](https://fonts.google.com/specimen/Inter)** | Variable neo-grotesque with a genuine optical-size axis, engineered for screen legibility at small sizes — the same job MLS Micro does. |
| MLS Tifo (display / wide) | **[Archivo](https://fonts.google.com/specimen/Archivo)** | One of very few open grotesques with both a weight axis and a real width axis, mirroring Tifo's Regular→Wide range. Inter alone cannot do this. |
| DIN Next Pro | **[Barlow](https://fonts.google.com/specimen/Barlow)**, or **D-DIN** for literal fidelity | D-DIN matches the DIN skeleton closely but runs out of range. Barlow is the better system choice: nine weights, Condensed and Semi Condensed widths. |
| MLS Streets / Stands / Pitch | **No equivalent exists.** | Streets is a proprietary display face whose whole premise is a three-layer chromatic stack built on a Penrose-triangle illusion, with terminals angled to follow the crest's star points. [Bungee](https://fonts.google.com/specimen/Bungee) reproduces the layering *mechanism* but not the skeleton. **Do not fake kit numbering.** |

## Loading

CDN — fine for prototypes:

```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Inter:opsz,wght@14..32,100..900&display=swap" rel="stylesheet">
```

Self-hosting is better for production — one fewer connection, no third-party dependency, and it is what MLS itself does. Download the variable woff2 files, drop them here, and declare them with `font-display: swap`.

## Requirements for any substitution

1. **Full Latin Extended coverage.** Luiz Araújo, Cucho Hernández, CF Montréal, El Tráfico, Querétaro. Stripping a diacritic is a factual error. Inter and Archivo both qualify.
2. **Tabular figures.** Standings and scorelines are unusable without them.
3. **A real weight range.** The system uses 300 through 800.
4. **Ideally a width axis** for the display role.
