#!/usr/bin/env node
// sounds: take the game's basic sounds from Robin's common sound library and put them in client/public/sfx/.
//   node tools/sounds.mjs        (from Game Developer\)
// Robin, 2026-11-20: "You can set up some basic sounds and effects. But dont create anything new yet. Just things
// you can get from the storage to use." So nothing is made here: each sound is a copy of a library sound (the
// Survival game's, listed in ..\Sound Director\library\INDEX.md), turned into OGG and given this game's name. The
// originals are never touched. Which library sound plays for what is Victor, GD's pick until Hugh, SD takes it over.
// Writes sfx.json (name -> files and volume) and NOTES.md (where each came from). Needs ffmpeg (Sound Director\tools\paths.json).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const studio = path.resolve(here, '../../Sound Director');
const out = path.resolve(here, '../client/public/sfx');
const ffmpeg = JSON.parse(fs.readFileSync(path.join(studio, 'tools/paths.json'), 'utf8')).ffmpeg;

// This game's name -> [the library's name, how loud beside the library's own gain, what it plays for].
const PICKS = {
  swing: ['swing_e', 1, 'every swing of his'],
  hit: ['hit_w', 0.8, 'a swing landing on a monster'],
  cleave: ['swing_f', 1, 'Cleave'],
  hit_heavy: ['heavyhit_x', 0.8, 'Cleave landing, and Charge arriving'],
  charge: ['dash', 1.6, 'Charge starting'],
  hero_hurt: ['hurt', 0.9, 'a bite on him'],
  hero_down: ['die', 1, 'he falls'],
  monster_die: ['boxbreak_v', 0.9, 'a monster falls (a shell cracking)'],
  windup: ['heavytell', 0.8, 'a slow, heavy blow being wound up (the coconut crab)'],
  coin: ['clink_a', 0.5, 'money picked up, a thing bought or sold'],
  pickup: ['altar_lay_a', 0.8, 'a piece of gear or a potion picked up'],
  level_up: ['rune_ready_a', 1, 'a level gained; and quietly, a rare piece picked up'],
  chest: ['creak_b', 1, 'the chest opening'],
  potion: ['fish_plop_a', 0.8, 'a potion drunk'],
  equip: ['raise_e', 1, 'a piece put on or taken off'],
  sail: ['sail_fill_a', 1, 'sailing to another place'],
  tap: ['talk_next_e', 0.7, 'a button'],
  open: ['book_open_b', 0.8, 'a window opening'],
  close: ['book_close_c', 0.8, 'a window closing'],
  refuse: ['block_a', 0.35, 'a thing that cannot be done now'],
};

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'drok-sfx-'));
const names = [...new Set(Object.values(PICKS).map((p) => p[0]))];
execFileSync(process.execPath, [path.join(studio, 'tools/fetch-common-sounds.mjs'), ...names, '--to', tmp], { stdio: 'inherit' });
const manifest = JSON.parse(fs.readFileSync(path.join(tmp, 'manifest.json'), 'utf8'));

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const map = {};
const rows = [];
let bytes = 0;
for (const [name, [from, scale, use]] of Object.entries(PICKS)) {
  const src = manifest[from];
  if (!src) throw new Error(`the library has no ${from}`);
  const files = [];
  src.files.forEach((file, i) => {
    const to = `${name}_${i + 1}.ogg`;
    execFileSync(ffmpeg, ['-y', '-v', 'error', '-i', path.join(tmp, file), '-ac', '1', '-ar', '48000', '-c:a', 'libvorbis', '-q:a', '4', path.join(out, to)]);
    bytes += fs.statSync(path.join(out, to)).size;
    files.push(to);
  });
  const volume = Math.round(Math.min(1, src.gain * scale * 1.3) * 1000) / 1000;
  map[name] = { files, volume };
  rows.push(`| \`${name}\` | ${use} | \`${from}\` (${src.set}) | ${src.use.replace(/\|/g, '/')} | ${files.length} | ${volume} |`);
}
fs.writeFileSync(path.join(out, 'sfx.json'), JSON.stringify(map, null, 2) + '\n');
const read = [...new Set(Object.values(manifest).flatMap((m) => m.read))];
fs.writeFileSync(
  path.join(out, 'NOTES.md'),
  `# The basic sounds (Victor, GD, ${new Date().toISOString().slice(0, 10)})

Robin, 2026-11-20: "You can set up some basic sounds and effects. But dont create anything new yet. Just things you
can get from the storage to use." Every sound here is a copy from the common library (the Survival game's sounds,
\`Sound Director\\library\\INDEX.md\`), turned into OGG (mono, 48 kHz) and renamed. Nothing was made new, nothing was
mixed or changed but the format; the originals are untouched. Which sound plays for what is Victor, GD's pick, a
stand-in until Hugh, SD's own set replaces it. Written by \`tools\\sounds.mjs\`; run it again to change a pick.

The volume is the Survival game's own gain for the sound, times my guess for this game. Not levelled by ear.

| Name here | Plays for | From the library | The library says | Files | Volume |
| --- | --- | --- | --- | --- | --- |
${rows.join('\n')}

All together ${Math.round(bytes / 1024)} KB.

**Origin and licence.** The library's index says of its recorded material: CC0 or "free for any use". The credits
of each set are in the Survival game's own files on Robin's PC:

${read.map((r) => `- \`${r}\``).join('\n')}

**Not here, because the library has none**: steps, a monster's voice, coins as such (a pick on stone stands in), a
fanfare for a level (a rune's chime stands in), a potion's gulp (a plop stands in), any music.
`,
);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`${Object.keys(map).length} sounds, ${Math.round(bytes / 1024)} KB, in ${out}`);
