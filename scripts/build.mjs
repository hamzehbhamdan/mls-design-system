#!/usr/bin/env node
/**
 * MLS Design System build.
 *
 * Reads:   tokens/tokens.json  (W3C DTCG)  +  data/clubs.json
 * Writes:  dist/*.css, dist/*.scss, dist/*.js, dist/*.json, dist/tailwind.preset.js
 *
 * Nothing in dist/ is hand-edited. Run `npm run build` after touching either source.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = (...s) => join(ROOT, ...s);
const read = (f) => readFileSync(p(f), 'utf8');
const readJSON = (f) => JSON.parse(read(f));

mkdirSync(p('dist'), { recursive: true });

/* ------------------------------------------------------------------ *
 * Colour maths. Needed for the club-accent auto-correction below.
 * ------------------------------------------------------------------ */

const s2l = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const l2s = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) / 255);
}
const rgbToHex = (r, g, b) =>
  '#' + [r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c * 255))).toString(16).padStart(2, '0')).join('').toUpperCase();

function rgbToOklab([r, g, b]) {
  [r, g, b] = [s2l(r), s2l(g), s2l(b)];
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
}
function oklabToRgb([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [
     4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ].map((c) => l2s(Math.max(0, Math.min(1, c))));
}

const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map(s2l);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
/** Best of white / near-black as a foreground on `bg`. */
const bestForeground = (bg) =>
  contrast('#FFFFFF', bg) >= contrast('#0B0F16', bg) ? '#FFFFFF' : '#0B0F16';

/**
 * Nudge a colour's lightness in OKLab until it clears `target` contrast
 * against `bg`, keeping hue and chroma. This is how a black club colour
 * (LAFC, D.C. United) becomes a usable dark-theme accent without turning
 * into a different colour, and how a pale one (Columbus gold, Sporting
 * blue, Inter Miami pink) becomes usable on white.
 *
 * Returns the original if it already passes, or the best reachable value.
 */
function fitContrast(hex, bg, target = 3.2) {
  if (contrast(hex, bg) >= target) return hex;
  const [L0, a, b] = rgbToOklab(hexToRgb(hex));
  const bgLight = luminance(bg) > 0.4;
  const dir = bgLight ? -1 : 1; // darken on light backgrounds, lighten on dark
  let best = hex, bestRatio = contrast(hex, bg);
  for (let i = 1; i <= 100; i++) {
    const L = Math.max(0, Math.min(1, L0 + dir * i * 0.01));
    const cand = rgbToHex(...oklabToRgb([L, a, b]));
    const ratio = contrast(cand, bg);
    if (ratio > bestRatio) { bestRatio = ratio; best = cand; }
    if (ratio >= target) return cand;
    if (L === 0 || L === 1) break;
  }
  return best;
}
/** Flat tint of a colour toward a background, for muted surfaces. */
function mix(hex, toward, amount) {
  const A = hexToRgb(hex), B = hexToRgb(toward);
  return rgbToHex(...A.map((c, i) => c + (B[i] - c) * amount));
}

/**
 * An accent has to satisfy two constraints at once:
 *   (a) >= `bgTarget` against the page background, so it is visible;
 *   (b) >= `fgTarget` against white OR near-black, so a label placed on it
 *       (a primary button) is legible.
 *
 * Mid-lightness colours can fail (b) while passing (a) -- San Diego's
 * "Chrome" #697A7C sits exactly there, at 4.49:1 to white and 4.27:1 to
 * black, missing both. `fitContrast` alone would happily return it.
 *
 * So: walk lightness outward in both directions and take the first value
 * that clears both, preferring the smaller move so the colour stays as
 * close to the club's as possible.
 */
function fitAccent(hex, bg, bgTarget = 3.2, fgTarget = 4.5) {
  const ok = (c) => contrast(c, bg) >= bgTarget && contrast(bestForeground(c), c) >= fgTarget;
  const start = fitContrast(hex, bg, bgTarget);
  if (ok(start)) return start;

  const [L0, a, b] = rgbToOklab(hexToRgb(start));
  for (let i = 1; i <= 100; i++) {
    for (const dir of [-1, 1]) {
      const L = L0 + dir * i * 0.01;
      if (L < 0 || L > 1) continue;
      const cand = rgbToHex(...oklabToRgb([L, a, b]));
      if (ok(cand)) return cand;
    }
  }
  return start;
}

/* ------------------------------------------------------------------ *
 * Token flattening + alias resolution
 * ------------------------------------------------------------------ */

const tokens = readJSON('tokens/tokens.json');

function flatten(node, path = [], out = {}) {
  for (const [key, val] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    if (val && typeof val === 'object' && '$value' in val) {
      out[[...path, key].join('.')] = { value: val.$value, description: val.$description, ext: val.$extensions };
    } else if (val && typeof val === 'object') {
      flatten(val, [...path, key], out);
    }
  }
  return out;
}

const flat = flatten(tokens);

function resolve(value, seen = new Set()) {
  if (typeof value !== 'string') return value;
  return value.replace(/\{([^}]+)\}/g, (_, ref) => {
    if (seen.has(ref)) throw new Error(`Circular token alias: ${ref}`);
    const target = flat[ref];
    if (!target) throw new Error(`Unresolved token alias: {${ref}}`);
    return resolve(target.value, new Set([...seen, ref]));
  });
}

