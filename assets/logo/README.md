# Logo assets

**Nothing in this folder is committed to git.** The MLS crest, the club crests
and the league property marks are registered trademarks of Major League Soccer,
L.L.C., its member clubs and its properties. `.gitignore` excludes everything
here except this file and `SOURCES.md`, so an installed set stays on the machine
that installed it.

If you received this as an archive with marks already in place: they are there
because whoever packaged it was entitled to use them privately. That is not a
licence to redistribute them. See [`../NOTICE.md`](../NOTICE.md).

## Installing them

**Where to get them: see [SOURCES.md](SOURCES.md).** Short version — the
official pack is linked from <https://www.mlssoccer.com/media-resources/> under
"Logos", or run `npm run logos:fetch` to pull the thirty club crests straight
off MLS's CDN.

Then point the installer at whatever folders you get back:

```bash
node scripts/install-logos.mjs ~/Downloads/MLS\ Club\ Logos ~/Downloads/MLS\ Logos
npm run build        # regenerate dist/, including dist/mls.crests.css
npm run examples     # rebuild the reference decks with real marks
```

It takes several folders at once, recurses into them, and does not care how the
files are named. Official packages use `POR_Logo_PRI_FC_RGB_2160x2160.png`,
other packages use `MLS crest logo RGB - Portland Timbers.svg`, asset portals
use `por.png`, and a download folder uses `Timbers logo (1).png`. All four
match. Run it with `--dry` first to see what it would do.

**A partial install is a valid state.** Install the ten clubs you have and the
other twenty keep their lettered sockets. Nothing needs editing, and nothing
breaks. A club that is missing shows a socket — never the league crest standing
in for a club, because thirty MLS crests where thirty club crests should be is
worse than thirty sockets.

## What it produces

```
assets/logo/
  manifest.json                  <- read by the deck, the document layer and the CSS build
  crest-league-gradient.png      <- and @deck.png beside it
  clubs/
    por.png                      <- named by the slug in data/clubs.json
    por@deck.png                 <- 900px copy, used by the Office layer
    clb.png                      <- Columbus, light-background variant
    clb-on-dark.png              <- and its reversed twin
    …
  properties/
    mls-next.png                 <- MLS NEXT, MLS NEXT Cup, MLS NEXT Fest
    mls-next-on-dark.png
    …
  next-clubs/                    <- MLS NEXT member clubs; recorded, wired into no layout
```

## What the installer decides, and why

**Junk is skipped.** macOS archives carry an AppleDouble resource fork beside
every file — `__MACOSX/._POR.png`, a few kilobytes, with a `.png` extension and
a perfect name match. Installing one instead of the crest gives you a mark that
is not an image. `npm run verify` also fails any mark under 4 KB, as a
second line of defence.

**Size is measured, not read off the filename.** In the official pack,
`NSH_Logo_PRI_FC_RGB_2160x2160.png` is 800×800 and `ATL_…_2160x2160.png` is
2200×2200. The installer opens each file's header and keeps the largest.

**Grounds are detected.** `LTBG`/`DKBG`, `1c_white`/`1c_black`,
`OneColor_White`, `light bg`/`dark bg` and `mono-rev` all resolve to a light or
dark variant. Where a pack ships both, both are installed and the deck picks per
surface. Where it ships one full-colour crest with its own keyline — most clubs
— that one file serves both grounds.

**Aspect ratios are recorded.** The Red Bulls crest is landscape and San
Diego's is portrait. The deck centres each mark in its square socket at its own
aspect rather than stretching it, which it can only do from recorded pixel
dimensions.

**A second, smaller raster is written.** A crest is never drawn larger than
about 2.5in on a 13.33in slide, so `@deck.png` is capped at 900px — still over
300dpi at the largest size any layout uses. The full-resolution original stays
untouched beside it for the web and for print.

**EPS, AI and PDF are ignored.** Without Ghostscript, ImageMagick returns only
the low-resolution TIFF preview embedded in those files — 416×190, indexed
colour — and installing that in place of the shipped PNG is a silent downgrade.

SVG is kept for the web layer where a pack provides it. PNG is generated for the
Office layer, because PowerPoint's SVG support is inconsistent across versions
and a vector-only mark silently vanishes from every deck while still looking
fine in a browser. `npm run verify` fails if any club is SVG-only.

Rasterising needs one of `rsvg-convert` (Debian: `librsvg2-bin`), `inkscape`, or
ImageMagick. If none is present the installer says so and installs the SVGs
anyway.

## Where the marks appear

Once installed they are placed automatically:

| Surface | Mark |
|---|---|
| Openers, dividers, statements | Deck mark, bottom-right. Club crest if the deck is club-themed, else the league crest. `crest: false` to suppress. |
| `crestWall()` | All thirty club marks, with clear space inside each cell, on paper in all three designs. |
| `matchup()` | Both club marks, flanking the score. Pass `club:` on each side. |
| `deck.propertyMark(key, dark)` | MLS NEXT and its competition marks, by key. |
| Web `.mls-crest` | Set by `dist/mls.crests.css`, per `data-club`, with a `[data-theme="dark"]` rule where a reversed variant exists. |
| Web `.mls-mark[data-mark="next"]` | League property marks, same pattern. |

## The rules the socket already enforces

**Clear space** — a minimum of 4× the crest's "X" measurement on all sides. In
the deck, `size` is the *mark*, not the box: layouts reserve room around it.

**Never redraw, recolour or reproportion the crest.** The club colourways are
sanctioned versions supplied by MLS; there is no other legitimate way to
recolour it. Note that the official set includes a **gradient** variant — a
system that only accounts for flat fills is missing a sanctioned form.
