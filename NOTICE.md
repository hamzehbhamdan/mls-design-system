# Notice on trademarks, assets and accuracy

## This is not an official MLS product

This repository is an independent, unofficial reference compiled from publicly available sources in August 2026. It is not produced, endorsed, reviewed or approved by Major League Soccer, L.L.C., by any MLS club, or by any of their partners.

## Trademarks

"Major League Soccer", "MLS", the MLS crest and shield, "MLS Cup", "Supporters' Shield", "Leagues Cup", "MLS NEXT", "MLS NEXT Pro" and related marks are registered trademarks of Major League Soccer, L.L.C. Club names, club crests and club marks are trademarks of their respective clubs.

Nothing in this repository grants any right to use those marks. Trademark law is not affected by the MIT licence covering the code here.

## What is not in this repository, and why

**No logo or crest files.** No MLS crest, no club crests, no wordmarks, no partner marks. The `.mls-crest` component is an empty socket with published clear-space and minimum-size rules already enforced. Official assets should be obtained from MLS Brand or the relevant club and placed in `assets/logo/`.

**No font binaries.** MLS Tifo (MLS Headline / Standard / Micro), MLS Streets, MLS Stands, MLS Pitch and DIN Next Pro are commercially licensed typefaces. This repository names them at the head of each font stack so that a licensed installation uses them, and specifies openly licensed substitutes for everyone else. See `assets/fonts/README.md`.

**No photography.** All preview imagery is CSS-generated or a labelled placeholder.

## On the accuracy of the values here

MLS has not published a public brand-colour specification, a public league-level editorial style guide, or a current public brand-guidelines document. This has direct consequences for how much of this repository should be trusted:

- **League colours are low confidence.** `#E2231A` and `#001F5B` are the most-cited third-party values and are internally coherent, but no MLS-authored source confirms them.
- **Club colours vary from high to unverified.** Every club in `data/clubs.json` carries an explicit `confidence` field and a `notes` field naming the specific disagreement. Two clubs have values that are `null` rather than guessed.
- **Some usage rules are 2015-vintage.** The clear-space, minimum-size and misuse rules come from *MLS Partner Brand Guidelines v1.0*, dated 8 January 2015, which is authentic MLS material but is not hosted by MLS and may have been superseded.
- **Some editorial rules are extrapolated from a club, not the league.** Where a rule comes from Atlanta United's published style guide rather than from MLS itself, the documentation says so explicitly.

`docs/15-sourcing-and-confidence.md` lists every claim by tier, and every gap that could not be closed.

**Before any print, broadcast, licensing, merchandise or partner use, verify against MLS Brand.** This repository is a well-researched starting point and a working code system. It is not a substitute for the official guidelines.

## Contributing corrections

If you have access to official values that contradict anything here, correcting `tokens/tokens.json` or `data/clubs.json` and re-running `npm run build` propagates the fix through every output format. Please raise the `confidence` field at the same time and note the source.
