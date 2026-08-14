/**
 * MLS Design System — PowerPoint layer
 *
 *   const { createDeck } = require('./templates/js/mls-deck.cjs');
 *   const deck = createDeck({ design: 'press', club: 'por' });
 *   deck.title({ eyebrow: 'Board of Governors', title: 'Season review' });
 *   await deck.save('review.pptx');
 *
 * 30 layouts, three designs, 30 club themes. Colours and measurements are read
 * from dist/ at require time, so a token change propagates with no edit here.
 *
 * ===========================================================================
 * THREE DESIGNS
 *
 * Not three colour schemes. Three different ideas about what a slide is, each
 * carried across all 30 layouts:
 *
 *   report    Light throughout. Regular display weight, wide margins,
 *             hairlines instead of fills, numbers instead of bullets. Reads as
 *             a league annual report. The calmest, and the least "sports".
 *
 *   kickoff   Photography opens and divides, navy carries the argument at
 *             poster scale, data drops to white paper. Three registers in
 *             rotation, so density never accumulates. The only design that
 *             needs images: pass `image:` to any opener, or it renders a
 *             labelled placeholder frame.
 *
 *   press     No photography. Navy type pages alternate with white paper
 *             pages, and that alternation IS the system -- argument on navy,
 *             evidence on white. The 45 degree slash survives as a corner
 *             mark entering from off-canvas.
 *
 * Every design resolves three SURFACES and assigns each layout to one by role:
 *
 *              stage (openers, statements)   page (content)   data (tables)
 *   report     light                          light            white
 *   kickoff    photo over navy                navy             white
 *   press      navy + corner slash            white            white
 *
 * A layout never picks its own colours. It asks for a surface by role and
 * draws with whatever that surface provides, which is why one layout file
 * serves three designs and why a fourth could be added in one object.
 *
 * ===========================================================================
 * THE RULES THAT SURVIVED EVERY REVISION
 *
 *   1. ONE IDEA PER SLIDE. Density was the note that killed two earlier
 *      versions. Every layout here is sized so that filling it completely is
 *      uncomfortable.
 *   2. CONTENT FILLS THE CANVAS. Blocks take the full height between the
 *      header and the footer and are centred in it. Top-aligning a short
 *      block leaves a dead bottom third, which is what makes a deck look
 *      unfinished.
 *   3. RED IS A SPARK. A rule, a numeral, a hairline, a corner mark. Never a
 *      field, never large. On dark grounds it is lifted toward white until it
 *      clears 3:1, because saturated red on navy buzzes at the shared edge.
 *   4. THE SLASH IS 45 DEGREES AND ENTERS FROM OFF-CANVAS. Athletics designed
 *      it as "a 45-degree slash representing the sport's upward trajectory".
 *      It divides or it marks; it never decorates as a thin stripe.
 *   5. DATA KEEPS THE FACT & RECORD BOOK REGISTER. White, hairlines, ALL-CAPS
 *      abbreviated heads, numerals right-aligned, no zebra, no fills.
 * ===========================================================================
 */

const fs = require('fs');
const path = require('path');
const PptxGenJS = require('pptxgenjs');

const DIST = path.join(__dirname, '..', '..', 'dist');
const T = JSON.parse(fs.readFileSync(path.join(DIST, 'mls.tokens.json'), 'utf8')).tokens;
const CLUBS = JSON.parse(fs.readFileSync(path.join(DIST, 'mls.clubs.json'), 'utf8')).clubs;

/* pptxgenjs takes bare 6-digit hex. A leading '#' or an 8-digit value with
 * baked-in alpha corrupts the file, so every colour goes through here. */
const hex = (v) => String(v).replace('#', '').slice(0, 6).toUpperCase();

/* Pre-mixed colours instead of run-level text transparency. OOXML expresses
 * that as <a:alpha> on the run's fill; older PowerPoint ignores it and
 * LibreOffice mis-measures the run and truncates it mid-word. Shape fills are
 * a different matter -- transparency on those is honoured, and the scrim
 * under photography relies on it. */
function mixHex(a, b, t) {
  const p2 = (h) => [0, 2, 4].map((i) => parseInt(hex(h).slice(i, i + 2), 16));
  const A = p2(a), B = p2(b);
  return A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase();
}

