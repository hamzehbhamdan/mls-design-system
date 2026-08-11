# Space, layout and motion

## Space

A 4px grid. Steps are named by their multiple, not by t-shirt size, so the scale can grow at either end without renaming anything.

| Token | Value | Typical use |
|---|---|---|
| `space-1` – `space-3` | 4 / 8 / 12px | Inside a control: icon gaps, badge padding |
| `space-4` – `space-6` | 16 / 20 / 24px | Card padding, form field gaps |
| `space-8` – `space-12` | 32 / 40 / 48px | Between components |
| `space-16` – `space-24` | 64 / 80 / 96px | Between sections |
| `space-32` – `space-64` | 128 – 256px | Page-level rhythm, hero blocks |

Rule of thumb: **related things sit two steps closer than unrelated things.** A label at `space-2` from its input and `space-6` from the next field needs no other grouping cue.

## Layout primitives

Four classes cover most layouts. They compose; they do not nest into a framework.

```html
<div class="mls-container">          <!-- max 1280px, responsive gutters -->
  <div class="mls-stack">             <!-- vertical rhythm, --mls-stack-gap -->
  <div class="mls-cluster">           <!-- horizontal, wraps, --mls-cluster-gap -->
  <div class="mls-grid mls-grid--auto"><!-- auto-fit, --mls-grid-min -->
```

Each reads its gap from a custom property, so a one-off override is a style attribute rather than a new class.

## Breakpoints

`sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`

Mobile first. The only breakpoint with a hard behavioural rule attached is **640px**: below it, `.mls-scoreline` swaps the full club name for the tricode. Truncating "Vancouver Whitecaps FC" to "Vancouver Whit…" is worse than showing "VAN".

## Radius

Deliberately tight: `xs 2` · `sm 3` · `md 4` · `lg 6` · `xl 10` · `full 9999`.

The crest is built from straight lines, 45° angles and hard corners. Soft rounded rectangles fight it. `radius-full` is for pills, avatars and status dots only.

**When a shape needs more personality, use `.mls-notch` rather than a larger radius.** The notch clips a 45° corner and is derived from "The Corners", a device MLS's own guidelines name as part of the system. It is on-brand in a way that a 16px radius is not.

## Elevation

`xs` · `sm` · `md` · `lg` · `focus`, and they are all restrained.

MLS's guidelines prohibit shadows and glows on the crest. A brand whose primary mark forbids effects should not have an interface drowning in elevation. Hierarchy here comes from **borders and surface steps** — `surface`, `surface-raised`, `surface-sunken` — with shadow reserved for things that genuinely float: menus, popovers, modals, and the small lift on an interactive card.

## Motion

The slash is documented as representing "the nonstop nature of our game and the rising trajectory of our league." Motion should feel driven, never languid.

| Token | Value | Use |
|---|---|---|
| `duration-fast` | 120ms | Hover, focus, colour change |
| `duration-base` | 180ms | Default |
| `duration-slow` | 240ms | Panels, disclosure |
| `duration-slower` | 400ms | Page and route transitions only |

**Nothing routine exceeds 240ms.**

| Easing | Curve | Use |
|---|---|---|
| `easing-standard` | `0.2, 0, 0, 1` | Default. Leaves fast, settles soft |
| `easing-enter` | `0, 0, 0, 1` | Things arriving |
| `easing-exit` | `0.3, 0, 1, 1` | Things leaving |
| `easing-drive` | `0.35, 0, 0.1, 1` | **Signature.** Accelerates hard, then arrives — the motion equivalent of the slash |

### Direction

Movement follows the slash: **up and to the right**. A panel that enters from below-left and settles up-right is on-brand. One that drifts down is not.

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) { /* everything stops */ }
```

Set globally in the reset, and every animated component re-declares it. This is safe because **every animation in this system is decorative** — the live pulse, the skeleton shimmer, the button spinner, the switch thumb. None carries meaning that is lost when it stops. The live badge still says LIVE. The skeleton is still a grey block.

If you add an animation that *does* carry meaning, that is a design bug, not a reason to exempt it.

### Three motion rules

1. **Animate transforms and opacity.** Not width, height, top or left. A standings table that animates `height` on expand will drop frames on a phone during a matchday spike.
2. **One thing moves at a time.** A card that lifts, glows, scales its image and slides its text is four animations competing for the same attention.
3. **The live pulse is reserved.** Genuinely live matches only. If everything pulses, nothing does.
