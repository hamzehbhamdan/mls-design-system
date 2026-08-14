/**
 * MLS Design System — Word layer
 *
 *   const { createDoc } = require('./templates/js/mls-doc.cjs');
 *   const doc = createDoc({ club: 'por', title: 'Season review' });
 *   doc.cover({ eyebrow: 'Board of Governors', title: 'Season review' });
 *   doc.h1('Summary'); doc.p('...');
 *   await doc.save('review.docx');
 *
 * Colours and sizes are read from dist/ at require time, so a token change
 * propagates with no edit here.
 *
 * Headings are emitted as REAL Word styles (Heading 1..3, overridden rather
 * than faked with direct formatting), so the navigation pane, the table of
 * contents and any later restyling all work the way a Word user expects.
 */

const fs = require('fs');
const path = require('path');
const D = require('docx');

const DIST = path.join(__dirname, '..', '..', 'dist');
const T = JSON.parse(fs.readFileSync(path.join(DIST, 'mls.tokens.json'), 'utf8')).tokens;
const CLUBS = JSON.parse(fs.readFileSync(path.join(DIST, 'mls.clubs.json'), 'utf8')).clubs;

const hex = (v) => String(v).replace('#', '').slice(0, 6).toUpperCase();
/** docx sizes are HALF-POINTS. 11pt is 22. Getting this wrong doubles or halves everything. */
const halfPt = (v) => Math.round(parseFloat(String(v)) * 2);
/** DXA twips: 1440 per inch. Word's unit for page size, margins and table widths. */
const dxa = (inches) => Math.round(parseFloat(String(inches)) * 1440);

const TP = T.typePrint;
const PAGE = {
  width: dxa(T.page.letterWidth), height: dxa(T.page.letterHeight),
  top: dxa(T.page.marginTop), bottom: dxa(T.page.marginBottom),
  left: dxa(T.page.marginInner), right: dxa(T.page.marginOuter),
};
PAGE.textWidth = PAGE.width - PAGE.left - PAGE.right;

const FONTS = {
  safe:     { heading: T.office.safeHeading, body: T.office.safeBody },
  licensed: { heading: T.office.licensedHeading, body: T.office.licensedBody },
};

function palette(club) {
  const c = club ? CLUBS.find((x) => x.slug === club || x.tricode.toLowerCase() === String(club).toLowerCase()) : null;
  if (club && !c) throw new Error(`Unknown club "${club}". Use a slug from data/clubs.json.`);
  return {
    accent: hex(c ? c.theme.accentLight : T.color.brand.red),
    onAccent: hex(c ? c.theme.onAccentLight : '#FFFFFF'),
    clubName: c ? (c.nameLocalised || c.name) : 'Major League Soccer',
    ink: hex(T.color.primitive.neutral['900']),
    inkMuted: hex(T.color.primitive.neutral['700']),
    inkSubtle: hex(T.color.primitive.neutral['600']),
    navy: hex(T.color.brand.navy),
    rule: hex(T.color.primitive.neutral['200']),
    zebra: hex(T.color.primitive.neutral['50']),
    success: hex(T.color.primitive.green['700']),
    warning: hex(T.color.primitive.amber['800']),
    danger: hex(T.color.primitive.red['700']),
    info: hex(T.color.primitive.cyan['700']),
  };
}

