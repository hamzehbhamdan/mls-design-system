#!/usr/bin/env node
/**
 * Package the project as a zip.
 *
 *   node scripts/package.mjs                    # code only, no marks (matches git)
 *   node scripts/package.mjs --with-marks       # include installed trademarked marks
 *   node scripts/package.mjs --with-decks       # include the rendered reference decks
 *   node scripts/package.mjs --with-next-clubs  # ...and the MLS NEXT member-club marks
 *
 * The default deliberately mirrors what git tracks: `.gitignore` excludes
 * everything under `assets/logo/`, and so does this. Marks are trademarks of
 * Major League Soccer, L.L.C., its member clubs and its properties, and an
 * archive that carries them is not a thing to publish or pass on.
 *
 * `--with-marks` exists because private use is a real case -- an internal
 * deck, a licensed party, your own machine -- and re-installing the marks on
 * the other end is friction with no benefit. It prints what it is doing, and
 * the archive carries NOTICE.md, which says plainly what the recipient may and
 * may not do with it.
 */

import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const NAME = 'mls-design-system';
const version = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;

const args = process.argv.slice(2);
const WITH_MARKS = args.includes('--with-marks');
const WITH_DECKS = args.includes('--with-decks');
/* MLS NEXT member clubs are third-party youth organisations, recorded for
 * completeness and wired into no layout. They are the one part of an installed
 * set that nothing in this system reads, and they are three megabytes, so they
 * are opt-in even when marks are included. */
const WITH_NEXT_CLUBS = args.includes('--with-next-clubs');
const outArg = args.find((a) => !a.startsWith('--'));

const suffix = [WITH_MARKS ? 'marks' : null, WITH_DECKS ? 'decks' : null].filter(Boolean).join('-');
const out = resolve(outArg || join(ROOT, '..', `${NAME}-v${version}${suffix ? `-with-${suffix}` : ''}.zip`));

try { execFileSync('which', ['zip'], { stdio: 'ignore' }); }
catch { console.error('`zip` is not installed. Debian/Ubuntu: apt-get install zip'); process.exit(1); }

/* Always excluded. node_modules and .git are reproducible or private; a zip
 * inside a zip is a mistake every time. */
const EXCLUDE = [
  '*/node_modules/*', '*/.git/*', '*/.DS_Store', '*/__MACOSX/*', '*/._*', '*.zip',
];
if (!WITH_MARKS) {
  // Mirror .gitignore: the folder ships with its two documents and nothing else.
  EXCLUDE.push(`${NAME}/assets/logo/*`);
}
if (!WITH_DECKS) EXCLUDE.push(`${NAME}/examples-out/*`);
if (WITH_MARKS && !WITH_NEXT_CLUBS) EXCLUDE.push(`${NAME}/assets/logo/next-clubs/*`);

const INCLUDE_BACK = !WITH_MARKS
  ? [`${NAME}/assets/logo/README.md`, `${NAME}/assets/logo/SOURCES.md`]
  : [];

rmSync(out, { force: true });

/* zip resolves paths relative to its working directory, and the archive should
 * unpack into a folder rather than scattering across the user's cwd, so it runs
 * from the parent and names the project folder. */
const parent = dirname(ROOT);
const folder = ROOT.slice(parent.length + 1);

const zipArgs = ['-r', '-q', out, folder];
for (const e of EXCLUDE) zipArgs.push('-x', e.replace(NAME, folder));
execFileSync('zip', zipArgs, { cwd: parent, stdio: 'inherit' });

// -x drops the two documents along with the rest of the folder; add them back.
if (INCLUDE_BACK.length) {
  execFileSync('zip', ['-q', out, ...INCLUDE_BACK.map((f) => f.replace(NAME, folder))], { cwd: parent, stdio: 'inherit' });
}

/**
 * Ship a manifest that describes what is actually in the archive.
 *
 * The manifest is the index every consumer reads, and an entry naming a file
 * that is not there is worse than no entry: `npm run verify` fails on it, and
 * a layout asking for that mark gets nothing back. So when a bucket is left
 * out, it comes out of the manifest too. Staged into a temp tree and zipped
 * over the top, because `zip` replaces an entry with the same path.
 */
if (WITH_MARKS && !WITH_NEXT_CLUBS && existsSync(join(ROOT, 'assets', 'logo', 'manifest.json'))) {
  const man = JSON.parse(readFileSync(join(ROOT, 'assets', 'logo', 'manifest.json'), 'utf8'));
  if (Object.keys(man.nextClubs || {}).length) {
    const dropped = Object.keys(man.nextClubs).length;
    man.nextClubs = {};
    man.note = `${man.note} MLS NEXT member-club marks were omitted from this archive.`;
    const stage = join(ROOT, '..', `.pkg-stage-${process.pid}`);
    const rel = join(folder, 'assets', 'logo', 'manifest.json');
    mkdirSync(join(stage, dirname(rel)), { recursive: true });
    writeFileSync(join(stage, rel), `${JSON.stringify(man, null, 2)}\n`);
    execFileSync('zip', ['-q', out, rel], { cwd: stage, stdio: 'inherit' });
    rmSync(stage, { recursive: true, force: true });
    console.log(`\n  ${dropped} MLS NEXT member-club entries removed from the packaged manifest.`);
  }
}

const mb = (statSync(out).size / 1024 / 1024).toFixed(1);
const g = (s) => `\x1b[32m${s}\x1b[0m`, y = (s) => `\x1b[33m${s}\x1b[0m`, d = (s) => `\x1b[2m${s}\x1b[0m`;
console.log(`\n${g('Wrote')} ${out}  ${d(`${mb} MB`)}`);
console.log(`  marks  ${WITH_MARKS ? y('included — trademarked, do not publish or redistribute (see NOTICE.md)') : d('excluded (default, matches git)')}`);
console.log(`  decks  ${WITH_DECKS ? g('included') : d('excluded (default; run npm run examples to build them)')}`);
if (WITH_MARKS) {
  console.log(`  NEXT   ${WITH_NEXT_CLUBS ? y('member-club marks included — third-party, wired into no layout') : d('member-club marks excluded (--with-next-clubs to include; ~3 MB, used by nothing)')}`);
}
console.log('');
