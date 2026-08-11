# Editorial style

## Base style

**AP style is the default, overridden by the soccer-specific rules in [09 Vocabulary](09-vocabulary.md).** Atlanta United's guide states this explicitly and observed league output is consistent with it. No league-level confirmation exists.

### Documented deviations from AP

1. **Plural verbs for singular club names.** "Austin FC are." AP would give "is." Biggest deviation, most violated.
2. **match over game, pitch over field, kit over jersey.** Global-football register over American-sports register.
3. **"Concacaf" in title case**, where AP acronym handling would give CONCACAF.
4. **Loanwords unitalicised and unglossed** — golazo, tifo, capo, brace.
5. **Double hyphen `--`** as the parenthetical dash in press-release boilerplate.

---

## Scorelines

- **Hyphenated numerals: `3-1`.** Never `3:1`. Never spelled out.
- **In editorial prose, the winning team goes first.** "a 3-1 victory over Vancouver Whitecaps FC"
- **In fixtures, matchups and hashtags, the home team goes first**, independent of where the match is played. `#ATLvORL` at home, `#CHIvATL` away.
- `vs.` with full team names; `v` with tricodes and logos.
- Headline construction with a comma is common: *"RBNY Win, 3-2."*

These two ordering rules genuinely conflict for editorial scorelines, and no source resolves it. Working reconciliation: **fixtures = home first; reported final scores = winner first.** The `.mls-scoreline` component implements home-first, because it renders fixtures.

---

## Dates and times

| Context | Format |
|---|---|
| Graphics / social | `Saturday, February 25 \| 7:30 PM` |
| Editorial / press release | `Saturday, February 25 (7:30 pm)` |
| International | `Saturday, February 25 (7:30 pm ET / 21:30 ARG)` |
| Social video / on-screen | `02.25.23` — or `25.02.23` for Latin America |
| Press-release dateline | `NEW YORK (Wednesday, July 8, 2026) –` |

Rule: **omit time zones on club channels** (local time assumed); **include ET on league channels.**

**MLS is not internally consistent on a.m./p.m. styling.** `8 p.m. ET`, `8:30 pm ET` and `10:30 PM ET` all appear in league output. Pick one for your product, document the choice, and do not claim a rule exists.

---

## Names

1. **First reference:** full name — *Thiago Almada*
2. **Second reference:** surname only — *Almada*
3. **Third reference:** nickname — *"Guayo"*

Universally-known mononyms take primary position: *Pelé*, and in practice *Messi*.

**Diacritics are mandatory and must be preserved.** *Luiz Araújo*, not *Luiz Araujo*. *Cucho Hernández*, *Querétaro*, *CF Montréal*, *El Tráfico*. Stripping an accent is a factual error, not a typographic shortcut. Any font used in an MLS product must carry full Latin Extended coverage.

---

## Capitalisation

**Proper nouns — roster mechanics:** Designated Player, Targeted Allocation Money, General Allocation Money, Homegrown Player, Senior Roster, Supplemental Roster, International Roster Slot, Salary Budget Charge, U22 Initiative, Discovery List.

**Proper nouns — competition stages:** Regular Season, Round One, Conference Semifinals, Conference Finals, Wild Card, Decision Day, Phase One.

**Lowercase — generic match terms:** hat trick, clean sheet, brace, stoppage time, set piece, golazo, matchday (unnumbered).

**All caps for emphasis** is a live editorial device at peak moments: `CHAMPIONS!`, `HIGHLIGHTS:`. Use sparingly and only at genuine peaks.

---

## Headlines

- **Press releases and news: sentence case.** *"Real Salt Lake build Leagues Cup belief with Atlante rout"*
- **Long-form features: title case or all caps.** *"Rooted In The Community"*
- Under 60 characters where a CMS constrains it.
- **`&` is acceptable in headlines** where `and` would be in body copy.

The register split maps onto headline case: sentence case for the editorial register, title case for the formal one.

---

## Punctuation and numbers

- **`MLS'`**, not `MLS's`. AP style for singular proper nouns ending in s.
- **Supporters' Shield** — apostrophe after the s.
- **Never "the" before MLS.** In Spanish, *la MLS* is acceptable mid-sentence but not sentence- or headline-initial.
- Spell out numbers except in casual contexts, formal names, **jersey numbers and match minutes**.
- Double quotes primary, single nested.
- Prefer "hundreds" over "100s."

---

## Bilingual work

MLS runs a **parallel Spanish-language operation**, not a translation layer: MLS Español, separate social handles, a dedicated YouTube channel, the weekly show *Esto es MLS en vivo*, and *Sueño MLS*.

- **fútbol** in Spanish content; "soccer" only inside proper nouns.
- **Competition names stay in English, untranslated** — *Leagues Cup*, *MLS Cup*, *Concacaf Champions Cup*.
- **Structural terms translate** — *Posiciones, Calendario, Noticias, Clubes, Competencias, cuartos de final*.
- *clásico* where English says "derby."
- Spanish headlines are notably more voice-forward than English.
- **Byline credit goes to the original author, not the translator.**

**Québec French.** CF Montréal's site is French-first, the inverse of every other club. Vocabulary: *match / matchs*, *partisans* (supporters), *Billets*, *Calendrier*, *Actualité*, *Académie*. MLS and competition names are not translated. And again: **Québec French uses *soccer*, not *football*.**

No published MLS or club language policy exists for this; the French-first posture is almost certainly driven by Québec's language legislation rather than by brand policy. Treat it as observed practice with a legal context, not as a league rule.

---

## Known inconsistencies

MLS is genuinely inconsistent on all of these. Pick one, document it, and do not paper over the gap by inventing a rule.

| Variants seen in MLS's own output |
|---|
| matchday / match-day / gameday |
| LIGA MX / Liga MX |
| U22 Initiative / Under-22 Initiative |
| St. Louis CITY SC / St. Louis City SC |
| supporters' group / supporters group / supporters' association |
| `8 p.m. ET` / `8:30 pm ET` / `10:30 PM ET` |
| Hispanic Heritage Month (league) vs Latin Heritage (club best practice) |
| Two different protected-category lists across two league documents |
