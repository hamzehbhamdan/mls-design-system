/**
 * Reference document. Exercises every helper in mls-doc.cjs, so the output
 * doubles as a working example and as visual QA for the module.
 *
 *   node templates/examples/build-doc.cjs [outfile] [--club por] [--fonts licensed]
 */

const { createDoc } = require('../js/mls-doc.cjs');

const args = process.argv.slice(2);
const out = args.find((a) => !a.startsWith('--')) || 'mls-reference-report.docx';
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? args[i + 1] : d; };

const doc = createDoc({
  club: flag('club', null),
  fonts: flag('fonts', 'safe'),
  title: 'MLS Design System — reference report',
  subtitle: 'Demonstrates every document element in the MLS Design System',
});

doc.cover({
  eyebrow: 'Unofficial reference',
  title: 'MLS Design System',
  subtitle: 'A brand reference and working code system for Major League Soccer, built to be read by people and consumed by Claude Design.',
  meta: [
    ['Version', '1.1.0'],
    ['Compiled', 'August 2026'],
    ['Scope', 'League brand, 30 club themes, web, documents and decks'],
    ['Status', 'Not an official MLS product'],
  ],
  note: 'Major League Soccer, the MLS crest, club names and club crests are trademarks of Major League Soccer, L.L.C. and its member clubs. See NOTICE.md.',
});

doc.toc();

doc.h1('Summary');
doc.lead('MLS’s identity has one unusual property, and this system is built around it. The crest was designed in 2014 as a template rather than as a fixed mark, so colour is a slot, not a value.');

doc.p([
  { text: 'The shield splits in two, a reference to the two halves of a match, with one half reserved for the league and the other left open for clubs to occupy. Every club receives the crest in its own colours. That means the league red and navy matter far less than the mechanism: a design system that treats ' },
  { text: '#E2231A', bold: true },
  { text: ' as ' },
  { text: 'the', italics: true },
  { text: ' MLS colour has encoded the least interesting thing about the brand.' },
]);

doc.stats([
  { value: '30', label: 'Clubs themed', detail: 'Fifteen per conference, 2026 season.' },
  { value: '24', label: 'Contrast-corrected', detail: 'Of 30 club accents. The rest would fail WCAG.' },
  { value: '317', label: 'Tokens', detail: 'Single source of truth, W3C DTCG format.' },
]);

doc.callout({
  kind: 'warning',
  title: 'Confidence',
  body: 'MLS publishes no public brand-colour specification. The league red and navy are marked low confidence throughout, and three club colours are null rather than guessed. Verify with MLS Brand before print, licensing or partner use.',
});

doc.h1('Colour');
doc.h2('Three tiers');
doc.p('Only the third tier should be referenced from product code. Referencing the brand red directly from a component breaks all thirty club themes at once.');
doc.bullets([
  { text: 'Primitive — raw ramps, no meaning. Fourteen steps across six hues, generated in OKLCH.', bold: false },
  'Brand — the league marks. Documentation and crest use only.',
  'Accent — a slot. Defaults to the league red, overridden wholesale by any club theme.',
  'Semantic — role-based and theme-aware. These are the ones to use.',
]);

doc.h2('Why correction is necessary');
doc.p('Club colours were chosen for kits and crests. Nobody picked them for an 11pt table rule or a chart series. Columbus gold on white is 1.5:1. LAFC’s black is invisible as a dark-mode accent.');

doc.table({
  head: ['Club', 'Code', 'True colour', 'UI accent', 'Contrast'],
  rows: [
    ['Columbus Crew', 'CLB', '#FEDD00', '#AD8C00', '3.22:1'],
    ['Philadelphia Union', 'PHI', '#051C2C', '#051C2C', '17.37:1'],
    ['Seattle Sounders FC', 'SEA', '#2CC84D', '#00A729', '3.20:1'],
    ['Los Angeles Football Club', 'LAFC', '#000000', '#C39E6D', '7.71:1'],
    ['San Diego FC', 'SD', 'None published', '#667779', '4.69:1'],
  ],
  caption: 'Light-mode values. The true colour is never altered; the UI accent is a separate contrast-corrected derivative. LAFC’s primary is achromatic, so its accent is promoted to a chromatic club colour rather than lightened into grey.',
});

doc.h1('Voice');
doc.p('Half of this system is not visual. MLS’s verbal identity is more distinctive than its palette, and much more often got wrong.');

doc.h2('The rule that matters most');
doc.quote({
  text: 'We’ve got to win Concacaf consistently. We’ve got to get into the Club World Cup, and get out of the early rounds.',
  attribution: 'Don Garber',
  role: 'Commissioner, Major League Soccer',
});
doc.p('Hype attaches to moments, never to the league’s own standing. Recaps and finals get maximal language; when MLS discusses itself competitively it becomes plain and even self-critical. Celebrate the match, be honest about the league.');

doc.h2('Fans and supporters are not synonyms');
doc.table({
  head: ['Term', 'Means', 'Used in'],
  widths: [1, 2, 3],
  numericFrom: 99,
  rows: [
    ['Fans', 'The general audience', 'Operational, legal, commercial and conduct contexts'],
    ['Supporters', 'The organised, committed constituency', 'Institutional and ceremonial contexts; acknowledgement and thanks'],
  ],
  caption: 'The Fan Code of Conduct uses “fans” exclusively. The commissioner’s letter opens “To our supporters.” Swapping them reads as tone-deaf in both directions.',
});

doc.h2('Terms to get right');
doc.numbered([
  'Club names take plural verbs. “Austin FC are playing”, not “is playing”. This deviates from AP style and is the most-violated MLS convention.',
  '“Franchise” is prohibited. Use club, team or side.',
  'Soccer, not football, in any North American context. Québec French also uses soccer — do not correct it.',
  'Concacaf is title case, not all-caps. The competition is the Champions Cup, renamed from Champions League in 2024.',
  'Supporters’ Shield takes the apostrophe after the s.',
]);

doc.divider();

doc.h1('What this system will not do');
doc.p('It will not tell you a value it does not know. Every value carries a confidence rating, three club colours are null rather than guessed, and the sourcing chapter lists every gap that could not be closed.');
doc.callout({
  kind: 'note',
  title: 'Before any external use',
  body: 'Verify colour values with MLS Brand, obtain official crest assets rather than reproducing them, and confirm that the 2015-vintage usage rules quoted here have not been superseded.',
});

doc.save(out).then((f) => console.log(`wrote ${f}`));
