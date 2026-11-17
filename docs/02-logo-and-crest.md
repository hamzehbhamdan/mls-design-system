# Logo and crest

> **No crest files ship in this repository.** The MLS crest and all club crests are trademarks. This chapter documents how the mark is constructed and how it must be used; `assets/logo/` is the empty slot official assets drop into, and `.mls-crest` is the component that enforces the published rules while it waits.

## Origin

Unveiled 18 September 2014, rolled out through 2015 for the league's twentieth season, under the campaign hashtag `#MLSNext`. Designed by **Athletics** (New York) with **Berliner Benson**. It replaced the ball-and-boot emblem used from 1996 and deliberately does not depict the sport.

The league's then-CMO framed it bluntly:

> Our new brand and crest are the result of an iterative process that has helped us better understand the world in which we operate in. The outcome is not an evolution, but a revolution.

## Construction and meaning

Every element is load-bearing. This is MLS's own explanation, element by element:

| Element | Official meaning |
|---|---|
| **Perimeter / shield outline** | "The perimeter represents the lines that mark off the field of play." |
| **The 45° slash** | "Begins outside the perimeter and drives upward at a 45-degree angle to illustrate both the nonstop nature of our game and the rising trajectory of our league." Also read as a nod to the two 45-minute halves. |
| **Three stars** | "The three stars represent the pillars of our brand: For Club, For Country, For Community." |
| **Left half** | Carries the MLS lettermark and the three stars. |
| **Right half** | Deliberately open. Represents "the transition in and out of the MLS universe" — the empty field clubs, sponsors and animation occupy. |
| **The split itself** | The two halves of a soccer match. |
| **Colours** | "Pay homage to the nations MLS represents – Canada and the United States." |

The lettermark inside the shield appears to be custom-drawn rather than set in a released typeface. No source names a font for it. **Do not assert one.**

## The colourable system

This is the structural feature that matters most, and the one this design system is built around.

> The flexible nature of the brand will also allow clubs to adopt the league crest in their own unique color schemes, reinforcing a focused commitment to put clubs, country and community first.

Each club receives its own colourway of the league crest, which appears on the jersey sleeve. Athletics describes the badge as a flexible template accommodating each team's palette plus sponsorships, partnerships and events.

**Design consequence:** treat the crest as a two-token mark — a foreground and a field — plus a white-only trap, rather than as a fixed red-and-navy asset. See [03 Colour](03-color.md).

## Sanctioned variants

The official asset package is distributed with a consistent naming convention. The sanctioned set is:

- `MLS crest logo RGB`
- `MLS crest logo CMYK gradient`
- `MLS crest logo RGB gradient`
- `MLS crest logo Mono`
- `MLS crest logo Mono rev black`
- `MLS crest logo RGB - <Club Name>` (per-club colourways)

Note the existence of an official **gradient** variant. A system that only accounts for flat fills will be missing a sanctioned form.

## Usage rules

From *MLS Partner Brand Guidelines v1.0*, dated 8 January 2015. This is authentic MLS material but it is eleven years old and not hosted by MLS. **Verify against a current edition before partner or licensed work.**

**Clear space** — a minimum of **4× the "X" measurement** on all sides.

**Minimum size** — **0.50 inches wide** in print. "The logo can be scaled as large as necessary" above that. This system uses **32px** as the digital equivalent.

**The trap** — the keyline that appears when the crest sits on a coloured field must be **white only**.

**Scaling** — proportions stay consistent; line weight must not vary.

### Nine prohibitions

Do not:

1. Alter the form of the crest
2. Rotate it
3. Change the stroke colour
4. Tint it
5. Shade it
6. Distort or stretch it
7. Crop it
8. Cover any part of it with other elements
9. Apply shadows, glows or other effects

The ninth is why this design system's shadow scale is deliberately restrained. A brand whose primary mark forbids effects should not have a UI drowning in elevation.

### Additional rules for anyone generating design work

10. **Never redraw the crest.** Not as SVG, not in CSS, not "approximately", not as a placeholder that happens to be a shield with a diagonal and three stars. This is a trademark boundary.
11. **Never place a club crest inside the league crest**, or vice versa. The colourway system already handles club expression.
12. **Never use the crest as a bullet, a favicon substitute, or a decorative texture.** It is a seal of approval, not a graphic element.

Positioning language from the guidelines is worth quoting because it explains the strictness: the crest is *"the defining mark… a seal of approval, a stamp of quality."*

## Champions marking

Separate from the crest system, effective 2021:

- The **defending MLS Cup champion** wears a **silver** MLS crest on the jersey sleeve for the following season, in place of the standard badge.
- A **gold star** sits above the club crest for clubs with **five MLS Cup titles**. LA Galaxy is the only club to have passed that threshold — and its own execution has since moved on: on **8 January 2026** the club adopted a **six-star formation**, three stars per side above the crest, one per MLS Cup title, debuting on the 2026 kits. Read the five-title gold star as the league-documented rule and the club's current crest as the thing actually on the shirt. Verify any star treatment against the club, not against this line.

## The component

```html
<span class="mls-crest" data-tricode="POR" data-placeholder>
  <!-- <img src="/assets/logo/crest-por.svg" alt=""> -->
</span>
```

`.mls-crest` computes padding as `4 × (size / 16)` on all sides, which encodes the 4×-X clear-space rule directly rather than leaving it to the person placing it. It enforces `min-inline-size: 32px`. Sizes: `--sm` 2rem, default 3rem, `--lg` 5rem, `--xl` 8rem.

While empty it renders a dashed box with the tricode. That placeholder is deliberately ugly — a placeholder that looks finished is a placeholder that ships.

**Alt text.** The crest is almost always decorative next to a club name that is already in the DOM, in which case `alt=""` is correct. When the crest is the *only* identification of the club, `alt="Portland Timbers"` — never `alt="Portland Timbers logo"`, which a screen reader renders as "Portland Timbers logo, image."

## Has the crest changed for 2026 or 2027?

**No.** There is no announced crest change, brand refresh or new visual identity for the 2026 or 2027 eras. The 2014/2015 crest remains current as of November 2026.

The league's "new era" language attaches exclusively to the **calendar and competition format** — see [14 The 2027 transition](14-the-2027-transition.md) — not to the identity.

Worth flagging honestly: MLS is entering a real inflection point, with a new commissioner from January 2027 and a new calendar from July 2027. That is exactly the kind of moment a league uses to refresh a mark. Nothing has been announced. If something is announced, this chapter is the first thing that goes out of date.
