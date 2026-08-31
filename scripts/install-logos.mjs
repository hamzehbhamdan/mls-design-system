#!/usr/bin/env node
/**
 * Install official MLS, club and league-property marks into the system.
 *
 *   node scripts/install-logos.mjs <source-folder> [<source-folder> ...] [--force] [--dry]
 *
 * This repository ships no marks in git. They are trademarks of Major League
 * Soccer, L.L.C., its member clubs and its properties, and obtaining them is
 * your job: MLS Brand, the league media portal, or the relevant club's
 * communications team.
 *
 * Point this at whatever folders you get back and it will do the rest. It does
 * not care how the files are named -- official packages use
 * "POR_Logo_PRI_FC_RGB_2160x2160.png", other packages use
 * "MLS crest logo RGB - Portland Timbers.svg", and someone's download folder
 * uses "Timbers logo (1).png". All three match.
 *
 * What it does
 *   1. Sorts every file into a bucket: club crest, league crest, league
 *      property, or MLS NEXT member club.
 *   2. Detects which GROUND each file is drawn for -- LTBG/DKBG, 1c_white,
 *      OneColor_Black, "light bg" -- and keeps one mark per ground, because a
 *      crest with a black wordmark disappears on navy and its reversed twin
 *      disappears on white.
 *   3. Prefers the largest raster, measured in pixels rather than guessed from
 *      the filename: "2160x2160" files in the official pack are 2200x2200.
 *   4. Rasterises SVG to PNG, because the Office layer needs raster.
 *   5. Records pixel dimensions, so the deck can centre a non-square mark in
 *      its socket instead of stretching it: the Red Bulls crest is landscape
 *      and San Diego's is portrait.
 *   6. Writes assets/logo/manifest.json, which the deck, the document layer
 *      and the CSS build all read.
 *   7. Prints a coverage report: matched, missing, ambiguous, unused.
 *
 * Nothing else in the system needs editing. Layouts already ask the manifest
 * whether a mark exists and fall back to the lettered socket when it does not,
 * so a partial install is a valid state -- install the ten clubs you have and
 * the other twenty keep their sockets.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, copyFileSync, statSync, openSync, readSync, closeSync } from 'node:fs';
import { join, extname, basename, dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const p = (...x) => join(ROOT, ...x);
const LOGO_DIR = p('assets', 'logo');
const CLUB_DIR = join(LOGO_DIR, 'clubs');
const PROP_DIR = join(LOGO_DIR, 'properties');
const NEXT_DIR = join(LOGO_DIR, 'next-clubs');

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const DRY = args.includes('--dry');
const SRCS = args.filter((a) => !a.startsWith('--'));

if (!SRCS.length) {
  console.error(`
Usage: node scripts/install-logos.mjs <source-folder> [<source-folder> ...] [--force] [--dry]

  <source-folder>  a folder containing the marks, in any naming, nested or flat
  --force          overwrite marks already installed
  --dry            report what would happen, write nothing
`);
  process.exit(1);
}
for (const s of SRCS) {
  if (!existsSync(s)) { console.error(`Source folder not found: ${s}`); process.exit(1); }
}

const clubs = JSON.parse(readFileSync(p('data', 'clubs.json'), 'utf8')).clubs;

/* ---------------------------------------------------------------- *
 * Reading image dimensions
 *
 * Without an external dependency, because this script runs on whatever
 * machine the marks were downloaded to. Dimensions decide which of two
 * candidates wins, and they go into the manifest so the deck can place a
 * non-square mark without distorting it.
 * ---------------------------------------------------------------- */

function readHead(file, n = 65536) {
  const fd = openSync(file, 'r');
  try {
    const buf = Buffer.alloc(n);
    const read = readSync(fd, buf, 0, n, 0);
    return buf.subarray(0, read);
  } finally { closeSync(fd); }
}

