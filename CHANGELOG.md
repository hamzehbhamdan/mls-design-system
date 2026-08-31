# Changelog

## 2.3.0 — 2026-08-30

The installer meets real asset packs, and the marks stop being hypothetical.

### Added
- **Light and dark variants.** A crest is drawn *for* a ground. The installer detects `LTBG`/`DKBG`, `1c_white`/`1c_black`, `OneColor_White`, `light bg`/`dark bg` and `mono-rev`, keeps one mark per ground, and the deck asks for the ground it is drawing on. Columbus is the club that proves the point: its light-background crest has a black wordmark that disappears on navy, and its reversed twin has a white one that disappears on white. Both are genuinely required. Most clubs ship one full-colour crest with its own keyline, and that one file still serves both grounds.
- **Aspect ratios are honoured.** The installer records pixel dimensions and `crest()` centres each mark in its square socket at its own aspect. The Red Bulls crest is landscape (2561×2085) and San Diego's is portrait (1829×2400); both were being stretched to square.
- **A `properties` bucket** for MLS NEXT, MLS NEXT Cup and MLS NEXT Fest, reachable as `deck.propertyMark(key, dark)` and as `.mls-mark[data-mark="next"]` on the web. MLS NEXT's full-colour mark has a near-black shield that goes muddy on navy, so the dark ground takes the cyan one-colour version rather than the white one — legible either way, but only one of them is still MLS NEXT.
- **A `nextClubs` bucket** for MLS NEXT member clubs, recorded and wired into no layout. They are third-party youth organisations whose names collide with real MLS clubs — "Dallas Hornets", "Houston Rangers", "LA Bulls" — so they are claimed by folder path before club scoring ever runs.
- **Deck-sized rasters.** A crest is never drawn above about 2.5in on a 13.33in slide, so each mark gets a 900px `@deck.png` beside the untouched original. The reference decks went from 10.3 MB to 6.6 MB with no visible change.
- The installer takes **several source folders at once** and recurses into all of them.
- **`npm run package`** builds the release zip. Marks and rendered decks are excluded by default, mirroring what git tracks; `--with-marks --with-decks` includes them for private use, and says so on the way out. MLS NEXT member-club marks need `--with-next-clubs` on top of that — they are third-party, wired into no layout, and three megabytes. Whatever a build leaves out is stripped from the manifest it ships, so the index always describes what is actually in the archive.

### Fixed, second pass
- **A missing deck copy no longer hides a mark.** `@deck.png` is a derived file and an archive can legitimately ship without it; `markOf()` now falls back to the full-resolution original instead of returning null and drawing a lettered socket over a crest that exists.

### The league became a theme value
- **`data-club="mls"`** is now a real theme that restores the league colours, and `createDeck({ club: 'mls' })` (or `'league'`) works the same way. `:root` was already MLS, so nothing rendered differently before — but MLS was the one option in thirty-one you got by *removing* an attribute rather than setting it, which made it the option most likely to be dropped from a theme switcher or a picker. The axis is now thirty-one values set identically, and it restores the league inside a club-themed subtree, which removing the attribute cannot do.
- **`claude/SETUP.md`** carries the paste-ready onboarding copy for Claude Design's setup form, both free-text fields verbatim, so re-onboarding a new workspace does not mean retyping it from memory and losing the parts that matter.
- **`claude/CLAUDE.md` §2b** documents the tweak axes the system actually has — theme, appearance, deck register, surface, type, density — with the rule that a generated artefact exposes them rather than baking one setting in, and that the theme axis always includes MLS, first.

### Web layer
- **A crest is keyed on its own `data-tricode`, not on an ancestor's `data-club`.** Those are different things: a scoreline carries one `data-club` and two crests, so the old selector painted the away side with the home club's mark. `data-club` still themes a crest that does not name a team.
- `.mls-crest` now sets `background-size: contain` and `background-origin: content-box`, so an installed mark is drawn inside the 4×-X clear space at its own aspect rather than across the whole box.
- The lettered socket switches itself off where a mark exists, and stays on wherever an author writes `data-placeholder` — "no asset here" is a statement worth being able to make.
- `.mls-mark[data-mark="next"]` carries the league property marks, with the same dark-mode swap.

