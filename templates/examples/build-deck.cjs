/**
 * Reference deck. Exercises every layout in mls-deck.cjs, so the output is
 * both a working example and the visual QA fixture for the module.
 *
 *   node templates/examples/build-deck.cjs [outfile] [--design press|kickoff|report] [--club por]
 *
 * Content is illustrative. The 2026 roster figures are real and dated;
 * everything else is plausible filler chosen to stress the layouts.
 */

const { createDeck, CLUBS } = require('../js/mls-deck.cjs');

const args = process.argv.slice(2);
const out = args.find((a) => !a.startsWith('--')) || 'mls-reference-deck.pptx';
// Accepts both `--club por` and `--club=por`. The second form silently fell
// through to the default before, which is a quiet way to render the wrong deck.
const flag = (n, d) => {
  const eq = args.find((a) => a.startsWith(`--${n}=`));
  if (eq) return eq.slice(n.length + 3);
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d;
};

const deck = createDeck({
  club: flag('club', null),
  fonts: flag('fonts', 'safe'),
  design: flag('design', 'press'),    // report | kickoff | press
  title: 'MLS Design System — reference deck',
  subject: 'Every slide layout in the MLS Design System',
});

/* ---- Openers and dividers ---- */

deck.title({
  eyebrow: 'Unofficial reference · August 2026',
  title: 'MLS Design System',
  subtitle: 'Thirty layouts, generated from the same tokens as the web components. Change one club slug and the whole deck re-themes.',
  footer: 'Not an official MLS product. See NOTICE.md.',
  notes: 'Key-art opener. Navy field, not red: MLS gives red no structural role, so this system never builds a red field.',
});

deck.titleSplit({
  eyebrow: 'The slash',
  title: 'One zone filled, one deliberately empty',
  subtitle: 'MLS: the slash begins outside the perimeter and drives upward at a 45-degree angle. It divides the surface. It is not a stripe.',
  notes: 'The empty white zone is doctrine, not an oversight. Resist filling it.',
});

deck.agenda({
  eyebrow: 'Contents',
  title: 'What this deck covers',
  items: [
    'How the system works', 'Data', 'League modules',
    'Comparison and time', 'What this system will not do',
  ],
});

deck.section({ number: 1, title: 'How the system works', subtitle: 'One idea, applied consistently' });

/* ---- Editorial ---- */

deck.statement({
  eyebrow: 'The core idea',
  text: 'The crest was built as a template, so colour is a slot rather than a value.',
  attribution: 'Athletics, who designed the 2014 identity, call it a flexible template.',
});

deck.bullets({
  eyebrow: 'Consequences',
  title: 'What follows from a colourable crest',
  items: [
    { text: 'The accent is a slot. Nothing references the league red directly', bold: true },
    'One attribute re-themes an entire deck, document or product',
    'Club colours are preserved exactly for crests and kit swatches',
    'A separate contrast-corrected derivative is used for interface and chart work',
    'Without that correction, 24 of the 30 club themes would fail WCAG',
  ],
  aside: { label: 'Clubs themed', value: '30', detail: 'All clear 3.2:1 on their own background in both light and dark, verified at build time.' },
});

deck.twoColumn({
  eyebrow: 'Voice',
  title: 'Two registers that are genuinely different',
  left: { heading: 'League communications', items: [
    'Formal, dateline-driven, actively voiced', 'Near-zero humour',
    'Opens "Major League Soccer today announced"', 'Executives get full title before name',
  ] },
  right: { heading: 'Editorial', items: [
    'Short sentences, present tense, verb-driven', 'Willing to be funny at its own expense',
    'Loanwords unglossed: golazo, brace, tifo', 'Peak moments go full crescendo',
  ] },
});

deck.explainerPair({
  eyebrow: 'How it works',
  title: 'Three things people ask first',
  cards: [
    { label: 'Theming', title: 'One attribute', body: 'Set data-club on any container and every component inside it re-themes, using the contrast-corrected accent rather than the raw club colour.' },
    { label: 'Fidelity', title: 'Two values per club', body: 'The true brand colour is never altered and is used for crests and badges. The corrected derivative is used for interface chrome and charts.' },
    { label: 'Confidence', title: 'Gaps stay gaps', body: 'Every club carries an explicit confidence rating. Three colours are null rather than guessed, because their clubs have never published them.' },
  ],
});

deck.quote({
  quote: 'We have got to win Concacaf consistently. We have got to get into the Club World Cup, and get out of the early rounds.',
  attribution: 'Don Garber',
  role: 'Commissioner, Major League Soccer',
  notes: 'Deliberately plain. MLS runs quotes as ordinary paragraphs with no pull-quote component, so no oversized quote marks, no tinted panel, no rule.',
});