const resolved = Object.fromEntries(
  Object.entries(flat).map(([k, v]) => [k, { ...v, value: resolve(v.value) }])
);

/** color.primitive.red.600 -> --mls-color-primitive-red-600 */
const cssVar = (key) => '--mls-' + key.replace(/\./g, '-');

function formatValue(key, v) {
  if (Array.isArray(v)) return `cubic-bezier(${v.join(', ')})`;
  return String(v);
}

/* ------------------------------------------------------------------ *
 * 1. dist/mls.tokens.css
 * ------------------------------------------------------------------ */

const BANNER = `/* ============================================================
 * MLS Design System -- generated file. Do not edit.
 * Source: tokens/tokens.json + data/clubs.json
 * Rebuild: npm run build
 * ============================================================ */\n`;

const isSemantic = (k) => k.startsWith('color.semantic.');
const isAccent = (k) => k.startsWith('color.accent.');
const semanticRole = (k) => k.split('.').slice(3).join('-');

// color.accent.* is emitted per-theme rather than globally: the default
// league accent needs the same dark-mode contrast correction the club
// themes get, or the red sits at ~4:1 on near-black and every primary
// button in dark mode is a near-miss.
const globalTokens = Object.entries(resolved).filter(([k]) => !isSemantic(k) && !isAccent(k));
const lightTokens = Object.entries(resolved).filter(([k]) => k.startsWith('color.semantic.light.'));
const darkTokens  = Object.entries(resolved).filter(([k]) => k.startsWith('color.semantic.dark.'));

const emitBlock = (entries, map = (k) => cssVar(k)) =>
  entries.map(([k, v]) => `  ${map(k)}: ${formatValue(k, v.value)};`).join('\n');

const semanticMap = (k) => `--mls-color-${semanticRole(k)}`;

const LIGHT_BG_HEX = '#FFFFFF';
const DARK_BG_HEX = resolved['color.brand.black'].value;
const accentBase = resolved['color.accent.base'].value;

const accentBlock = (bg, indent = '  ') => {
  const base = fitContrast(accentBase, bg, 3.2);
  return [
    `${indent}--mls-color-accent-base: ${base};`,
    `${indent}--mls-color-accent-contrast: ${bestForeground(base)};`,
    `${indent}--mls-color-accent-muted: ${mix(base, bg, 0.86)};`,
    `${indent}--mls-color-accent-emphasis: ${fitContrast(base, bg, 5.5)};`,
  ].join('\n');
};

let tokensCss = BANNER + `
:root {
${emitBlock(globalTokens)}

  /* semantic -- light (default) */
${emitBlock(lightTokens, semanticMap)}

  /* accent slot -- overridden wholesale by any [data-club] theme */
${accentBlock(LIGHT_BG_HEX)}

  color-scheme: light;
}

/* Explicit opt-in dark. Wins over the media query below. */
[data-theme="dark"] {
${emitBlock(darkTokens, semanticMap)}
${accentBlock(DARK_BG_HEX)}
  color-scheme: dark;
}

/* System preference, only when the author has not pinned a theme. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${emitBlock(darkTokens, semanticMap).replace(/^ {2}/gm, '    ')}
${accentBlock(DARK_BG_HEX, '    ')}
    color-scheme: dark;
  }
}
`;
writeFileSync(p('dist/mls.tokens.css'), tokensCss);

/* ------------------------------------------------------------------ *
 * 2. dist/mls.tokens.scss
 * ------------------------------------------------------------------ */

const scss = BANNER + '\n' + Object.entries(resolved)
  .map(([k, v]) => `$mls-${k.replace(/\./g, '-')}: ${formatValue(k, v.value)};`)
  .join('\n') + '\n';
