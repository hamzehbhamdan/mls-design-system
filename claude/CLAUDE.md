# MLS Design System — brief for Claude

Read this before generating anything in this design system. It is the compressed version of `docs/`. Where this file and a doc disagree, the doc is more detailed but this file is the operative summary.

Unofficial reference, compiled August 2026. Confidence ratings are real — respect them.

---

## 1. Non-negotiables

1. **Reference `accent`, never `brand.red`.** `--mls-color-accent-base` is a slot that any club theme overrides. Hard-coding the league red breaks all 30 club themes at once.
2. **Every diagonal is exactly 45°.** The slash is a documented brand element with a stated meaning. 30° or 60° is off-brand.
3. **Every figure in a column or a clock is `tabular-nums`.** Use `.mls-numeric` or `.mls-tabular`. A live score that reflows as it ticks from 9 to 10 looks broken.
4. **Never draw the MLS crest or a club crest.** Not as SVG, not as CSS, not "approximately". Use `.mls-crest` as an empty socket. This is a trademark boundary, not a stylistic preference.
5. **Never invent a hex, a font name, or a rule.** If a value is `null` in `data/clubs.json`, it is null because no trustworthy source exists. Say so rather than filling the gap.
6. **Club names are a lookup table, not a pattern.** FC leads for FC Dallas and FC Cincinnati, trails for Austin FC and Toronto FC. CF leads for CF Montréal, trails for Inter Miami CF. Eleven clubs have no suffix at all. Read `data/clubs.json`.
7. **Club names take plural verbs.** "Austin United **are** playing." "Inter Miami **have** climbed the mountaintop." This deviates from AP style and it is the single most-violated MLS convention.
8. **Expose the variables as tweaks, and always include MLS.** Anything you generate should let its theme, appearance and register be changed without regenerating it. `data-club="mls"` is a real theme value, so the theme axis is 31 options, not 30: a picker that offers only the clubs has dropped the league. See §2b.
9. **Radius stays tight.** 2–6px. The crest is straight lines and hard angles. Where a shape needs personality use `.mls-notch` (a clipped 45° corner), not a bigger radius.

---

## 2. Brand in one paragraph

MLS is the top-division professional soccer league of the United States and Canada, founded 1996, thirty clubs, headquartered in New York. Its crest, introduced in 2014 for the 2015 season, is built as a **flexible template**: a shield split in two, referencing the two halves of a match, with one half reserved for the league and the other available to clubs in their own colours. Three stars stand for the brand's three pillars — **For Club, For Country, For Community**. A 45° slash breaks the perimeter and drives upward, representing "the nonstop nature of our game and the rising trajectory of our league." The red, white and navy pay homage to the two nations the league represents.

The league is currently at a genuine inflection point: a new commissioner from 1 January 2027, and a switch from the spring-to-fall calendar to a summer-to-spring one, bridged by the **2027 MLS Sprint Season**. Note carefully: **the crest has not changed.** MLS is reframing meaning, not redrawing marks.

---

## 2b. Tweaks — expose the variables, always

Anything you generate from this system should ship with its variables exposed as tweaks, not baked in. This system was built to be re-themed and re-registered; a generated artefact that hard-codes one setting throws that away and forces a regeneration to see the alternative.

**Offer a tweak wherever the system already has an axis.** These are real, they are token-backed, and every layout already responds to them:

| Axis | Values | How it is set |
|---|---|---|
| **Theme** | `mls` + the 30 club slugs (31 total) | `data-club` on any element; `club:` in the deck and document layers |
| **Appearance** | `light`, `dark`, `system` | `data-theme` on the root; `system` means neither attribute |
| **Deck register** | `report`, `kickoff`, `press` | `design:` in `createDeck()` |
| **Surface** | `paper` (white), `page` (light grey), `navy`/club field | the role a layout asks for |
| **Type** | licensed (MLS Tifo, DIN Next Pro) or open substitutes (Inter, Archivo) | font stacks resolve automatically; expose it only when a preview needs to force one |
| **Density** | comfortable, compact | spacing scale steps; expose on tables, standings and lists |

**MLS is always an option in the theme tweak, and it is always first.** `data-club="mls"` is a real theme that restores the league values, so the theme axis is thirty-one values set the same way, with no special case for the default. A club picker that offers only the thirty clubs is wrong: it drops the league, which is the most-used theme in the system and the only correct one for league-level work. `club: 'mls'` (or `'league'`) works identically in the deck and document layers.

