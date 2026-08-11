# Components

Every component is plain CSS on semantic HTML. No JavaScript, no framework, no build step required to use them. State lives in ARIA attributes and `data-` attributes, which means the styling and the accessibility layer cannot drift apart — if the visual state is right, the announced state is right.

All of them inherit `--mls-color-accent-base`, so all of them re-theme inside `[data-club]`.

---

## Button — `.mls-btn`

Variants `--primary --secondary --ghost --danger --inverse`, sizes `--sm --lg`, plus `--block`, `--icon`, `--notch`.

```html
<button class="mls-btn mls-btn--primary">Buy tickets</button>
<button class="mls-btn mls-btn--secondary mls-btn--sm">Match centre</button>
<button class="mls-btn mls-btn--primary" data-loading="true">Saving</button>
```

Uppercase display face, tracked, tight radius. Primary uses the accent and its guaranteed-legible contrast pair, so it works in every club theme in both schemes.

`data-loading="true"` adds a spinner and blocks pointer events. Set `aria-busy="true"` alongside it.

`.mls-btn-group` with `aria-pressed` gives a segmented control — the right pattern for competition and season filters.

**Never disable a button without explaining why.** A disabled "Buy tickets" with no adjacent reason is the most common accessibility complaint in ticketing flows.

---

## Crest — `.mls-crest`

The socket official marks drop into. Enforces the published 4×-X clear space by computing padding from its own size, and the 32px minimum. Sizes `--sm --lg --xl`.

```html
<span class="mls-crest" data-tricode="POR" data-placeholder></span>
```

See [02 Logo & crest](02-logo-and-crest.md) for placement rules and alt-text guidance.

---

## Scoreline — `.mls-scoreline`

The most-used component in any league product, and the one most often built badly.

```html
<article class="mls-scoreline" data-state="live">
  <div class="mls-scoreline__team mls-scoreline__team--home">
    <span class="mls-crest mls-crest--sm" data-tricode="POR" data-placeholder></span>
    <span class="mls-scoreline__name mls-scoreline__name--full">Portland Timbers</span>
    <span class="mls-scoreline__name mls-scoreline__name--code mls-tricode">POR</span>
  </div>
  <div class="mls-scoreline__score">
    <span>2</span><span class="mls-scoreline__separator">–</span><span>1</span>
  </div>
  <div class="mls-scoreline__team mls-scoreline__team--away">…</div>
  <div class="mls-scoreline__status">
    <span class="mls-badge mls-badge--live">Live</span>
    <span class="mls-scoreline__clock" aria-live="polite">67'</span>
  </div>
</article>
```

Encoded rules:

1. **Home team first**, in fixtures, matchups and hashtags, regardless of venue. Winner-first ordering applies only to reported final scores in editorial prose, not to this component.
2. **Tabular numerals**, always.
3. **Match state in `data-state`** — `live`, `final`, `upcoming` — not in a class, so it can be updated from a data feed without class-name surgery.
4. **Below 640px the club name becomes the tricode.** Both are in the DOM; CSS swaps them. Truncation is not an option at this width.
5. **The clock is `aria-live="polite"`** so a screen-reader user hears the score change without re-navigating. Do not make it `assertive` — a 90-minute match would be unbearable.
6. **The losing side dims *and* the winner gains weight.** Two channels, so the result survives greyscale.

Variants: `--compact` for fixture lists, `--hero` for a match-centre header, where the score reaches the 8xl step.

---

## Standings table — `.mls-table`

```html
<div class="mls-table-wrap">
  <table class="mls-table">
    <caption class="mls-visually-hidden">Eastern Conference standings</caption>
    <thead>
      <tr><th scope="col">#</th><th scope="col">Club</th><th scope="col" data-numeric>PTS</th></tr>
    </thead>
    <tbody>
      <tr data-qualifies="playoff" data-focus="true">
        <td class="mls-table__pos">1</td>
        <th scope="row">…</th>
        <td data-numeric="emphasis">58</td>
      </tr>
    </tbody>
  </table>
  <div class="mls-table__legend">
    <span data-qualifies="champions">Concacaf Champions Cup</span>
    <span data-qualifies="playoff">Audi MLS Cup Playoffs</span>
  </div>
</div>
```

- Every numeric column carries `data-numeric` — right-aligned and tabular.
- `<th scope="row">` on the club cell, so a screen reader announces which club each figure belongs to.
- Qualification zones use a coloured left rule **and a written legend**. Never colour alone.
- `data-focus="true"` highlights the user's club using the accent, so it re-themes.
- Sticky header, horizontal scroll on the wrapper.

---

## Stat — `.mls-stat`, `.mls-statbar`

```html
<div class="mls-stat mls-stat--accent">
  <span class="mls-stat__label">Goals</span>
  <span class="mls-stat__value">24<span class="mls-stat__unit">G</span></span>
  <span class="mls-stat__delta" data-direction="up">4 since Matchday 20</span>
</div>
```

Label is a tracked eyebrow, value is large tabular numeric. `data-direction` adds an arrow so movement is not colour-only. `.mls-statbar` gives a two-sided possession-style comparison. `.mls-stat-grid` auto-fits at 9rem minimum.

---

## Badge — `.mls-badge`

`--accent --solid --success --warning --danger --info --outline --live`.

`--live` pulses. **Reserved for genuinely live matches.** The dot animates; the label never moves, so the announcement is stable, and the animation stops entirely under `prefers-reduced-motion`.

`.mls-form` renders a W/D/L run. The letters carry the meaning, so it survives colour-blindness and greyscale print.

`.mls-competition` is a small chip for tagging a match by competition, with a skewed accent tick.

---

## Navigation — `.mls-header`, `.mls-nav`, `.mls-tabs`

The header is inverse-filled with a 3px accent rule along the bottom. The active nav indicator is **a slash, not a straight underline** — a small detail, and the thing that makes the nav read as MLS.

`.mls-tabs` uses `role="tablist"` and `aria-selected`. `.mls-skip-link` should be the first focusable element on every page.

---

## Forms

`.mls-field` `.mls-label` `.mls-input` `.mls-select` `.mls-textarea` `.mls-check` `.mls-switch` `.mls-help` `.mls-error`.

- Invalid state is driven by `aria-invalid="true"`, not a class, so styling and announcement cannot diverge.
- Errors carry an icon and text, not just a red border.
- Checkboxes and radios use native controls with `accent-color`, so the club theme flows through with no custom markup and no loss of native behaviour.
- Every input needs a real `<label>`. Placeholder text is not a label.

---

## Feedback — `.mls-alert`, `.mls-empty`, `.mls-skeleton`

Alerts take `--success --warning --danger` and default to info. Add `role="status"` for polite announcements, `role="alert"` for urgent ones.

`.mls-empty` uses the diagonal hatch, so "no matches today" still feels like part of the brand.

`.mls-skeleton` shimmers on the 45° axis. Wrap in `aria-busy="true"` and stop under reduced motion.

---

## Building something not listed here

1. Start from the semantic tokens. If you need a value that does not exist, the gap is probably in the token set, not the component.
2. State goes in ARIA or `data-` attributes, not in class names.
3. Never reference `brand.red` directly — use `accent`.
4. Every colour signal needs a second channel.
5. Run `npm run verify` before committing. It will catch contrast regressions and unresolved tokens.