deck.section({ number: 2, title: 'Data', subtitle: 'The documentary register' });

/* ---- Data ---- */

deck.heroStat({
  eyebrow: '2026 salary budget',
  value: '6.43', unit: 'M',
  label: 'Per club, covering the 20-player Senior Roster',
  detail: 'The Maximum Salary Budget Charge of $803,125 is the threshold that defines a Designated Player. Figures change every January.',
});

deck.stats({
  eyebrow: '2026 roster rules',
  title: 'The figures that change every January',
  stats: [
    { value: '6.43', unit: 'M', label: 'Salary Budget', detail: 'Per club, 20-player Senior Roster.' },
    { value: '803', unit: 'K', label: 'Max Budget Charge', detail: 'Defines a Designated Player.' },
    { value: '3.28', unit: 'M', label: 'GAM', detail: 'Tradable, does not expire.' },
    { value: '2.13', unit: 'M', label: 'TAM', detail: 'Not tradable.' },
  ],
});

deck.standings({
  eyebrow: 'Eastern Conference',
  title: 'Standings, Matchday 24',
  rows: [
    ['1', 'Columbus Crew', '24', '17', '7', '0', '+29', '58'],
    ['2', 'Inter Miami CF', '24', '16', '5', '3', '+24', '53'],
    ['3', 'FC Cincinnati', '24', '15', '4', '5', '+18', '49'],
    ['4', 'Philadelphia Union', '24', '13', '6', '5', '+12', '45'],
    ['5', 'New York City FC', '24', '12', '7', '5', '+9', '43'],
    ['6', 'Charlotte FC', '24', '11', '6', '7', '+4', '39'],
    ['7', 'Orlando City SC', '24', '10', '8', '6', '+6', '38'],
    ['8', 'Nashville SC', '24', '10', '5', '9', '-1', '35'],
  ],
  legend: ['1-7  Audi MLS Cup Playoffs', '8-9  Wild Card', '1  Concacaf Champions Cup'],
  note: 'Illustrative. Official Standings update at the conclusion of each match; Live Standings update in real time.',
});

deck.splitTable({
  eyebrow: 'Fact and Record Book register',
  title: 'All-time results, one row axis, three panels',
  rowLabel: 'vs. Club',
  panels: [
    { label: 'Overall', cols: ['GP', 'W-L-T', 'GF', 'GA'] },
    { label: 'Home', cols: ['GP', 'W-L-T', 'GF', 'GA'] },
    { label: 'Road', cols: ['GP', 'W-L-T', 'GF', 'GA'] },
  ],
  rows: [
    ['Chicago Fire FC', '48', '22-16-10', '71', '58', '24', '14-6-4', '41', '25', '24', '8-10-6', '30', '33'],
    ['FC Cincinnati', '14', '7-4-3', '24', '17', '7', '5-1-1', '15', '7', '7', '2-3-2', '9', '10'],
    ['D.C. United', '62', '25-24-13', '88', '86', '31', '16-9-6', '52', '38', '31', '9-15-7', '36', '48'],
    ['New England Revolution', '58', '24-21-13', '82', '79', '29', '15-8-6', '48', '34', '29', '9-13-7', '34', '45'],
  ],
  note: 'GP games played, W-L-T win-loss-tie, GF goals for, GA goals against. Illustrative figures.',
  notes: 'This is what MLS documents of record actually look like: black on white, no fills, no zebra, thin rules only.',
});

deck.chart({
  eyebrow: 'Chart palette',
  title: 'Eight categorical hues, searched rather than picked',
  type: 'bar',
  data: [
    { name: 'Home', labels: ['East', 'West', 'Leagues Cup', 'Open Cup', 'Playoffs'], values: [42, 38, 12, 6, 9] },
    { name: 'Away', labels: ['East', 'West', 'Leagues Cup', 'Open Cup', 'Playoffs'], values: [31, 34, 10, 4, 7] },
    { name: 'Neutral', labels: ['East', 'West', 'Leagues Cup', 'Open Cup', 'Playoffs'], values: [8, 7, 14, 3, 5] },
  ],
  note: 'Illustrative. Worst adjacent pair clears 16.2 under simulated protanopia and deuteranopia, against a standard target of 8.',
});

