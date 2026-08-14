#!/usr/bin/env node
/**
 * Emit an Office theme (.thmx) from the tokens.
 *
 * A .thmx is the single highest-leverage artefact for a comms team: double-click
 * it, or apply it from the Design tab, and Word, PowerPoint and Excel all take
 * the MLS colours and fonts at once -- including native chart colours, which
 * otherwise default to Office blue no matter what the brand book says.
 *
 * The six accent slots are wired to the first six categorical chart colours
 * rather than to brand red and navy, because Office assigns accents to chart
 * series in order. Wiring accent1 to the brand red would make every single-
 * series chart in the organisation red, which is a status colour here.
 *
 * Writes:
 *   templates/office/mls-theme.thmx    apply in Office
 *   templates/office/theme1.xml        the raw part, for swapping into a file
 *
 * Run: node scripts/build-office-theme.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = (...s) => join(ROOT, ...s);
const T = JSON.parse(readFileSync(p('dist/mls.tokens.json'), 'utf8')).tokens;
const hex = (v) => String(v).replace('#', '').toUpperCase();

const cat = T.chart.categorical.light;
const COLORS = {
  dk1: hex(T.color.brand.black),
  lt1: 'FFFFFF',
  dk2: hex(T.color.brand.navy),
  lt2: hex(T.color.primitive.neutral['50']),
  accent1: hex(cat['1']), accent2: hex(cat['2']), accent3: hex(cat['3']),
  accent4: hex(cat['4']), accent5: hex(cat['5']), accent6: hex(cat['6']),
  hlink: hex(T.color.primitive.navy['700']),
  folHlink: hex(T.color.primitive.purple ? T.color.primitive.purple['700'] : cat['5']),
};

const HEADING = T.office.safeHeading;
const BODY = T.office.safeBody;

const font = (tag, latin) => `<a:${tag}><a:latin typeface="${latin}"/><a:ea typeface=""/><a:cs typeface=""/></a:${tag}>`;

const theme1 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="MLS Design System">
  <a:themeElements>
    <a:clrScheme name="MLS">
      <a:dk1><a:srgbClr val="${COLORS.dk1}"/></a:dk1>
      <a:lt1><a:srgbClr val="${COLORS.lt1}"/></a:lt1>
      <a:dk2><a:srgbClr val="${COLORS.dk2}"/></a:dk2>
      <a:lt2><a:srgbClr val="${COLORS.lt2}"/></a:lt2>
      <a:accent1><a:srgbClr val="${COLORS.accent1}"/></a:accent1>
      <a:accent2><a:srgbClr val="${COLORS.accent2}"/></a:accent2>
      <a:accent3><a:srgbClr val="${COLORS.accent3}"/></a:accent3>
      <a:accent4><a:srgbClr val="${COLORS.accent4}"/></a:accent4>
      <a:accent5><a:srgbClr val="${COLORS.accent5}"/></a:accent5>
      <a:accent6><a:srgbClr val="${COLORS.accent6}"/></a:accent6>
      <a:hlink><a:srgbClr val="${COLORS.hlink}"/></a:hlink>
      <a:folHlink><a:srgbClr val="${COLORS.folHlink}"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="MLS">
      ${font('majorFont', HEADING)}
      ${font('minorFont', BODY)}
    </a:fontScheme>
    <a:fmtScheme name="MLS">
      <a:fillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"><a:tint val="88000"/></a:schemeClr></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"><a:shade val="88000"/></a:schemeClr></a:solidFill>
      </a:fillStyleLst>
      <a:lnStyleLst>
        <a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>
        <a:ln w="19050" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>
        <a:ln w="28575" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>
      </a:lnStyleLst>
      <!-- No shadows, no glows. MLS's own guidelines prohibit effects on the
           crest, and an effect list here would let every shape in Office
           inherit one. -->
      <a:effectStyleLst>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
      </a:effectStyleLst>
      <a:bgFillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"><a:tint val="95000"/></a:schemeClr></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"><a:shade val="95000"/></a:schemeClr></a:solidFill>
      </a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
  <a:objectDefaults/>
  <a:extraClrSchemeLst/>
</a:theme>
`;

const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="thmx" ContentType="application/vnd.ms-officetheme"/>
  <Override PartName="/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/theme/themeManager.xml" ContentType="application/vnd.openxmlformats-officedocument.themeManager+xml"/>
</Types>
`;

const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/themeManager" Target="theme/themeManager.xml"/>
</Relationships>
`;

const themeManager = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<themeManager xmlns="http://schemas.openxmlformats.org/officeDocument/2006/themeManager" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
`;

const themeManagerRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme1.xml"/>
</Relationships>
`;

const OUT = p('templates/office');
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'theme1.xml'), theme1);

// Assemble the .thmx package.
const stage = p('.thmx-build');
mkdirSync(join(stage, '_rels'), { recursive: true });
mkdirSync(join(stage, 'theme', '_rels'), { recursive: true });
writeFileSync(join(stage, '[Content_Types].xml'), contentTypes);
writeFileSync(join(stage, '_rels', '.rels'), rootRels);
writeFileSync(join(stage, 'theme', 'theme1.xml'), theme1);
writeFileSync(join(stage, 'theme', 'themeManager.xml'), themeManager);
writeFileSync(join(stage, 'theme', '_rels', 'themeManager.xml.rels'), themeManagerRels);

const outFile = join(OUT, 'mls-theme.thmx');
execFileSync('sh', ['-c', `rm -f "${outFile}" && cd "${stage}" && zip -Xrq "${outFile}" .`]);
execFileSync('sh', ['-c', `rm -rf "${stage}"`]);

console.log(`wrote templates/office/theme1.xml`);
console.log(`wrote templates/office/mls-theme.thmx`);
console.log(`accents wired to chart slots 1-6: ${[1,2,3,4,5,6].map((i) => hex(cat[String(i)])).join(' ')}`);