### Fixed
- **macOS resource forks are skipped.** Archives zipped on a Mac carry an AppleDouble fork beside every file — `__MACOSX/._POR.png`, four kilobytes, a `.png` extension and a perfect name match. Every club would have installed one instead of its crest. `npm run verify` now also fails any mark under 4 KB.
- **Size is measured, not read off the filename.** In the official pack `NSH_Logo_PRI_FC_RGB_2160x2160.png` is 800×800 and `ATL_…_2160x2160.png` is 2200×2200. The installer reads each file's header.
- **`CFM` → `mtl`.** The pack names CF Montréal's files `CFM`, the tricode is `MTL`, and tokenising "CF Montréal" strips the accent to "montral", so nothing matched. An alias table now carries that and a dozen other common abbreviations.
- **The photo placeholder no longer collides with the deck mark.** Both wanted the bottom-right corner; the label moves to the crest's left, on its centre line.
- **EPS, AI and PDF are ignored.** Without Ghostscript, ImageMagick returns only the 416×190 indexed-colour TIFF preview embedded in them, and installing that in place of the shipped PNG is a silent downgrade.

### Changed
- **`crestWall()` is a data slide in all three designs**, where it was a page slide. It is the one layout whose surface is not ours to choose: every club crest was drawn to sit on white, and the burgundy, the darker greens and the darker navies lose their outline against a dark ground. On paper, all thirty read.
- `npm run verify` checks reversed variants, deck copies, properties and recorded dimensions, and fails a mark that has none rather than letting it be drawn square.

## 2.2.0 — 2026-08-15

Sourcing for the marks. Still none ship.

### Added
- **`assets/logo/SOURCES.md`** — where to get the marks, best source first. The official pack is a public Box folder linked from MLS's own media-resources page, and it is the only source that carries vector, the mono and reversed variants, the gradient variant and the league crest.
- **`scripts/fetch-logos.sh`** (`npm run logos:fetch`) — downloads all thirty club crests from `images.mlssoccer.com`, the CDN behind mlssoccer.com/clubs, and installs them in one step. It runs on your machine, not in this repository.

### Known limits of the CDN route
It gives you web PNGs, one colourway each. It does **not** give you the league crest — that is not on the clubs page — nor any vector, mono, reversed or gradient variant. Use it to get moving; overwrite with the official pack via `npm run logos -- <folder> --force`.


## 2.1.0 — 2026-08-13

Marks become installable. Still none ship: the MLS crest and the club crests are trademarks of Major League Soccer, L.L.C. and its member clubs, and this repository does not redistribute them.

### Added
- **`scripts/install-logos.mjs`** (`npm run logos -- <folder>`). Point it at whatever folder the marks arrive in and it matches every file to a club or a league variant, normalises them into `assets/logo/`, rasterises SVG to PNG for the Office layer, writes `assets/logo/manifest.json` and prints a coverage report. It does not care about naming: `MLS crest logo RGB - Portland Timbers.svg`, `por.png` and `Timbers logo (1).png` all match. `--dry` reports without writing.
- Marks appear automatically once installed: the deck mark bottom-right on every stage slide (club crest when the deck is club-themed, else the league crest), all thirty in `crestWall()`, and both sides of `matchup()` when each side is given a `club:`.
- `dist/mls.crests.css`, generated from the manifest, wires `.mls-crest` per `data-club` for the web layer.
- `deck.crestOn(slide, { slug, x, y, size })` for placing a mark by hand.

### Decisions worth knowing
- **A missing club crest gives a lettered socket, never the league crest.** Thirty MLS crests standing in for thirty clubs reads as a bug; thirty sockets reads as a decision. A partial install is a supported state, and nothing needs editing to get there.
- **Ambiguous filenames are skipped, not guessed.** A file that matches two clubs equally well is reported rather than installed, because a wrong crest is worse than a missing one.
- **PNG for decks, SVG for the web.** PowerPoint's SVG support is inconsistent across versions, so a vector-only mark vanishes from every deck while still looking correct in a browser. `npm run verify` now fails on any club that is SVG-only rather than letting that pass quietly.
- Dark grounds take the reversed one-colour league variant when it is installed; light grounds take the primary.
- `assets/logo/` is gitignored (except its README), so an installed set is never committed by accident.