deck.chartPair({
  eyebrow: 'Never a dual axis',
  title: 'Two measures, two charts',
  left: { heading: 'Attendance', type: 'line', data: [{ name: 'Attendance', labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'], values: [21.4, 22.1, 23.8, 22.9, 25.6, 26.2] }], options: { lineSize: 3, lineDataSymbolSize: 8, valAxisMinVal: 18, valAxisMaxVal: 28, showValue: true } },
  right: { heading: 'Goals per match', type: 'bar', data: [{ name: 'Goals', labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'], values: [2.7, 2.9, 3.1, 2.8, 3.3, 3.2] }] },
  note: 'A dual-axis chart lets the author imply any correlation they like by choosing the scales. Use two charts, or index both to a common base.',
});

deck.section({ number: 3, title: 'League modules', subtitle: 'Shapes that read as MLS on sight' });

/* ---- Modules ---- */

deck.ranked({
  eyebrow: 'Power Rankings',
  title: 'Matchday 24',
  items: [
    { name: 'Columbus Crew', move: '+1', value: '58' }, { name: 'Inter Miami CF', move: '-1', value: '53' },
    { name: 'FC Cincinnati', move: '=', value: '49' }, { name: 'LAFC', move: '+3', value: '47' },
    { name: 'Philadelphia Union', move: '=', value: '45' }, { name: 'Seattle Sounders FC', move: '-2', value: '44' },
    { name: 'New York City FC', move: '+2', value: '43' }, { name: 'Portland Timbers', move: '-1', value: '41' },
    { name: 'Charlotte FC', move: '=', value: '39' }, { name: 'Orlando City SC', move: '+4', value: '38' },
    { name: 'Minnesota United FC', move: '-3', value: '37' }, { name: 'Nashville SC', move: '=', value: '35' },
  ],
  note: 'Illustrative. Movement is against the previous matchday.',
});

deck.sixUp({
  eyebrow: 'Latest',
  title: 'Six is the number',
  cards: [
    { kicker: 'Match report', title: 'Timbers take the Cascadia derby in stoppage time' },
    { kicker: 'Transfer', title: 'Cincinnati sign Designated Player from LIGA MX' },
    { kicker: 'Analysis', title: 'What the calendar shift means for roster building' },
    { kicker: 'Power Rankings', title: 'Columbus hold at the top for a fourth week' },
    { kicker: 'Leagues Cup', title: 'Phase One ends with three clubs still unbeaten' },
    { kicker: 'Feature', title: 'Inside the supporters section at Providence Park' },
  ],
  notes: 'Both the Latest feed and the Transfer Tracker on mlssoccer.com are exactly six-item modules.',
});

deck.tileGrid({
  eyebrow: 'Competitions',
  title: 'Flat grid, no hierarchy',
  tiles: [
    'MLS Regular Season', 'Audi MLS Cup Playoffs', 'MLS Cup', 'Leagues Cup', 'Concacaf Champions Cup',
    'Lamar Hunt U.S. Open Cup', 'Canadian Championship', 'Campeones Cup', 'MLS All-Star Game', 'FIFA World Cup',
  ],
  notes: 'MLS competitions hub is ten equal tiles with no feature tile and no size variation. Deliberately democratic.',
});

deck.crestWall({
  eyebrow: 'Clubs',
  title: 'Thirty clubs, equal weight',
  clubs: CLUBS.map((c) => ({ tricode: c.tricode })),
  note: 'Crest sockets. MLS delivers crests in a square box; official assets drop straight in. No marks ship in this repository.',
});

deck.formation({
  eyebrow: 'Team of the Matchday',
  title: 'Matchday 24 best XI',
  lines: [
    { label: 'Goalkeeper', players: ['Ochoa (SJ)'] },
    { label: 'Defenders', players: ['Wagner (PHI)', 'Miazga (CIN)', 'Gressel (CLB)'] },
    { label: 'Midfielders', players: ['Evander (CIN)', 'Almada (ATL)', 'Acosta (CLB)', 'Herrera (HOU)'] },
    { label: 'Forwards', players: ['Messi (MIA)', 'Uzuni (ATX)', 'Cucho (CLB)'] },
  ],
  coach: 'Wilfried Nancy (Columbus Crew)',
  bench: ['Blake (PHI)', 'Yedlin (CIN)', 'Rodriguez (SEA)', 'Bouanga (LAFC)', 'Surridge (NSH)'],
  notes: 'Illustrative selection. Every name carries a three-letter club tag, which is MLS own convention.',
});

deck.bracket({
  eyebrow: 'Audi MLS Cup Playoffs',
  title: 'Eastern Conference bracket',
  rounds: [
    { label: 'Round One', matches: [
      { label: '1 Columbus v 8 Nashville', winner: true }, { label: '4 Philadelphia v 5 NYCFC' },
      { label: '2 Miami v 7 Orlando', winner: true }, { label: '3 Cincinnati v 6 Charlotte' },
    ] },
    { label: 'Conference Semifinals', matches: [
      { label: 'Columbus v Philadelphia', winner: true }, { label: 'Miami v Cincinnati' },
    ] },
    { label: 'Conference Final', matches: [{ label: 'Columbus v Miami', winner: true }] },
    { label: 'MLS Cup', matches: [{ label: 'Columbus v Western champion', winner: true }] },
  ],
  note: 'Illustrative. Every playoff match is hosted by the club higher in the Supporters Shield standings.',
});

deck.matchup({
  competition: 'Cascadia Cup, Matchday 24',
  home: { name: 'Portland Timbers', detail: '13W-5D-6L' },
  away: { name: 'Seattle Sounders FC', detail: '11W-6D-7L' },
  score: '2 - 1',
  state: 'Full time', venue: 'Providence Park', date: 'Saturday, August 8',
});

deck.section({ number: 4, title: 'Comparison and time', subtitle: 'The working middle of a deck' });

/* ---- Comparison and time ---- */

deck.timeline({
  eyebrow: 'The calendar shift',
  title: 'From spring-to-fall to summer-to-spring',
  milestones: [
    { when: 'Nov 2025', title: 'Board approves', body: 'The Board of Governors approves the move to a summer-to-spring calendar.' },
    { when: '2026', title: 'Legacy season', body: 'The last spring-to-fall season, with a mid-season break for the World Cup.' },
    { when: 'Feb 2027', title: 'Sprint Season', body: 'A 14-match bridge competition, conference opponents only, into MLS Cup in May.' },
    { when: 'Jul 2027', title: 'New era begins', body: 'The first summer-to-spring regular season kicks off, concluding May 2028.' },
  ],
});

deck.compare({
  eyebrow: 'Allocation money',
  title: 'The distinction most often got wrong',
  left: { heading: 'GAM' }, right: { heading: 'TAM' },
  criteria: [
    { label: 'Full name', left: 'General Allocation Money', right: 'Targeted Allocation Money' },
    { label: '2026 amount', left: '$3,280,000', right: '$2,125,000' },
    { label: 'Tradable', left: 'Yes', right: 'No' },
    { label: 'Expires', left: 'No', right: 'In-season' },
    { label: 'Typical use', left: 'Buy down any budget charge', right: 'Players above the max charge' },
  ],
});

deck.process({
  eyebrow: 'Contrast correction',
  title: 'How a club colour becomes a usable accent',
  steps: [
    { title: 'Take the true colour', body: 'The club published primary, unaltered. This value is preserved for crests and kit swatches.' },
    { title: 'Test both grounds', body: 'Measure contrast against white and against near-black. Twenty-four of thirty fail at least one.' },
    { title: 'Nudge lightness only', body: 'Adjust in OKLab so hue and chroma survive. A corrected colour is still recognisably the club colour.' },
    { title: 'Publish both', body: 'The raw value and the corrected derivative ship as separate tokens, so neither use case can borrow the wrong one.' },
  ],
});

/* ---- Partner and close ---- */

deck.logoWall({
  eyebrow: 'Partners',
  title: 'Equal boxes, never resized to balance',
  marks: ['Adidas', 'Audi', 'Apple TV', 'Coca-Cola', 'Continental Tire', 'Chime', 'Allstate', 'Heineken', 'Target', 'Walmart', 'AT&T', 'Volkswagen'],
  note: 'Placeholder boxes. Partner marks are stored in white or reversed form, implying they sit on dark or photographic fields.',
});

deck.band({
  eyebrow: 'Before external use',
  text: 'Verify every colour value with MLS Brand.',
  detail: 'MLS publishes no public brand-colour specification. The league red and navy are marked low confidence throughout, and three club colours are null rather than guessed.',
});

deck.section({ number: 5, title: 'What this system will not do', subtitle: 'The gaps are documented, not filled' });

deck.chapter({
  title: 'The light divider',
  subtitle: 'An alternative to section() when a deck needs a quieter break. Unnumbered, so it never reads as part of the numbered series.',
});

deck.bullets({
  eyebrow: 'Confidence',
  title: 'It will not tell you a value it does not know',
  items: [
    'MLS publishes no public brand-colour specification',
    'The league red and navy are marked low confidence throughout',
    'Three club colours are null rather than guessed',
    'Usage rules come from a 2015 partner guideline and need re-verification',
    { text: 'Verify with MLS Brand before print, licensing or partner use', bold: true },
  ],
  aside: { label: 'Values left null', value: '3', detail: 'Charlotte silver, and St. Louis Energy Yellow and Arch Steel Grey. Officially named by their clubs, never published.' },
});

deck.closing({
  title: 'Thank you',
  subtitle: 'Full documentation is in docs/, nineteen chapters, human-readable.',
  contact: 'Not an official MLS product. Major League Soccer and the MLS crest are trademarks of Major League Soccer, L.L.C.',
});

deck.save(out).then(() => console.log(`wrote ${out}`));
