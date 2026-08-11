# Sourcing and confidence

Compiled August 2026 from public sources. This chapter exists so that anyone using this system knows exactly how much weight each claim can carry — because a confident wrong answer about a brand is more expensive than an honest gap.

## Tiers

| Tier | Meaning |
|---|---|
| **Official** | MLS, an MLS club, or the design agency that made the work |
| **Official, dated** | Authentic MLS material, but from 2015 and not currently hosted by MLS |
| **Club, not league** | Atlanta United's published style guide. Thorough and covers league-wide terminology, but it is *a club's* guide |
| **Observed** | A pattern verified across multiple pieces of MLS's own output. Not a published rule |
| **Crowd** | Third-party colour aggregators. No brand-guide citation |
| **Inferred** | Reasoning or design judgment. Explicitly not sourced |

---

## Solidly official

- Crest authorship (Athletics + Berliner Benson), launch date (18 September 2014), and rollout for the 2015 season
- Element-by-element crest symbolism: perimeter, 45° slash, three stars = For Club / For Country / For Community, the open right half, the two-halves-of-a-match split
- The club-colourable system, described by MLS as "flexible" and by Athletics as "a flexible template"
- The champions marking system: silver crest for the defending champion, gold star at five titles
- **MLS Tifo** (F37 Foundry) as the current brand typeface — Headline / Standard / Micro, four variable axes, one file
- **MLS Streets / Stands / Pitch** (Rick Banks, F37, 2020) — the tri-line kit face, its Penrose Triangle concept, and its derivation from the crest's three stars
- The full 2027 Sprint Season structure and the 2027–28 calendar
- Supporters' Shield retention and all qualification pathways
- Both 2026 marketing campaigns
- The Garber → Berg succession, dates, and Berg's stated priorities
- Soccer For All mission statement and protected-category list
- Fan Code of Conduct text
- 2026 roster rules and all dollar figures
- Competition names and the Apple TV / Season Pass change

## Official, but 2015-vintage and third-party-hosted

From *MLS Partner Brand Guidelines v1.0*, dated 8 January 2015 — authentic MLS material, surfaced through a third-party host, not currently published by MLS:

- Clear space = 4× the X measurement
- Minimum print size = 0.50 inches
- White-only trap
- The nine misuse prohibitions
- **DIN Next Pro** as the (then) brand typeface
- **"The Slash" and "The Corners"** named as graphic-system elements

**This is the single most valuable under-documented finding in the research, and also the one most in need of re-verification.** Eleven years is a long time for a brand guideline.

## Club, not league

Atlanta United's public style guide. Used where no league equivalent exists, and always labelled:

- match/pitch/kit preferences, and the "franchise" prohibition
- The plural-verb rule for club names
- Player-name reference order and diacritic requirement
- Date/time formats, scoreline ordering, headline case
- Social platform rules
- Latino vs Hispanic terminology and Spanish-language terms for Black communities

**Do not present any of this to stakeholders as MLS policy.**

## Observed

Verified across MLS's own output, but not published as a rule:

- The three editorial registers and their distinct characteristics
- The fans/supporters two-tier distinction
- The hype-attaches-to-moments pattern
- Loanword permissiveness
- Press-release dateline and boilerplate conventions
- Capitalisation patterns for roster mechanics and competition stages
- `MLS'` not `MLS's`

---

## Weak, and how weak

### League colours — LOW CONFIDENCE

`#E2231A` (PMS 485 C) and `#001F5B` (PMS 281 C).

**For:** the pairing is the canonical flag-red and flag-navy, exactly consistent with MLS's stated intent that the crest colours honour both nations. The CMYK and RGB breakdowns are correct conversions of those chips, so the set is internally coherent and professionally plausible.

**Against:** a single aggregator carries them, citing "MLS website" and Wikipedia — not a brand guideline. No independent corroboration. Five other colour references have **no MLS league-level entry at all**, which suggests the palette genuinely is not documented in public rather than that it was missed.

**Do not label these "official" anywhere.**

### Club colours — mixed

Every club in `data/clubs.json` carries an explicit `confidence` field and a `notes` field naming the specific disagreement. Summary:

- **High (9 clubs)** — corroborated by the club's own site or launch release plus an independent source
- **Medium (11)** — multiple third parties agree, no club-published hex found
- **Low (9)** — sources disagree materially. Worst: New York Red Bulls (four different reds, two yellows), D.C. United red (three-way split), Toronto FC red (unresolved), LA Galaxy gold (five values), Minnesota United (no two sources agree on anything)
- **Unverified (1)** — San Diego FC. The club has publicly *named* Chrome and Azul but published no hex for either, and defines Chrome as reflective rather than as a fixed hue

Three values are `null` rather than guessed: Charlotte's silver, and St. Louis CITY SC's Energy Yellow and Arch Steel Grey. All three are officially *named* by their clubs with no published value.

**A systematic split worth knowing about:** for roughly a third of the league, the Pantone-derived value and the web-derived value differ slightly (Chicago `#D50032` vs `#FF0000`; New England `#C8102E` vs `#CE0E2D`). Neither is wrong — it is print versus screen. `data/clubs.json` carries the **web** value. For print, request the club's Pantone build.

### Reported but not confirmed

The five-division / single-table 2027–28 restructure. See [14](14-the-2027-transition.md).

---

## Gaps that could not be closed

1. **Official MLS league colour values.** The authentic guidelines' palette pages exist but do not render in the accessible version.
2. **The live mlssoccer.com CSS font stack.** Not retrievable; markdown conversion strips stylesheets. Given that MLS Tifo was commissioned explicitly as a variable web font delivered as a single file with a Micro optical size — a spec written for a website — self-hosted Tifo woff2 with sans-serif fallbacks is overwhelmingly likely, but **it is inference, not verification.**
3. **A typeface name for the "MLS" lettermark inside the crest.** Almost certainly custom lettering. Do not assert a font.
4. **Any current (post-2015) MLS brand guidelines document.**
5. **Any league-level published editorial style guide.** It does not exist publicly.
6. **Any league-level published inclusive-language guidance.** Same.
7. **Social-media voice.** X, Instagram, Facebook, TikTok and Bluesky all block automated fetching. The characterisation in [08](08-voice-and-tone.md) rests on the YouTube bio, a handful of captions and a club's published platform rules. **If social voice matters to your project, sample it manually.**

## Inferred — my judgment, not sourced

Flagged so it can be argued with:

- That MLS Tifo has superseded DIN Next Pro. No document states the changeover.
- Every open-source font substitute recommendation in [04](04-typography.md).
- The entire token architecture, scale, spacing, motion and component layer. This is design work built *on* the research, not extracted from MLS.
- The navy-cast neutral ramp.
- The contrast-correction approach, and the achromatic-promotion rule for LAFC and D.C. United.
- The reconciliation of the winner-first vs home-first scoreline conflict.
- The recommendation to standardise on *supporters' group* with the apostrophe.

## How to correct this

Two closable gaps, both trivial outside a research sandbox: open mlssoccer.com in a browser, read the computed `font-family` on a heading and body text and the woff2 filenames in the Network tab; and sample the crest's red and navy from the official SVG's `fill` attributes.

Everything else needs MLS Brand.

Correcting `tokens/tokens.json` or `data/clubs.json` and re-running `npm run build` propagates a fix through every output format, including the generated club table in [13](13-clubs.md). Raise the `confidence` field at the same time and note the source.
