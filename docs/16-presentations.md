# Presentations

Decks are a first-class output of this system, not an export of the web layer. A slide is read from the back of a room; a web page is read at 60cm. Almost nothing transfers unchanged.

```js
const { createDeck } = require('./templates/js/mls-deck.cjs');

const deck = createDeck({ design: 'press', club: 'por' });
deck.title({ eyebrow: 'Board of Governors', title: 'Season review' });
deck.stats({ title: 'The year in numbers', stats: [...] });
await deck.save('review.pptx');
```

Change `club` and the whole deck re-themes, using the same contrast-corrected accents the web layer uses. Change `design` and it becomes a different deck. Every colour and measurement is read from `dist/` at require time, so a token change propagates with no edit to the module.

Build all three reference decks to see every layout:

```bash
npm run examples
```

---

## Three designs

Not three colour schemes. Three different ideas about what a slide is, each carried across all 30 layouts.

| | `report` | `kickoff` | `press` |
|---|---|---|---|
| **Idea** | A league annual report | Matchday | A press sheet |
| **Openers** | Light, regular weight | Photography | Navy, uppercase |
| **Content** | Light | Navy | White paper |
| **Data** | White paper | White paper | White paper |
| **Display weight** | Regular | Bold | Bold, uppercase |
| **Needs imagery** | No | **Yes** | No |
| **Feels** | Calm, corporate, least "sports" | Energetic, most MLS | Declarative, high contrast |

**`press` is the default.** It gets the impact of poster-scale type and the restraint of the Record Book, the navy/white alternation gives a deck rhythm without any density, and it has no asset dependency — it is finished the day it is generated.

**`kickoff` depends on photography.** This repo ships none: MLS imagery is trademarked and not ours to redistribute. Pass `image:` to any opener and it is used full-bleed with a scrim; without it you get a labelled placeholder frame that is obviously a slot rather than a design.

```js
deck.title({ title: 'The season that changed the calendar', image: 'assets/photo/hero.jpg' });
```

**`report` cannot have a true Light weight.** Arial ships Regular and Bold only, so "light display" means Regular at display size. It still reads markedly quieter than Bold, which is the point. With `fonts: 'licensed'` a real Light may be available.

### Surfaces and roles

Every design resolves three **surfaces** and assigns each layout to one by **role**:

| Role | Used by | `report` | `kickoff` | `press` |
|---|---|---|---|---|
| `stage` | openers, dividers, statements, quotes, hero figure, match header | light | photo | navy + corner slash |
| `page` | all content layouts | light | navy | white |
| `data` | tables, charts, brackets, rankings | white | white | white |

A layout never picks its own colours. It asks for a surface by role and draws with whatever that surface provides, which is why one set of layout functions serves three designs and why a fourth would be one object in `DESIGNS`.

```js
const DESIGNS = {
  press: {
    roles: { stage: { surface: 'navy', mark: 'slash' }, page: { surface: 'paper' }, data: { surface: 'paper' } },
    type:  { display: 62, sectionTitle: 58, body: 19, displayBold: true, upper: true, lead: 0.97, ... },
    marks: { headRule: 0.05, listStyle: 'number', slashCorner: true, photo: false },
  },
};
```

---

---

## Layouts

Thirty, grouped by job, each carried in all three designs. Every one takes `notes`, which becomes real speaker notes rather than a text box on the slide. Layouts marked **stage** accept an `image` in `kickoff`.

**Openers and dividers** — *stage*, except `chapter` which is *page*

| Method | Use |
|---|---|
| `title()` | The opener. |
| `titleSplit()` | The opener with a kicker at the top: competition, venue, matchday. |
| `section()` | Numbered divider. Fixed stations, so 01 through 05 register when you page. |
| `chapter()` | The quieter break; unnumbered by default, never on photography. |
| `agenda()` | Numbered contents. |
| `closing()` | Mirrors the opener so the deck bookends. |

**Editorial**

| Method | Role | Use |
|---|---|---|
| `statement()` | stage | One short sentence at scale. |
| `quote()` | stage | Deliberately plain. No panel, no oversized quote marks. |
| `band()` | stage | Alias of `statement` with a detail line. |
| `bullets()` | page | Numbered points, plus an optional figure aside. The workhorse. |
| `twoColumn()` | page | Two lists sharing one plan, so their rows line up. |
| `explainerPair()` | page | Two or three explainers divided by hairlines. |

**Data — the Fact & Record Book register, always on white**

| Method | Use |
|---|---|
| `stats()` | Two to four figures under rules, all sharing one size and baseline. |
| `heroStat()` | One number that is the whole message. *(stage)* |
| `table()` | The record table: caps heads, one rule under the head, hairlines between rows. |
| `splitTable()` | The Record Book's OVERALL / HOME / ROAD panel table. |
| `standings()` | League table with qualification legend. |
| `chart()` | Native editable PowerPoint chart, pre-themed. |
| `chartPair()` | Two charts side by side. Use instead of a dual axis, always. |