### Verify
243 checks. The new ones confirm that every manifest entry resolves to a file that exists and that every club key is a real slug — a manifest pointing at a deleted file is a broken deck that fails silently at render time. **Zero marks installed is the expected state and never fails.**


## 2.0.0 — 2026-08-13

**Breaking.** The deck's five-ground system is replaced by three designs. `createDeck({ surface })` becomes `createDeck({ design })`, and `palette()` becomes `theme()`.

### Why
Two rounds of review landed on the same word: dense. The five-ground system had grown a spine panel, a slash divider, a field and a plain ground, and every layout had opinions about which to use — so slides accumulated furniture. Six directions were mocked up and reviewed; four were liked, and all four were sparse and type-led. These three are built from those four.

### Three designs
Not three colour schemes. Three ideas about what a slide is, each carried across all 30 layouts.

| | `report` | `kickoff` | `press` *(default)* |
|---|---|---|---|
| Openers | light, regular weight | photography | navy, uppercase, 45° corner slash |
| Content | light | navy | white paper |
| Data | white paper | white paper | white paper |
| Needs imagery | no | **yes** | no |

- **Surfaces and roles.** Every design resolves three surfaces (`page`, `paper`, `navy`) and maps each layout to one by role (`stage`, `page`, `data`). A layout never picks its own colours, so one set of layout functions serves three designs and a fourth is one object in `DESIGNS`.
- **Photography is a first-class slot.** `kickoff` openers take `image:` and render it full-bleed under an even scrim. Without one they render a labelled placeholder frame, because no MLS imagery ships here and none should.
- **Numbered lists replace bullets everywhere.** Numbers read as an argument; dots read as a dump.
- The spine panel, the slash-divider ground and the tinted card grids are gone.

### Fixed
- **`lineSpacingMultiple` multiplies the font's line height (~1.17em), not the point size.** Measuring with a lead of 1.5 and rendering with `lineSpacingMultiple: 1.5` made every wrapped block ~17% taller than the space reserved for it. All 22 call sites now render `lead / 1.17`. The visible symptom was a numbered list whose numbers drifted a line out of step with their own text.
- **A list's inter-item gap must beat its intra-item line gap.** At parity, five points read as one paragraph with numbers scattered through it. The threshold is ~1.5x; below that the list now shrinks its own type rather than crowd.
- **Column grids.** Insetting every column except the first put column one flush at the margin and the rest inset from their own divider — a row of identical accent marks at uneven intervals and a last column stopping short of the right margin. Now n columns, n−1 gutters, dividers centred in the gutters.
- **The corner slash collided with headlines** on three `press` openers. The slash is fixed; stage headlines are now capped at a measure that clears it.
- **The pitch centre circle was chopped into five arcs** by the knockout plates behind player names. Replaced with a centre spot, which no label can cross.
- Photography scrim was eight transparent bands faking a gradient, which read as eight stripes. One even overlay has no edge to give itself away.
- `titleSplit()` printed the eyebrow twice — once as the top kicker, once above the headline — whenever no explicit kicker was given.
- A three-line divider title pushed its subtitle into the footer band; the size now steps down instead.
- `compare()` did not close its last row, unlike every other table; `chapter()` carried a footer the other dividers do not; `matchup()` centred 5% lower than every other hero slide.
- Orphan last lines in `sixUp()`, `process()` and `timeline()` headings.
- `npm run verify` is at 242 checks, including a contrast audit of 3 designs x 3 surfaces x 31 palettes and a check that every design maps all three roles.

### Migration
```js
createDeck({ surface: 'light' })  ->  createDeck({ design: 'report' })
createDeck({ surface: 'dark' })   ->  createDeck({ design: 'press' })
palette({ club })                 ->  theme({ club, design })
```
Layout call signatures are unchanged except `crestWall({ clubs })`, `table()` (the `style` option is gone — data is always the Record register) and `blank({ role })`.


