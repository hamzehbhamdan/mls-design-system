# Where the marks come from

No marks ship in this repository. Here is where to get them, best source first.

## 1. The official pack (recommended)

MLS publishes a logo pack from its own media-resources page. This is the one to
use: it is the sanctioned set, and it is the only source that gives you vector,
the mono and reversed variants, the **gradient** variant, and the league crest.

- Media resources: <https://www.mlssoccer.com/media-resources/> → **"Logos"**
- Direct: <https://mlssoccer.box.com/s/lggk1zb5ea4vu7lo7zv7y2qztqtcmd8g>

Download, unzip, then:

```bash
npm run logos -- ~/Downloads/<unzipped-folder>
npm run build && npm run examples
```

The installer does not care how the files are named.

## 2. Ask MLS Brand

If you have a relationship with the league, ask. You get the current pack, the
club colourways, and the usage rules that go with them — and you find out about
anything mid-refresh, which no download will tell you. For a deck going to the
commissioner's office this is the right call.

## 3. The club crests off the CDN (fast, but limited)

`scripts/fetch-logos.sh` downloads all thirty club crests from
`images.mlssoccer.com`, the CDN behind <https://www.mlssoccer.com/clubs/>, and
installs them in one step:

```bash
bash scripts/fetch-logos.sh
```

What you get: PNG, one colourway each, web-sized. Fine for a deck.

What you do not get: **the league crest** (it is not on that page), any vector,
and any mono, reversed or gradient variant. Run this to get moving, then
overwrite it with the official pack when you have it — `npm run logos` with
`--force` replaces anything already installed.

## Terms

These are registered trademarks of Major League Soccer, L.L.C. and its member
clubs. Downloading them for internal use is not the same as being licensed to
publish them. Keep an installed set private — `.gitignore` already excludes
`assets/logo/` so it will not be committed by accident — and do not redistribute
the marks. See `NOTICE.md`.
