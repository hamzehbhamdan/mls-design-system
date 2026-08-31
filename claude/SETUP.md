# Onboarding this system into Claude Design

Claude Design's setup form has two free-text fields and a set of upload slots.
The exact copy for both fields is below, ready to paste. It is kept in the repo
rather than only in someone's browser history, because re-onboarding happens
(a new workspace, a colleague, a re-upload) and retyping it from memory loses
the parts that matter.

Where the copy and `CLAUDE.md` disagree, `CLAUDE.md` wins: it is the operative
brief and it is read on every generation, whereas these fields are read once at
setup.

---

## Upload slots

Attach the **project folder** under "Link code from your computer", not just a
zip under "Add fonts, logos and assets". The form's own guidance is that code
and designs work best, and the folder is what gets `claude/CLAUDE.md`,
`dist/mls.css` and `docs/` read properly. Delete `examples-out/` first: twenty
megabytes of rendered decks teach nothing the code does not.

A GitHub link is the weaker source here. `.gitignore` excludes
`assets/logo/`, so a clone gives a system with lettered sockets instead of the
thirty installed crests.

---

## Field 1 — Company name and blurb

```
MLS Design System: an unofficial brand reference and design system for Major
League Soccer, covering web, presentations and documents from one set of
tokens. Any layout re-themes to any of 31 themes (MLS itself plus all 30
clubs) with a single data-club attribute, contrast-corrected so text stays
legible in light and dark. Not an official MLS product: compiled from public
sources, and every value carries a confidence rating.
```

---

## Field 2 — Any other notes?

```
Start with claude/CLAUDE.md. It is written for exactly this purpose and is the
compressed version of the 19 chapters in docs/. dist/mls.css is the entire web
layer in one file.

TWEAKS. Always expose the design's variables as tweaks rather than baking one
setting in. See claude/CLAUDE.md section 2b for the axes: theme, appearance,
deck register, surface, type, density. Expose every axis the thing actually
has, not just the theme.

The theme axis is 31 values, not 30: data-club="mls" is a real theme that
restores the league colours, and it is always included and always listed first.
A club picker offering only the 30 clubs has dropped the league, which is the
correct theme for all league-level work. The deck and document layers take the
same value: club: 'mls'.

A tweak must be wired to the token or attribute it names. If flipping it would
not change the output, do not offer it.

NON-NEGOTIABLES.
- Reference --mls-color-accent-base, never the league red directly. Hard-coding
  red breaks all 31 themes at once.
- Never draw the MLS crest or a club crest, not as SVG, not as CSS, not
  approximately. .mls-crest is a socket and marks install separately. This is a
  trademark boundary, not a style preference.
- Every diagonal is exactly 45 degrees. The slash is a documented brand element
  with a stated meaning; 30 or 60 is off-brand.
- Red is a spark, never a field: a rule, a numeral, a hairline. On dark grounds
  lift it toward white until it clears 3:1, because saturated red on navy buzzes
  at the shared edge.
- Radius stays 2-6px. Where a shape needs personality use .mls-notch, a clipped
  45-degree corner, not a bigger radius.
- Tabular numerals on any figure in a column or a clock (.mls-numeric).
- Club names take plural verbs: "Austin FC are playing." Suffix placement is a
  lookup table in data/clubs.json, not a pattern.
- Never invent a hex, a font name or a rule. A null in data/clubs.json is null
  because no trustworthy source exists.

TYPOGRAPHY. Stacks name the licensed originals (MLS Tifo, DIN Next Pro) first
and fall back to Inter and Archivo. Do not strip the licensed names and do not
substitute anything else.

DECKS. templates/js/mls-deck.cjs, 30 layouts across three designs (report,
kickoff, press; press is the default). One idea per slide. Density was the note
that killed two earlier versions.

BUILD. Everything in dist/ is generated from tokens/tokens.json and
data/clubs.json by npm run build. npm run verify runs 243 checks including a
full WCAG contrast audit across all 30 club themes. Edit the sources, never
dist/.

MARKS. Installed in assets/logo/ and indexed by manifest.json: all 30 club
crests, the league crest, and the MLS NEXT property marks. They are trademarked
and not redistributable. See NOTICE.md.
```
