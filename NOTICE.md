# Notice on trademarks, assets and accuracy

## This is not an official MLS product

This repository is an independent, unofficial reference compiled from publicly available sources in August 2026. It is not produced, endorsed, reviewed or approved by Major League Soccer, L.L.C., by any MLS club, or by any of their partners.

## Trademarks

"Major League Soccer", "MLS", the MLS crest and shield, "MLS Cup", "Supporters' Shield", "Leagues Cup", "MLS NEXT", "MLS NEXT Pro" and related marks are registered trademarks of Major League Soccer, L.L.C. Club names, club crests and club marks are trademarks of their respective clubs.

Nothing in this repository grants any right to use those marks. Trademark law is not affected by the MIT licence covering the code here.

## What is not in this repository, and why

**No logo or crest files in git.** No MLS crest, no club crests, no wordmarks, no partner marks are committed. `.gitignore` excludes everything under `assets/logo/`, and with nothing installed the `.mls-crest` component is an empty socket with published clear-space and minimum-size rules already enforced. Official assets should be obtained from MLS Brand or the relevant club and installed with `scripts/install-logos.mjs`. **A copy of this project distributed as an archive may contain an installed set** — see "Marks" below, because that changes what you may do with it.

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

## Marks

No MLS, club or league-property marks are committed to this repository.
`scripts/install-logos.mjs` installs marks that **you** have obtained and are
entitled to use; it does not fetch, bundle or redistribute anything.

If you install marks, be aware that you are adding trademarked material to your
copy of the project. Keep that copy private, do not publish it, and do not
redistribute the marks. Internal use inside MLS or by a party MLS has licensed
is a different matter from a public repository, and only you can know which one
you are in. `.gitignore` excludes `assets/logo/` for exactly this reason — an
installed set will not be committed unless you deliberately override it.

**If you received this project as an archive containing marks under
`assets/logo/`,** they were installed by whoever packaged it, from files they
held. Their presence is not a licence. Do not push that archive to a public
repository, publish it, or pass the marks on. Deleting `assets/logo/` and
re-running `npm run build` returns the system to lettered sockets, and every
layout, preview and check is designed to keep working in that state.

This applies equally to the MLS NEXT, MLS NEXT Cup and MLS NEXT Fest marks under
`assets/logo/properties/`, and to the MLS NEXT member-club marks under
`assets/logo/next-clubs/`, which belong to third-party youth organisations
rather than to MLS.