**Do not stop at the theme.** "Tweaks" here means every axis the artefact actually has, not a club dropdown bolted onto an otherwise fixed design. If you generate a standings table, expose density and appearance alongside the theme. If you generate a deck, expose the register. If you generate something with an axis this table does not list, expose that too.

**A tweak must change something real.** Wire it to the token or the attribute, never to a hard-coded second copy of the design. If flipping the tweak would not change the output, do not offer it.

---

## 3. Colour

Three tiers. Only ever reference the third from product code.

```
primitive  color.primitive.{neutral,red,navy,green,amber,cyan}.{0…1000}
brand      color.brand.{red,navy,white,black}       ← documentation only
semantic   --mls-color-{bg,fg,border,accent-*,success,…}  ← use these
```

| Value | Hex | Confidence |
|---|---|---|
| MLS Red (PMS 485 C) | `#E2231A` | **LOW.** Widely cited, no MLS-authored source. |
| MLS Navy (PMS 281 C) | `#001F5B` | **LOW.** Same. |
| White | `#FFFFFF` | High |
| Near-black | `#0B0F16` | System decision, not a brand value. |

Neutrals carry a navy cast borrowed from the league navy, so greys read as MLS grey rather than generic grey.

**Club theming.** `<div data-club="sea">` re-themes the subtree. Two values per club:

- `--mls-club-primary` — the club's true colour, **never altered**. Crests, badges, kit swatches.
- `--mls-color-accent-base` — a contrast-corrected derivative, guaranteed ≥3.2:1 on the active background. UI chrome.
- `--mls-club-field` / `--mls-club-spark-on-field` — for FULL-BLEED surfaces (slide grounds, inverse heroes). **Never fill a surface with `--mls-club-accent-dark`**: that token is a club colour lightened until it reads ON dark (Columbus's is `#FEDD00`), so filling with it gives a bright gold slide. The anchor is dark and the bright colour is a spark; a saturated field breaks the same rule a red one does. `field` is the darkest published club colour that can carry white text, navy where a club has none — Columbus resolves to black and gold, Seattle to Pacific Blue and Rave Green.

24 of 30 clubs need correction. Where a club's primary is achromatic (LAFC and D.C. United are both black) the accent is promoted to a chromatic club colour — gold for LAFC, red for D.C. — because lightening black yields grey, which is an absence of a brand colour rather than one.

**Never** signal meaning with colour alone. Win/draw/loss carries a letter. Qualification zones carry a legend. Stat deltas carry an arrow.

---

## 4. Type

Licensed originals are named first in every stack; open substitutes follow. Do not remove the licensed names — they are what makes a properly licensed machine render correctly.

| Role | Stack | Substitute rationale |
|---|---|---|
| `--mls-font-display` | MLS Tifo Headline → Archivo Expanded → Archivo | Archivo is one of very few open grotesques with a real width axis, which is what Tifo's Regular→Wide range needs. |
| `--mls-font-text` | MLS Tifo Standard → Inter | Variable neo-grotesque with an optical-size axis. |
| `--mls-font-micro` | MLS Tifo Micro → Inter | Tifo ships a dedicated Micro optical size for sub-13px. |
| `--mls-font-numeric` | MLS Tifo Headline → Archivo | Always with `tabular-nums`. |

Classes are named by job, not size: `.mls-display-1/2/3`, `.mls-heading-1…4`, `.mls-body`, `.mls-prose`, `.mls-caption`, `.mls-eyebrow`, `.mls-tricode`, `.mls-numeric`.

Display and headings are `--mls-font-display`, uppercase for display, tight tracking. Body is sentence case in `--mls-font-text`. Small all-caps labels always get `--mls-letterSpacing-widest` — caps below 13px without tracking are genuinely hard to read.

The kit typeface (MLS Streets/Stands/Pitch, layered into a "tri-line" effect derived from the crest's three stars) has **no open equivalent**. Do not attempt to fake it.

---

## 5. Space, motion, shape

- 4px grid. `--mls-space-{0,px,1…64}`.
- Radius 2–6px. `--mls-radius-full` only for pills, avatars and status dots.
- Duration: `fast 120ms`, `base 180ms`, `slow 240ms`. Nothing routine exceeds 240ms — the brand's stated idea is "nonstop."
- Signature easing `--mls-easing-drive` = `cubic-bezier(0.35, 0, 0.1, 1)`. Accelerates hard, then arrives.
- Shadows are restrained. MLS's own guidelines prohibit shadows and glows on the crest; the system leans on borders and surface steps instead.

---

## 6. Graphic devices

Two devices are named in MLS's own partner guidelines as part of the system independent of the crest. They are why a layout reads as MLS with no crest in frame.

- **The Slash** — `.mls-slash`, `.mls-slash-band`, `.mls-hatch`. A 45° diagonal driving upward.
- **The Corners** — `.mls-notch`, `.mls-corners`. Clipped 45° corners and L-brackets.
- **Duotone** — `.mls-duotone`. A sanctioned photographic treatment. Re-tints per club theme automatically.

Use one device per composition. Slash plus notch plus corners plus duotone at once is noise.

---

## 6b. Documents and decks — read this before generating either

Word and PowerPoint are first-class outputs, not exports of the web layer. Use the modules; do not hand-roll a deck.

```js
const { createDeck } = require('./templates/js/mls-deck.cjs');
const { createDoc }  = require('./templates/js/mls-doc.cjs');
```

Deck layouts (30): `title titleSplit section chapter agenda closing` · `statement quote bullets twoColumn explainerPair band` · `stats heroStat table splitTable standings chart chartPair` · `ranked sixUp tileGrid crestWall formation bracket matchup` · `timeline compare process` · `logoWall blank`

Doc elements: `cover toc h1 h2 h3 eyebrow p lead bullets numbered callout table stats quote divider pageBreak raw`

Both read `dist/` at require time, so tokens propagate with no edit. Both re-theme on `club`.

**Fonts.** Office resolves ONE family name, not a stack — there is no fallback. `fonts: 'safe'` (Arial) is the default and is correct for anything leaving MLS. `fonts: 'licensed'` (MLS Tifo) is correct only when every viewer has Tifo installed. Never Aptos.

**Slide scale is not document scale is not web scale.** Slides: body 17pt, title 38pt, hero stat 200pt, nothing below 10pt. Documents: body 11pt, H1 18pt, hero figure 30pt. Reusing slide sizes in a document makes every heading shout.

**Slides come in THREE DESIGNS.** `createDeck({ design })` takes `report`, `kickoff` or `press` (default). Not three colour schemes — three ideas about what a slide is, each carried across all 30 layouts.

| | `report` | `kickoff` | `press` (default) |
|---|---|---|---|
| stage (openers, statements, dividers) | light | photography | navy + 45° corner slash |
| page (content) | light | navy | white paper |
| data (tables, charts) | white | white | white |
| display | regular weight, sentence case | bold, sentence case | bold, UPPERCASE |
| needs imagery | no | **yes** | no |

A layout NEVER picks its own colours: it asks for a surface by role (`stage`/`page`/`data`) and draws with whatever that surface provides. Adding a design is one object in `DESIGNS`, not 30 edits. **Documents are always light** — paper is white.

`kickoff` needs photography, which this repo does not ship (trademarked). Pass `image:` to any opener for a full-bleed image with a scrim; without it you get a labelled placeholder frame.

Muted and subtle steps are SOLVED for contrast, not fixed mixes: 0.28 toward the ground clears 4.5:1 on navy and misses on Portland green. `fitRatio()` nudges until it clears. Verified across 3 designs x 3 surfaces x 31 palettes.

**Red on navy.** `#E2231A` and `#001F5B` are official and neither changes. But they are close in luminance and buzz at a shared edge, so on a dark ground the spark is lifted toward white until it clears 3:1, and red is never a field and never large — a rule, a numeral, a hairline, a corner mark.

**Text is measured, never estimated.** pptxgenjs cannot measure text. The module carries a real Arial advance-width table and wraps greedily as PowerPoint does. An average-character-width estimate over-measures a lowercase title ~12% (phantom line, gap under every heading) and under-measures digits (`3.28M` breaks as `3.2`/`8M` — a wrong number). Size boxes from `textH()`/`wrapCount()`, never a constant. `balanceWidth()` kills orphans and must never return less than the longest word.

**Three traps this module has already hit, in case you extend it:**
1. `lineSpacingMultiple` multiplies the FONT's line height (~1.17em), not the point size. Measure with lead L, render `lsm(L) = L/1.17`, or every block is 17% taller than its reserved space.
2. A list's gap BETWEEN items must be ~1.5x the line gap INSIDE one, or it reads as a paragraph with numbers in it. Shrink the type before crowding.
3. Columns are n columns and n−1 gutters with dividers centred in the gutters. Insetting all but the first gives uneven accent-mark intervals and a short last column.

**Marks.** None are committed — the crest and club crests are trademarks. `node scripts/install-logos.mjs <folder>…` matches files to clubs by name and writes `assets/logo/manifest.json`; the deck, document layer and CSS build all read it. Installed marks appear automatically: deck mark bottom-right on stage slides, all thirty in `crestWall()`, both sides of `matchup()`, and league properties via `deck.propertyMark(key, dark)`. Rules that matter when you touch this:

- **A missing club crest must give a lettered socket, never the league crest** — thirty MLS crests standing in for thirty clubs reads as a bug.
- **A mark is drawn for a ground.** Dark surfaces take the reversed variant where the manifest has one (`rec.onDark`). Columbus needs it in both directions: black wordmark invisible on navy, white wordmark invisible on white.
- **Never resize a mark to square.** `size` reserves a square box; the mark centres inside it at its own recorded aspect. Red Bulls is landscape, San Diego portrait.
- **`crestWall()` is a data slide** in all three designs. Club crests were drawn for white, and several lose their outline on a dark ground.
- **PNG for decks** (PowerPoint's SVG support is inconsistent; a vector-only mark vanishes from decks while looking fine on the web), SVG for the web, and `@deck.png` — a 900px copy — for embedding.
- **MLS NEXT member clubs are not MLS clubs.** They live in `nextClubs` and are wired into no layout; their names collide with real clubs.

`assets/logo/` is gitignored so an installed set is never committed.

**Documents:** headings are real Word styles so the TOC and navigation pane work; page is US Letter, stated explicitly because docx-js defaults to A4; table widths in DXA on both the table and every cell, because percentages break in Google Docs; `ShadingType.CLEAR`, never `SOLID`, which renders black.

**Charts:** eight categorical hues in fixed order, never cycled. Light and dark are different steps, not a flip. One axis, never dual. Colour follows the entity, not its rank. A ninth series folds into Other. Never a value label on every point. Status colours are reserved and never become "series 4". Club colours are not chart colours — Portland green and Seattle green collapse under deuteranopia.

**Office theme.** `templates/office/mls-theme.thmx` applies MLS colour and type to any Word/PowerPoint/Excel file. Its six accents are the first six CHART colours, deliberately not brand red, because Office assigns accents to series in order.

**Always validate and look at it.** `validate.py` for the file, then convert to PDF, rasterise, and inspect every page. Text overflow at a box edge is the most common defect and it is always user-visible.

Full detail: [16 Presentations](../docs/16-presentations.md) · [17 Documents](../docs/17-documents.md) · [18 Charts](../docs/18-charts.md)

## 7. Components

`.mls-btn` (primary/secondary/ghost/danger/inverse × sm/md/lg) · `.mls-card` · `.mls-crest` · `.mls-scoreline` · `.mls-table` (standings) · `.mls-stat` / `.mls-statbar` · `.mls-badge` (incl. `--live`) · `.mls-form` (W/D/L) · `.mls-header` / `.mls-nav` / `.mls-tabs` · form controls · `.mls-alert` / `.mls-empty` / `.mls-skeleton`.

Scoreline rules: **home team first** in fixtures, matchups and hashtags regardless of venue. Winner-first applies only to reported final scores in editorial prose. Match state lives in `data-state="live|final|upcoming"`. Below 640px swap the club name for the tricode rather than truncating.

The `--live` pulse is reserved for genuinely live matches. If everything pulses, nothing does.

---

## 8. Voice

Three registers, genuinely different — not variations on one voice.

**League communications.** Formal, dateline-driven, active. Near-zero humour. `NEW YORK (Monday, August 10, 2026) –`. Opens "Major League Soccer today announced…". Executives get full title before name.

**Editorial (mlssoccer.com).** Short sentences, present tense, verb-driven, willing to be funny and self-deprecating. Peak moments go full crescendo — all-caps, exclamation, the British trophy-lifting idiom ("LIFT THE TROPHY", not "win"). Loanwords are used unitalicised and unglossed: golazo, brace, clean sheet, kit, side, tifo, capo.

**Social.** Fragments, emoji as punctuation, looser. The league's own YouTube bio: *"MLS features stars from around the world, including one 🐐 from Argentina. We score bangers only."*

**The rule that matters most:** hype attaches to *moments*, never to the league's standing. Recaps and finals get maximal language. When MLS discusses itself competitively it becomes plain and even self-critical. **Celebrate the match, be honest about the league.**

**Fans vs supporters.** Two-tier and deliberate. *Fans* = the general audience, used in operational, commercial and conduct contexts. *Supporters* = the organised, committed constituency, used when acknowledging, honouring or addressing. The Fan Code of Conduct says "fans" exclusively; the commissioner's letter opens "To our supporters." Do not swap them.

---

## 9. Vocabulary

**Soccer, not football.** Absolute in North American context. "Football" is permitted only as a second-reference variant when discussing the global game. Québec French also uses *soccer* — do not "correct" it to *football*.

**"Franchise" is prohibited.** Use club, team or side. It reads as American-major-league and cuts against the global-football positioning.

Preferred: match (over game), pitch (over field), kit (over jersey), head coach (over manager), goalkeeper (over goalie), roster, offside (never "offsides"), stoppage time or added time (never "injury time"), starting XI, hat trick (two words, lowercase), brace, clean sheet, set piece.

**Competition names, exactly:**
`MLS Cup` (year after: *MLS Cup 2025*; sponsored: *presented by Audi*) · `Audi 2026 MLS Cup Playoffs` (sponsor first, then year — the opposite construction) · `Supporters' Shield` (apostrophe **after** the s) · `Leagues Cup` · `Lamar Hunt U.S. Open Cup` · `Canadian Championship` · `Concacaf Champions Cup` (Concacaf is **title case**, not all-caps; renamed from Champions *League* in 2024) · `MLS All-Star Game` · `MLS NEXT` and `MLS NEXT Pro` (NEXT all caps) · `Decision Day` · `2027 MLS Sprint Season`.

"presented by" is lowercase. Never "the" before MLS.

**Retired vocabulary — do not use as current:**
- *MLS Season Pass* — the standalone subscription ended after 2025. As of 2026 say "on Apple TV."
- *Allocation ranking / Allocation Order* — eliminated effective 2023. Those players go through the Discovery Process.
- *Columbus Crew SC* — the SC was dropped in 2021.
- Pre-2025 NYCFC colours and pre-2024 Sounders colours.

**Roster mechanics** are proper nouns: Designated Player, General Allocation Money (GAM, **tradable**), Targeted Allocation Money (TAM, **not tradable** — this is the distinction most often got wrong), Homegrown Player, SuperDraft (one word, internal capital D), Discovery List, U22 Initiative, Senior Roster, Supplemental Roster. A DP is not "a player paid over the cap" — it is a player whose *budget charge* is capped while their actual compensation exceeds the maximum.

Figures in `docs/09-vocabulary.md` are 2026-specific and change every January. Date-stamp them.

---

## 10. Editorial mechanics

- AP style is the default, overridden by the soccer-specific rules above.
- Scorelines hyphenated: `3-1`. Never `3:1`, never spelled out.
- Player names: full on first reference, surname after, nickname third. **Diacritics are mandatory** — Luiz Araújo, Cucho Hernández, CF Montréal, El Tráfico.
- Headlines: sentence case for news and press releases; title case for long-form features.
- `MLS'` not `MLS's`.
- Press-release dateline: `CITY (Day, Month D, YYYY) –`.
- MLS is genuinely inconsistent on: matchday/match-day/gameday, LIGA MX/Liga MX, a.m./p.m./PM, St. Louis CITY SC/City SC. Pick one, document it, do not pretend a rule exists.

---

## 11. Accessibility

WCAG 2.2 AA is the floor. Body text 4.5:1, large text and UI 3:1. The build verifies every semantic pair and all 30 club accents and fails loudly. Focus is always visible. Everything is keyboard reachable. `prefers-reduced-motion` kills every animation — all of them are decorative and none carry meaning that is lost.

---

## 12. When you are unsure

Say so. This system is explicit about its own confidence because MLS publishes very little, and a confident wrong answer about a brand is more expensive than an honest gap. If a user asks for a value marked `low` or `unverified`, give it, label it, and tell them to check with MLS Brand.