/* Relative luminance and contrast, sRGB, per WCAG 2.x. */
function relLum(h) {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(hex(h).slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const ratio = (a, b) => {
  const [x, y] = [relLum(a), relLum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

/**
 * Nudge `fg` away from `bg` until it clears `target`.
 *
 * Every muted and subtle step here is a mix toward the ground, and a fixed
 * mix ratio cannot hold across 30 club colours and three designs: 0.28 toward
 * the ground clears 4.5:1 on navy and lands at 4.42:1 on Portland green.
 * Solving for the ratio instead means the scale adapts to whatever colour it
 * is built on, which is the whole point of a themable system.
 */
function fitRatio(fg, bg, target, toward) {
  if (ratio(fg, bg) >= target) return hex(fg);
  let best = hex(fg);
  for (let i = 1; i <= 24; i++) {
    best = mixHex(fg, toward, i / 24);
    if (ratio(best, bg) >= target) return best;
  }
  return best;
}

const inches = (v) => parseFloat(String(v));
/* ---------------------------------------------------------------- *
 * Text metrics
 *
 * pptxgenjs cannot measure text: it writes a box and PowerPoint decides
 * what fits. So every box here is sized from a real advance-width table
 * rather than an average character width. The difference is not cosmetic.
 * A flat 0.60em estimate over-measures a lowercase title by about 12%,
 * which reserves a phantom second line and leaves a visible gap under
 * every heading, and it under-measures a run of digits, which is how a
 * four-character figure ends up wrapping in the middle of itself.
 *
 * Values are Arial advance widths in 1/1000 em, the metrics Office uses
 * for Arial, Helvetica and Liberation Sans alike.
 * ---------------------------------------------------------------- */
const ADV = (() => {
  // Order matters only in that a later entry overwrites an earlier one; each
  // character appears exactly once. Widths transcribed from the Arial metrics.
  const pairs = (o) => {
    const t = Object.create(null);
    for (const k of Object.keys(o)) for (const ch of k) t[ch] = o[k];
    return t;
  };
  const reg = pairs({
    ' ': 278, '!': 278, '"': 355, '#': 556, '$': 556, '%': 889, '&': 667,
    "'": 191, '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333,
    '.': 278, '/': 278, '0123456789': 556, ':': 278, ';': 278, '<': 584,
    '=': 584, '>': 584, '?': 556, '@': 1015,
    ACDGHNOQRUVW: 722, ABEKXY: 667, F: 611, T: 611, Z: 611, I: 278, J: 500,
    L: 556, M: 833, S: 667, P: 667,
    abdeghnopqu: 556, cksvxyz: 500, f: 278, t: 278, ij: 222, l: 222,
    m: 833, r: 333, w: 722,
    '[': 278, '\\': 278, ']': 278, '^': 469, _: 556, '`': 333,
    '{': 334, '|': 260, '}': 334, '~': 584,
  });
  // The block above assigns some letters twice by design; pin the exceptions.
  Object.assign(reg, { A: 667, B: 667, C: 722, D: 722, E: 667, G: 778, O: 778, Q: 778, V: 667, W: 944, K: 667, X: 667, Y: 667, R: 722, U: 722, N: 722, H: 722 });
  const bold = pairs({
    ' ': 278, '!': 333, '"': 474, '#': 556, '$': 556, '%': 889, '&': 722,
    "'": 238, '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333,
    '.': 278, '/': 278, '0123456789': 556, ':': 333, ';': 333, '<': 584,
    '=': 584, '>': 584, '?': 611, '@': 975,
    ABCDHKNRUXY: 722, EPS: 667, FLTZ: 611, GOQ: 778, I: 278, J: 556,
    M: 833, V: 667, W: 944,
    bdghnopqu: 611, acesvxy: 556, ft: 333, ij: 278, l: 278,
    m: 889, r: 389, w: 778, z: 500, k: 556,
    '[': 333, '\\': 278, ']': 333, '^': 584, _: 556, '`': 333,
    '{': 389, '|': 280, '}': 389, '~': 584,
  });
  Object.assign(bold, { K: 722, X: 722, Y: 722, V: 667 });
  return { reg, bold };
})();

const widthEm = (str, bold) => {
  const t = bold ? ADV.bold : ADV.reg;
  let w = 0;
  for (const ch of String(str ?? '')) w += t[ch] ?? 560;
  return w / 1000;
};

/**
 * Greedy word-wrap in the same order PowerPoint does it. `track` is
 * charSpacing in points, which pptxgenjs applies per character and which
 * is large enough on an eyebrow to change the break.
 */
function wrapCount(text, sizePt, widthIn, { bold = false, track = 0 } = {}) {
  const str = String(text ?? '');
  if (!str.trim()) return 0;
  // 0.985 covers PowerPoint's own right-edge inset. Cheaper than a collision.
  const maxEm = (widthIn * 0.985 * 72) / sizePt;
  const w = (s) => widthEm(s, bold) + (track / sizePt) * s.length;
  const sp = w(' ');
  let total = 0;
  for (const para of str.split('\n')) {
    const words = para.split(/\s+/).filter(Boolean);
    if (!words.length) { total += 1; continue; }
    let n = 1, cur = 0;
    for (let i = 0; i < words.length; i++) {
      const ww = w(words[i]);
      if (ww > maxEm) {            // longer than the box: PowerPoint breaks it
        if (i > 0) n++;
        n += Math.ceil(ww / maxEm) - 1;
        cur = maxEm;               // whatever follows starts a fresh line
        continue;
      }
      if (i === 0) { cur = ww; continue; }
      if (cur + sp + ww <= maxEm) cur += sp + ww;
      else { n++; cur = ww; }
    }
    total += n;
  }
  return total;
}

/**
 * The narrowest box that still breaks `text` into the same number of lines.
 *
 * Greedy wrapping packs the early lines full and dumps the remainder on the
 * last one, which is how "...value with MLS / Brand." happens: a six-letter
 * orphan under a line running the full measure. Narrowing the box until one
 * more break would appear pushes the breaks apart evenly. Headings are
 * left-aligned, so the narrower box is invisible -- only the rag changes.
 * This is what CSS calls text-wrap: balance.
 */
function balanceWidth(text, sizePt, maxWidth, o = {}) {
  const n = wrapCount(text, sizePt, maxWidth, o);
  if (n <= 1) return maxWidth;
  // Never narrower than the longest word, or PowerPoint hyphen-free-breaks it.
  const words = String(text).split(/\s+/).filter(Boolean);
  const longestIn = Math.max(...words.map((wd) => widthEm(wd, o.bold) * sizePt / 72)) / 0.985;
  if (longestIn >= maxWidth) return maxWidth;
  let lo = Math.max(maxWidth * 0.3, longestIn), hi = maxWidth;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (wrapCount(text, sizePt, mid, o) <= n) hi = mid; else lo = mid;
  }
  // Slack: the viewer's font is not guaranteed to be the one measured here.
  return Math.min(maxWidth, Math.max(longestIn, hi) + 0.06);
}

/** Largest size <= max at which `text` still sets on one line in `widthIn`. */
function fitOneLine(text, max, widthIn, { bold = true, min = 12, extraEm = 0 } = {}) {
  const em = widthEm(text, bold) + extraEm;
  if (em <= 0) return max;
  return Math.max(min, Math.min(max, Math.floor((widthIn * 0.985 * 72) / em)));
}

/* ---------------------------------------------------------------- *
 * Grid
 * ---------------------------------------------------------------- */
const S = {
  w: 13.333, h: 7.5,
  m: 0.72,                 // outer margin
  gutter: 0.34,
  panelW: 4.72,            // the navy spine
  panelPadX: 0.72,
  panelGap: 0.62,
  headTop: 0.62,
  footerY: 6.98,
  contentBottom: 6.72,     // content never crosses this
};
S.contentW = S.w - S.m * 2;
S.spineX = S.panelW + S.panelGap;              // where the white zone starts
S.spineW = S.w - S.spineX - S.m;               // width of the white zone
S.panelTextW = S.panelW - S.panelPadX * 2 + 0.18;

const FONTS = {
  // Office resolves ONE family name, not a stack. 'safe' is Arial: it ships
  // with every Office install and renders true-to-width, so text-fit checks in
  // QA are trustworthy. 'licensed' is correct inside MLS, where Tifo is
  // installed -- but a viewer without it gets an arbitrary substitute.
  safe:     { heading: T.office.safeHeading, body: T.office.safeBody },
  licensed: { heading: T.office.licensedHeading, body: T.office.licensedBody },
};

/* ---------------------------------------------------------------- *
 * Designs
 *
 * A design is: a type scale, a set of marks, and a map from slide ROLE to
 * SURFACE. Nothing else. Layouts read the current surface, so adding a fourth
 * design means adding one object here, not touching 30 layout functions.
 * ---------------------------------------------------------------- */

const DESIGNS = {
  report: {
    label: 'Report',
    blurb: 'Light throughout. Regular display weight, wide margins, hairlines, numbers not bullets.',
    // role -> { surface, photo?, mark? }
    roles: {
      stage: { surface: 'page', mark: 'rule' },
      page:  { surface: 'page' },
      data:  { surface: 'paper' },
    },
    type: {
      hero: 140, display: 54, sectionNo: 116, sectionTitle: 44, title: 36,
      statBig: 86, cardTitle: 20, body: 19, bodySmall: 16,
      eyebrow: 12, caption: 11, footer: 10,
      // Arial ships Regular and Bold only, so "light" here means Regular at
      // display size. It still reads markedly quieter than Bold, which is the
      // whole point; with fonts:'licensed' a real Light may be available.
      displayBold: false, upper: false, lead: 1.08,
    },
    marks: { headRule: 0.014, listStyle: 'number', slashCorner: false, photo: false },
  },

  kickoff: {
    label: 'Kickoff',
    blurb: 'Photography opens, navy argues at poster scale, data drops to paper.',
    roles: {
      stage: { surface: 'navy', photo: true, mark: 'dot' },
      page:  { surface: 'navy' },
      data:  { surface: 'paper' },
    },
    type: {
      hero: 190, display: 58, sectionNo: 150, sectionTitle: 54, title: 38,
      statBig: 150, cardTitle: 20, body: 19, bodySmall: 16,
      eyebrow: 12, caption: 11, footer: 10,
      displayBold: true, upper: false, lead: 1.0,
    },
    marks: { headRule: 0.05, listStyle: 'number', slashCorner: false, photo: true },
  },

  press: {
    label: 'Press',
    blurb: 'No photography. Navy type pages alternate with white paper pages.',
    roles: {
      stage: { surface: 'navy', mark: 'slash' },
      page:  { surface: 'paper' },
      data:  { surface: 'paper' },
    },
    type: {
      hero: 200, display: 62, sectionNo: 150, sectionTitle: 58, title: 38,
      statBig: 168, cardTitle: 20, body: 19, bodySmall: 16,
      eyebrow: 12, caption: 11, footer: 10,
      displayBold: true, upper: true, lead: 0.97,
    },
    marks: { headRule: 0.05, listStyle: 'number', slashCorner: true, photo: false },
  },
};

/* ---------------------------------------------------------------- *
 * Surfaces
 *
 * The FIELD is the colour a full-bleed club surface takes. It is deliberately
 * NOT the club's dark-mode accent: that token is a club colour *lightened*
 * until it is legible on a dark ground -- Columbus's is #FEDD00 -- so a field
 * built from it is a bright gold slide. scripts/build.mjs resolves it to the
 * darkest published club colour that can carry white text, and to MLS navy
 * for a club that has none. Columbus becomes black and gold, Seattle Pacific
 * Blue and Rave Green, Portland Ponderosa Green and Timbers Gold.
 * ---------------------------------------------------------------- */

const N = T.color.primitive.neutral;

function lightSurface(bgHex, c) {
  const bg = hex(bgHex);
  const field = hex(c ? c.theme.field : T.color.brand.navy);
  const sparkRaw = hex(c ? c.theme.accentLight : T.color.brand.red);
  return {
    dark: false,
    bg,
    bgSubtle: mixHex(bg, '#000000', 0.035),
    panel: field,
    onPanel: hex('#FFFFFF'),
    onPanelMuted: fitRatio(mixHex('#FFFFFF', field, 0.30), field, 4.5, '#FFFFFF'),
    panelEdge: mixHex('#FFFFFF', field, 0.76),
    ink: hex(N['900']),
    inkMuted: fitRatio(N['700'], bg, 4.5, '#000000'),
    // 11pt captions are small text, so the subtle step clears 4.5:1 rather
    // than the 3:1 a large or bold step could live with.
    inkSubtle: fitRatio(N['600'], bg, 4.5, '#000000'),
    figure: hex(N['900']),
    rule: mixHex(bg, '#000000', 0.10),
    ruleMid: mixHex(bg, '#000000', 0.24),
    ruleStrong: hex(N['900']),
    spark: fitRatio(sparkRaw, bg, 3, '#000000'),
    chart: Object.values(T.chart.categorical.light).map(hex),
    axis: hex(T.chart.axis),
    grid: hex(T.chart.gridline),
  };
}

function navySurface(c) {
  const field = hex(c ? c.theme.field : T.color.brand.navy);
  const white = hex('#FFFFFF');
  const sparkTrue = hex(c ? c.theme.sparkOnField : T.color.brand.red);
  /* Red has to change value on navy. #E2231A against #001F5B is a tense,
   * low-separation adjacency -- the two are close in luminance and the shared
   * edge buzzes. Lifted toward white it separates cleanly and stops fighting
   * the ground. Still the brand red, one step up. */
  const spark = fitRatio(mixHex(sparkTrue, '#FFFFFF', 0.22), field, 3, white);
  return {
    dark: true,
    bg: field,
    bgSubtle: mixHex(field, '#FFFFFF', 0.07),
    panel: mixHex(field, '#FFFFFF', 0.11),
    onPanel: white,
    onPanelMuted: fitRatio(mixHex(white, mixHex(field, '#FFFFFF', 0.11), 0.28), mixHex(field, '#FFFFFF', 0.11), 4.5, white),
    panelEdge: mixHex(white, field, 0.72),
    ink: white,
    inkMuted: fitRatio(mixHex(white, field, 0.26), field, 4.5, white),
    inkSubtle: fitRatio(mixHex(white, field, 0.42), field, 4.5, white),
    figure: white,
    rule: mixHex(white, field, 0.78),
    ruleMid: mixHex(white, field, 0.60),
    ruleStrong: mixHex(white, field, 0.18),
    spark,
    chart: Object.values(T.chart.categorical.dark).map(hex),
    axis: mixHex(white, field, 0.45),
    grid: mixHex(white, field, 0.78),
  };
}

function theme({ club, design = 'press' }) {
  const c = club ? CLUBS.find((x) => x.slug === club || x.tricode.toLowerCase() === String(club).toLowerCase()) : null;
  if (club && !c) throw new Error(`Unknown club "${club}". Use a slug from data/clubs.json.`);
  const D = DESIGNS[design];
  if (!D) throw new Error(`Unknown design "${design}". Use one of: ${Object.keys(DESIGNS).join(', ')}.`);
  return {
    design, D, club: c,
    clubName: c ? (c.nameLocalised || c.name) : 'Major League Soccer',
    surfaces: {
      paper: lightSurface('#FFFFFF', c),
      page:  lightSurface(N['50'], c),
      navy:  navySurface(c),
    },
  };
}
function createDeck(opts = {}) {
  const {
    club = null, design = 'press', fonts = 'safe',
    author = 'MLS Design System', subject = '', title = '',
    partner = null, footerText = null,
  } = opts;

  const TH = theme({ club, design });
  const D = TH.D, TY = D.type, MK = D.marks, SURF = TH.surfaces;
  const F = FONTS[fonts] || FONTS.safe;

  const pres = new PptxGenJS();
  // MUST come before any slide is added. pptxgenjs defaults to 10x5.625 and
  // coordinates past the edge are written rather than clamped, so content
  // simply is not on the slide, with no error.
  pres.layout = 'LAYOUT_WIDE';
  pres.author = author;
  pres.company = 'Major League Soccer';
  pres.subject = subject;
  pres.title = title;

  /* The CURRENT surface. Every primitive below reads it, and newSlide() swaps
   * it by role, which is how one set of layouts serves three designs. */
  let C = SURF[D.roles.page.surface];
  let slideNo = 0;

  /* ---------------------------------------------------------------- *
   * Primitives
   * ---------------------------------------------------------------- */

  const rect = (s, x, y, w, h, color, o = {}) =>
    s.addShape(pres.ShapeType.rect, { x, y, w, h, fill: { color, ...o }, line: { type: 'none' } });

  const rule = (s, { x, y, w, color, h = 0.011 }) => rect(s, x, y, w, h, color || C.rule);

  const lines = (text, sizePt, widthIn, o) => Math.max(1, wrapCount(text, sizePt, widthIn, o));
  /* `lineSpacingMultiple` multiplies the FONT's natural line height (~1.17em
   * for Arial), not the point size. Measure with a lead, render with lead/1.17
   * or every wrapped block comes out ~17% taller than the space reserved for
   * it -- which is how a numbered list ends up with its numbers a line out of
   * step with their own text. */
  const LINE = 1.17;
  const lsm = (lead) => lead / LINE;
  const textH = (text, sizePt, widthIn, lead = 1.14, o) =>
    (lines(text, sizePt, widthIn, o) * sizePt * lead) / 72;

  const label = (s, text, { x, y, w, color, size = TY.eyebrow, align = 'left' }) =>
    s.addText(String(text ?? '').toUpperCase(), {
      x, y, w, h: 0.34,
      fontFace: F.heading, fontSize: size, bold: true, charSpacing: 1.6,
      color: color || C.inkSubtle, align, margin: 0, valign: 'middle',
    });

  const caseFix = (t) => (TY.upper ? String(t ?? '').toUpperCase() : String(t ?? ''));

  function footer(s, { text, x = S.m, color } = {}) {
    const col = color || C.inkSubtle;
    s.addText(text || footerText || TH.clubName, {
      x, y: S.footerY, w: S.w - x - 3.0, h: 0.3,
      fontFace: F.body, fontSize: TY.footer, color: col, margin: 0, valign: 'middle',
    });
    if (partner) s.addText(`presented by ${partner}`, {
      x: S.w - S.m - 3.4, y: S.footerY, w: 2.75, h: 0.3,
      fontFace: F.body, fontSize: TY.footer, color: col, align: 'right', margin: 0, valign: 'middle',
    });
    s.addText(String(slideNo), {
      x: S.w - S.m - 0.55, y: S.footerY, w: 0.55, h: 0.3,
      fontFace: F.body, fontSize: TY.footer, color: col, align: 'right', margin: 0, valign: 'middle',
    });
  }

  /**
   * Photography frame. This repo ships no MLS imagery -- it is trademarked
   * and not ours to redistribute -- so without an `image` the frame renders
   * as a labelled placeholder that is obviously a slot rather than a design.
   */
  function photoFrame(s, { image } = {}) {
    if (image) {
      s.addImage({ path: image, x: 0, y: 0, w: S.w, h: S.h, sizing: { type: 'cover', w: S.w, h: S.h } });
    } else {
      rect(s, 0, 0, S.w, S.h, C.panel);
      s.addShape(pres.ShapeType.ellipse, {
        x: S.w * 0.46, y: -S.h * 0.34, w: S.w * 0.62, h: S.h * 1.05,
        fill: { color: 'FFFFFF', transparency: 90 }, line: { type: 'none' },
      });
      s.addText('Photography', {
        x: S.w - 2.9, y: S.h - 0.78, w: 2.2, h: 0.3,
        fontFace: F.body, fontSize: 9, color: C.panelEdge,
        align: 'right', charSpacing: 1.4, margin: 0,
      });
    }
    /* Scrim. pptxgenjs has no gradient shape fill, and a stack of transparent
     * bands faking one reads as banding over any smooth area of a photograph.
     * One even overlay has no edge to give itself away, and darkening the
     * whole frame is a legitimate treatment where a visible stripe is not.
     * Shape transparency IS honoured, unlike alpha on a text run. */
    s.addShape(pres.ShapeType.rect, {
      x: 0, y: 0, w: S.w, h: S.h,
      fill: { color: '00060F', transparency: 42 }, line: { type: 'none' },
    });
  }

  /**
   * The corner slash. Rotated rectangles give an exact 45 degrees whatever
   * the aspect ratio; the ends run off-canvas and are clipped by the slide
   * edge, which is what "begins outside the perimeter" actually looks like.
   */
  /* Leftmost extent of the corner slash, in inches. A bar centred at x=11.62
   * with a half-length of 2.8in rotated 45 degrees reaches down-left to
   * (9.64, 3.03), so anything set above y=3.03 must stay left of 9.64. */
  const SLASH_X = 9.55;
  const slashSafeW = MK.slashCorner ? SLASH_X - S.m - 0.30 : S.contentW;

  function cornerSlash(s) {
    for (const [cx, w, tr] of [[11.62, 0.26, 0], [12.24, 0.15, 55], [12.70, 0.10, 78]]) {
      s.addShape(pres.ShapeType.rect, {
        x: cx - w / 2, y: -1.75, w, h: 5.6, rotate: 45,
        fill: { color: C.spark, ...(tr ? { transparency: tr } : {}) }, line: { type: 'none' },
      });
    }
  }

  function newSlide(roleName = 'page', o = {}) {
    const role = D.roles[roleName] || D.roles.page;
    C = SURF[role.surface];
    const s = pres.addSlide();
    slideNo++;
    s.background = { color: C.bg };
    if (role.photo) photoFrame(s, { image: o.image });
    if (role.mark === 'slash') cornerSlash(s);
    s._role = role;
    return s;
  }

  /* ---------------------------------------------------------------- *
   * Grounds
   * ---------------------------------------------------------------- */

  /**
   * HEAD. The content-slide header: a rule, an eyebrow and a title, returning
   * the rectangle the body may fill. Two lines is the budget for a heading --
   * past that the data below it loses more than the headline gains.
   */
  function head(s, eb, t, { showRule = true } = {}) {
    let y = S.headTop;
    if (showRule) { rect(s, S.m, y, S.contentW, MK.headRule, C.ruleStrong); y += MK.headRule + 0.27; }
    if (eb) { label(s, eb, { x: S.m, y, w: S.contentW }); y += 0.42; }
    if (t) {
      let ts = TY.title, th = 0;
      for (const cand of [TY.title, TY.title - 5, TY.title - 9]) {
        ts = cand;
        th = textH(t, cand, S.contentW, 1.14, { bold: true });
        if (lines(t, cand, S.contentW, { bold: true }) <= 2) break;
      }
      s.addText(String(t), {
        x: S.m, y, w: balanceWidth(t, ts, S.contentW, { bold: true }), h: th,
        fontFace: F.heading, fontSize: ts, bold: true, color: C.ink,
        margin: 0, valign: 'top', lineSpacingMultiple: lsm(1.0),
      });
      y += th + 0.48;
    }
    return { x: S.m, y, w: S.contentW, h: S.contentBottom - y };
  }

  /**
   * STAGE. The opener composition. Over photography the lockup drops to the
   * bottom-left, where the scrim is darkest; on a flat ground the whole group
   * is measured and centred, because fixed offsets look right for the title
   * you tested and fall apart on the next one.
   */
  function stage(s, { eyebrow: eb, title: t, subtitle, kicker, size = TY.display, maxCh = 17, extraH = 0 } = {}) {
    const onPhoto = !!(s._role && s._role.photo);
    const tw = Math.min(slashSafeW, size * 0.62 * maxCh / 72 * 1.6);
    const txt = caseFix(t);
    const bold = TY.displayBold;

    let ts = size, th = 0;
    for (const cand of [size, Math.round(size * 0.86), Math.round(size * 0.74)]) {
      ts = cand;
      th = textH(txt, cand, tw, TY.lead, { bold });
      if (lines(txt, cand, tw, { bold }) <= 3) break;
    }
    const subW = Math.min(7.6, S.contentW);
    const subH = subtitle ? textH(subtitle, TY.bodySmall, subW, 1.4) : 0;
    const markH = MK.listStyle && D.roles.stage.mark === 'rule' ? 0.07 + 0.40 : 0;
    const groupH = markH + (eb ? 0.44 : 0) + th + (subtitle ? 0.46 + subH : 0) + extraH;

    let y = onPhoto
      ? S.h - 0.95 - groupH               // sit on the scrim
      : Math.max(0.85, (S.contentBottom - groupH) / 2);

    if (kicker && onPhoto) {
      s.addShape(pres.ShapeType.ellipse, {
        x: S.m, y: 0.60, w: 0.13, h: 0.13, fill: { color: C.spark }, line: { type: 'none' },
      });
      label(s, kicker, { x: S.m + 0.30, y: 0.50, w: 8.0, color: C.inkMuted });
    }
    if (markH) { rect(s, S.m, y, 1.5, 0.07, C.spark); y += markH; }
    if (eb) { label(s, eb, { x: S.m, y, w: 8.4, color: C.inkMuted }); y += 0.44; }

    s.addText(txt, {
      x: S.m, y, w: balanceWidth(txt, ts, tw, { bold }), h: th,
      fontFace: F.heading, fontSize: ts, bold, color: C.ink,
      margin: 0, valign: 'top', lineSpacingMultiple: lsm(TY.lead),
    });
    y += th;
    if (subtitle) s.addText(String(subtitle), {
      x: S.m, y: y + 0.46, w: subW, h: subH + 0.12,
      fontFace: F.body, fontSize: TY.bodySmall, color: C.inkMuted,
      margin: 0, valign: 'top', lineSpacingMultiple: lsm(1.4),
    });
    return y;
  }

  /** A numbered list. Never bullets: numbers read as an argument, dots as a dump. */
  /* Sizing is separated from drawing so two columns can share one plan.
   * Laid out independently, a wrapped item in the left column makes the right
   * column absorb the difference as one hole, and the two stop lining up. */
  function planList(items, c, startSize) {
    const list = items.map((i) => (typeof i === 'string' ? { text: i } : i));
    const n = Math.max(1, list.length);
    const numW = 0.62, gap = 0.34;
    const bodyW = c.w - numW - gap;
    let size = startSize, hs = [], need = 0, pad = 0;
    for (const cand of [0, 1, 2, 3, 4, 6].map((d) => startSize - d)) {
      size = cand;
      hs = list.map((it) => textH(it.text, size, bodyW, 1.5));
      need = hs.reduce((a, b) => a + b, 0);
      const lh = (size * 1.5) / 72;
      // 1.5x the line pitch is the point at which the eye stops reading the
      // list as one paragraph. Matching the line pitch is not enough.
      pad = Math.max(lh * 1.5, Math.min(lh * 2.1, (c.h - need) / Math.max(1, n - 1)));
      if (need + pad * (n - 1) <= c.h) break;
    }
    return { size, hs, need, pad, numW, gap, bodyW, list, n };
  }

  function numberedList(s, items, c, { size: startSize = TY.body, plan, align = 'centre' } = {}) {
    const P = plan || planList(items, c, startSize);
    const list = items.map((i) => (typeof i === 'string' ? { text: i } : i));
    const { size, pad, numW, gap, bodyW } = P;
    const n = Math.max(1, list.length);
    const hs = list.map((it) => textH(it.text, size, bodyW, 1.5));
    const need = hs.reduce((a, b) => a + b, 0);
    /* The gap BETWEEN items must beat the line gap INSIDE one, or a wrapped
     * item runs into the next and the list reads as one paragraph with
     * numbers scattered through it. When that cannot be afforded the type
     * steps down; crowding a list is worse than setting it smaller. */
    let y = c.y + (align === 'top' ? 0 : Math.max(0, (c.h - need - pad * (n - 1)) / 2));
    list.forEach((it, i) => {
      s.addText(String(i + 1).padStart(2, '0'), {
        x: c.x, y: y + 0.03, w: numW, h: 0.34,
        fontFace: F.heading, fontSize: TY.caption + 1, bold: true, color: C.spark,
        charSpacing: 1.2, margin: 0, valign: 'top',
      });
      s.addText(String(it.text), {
        x: c.x + numW + gap, y, w: bodyW, h: hs[i] + 0.08,
        fontFace: F.body, fontSize: size, bold: !!it.bold,
        color: it.muted ? C.inkMuted : C.ink,
        margin: 0, valign: 'top', lineSpacingMultiple: lsm(1.5),
      });
      y += hs[i] + pad;
    });
  }

  /* ---------------------------------------------------------------- *
   * Layouts
   * ---------------------------------------------------------------- */

  const api = {
    pres, theme: TH, design, fonts: F, geometry: S, type: TY,
    get palette() { return C; },

    /* ---- Openers and dividers ---------------------------------- */

    title({ eyebrow: eb, title: t, subtitle, footer: f, image, notes } = {}) {
      const s = newSlide('stage', { image });
      stage(s, { eyebrow: eb, title: t, subtitle, kicker: null, size: TY.display, maxCh: 17 });
      if (f) s.addText(String(f), {
        x: S.m, y: S.footerY, w: 9.4, h: 0.3,
        fontFace: F.body, fontSize: TY.footer, color: C.inkSubtle, margin: 0, valign: 'middle',
      });
      if (notes) s.addNotes(String(notes));
      return s;
    },

    /** The opener with a matchday kicker. Same ground, more context. */
    titleSplit({ eyebrow: eb, title: t, subtitle, kicker, image, notes } = {}) {
      const s = newSlide('stage', { image });
      // With no explicit kicker the eyebrow is promoted to the top of the
      // slide; printing it in both places is just the same words twice.
      stage(s, {
        eyebrow: kicker ? eb : null, title: t, subtitle,
        kicker: kicker || eb, size: TY.display, maxCh: 17,
      });
      if (notes) s.addNotes(String(notes));
      return s;
    },

    /** Numbered divider. Fixed stations, so 01 through 05 register when you page. */
    section({ number, title: t, subtitle, image, notes } = {}) {
      const s = newSlide('stage', { image });
      const onPhoto = !!(s._role && s._role.photo);
      const NUM_Y = onPhoto ? 0.70 : 1.05;
      const txt = caseFix(t);
      const bold = TY.displayBold;
      const tw = Math.min(S.contentW * 0.62, 7.4);

      if (number != null) s.addText(String(number).padStart(2, '0'), {
        x: S.m - 0.14, y: NUM_Y, w: 5.4, h: 2.2,
        fontFace: F.heading, fontSize: TY.sectionNo, bold: true,
        color: C.dark ? mixHex(C.ink, C.bg, 0.54) : mixHex(C.ink, C.bg, 0.68),
        margin: 0, valign: 'middle',
      });
      let y = NUM_Y + 2.2 + 0.42;
      rect(s, S.m, y, 1.5, 0.07, C.spark);
      y += 0.44;
      // Step the size down rather than let a long title push its subtitle
      // into the footer band.
      let ss = TY.sectionTitle, th = 0;
      for (const cand of [TY.sectionTitle, Math.round(TY.sectionTitle * 0.86), Math.round(TY.sectionTitle * 0.74)]) {
        ss = cand;
        th = textH(txt, cand, tw, TY.lead, { bold });
        if (y + th + (subtitle ? 0.34 + 0.4 : 0) <= S.contentBottom) break;
      }
      s.addText(txt, {
        x: S.m, y, w: balanceWidth(txt, ss, tw, { bold }), h: th,
        fontFace: F.heading, fontSize: ss, bold, color: C.ink,
        margin: 0, valign: 'top', lineSpacingMultiple: lsm(TY.lead),
      });
      if (subtitle) s.addText(String(subtitle), {
        x: S.m, y: y + th + 0.34, w: 7.0, h: 0.7,
        fontFace: F.body, fontSize: TY.bodySmall, color: C.inkMuted, margin: 0, valign: 'top',
      });
      if (notes) s.addNotes(String(notes));
      return s;
    },

    /** The quieter break. Always on the content surface, never on photography. */
    chapter({ number, title: t, subtitle, notes } = {}) {
      const s = newSlide('page');
      const tx = S.m + 0.62;
      const tw = S.w - tx - S.m;
      const numH = number != null ? 1.4 : 0;
      const th = textH(t, TY.sectionTitle, tw, 1.1, { bold: TY.displayBold });
      const subW = Math.min(tw, 7.4);
      const subH = subtitle ? textH(subtitle, TY.bodySmall, subW, 1.4) : 0;
      const groupH = numH + th + (subtitle ? 0.34 + subH : 0);
      const gy = Math.max(0.9, (S.contentBottom - groupH) / 2);
      rect(s, S.m, gy, 0.07, groupH, C.spark);
      if (number != null) s.addText(String(number).padStart(2, '0'), {
        x: tx, y: gy, w: 4.0, h: numH,
        fontFace: F.heading, fontSize: 84, bold: true, color: C.figure, margin: 0, valign: 'middle',
      });
      s.addText(String(t || ''), {
        x: tx, y: gy + numH, w: balanceWidth(t, TY.sectionTitle, tw, { bold: TY.displayBold }), h: th,
        fontFace: F.heading, fontSize: TY.sectionTitle, bold: TY.displayBold, color: C.ink,
        margin: 0, valign: 'top', lineSpacingMultiple: lsm(1.0),
      });
      if (subtitle) s.addText(String(subtitle), {
        x: tx, y: gy + numH + th + 0.34, w: balanceWidth(subtitle, TY.bodySmall, subW), h: subH + 0.12,
        fontFace: F.body, fontSize: TY.bodySmall, color: C.inkMuted,
        margin: 0, valign: 'top', lineSpacingMultiple: lsm(1.4),
      });
      // No footer: a divider is a divider, and the numbered ones carry none.
      if (notes) s.addNotes(String(notes));
      return s;
    },

    agenda({ eyebrow: eb = 'Contents', title: t = 'What this deck covers', items = [], notes } = {}) {
      const s = newSlide('page');
      const c = head(s, eb, t);
      const n = Math.max(1, items.length);
      const rowH = Math.min(0.92, c.h / n);
      const top = c.y + Math.max(0, (c.h - rowH * n) / 2);
      items.forEach((it, i) => {
        const y = top + i * rowH;
        s.addText(String(i + 1).padStart(2, '0'), {
          x: c.x, y, w: 0.85, h: rowH,
          fontFace: F.heading, fontSize: TY.caption + 1, bold: true, color: C.spark,
          charSpacing: 1.2, margin: 0, valign: 'middle',
        });
        s.addText(String(typeof it === 'string' ? it : it.text), {
          x: c.x + 0.95, y, w: c.w - 0.95, h: rowH,
          fontFace: F.heading, fontSize: TY.cardTitle + 2, bold: true, color: C.ink,
          margin: 0, valign: 'middle',
        });
        if (i < n - 1) rule(s, { x: c.x, y: y + rowH - 0.01, w: c.w });
      });
      footer(s);
      if (notes) s.addNotes(String(notes));
      return s;
    },

    closing({ title: t = 'Thank you', subtitle, contact, image, notes } = {}) {
      const s = newSlide('stage', { image });
      stage(s, { title: t, subtitle, size: TY.display, maxCh: 15 });
      if (contact) s.addText(String(contact), {
        x: S.m, y: S.footerY, w: 9.4, h: 0.3,
        fontFace: F.body, fontSize: TY.footer, color: C.inkSubtle, margin: 0, valign: 'middle',
      });
      if (notes) s.addNotes(String(notes));
      return s;
    },

    /* ---- Editorial ---------------------------------------------- */

    statement({ eyebrow: eb, text, attribution, notes } = {}) {
      const s = newSlide('stage');
      const attH = attribution ? textH(attribution, TY.bodySmall, 9.6, 1.45) : 0;
      const y = stage(s, {
        eyebrow: eb, title: text, size: Math.round(TY.display * 0.78), maxCh: 24,
        extraH: attribution ? 0.52 + attH : 0,
      });
      if (attribution) s.addText(String(attribution), {
        x: S.m, y: y + 0.52, w: 9.6, h: attH + 0.12,
        fontFace: F.body, fontSize: TY.bodySmall, color: C.inkMuted,
        margin: 0, valign: 'top', lineSpacingMultiple: lsm(1.45),
      });
      if (notes) s.addNotes(String(notes));
      return s;
    },

    band(o = {}) { return api.statement({ eyebrow: o.eyebrow, text: o.text, attribution: o.detail, notes: o.notes }); },

    /** Quote. Plain by design -- MLS has no pull-quote component at all. */
    quote({ quote: q, attribution, role, notes } = {}) {
      const s = newSlide('stage');
      const tw = Math.min(slashSafeW, 10.4), size = Math.round(TY.display * 0.62);
      const body = `“${String(q || '')}”`;
      const th = textH(body, size, tw, 1.3, { bold: TY.displayBold });
      const attH = attribution ? 0.5 : 0;
      let y = Math.max(1.2, (S.contentBottom - th - attH - 0.6) / 2);
      s.addText(body, {
        x: S.m, y, w: balanceWidth(body, size, tw, { bold: TY.displayBold }), h: th,
        fontFace: F.heading, fontSize: size, bold: TY.displayBold, color: C.ink,
        margin: 0, valign: 'top', lineSpacingMultiple: lsm(1.24),
      });
      if (attribution) {
        rect(s, S.m, y + th + 0.44, 0.9, 0.05, C.spark);
        s.addText([
          { text: String(attribution), options: { bold: true, color: C.ink } },
          ...(role ? [{ text: `   ${role}`, options: { color: C.inkMuted } }] : []),
        ], {
          x: S.m, y: y + th + 0.64, w: tw, h: 0.5,
          fontFace: F.body, fontSize: TY.bodySmall, margin: 0, valign: 'top',
        });
      }
      if (notes) s.addNotes(String(notes));
      return s;
    },

    /** Numbered points. The workhorse content slide in all three designs. */
    bullets({ eyebrow: eb, title: t, items = [], aside, notes } = {}) {
      const s = newSlide('page');
      const c = head(s, eb, t);
      const figW = aside ? 3.35 : 0;
      const listRect = { x: c.x, y: c.y, w: c.w - figW, h: c.h };
      numberedList(s, items, listRect);
      if (aside) {
        const fx = c.x + c.w - figW + 0.56;
        const fw = figW - 0.56;
        const fs = fitOneLine(String(aside.value), 58, fw, {
          bold: true, min: 30, extraEm: aside.unit ? widthEm(aside.unit, true) * 0.42 : 0,
        });
        const figH = (fs * 1.02) / 72;
        const detH = aside.detail ? textH(aside.detail, TY.caption, fw, 1.35) : 0;
        // Measured and centred on the same axis as the list beside it.
        const gH = 0.02 + 0.30 + 0.34 + figH + (aside.detail ? 0.26 + detH : 0);
        let fy = c.y + Math.max(0, (c.h - gH) / 2);
        rule(s, { x: fx, y: fy, w: fw, color: C.ruleMid, h: 0.02 }); fy += 0.32;
        label(s, aside.label, { x: fx, y: fy, w: fw }); fy += 0.34;
        s.addText([
          { text: String(aside.value), options: { fontSize: fs, bold: true, color: C.figure } },
          ...(aside.unit ? [{ text: String(aside.unit), options: { fontSize: Math.round(fs * 0.42), bold: true, color: C.spark } }] : []),
        ], { x: fx, y: fy, w: fw, h: figH, fontFace: F.heading, margin: 0, valign: 'middle' });
        fy += figH;
        if (aside.detail) s.addText(String(aside.detail), {
          x: fx, y: fy + 0.26, w: fw, h: detH + 0.12,
          fontFace: F.body, fontSize: TY.caption, color: C.inkSubtle,
          margin: 0, valign: 'top', lineSpacingMultiple: lsm(1.35),
        });
      }
      footer(s);
      if (notes) s.addNotes(String(notes));
      return s;
    },

    twoColumn({ eyebrow: eb, title: t, left = {}, right = {}, notes } = {}) {
      const s = newSlide('page');
      const c = head(s, eb, t);
      const w = (c.w - S.gutter * 2) / 2;
      const by0 = c.y + 0.98, bh0 = c.h - 0.98;
      const both = [left, right].filter((col) => (col.items || []).length);
      const plan = both.length
        ? both.map((col) => planList(col.items, { x: 0, y: by0, w, h: bh0 }, TY.bodySmall + 1))
              .sort((a, b) => a.size - b.size)[0]
        : null;
      [[left, c.x], [right, c.x + w + S.gutter * 2]].forEach(([col, x]) => {
        rule(s, { x, y: c.y, w, color: C.ruleStrong, h: 0.03 });
        s.addText(String(col.heading || ''), {
          x, y: c.y + 0.22, w, h: 0.6,
          fontFace: F.heading, fontSize: TY.cardTitle, bold: true, color: C.ink, margin: 0, valign: 'middle',
        });
        const by = by0, bh = bh0;
        const items = col.items || [];
        if (items.length) {
          numberedList(s, items, { x, y: by, w, h: bh }, { plan, align: 'top' });
        } else if (col.body) {
          s.addText(String(col.body), {
            x, y: by, w, h: bh,
            fontFace: F.body, fontSize: TY.bodySmall + 1, color: C.ink,
            margin: 0, valign: 'top', lineSpacingMultiple: lsm(1.5),
          });
        }
      });
      footer(s);
      if (notes) s.addNotes(String(notes));
      return s;
    },

    /** Two or three explainers, divided by hairlines rather than boxed in cards. */
    explainerPair({ eyebrow: eb, title: t, cards = [], notes } = {}) {
      const s = newSlide('page');
      const c = head(s, eb, t);
      const n = Math.min(cards.length, 3) || 1;
      const gut = 0.62;
      const w = (c.w - gut * (n - 1)) / n;
      cards.slice(0, n).forEach((card, i) => {
        const px = c.x + i * (w + gut), pw = w;
        if (i > 0) rect(s, px - gut / 2, c.y, 0.012, c.h, C.rule);
        rect(s, px, c.y, 0.9, 0.05, C.spark);
        label(s, card.label, { x: px, y: c.y + 0.30, w: pw });
        const tH = textH(card.title, TY.cardTitle + 3, pw, 1.16, { bold: true });
        s.addText(String(card.title || ''), {
          x: px, y: c.y + 0.82, w: balanceWidth(card.title, TY.cardTitle + 3, pw, { bold: true }), h: tH,
          fontFace: F.heading, fontSize: TY.cardTitle + 3, bold: true, color: C.ink,
          margin: 0, valign: 'top', lineSpacingMultiple: lsm(1.08),
        });
        s.addText(String(card.body || ''), {
          x: px, y: c.y + 0.82 + tH + 0.32, w: pw, h: c.h - (0.82 + tH + 0.32),
          fontFace: F.body, fontSize: TY.bodySmall, color: C.inkMuted,
          margin: 0, valign: 'top', lineSpacingMultiple: lsm(1.42),
        });
      });
      footer(s);
      if (notes) s.addNotes(String(notes));
      return s;
    },

    /* ---- Data ---------------------------------------------------- */

    stats({ eyebrow: eb, title: t, stats = [], notes } = {}) {
      const s = newSlide('page');
      const c = head(s, eb, t);
      const n = Math.min(stats.length, 4) || 1;
      const gut = 0.62;
      const w = (c.w - gut * (n - 1)) / n;
      const colW = w;
      /* One size for the whole row, taken from the widest figure. At a fixed
       * size a four-character figure is wider than a quarter of the canvas
       * and breaks across two lines, so "3.28M" sets as "3.2 / 8M" -- a wrong
       * number, not just a badly set one. Sizing each column independently
       * fixes the wrap but then the figures differ in size and sit on
       * different baselines, which reads as a mistake because it is one. */
      const fs = Math.min(...stats.slice(0, n).map((st) => fitOneLine(String(st.value), TY.statBig, colW, {
        bold: true, min: 34, extraEm: st.unit ? widthEm(st.unit, true) * 0.37 : 0,
      })));
      stats.slice(0, n).forEach((st, i) => {
        const px = c.x + i * (w + gut);
        if (i > 0) rect(s, px - gut / 2, c.y, 0.012, c.h, C.rule);
        rect(s, px, c.y, 0.9, 0.05, C.spark);
        label(s, st.label, { x: px, y: c.y + 0.30, w: colW });
        const figH = (fs * 1.08) / 72;
        const figY = c.y + 0.86 + (c.h - 1.7 - figH) / 2;
        s.addText([
          { text: String(st.value), options: { fontSize: fs, bold: true, color: C.figure } },
          ...(st.unit ? [{ text: String(st.unit), options: { fontSize: Math.max(16, Math.round(fs * 0.37)), bold: true, color: C.spark } }] : []),
        ], { x: px, y: figY, w: colW, h: figH, fontFace: F.heading, margin: 0, valign: 'middle' });
        if (st.detail) s.addText(String(st.detail), {
          x: px, y: figY + figH + 0.24, w: colW, h: 0.8,
          fontFace: F.body, fontSize: TY.caption, color: C.inkMuted,
          margin: 0, valign: 'top', lineSpacingMultiple: lsm(1.25),
        });
      });
      footer(s);
      if (notes) s.addNotes(String(notes));
      return s;
    },

    /** One number that is the whole message. */
    heroStat({ eyebrow: eb, value, unit, label: lab, detail, notes } = {}) {
      const s = newSlide('stage');
      const fs = fitOneLine(String(value), TY.hero, 11.4, {
        bold: true, min: 80, extraEm: unit ? widthEm(unit, true) * 0.26 : 0,
      });
      const figH = (fs * 0.92) / 72;
      const labH = lab ? 0.62 : 0;
      const detH = detail ? textH(detail, TY.bodySmall, 8.6, 1.45) : 0;
      const groupH = 0.07 + 0.40 + (eb ? 0.44 : 0) + figH + (lab ? 0.30 + labH : 0) + (detail ? 0.24 + detH : 0);
      let y = Math.max(0.7, (S.contentBottom - groupH) / 2);
      rect(s, S.m, y, 1.5, 0.07, C.spark); y += 0.47;
      if (eb) { label(s, eb, { x: S.m, y, w: 9.0, color: C.inkMuted }); y += 0.44; }
      s.addText([
        { text: String(value), options: { fontSize: fs, bold: true, color: C.ink } },
        ...(unit ? [{ text: String(unit), options: { fontSize: Math.round(fs * 0.26), bold: true, color: C.spark } }] : []),
      ], { x: S.m - 0.14, y, w: 12.2, h: figH, fontFace: F.heading, margin: 0, valign: 'middle' });
      y += figH;
      if (lab) { s.addText(String(lab), {
        x: S.m, y: y + 0.30, w: 9.4, h: labH,
        fontFace: F.heading, fontSize: TY.cardTitle + 4, bold: true, color: C.ink, margin: 0, valign: 'top',
      }); y += 0.30 + labH; }
      if (detail) s.addText(String(detail), {
        x: S.m, y: y + 0.24, w: 8.6, h: detH + 0.12,
        fontFace: F.body, fontSize: TY.bodySmall, color: C.inkMuted,
        margin: 0, valign: 'top', lineSpacingMultiple: lsm(1.45),
      });
      if (notes) s.addNotes(String(notes));
      return s;
    },

    /**
     * Data table, in the Fact & Record Book register: white, ALL-CAPS
     * abbreviated heads, a single rule under the head, hairlines between
     * rows, numerals right-aligned, no fills and no zebra.
     */
    table({ eyebrow: eb, title: t, head: cols = [], rows = [], colW, note, legend, numericFrom = 1, notes } = {}) {
      const s = newSlide('data');
      const c = head(s, eb, t);
      // pptxgenjs honours colW and ignores w, so a colW array summing past the
      // content width silently runs the last column off the canvas.
      const raw = colW || cols.map((_, i) => (i === 0 ? c.w * 0.34 : (c.w * 0.66) / Math.max(1, cols.length - 1)));
      const sum = raw.reduce((a, b) => a + b, 0) || 1;
      const widths = raw.map((v) => (v * c.w) / sum);
      const footH = (note ? 0.4 : 0) + (legend ? 0.38 : 0);
      const rowH = Math.max(0.34, Math.min(0.72, (c.h - footH - 0.1) / (rows.length + 1)));

      const headRow = cols.map((h2, i) => ({
        text: String(h2).toUpperCase(),
        options: {
          bold: true, color: C.inkSubtle, fontFace: F.heading, fontSize: TY.caption, charSpacing: 1.4,
          align: i >= numericFrom ? 'right' : 'left', valign: 'bottom',
          fill: { color: C.bg },
          border: [{ type: 'none' }, { type: 'none' }, { type: 'solid', color: C.ruleStrong, pt: 1 }, { type: 'none' }],
        },
      }));
      const bodyRows = rows.map((r) => r.map((cell, i) => ({
        text: String(cell),
        options: {
          color: C.ink, fontFace: i >= numericFrom ? F.heading : F.body,
          fontSize: TY.bodySmall, bold: i === cols.length - 1,
          align: i >= numericFrom ? 'right' : 'left', valign: 'middle',
          fill: { color: C.bg },
          border: [{ type: 'none' }, { type: 'none' }, { type: 'solid', color: C.rule, pt: 0.5 }, { type: 'none' }],
        },
      })));

      s.addTable([headRow, ...bodyRows], {
        x: c.x, y: c.y, w: c.w, colW: widths,
        border: { type: 'none' }, rowH, margin: [4, 10, 4, 10],
      });
      let fy = c.y + rowH * (rows.length + 1) + 0.22;
      if (legend) { s.addText(String(legend), { x: c.x, y: fy, w: c.w, h: 0.32, fontFace: F.body, fontSize: TY.caption, color: C.inkSubtle, margin: 0 }); fy += 0.36; }
      if (note) s.addText(String(note), { x: c.x, y: fy, w: c.w, h: 0.38, fontFace: F.body, fontSize: TY.caption, color: C.inkSubtle, margin: 0 });
      footer(s);
      if (notes) s.addNotes(String(notes));
      return s;
    },

    /** The Record Book's OVERALL | HOME | ROAD panel table. */
    splitTable({ eyebrow: eb, title: t, rowLabel = '', panels = [], rows = [], note, notes } = {}) {
      const s = newSlide('data');
      const c = head(s, eb, t);
      const labelW = 2.9;
      const panelW = (c.w - labelW) / Math.max(1, panels.length);
      const rowH = Math.max(0.3, Math.min(0.68, (c.h - (note ? 0.5 : 0.1)) / (rows.length + 2)));
      // Equal widths inside a panel break records mid-value ("22-16-" / "10"),
      // so columns are weighted by what each head actually has to hold.
      const colWidths = [labelW, ...panels.flatMap((p) => {
        const wt = p.cols.map((x) => 0.7 + 0.30 * String(x).length);
        const tot = wt.reduce((a, b) => a + b, 0);
        return wt.map((v) => (v * panelW) / tot);
      })];

      const cell = (text, o = {}) => ({
        text: String(text),
        options: {
          align: o.align || 'right', valign: 'middle', fill: { color: C.bg },
          fontFace: o.head ? F.heading : (o.align === 'left' ? F.body : F.heading),
          fontSize: TY.caption, bold: !!o.bold, color: o.color || C.ink,
          charSpacing: o.track || 0, colspan: o.colspan,
          border: [{ type: 'none' }, { type: 'none' },
            { type: 'solid', color: o.rule || C.rule, pt: o.rulePt || 0.5 }, { type: 'none' }],
        },
      });

      // Panel headings are a merged row INSIDE the table. Drawn as separate
      // shapes they look identical until the column widths round differently
      // from the shape maths, and then every label sits off its own columns.
      const panelRow = [
        cell('', {}),
        ...panels.flatMap((p) => [
          cell(p.label.toUpperCase(), { align: 'center', bold: true, head: true, track: 1.4, color: C.inkSubtle, colspan: p.cols.length }),
          ...new Array(p.cols.length - 1).fill(null),
        ]),
      ].filter(Boolean);

      const headRow = [
        cell(String(rowLabel).toUpperCase(), { align: 'left', bold: true, head: true, track: 1.2, color: C.inkSubtle, rule: C.ruleStrong, rulePt: 1 }),
        ...panels.flatMap((p) => p.cols.map((x) => cell(String(x).toUpperCase(), { bold: true, head: true, track: 1.2, color: C.inkSubtle, rule: C.ruleStrong, rulePt: 1 }))),
      ];

      s.addTable([
        panelRow, headRow,
        ...rows.map((r) => r.map((v, i) => cell(v, { align: i === 0 ? 'left' : 'right' }))),
      ], { x: c.x, y: c.y, w: c.w, colW: colWidths, border: { type: 'none' }, rowH, margin: [3, 6, 3, 6] });

      if (note) s.addText(String(note), {
        x: c.x, y: c.y + rowH * (rows.length + 2) + 0.20, w: c.w, h: 0.4,
        fontFace: F.body, fontSize: TY.caption, color: C.inkSubtle, margin: 0,
      });
      footer(s);
      if (notes) s.addNotes(String(notes));
      return s;
    },

    standings({ eyebrow: eb, title: t, rows = [], legend = [], note, notes } = {}) {
      return api.table({
        eyebrow: eb, title: t,
        head: ['#', 'Club', 'MP', 'W', 'D', 'L', 'GD', 'PTS'],
        colW: [0.62, 4.30, 0.98, 0.98, 0.98, 0.98, 1.18, 1.18],
        rows, numericFrom: 2, legend: legend.length ? legend.join('      ') : null, note, notes,
      });
    },

    chart({ eyebrow: eb, title: t, type = 'bar', data = [], note, options = {}, notes } = {}) {
      const s = newSlide('data');
      const c = head(s, eb, t);
      const noteH = note ? 0.5 : 0;
      // A single nominal series takes ONE hue. Left alone pptxgenjs colours
      // each point differently, which spends the identity channel re-encoding
      // what bar length already shows -- and produces a rainbow.
      const colors = data.length > 1 ? C.chart : new Array(Math.max(1, (data[0]?.values || []).length)).fill(C.chart[0]);
      const anyDecimal = data.some((d) => (d.values || []).some((v) => !Number.isInteger(v)));
      const showsValues = options.showValue ?? !String(type).includes('line');
      s.addChart(pres.ChartType[type] || pres.ChartType.bar, data, {
        x: c.x, y: c.y, w: c.w, h: c.h - noteH,
        chartColors: colors, ...(anyDecimal ? { dataLabelFormatCode: '0.0' } : {}),
        showLegend: data.length > 1, legendPos: 'b',
        legendFontFace: F.body, legendFontSize: TY.caption, legendColor: C.inkMuted,
        showValue: showsValues,
        dataLabelPosition: String(type).includes('bar') ? 'outEnd' : 't',
        dataLabelFontFace: F.heading, dataLabelFontSize: TY.caption, dataLabelColor: C.inkMuted,
        catAxisLabelFontFace: F.body, catAxisLabelFontSize: TY.caption, catAxisLabelColor: C.axis,
        valAxisLabelFontFace: F.body, valAxisLabelFontSize: TY.caption, valAxisLabelColor: C.axis,
        // Gridlines and data labels are two ways of reading the same value.
        // With both on, a gridline runs straight through the digits.
        valGridLine: showsValues ? { style: 'none' } : { color: C.grid, size: 1 },
        catGridLine: { style: 'none' },
        valAxisLineShow: false, catAxisLineShow: false, ...options,
      });
      if (note) s.addText(String(note), {
        x: c.x, y: S.contentBottom - 0.36, w: c.w, h: 0.36,
        fontFace: F.body, fontSize: TY.caption, color: C.inkSubtle, margin: 0,
      });
      footer(s);
      if (notes) s.addNotes(String(notes));
      return s;
    },

    /** Two charts. Use instead of a dual axis, always. */
    chartPair({ eyebrow: eb, title: t, left = {}, right = {}, note, notes } = {}) {
      const s = newSlide('data');
      const c = head(s, eb, t);
      const w = (c.w - S.gutter * 2) / 2;
      const h = c.h - (note ? 0.5 : 0);
      [[left, c.x], [right, c.x + w + S.gutter * 2]].forEach(([cc, x]) => {
        label(s, cc.heading, { x, y: c.y, w });
        const cd = cc.data || [];
        const cols = cd.length > 1 ? C.chart : new Array(Math.max(1, (cd[0]?.values || []).length)).fill(C.chart[0]);
        const dec = cd.some((d) => (d.values || []).some((v) => !Number.isInteger(v)));
        const showsValues = (cc.options || {}).showValue ?? !String(cc.type || '').includes('line');
        s.addChart(pres.ChartType[cc.type] || pres.ChartType.bar, cd, {
          x, y: c.y + 0.46, w, h: h - 0.46,
          chartColors: cols, ...(dec ? { dataLabelFormatCode: '0.0' } : {}),
          showLegend: cd.length > 1, legendPos: 'b',
          legendFontFace: F.body, legendFontSize: TY.caption, legendColor: C.inkMuted,
          showValue: showsValues,
          dataLabelPosition: String(cc.type || 'bar').includes('bar') ? 'outEnd' : 't',
          dataLabelFontFace: F.heading, dataLabelFontSize: TY.caption, dataLabelColor: C.inkMuted,
          catAxisLabelFontFace: F.body, catAxisLabelFontSize: TY.caption, catAxisLabelColor: C.axis,
          valAxisLabelFontFace: F.body, valAxisLabelFontSize: TY.caption, valAxisLabelColor: C.axis,
          valGridLine: showsValues ? { style: 'none' } : { color: C.grid, size: 1 },
          catGridLine: { style: 'none' },
          valAxisLineShow: false, catAxisLineShow: false, ...(cc.options || {}),
        });
      });
      if (note) s.addText(String(note), {
        x: c.x, y: S.contentBottom - 0.36, w: c.w, h: 0.36,
        fontFace: F.body, fontSize: TY.caption, color: C.inkSubtle, margin: 0,
      });
      footer(s);
      if (notes) s.addNotes(String(notes));
      return s;
    },

    /* ---- League modules ------------------------------------------ */

    ranked({ eyebrow: eb, title: t, items = [], startAt = 1, note, notes } = {}) {
      const s = newSlide('data');
      const c = head(s, eb, t);
      const half = Math.ceil(items.length / 2);
      const colW = (c.w - S.gutter * 2) / 2;
      const rowH = Math.min(0.74, (c.h - (note ? 0.4 : 0)) / Math.max(1, half));
      items.forEach((it, i) => {
        const col = i < half ? 0 : 1;
        const x = c.x + col * (colW + S.gutter * 2);
        const y = c.y + (i - col * half) * rowH;
        s.addText(String(startAt + i), {
          x, y, w: 0.5, h: rowH,
          fontFace: F.heading, fontSize: TY.bodySmall, bold: true, color: C.spark, margin: 0, valign: 'middle',
        });
        s.addText(String(it.name), {
          x: x + 0.6, y, w: colW - 2.0, h: rowH,
          fontFace: F.body, fontSize: TY.bodySmall + 1, color: C.ink, margin: 0, valign: 'middle',
        });
        if (it.move != null) s.addText(String(it.move), {
          x: x + colW - 1.4, y, w: 0.6, h: rowH,
          fontFace: F.body, fontSize: TY.caption, color: C.inkSubtle, align: 'right', margin: 0, valign: 'middle',
        });
        if (it.value != null) s.addText(String(it.value), {
          x: x + colW - 0.75, y, w: 0.75, h: rowH,
          fontFace: F.heading, fontSize: TY.bodySmall + 1, bold: true, color: C.figure, align: 'right', margin: 0, valign: 'middle',
        });
        rule(s, { x, y: y + rowH - 0.01, w: colW });
      });
      if (note) s.addText(String(note), {
        x: c.x, y: S.contentBottom - 0.34, w: c.w, h: 0.34,
        fontFace: F.body, fontSize: TY.caption, color: C.inkSubtle, margin: 0,
      });
      footer(s);
      if (notes) s.addNotes(String(notes));
      return s;
    },

    /** Six items, divided by hairlines. Six is MLS's number on its own site. */
    sixUp({ eyebrow: eb, title: t, cards = [], notes } = {}) {
      const s = newSlide('page');
      const c = head(s, eb, t);
      const cols = 3, rows = Math.ceil(Math.min(cards.length, 6) / cols);
      const gut = 0.62;
      const w = (c.w - gut * (cols - 1)) / cols, h = c.h / rows;
      cards.slice(0, 6).forEach((card, i) => {
        const cx = i % cols, cy = Math.floor(i / cols);
        const px = c.x + cx * (w + gut), pw = w;
        const y = c.y + cy * h;
        if (cx > 0) rect(s, px - gut / 2, y + 0.06, 0.012, h - 0.5, C.rule);
        if (cy > 0) rule(s, { x: px, y: y - 0.02, w: pw });
        label(s, card.kicker, { x: px, y: y + 0.24, w: pw, color: C.spark });
        s.addText(String(card.title || ''), {
          x: px, y: y + 0.72, w: balanceWidth(card.title, TY.cardTitle, pw, { bold: true }), h: h - 1.0,
          fontFace: F.heading, fontSize: TY.cardTitle, bold: true, color: C.ink,
          margin: 0, valign: 'top', lineSpacingMultiple: lsm(1.24),
        });
      });
      footer(s);
      if (notes) s.addNotes(String(notes));
      return s;
    },

    tileGrid({ eyebrow: eb, title: t, tiles = [], cols = 5, notes } = {}) {
      const s = newSlide('page');
      const c = head(s, eb, t);
      const rows = Math.ceil(tiles.length / cols);
      const gap = 0.22;
      const w = (c.w - gap * (cols - 1)) / cols;
      const h = (c.h - gap * (rows - 1)) / rows;
      const size = Math.min(TY.bodySmall, ...tiles.map((x) =>
        fitOneLine(String(typeof x === 'string' ? x : x.label), TY.bodySmall, w - 0.5, { bold: true, min: 10 })));
      tiles.forEach((tile, i) => {
        const x = c.x + (i % cols) * (w + gap);
        const y = c.y + Math.floor(i / cols) * (h + gap);
        rect(s, x, y, w, h, C.dark ? C.panel : C.bgSubtle);
        rect(s, x, y, w, 0.05, C.spark);
        s.addText(String(typeof tile === 'string' ? tile : tile.label), {
          x: x + 0.25, y, w: w - 0.5, h,
          fontFace: F.heading, fontSize: size, bold: true, color: C.ink,
          margin: 0, valign: 'middle', lineSpacingMultiple: lsm(1.16),
        });
      });
      footer(s);
      if (notes) s.addNotes(String(notes));
      return s;
    },

    /** Thirty crest sockets, square and equal. Crests are never shipped here. */
    crestWall({ eyebrow: eb, title: t, clubs: list = [], cols = 10, note, notes } = {}) {
      const s = newSlide('page');
      const c = head(s, eb, t);
      const rows = Math.ceil(list.length / cols);
      const gap = 0.18;
      const avail = c.h - (note ? 0.46 : 0);
      const cell = Math.min((c.w - gap * (cols - 1)) / cols, (avail - gap * (rows - 1)) / rows);
      const x0 = c.x, y0 = c.y + Math.max(0, (avail - (cell * rows + gap * (rows - 1))) / 2);
      list.forEach((cl, i) => {
        const x = x0 + (i % cols) * (cell + gap);
        const y = y0 + Math.floor(i / cols) * (cell + gap);
        rect(s, x, y, cell, cell, C.dark ? C.panel : C.bgSubtle);
        s.addText(String(typeof cl === 'string' ? cl : cl.tricode).toUpperCase(), {
          x, y, w: cell, h: cell,
          fontFace: F.heading, fontSize: TY.caption, bold: true, color: C.inkMuted,
          align: 'center', margin: 0, valign: 'middle', charSpacing: 0.8,
        });
      });
      if (note) s.addText(String(note), {
        x: c.x, y: S.contentBottom - 0.36, w: c.w, h: 0.36,
        fontFace: F.body, fontSize: TY.caption, color: C.inkSubtle, margin: 0,
      });
      footer(s);
      if (notes) s.addNotes(String(notes));
      return s;
    },

    /**
     * Team sheet on a drawn pitch. The markings are what make it read as
     * football at a glance, and they cost six rectangles. Player names sit on
     * a plate of pitch colour so a marking passes behind them cleanly rather
     * than striking through the letters, which is how broadcast does it.
     */
    formation({ eyebrow: eb, title: t, lines: ls = [], coach, bench = [], notes } = {}) {
      const s = newSlide('page');
      const c = head(s, eb, t);
      const pw = 4.15, px = c.x, py = c.y, ph = c.h;
      const PITCH = C.dark ? C.panel : hex(T.color.brand.navy);
      const LN = mixHex('#FFFFFF', PITCH, 0.62);
      rect(s, px, py, pw, ph, PITCH);
      const lw = 0.018, inset = 0.14;
      rect(s, px + inset, py + inset, pw - inset * 2, lw, LN);
      rect(s, px + inset, py + ph - inset, pw - inset * 2, lw, LN);
      rect(s, px + inset, py + inset, lw, ph - inset * 2, LN);
      rect(s, px + pw - inset, py + inset, lw, ph - inset * 2, LN);
      rect(s, px + inset, py + ph / 2, pw - inset * 2, lw, LN);
      // A centre spot rather than a centre circle: the player rows either
      // side of the halfway line sit inside the circle's radius, and the
      // knockout behind each name would chop the ring into arcs.
      s.addShape(pres.ShapeType.ellipse, {
        x: px + pw / 2 - 0.05, y: py + ph / 2 - 0.05, w: 0.10, h: 0.10,
        fill: { color: LN }, line: { type: 'none' },
      });
      const boxW = pw * 0.52, boxH = ph * 0.115;
      [py + inset, py + ph - inset - boxH].forEach((by) => {
        s.addShape(pres.ShapeType.rect, {
          x: px + pw / 2 - boxW / 2, y: by, w: boxW, h: boxH,
          fill: { type: 'none' }, line: { color: LN, width: 1.1 },
        });
      });
      // Rows sit strictly between the two penalty areas; any looser and a
      // name lands on a drawn line and is struck through by it.
      const keepOut = inset + boxH + 0.14;
      const band = { top: py + keepOut, h: ph - keepOut * 2 };
      const rowH = band.h / Math.max(1, ls.length);
      ls.forEach((ln, li) => {
        const y = band.top + band.h - (li + 1) * rowH + rowH / 2;
        const n = ln.players.length, cw = (pw - 0.36) / n;
        ln.players.forEach((pl, pi) => {
          const cx = px + 0.18 + pi * cw + cw / 2;
          s.addShape(pres.ShapeType.ellipse, {
            x: cx - 0.115, y: y - 0.30, w: 0.23, h: 0.23,
            fill: { color: C.spark }, line: { type: 'none' },
          });
          const name = String(pl).replace(/\s*\((.*)\)\s*$/, '');
          const nw = Math.min(cw, (widthEm(name, true) * 9.5) / 72 + 0.16);
          s.addText(name, {
            x: cx - nw / 2, y: y - 0.03, w: nw, h: 0.24,
            fontFace: F.heading, fontSize: 9.5, bold: true, color: '#FFFFFF'.replace('#', ''),
            fill: { color: PITCH }, align: 'center', margin: 0, valign: 'middle',
          });
        });
      });
      /* Right-hand sheet. Heights come from the measured text, not from
       * dividing the column evenly: an even split gives a two-word coach line
       * the same room as an eight-name bench, and the bench runs over. */
      const rx = px + pw + 0.62, rw = S.w - S.m - rx;
      const items = [
        ...ls.slice().reverse().map((ln) => [ln.label, ln.players.join(',  ')]),
        ...(coach ? [['Coach', coach]] : []),
        ...(bench.length ? [['Bench', bench.join(',  ')]] : []),
      ];
      const bodyH = items.map(([, v]) => textH(v, 12.5, rw, 1.2));
      const need = bodyH.reduce((a, b) => a + b + 0.30, 0);
      const pad = Math.max(0.10, Math.min(0.34, (c.h - need) / Math.max(1, items.length)));
      let ry = c.y + Math.max(0, (c.h - need - pad * items.length) / 2);
      items.forEach(([lab, val], i) => {
        label(s, lab, { x: rx, y: ry, w: rw });
        s.addText(String(val), {
          x: rx, y: ry + 0.30, w: rw, h: bodyH[i] + 0.06,
          fontFace: F.body, fontSize: 12.5, color: C.ink,
          margin: 0, valign: 'top', lineSpacingMultiple: lsm(1.2),
        });
        ry += 0.30 + bodyH[i] + pad;
        if (i < items.length - 1) rule(s, { x: rx, y: ry - pad / 2, w: rw });
      });
      footer(s);
      if (notes) s.addNotes(String(notes));
      return s;
    },

    /** Knockout bracket, with connectors so it reads as a progression. */
    bracket({ eyebrow: eb, title: t, rounds = [], note, notes } = {}) {
      const s = newSlide('data');
      const c = head(s, eb, t);
      const n = rounds.length || 1;
      const colW = (c.w - S.gutter * 2 * (n - 1)) / n;
      const avail = c.h - (note ? 0.45 : 0);
      const centres = [];
      rounds.forEach((rd, ri) => {
        const x = c.x + ri * (colW + S.gutter * 2);
        label(s, rd.label, {
          x, y: c.y, w: colW,
          size: fitOneLine(String(rd.label).toUpperCase(), TY.eyebrow, colW, {
            bold: true, min: 8, extraEm: String(rd.label).length * (1.6 / TY.eyebrow),
          }),
        });
        const m = rd.matches.length;
        const slot = (avail - 0.5) / Math.max(1, m);
        const boxH = Math.min(0.7, slot - 0.16);
        centres[ri] = [];
        rd.matches.forEach((mt, mi) => {
          const y = c.y + 0.5 + mi * slot + (slot - boxH) / 2;
          centres[ri].push(y + boxH / 2);
          rect(s, x, y, colW, boxH, mt.winner ? (C.dark ? C.panel : C.bgSubtle) : C.bg);
          rule(s, { x, y: y + boxH, w: colW, color: C.rule });
          if (mt.winner) rect(s, x, y, 0.05, boxH, C.spark);
          s.addText(String(mt.label), {
            x: x + 0.18, y, w: colW - 0.32, h: boxH,
            fontFace: F.body, fontSize: TY.caption,
            color: mt.winner ? C.ink : C.inkMuted, bold: !!mt.winner, margin: 0, valign: 'middle',
          });
        });
      });
      // Without connectors this is columns of boxes, not a bracket.
      for (let ri = 0; ri < rounds.length - 1; ri++) {
        const xEnd = c.x + ri * (colW + S.gutter * 2) + colW;
        const xMid = xEnd + S.gutter;
        centres[ri].forEach((cy, mi) => {
          const target = centres[ri + 1][Math.floor(mi / 2)];
          if (target == null) return;
          rule(s, { x: xEnd, y: cy, w: S.gutter, color: C.ruleMid, h: 0.008 });
          const top = Math.min(cy, target), bot = Math.max(cy, target);
          rect(s, xMid, top, 0.008, bot - top, C.ruleMid);
          rule(s, { x: xMid, y: target, w: S.gutter, color: C.ruleMid, h: 0.008 });
        });
      }
      if (note) s.addText(String(note), {
        x: c.x, y: S.contentBottom - 0.34, w: c.w, h: 0.34,
        fontFace: F.body, fontSize: TY.caption, color: C.inkSubtle, margin: 0,
      });
      footer(s);
      if (notes) s.addNotes(String(notes));
      return s;
    },

    matchup({ competition, home = {}, away = {}, score, state, venue, date, image, notes } = {}) {
      const s = newSlide('stage', { image });
      const half = S.w / 2;
      const meta = [state, venue, date].filter(Boolean).join('      ');
      const gH = 0.34 + 0.30 + 0.05 + 0.42 + 1.05 + 0.42 + (meta ? 0.34 + 0.40 : 0);
      let y = (S.contentBottom - gH) / 2;
      if (competition) label(s, competition, { x: 0, y, w: S.w, color: C.inkMuted, align: 'center' });
      y += 0.34 + 0.30;
      rect(s, half - 0.75, y, 1.5, 0.05, C.spark);
      y += 0.05 + 0.42;
      [[home, 'right'], [away, 'left']].forEach(([team, align]) => {
        const x = align === 'right' ? S.m : half + 1.55;
        const w = half - 1.55 - S.m;
        s.addText(String(team.name || ''), {
          x, y, w, h: 1.05,
          fontFace: F.heading, fontSize: 26, bold: true, color: C.ink, align, margin: 0, valign: 'middle',
        });
        if (team.detail) s.addText(String(team.detail), {
          x, y: y + 1.05, w, h: 0.4,
          fontFace: F.body, fontSize: TY.caption, color: C.inkMuted, align, margin: 0, valign: 'top',
        });
      });
      s.addText(String(score || 'v'), {
        x: half - 1.55, y, w: 3.10, h: 1.05,
        fontFace: F.heading, fontSize: 68, bold: true, color: C.ink,
        align: 'center', margin: 0, valign: 'middle',
      });
      y += 1.05 + 0.42;
      if (meta) {
        rect(s, half - 2.6, y, 5.2, 0.012, C.ruleMid);
        s.addText(meta, {
          x: 0, y: y + 0.34, w: S.w, h: 0.4,
          fontFace: F.body, fontSize: TY.bodySmall, color: C.inkMuted, align: 'center', margin: 0,
        });
      }
      if (notes) s.addNotes(String(notes));
      return s;
    },

    /* ---- Comparison and time ------------------------------------- */

    timeline({ eyebrow: eb, title: t, milestones = [], note, notes } = {}) {
      const s = newSlide('page');
      const c = head(s, eb, t);
      const n = Math.max(1, milestones.length);
      const w = c.w / n, cw = w - 0.4;
      const titleH = Math.max(...milestones.map((ms) => textH(ms.title, TY.cardTitle, cw, 1.18, { bold: true })), 0.34);
      const bodyH = Math.max(...milestones.map((ms) => (ms.body ? textH(ms.body, TY.bodySmall, cw, 1.4) : 0)), 0);
      const base = 0.72 + 0.36 + titleH + 0.24 + bodyH;
      const slack = Math.max(0, c.h - (note ? 0.45 : 0) - base);
      const g = Math.min(0.46, slack / 3);
      const gapT = 0.36 + g, gapB = 0.24 + g;
      const groupH = 0.72 + gapT + titleH + gapB + bodyH;
      const lineY = c.y + Math.max(0.2, (c.h - (note ? 0.45 : 0) - groupH) / 2) + 0.72;
      rule(s, { x: c.x, y: lineY, w: c.w, color: C.ruleMid, h: 0.016 });
      milestones.forEach((ms, i) => {
        const x = c.x + i * w;
        s.addText(String(ms.when || ''), {
          x, y: lineY - 0.74, w: cw, h: 0.6,
          fontFace: F.heading, fontSize: TY.cardTitle + 3, bold: true, color: C.figure, margin: 0, valign: 'bottom',
        });
        rect(s, x, lineY - 0.06, 0.14, 0.14, C.spark);
        s.addText(String(ms.title || ''), {
          x, y: lineY + gapT, w: balanceWidth(ms.title, TY.cardTitle, cw, { bold: true }), h: titleH,
          fontFace: F.heading, fontSize: TY.cardTitle, bold: true, color: C.ink,
          margin: 0, valign: 'top', lineSpacingMultiple: lsm(1.08),
        });
        if (ms.body) s.addText(String(ms.body), {
          x, y: lineY + gapT + titleH + gapB, w: cw, h: bodyH + 0.1,
          fontFace: F.body, fontSize: TY.bodySmall, color: C.inkMuted,
          margin: 0, valign: 'top', lineSpacingMultiple: lsm(1.4),
        });
      });
      if (note) s.addText(String(note), {
        x: c.x, y: S.contentBottom - 0.34, w: c.w, h: 0.36,
        fontFace: F.body, fontSize: TY.caption, color: C.inkSubtle, margin: 0,
      });
      footer(s);
      if (notes) s.addNotes(String(notes));
      return s;
    },

    compare({ eyebrow: eb, title: t, left = {}, right = {}, criteria = [], notes } = {}) {
      const s = newSlide('data');
      const c = head(s, eb, t);
      const labelW = 3.1;
      const colW = (c.w - labelW) / 2;
      const headH = 0.62;
      [[left, c.x + labelW], [right, c.x + labelW + colW]].forEach(([col, x]) => {
        s.addText(String(col.heading || '').toUpperCase(), {
          x, y: c.y, w: colW - 0.3, h: headH,
          fontFace: F.heading, fontSize: TY.caption, bold: true, charSpacing: 1.4,
          color: C.inkSubtle, margin: 0, valign: 'bottom',
        });
      });
      rule(s, { x: c.x, y: c.y + headH, w: c.w, color: C.ruleStrong, h: 0.02 });
      const rowH = (c.h - headH - 0.02) / Math.max(1, criteria.length);
      criteria.forEach((cr, i) => {
        const y = c.y + headH + 0.02 + i * rowH;
        s.addText(String(cr.label), {
          x: c.x, y, w: labelW - 0.24, h: rowH,
          fontFace: F.body, fontSize: TY.bodySmall, color: C.inkSubtle, margin: 0, valign: 'middle',
        });
        s.addText(String(cr.left ?? ''), {
          x: c.x + labelW, y, w: colW - 0.3, h: rowH,
          fontFace: F.body, fontSize: TY.bodySmall + 1, color: C.ink, margin: 0, valign: 'middle',
        });
        s.addText(String(cr.right ?? ''), {
          x: c.x + labelW + colW, y, w: colW - 0.3, h: rowH,
          fontFace: F.heading, fontSize: TY.bodySmall + 1, bold: true, color: C.ink, margin: 0, valign: 'middle',
        });
        rule(s, { x: c.x, y: y + rowH - 0.01, w: c.w });
      });
      footer(s);
      if (notes) s.addNotes(String(notes));
      return s;
    },

    process({ eyebrow: eb, title: t, steps = [], notes } = {}) {
      const s = newSlide('page');
      const c = head(s, eb, t);
      const n = Math.max(1, steps.length);
      const w = (c.w - S.gutter * (n - 1)) / n;
      const titleH = Math.max(...steps.map((st) => textH(st.title, TY.cardTitle, w, 1.18, { bold: true })), 0.34);
      const bodyH = Math.max(...steps.map((st) => (st.body ? textH(st.body, TY.bodySmall, w, 1.4) : 0)), 0);
      const groupH = 0.86 + 0.48 + titleH + 0.24 + bodyH;
      const gy = c.y + Math.max(0, (c.h - groupH) / 2);
      steps.forEach((st, i) => {
        const x = c.x + i * (w + S.gutter);
        s.addText(String(i + 1).padStart(2, '0'), {
          x, y: gy, w: 1.2, h: 0.86,
          fontFace: F.heading, fontSize: 34, bold: true, color: C.spark, margin: 0, valign: 'middle',
        });
        rule(s, { x, y: gy + 1.10, w, color: C.ruleMid, h: 0.014 });
        s.addText(String(st.title || ''), {
          x, y: gy + 1.34, w: balanceWidth(st.title, TY.cardTitle, w, { bold: true }), h: titleH,
          fontFace: F.heading, fontSize: TY.cardTitle, bold: true, color: C.ink,
          margin: 0, valign: 'top', lineSpacingMultiple: lsm(1.08),
        });
        if (st.body) s.addText(String(st.body), {
          x, y: gy + 1.34 + titleH + 0.24, w, h: bodyH + 0.1,
          fontFace: F.body, fontSize: TY.bodySmall, color: C.inkMuted,
          margin: 0, valign: 'top', lineSpacingMultiple: lsm(1.4),
        });
      });
      footer(s);
      if (notes) s.addNotes(String(notes));
      return s;
    },

    /* ---- Utility -------------------------------------------------- */

    logoWall({ eyebrow: eb, title: t, marks = [], cols = 6, note, notes } = {}) {
      const s = newSlide('page');
      const c = head(s, eb, t);
      const rows = Math.ceil(marks.length / cols);
      const gap = 0.22;
      const avail = c.h - (note ? 0.5 : 0);
      const w = (c.w - gap * (cols - 1)) / cols;
      const h = (avail - gap * (rows - 1)) / rows;
      // One size for every mark, chosen so the longest still sets on a single
      // line; otherwise one two-line name breaks the row's shared baseline.
      const size = Math.min(TY.bodySmall, ...marks.map((mk) => fitOneLine(String(mk), TY.bodySmall, w - 0.24, { bold: true, min: 10 })));
      marks.forEach((mk, i) => {
        const x = c.x + (i % cols) * (w + gap);
        const y = c.y + Math.floor(i / cols) * (h + gap);
        rect(s, x, y, w, h, C.dark ? C.panel : C.bgSubtle);
        s.addText(String(mk), {
          x: x + 0.12, y, w: w - 0.24, h,
          fontFace: F.heading, fontSize: size, bold: true, color: C.inkSubtle,
          align: 'center', margin: 0, valign: 'middle',
        });
      });
      if (note) s.addText(String(note), {
        x: c.x, y: S.contentBottom - 0.38, w: c.w, h: 0.38,
        fontFace: F.body, fontSize: TY.caption, color: C.inkSubtle, margin: 0,
      });
      footer(s);
      if (notes) s.addNotes(String(notes));
      return s;
    },

    blank({ role = 'page' } = {}) { return newSlide(role); },

    save(file) { return pres.writeFile({ fileName: file }); },
  };

  return api;
}

module.exports = {
  createDeck, theme, DESIGNS,
  TOKENS: T, CLUBS, SLIDE: S, FONTS, hex, mixHex,
};