writeFileSync(p('dist/mls.tokens.scss'), scss);

/* ------------------------------------------------------------------ *
 * 3. dist/mls.tokens.js + .d.ts
 * ------------------------------------------------------------------ */

function nest(entries) {
  const root = {};
  for (const [k, v] of entries) {
    const parts = k.split('.');
    let node = root;
    parts.slice(0, -1).forEach((seg) => (node = node[seg] ??= {}));
    node[parts.at(-1)] = Array.isArray(v.value) ? `cubic-bezier(${v.value.join(', ')})` : v.value;
  }
  return root;
}
const nested = nest(Object.entries(resolved));
writeFileSync(
  p('dist/mls.tokens.js'),
  BANNER + `\nexport const tokens = ${JSON.stringify(nested, null, 2)};\nexport default tokens;\n`
);
writeFileSync(
  p('dist/mls.tokens.json'),
  JSON.stringify({ $generated: true, tokens: nested }, null, 2) + '\n'
);
writeFileSync(
  p('dist/mls.tokens.d.ts'),
  BANNER + `\ndeclare const tokens: ${toDts(nested)};\nexport { tokens };\nexport default tokens;\n`
);
function toDts(o, indent = '  ') {
  if (typeof o !== 'object') return 'string';
  const body = Object.entries(o)
    .map(([k, v]) => `${indent}${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${typeof v === 'object' ? toDts(v, indent + '  ') : typeof v === 'number' ? 'number' : 'string'};`)
    .join('\n');
  return `{\n${body}\n${indent.slice(2)}}`;
}

/* ------------------------------------------------------------------ *
 * 4. Club themes -> dist/mls.clubs.css + dist/mls.clubs.json
 * ------------------------------------------------------------------ */

const clubsSrc = readJSON('data/clubs.json');
const LIGHT_BG = '#FFFFFF';
const DARK_BG = resolved['color.brand.black'].value;

const clubOut = [];
const clubCss = [];
const warnings = [];

/** OKLab chroma. Near-zero means the colour is black, white or a grey. */
const chroma = (hex) => {
  const [, a, b] = rgbToOklab(hexToRgb(hex));
  return Math.hypot(a, b);
};

