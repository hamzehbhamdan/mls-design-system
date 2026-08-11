# Overview

## What this is

A design system and brand reference for Major League Soccer, built so that a machine and a person can both work from it. Sixteen chapters of documentation, a token pipeline, a CSS component layer, and thirty club themes that are generated rather than hand-maintained.

It exists because MLS's identity has an unusual property that most design systems get wrong when they try to encode it, and because the league publishes almost nothing publicly that a designer could work from.

## The property

Most sports leagues have a fixed mark and fixed colours. MLS does not, by design.

When Athletics and Berliner Benson rebuilt the identity in 2014, they made the crest a **template**. The shield splits into two halves — a reference to the two halves of a match — with one half reserved for the league and the other left open for clubs, sponsors and events to occupy. Every club receives the crest in its own colours. Athletics' own case study calls it "a flexible template."

That means the league's red and navy are far less important than the mechanism. A design system that treats `#E2231A` as *the* MLS colour has encoded the least interesting thing about the brand.

So this system treats colour as a **slot**:

```css
/* The league default */
:root { --mls-color-accent-base: #E2231A; }

/* Any club, by attribute */
[data-club="por"] { --mls-color-accent-base: #2C5234; }
```

Every component references the slot. Nothing references the league red directly. One attribute re-themes an entire product.

## The problem that creates, and how it is solved

Thirty clubs means thirty accent colours, and club colours were chosen for kits and crests, not for user interfaces. Columbus gold on white is 1.5:1 — invisible. LAFC's black is invisible as a dark-mode accent. Inter Miami's pink, Sporting's light blue, NYCFC's skyline blue and Nashville's electric gold all fail on white.

**Twenty-four of the thirty need correction.**

The build does it in OKLab, adjusting only lightness so hue and chroma survive, and it does it as a build step so the correction is inspectable rather than buried in a component:

```
CLB   #FEDD00  light→#AD8C00 (3.22:1)  dark→#FEDD00 (14.22:1)
LAFC  #000000  light→#000000 (21:1)    dark→#C39E6D (7.71:1)
```

For achromatic primaries the correction is different in kind: lightening black gives grey, and grey is not a brand colour, it is the absence of one. So LAFC and D.C. United have their accent promoted to a chromatic club colour — California Gold and red respectively — which is what both clubs already do in their own digital products.

Crucially, **the raw club colour is never touched**. `--mls-club-primary` holds the true value for crests, badges and kit swatches, where fidelity is a licensing requirement. `--mls-color-accent-base` is the corrected derivative for UI chrome. Conflating the two would be either a brand violation or an accessibility failure depending on which way you got it wrong.

## The second half of a brand

Half of this repository is not visual. MLS's verbal identity is more distinctive than its palette and much more often got wrong:

- Club names take **plural verbs** ("Austin FC are"), deviating from AP style.
- "Franchise" is prohibited; "soccer" is near-absolute; "match" beats "game".
- *Fans* and *supporters* are not synonyms — one is an audience, the other a constituency, and the league uses them in consistently different contexts.
- Hype attaches to moments, never to the league's own standing. Celebrate the match, be honest about the league.

Chapters 8 to 11 cover this. For a language model consuming this repo as design context, they are arguably the highest-value chapters in it, because tone is where generated copy goes wrong first.

## What this system will not do

It will not tell you a value it does not know. MLS publishes no public brand-colour specification, no league-level editorial style guide, and no current public brand guidelines. Every value here carries a confidence rating, two club colours are `null` rather than guessed, and chapter 15 lists every gap that could not be closed.

That is a feature. A brand reference that quietly fills its own holes is worse than one that marks them.

## Where to go next

| If you want to | Read |
|---|---|
| Understand the brand before touching code | [01 Brand foundation](01-brand-foundation.md) |
| Place a crest correctly | [02 Logo & crest](02-logo-and-crest.md) |
| Pick or theme a colour | [03 Colour](03-color.md) |
| Set type | [04 Typography](04-typography.md) |
| Make a layout feel like MLS without a crest | [06 Graphic devices](06-graphic-devices.md) |
| Build a scoreline or standings table | [07 Components](07-components.md) |
| Write anything at all | [08 Voice](08-voice-and-tone.md), [09 Vocabulary](09-vocabulary.md) |
| Know how much to trust a value | [15 Sourcing & confidence](15-sourcing-and-confidence.md) |