**League modules**

| Method | Role | Use |
|---|---|---|
| `ranked()` | data | Power Rankings, 1–N with movement, two columns. |
| `sixUp()` | page | Six items divided by hairlines. Six is MLS's number on its own site. |
| `tileGrid()` | page | Flat grid of equal tiles. No hierarchy, no feature tile. |
| `crestWall()` | page | Thirty crest sockets, square and equal. |
| `formation()` | page | Team of the Matchday on a drawn pitch. |
| `bracket()` | data | Knockout progression with connectors. |
| `matchup()` | stage | Match header. |

**Comparison and time**

| Method | Role | Use |
|---|---|---|
| `timeline()` | page | Milestones along a rule. |
| `compare()` | data | Two options weighed across shared criteria. |
| `process()` | page | Numbered steps across the slide. |

**Utility**

| Method | Use |
|---|---|
| `logoWall()` | Partner marks in equal boxes, never resized to balance. |
| `blank({ role })` | Themed empty slide you lay out yourself. |

---

## Three brand rules the module enforces

These come from researching MLS's own output rather than from inference, and two of them overturned my first draft.

**1. White is the ground, navy is the anchor, red is a spark.** MLS's palette gives red no structural role: it occupies half of a small mark and appears nowhere as a large field. The crest's own doctrine makes white structural — the second half of the shield is "an open white space that brings you in and out of the MLS world". Sponsor marks are stored in white or reversed form, implying dark or photographic fields behind them. So this module will not build a red field. Inverse slides are navy; red appears as a numeral, a rule, or a small 45° mark.

**2. The slash divides, it does not decorate.** MLS: the slash "begins outside the perimeter and drives upward at a 45-degree angle". In the 2015 guideline's own ordering it sits after photography and colour, where a system puts a device applied *on top of* a base. It cuts the surface into a filled zone and a zone left deliberately empty. It is never a thin stripe under a title and never a band for its own sake.

**3. There are two registers, and mixing them reads as not-MLS.** The expressive register is web key art and competition branding: 16:9, big imagery, colour. The documentary register is the *Fact & Record Book* — black on white, ALL-CAPS abbreviated column heads (`GP`, `W-L-T`, `GF`, `GA`), thin horizontal separators, no fills, no zebra, numerals right-aligned. Data slides here default to the documentary register, because a tinted rounded shadowed table is the fastest way to look like someone else's deck.

## The rules encoded in the module

**One idea per slide.** Density was the note that killed two earlier versions of this deck. Every layout is sized so that filling it completely is uncomfortable, and lists shrink their own type rather than crowd.

**Text is measured, not estimated.** pptxgenjs cannot measure text: it writes a box and PowerPoint decides what fits. So the module carries a real Arial advance-width table and wraps text the same way PowerPoint does, greedily and word by word.

This is not a refinement. A flat average-character-width estimate over-measures a lowercase title by about 12%, which reserves a phantom second line and leaves a visible gap under every heading; and it *under*-measures a run of digits, which is how a four-character figure ends up breaking in the middle of itself and `3.28M` renders as `3.2` over `8M` — a wrong number, not just a badly set one. Three things fall out of measuring properly:

- **Balanced breaks.** Greedy wrapping fills the early lines and dumps the remainder on the last, stranding orphans. `balanceWidth()` narrows the box until one more break would appear, which spreads the breaks evenly. It never narrows past the longest single word — below that, PowerPoint breaks the word itself.
- **Type that fits its column.** Figures in `stats()` are sized so the widest of them sets on one line, and all of them then take that one size, so a row of numbers shares a size and a baseline.
- **Blocks that cannot collide.** A divider title that would push its subtitle into the footer steps down a size instead.

**`lineSpacingMultiple` multiplies the font's line height, not the point size.** Arial's natural line height is about 1.17em, so measuring with a lead of 1.5 and rendering with `lineSpacingMultiple: 1.5` makes every wrapped block ~17% taller than the space reserved for it. Render `lead / 1.17`. Getting this wrong is subtle and everywhere: it showed up as a numbered list whose numbers drifted a line out of step with their own text.

**A list's inter-item gap must beat its intra-item line gap.** At 1.0x they are the same rhythm and five points read as one paragraph with numbers scattered through it. The threshold is about 1.5x; below that the list shrinks its type until it can afford the space.

**Columns are n columns and n−1 gutters, with dividers centred in the gutters.** The obvious alternative — inset every column except the first — puts the first column flush at the margin and the rest inset from their own divider, which produces a row of identical accent marks at uneven intervals and a last column that stops short of the right margin.

