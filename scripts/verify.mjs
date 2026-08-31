#!/usr/bin/env node
/**
 * MLS Design System verification.
 *
 * Fails the build on:
 *   - unresolved token aliases
 *   - a --mls-* variable referenced in CSS but never defined
 *   - any semantic text/background pair below WCAG AA
 *   - any club accent below 3.2:1 on its own background
 *   - malformed club data (bad hex, missing required field)
 *   - a preview file without a @dsCard marker
 *
 * Exit code 1 on any failure, so CI can gate on it.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = (...s) => join(ROOT, ...s);
const read = (f) => readFileSync(p(f), 'utf8');

let failures = 0;
let checks = 0;
const fail = (msg) => { failures++; console.log(`  FAIL  ${msg}`); };
const pass = () => { checks++; };
const section = (name) => console.log(`\n${name}`);

/* ---------- colour maths ---------- */
const s2l = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) / 255);
};
const luminance = (hex) => { const [r, g, b] = hexToRgb(hex).map(s2l); return 0.2126*r + 0.7152*g + 0.0722*b; };
const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

/* ---------- 1. token aliases ---------- */
section('Token integrity');
const tokensRaw = read('tokens/tokens.json');
const unresolved = read('dist/mls.tokens.css').match(/\{[a-z][\w.]*\}/gi);
if (unresolved) fail(`unresolved aliases left in dist/mls.tokens.css: ${[...new Set(unresolved)].join(', ')}`);
else pass();

try { JSON.parse(tokensRaw); pass(); } catch (e) { fail(`tokens.json is not valid JSON: ${e.message}`); }

/* ---------- 2. undefined CSS variables ---------- */
section('CSS variable references');
const cssFiles = [];
const walk = (dir) => {
  for (const f of readdirSync(p(dir))) {
    const rel = join(dir, f);
    if (statSync(p(rel)).isDirectory()) walk(rel);
    else if (f.endsWith('.css')) cssFiles.push(rel);
  }
};
walk('css');

const bundle = read('dist/mls.css');
const defined = new Set([...bundle.matchAll(/(--mls-[\w-]+)\s*:/g)].map((m) => m[1]));
// Locally-scoped custom properties, declared inside a component and consumed
// by that component only. Not global tokens, so not expected in the bundle.
const LOCAL = /^--(mls-)?(btn|badge|alert|crest|notch|duotone|clubs?|stack|cluster|grid|slash)-/;

