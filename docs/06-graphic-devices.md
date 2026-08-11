# Graphic devices

MLS's own partner brand guidelines name two graphic systems that exist **independently of the crest**: *The Slash* and *The Corners*. They are listed alongside typography, colour and photography as parts of the identity in their own right.

This is the most under-used part of the MLS system and the most useful. They are what make a layout read as MLS with no crest in frame — which matters, because the crest has strict clear-space rules and cannot be everywhere.

---

## The Slash

A 45° diagonal driving upward. From MLS's own description of the crest: it *"begins outside the perimeter and drives upward at a 45-degree angle to illustrate both the nonstop nature of our game and the rising trajectory of our league."*

**The angle is 45°. Not 30°, not 60°, not "roughly diagonal."** It carries a stated meaning and it is the one geometric constant in the identity.

### `.mls-slash`

A diagonal band behind content. Sits at `z-index: -1` inside an isolated stacking context, so it never interferes with text.

```html
<section class="mls-slash mls-slash--right mls-slash--subtle">…</section>
```

Modifiers: `--left`, `--right` for position, `--subtle` to drop to 12% opacity for background use.

### `.mls-slash-band`

A full-bleed section whose bottom edge is cut on the diagonal. The workhorse for section dividers, hero backdrops and stat strips.

```html
<div class="mls-slash-band">…</div>       <!-- cuts down-right -->
<div class="mls-slash-band mls-slash-band--up">…</div>
```

### `.mls-hatch`

A repeating 45° hatch. For empty states, loading skeletons and "no data" cells. A hatched empty state reads as part of the brand; a plain grey box reads as a hole in the page.

---

## The Corners

The crest's corner geometry, abstracted from the shield.

### `.mls-notch`

Clips a 45° corner. **Use this instead of a larger border-radius** when a container needs personality.

```html
<div class="mls-surface mls-notch" style="--notch: 14px">…</div>
<button class="mls-btn mls-btn--primary mls-btn--notch">Buy tickets</button>
```

Variants: `--tl` (top-left only), `--br` (bottom-right only). Default notches both opposing corners, which echoes the shield's asymmetry.

Size is a custom property, defaulting to `--mls-radius-notch` (10px). Keep it between 8 and 20px — below 8 it reads as a rendering artefact, above 20 it starts to look like a different shape.

### `.mls-corners`

L-brackets at two opposing corners, in the accent colour. Frames a stat, a pull quote or a featured card without a full border.

```html
<div class="mls-corners" style="padding: var(--mls-space-6)">…</div>
```

---

## Duotone photography

Named in MLS's guidelines as a sanctioned photographic treatment. `.mls-duotone` maps image luminance onto two colours — by default the club accent and near-black — using blend modes, so **it re-tints automatically with the club theme**.

```html
<figure class="mls-duotone">
  <img src="…" alt="">
</figure>
```

Override either end:

```css
.hero { --duotone-highlight: var(--mls-club-primary); --duotone-shadow: #001F5B; }
```

Note this is the one place `--mls-club-primary` is correct to use for a large surface: the treatment is a colour wash, not a foreground, so contrast rules do not apply to it. Any text on top must still meet contrast against the *result*.

Works best on high-contrast action photography with a clear subject. It flattens busy crowd shots into mud.

---

## Composition rules

**1. One device per composition.** Slash plus notch plus corners plus duotone at once is noise. Pick the one doing the most work.

**2. The slash sets the angle for everything else.** If a composition has a slash in it, any other diagonal — a cut image edge, a chart line, a transition — matches at 45°. Two different diagonal angles in one layout looks like a mistake, because it is one.

**3. Devices are accents, not backgrounds.** A full-page hatch or an all-over slash pattern overwhelms content and, more practically, wrecks text contrast.

**4. Never approximate the crest with these.** A shield outline plus a slash plus three stars is the crest. Do not assemble it. See [02 Logo & crest](02-logo-and-crest.md).

**5. Devices inherit the accent, so they inherit the club.** Every device in this file uses `--mls-color-accent-base`. Drop any of them inside `[data-club]` and they re-colour with no extra work.
