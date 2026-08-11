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

const GROUPS = new Set(['Brand', 'Colors', 'Type', 'Spacing', 'Components', 'Clubs']);
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

/* ---------- 6. docs ---------- */
section('Docs');
const EXPECTED_DOCS = 16;
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