for (const club of clubsSrc.clubs) {
  const { primary, secondary, tertiary } = club.colors;
  const raw = primary.hex ?? secondary.hex ?? tertiary?.hex;

  if (!raw) {
    warnings.push(`${club.tricode}: no usable hex at all -- theme omitted. (${club.notes ?? ''})`);
    continue;
  }
  if (!primary.hex) {
    warnings.push(`${club.tricode}: primary is unverified; theme derived from "${secondary.name}" instead.`);
  }

  /*
   * Choosing the UI accent.
   *
   * A club whose primary is achromatic -- LAFC and D.C. United are both
   * black -- has no usable digital accent in that colour. Lightening black
   * gives grey, which is not a brand colour, it is an absence of one. Both
   * clubs already use their secondary as their digital accent in practice
   * (LAFC's gold is everywhere; D.C.'s red is the interface colour).
   *
   * So: if the primary is achromatic and fails on a given background,
   * promote the first chromatic club colour that can be made to pass.
   * Otherwise nudge the primary's lightness in OKLab, keeping hue and
   * chroma, until it clears 3.2:1.
   */
  const palette = [primary.hex, secondary.hex, tertiary?.hex].filter(Boolean);
  const ACHROMATIC = 0.02;

  function pickAccent(bg) {
    if (chroma(raw) > ACHROMATIC || contrast(raw, bg) >= 3.2) return fitAccent(raw, bg);
    const chromatic = palette.find((c) => chroma(c) > ACHROMATIC);
    return chromatic ? fitAccent(chromatic, bg) : fitAccent(raw, bg);
  }

  // The raw club colour is preserved untouched for crest/badge use, where
  // fidelity is a brand and licensing requirement. The UI accent is a
  // separate, contrast-corrected value. Never conflate the two.
  const accentLight = pickAccent(LIGHT_BG);
  const accentDark  = pickAccent(DARK_BG);
  if (chroma(raw) <= ACHROMATIC && (accentLight !== raw || accentDark !== raw)) {
    warnings.push(`${club.tricode}: primary "${primary.name}" is achromatic; UI accent promoted to a chromatic club colour. --mls-club-primary still holds ${raw}.`);
  }

  const entry = {
    ...club,
    theme: {
      raw,
      accentLight,
      accentDark,
      onAccentLight: bestForeground(accentLight),
      onAccentDark: bestForeground(accentDark),
      mutedLight: mix(raw, LIGHT_BG, 0.88),
      mutedDark: mix(raw, DARK_BG, 0.82),
      corrected: accentLight !== raw || accentDark !== raw,
      contrast: {
        rawOnWhite: +contrast(raw, LIGHT_BG).toFixed(2),
        rawOnDark: +contrast(raw, DARK_BG).toFixed(2),
        accentLightOnWhite: +contrast(accentLight, LIGHT_BG).toFixed(2),
        accentDarkOnDark: +contrast(accentDark, DARK_BG).toFixed(2),
      },
    },
  };
  clubOut.push(entry);

  const t = entry.theme;
  clubCss.push(
`/* ${club.name}${club.nameLocalised ? ` (${club.nameLocalised})` : ''} -- ${club.conference}, since ${club.firstSeason}. Colour confidence: ${club.confidence}.${t.corrected ? ' Accent contrast-corrected for UI; --mls-club-primary holds the true brand value.' : ''} */
[data-club="${club.slug}"] {
  --mls-club-name: "${club.nameLocalised ?? club.name}";
  --mls-club-tricode: "${club.tricode}";
  --mls-club-primary: ${t.raw};
  --mls-club-secondary: ${secondary.hex ?? t.raw};
  --mls-club-tertiary: ${tertiary?.hex ?? secondary.hex ?? t.raw};
  --mls-color-accent-base: ${t.accentLight};
  --mls-color-accent-contrast: ${t.onAccentLight};
  --mls-color-accent-muted: ${t.mutedLight};
  --mls-color-border-accent: ${t.accentLight};
}
[data-club="${club.slug}"][data-theme="dark"],
[data-theme="dark"] [data-club="${club.slug}"] {
  --mls-color-accent-base: ${t.accentDark};
  --mls-color-accent-contrast: ${t.onAccentDark};
  --mls-color-accent-muted: ${t.mutedDark};
  --mls-color-border-accent: ${t.accentDark};
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) [data-club="${club.slug}"],
  [data-club="${club.slug}"]:where(:root:not([data-theme="light"]) *) {
    --mls-color-accent-base: ${t.accentDark};
    --mls-color-accent-contrast: ${t.onAccentDark};
    --mls-color-accent-muted: ${t.mutedDark};
    --mls-color-border-accent: ${t.accentDark};
  }
}`
  );
}

writeFileSync(
  p('dist/mls.clubs.css'),
  BANNER + `
/* Club themes.
 *
 * Usage:  <div data-club="por"> ... </div>
 *
 * Two distinct values per club, and the distinction is load-bearing:
 *   --mls-club-primary        the club's TRUE brand colour, never altered.
 *                             Use for crests, badges, kit swatches, anywhere
 *                             fidelity is a brand or licensing requirement.
 *   --mls-color-accent-base   a contrast-corrected derivative for UI chrome.
 *                             Guaranteed >= 3.2:1 on the active background.
 *
 * Correcting the first would be a brand violation. Not correcting the
 * second would make ${clubOut.filter(c => c.theme.corrected).length} of ${clubOut.length} club themes fail WCAG.
 */
` + clubCss.join('\n\n') + '\n'
);

writeFileSync(
  p('dist/mls.clubs.json'),
  JSON.stringify({ $generated: true, meta: clubsSrc.meta, clubs: clubOut }, null, 2) + '\n'
);

// Classic script, not a module and not JSON. `fetch()` and ES-module imports
// are both blocked by CORS over file://, so a plain <script> is the only way
// index.html and the club preview work when someone unzips this and opens the
// file directly with no server. That is the common case, so it wins.
writeFileSync(
  p('dist/mls.clubs.data.js'),
  BANNER + `\nwindow.MLS_CLUBS = ${JSON.stringify(clubOut)};\nwindow.MLS_CLUBS_META = ${JSON.stringify(clubsSrc.meta)};\n`
);

/* ------------------------------------------------------------------ *
 * 4b. docs/13-clubs.md -- generated so the table can never drift from
 *     the data it documents.
 * ------------------------------------------------------------------ */

const CONF_LABEL = { high: 'High', medium: 'Medium', low: '**Low**', unverified: '**Unverified**' };
const hexCell = (c) => (c?.hex ? `\`${c.hex}\` ${c.name}` : c?.name ? `— *${c.name}, no published value*` : '—');

