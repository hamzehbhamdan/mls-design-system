#!/usr/bin/env node
/**
 * Derive the MLS categorical chart palette.
 *
 * Charts are the most common element in a league deck or report, and a
 * hand-picked chart palette is where accessibility quietly dies. So this
 * searches for one instead of guessing:
 *
 *   1. Fix 8 hue families, anchored on the brand navy and red.
 *   2. Per hue, per mode, generate candidate OKLCH steps that sit inside the
 *      mode's lightness band with margin, hold chroma in a professional range
 *      (not gamut-edge fluorescent), and clear 3:1 on that mode's surface.
 *   3. Search hue ORDER (slot 1 pinned to the brand blue) and pick each slot's
 *      step greedily to maximise the worst adjacent pair under simulated
 *      protanopia and deuteranopia, in BOTH modes simultaneously.
 *   4. Hand the winner to the dataviz validator, which is the authority.
 *
 * Light and dark get different steps from the same hues. One hex cannot clear
 * 3:1 against both white and near-black, so dark is a selected palette, not an
 * automatic flip of the light one.
 *
 * Run: node scripts/gen_chart_palette.mjs
 */

import { validate, contrast } from '/tmp/claude-0/bundled-skills/2.1.228/ac12d75db763594b2c1e1fed1b4ff65d/dataviz/scripts/validate_palette.js';

/* ---------- OKLCH -> sRGB ---------- */
const l2s = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);
const toHex = (r, g, b) => '#' + [r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c * 255))).toString(16).padStart(2, '0')).join('').toUpperCase();
function oklch(L, C, H) {
  const h = (H * Math.PI) / 180, a = C * Math.cos(h), b2 = C * Math.sin(h);
  const l_ = (L + 0.3963377774 * a + 0.2158037573 * b2) ** 3;
  const m_ = (L - 0.1055613458 * a - 0.0638541728 * b2) ** 3;
  const s_ = (L - 0.0894841775 * a - 1.2914855480 * b2) ** 3;
  const rgb = [
     4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_,
  ];
  // A clipped colour is not the colour we asked for, and its measured L and C
  // would no longer match the search. Reject rather than clamp.
  if (rgb.some((c) => c < -0.002 || c > 1.002)) return null;
  return toHex(...rgb.map((c) => l2s(Math.max(0, Math.min(1, c)))));
}

/* ---------- OKLab distance and the CVD simulation the standard names ---------- */
const s2l = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const hexToRgb = (h) => { const s = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) / 255); };
function oklab(hex) {
  const [r, g, b] = hexToRgb(hex).map(s2l);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553*l + 0.7936177850*m - 0.0040720468*s,
          1.9779984951*l - 2.4285922050*m + 0.4505937099*s,
          0.0259040371*l + 0.7827717662*m - 0.8086757660*s];
}
// Machado, Oliveira & Fernandes 2009, severity 1.0 -- the model the standard names.
const CVD = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
};
function simulate(hex, mat) {
  const lin = hexToRgb(hex).map(s2l);
  const out = mat.map((row) => row.reduce((a, k, i) => a + k * lin[i], 0));
  return toHex(...out.map((c) => l2s(Math.max(0, Math.min(1, c)))));
}
const dist = (a, b) => { const A = oklab(a), B = oklab(b); return Math.hypot(A[0]-B[0], A[1]-B[1], A[2]-B[2]) * 100; };
const pairSep = (a, b) => Math.min(
  dist(simulate(a, CVD.protan), simulate(b, CVD.protan)),
  dist(simulate(a, CVD.deutan), simulate(b, CVD.deutan)),
  dist(a, b) * (8 / 15), // normal-vision floor is 15 where CVD target is 8
);

/* ---------- parameters ---------- */

/* Hue anchors in OKLCH degrees. Slot 1 is pinned to the brand navy's hue so the
 * first series in any chart is recognisably MLS. */
const HUES = [
  { key: 'blue',    h: 264 },
  { key: 'orange',  h:  52 },
  { key: 'green',   h: 150 },
  { key: 'purple',  h: 310 },
  { key: 'teal',    h: 195 },
  { key: 'gold',    h:  86 },
  { key: 'magenta', h: 350 },
  { key: 'red',     h:  27 },
];

const MODES = {
  // Bands are the dataviz standard's, pulled in slightly at each end so a step
  // can never land on the boundary and fail on a rounding difference.
  light: { surface: '#FFFFFF', band: [0.44, 0.76], chroma: [0.10, 0.19] },
  dark:  { surface: '#0B0F16', band: [0.49, 0.66], chroma: [0.10, 0.19] },
};