function createDoc(opts = {}) {
  const {
    club = null, fonts = 'safe',
    title = 'Untitled', subtitle = '', creator = 'MLS Design System',
    footerText = null, pageNumbers = true,
  } = opts;

  const P = palette(club);
  const F = FONTS[fonts] || FONTS.safe;
  const children = [];

  const run = (text, o = {}) => new D.TextRun({ text: String(text), font: o.font || F.body, ...o });

  const para = (o) => new D.Paragraph(o);

  /* ---------------- public API ---------------- */

  const api = {
    /** Cover page. The 45-degree device does not survive Word well, so the
     *  cover leans on a heavy navy rule and scale instead of faking it. */
    cover({ eyebrow, title: t, subtitle: sub, meta = [], note } = {}) {
      if (eyebrow) children.push(para({
        spacing: { before: 2400, after: 160 },
        children: [run(String(eyebrow).toUpperCase(), {
          font: F.heading, bold: true, size: halfPt(TP.caption), color: P.inkSubtle, characterSpacing: 30,
        })],
      }));
      children.push(para({
        spacing: { after: 200 },
        children: [run(t || title, { font: F.heading, bold: true, size: halfPt(TP.coverTitle), color: P.ink })],
      }));
      // A paragraph bottom border, not a one-row table. A table used as a rule
      // breaks reflow and confuses screen readers.
      children.push(para({
        border: { bottom: { style: D.BorderStyle.SINGLE, size: 18, color: P.accent, space: 6 } },
        spacing: { after: 300 },
      }));
      if (sub) children.push(para({
        spacing: { after: 400 },
        children: [run(sub, { size: halfPt(TP.coverSubtitle), color: P.inkMuted })],
      }));
      meta.forEach(([k, v]) => children.push(para({
        spacing: { after: 80 },
        children: [
          run(`${k}  `, { font: F.heading, bold: true, size: halfPt(TP.small), color: P.inkSubtle }),
          run(v, { size: halfPt(TP.small), color: P.ink }),
        ],
      })));
      if (note) children.push(para({
        spacing: { before: 600 },
        children: [run(note, { size: halfPt(TP.caption), color: P.inkSubtle, italics: true })],
      }));
      api.pageBreak();
      return api;
    },

    /** Real Word TOC field. Populates on open, or on F9. */
    toc(heading = 'Contents') {
      children.push(para({ heading: D.HeadingLevel.HEADING_1, children: [run(heading, { font: F.heading, bold: true, size: halfPt(TP.h1), color: P.ink })] }));
      children.push(new D.TableOfContents('toc', { hyperlink: true, headingStyleRange: '1-3' }));
      api.pageBreak();
      return api;
    },

    h1(text) {
      children.push(para({
        heading: D.HeadingLevel.HEADING_1,
        spacing: { before: 480, after: 180 },
        children: [run(text, { font: F.heading, bold: true, size: halfPt(TP.h1), color: P.ink })],
      }));
      return api;
    },
    h2(text) {
      children.push(para({
        heading: D.HeadingLevel.HEADING_2,
        spacing: { before: 360, after: 140 },
        children: [run(text, { font: F.heading, bold: true, size: halfPt(TP.h2), color: P.ink })],
      }));
      return api;
    },
    h3(text) {
      children.push(para({
        heading: D.HeadingLevel.HEADING_3,
        spacing: { before: 280, after: 120 },
        children: [run(text, { font: F.heading, bold: true, size: halfPt(TP.h3), color: P.inkMuted })],
      }));
      return api;
    },

    /** Small tracked caps above a heading. */
    eyebrow(text) {
      children.push(para({
        spacing: { before: 320, after: 60 },
        children: [run(String(text).toUpperCase(), {
          font: F.heading, bold: true, size: halfPt(TP.caption), color: P.inkSubtle, characterSpacing: 30,
        })],
      }));
      return api;
    },

    /** Body paragraph. Accepts a string, or an array of {text, bold, italics}. */
    p(content, o = {}) {
      const runs = Array.isArray(content)
        ? content.map((c) => (typeof c === 'string' ? run(c, { size: halfPt(TP.body), color: P.ink }) : run(c.text, { size: halfPt(TP.body), color: c.color ? hex(c.color) : P.ink, bold: c.bold, italics: c.italics })))
        : [run(content, { size: halfPt(TP.body), color: P.ink })];
      children.push(para({ spacing: { after: 160, line: 300 }, alignment: o.align, children: runs }));
      return api;
    },

    /** Opening paragraph of a section, set slightly larger. */
    lead(text) {
      children.push(para({
        spacing: { after: 200, line: 320 },
        children: [run(text, { size: halfPt(TP.bodyLead), color: P.inkMuted })],
      }));
      return api;
    },

    bullets(items = [], level = 0) {
      items.forEach((it) => children.push(para({
        // Word's own list numbering. Never a literal bullet character.
        numbering: { reference: 'mls-bullets', level },
        spacing: { after: 90, line: 290 },
        children: [run(typeof it === 'string' ? it : it.text, {
          size: halfPt(TP.body), color: P.ink, bold: typeof it === 'object' && it.bold,
        })],
      })));
      return api;
    },

    numbered(items = [], level = 0) {
      items.forEach((it) => children.push(para({
        numbering: { reference: 'mls-numbers', level },
        spacing: { after: 90, line: 290 },
        children: [run(typeof it === 'string' ? it : it.text, { size: halfPt(TP.body), color: P.ink })],
      })));
      return api;
    },

    /** Callout. Left rule plus a tinted fill, in one of four roles. */
    callout({ kind = 'note', title: t, body } = {}) {
      const color = { note: P.accent, warning: P.warning, danger: P.danger, success: P.success, info: P.info }[kind] || P.accent;
      const cell = new D.TableCell({
        width: { size: PAGE.textWidth, type: D.WidthType.DXA },
        // CLEAR, never SOLID — SOLID renders black.
        shading: { type: D.ShadingType.CLEAR, fill: P.zebra, color: 'auto' },
        borders: {
          left: { style: D.BorderStyle.SINGLE, size: 18, color },
          top: { style: D.BorderStyle.NIL }, bottom: { style: D.BorderStyle.NIL }, right: { style: D.BorderStyle.NIL },
        },
        margins: { top: 160, bottom: 160, left: 220, right: 220 },
        children: [
          ...(t ? [para({ spacing: { after: 70 }, children: [run(t, { font: F.heading, bold: true, size: halfPt(TP.body), color })] })] : []),
          para({ children: [run(body || '', { size: halfPt(TP.small), color: P.ink })] }),
        ],
      });
      children.push(new D.Table({
        columnWidths: [PAGE.textWidth],
        width: { size: PAGE.textWidth, type: D.WidthType.DXA },
        rows: [new D.TableRow({ children: [cell] })],
      }));
      children.push(para({ spacing: { after: 220 } }));
      return api;
    },

    /**
     * Data table. Header row in the accent, zebra body, numeric columns
     * right-aligned. Column widths are set on the table AND on every cell, in
     * DXA — percentage widths break in Google Docs.
     */
    table({ head = [], rows = [], widths, caption, numericFrom = 1 } = {}) {
      const cols = widths
        ? widths.map((w) => Math.round((w / widths.reduce((a, b) => a + b, 0)) * PAGE.textWidth))
        : head.map((_, i) => (i === 0
            ? Math.round(PAGE.textWidth * 0.34)
            : Math.round((PAGE.textWidth * 0.66) / Math.max(1, head.length - 1))));
      // Rounding must not leave the columns summing to more than the table.
      cols[cols.length - 1] = PAGE.textWidth - cols.slice(0, -1).reduce((a, b) => a + b, 0);

      const headRow = new D.TableRow({
        tableHeader: true, // repeats across a page break
        children: head.map((h, i) => new D.TableCell({
          width: { size: cols[i], type: D.WidthType.DXA },
          shading: { type: D.ShadingType.CLEAR, fill: P.accent, color: 'auto' },
          margins: { top: 90, bottom: 90, left: 130, right: 130 },
          children: [para({
            alignment: i >= numericFrom ? D.AlignmentType.RIGHT : D.AlignmentType.LEFT,
            children: [run(String(h).toUpperCase(), {
              font: F.heading, bold: true, size: halfPt(TP.tableHeader), color: P.onAccent, characterSpacing: 20,
            })],
          })],
        })),
      });

      const bodyRows = rows.map((r, ri) => new D.TableRow({
        children: r.map((c, i) => new D.TableCell({
          width: { size: cols[i], type: D.WidthType.DXA },
          shading: { type: D.ShadingType.CLEAR, fill: ri % 2 ? P.zebra : 'FFFFFF', color: 'auto' },
          margins: { top: 80, bottom: 80, left: 130, right: 130 },
          borders: { top: { style: D.BorderStyle.SINGLE, size: 4, color: P.rule }, bottom: { style: D.BorderStyle.SINGLE, size: 4, color: P.rule }, left: { style: D.BorderStyle.NIL }, right: { style: D.BorderStyle.NIL } },
          children: [para({
            alignment: i >= numericFrom ? D.AlignmentType.RIGHT : D.AlignmentType.LEFT,
            children: [run(String(c), { size: halfPt(TP.tableCell), color: P.ink })],
          })],
        })),
      }));

      children.push(new D.Table({
        columnWidths: cols,
        width: { size: PAGE.textWidth, type: D.WidthType.DXA },
        rows: [headRow, ...bodyRows],
      }));
      if (caption) children.push(para({
        spacing: { before: 120, after: 240 },
        children: [run(caption, { size: halfPt(TP.caption), color: P.inkSubtle })],
      }));
      else children.push(para({ spacing: { after: 240 } }));
      return api;
    },

    /** Row of figures. Three or four; more than that and it should be a table. */
    stats(items = []) {
      const n = Math.max(1, items.length);
      const w = Math.floor(PAGE.textWidth / n);
      const cols = new Array(n).fill(w);
      cols[n - 1] = PAGE.textWidth - w * (n - 1);
      children.push(new D.Table({
        columnWidths: cols,
        width: { size: PAGE.textWidth, type: D.WidthType.DXA },
        rows: [new D.TableRow({
          children: items.map((st, i) => new D.TableCell({
            width: { size: cols[i], type: D.WidthType.DXA },
            shading: { type: D.ShadingType.CLEAR, fill: P.zebra, color: 'auto' },
            margins: { top: 170, bottom: 170, left: 170, right: 170 },
            borders: { top: { style: D.BorderStyle.SINGLE, size: 4, color: P.rule }, bottom: { style: D.BorderStyle.SINGLE, size: 4, color: P.rule }, left: { style: D.BorderStyle.SINGLE, size: 4, color: P.rule }, right: { style: D.BorderStyle.SINGLE, size: 4, color: P.rule } },
            children: [
              para({ spacing: { after: 70 }, children: [run(String(st.label || '').toUpperCase(), { font: F.heading, bold: true, size: halfPt(TP.caption), color: P.inkSubtle, characterSpacing: 24 })] }),
              para({ spacing: { after: st.detail ? 70 : 0 }, children: [
                run(String(st.value), { font: F.heading, bold: true, size: halfPt('30pt'), color: P.accent }),
                ...(st.unit ? [run(String(st.unit), { font: F.heading, bold: true, size: halfPt(TP.h3), color: P.inkSubtle })] : []),
              ] }),
              ...(st.detail ? [para({ children: [run(st.detail, { size: halfPt(TP.caption), color: P.inkMuted })] })] : []),
            ],
          })),
        })],
      }));
      children.push(para({ spacing: { after: 260 } }));
      return api;
    },

    quote({ text, attribution, role } = {}) {
      children.push(para({
        indent: { left: 400 },
        border: { left: { style: D.BorderStyle.SINGLE, size: 18, color: P.accent, space: 14 } },
        spacing: { before: 240, after: 100, line: 320 },
        children: [run(text, { size: halfPt(TP.bodyLead), color: P.ink, italics: true })],
      }));
      if (attribution) children.push(para({
        indent: { left: 400 },
        spacing: { after: 260 },
        children: [
          run(attribution, { font: F.heading, bold: true, size: halfPt(TP.small), color: P.ink }),
          ...(role ? [run(`, ${role}`, { size: halfPt(TP.small), color: P.inkSubtle })] : []),
        ],
      }));
      return api;
    },

    /** Horizontal rule. A paragraph bottom border, never a one-row table. */
    divider() {
      children.push(para({
        border: { bottom: { style: D.BorderStyle.SINGLE, size: 6, color: P.rule, space: 4 } },
        spacing: { before: 200, after: 260 },
      }));
      return api;
    },

    /** PageBreak must live inside a Paragraph. */
    pageBreak() {
      children.push(new D.Paragraph({ children: [new D.PageBreak()] }));
      return api;
    },

    spacer(after = 240) { children.push(para({ spacing: { after } })); return api; },

    /** Anything the helpers do not cover — push raw docx-js elements. */
    raw(...els) { children.push(...els); return api; },

    build() {
      const doc = new D.Document({
        creator, title, subject: subtitle, description: subtitle,
        styles: {
          default: {
            document: { run: { font: F.body, size: halfPt(TP.body), color: P.ink } },
          },
          // Override the built-in heading styles rather than inventing new ones,
          // so the TOC field, the navigation pane and outline levels all work.
          paragraphStyles: [
            { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
              run: { font: F.heading, bold: true, size: halfPt(TP.h1), color: P.ink } },
            { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
              run: { font: F.heading, bold: true, size: halfPt(TP.h2), color: P.ink } },
            { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
              run: { font: F.heading, bold: true, size: halfPt(TP.h3), color: P.inkMuted } },
          ],
        },
        numbering: {
          config: [
            { reference: 'mls-bullets', levels: [
              { level: 0, format: D.LevelFormat.BULLET, text: '•', alignment: D.AlignmentType.LEFT, style: { paragraph: { indent: { left: 380, hanging: 240 } } } },
              { level: 1, format: D.LevelFormat.BULLET, text: '◦', alignment: D.AlignmentType.LEFT, style: { paragraph: { indent: { left: 740, hanging: 240 } } } },
            ] },
            { reference: 'mls-numbers', levels: [
              { level: 0, format: D.LevelFormat.DECIMAL, text: '%1.', alignment: D.AlignmentType.LEFT, style: { paragraph: { indent: { left: 380, hanging: 240 } } } },
            ] },
          ],
        },
        sections: [{
          properties: {
            page: {
              // docx-js defaults to A4. Letter must be stated explicitly.
              size: { width: PAGE.width, height: PAGE.height },
              margin: { top: PAGE.top, bottom: PAGE.bottom, left: PAGE.left, right: PAGE.right },
            },
            titlePage: true, // cover page gets no header or footer
          },
          headers: {
            default: new D.Header({ children: [new D.Paragraph({
              border: { bottom: { style: D.BorderStyle.SINGLE, size: 4, color: P.rule, space: 6 } },
              children: [run(footerText || `${P.clubName}  ·  ${title}`, { size: halfPt(TP.footer), color: P.inkSubtle })],
            })] }),
          },
          footers: {
            default: new D.Footer({ children: [new D.Paragraph({
              alignment: D.AlignmentType.RIGHT,
              children: pageNumbers
                ? [run('', { size: halfPt(TP.footer) }), new D.TextRun({ children: [D.PageNumber.CURRENT], font: F.body, size: halfPt(TP.footer), color: P.inkSubtle })]
                : [run('', {})],
            })] }),
          },
          children,
        }],
      });
      return doc;
    },

    async save(file) {
      const buf = await D.Packer.toBuffer(api.build());
      fs.writeFileSync(file, buf);
      return file;
    },
  };

  return api;
}

module.exports = { createDoc, palette, TOKENS: T, CLUBS, PAGE, FONTS, halfPt, dxa, hex };
