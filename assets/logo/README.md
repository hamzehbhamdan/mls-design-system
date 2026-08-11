# Logo assets

**This folder is intentionally empty.**

The MLS crest and all club crests are registered trademarks of Major League Soccer, L.L.C. and its member clubs. They are not redistributed here.

## Getting the real assets

Official marks come from MLS Brand or from the relevant club's brand or communications team. The distributed package uses a consistent naming convention, so the sanctioned set you should expect is:

- `MLS crest logo RGB`
- `MLS crest logo CMYK gradient`
- `MLS crest logo RGB gradient`
- `MLS crest logo Mono`
- `MLS crest logo Mono rev black`
- `MLS crest logo RGB - <Club Name>` — the per-club colourways

Note the official **gradient** variant. A system that only accounts for flat fills is missing a sanctioned form.

## Dropping them in

Recommended layout:

```
assets/logo/
  crest-league.svg
  crest-league-mono.svg
  crest-league-mono-rev.svg
  crest-league-gradient.svg
  clubs/
    crest-por.svg      <- match the slug in data/clubs.json
    crest-sea.svg
    …
```

Then replace the placeholder:

```html
<!-- before -->
<span class="mls-crest" data-tricode="POR" data-placeholder></span>

<!-- after -->
<span class="mls-crest">
  <img src="/assets/logo/clubs/crest-por.svg" alt="">
</span>
```

## What the component already handles

`.mls-crest` enforces two published rules so you do not have to:

- **Clear space** — padding is computed as `4 × (size / 16)` on all sides, which is the 4×-X rule from MLS's guidelines
- **Minimum size** — `min-inline-size: 32px`, the digital equivalent of the published 0.50in print minimum

Sizes: `--sm` 2rem · default 3rem · `--lg` 5rem · `--xl` 8rem. Override with `--crest-size`.

## Rules you still have to follow

From MLS's published guidelines — do not alter the form, rotate, change the stroke colour, tint, shade, distort, crop, cover with other elements, or apply shadows, glows or effects. The trap keyline must be **white only**.

And one this design system adds: **never redraw or approximate the crest.** Not as SVG, not in CSS, not as a placeholder that happens to be a shield with a diagonal and three stars. Use the empty socket.

Full detail in [`docs/02-logo-and-crest.md`](../../docs/02-logo-and-crest.md).

## Alt text

- Crest sits next to a club name already in the DOM → `alt=""`. It is decorative.
- Crest is the **only** identification of the club → `alt="Portland Timbers"`.
- **Never** `alt="Portland Timbers logo"` — a screen reader renders that as "Portland Timbers logo, image."