## 1.4.0 — 2026-08-13

The deck gets a dark register, and it is now the default.

### Why
The previous version was derived from the 2014 crest doctrine and the printed *Fact & Record Book*. That is a real part of the brand, but it is the league's **print** voice, and it produced a deck of hard navy-against-white splits.

MLS's actual screen presence is dark. mlssoccer.com serves the reversed one-colour crest as its header mark — the asset is named `MLS_CREST_1C_RGB_WHI_NO_BKGD`, and you only ship the white crest as a site logo when the surface behind it is dark. Season Pass, the app and the broadcast package follow.

### Changed
- `createDeck({ surface })` takes `'dark'` (default) or `'light'`. Documents are unchanged and always light; paper is white.
- The dark register derives three tonal steps from the field colour — ground, panel, card — so structure comes from tone rather than from a hard two-value contrast. Club takeovers inherit it: Seattle's deck is three values of Pacific Blue, Columbus's three values of black.
- The 45° slash is kept. It is the brand's own device — Athletics designed it as "a 45-degree slash representing the sport's upward trajectory in North America" — but cutting a lighter navy against a darker one is the same geometry at a fraction of the harshness of navy against white.
- Red and navy are kept; both are official (`#E2231A`, `#001F5B`). They are close in luminance and buzz at a shared edge, so on a dark ground the spark is lifted toward white until it clears 3:1 against its surface, and red stays small — a rule, a numeral, a hairline. Never a field.
- The title and closing wedges are now a lift of the slide's own colour rather than a mix from white, which was reading as a grey-blue of a different hue.

### Fixed
- **Muted and subtle steps now solve for contrast instead of using a fixed mix.** A 0.28 mix toward the ground clears 4.5:1 on navy and lands at 4.42:1 on Portland green. `fitRatio()` nudges until it clears, so the scale adapts to whatever colour it is built on.
- Pre-existing: the light register's caption colour was 4.32:1 on white. 11pt captions are small text and need 4.5:1; it is now derived rather than taken from the token verbatim.
- `--club=por` style flags were silently ignored by the example builder, which only accepted `--club por`, so a mis-typed flag rendered the default deck without complaint. Both forms now work.
- `npm run verify` grew to 238 checks, including a full contrast audit of both surfaces across all 31 palettes.


## 1.3.0 — 2026-08-12

The deck is recomposed. 1.2.0 had the right rules and the wrong result: reading "documentary register" as *austere* produced wireframes — a dead bottom third on nearly every slide, floating rules anchoring nothing, and no navy at all on content slides, so the deck read as a generic consulting template.

### Composition
- **Five grounds.** Every layout now sits on one of `spine` (full-bleed navy panel carrying the framing, detail on white beside it), `open` (white, opened by a heavy navy rule), `field` (full navy), `cut` (the 45° slash) or `plain`. The spine applies the crest's own two-halves logic as the slide grid.
- **Content fills the canvas.** Blocks take the full height between header and footer and are centred in it, instead of top-aligning and leaving the bottom third empty.
- **Navy is present on most slides**, not only on openers.
- Type scale raised throughout: body 17pt, titles 38pt, hero stat 200pt. A 36pt title on a 13.3in canvas is a caption.
- `formation()` rebuilt on a drawn pitch — touchlines, halfway line, centre circle, both penalty areas — with player names knocking out the markings behind them, as broadcast team sheets do.
- `process()` step numbers are square marks rather than full-width bars that were ~80% empty navy.
- `matchup()`, `timeline()`, `statement()`, `title()`, `titleSplit()` and `chapter()` rebuilt as measured, centred groups rather than fixed offsets.
- Section dividers keep fixed stations for the numeral, rule and title, so paging from `01` to `05` no longer makes them jump.

### Club takeovers were the wrong colour
A club deck filled its grounds with the club's dark-mode **accent** — a colour lightened until it reads *on* dark. Columbus's is `#FEDD00`, so a Columbus deck was full-bleed bright gold, which breaks the league's own rule that the anchor is dark and the bright colour is a spark.

