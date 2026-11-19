#!/usr/bin/env node
// fetch-common-sounds: copy named sounds from Robin's Survival game sound library into a new game (Clive, GD, 2026-11-04).
//   node fetch-common-sounds.mjs --list                          every name, grouped, with its set and where it lives
//   node fetch-common-sounds.mjs hit heavyhit swing --to DIR      copy these (names or aliases) into DIR
//   node fetch-common-sounds.mjs --group fight ui --to DIR        copy whole groups
//   node fetch-common-sounds.mjs --all --to DIR                   everything (about 60 MB)
// Each sound's variations (<name>_N.wav or .ogg or .mp3) and its <name>.json are copied flat, under their original names
// (never rename the original: the Survival game's assets/sfx/keep.txt names it), and DIR/manifest.json is written or
// updated: where each came from, its gain and use, and the NOTES and credits to read. The library's list is
// library/INDEX.md; the names here are the same. Nothing is downloaded; the sources are folders on this machine.
import fs from 'node:fs';
import path from 'node:path';

const SG_STUDIO = 'C:/dev/SG/Sound Director/out/sfx';          // the studio's deliveries (bundled by the game, no copy there)
const SG_GAME = 'C:/dev/SG/Game Developer/assets/sfx';          // the game's own copies, with their JSON and NOTES
const SETS = {
  combat: SG_STUDIO + '/combat', chapter1: SG_STUDIO + '/chapter1', flesh: SG_STUDIO + '/flesh', ui: SG_STUDIO + '/ui',
  free: SG_GAME + '/free', bow: SG_GAME + '/bow', ships: SG_GAME + '/ships', weather: SG_GAME + '/weather',
  fishing: SG_GAME + '/fishing', runes: SG_GAME + '/runes', robin: SG_GAME + '/robin',
};
// name -> [set, what it is for]
const LIB = {
  fight: {
    hit_w: ['flesh', 'a light hit on flesh, the slap (pick)'], heavyhit_x: ['flesh', 'a heavy hit on flesh (pick)'],
    hit_club_v: ['chapter1', 'a club hit (pick)'], heavyhit_club_v: ['chapter1', 'a heavy club hit (pick)'],
    swing_e: ['free', 'a light swing (pick)'], swing_f: ['free', 'a heavy swing (pick)'],
    swish_seax: ['combat', 'a seax swish'], swish_spear: ['combat', 'a spear swish'], swish_axe: ['combat', 'an axe swish'],
    swish_club: ['combat', 'a club swish'], swish_greataxe: ['combat', 'a great axe swish'],
    block_a: ['free', 'a block (pick)'], raise_e: ['free', 'the shield up, light (pick)'], raise_f: ['free', 'the shield up, heavy (pick)'],
    parry: ['combat', 'a parry'], crit: ['combat', 'a critical'], broken: ['combat', 'a guard broken'], stagger: ['combat', 'a stagger'],
    dash: ['combat', 'a dash'], hurt: ['combat', 'the hero hurt'], die: ['combat', 'a death'], slam: ['combat', 'a slam'],
    finish: ['combat', 'a finishing blow'], heavytell: ['combat', "a heavy blow's warning"], perfect: ['combat', 'a perfect parry'],
    chain_2: ['combat', 'combo step 2'], chain_3: ['combat', 'combo step 3'], chain_4: ['combat', 'combo step 4'],
    pain_boar_w: ['flesh', 'a boar struck (pick)'], pain_wolf_w: ['flesh', 'a wolf struck (pick)'], pain_deer_w: ['flesh', 'a deer struck (pick)'], pain_snake_w: ['flesh', 'a snake struck (pick)'],
    shield_break_a: ['runes', 'a shield breaking (pick)'],
  },
  abilities: {
    war_cry_a: ['runes', 'a war cry (pick)'], berserk_roar_a: ['runes', 'a berserk roar'], last_stand_a: ['runes', 'a last stand'],
    riposte_a: ['runes', 'a riposte (pick)'], guard_break_a: ['runes', 'a guard break'], blink_step_a: ['runes', 'a blink step (pick)'], leap_land_a: ['runes', 'a landing after a leap (pick)'],
    lunge_a: ['runes', 'a lunge'], whirl_a: ['runes', 'a whirl'], overhead_a: ['runes', 'an overhead blow (pick)'], sweep_a: ['runes', 'a sweep'], slide_a: ['runes', 'a slide'],
    twin_shot_a: ['runes', 'a twin shot'], pin_shot_a: ['runes', 'a pinning shot'], fire_arrow_a: ['runes', 'a fire arrow'],
    rock_split_a: ['runes', 'a rock splitting'], stone_break_a: ['runes', 'stone breaking (pick)'], cudgel_thud_a: ['runes', "a cudgel's thud"],
    axe_throw_a: ['runes', 'an axe thrown (pick)'], axe_catch_a: ['runes', 'an axe caught (pick)'], shadowstep_a: ['runes', 'a shadow step (pick)'],
    trap_throw_a: ['runes', 'a trap thrown (pick)'], trap_land_a: ['runes', 'a trap landing (pick)'], trap_arm_a: ['runes', 'a trap armed (pick)'], trap_snap_a: ['runes', 'a trap snapping (pick)'], trap_poison_a: ['runes', 'a poison pot (pick)'],
    altar_lay_a: ['runes', 'a thing laid on an altar (pick)'], storm_gather_a: ['runes', 'a storm gathering'], storm_rise_a: ['runes', 'a storm rising'],
    rune_carve_a: ['runes', 'a rune carved'], rune_wake_a: ['runes', 'a rune waking'], rune_ready_a: ['runes', 'a rune ready (pick)'],
    lightning_strike_a: ['runes', 'lightning'], lightning_small_a: ['runes', 'a small lightning (pick)'], blood_drip_a: ['runes', 'blood dripping'], sacrifice_stab_a: ['runes', "a sacrifice's stab"],
    fire_burn_man_a: ['runes', 'a man burning, a loop'],
  },
  world: {
    chop_a: ['free', 'an axe on wood (pick)'], clink_a: ['free', 'a pick on stone (pick)'], treefall_a: ['free', 'a tree falling (pick)'],
    logthud_v: ['chapter1', "a log's thud (pick)"], boxbreak_v: ['chapter1', 'a box breaking (pick)'], wave_v: ['chapter1', 'a wave (pick)'],
  },
  bow: { shoot_b: ['bow', "a bow shot, a recurve's snap (pick)"] },
  ui: {
    talk_open_f: ['ui', 'a talk window opening (pick)'], talk_next_e: ['ui', 'the next line (pick)'],
    book_open_b: ['ui', 'a book opening (pick)'], book_close_c: ['ui', 'a book closing (pick)'], book_page_b: ['ui', 'a page turned (pick)'],
  },
  ships: {
    oar_a: ['ships', 'one oar (pick)'], oars_v: ['ships', "a crew's oars"], sail_fill_a: ['ships', 'a sail filling (pick)'], sail_flap_b: ['ships', 'a sail flapping (pick)'],
    creak_b: ['ships', 'a hull creaking; a lid, a wooden door (pick)'], keel_sand_v: ['ships', 'the keel on sand'], keel_off_v: ['ships', 'pushing off the sand'],
  },
  weather: {
    rain_light_a: ['weather', 'light rain'], rain_a: ['weather', 'rain'], rain_heavy_v: ['weather', 'heavy rain'], rain_water_a: ['weather', 'rain on water'],
    thunder_a: ['weather', 'thunder (pick)'], gust_a: ['weather', 'a gust'], splash_a: ['weather', 'a splash'],
    step_snow_b: ['weather', 'a step on snow (pick)'], step_mud_a: ['weather', 'a step in mud'], step_wetsand_v: ['weather', 'a step on wet sand'],
  },
  fishing: {
    fish_cast_a: ['fishing', 'a cast'], fish_plop_a: ['fishing', "the float's plop"], fish_bite_a: ['fishing', 'a bite'], fish_reel_a: ['fishing', 'the reel, a 2 s loop'],
    fish_splash_a: ['fishing', 'a splash: the hook, a run, a fish darting'], fish_snap_a: ['fishing', 'the line snapping'], fish_land_a: ['fishing', 'a fish landed'],
  },
  robin: { swing_light: ['robin', "Robin's own light swing (his)"], swing_heavy: ['robin', "Robin's own heavy swing (his)"] },
};
const ALIAS = {
  hit: 'hit_w', heavyhit: 'heavyhit_x', swing: 'swing_e', swing_heavy: 'swing_f', block: 'block_a', shield_up: 'raise_e', bow: 'shoot_b',
  chop: 'chop_a', clink: 'clink_a', treefall: 'treefall_a', ui_open: 'talk_open_f', ui_next: 'talk_next_e', page: 'book_page_b',
  thunder: 'thunder_a', rain: 'rain_a', step_snow: 'step_snow_b', creak: 'creak_b',
};
const ALL = {}; for (const g of Object.keys(LIB)) for (const n of Object.keys(LIB[g])) ALL[n] = { group: g, set: LIB[g][n][0], use: LIB[g][n][1] };