const clubRow = (c) =>
  `| **${c.nameLocalised ?? c.name}** | \`${c.tricode}\` | ${c.firstSeason} | ${hexCell(c.colors.primary)} | ${hexCell(c.colors.secondary)} | ${hexCell(c.colors.tertiary)} | ${CONF_LABEL[c.confidence]} |`;

const conf = (name) => clubOut.filter((c) => c.conference === name).map(clubRow).join('\n');
const notes = clubOut.filter((c) => c.notes).map((c) => `**${c.nameLocalised ?? c.name}** — ${c.notes}`).join('\n\n');
const correctedRows = corrected2().map(
  (c) => `| \`${c.tricode}\` | \`${c.theme.raw}\` | \`${c.theme.accentLight}\` (${c.theme.contrast.accentLightOnWhite}:1) | \`${c.theme.accentDark}\` (${c.theme.contrast.accentDarkOnDark}:1) |`
).join('\n');
function corrected2() { return clubOut.filter((c) => c.theme.corrected); }

writeFileSync(p('docs/13-clubs.md'), `<!-- GENERATED by scripts/build.mjs from data/clubs.json. Do not edit. -->
# Clubs

Thirty clubs for the ${clubsSrc.meta.season} season, fifteen per conference. ${clubsSrc.meta.season} is the first MLS season in over twenty years with no expansion club added or planned; San Diego FC (2025) remains the most recent addition.

> **${clubsSrc.meta.warning}**
>
> Every value carries a confidence rating. Where sources disagree materially the value is marked **Low**; where no trustworthy value exists it is \`null\` rather than a guess. Full per-club disagreements are listed at the bottom of this page and in \`data/clubs.json\`.
>
> ${clubsSrc.meta.printVsScreen}

## Confidence key

| Rating | Meaning |
|---|---|
| High | ${clubsSrc.meta.confidenceLegend.high} |
| Medium | ${clubsSrc.meta.confidenceLegend.medium} |
| **Low** | ${clubsSrc.meta.confidenceLegend.low} |
| **Unverified** | ${clubsSrc.meta.confidenceLegend.unverified} |

## Eastern Conference

| Club | Code | Since | Primary | Secondary | Tertiary | Conf. |
|---|---|---|---|---|---|---|
${conf('Eastern')}

## Western Conference

| Club | Code | Since | Primary | Secondary | Tertiary | Conf. |
|---|---|---|---|---|---|---|
${conf('Western')}

## Theming

\`\`\`html
<div data-club="por">…</div>
\`\`\`

Sets \`--mls-club-primary\` / \`-secondary\` / \`-tertiary\` (true brand values, never altered) and \`--mls-color-accent-*\` (contrast-corrected for UI). See [03 Colour](03-color.md).

## Contrast-corrected accents

${correctedRows.split('\n').length} of ${clubOut.length} club primaries fail contrast on at least one background and are corrected in OKLab, adjusting lightness only so hue and chroma survive. **\`--mls-club-primary\` always holds the true, uncorrected value.**

Where a primary is achromatic — LAFC and D.C. United are both black — the accent is promoted to a chromatic club colour instead, because lightening black gives grey, and grey is the absence of a brand colour rather than one.

| Code | True colour | UI accent, light | UI accent, dark |
|---|---|---|---|
${correctedRows}

## Naming

See [09 Vocabulary](09-vocabulary.md) for suffix placement, second-reference forms, and the plural-verb rule. There is no pattern for suffix placement — it is a lookup table, and \`data/clubs.json\` is that table.

## Per-club notes and disagreements

${notes}
`);

/* ------------------------------------------------------------------ *
 * 5. Tailwind preset
 * ------------------------------------------------------------------ */

const semanticRoles = [...new Set(lightTokens.map(([k]) => semanticRole(k)))];
const twColors = {
  ...Object.fromEntries(semanticRoles.map((r) => [r, `var(--mls-color-${r})`])),
  accent: {
    DEFAULT: 'var(--mls-color-accent-base)',
    contrast: 'var(--mls-color-accent-contrast)',
    muted: 'var(--mls-color-accent-muted)',
    emphasis: 'var(--mls-color-accent-emphasis)',
  },
  club: {
    primary: 'var(--mls-club-primary)',
    secondary: 'var(--mls-club-secondary)',
    tertiary: 'var(--mls-club-tertiary)',
  },
};
for (const ramp of Object.keys(tokens.color.primitive)) {
  if (ramp.startsWith('$')) continue;
  twColors[ramp] = Object.fromEntries(
    Object.keys(tokens.color.primitive[ramp])
      .filter((s) => !s.startsWith('$'))
      .map((s) => [s, `var(--mls-color-primitive-${ramp}-${s})`])
  );
}