**The slash is 45° and enters from off-canvas.** Rotated rectangles give an exact 45° at any aspect ratio; the ends run past the slide edge and are clipped there. It also constrains the measure: on `press` the slash occupies the top-right down to y≈3in, so stage headlines are capped at a width that clears it. The mark is fixed; the text yields.

**Charts are native.** `addChart()`, never a rendered image, so the chart stays editable, re-themes with the deck, and prints at vector resolution. A single nominal series takes ONE hue — left alone pptxgenjs colours every point differently and produces a rainbow. Gridlines are suppressed when data labels are on, or a gridline runs through the digits.

**Photography gets one even overlay, not a fake gradient.** pptxgenjs has no gradient shape fill. A stack of transparent bands faking one reads as visible banding over any smooth area of a photograph; one even darkening has no edge to give itself away.

**Red is a spark.** A rule, a numeral, a hairline, a corner mark. Never a field, never large. On dark grounds it is lifted toward white until it clears 3:1, because saturated red on navy buzzes at the shared edge.

## Fonts: the decision you have to make

Office resolves a **single family name**, not a CSS stack. There is no graceful fallback — a name the viewer lacks is substituted arbitrarily and the layout shifts.

```js
createDeck({ fonts: 'licensed' })  // MLS Tifo. Correct inside MLS.
createDeck({ fonts: 'safe' })      // Arial. Correct for anything leaving the building.
```

| Profile | Renders as | Use when |
|---|---|---|
| `licensed` | MLS Tifo Headline / Standard | Every viewer is on an MLS machine with Tifo installed. |
| `safe` | Arial | The deck goes to partners, media, sponsors, or anyone outside. |

`safe` is the default, deliberately. A deck that silently re-flows on a partner's laptop is worse than a deck in Arial.

Arial also renders true-to-width in the LibreOffice previews used for QA here, so text-fit checks are trustworthy. With `licensed`, the preview is approximate — leave about 10% slack and do not trust apparent fit.

**Never use Aptos.** Office's post-2023 default has no metric-compatible substitute and is missing from older installs, so it is unreliable at both ends.

---

## Applying the theme to an existing deck

`templates/office/mls-theme.thmx` applies the MLS colours and fonts to any Word, PowerPoint or Excel file. In PowerPoint: Design → Themes → Browse for Themes.

The six accent slots are wired to the first six **chart** colours, not to brand red and navy. Office assigns accents to chart series in order, so wiring accent1 to the brand red would make every single-series chart in the organisation red — and red is a status colour in this system.

The theme also ships an empty effect list, so shapes cannot inherit a shadow. MLS's own guidelines prohibit effects on the crest; the theme extends that instinct to everything else.

---

## Working from an existing MLS template

If MLS Brand supplies a `.potx`, prefer it over generating from scratch, and use it as the source rather than re-creating its look:

1. `python scripts/thumbnail.py template.pptx template-thumbs` for a labelled grid of every layout. Always pass the second argument — it defaults to a shared name and two templates thumbnailed in one directory silently overwrite each other.
2. Map each content section onto a layout, and vary them. Every section on the same title-and-bullets layout is the fastest way to make a deck look unconsidered.
3. Unzip, edit `ppt/slides/slideN.xml`, rezip from **inside** the directory.
4. Validate with `--original`, so the template's own pre-existing schema quirks do not read as your regressions.

Do all structural work — add, delete, reorder — before editing any slide's content. Duplicating a slide after editing clones the edited content.

---

## QA before sending

```bash
node templates/examples/build-deck.cjs out.pptx
python /mnt/skills/public/pptx/scripts/office/validate.py out.pptx
markitdown out.pptx | grep -iE "lorem|ipsum|TODO|\[insert"
python /mnt/skills/public/pptx/scripts/office/soffice.py --headless --convert-to pdf out.pptx
pdftoppm -jpeg -r 110 out.pdf slide
```

Then look at every image. In order of how often it bites:

1. Text overflow or text cut off at a box or slide edge
2. Overlapping elements
3. Content within 0.5in of a slide edge
4. Uneven gaps, or a large void under top-aligned content
5. Low-contrast text, especially light text that has drifted onto the accent field

The validator catches file-level faults PowerPoint refuses to open — including two chart faults pptxgenjs emits that every other tool accepts. Fix those in the generator, never by hand-editing packed XML.

---

## Content rules, not just visual ones

Everything in [08 Voice](08-voice-and-tone.md) and [09 Vocabulary](09-vocabulary.md) applies to slides, and slides are where it slips most, because deck copy gets written fast:

- Club names take plural verbs. "Austin FC **are** playing."
- "Franchise" is prohibited. Club, team or side.
- Figures dated 2026 need the year on the slide. Roster values change every January.
- A deck that opens by claiming the league is world-class is off-brand. Celebrate the match, be honest about the league.