const args = process.argv.slice(2);
const flag = (k) => args.includes('--' + k);
const after = (k) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : null; };
if (flag('list') || !args.length) {
  for (const g of Object.keys(LIB)) { console.log('\n' + g); for (const n of Object.keys(LIB[g])) { const s = LIB[g][n][0]; console.log('  ' + n.padEnd(20) + s.padEnd(9) + LIB[g][n][1] + '   ' + SETS[s]); } }
  console.log('\naliases: ' + Object.keys(ALIAS).map(a => a + '=' + ALIAS[a]).join(', '));
  console.log('usage: node fetch-common-sounds.mjs NAME... [--group G...] [--all] --to DIR');
  process.exit(0);
}
const to = after('to'); if (!to) { console.error('say where: --to DIR'); process.exit(1); }
let want = [];
if (flag('all')) want = Object.keys(ALL);
const gi = args.indexOf('--group'); if (gi >= 0) { for (let i = gi + 1; i < args.length && !args[i].startsWith('--'); i++) { if (!LIB[args[i]]) { console.error('no group ' + args[i] + ' (groups: ' + Object.keys(LIB).join(', ') + ')'); process.exit(1); } want.push(...Object.keys(LIB[args[i]])); } }
for (let i = 0; i < args.length; i++) { const a = args[i]; if (a.startsWith('--')) { if (a === '--to') i++; if (a === '--group') { while (i + 1 < args.length && !args[i + 1].startsWith('--')) i++; } continue; } want.push(ALIAS[a] || a); }
want = [...new Set(want)];
const unknown = want.filter(n => !ALL[n]); if (unknown.length) { console.error('not in the library: ' + unknown.join(', ') + ' (see --list)'); process.exit(1); }
fs.mkdirSync(to, { recursive: true });
const mf = path.join(to, 'manifest.json'); let manifest = {}; try { manifest = JSON.parse(fs.readFileSync(mf, 'utf8')); } catch (e) {}
let copied = 0, missing = [];
for (const n of want) {
  const src = SETS[ALL[n].set];
  if (!fs.existsSync(src)) { missing.push(n + ' (no folder ' + src + ')'); continue; }
  const re = new RegExp('^' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(_\\d+\\.(wav|ogg|mp3)|\\.json)$', 'i');
  const files = fs.readdirSync(src).filter(f => re.test(f));
  if (!files.some(f => /\.(wav|ogg|mp3)$/i.test(f))) { missing.push(n + ' (no files in ' + src + ')'); continue; }
  for (const f of files) fs.copyFileSync(path.join(src, f), path.join(to, f));
  let gain = null, use = ALL[n].use; const jf = path.join(src, n + '.json');
  if (fs.existsSync(jf)) { try { const j = JSON.parse(fs.readFileSync(jf, 'utf8')); if (typeof j.gain === 'number') gain = j.gain; if (j.use) use = j.use; } catch (e) {} }
  if (gain == null) { const sj = path.join(src, path.basename(src) + '.json'); try { const s = JSON.parse(fs.readFileSync(sj, 'utf8')).sounds || {}; if (s[n] && typeof s[n].gain === 'number') gain = s[n].gain; if (s[n] && s[n].use) use = s[n].use; } catch (e) {} }   // a set with one manifest (free.json) instead of one per sound
  const notes = ['NOTES.md', 'CREDITS.md', 'ref/README.md'].map(x => path.join(src, x)).filter(x => fs.existsSync(x));
  manifest[n] = { from: src, set: ALL[n].set, group: ALL[n].group, files: files.filter(f => !/\.json$/i.test(f)), gain, use, read: notes, taken: new Date().toISOString().slice(0, 10) };
  copied++;
}
manifest._about = 'Sounds copied from the Survival game library by fetch-common-sounds.mjs: originals never moved or renamed; re-level the copies against this game\'s anchor; write where they came from and Robin\'s verdict in this game\'s NOTES. 48 kHz 16-bit mono, peak -1 dBFS, gains relative to the Survival combat hit.';
fs.writeFileSync(mf, JSON.stringify(manifest, null, 2));
console.log('copied ' + copied + ' sound(s) into ' + to + ' and wrote manifest.json');
if (missing.length) { console.log('!! not found: ' + missing.join('; ')); process.exit(2); }
