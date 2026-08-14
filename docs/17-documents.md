# Documents

Word documents are a first-class output, generated from the same tokens as everything else.

```js
const { createDoc } = require('./templates/js/mls-doc.cjs');

const doc = createDoc({ club: 'por', title: 'Season review' });
doc.cover({ eyebrow: 'Board of Governors', title: 'Season review', meta: [['Version', '1.0']] });
doc.toc();
doc.h1('Summary');
doc.p('...');
await doc.save('review.docx');
```

```bash
npm run example:doc     # builds the reference report
```

---

## Elements

| Method | Notes |
|---|---|
| `cover()` | Title page. Takes an eyebrow, subtitle, a `meta` list of key/value rows, and a legal note. No header or footer on this page. |
| `toc()` | A real Word TOC field. Populates on open, or on F9. |
| `h1() h2() h3()` | Real Word heading styles, not direct formatting. |
| `eyebrow()` | Tracked caps above a heading. |
| `p() lead()` | Body and section-opening paragraph. `p()` also takes an array of runs for inline bold and italic. |
| `bullets() numbered()` | Word list numbering, two levels. |
| `callout()` | `note`, `warning`, `danger`, `success`, `info`. Left rule plus tint. |
| `table()` | Accent header, zebra body, numeric columns right-aligned, repeating header row. |
| `stats()` | A row of three or four figures. |
| `quote()` | Pull quote with a left accent rule. |
| `divider() pageBreak() spacer()` | Structure. |
| `raw()` | Escape hatch — push raw docx-js elements. |

---

## Why headings are real styles

`h1()` emits Word's built-in `Heading 1` style, overridden with MLS type, rather than a paragraph that merely looks like a heading.

That distinction is invisible until it isn't. Real styles make the navigation pane work, make the TOC field populate, make outline level and accessibility tagging correct, and let a recipient restyle the whole document from the Styles gallery. A document full of hand-formatted pseudo-headings is one nobody can maintain.

---

## The type scale is different from the slide scale

A document is read at arm's length. Reusing slide sizes makes every heading shout.

| Role | Document | Slide |
|---|---|---|
| Title | 26pt | 36pt |
| H1 | 18pt | — |
| Body | 11pt | 16pt |
| Caption | 9pt | 11pt |
| Hero figure | 30pt | 66pt |

Page is US Letter with 1in margins. **docx-js defaults to A4**, so Letter is stated explicitly in the section properties — an easy and invisible thing to get wrong.

---

## Tables

Column widths are set on the table **and** on every cell, both in DXA twips. Percentage widths break in Google Docs, which matters because MLS documents get shared as Google Docs constantly. The last column absorbs the rounding so the widths always sum exactly to the text width.

`numericFrom` (default 1) marks where the numeric columns begin; those are right-aligned. Header rows carry `tableHeader: true`, so they repeat when a table spans a page break.

Shading uses `ShadingType.CLEAR`. `SOLID` renders black — a genuinely common way to ship a document with black table cells.

---

## Printing HTML instead

For a document that starts as a web page — a match programme, a board pack, an appendix generated from live data — `css/print.css` is already in the bundle and handles the medium change:

- **Dark mode is forced off.** A dark background either wastes a cartridge or is dropped by the driver, taking the light text with it.
- **The scale moves to points.** A 3rem heading is 36pt on paper, which is a poster.
- **Large filled areas drop to outlines**, and the slash and duotone treatments are suppressed.
- **The accent survives**, with `print-color-adjust: exact`, because it is what makes the page MLS's.
- **Pagination is handled**: headings never orphan at the foot of a page, table headers repeat, cards and scorelines do not split.
- **Link destinations are printed** after the link text in prose, since a printed link is otherwise a dead end.

Measure caps at 88ch in print rather than 68ch on screen — a wider column is tolerable on paper, where the eye has physical landmarks.

---

## Fonts

Same decision as decks, same reasoning. See [16 Presentations](16-presentations.md#fonts-the-decision-you-have-to-make).

```js
createDoc({ fonts: 'licensed' })  // MLS Tifo, inside MLS
createDoc({ fonts: 'safe' })      // Arial, default, for anything external
```

`templates/office/mls-theme.thmx` also applies to Word: Design → Themes.

---

## QA before sending

```bash
python /mnt/skills/public/docx/scripts/office/validate.py out.docx
python /mnt/skills/public/docx/scripts/office/soffice.py --headless --convert-to pdf out.docx
pdftoppm -jpeg -r 100 out.pdf page
```

Then read every page image. Watch for tables running past the right margin, callouts splitting across a page break, heading spacing that collapses after an edit, and the TOC showing stale page numbers — it does not refresh until Word opens the file.

---

## Content rules

[10 Editorial style](10-editorial-style.md) governs documents specifically: scoreline formatting, date formats, player-name reference order, the mandatory diacritics, sentence case for news headlines and title case for features, and `MLS'` rather than `MLS's`.

Two that catch people in long documents:

- **Club names take plural verbs**, throughout, including in tables and captions.
- **Roster figures are 2026-specific.** Date-stamp them in the document or they will be quoted back at you in 2028.