const missing = new Map();
for (const file of cssFiles) {
  const src = read(file);
  const localDefs = new Set([...src.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
  for (const m of src.matchAll(/var\(\s*(--mls-[\w-]+)/g)) {
    const name = m[1];
    if (defined.has(name) || localDefs.has(name) || LOCAL.test(name)) continue;
    if (!missing.has(name)) missing.set(name, file);
  }
}
if (missing.size) for (const [name, file] of missing) fail(`${name} referenced in ${file} but never defined`);
else pass();

/* ---------- 3. semantic contrast ---------- */
section('Semantic contrast (WCAG 2.2 AA)');
const cssVarValue = (block, name) => {
  const m = block.match(new RegExp(`${name}\\s*:\\s*([^;]+);`));
  return m ? m[1].trim() : null;
};
const rootBlock = bundle.match(/:root\s*\{[\s\S]*?\n\}/)?.[0] ?? '';
const darkBlock = bundle.match(/\[data-theme="dark"\]\s*\{[\s\S]*?\n\}/)?.[0] ?? '';

const PAIRS = [
  ['fg', 'bg', 4.5], ['fg-muted', 'bg', 4.5], ['fg-subtle', 'bg', 3.0],
  ['fg', 'surface', 4.5], ['fg-muted', 'bg-subtle', 4.5],
  ['success', 'bg', 4.5], ['warning', 'bg', 4.5], ['danger', 'bg', 4.5], ['info', 'bg', 4.5],
  ['success', 'success-bg', 4.5], ['warning', 'warning-bg', 4.5], ['danger', 'danger-bg', 4.5], ['info', 'info-bg', 4.5],
  ['live', 'bg', 3.0], ['border-strong', 'bg', 3.0], ['focus', 'bg', 3.0],
  ['accent-base', 'bg', 3.0], ['accent-contrast', 'accent-base', 4.5],
];
for (const [scheme, block] of [['light', rootBlock], ['dark', darkBlock]]) {
  for (const [fg, bg, need] of PAIRS) {
    const a = cssVarValue(block, `--mls-color-${fg}`);
    const b = cssVarValue(block, `--mls-color-${bg}`);
    if (!a || !b) { fail(`${scheme}: missing --mls-color-${!a ? fg : bg}`); continue; }
    const r = contrast(a, b);
    if (r < need) fail(`${scheme}: ${fg} on ${bg} is ${r.toFixed(2)}:1, need ${need} (${a} / ${b})`);
    else pass();
  }
}

/* ---------- 4. club themes ---------- */
section('Club themes');
const { clubs } = JSON.parse(read('dist/mls.clubs.json'));
const src = JSON.parse(read('data/clubs.json'));
const LIGHT = '#FFFFFF';
const DARK = cssVarValue(rootBlock, '--mls-color-brand-black') ?? '#0B0F16';
const HEX = /^#[0-9A-Fa-f]{6}$/;

if (src.clubs.length !== 30) fail(`expected 30 clubs in data/clubs.json, found ${src.clubs.length}`); else pass();

const slugs = new Set(), tricodes = new Set();
for (const c of src.clubs) {
  for (const field of ['slug', 'tricode', 'name', 'conference', 'firstSeason', 'confidence']) {
    if (c[field] === undefined || c[field] === null) fail(`${c.slug ?? '?'}: missing required field "${field}"`);
  }
  if (slugs.has(c.slug)) fail(`duplicate slug "${c.slug}"`); slugs.add(c.slug);
  if (tricodes.has(c.tricode)) fail(`duplicate tricode "${c.tricode}"`); tricodes.add(c.tricode);
  if (!['Eastern', 'Western'].includes(c.conference)) fail(`${c.slug}: bad conference "${c.conference}"`);
  if (!['high', 'medium', 'low', 'unverified'].includes(c.confidence)) fail(`${c.slug}: bad confidence "${c.confidence}"`);
  for (const [k, v] of Object.entries(c.colors)) {
    if (v?.hex != null && !HEX.test(v.hex)) fail(`${c.slug}: ${k} hex "${v.hex}" is not a 6-digit hex`);
  }
  // An unverified club must actually carry a null, not a quietly-guessed value.
  if (c.confidence === 'unverified' && c.colors.primary.hex !== null)
    fail(`${c.slug}: marked unverified but primary carries a value -- either raise the confidence or null the hex`);
  pass();
}

for (const c of clubs) {
  const rl = contrast(c.theme.accentLight, LIGHT);
  const rd = contrast(c.theme.accentDark, DARK);
  if (rl < 3.2) fail(`${c.tricode}: light accent ${c.theme.accentLight} is ${rl.toFixed(2)}:1 on white`); else pass();
  if (rd < 3.2) fail(`${c.tricode}: dark accent ${c.theme.accentDark} is ${rd.toFixed(2)}:1 on ${DARK}`); else pass();
  const fgL = contrast(c.theme.onAccentLight, c.theme.accentLight);
  if (fgL < 4.5) fail(`${c.tricode}: on-accent foreground is ${fgL.toFixed(2)}:1`); else pass();
}

/* ---------- 5. previews ---------- */
/* Full-bleed club surfaces. The failure this guards against is silent and
 * severe: using the dark-mode ACCENT as a field turns a Columbus deck into
 * bright gold slides, because that token is the club colour lightened to
 * read ON dark, not a colour to fill WITH. */
for (const c of clubs) {
  const t = c.theme;
  if (!HEX.test(t.field)) { fail(`${c.tricode}: theme.field "${t.field}" is not a 6-digit hex`); continue; }
  const onFieldRatio = contrast(t.onField, t.field);
  if (onFieldRatio < 4.5) {
    fail(`${c.tricode}: onField ${t.onField} on field ${t.field} is ${onFieldRatio.toFixed(2)}:1, below 4.5`);
  } else if (contrast(t.field, LIGHT) < 7) {
    fail(`${c.tricode}: field ${t.field} is only ${contrast(t.field, LIGHT).toFixed(2)}:1 against white -- too light to be a full-bleed ground`);
  } else if (contrast(t.sparkOnField, t.field) < 3) {
    fail(`${c.tricode}: spark ${t.sparkOnField} on field ${t.field} is ${contrast(t.sparkOnField, t.field).toFixed(2)}:1, below 3`);
  } else if (t.sparkOnField === t.field) {
    fail(`${c.tricode}: spark and field are the same colour`);
  } else pass();
}

section('Deck surfaces');
{
  /* Three designs x three surfaces x 31 palettes. The deck derives its muted
   * and subtle steps by solving for contrast rather than by a fixed mix, so
   * this is the check that keeps that promise honest across every club. */
  const deckMod = await import('../templates/js/mls-deck.cjs').then((m) => m.default ?? m);
  const { theme: deckTheme, DESIGNS } = deckMod;
  const PAIRS = [
    ['ink', 'bg', 4.5], ['inkMuted', 'bg', 4.5], ['inkSubtle', 'bg', 4.5],
    ['onPanel', 'panel', 4.5], ['onPanelMuted', 'panel', 4.5],
    ['spark', 'bg', 3], ['ruleStrong', 'bg', 3], ['figure', 'bg', 4.5],
  ];
  for (const design of Object.keys(DESIGNS)) {
    let worst = Infinity, worstAt = '';
    for (const slug of [null, ...clubs.map((c) => c.slug)]) {
      const th = deckTheme({ club: slug, design });
      for (const [name, surf] of Object.entries(th.surfaces)) {
        for (const [fg, bg, min] of PAIRS) {
          const r = contrast(`#${surf[fg]}`, `#${surf[bg]}`);
          if (r < min) fail(`deck ${design}/${slug ?? 'league'}/${name}: ${fg} on ${bg} is ${r.toFixed(2)}:1, below ${min}`);
          if (r / min < worst) { worst = r / min; worstAt = `${slug ?? 'league'} ${name} ${fg}/${bg} ${r.toFixed(2)}:1`; }
        }
      }
    }
    pass(`design "${design}": 31 palettes x 3 surfaces x ${PAIRS.length} pairs clear; tightest ${worstAt}`);
  }
  // Every design must map all three roles, or a layout asking for one silently
  // falls back to `page` and the design quietly stops being itself.
  for (const [name, D] of Object.entries(DESIGNS)) {
    const missing = ['stage', 'page', 'data'].filter((r) => !D.roles[r]);
    if (missing.length) fail(`design "${name}" is missing role(s): ${missing.join(', ')}`);
    else pass();
  }
}

section('Marks');
{
  /* No marks ship with this repository -- they are trademarks and are not
   * ours to redistribute -- so ZERO installed is the expected state and is
   * never a failure. What this checks is that whatever IS installed is
   * coherent: every manifest entry points at a file that exists, and every
   * club key is a real club. A manifest that references a deleted file is a
   * broken deck, and it fails silently at render time. */
  const mfPath = p('assets/logo/manifest.json');
  if (!existsSync(mfPath)) {
    pass('no marks installed (expected: none ship with this repository)');
  } else {
    const man = JSON.parse(read('assets/logo/manifest.json'));
    const slugs = new Set(clubs.map((c) => c.slug));
    let bad = 0;

    /* Every path a record can carry, including the reversed twin and the
     * deck-sized copy. A manifest that names a file nobody wrote renders as a
     * silently missing crest, not an error. */
    const checkRec = (label, rec) => {
      for (const k of ['svg', 'png', 'deckPng']) {
        if (rec[k] && !existsSync(p(rec[k]))) { fail(`manifest: ${label}.${k} points at a missing file (${rec[k]})`); bad++; }
      }
      if (!rec.svg && !rec.png) { fail(`manifest: ${label} has no file`); bad++; }
      /* macOS zips ship an AppleDouble resource fork per file -- "._POR.png",
       * a few kilobytes, a perfect token match and not an image. Installing
       * one instead of the crest is the failure this size floor catches. */
      const f = rec.png && p(rec.png);
      if (f && existsSync(f) && statSync(f).size < 4096) {
        fail(`manifest: ${label} is ${statSync(f).size} bytes -- almost certainly a resource fork, not a mark`);
        bad++;
      }
      if (rec.onDark) checkRec(`${label}.onDark`, rec.onDark);
    };

    for (const [key, rec] of Object.entries(man.clubs || {})) {
      if (!slugs.has(key)) { fail(`manifest: "${key}" is not a club slug in data/clubs.json`); bad++; continue; }
      checkRec(key, rec);
    }
    for (const [k, rec] of Object.entries(man.league || {})) checkRec(`league.${k}`, rec);
    for (const [k, rec] of Object.entries(man.properties || {})) checkRec(`properties.${k}`, rec);
    for (const [k, rec] of Object.entries(man.nextClubs || {})) checkRec(`nextClubs.${k}`, rec);

    /* The deck centres a mark at its own aspect ratio, which it can only do
     * from recorded dimensions. Without them a landscape crest -- the Red
     * Bulls one -- gets stretched into a square. */
    const noDims = Object.entries(man.clubs || {}).filter(([, r]) => !(r.w > 0 && r.h > 0)).map(([k]) => k);
    if (noDims.length) {
      fail(`${noDims.length} club mark(s) have no recorded dimensions and will be drawn square: ${noDims.join(' ')}`);
      bad++;
    }
    // The Office layer needs raster; an SVG-only club silently vanishes from
    // every deck while still looking fine on the web.
    const vectorOnly = Object.entries(man.clubs || {}).filter(([, r]) => r.svg && !r.png).map(([k]) => k);
    if (vectorOnly.length) {
      fail(`${vectorOnly.length} club mark(s) are SVG-only and will not appear in decks: ${vectorOnly.join(' ')} -- re-run install-logos.mjs with a rasteriser installed`);
      bad++;
    }
    const n = Object.keys(man.clubs || {}).length;
    const rev = Object.values(man.clubs || {}).filter((r) => r.onDark).length;
    const props = Object.keys(man.properties || {}).length;
    if (!bad) {
      pass(`${n}/30 club marks (${rev} with a reversed variant), ${Object.keys(man.league || {}).length} league variant(s), ${props} propert${props === 1 ? 'y' : 'ies'} installed, all resolvable`);
    }
  }
}

section('Previews');
const previews = [];
const walkPv = (dir) => {
  for (const f of readdirSync(p(dir))) {
    const rel = join(dir, f);
    if (statSync(p(rel)).isDirectory()) walkPv(rel);
    else if (f.endsWith('.html')) previews.push(rel);
  }
};
walkPv('previews');

const GROUPS = new Set(['Brand', 'Colors', 'Type', 'Spacing', 'Components', 'Clubs', 'Documents', 'Charts']);
for (const file of previews) {
  const first = read(file).split('\n')[0];
  const m = first.match(/^<!--\s*@dsCard\s+(.*?)-->/);
  if (!m) { fail(`${file}: first line is not a @dsCard marker`); continue; }
  const group = m[1].match(/group="([^"]+)"/)?.[1];
  const name = m[1].match(/name="([^"]+)"/)?.[1];
  if (!group || !GROUPS.has(group)) fail(`${file}: @dsCard group "${group}" is not one of ${[...GROUPS].join(', ')}`);
  else if (!name) fail(`${file}: @dsCard has no name`);
  else pass();
}
if (!previews.length) fail('no preview files found');

/* ---------- 5b. Office layer ---------- */
section('Office layer (decks and documents)');
for (const f of ['templates/js/mls-deck.cjs', 'templates/js/mls-doc.cjs',
                 'templates/examples/build-deck.cjs', 'templates/examples/build-doc.cjs',
                 'templates/office/mls-theme.thmx', 'templates/office/theme1.xml',
                 'css/print.css']) {
  if (!existsSync(p(f))) fail(`missing ${f}`); else pass();
}

// The theme's six accent slots must match the first six categorical chart
// colours. Office assigns accents to chart series in order, so a drift here
// silently repaints every chart in the organisation.
const themeXml = existsSync(p('templates/office/theme1.xml')) ? read('templates/office/theme1.xml') : '';
const tokensObj = JSON.parse(read('dist/mls.tokens.json')).tokens;
for (let i = 1; i <= 6; i++) {
  const want = String(tokensObj.chart.categorical.light[String(i)]).replace('#', '').toUpperCase();
  const got = themeXml.match(new RegExp(`<a:accent${i}><a:srgbClr val="([0-9A-F]{6})"`))?.[1];
  if (got !== want) fail(`theme accent${i} is ${got}, expected chart slot ${i} (${want}) -- run npm run build`);
  else pass();
}

// Every categorical slot must clear the chroma-free contrast floor on its own
// surface, in both modes. The full six-check validation lives in
// scripts/gen_chart_palette.mjs; this is the regression guard.
for (const [mode, surface] of [['light', '#FFFFFF'], ['dark', tokensObj.color.brand.black]]) {
  for (let i = 1; i <= 8; i++) {
    const c = tokensObj.chart.categorical[mode][String(i)];
    const r = contrast(c, surface);
    if (r < 3.0) fail(`chart ${mode} slot ${i} (${c}) is ${r.toFixed(2)}:1 on ${surface}`); else pass();
  }
}

/* ---------- 6. docs ---------- */
section('Docs');
const EXPECTED_DOCS = 19;
const docs = readdirSync(p('docs')).filter((f) => f.endsWith('.md'));
if (docs.length < EXPECTED_DOCS) fail(`expected ${EXPECTED_DOCS} docs, found ${docs.length}`); else pass();
for (const f of ['README.md', 'NOTICE.md', 'claude/CLAUDE.md', 'assets/logo/README.md', 'assets/fonts/README.md']) {
  if (!existsSync(p(f))) fail(`missing ${f}`); else pass();
}

/* ---------- report ---------- */
console.log(`\n${'='.repeat(52)}`);
console.log(failures === 0
  ? `PASS  ${checks} checks, 0 failures`
  : `FAIL  ${checks} passed, ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