const pick = (prefix) =>
  Object.fromEntries(
    Object.entries(resolved)
      .filter(([k]) => k.startsWith(prefix + '.'))
      .map(([k, v]) => [k.slice(prefix.length + 1), `var(${cssVar(k)})`])
  );

writeFileSync(
  p('dist/tailwind.preset.js'),
  BANNER + `
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: ${JSON.stringify(twColors, null, 6).replace(/\n/g, '\n      ')},
      fontFamily: ${JSON.stringify(pick('font'), null, 6).replace(/\n/g, '\n      ')},
      fontSize: ${JSON.stringify(pick('fontSize'), null, 6).replace(/\n/g, '\n      ')},
      fontWeight: ${JSON.stringify(pick('fontWeight'), null, 6).replace(/\n/g, '\n      ')},
      lineHeight: ${JSON.stringify(pick('lineHeight'), null, 6).replace(/\n/g, '\n      ')},
      letterSpacing: ${JSON.stringify(pick('letterSpacing'), null, 6).replace(/\n/g, '\n      ')},
      spacing: ${JSON.stringify(pick('space'), null, 6).replace(/\n/g, '\n      ')},
      borderRadius: ${JSON.stringify(pick('radius'), null, 6).replace(/\n/g, '\n      ')},
      borderWidth: ${JSON.stringify(pick('borderWidth'), null, 6).replace(/\n/g, '\n      ')},
      boxShadow: ${JSON.stringify(pick('shadow'), null, 6).replace(/\n/g, '\n      ')},
      transitionDuration: ${JSON.stringify(pick('duration'), null, 6).replace(/\n/g, '\n      ')},
      transitionTimingFunction: ${JSON.stringify(pick('easing'), null, 6).replace(/\n/g, '\n      ')},
      zIndex: ${JSON.stringify(pick('zIndex'), null, 6).replace(/\n/g, '\n      ')},
      screens: ${JSON.stringify(Object.fromEntries(Object.entries(pick('breakpoint')).map(([k]) => [k, resolved['breakpoint.' + k].value])), null, 6).replace(/\n/g, '\n      ')},
    },
  },
};
`
);

/* ------------------------------------------------------------------ *
 * 6. Bundle the CSS layer -> dist/mls.css
 * ------------------------------------------------------------------ */

const CSS_ORDER = ['reset.css', 'base.css', 'utilities.css'];
const componentFiles = existsSync(p('css/components'))
  ? readdirSync(p('css/components')).filter((f) => f.endsWith('.css')).sort()
  : [];

let bundle = BANNER + '\n' + read('dist/mls.tokens.css').replace(BANNER, '') + '\n';
for (const f of CSS_ORDER) {
  if (existsSync(p('css', f))) bundle += `\n/* ---- css/${f} ---- */\n` + read(`css/${f}`) + '\n';
}
for (const f of componentFiles) {
  bundle += `\n/* ---- css/components/${f} ---- */\n` + read(`css/components/${f}`) + '\n';
}
bundle += `\n/* ---- club themes ---- */\n` + read('dist/mls.clubs.css').replace(BANNER, '') + '\n';
writeFileSync(p('dist/mls.css'), bundle);

/* ------------------------------------------------------------------ *
 * Report
 * ------------------------------------------------------------------ */

const corrected = clubOut.filter((c) => c.theme.corrected);
console.log(`tokens        ${Object.keys(resolved).length} resolved`);
console.log(`club themes   ${clubOut.length}/${clubsSrc.clubs.length} emitted, ${corrected.length} contrast-corrected`);
console.log(`css bundle    ${(bundle.length / 1024).toFixed(1)} kB from ${CSS_ORDER.length + componentFiles.length} files`);
if (warnings.length) {
  console.log('\nwarnings:');
  warnings.forEach((w) => console.log('  ! ' + w));
}
console.log('\ncontrast-corrected clubs (raw colour preserved in --mls-club-primary):');
corrected.forEach((c) =>
  console.log(
    `  ${c.tricode.padEnd(5)} ${c.theme.raw}  light->${c.theme.accentLight} (${c.theme.contrast.accentLightOnWhite}:1)  dark->${c.theme.accentDark} (${c.theme.contrast.accentDarkOnDark}:1)`
  )
);