New `--mls-club-field`, `--mls-club-on-field` and `--mls-club-spark-on-field` tokens resolve to the darkest published club colour that can carry white text, with MLS navy as the fallback. Columbus is now black and gold, Seattle Pacific Blue and Rave Green, Portland Ponderosa Green and Timbers Gold, LAFC black and California Gold. Enforced at build time and checked by `npm run verify`, which grew from 206 to 236 checks.

### Text metrics
The flat 0.60em-per-character estimate is replaced by a real Arial advance-width table and greedy word wrapping that matches PowerPoint's own. This was the single root cause behind most of the placement defects below.

- `balanceWidth()` evens the rag and removes orphan last lines, floored at the longest word so PowerPoint cannot break a word.
- `fitOneLine()` sizes figures to their column; `stats()` then applies one size across the row so figures share a size and a baseline.
- Blocks that would collide step down a size instead.

### Fixed
- `stats()` figures wrapped mid-number: `3.28M` rendered as `3.2` over `8M`.
- `standings()` column widths summed past the content width, clipping the PTS column to a single digit. `table()` now normalises any `colW` to the content width.
- `splitTable()` gave every column in a panel equal width, so `W-L-T` records broke mid-value (`22-16-` / `10`). Widths are now weighted by what each head has to hold.
- Bold display titles were measured with regular-weight metrics, so `section()` and `chapter()` subtitles were drawn on top of their own titles.
- Section-divider titles were measured at the bottom of the block, where the slash leaves the least room, breaking words like `Comparison` mid-word. Dividers are now top-anchored, where the zone is widest.
- `formation()` player names were struck through by the penalty-area lines and the team sheet overlapped itself.
- `spine()` figure captions ran under the running foot; the framing group left a hole in the middle of the panel.
- The running foot sat on the navy spine in light-mode grey. It now sits on the white zone.
- `compare()` header bar showed a white seam splitting it.
- Chart gridlines ran through data labels; gridlines are suppressed when labels are shown.
- Bullet markers were PowerPoint's default raised dots; now squares, closer to the Record Book register.
- `twoColumn()` navy caps floated free of the lists they label, and the columns had no base.
- `explainerPair()` cards had a hole between title and body and an empty bottom fifth.
- `logoWall()` sizes every mark to one size so a two-line name cannot break the row's baseline.

## 1.2.0 — 2026-08-12

The deck layer grows from 9 layouts to 30, and the brand behaviour is corrected against research into MLS's own published output.

### Corrected, based on evidence rather than inference
- **Red is a spark, not a field.** The previous title and closing slides were roughly a third red. MLS's palette gives red no structural role, so inverse slides are now navy and red appears only as a numeral, a rule or a small 45° mark.
- **The slash divides rather than decorates.** It now cuts the surface into a filled zone and a zone left deliberately empty, which is MLS's own doctrine, instead of being a band.
- **Data slides moved to the documentary register.** The Fact & Record Book is black on white with ALL-CAPS abbreviated column heads, thin rules, no fills and no zebra. `table()` defaults to `style: 'record'`; the tinted variant is still available as `'filled'`.

### 21 new layouts
`titleSplit chapter agenda statement explainerPair band heroStat splitTable standings chartPair ranked sixUp tileGrid crestWall formation bracket matchup timeline compare process logoWall`

### Fixed
- Run-level text transparency replaced with pre-mixed solid colours. OOXML expresses it as `<a:alpha>`; older PowerPoint ignores it and LibreOffice truncated runs mid-word.
- A single nominal chart series now takes one hue instead of a per-point rainbow, and decimal values keep their decimal in data labels.
- Bracket gained connectors, so it reads as a progression rather than four columns of boxes.
- Split-table panel headings are a merged row inside the table, so they cannot drift off the columns they label.
- Line-count estimation widened and made to round up near a line boundary, after two section titles wrapped and collided with their subtitles.
- Formation, standings note, and bench list no longer collide with the footer.

## 1.1.0 — 2026-08-12

Documents and decks become first-class outputs rather than exports of the web layer.