function pngSize(b) {
  if (b.length < 24 || b.readUInt32BE(0) !== 0x89504e47) return null;
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

function jpegSize(b) {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const marker = b[i + 1];
    // Standalone markers carry no length.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
    const len = b.readUInt16BE(i + 2);
    // SOF0..SOF15, minus the three that are not frame headers.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return null;
}

function webpSize(b) {
  if (b.length < 30 || b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null;
  const tag = b.toString('ascii', 12, 16);
  if (tag === 'VP8X') return { w: (b.readUIntLE(24, 3) & 0xffffff) + 1, h: (b.readUIntLE(27, 3) & 0xffffff) + 1 };
  if (tag === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (tag === 'VP8L') {
    const n = b.readUInt32LE(21);
    return { w: (n & 0x3fff) + 1, h: ((n >> 14) & 0x3fff) + 1 };
  }
  return null;
}

function svgSize(b) {
  const head = b.toString('utf8', 0, Math.min(b.length, 8192));
  const vb = head.match(/viewBox\s*=\s*["']\s*[-\d.eE]+[ ,]+[-\d.eE]+[ ,]+([\d.eE]+)[ ,]+([\d.eE]+)/);
  if (vb) return { w: Math.round(parseFloat(vb[1])), h: Math.round(parseFloat(vb[2])) };
  const w = head.match(/\bwidth\s*=\s*["']\s*([\d.]+)/);
  const h = head.match(/\bheight\s*=\s*["']\s*([\d.]+)/);
  if (w && h) return { w: Math.round(parseFloat(w[1])), h: Math.round(parseFloat(h[1])) };
  return null;
}

const DIM_CACHE = new Map();
function dimensions(file) {
  if (DIM_CACHE.has(file)) return DIM_CACHE.get(file);
  let d = null;
  try {
    const b = readHead(file);
    d = pngSize(b) || jpegSize(b) || webpSize(b) || svgSize(b);
    if (d && (!(d.w > 0) || !(d.h > 0))) d = null;
  } catch { d = null; }
  DIM_CACHE.set(file, d);
  return d;
}
const area = (f) => { const d = dimensions(f); return d ? d.w * d.h : 0; };

/* ---------------------------------------------------------------- *
 * Grounds
 *
 * A mark is drawn for a ground. Columbus ships LTBG and DKBG: the first has a
 * black wordmark that vanishes on navy, the second a white one that vanishes
 * on white. Both are genuinely required, so the manifest keeps both and the
 * deck asks for the one that suits the surface it is drawing on.
 *
 * 'any' means the file carries no ground marker and works on either, which is
 * the common case: a full-colour crest with its own keyline.
 * ---------------------------------------------------------------- */

const ON_DARK = [
  /\bdk\s*bg\b/i, /\bdark\s*bg\b/i, /\bdarkbg\b/i, /\bon\s*dark\b/i, /\bon\s*black\b/i,
  /\b1c[_-]?white\b/i, /\bonecolou?r[_-]?white\b/i, /\bmono[_-]?rev/i,
  /\brever(se|sed)\b/i, /\bknockout\b/i, /\bwhite\b/i,
];
const ON_LIGHT = [
  /\blt\s*bg\b/i, /\blight\s*bg\b/i, /\blightbg\b/i, /\bon\s*light\b/i, /\bon\s*white\b/i,
  /\b1c[_-]?black\b/i, /\bonecolou?r[_-]?black\b/i, /\bblack\b/i,
];

function groundOf(name) {
  const n = name.replace(/[_-]+/g, ' ');
  if (ON_DARK.some((re) => re.test(n))) return 'dark';
  if (ON_LIGHT.some((re) => re.test(n))) return 'light';
  return 'any';
}

/* Full colour beats one colour on the same ground. */
const isFullColour = (name) => /\bfull\s*colou?r\b|\bfc\b|\b4c\b/i.test(name.replace(/[_-]+/g, ' '));

/* ---------------------------------------------------------------- *
 * Junk
 *
 * macOS zips carry an AppleDouble resource fork for every file, named
 * "._Portland.png" and living under __MACOSX/. They have image extensions and
 * they match club tokens perfectly, so without this every club installs a
 * 4 KB file that is not an image.
 * ---------------------------------------------------------------- */

const isJunk = (full) => {
  const parts = full.split(sep);
  if (parts.includes('__MACOSX')) return true;
  const b = basename(full);
  return b.startsWith('._') || b === '.DS_Store' || b.startsWith('.');
};

/* ---------------------------------------------------------------- *
 * Matching clubs
 *
 * Filenames are normalised down to a bag of meaningful tokens, then scored
 * against each club. The noise list is what makes this work on real packages:
 * "MLS crest logo RGB - Portland Timbers" and "POR_Logo_PRI_FC_RGB_2160x2160"
 * both reduce to {portland, timbers} and {por}.
 * ---------------------------------------------------------------- */

const NOISE = new Set([
  'mls', 'crest', 'logo', 'logos', 'mark', 'badge', 'primary', 'secondary', 'pri', 'sec',
  'rgb', 'cmyk', 'pms', 'pantone', 'hex', 'srgb', 'full', 'fullcolor', 'fullcolour',
  'color', 'colour', 'colored', 'coloured', 'onecolor', 'onecolour', 'onelight', 'ondark',
  'onwhite', 'onblack', 'light', 'dark', 'white', 'black', 'transparent', 'bkgd', 'bg',
  'background', 'nobkgd', 'ltbg', 'dkbg', 'rev', 'reverse', 'reversed', 'knockout',
  'final', 'copy', 'v1', 'v2', 'v3', 'new', 'official', 'brand', 'asset', 'assets',
  'club', 'team', 'soccer', 'football', 'major', 'league', 'vector', 'raster', 'web',
  'print', 'logosheet', 'sheet', 'updated', 'update', 'complete', 'simplified',
  'horizontal', 'vertical', 'horz', 'vert', 'stacked', 'lockup', 'system',
  'large', 'small', 'med', 'medium', 'hi', 'res', 'hires', 'lowres', 'px', 'x', 'xx',
  '1c', '2c', '4c', 'bw',
]);
// Kept out of NOISE because they distinguish clubs: fc, sc, cf, united, city, real.

const tokenise = (s) => String(s)
  .replace(/\.[a-z0-9]+$/i, '')
  .replace(/[_\-–—.()[\]{}]+/g, ' ')
  .replace(/([a-z])([A-Z])/g, '$1 $2')
  .toLowerCase()
  .split(/\s+/)
  .map((t) => t.replace(/[^a-z0-9]/g, ''))
  .filter(Boolean);

const meaningful = (toks) => toks.filter((t) => !NOISE.has(t) && !/^\d+$/.test(t) && !/^\d+x\d+$/.test(t));

/**
 * Abbreviations that are neither the slug nor the tricode.
 *
 * CF Montreal is the one the official pack actually needs: the files are named
 * CFM, the tricode is MTL, and tokenising "CF Montreal" strips the accent to
 * "montral", so nothing matches without this. The rest are here because other
 * people's download folders use them.
 */
const ALIASES = {
  cfm: 'mtl', montreal: 'mtl', montral: 'mtl', impact: 'mtl',
  nyrb: 'rbny', redbull: 'rbny', redbulls: 'rbny',
  nycfc: 'nyc', atlutd: 'atl', galaxy: 'la', quakes: 'sj', revs: 'ne',
  sporting: 'skc', rapids: 'col', dynamo: 'hou', timbers: 'por',
  sounders: 'sea', whitecaps: 'van', earthquakes: 'sj', revolution: 'ne',
};

function clubTokens(c) {
  const names = [c.name, c.nameLocalised].filter(Boolean).join(' ');
  return new Set(meaningful(tokenise(names)));
}
const CLUB_INDEX = clubs.map((c) => ({
  club: c,
  slug: c.slug.toLowerCase(),
  tri: c.tricode.toLowerCase(),
  toks: clubTokens(c),
}));

/** Score a file's tokens against one club. Higher is better; 0 is no match. */
function score(fileToks, entry) {
  const set = new Set(fileToks);
  /* Clubs get written as one word with the suffix welded on: NYCFC, ATLUTD.
   * Stripping the suffix rescues those, but it must score BELOW an exact
   * match or "lafc" ties LAFC against LA Galaxy via the stripped "la" and
   * both get discarded as ambiguous. */
  const stripped = new Set();
  for (const t of fileToks) {
    const bare = t.replace(/(fc|sc|cf|utd|united)$/i, '');
    if (bare.length >= 2 && bare !== t) stripped.add(bare);
  }
  // An explicit alias is the most specific signal there is.
  for (const t of fileToks) if (ALIASES[t] === entry.slug) return 110;
  // An exact slug or tricode token is decisive; nothing else can outrank it.
  if (set.has(entry.slug)) return 100;
  if (set.has(entry.tri)) return 90;
  if (stripped.has(entry.slug)) return 80;
  if (stripped.has(entry.tri)) return 70;
  for (const b of stripped) set.add(b);
  let hits = 0;
  for (const t of entry.toks) if (set.has(t)) hits++;
  if (!hits) return 0;
  // Require a distinctive word, not just "fc" or "city".
  const weak = new Set(['fc', 'sc', 'cf', 'city', 'united', 'real', 'new', 'york', 'los', 'angeles', 'san']);
  const strong = [...entry.toks].some((t) => set.has(t) && !weak.has(t));
  if (!strong) return 0;
  return 40 + hits * 10 + (hits === entry.toks.size ? 15 : 0);
}

const LEAGUE_VARIANTS = [
  { key: 'gradient', name: 'crest-league-gradient', test: (t) => t.includes('gradient') },
  { key: 'monoRev',  name: 'crest-league-mono-rev', test: (t) => t.includes('mono') && (t.includes('rev') || t.includes('reverse')) },
  { key: 'mono',     name: 'crest-league-mono',     test: (t) => t.includes('mono') || t.includes('1c') || t.includes('onecolor') },
  { key: 'primary',  name: 'crest-league',          test: () => true },
];

/* ---------------------------------------------------------------- *
 * League properties
 *
 * MLS NEXT is the league's youth development platform; MLS NEXT Cup and MLS
 * NEXT Fest are its competition and event marks. They are league properties,
 * not clubs, so they get their own bucket and never compete for a club slot.
 *
 * Each property names the file it wants per ground, most preferred first,
 * because the generic ground rules cannot know that MLS NEXT's cyan one-colour
 * mark beats its white one on navy -- both are legible, but only one is still
 * MLS NEXT.
 * ---------------------------------------------------------------- */

const PROPERTIES = [
  {
    key: 'next', name: 'mls-next', label: 'MLS NEXT',
    match: (rel) => /next/i.test(rel) && !/cup|fest|expansion/i.test(rel),
    light: [/fc[_-]?cyan/i, /1c[_-]?black/i],
    dark: [/1c[_-]?cyan/i, /1c[_-]?white/i, /fc[_-]?cyan/i],
  },
  {
    key: 'nextCupHorizontal', name: 'mls-next-cup-horizontal', label: 'MLS NEXT Cup, horizontal',
    match: (rel) => /next/i.test(rel) && /cup/i.test(rel) && /horiz/i.test(rel),
    light: [/fullcolor[_-]?ltbg/i, /ltbg/i, /onecolor[_-]?black/i],
    dark: [/fullcolor[_-]?dkbg/i, /dkbg/i, /onecolor[_-]?white/i],
  },
  {
    key: 'nextCupVertical', name: 'mls-next-cup-vertical', label: 'MLS NEXT Cup, vertical',
    match: (rel) => /next/i.test(rel) && /cup/i.test(rel) && /vert/i.test(rel),
    light: [/fullcolor[_-]?ltbg/i, /ltbg/i, /onecolor[_-]?black/i],
    dark: [/fullcolor[_-]?dkbg/i, /dkbg/i, /onecolor[_-]?white/i],
  },
  {
    key: 'nextFestHorizontal', name: 'mls-next-fest-horizontal', label: 'MLS NEXT Fest, horizontal',
    match: (rel) => /next/i.test(rel) && /fest/i.test(rel) && /horz|horiz/i.test(rel),
    light: [/light\s*bg/i], dark: [/dark\s*bg/i],
  },
  {
    key: 'nextFestVertical', name: 'mls-next-fest-vertical', label: 'MLS NEXT Fest, vertical',
    match: (rel) => /next/i.test(rel) && /fest/i.test(rel) && /vert/i.test(rel),
    light: [/light\s*bg/i], dark: [/dark\s*bg/i],
  },
];

/* MLS NEXT member clubs are third-party youth organisations, not MLS clubs.
 * They are installed and recorded so the pack is complete, and they are wired
 * into no layout -- their names collide with real clubs ("Dallas Hornets",
 * "Houston Rangers", "LA Bulls"), which is exactly why they are claimed by
 * folder path before club scoring ever runs. */
const isNextClub = (rel) => /expansion\s*clubs/i.test(rel);

/* ---------------------------------------------------------------- *
 * Rasterising
 *
 * The Office layer needs raster: pptxgenjs embeds images as parts and
 * PowerPoint's SVG support is inconsistent across versions. The web layer
 * keeps the SVG. First renderer found wins.
 *
 * EPS, AI and PDF are deliberately not accepted. Without Ghostscript
 * ImageMagick returns only the low-resolution TIFF preview embedded in the
 * file -- 416x190, indexed colour -- and installing that instead of the
 * shipped PNG is a silent downgrade.
 * ---------------------------------------------------------------- */

const RASTERISERS = [
  { bin: 'rsvg-convert', args: (i, o, w) => ['-w', String(w), '-o', o, i] },
  { bin: 'inkscape',     args: (i, o, w) => [i, '--export-type=png', `--export-filename=${o}`, `--export-width=${w}`] },
  { bin: 'magick',       args: (i, o, w) => ['-background', 'none', '-density', '600', i, '-resize', `${w}x`, o] },
  { bin: 'convert',      args: (i, o, w) => ['-background', 'none', '-density', '600', i, '-resize', `${w}x`, o] },
];
let RASTER = null;
for (const r of RASTERISERS) {
  try { execFileSync('which', [r.bin], { stdio: 'ignore' }); RASTER = r; break; } catch { /* next */ }
}

function rasterise(src, dest, width = 1024) {
  if (!RASTER) return false;
  try {
    execFileSync(RASTER.bin, RASTER.args(src, dest, width), { stdio: 'ignore' });
    return existsSync(dest) && statSync(dest).size > 0;
  } catch { return false; }
}

/* ---------------------------------------------------------------- *
 * Deck-sized copies
 *
 * The full-resolution mark is what gets installed and kept: it is the asset,
 * and the web layer and any print use want all of it. PowerPoint does not.
 * A crest is never drawn larger than about 2.5in on a 13.33in slide, so 900px
 * on the long edge is still over 300dpi at the largest size any layout uses,
 * and embedding the 2200px original thirty times instead turns a reference
 * deck into a 10 MB file.
 *
 * So each mark gets a second, smaller raster beside it. Nothing is lost: the
 * original stays, and the manifest records both.
 * ---------------------------------------------------------------- */

const DECK_MAX = 900;
const DOWNSCALERS = [
  { bin: 'magick',  args: (i, o, w) => [i, '-resize', `${w}x${w}>`, '-strip', o] },
  { bin: 'convert', args: (i, o, w) => [i, '-resize', `${w}x${w}>`, '-strip', o] },
];
let SCALER = null;
for (const r of DOWNSCALERS) {
  try { execFileSync('which', [r.bin], { stdio: 'ignore' }); SCALER = r; break; } catch { /* next */ }
}

function deckCopy(srcFile, dest) {
  if (!SCALER) return false;
  try {
    execFileSync(SCALER.bin, SCALER.args(srcFile, dest, DECK_MAX), { stdio: 'ignore' });
    return existsSync(dest) && statSync(dest).size > 0;
  } catch { return false; }
}

/* ---------------------------------------------------------------- *
 * Walk and sort
 * ---------------------------------------------------------------- */

const EXT = new Set(['.svg', '.png', '.jpg', '.jpeg', '.webp']);
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (isJunk(full)) continue;
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) walk(full, out);
    else if (EXT.has(extname(name).toLowerCase())) out.push(full);
  }
  return out;
}

const files = [];
const seen = new Set();
for (const s of SRCS) {
  for (const f of walk(resolve(s))) if (!seen.has(f)) { seen.add(f); files.push(f); }
}
if (!files.length) { console.error(`No image files (${[...EXT].join(', ')}) under ${SRCS.join(', ')}`); process.exit(1); }

// Prefer SVG, then PNG: if a candidate appears twice, the better format wins.
const fmtRank = (f) => ({ '.svg': 4, '.png': 3, '.webp': 2, '.jpg': 1, '.jpeg': 1 })[extname(f).toLowerCase()] ?? 0;

/**
 * Is `a` a better candidate than `b` for the same slot?
 *
 * Format first (vector survives any resize), then measured pixels, then file
 * size as a last resort for formats whose header we could not read. Filename
 * is never consulted: the official pack's "2160x2160" files are 2200x2200 and
 * San Diego's "2400x2400" is 1829x2400.
 */
function better(a, b) {
  if (!b) return true;
  if (fmtRank(a) !== fmtRank(b)) return fmtRank(a) > fmtRank(b);
  if (area(a) !== area(b)) return area(a) > area(b);
  try { return statSync(a).size > statSync(b).size; } catch { return false; }
}

/** Per-ground slot: { any, light, dark } -> best file for each. */
const emptySlot = () => ({ any: null, light: null, dark: null });
function offer(slot, file, ground, preferFull = true) {
  const cur = slot[ground];
  if (!cur) { slot[ground] = file; return; }
  // Full colour beats one colour on the same ground, whatever the pixel count.
  if (preferFull && isFullColour(basename(file)) !== isFullColour(basename(cur))) {
    if (isFullColour(basename(file))) slot[ground] = file;
    return;
  }
  if (better(file, cur)) slot[ground] = file;
}

const clubSlots = new Map();   // slug -> slot
const clubScore = new Map();   // slug -> best score seen
const leagueSlots = new Map(); // variant key -> slot
const propSlots = new Map();   // property key -> { light, dark }
const nextClubFiles = new Map(); // name -> file
const ambiguous = [];
const unused = [];

for (const f of files) {
  const rel = f.replace(resolve(SRCS[0]), '');
  const name = basename(f);
  const ground = groundOf(name);

  // MLS NEXT member clubs, claimed by folder before anything can score them
  // as an MLS club.
  if (isNextClub(f)) {
    const stem = name.replace(/\.[a-z0-9]+$/i, '')
      .replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
    if (better(f, nextClubFiles.get(stem))) nextClubFiles.set(stem, f);
    continue;
  }

  // League properties, before both club and league matching: every one of
  // these filenames contains "MLS".
  const prop = PROPERTIES.find((x) => x.match(f));
  if (prop) {
    if (!propSlots.has(prop.key)) propSlots.set(prop.key, []);
    propSlots.get(prop.key).push(f);
    continue;
  }

  const toks = tokenise(name);
  const meaningfulToks = meaningful(toks);
  const scored = CLUB_INDEX
    .map((e) => ({ e, s: score(meaningfulToks, e) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);

  if (scored.length && scored[0].s >= 40) {
    // A near-tie between two different clubs is a guess, and a wrong crest is
    // worse than a missing one.
    if (scored.length > 1 && scored[1].s === scored[0].s && scored[1].e.slug !== scored[0].e.slug) {
      ambiguous.push({ file: f, between: [scored[0].e.slug, scored[1].e.slug] });
      continue;
    }
    const slug = scored[0].e.slug;
    if (!clubSlots.has(slug)) clubSlots.set(slug, emptySlot());
    offer(clubSlots.get(slug), f, ground);
    clubScore.set(slug, Math.max(clubScore.get(slug) ?? 0, scored[0].s));
    continue;
  }

  // No club matched. A league mark is anything that says MLS and does not
  // name a club.
  const flat = toks.join('');
  if (toks.includes('mls') || flat.includes('majorleaguesoccer')) {
    const variant = LEAGUE_VARIANTS.find((v) => v.test(flat));
    if (!leagueSlots.has(variant.key)) leagueSlots.set(variant.key, emptySlot());
    offer(leagueSlots.get(variant.key), f, ground);
    continue;
  }
  unused.push(f);
}

/* Resolve each property's two grounds against its preference list. */
const propResolved = new Map();
for (const prop of PROPERTIES) {
  const cands = propSlots.get(prop.key) || [];
  if (!cands.length) continue;
  const pick = (prefs) => {
    for (const re of prefs) {
      const hits = cands.filter((f) => re.test(basename(f).replace(/[_-]+/g, ' ')) || re.test(basename(f)));
      if (hits.length) return hits.sort((a, b) => (better(a, b) ? -1 : 1))[0];
    }
    return null;
  };
  const light = pick(prop.light) || cands.slice().sort((a, b) => (better(a, b) ? -1 : 1))[0];
  const dark = pick(prop.dark);
  propResolved.set(prop.key, { light, dark: dark && dark !== light ? dark : null });
}

/* ---------------------------------------------------------------- *
 * Install
 * ---------------------------------------------------------------- */

if (!DRY) for (const d of [LOGO_DIR, CLUB_DIR, PROP_DIR, NEXT_DIR]) mkdirSync(d, { recursive: true });

const manifest = {
  note: 'Generated by scripts/install-logos.mjs. Marks are trademarks of Major League Soccer, L.L.C., its member clubs and its properties, and are not redistributed under any licence granted by this repository.',
  generated: new Date().toISOString().slice(0, 10),
  league: {},
  clubs: {},
  properties: {},
  nextClubs: {},
};
const installed = [];
const skipped = [];
const noRaster = [];

const relOf = (abs) => abs.replace(`${ROOT}/`, '');

/** Copy one file in, rasterising SVG, and return its manifest record. */
function place(srcFile, stem, into) {
  const ext = extname(srcFile).toLowerCase();
  const rec = {};
  const vecDest = join(into, `${stem}.svg`);
  const pngDest = join(into, `${stem}.png`);

  if (!FORCE && (existsSync(vecDest) || existsSync(pngDest))) { skipped.push(stem); return null; }

  if (ext === '.svg') {
    if (!DRY) copyFileSync(srcFile, vecDest);
    rec.svg = relOf(vecDest);
    // The Office layer needs raster.
    if (DRY) rec.png = relOf(pngDest);
    else if (rasterise(srcFile, pngDest)) rec.png = relOf(pngDest);
    else noRaster.push(stem);
  } else {
    const dest = join(into, `${stem}${ext === '.jpeg' ? '.jpg' : ext}`);
    if (!DRY) copyFileSync(srcFile, dest);
    rec.png = relOf(dest);
  }
  const d = dimensions(srcFile);
  if (d) { rec.w = d.w; rec.h = d.h; }

  // A smaller raster for the Office layer, only where it would actually help.
  if (rec.png && d && Math.max(d.w, d.h) > DECK_MAX) {
    const deckDest = join(into, `${stem}@deck.png`);
    if (DRY) rec.deckPng = relOf(deckDest);
    else if (deckCopy(join(ROOT, rec.png), deckDest)) rec.deckPng = relOf(deckDest);
  }

  rec.source = basename(srcFile);
  installed.push(stem);
  return rec;
}

/**
 * Install a slot as one record with an optional `onDark` twin.
 *
 * A file with no ground marker serves both. A pack that ships LTBG and DKBG
 * gets two files and the deck picks per surface; a pack that ships one
 * full-colour crest gets one file used everywhere, which is correct -- most
 * club crests carry their own keyline and need no reversed variant.
 */
function installSlot(slot, stem, into) {
  const light = slot.light || slot.any;
  const dark = slot.dark || null;
  if (!light && !dark) return null;
  const base = light || dark;
  const rec = place(base, stem, into);
  if (!rec) return null;
  if (dark && dark !== base) {
    const d = place(dark, `${stem}-on-dark`, into);
    if (d) rec.onDark = d;
  }
  return rec;
}

for (const v of LEAGUE_VARIANTS) {
  const slot = leagueSlots.get(v.key);
  if (!slot) continue;
  const rec = installSlot(slot, v.name, LOGO_DIR);
  if (rec) manifest.league[v.key] = rec;
}

for (const slug of [...clubSlots.keys()].sort()) {
  const rec = installSlot(clubSlots.get(slug), slug, CLUB_DIR);
  if (rec) manifest.clubs[slug] = rec;
}

for (const prop of PROPERTIES) {
  const r = propResolved.get(prop.key);
  if (!r) continue;
  const rec = installSlot({ any: r.light, light: r.light, dark: r.dark }, prop.name, PROP_DIR);
  if (rec) { rec.label = prop.label; manifest.properties[prop.key] = rec; }
}

for (const stem of [...nextClubFiles.keys()].sort()) {
  const rec = place(nextClubFiles.get(stem), stem, NEXT_DIR);
  if (rec) manifest.nextClubs[stem] = rec;
}

const missing = clubs.map((c) => c.slug).filter((s) => !manifest.clubs[s] && !skipped.includes(s));
manifest.missing = missing;

if (!DRY) writeFileSync(join(LOGO_DIR, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

/* ---------------------------------------------------------------- *
 * Report
 * ---------------------------------------------------------------- */
const g = (s) => `\x1b[32m${s}\x1b[0m`, y = (s) => `\x1b[33m${s}\x1b[0m`, r = (s) => `\x1b[31m${s}\x1b[0m`, d = (s) => `\x1b[2m${s}\x1b[0m`;

console.log(`\n${DRY ? 'DRY RUN — nothing written\n' : ''}Scanned ${files.length} file${files.length === 1 ? '' : 's'} under ${SRCS.join(', ')}`);
console.log(`Renderer: ${RASTER ? g(RASTER.bin) : r('none found')}${RASTER ? '' : d('  (install librsvg2-bin, inkscape or imagemagick for SVG -> PNG)')}`);

const leagueKeys = Object.keys(manifest.league);
const clubCount = Object.keys(manifest.clubs).length;
const withDark = Object.values(manifest.clubs).filter((c) => c.onDark).length;
console.log(`\nLeague marks   ${leagueKeys.length ? g(`${leagueKeys.length} installed`) : y('none')}${leagueKeys.length ? d(`  ${leagueKeys.join(', ')}`) : ''}`);
console.log(`Club crests    ${clubCount === 30 ? g('30 / 30') : y(`${clubCount} / 30`)}${withDark ? d(`  (${withDark} with a reversed variant)`) : ''}`);
const propKeys = Object.keys(manifest.properties);
console.log(`Properties     ${propKeys.length ? g(`${propKeys.length} installed`) : d('none')}${propKeys.length ? d(`  ${propKeys.join(', ')}`) : ''}`);
const nc = Object.keys(manifest.nextClubs).length;
if (nc) console.log(`MLS NEXT clubs ${g(`${nc} installed`)}${d('  recorded only; wired into no layout')}`);

if (skipped.length) console.log(`\n${y('Already installed')} (${skipped.length}) — use --force to overwrite\n  ${skipped.join(' ')}`);
if (missing.length) console.log(`\n${y('Missing')} (${missing.length}) — these keep their lettered socket\n  ${missing.join(' ')}`);
if (noRaster.length) console.log(`\n${r('SVG installed but not rasterised')} (${noRaster.length}) — the web layer will use these, the deck will not\n  ${noRaster.join(' ')}`);
if (ambiguous.length) {
  console.log(`\n${y('Ambiguous')} (${ambiguous.length}) — matched two clubs equally well, so neither was used.`);
  console.log(d('  A wrong crest is worse than a missing one. Rename these to the club slug and re-run.'));
  for (const a of ambiguous.slice(0, 10)) console.log(`  ${basename(a.file)}  ${d(`-> ${a.between.join(' or ')}`)}`);
}
if (unused.length) console.log(`\n${d(`Unused (${unused.length}) — matched nothing: ${unused.slice(0, 6).map((f) => basename(f)).join(', ')}${unused.length > 6 ? ' …' : ''}`)}`);

if (!DRY && installed.length) {
  console.log(`\n${g('Done.')} Next:`);
  console.log('  npm run build     # regenerate dist/, including crest CSS');
  console.log('  npm run examples  # rebuild the reference decks with real marks');
}
console.log('');