function candidates(hue, { surface, band, chroma }) {
  const out = [];
  for (let L = band[0]; L <= band[1] + 1e-9; L += 0.015) {
    for (let C = chroma[1]; C >= chroma[0] - 1e-9; C -= 0.01) {
      const hex = oklch(L, C, hue);
      if (!hex) continue;
      if (contrast(hex, surface) < 3.0) continue;
      out.push({ hex, L: +L.toFixed(3), C: +C.toFixed(3), cr: +contrast(hex, surface).toFixed(2) });
      break; // most chromatic in-gamut step at this lightness
    }
  }
  return out;
}

const CANDS = {};
for (const [mode, cfg] of Object.entries(MODES)) {
  CANDS[mode] = Object.fromEntries(HUES.map((H) => [H.key, candidates(H.h, cfg)]));
  for (const [k, c] of Object.entries(CANDS[mode])) {
    if (!c.length) { console.error(`no candidate step for ${k} in ${mode}`); process.exit(1); }
  }
}

/* ---------- search ---------- */

const permutations = (arr) => arr.length <= 1 ? [arr] : arr.flatMap((x, i) => permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map((p) => [x, ...p]));

/* Separation target for the greedy step choice.
 *
 * The standard's CVD target is 8. Maximising separation blindly overshoots to
 * ~19 and pays for it in chroma: it pushes every slot to a lightness extreme
 * and the palette comes out muddy -- brown instead of orange, maroon instead of
 * red. That is a bad deck.
 *
 * So satisfice instead. Take the MOST CHROMATIC candidate that still clears a
 * comfortable margin over the target, and only fall back to max-separation if
 * nothing clears it. Safety is a constraint, not the objective. */
const SEP_TARGET = 11;

function buildChain(order, mode) {
  const chosen = [];
  for (const key of order) {
    const opts = CANDS[mode][key];
    if (!chosen.length) {
      // Slot 1: most chromatic available, since it has no neighbour to clear.
      chosen.push({ key, ...opts.reduce((a, b) => (b.C > a.C ? b : a)) });
      continue;
    }
    const prev = chosen.at(-1).hex;
    const scored = opts.map((o) => ({ key, ...o, sep: pairSep(prev, o.hex) }));
    const safe = scored.filter((o) => o.sep >= SEP_TARGET);
    chosen.push(safe.length
      ? safe.reduce((a, b) => (b.C > a.C || (b.C === a.C && b.sep > a.sep) ? b : a))
      : scored.reduce((a, b) => (b.sep > a.sep ? b : a)));
  }
  return chosen;
}

function scoreOrder(order) {
  let worst = Infinity;
  const built = {};
  for (const mode of Object.keys(MODES)) {
    const chain = buildChain(order, mode);
    built[mode] = chain;
    for (let i = 1; i < chain.length; i++) worst = Math.min(worst, pairSep(chain[i - 1].hex, chain[i].hex));
  }
  return { worst, built };
}

let best = null;
for (const p of permutations(HUES.slice(1).map((H) => H.key))) {
  const { worst, built } = scoreOrder(['blue', ...p]);
  if (!best || worst > best.worst) best = { order: ['blue', ...p], worst, built };
}

/* ---------- report ---------- */

console.log(`order: ${best.order.join(' -> ')}   worst adjacency (min of protan/deutan/normal-scaled) ${best.worst.toFixed(1)}\n`);

const result = {};
let hardFail = false;
for (const mode of Object.keys(MODES)) {
  const chain = best.built[mode];
  result[mode] = chain.map(({ key, hex, cr }) => ({ name: key, hex, contrastOnSurface: cr }));
  console.log(`${mode}  ${chain.map((c) => c.hex).join(',')}`);
  const r = validate(chain.map((c) => c.hex), { mode, surface: MODES[mode].surface });
  for (const [name, status, detail] of r.report) {
    const label = status === true ? 'PASS' : String(status).toUpperCase();
    if (status === false || status === 'fail') hardFail = true;
    console.log(`   [${label.padEnd(5)}] ${name.padEnd(22)} ${detail}`);
  }
  console.log('');
}

console.log(hardFail ? 'HARD FAIL present' : 'no hard failures');
console.log('\n' + JSON.stringify(result, null, 2));