### PowerPoint
- `templates/js/mls-deck.cjs` — nine layouts (title, section, bullets, stats, two-column, chart, table, quote, closing) on pptxgenjs, reading tokens from `dist/` at require time
- Club theming via one option; the 45° slash rendered as a compositional field with a true 45° edge, established by rendering all four flip orientations and probing pixels
- Titles estimate their own rendered line count and return where body content may safely start, removing the most common defect in generated decks
- `safeW(y)` keeps text off the diagonal, where light text would drop to about 3:1
- Native editable charts with the palette, labels and quiet frame pre-applied; real speaker notes

### Word
- `templates/js/mls-doc.cjs` — cover, TOC field, real Word heading styles, body, lists, callouts, tables, stat rows, quotes on docx-js
- US Letter stated explicitly (docx-js defaults to A4), DXA table widths on both table and cells so they survive Google Docs, `ShadingType.CLEAR` throughout

### Charts
- Eight-hue categorical palette derived by search in `scripts/gen_chart_palette.mjs` and validated against the six categorical checks; worst adjacent pair 16.2 light and 16.3 dark under simulated protanopia and deuteranopia, against a target of 8
- Light and dark are different steps of the same hues, not a flip
- Sequential and diverging ramps, with a neutral grey diverging midpoint

### Office and print
- `templates/office/mls-theme.thmx` applies MLS colour and type to any Word, PowerPoint or Excel file; the six accent slots are the first six chart colours, deliberately not brand red
- `css/print.css` — paged media, forced light, point-based scale, pagination control, printed link destinations

### Also
- `--mls-club-accent-light` and `--mls-club-accent-dark` exposed unconditionally, so an inverse surface on a light page can reach the dark accent. LAFC is the case that proves it: its light accent is black, which is invisible on navy.
- Point-based type scales for print and slides, plus page and slide geometry tokens
- Three new chapters: presentations, documents, charts
- Verify grew to 206 checks, including theme-accent drift and chart-palette contrast

## 1.0.0 — 2026-08-10

First release. Compiled from public sources in August 2026.

### Foundations
- Token source of truth in W3C DTCG format; 242 resolved tokens
- Six perceptually-even OKLCH ramps, neutrals carrying a navy cast borrowed from the league navy
- Three-tier colour architecture: primitive → brand → semantic, with `accent` as a themeable slot
- Full light and dark schemes, both first-class
- Type scale named by job rather than size, fluid display sizes
- 4px space grid, tight radii, fast motion with a signature `drive` easing

### Club theming
- All 30 clubs themeable via `data-club`
- Two values per club: the true brand colour (`--mls-club-primary`, never altered) and a contrast-corrected UI accent
- 24 of 30 accents auto-corrected in OKLab to clear 3.2:1 on their background and 4.5:1 for their label
- Achromatic primaries (LAFC, D.C. United) promoted to a chromatic club colour rather than lightened into grey
- Explicit confidence rating and disagreement notes per club; two colours left `null` rather than guessed

### Components
Button, card, crest slot, scoreline, standings table, stat and statbar, badge and form line, header/nav/tabs, form controls, alert, empty state, skeleton. Plain CSS on semantic HTML, state in ARIA and `data-` attributes.

### Graphic devices
The Slash and The Corners, both named in MLS's own partner guidelines, plus duotone photography and the diagonal hatch. All inherit the club accent.

### Documentation
Sixteen chapters covering the visual system, the verbal system (voice, vocabulary, editorial style, inclusive language), accessibility, the 2027 calendar transition, and a full sourcing-and-confidence audit.

### Tooling
- `npm run build` — emits CSS, SCSS, JS, TypeScript declarations, JSON, a Tailwind preset, club themes, and the generated club reference table
- `npm run verify` — 175 checks: token resolution, undefined CSS variables, WCAG contrast in both schemes, all 30 club accents, club data integrity, `@dsCard` markers, doc presence
- GitHub Actions workflow gating on both, including a check that `dist/` has not drifted from its sources

### Known gaps
League colour values, the live mlssoccer.com font stack, and any post-2015 MLS brand guidelines could not be verified. See `docs/15-sourcing-and-confidence.md`.
