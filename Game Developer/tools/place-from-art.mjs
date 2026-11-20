#!/usr/bin/env node
// Takes a place's layout from the Art Director's drop and writes it into the rules' data, so the place the rules
// know is the place his ground picture shows. Run from the Game Developer folder after copying a place's drop:
//
//   node tools/place-from-art.mjs crab-cay crab-cay
//
// It reads client/public/art/<art>/place.json (his: the shore `land` and the `inlet` as corner points of a smooth
// curve, `solid` circles and boxes to walk round, `dock`, `arrive`, `chest`, a box for each monster, the `people`
// who stand about, the `props`) and changes, in rules/data/places.json, only what a layout is: `land`, `water`,
// `solids`, `boxes`, `dock`, `arrive`, where the chest and the stall stand, and each zone's box. Everything else
// there (names, counts, what the chest holds, the chart) is the game's and stays.
//
// What is the game's own choice here (Victor, GD, 2026-11-20; Leonard, AD: "your own map data wins"):
// - The curve is his (tools/ground.js: a closed curve through the corners, tension 0.6), sampled to a many-cornered
//   outline. The land is drawn in a little (his sand starts inside a band of wet sand and foam), the inlet out a
//   little, so nobody stands in the water's edge.
// - He sails from the sand at the dock's foot, a few units inland of where the dock meets it.
// - The zones' boxes are his as they are. A box may reach over water, a rock or the landing: the rules only let a
//   monster arrive on ground it can stand on, and never near where he steps ashore (numbers.json, spawn.landing).
// - The chest is something to walk round.
// - Since the big island (2026-11-20): his `walk` outline, when he gives one, is the ground as it is (no scaling of
//   `land`); `home` is the town's outline, where he wakes and the stall; `grounds` are the biomes, the ones that lie
//   inside another first; `zones` has several boxes for a kind, and the game counts how many live in each by its
//   size (one sand crab to 60 000 square units, a gull to 115 000, a coconut crab to 230 000: mine, from the small
//   island's own crowding, the coconut crabs thinner).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [art, id] = process.argv.slice(2);
if (!art || !id) fail('usage: node tools/place-from-art.mjs <art folder> <place id>');

const TENSION = 0.6;
const SAMPLES = 6;
const LAND_IN = [0.972, 0.982];
const WATER_OUT = 1.07;
const DOCK_INLAND = 12;
const CHEST_SOLID = 14;
const PERSON_SOLID = 9;

const artFile = join(ROOT, 'client', 'public', 'art', art, 'place.json');
const dataFile = join(ROOT, 'rules', 'data', 'places.json');
const layout = JSON.parse(readFileSync(artFile, 'utf8'));
const data = JSON.parse(readFileSync(dataFile, 'utf8'));
const place = data.places[id];
if (!place) fail(`no place "${id}" in rules/data/places.json`);
if (layout.size.w !== place.width || layout.size.h !== place.height) fail(`sizes differ: the art is ${layout.size.w} by ${layout.size.h}, the rules' place ${place.width} by ${place.height}`);

const round = (v) => Math.round(v * 10) / 10;

/** His curve through the corner points, as corners of its own: each stretch between two points sampled a few times. */
function curve(pts) {
  const n = pts.length;
  const out = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + ((p2[0] - p0[0]) * TENSION) / 3, p1[1] + ((p2[1] - p0[1]) * TENSION) / 3];
    const c2 = [p2[0] - ((p3[0] - p1[0]) * TENSION) / 3, p2[1] - ((p3[1] - p1[1]) * TENSION) / 3];
    for (let s = 0; s < SAMPLES; s++) {
      const t = s / SAMPLES;
      const u = 1 - t;
      out.push([0, 1].map((k) => u * u * u * p1[k] + 3 * u * u * t * c1[k] + 3 * u * t * t * c2[k] + t * t * t * p2[k]));
    }
  }
  return out;
}

const scaled = (pts, cx, cy, kx, ky) => pts.map(([x, y]) => [round(cx + (x - cx) * kx), round(cy + (y - cy) * ky)]);
const middle = (pts) => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];

place.land = layout.walk ? layout.walk.map(([x, y]) => [round(x), round(y)]) : scaled(curve(layout.land), layout.size.w / 2, layout.size.h / 2, LAND_IN[0], LAND_IN[1]);
place.water = [];
if (layout.inlet) {
  const [cx, cy] = middle(layout.inlet);
  place.water.push(scaled(curve(layout.inlet), cx, cy, WATER_OUT, WATER_OUT));
}
// Run again after a new drop, it starts from his circles each time, so the chest's is not added twice. A thing of
// his with a width and a height is a box (a house, a stall); the rest are circles.
place.solids = layout.solid.filter((s) => s.r !== undefined).map((s) => ({ x: s.x, y: s.y, r: s.r }));
place.boxes = layout.solid.filter((s) => s.w !== undefined).map((s) => ({ x: s.x, y: s.y, w: s.w, h: s.h }));
const inBox = (p) => place.boxes.some((b) => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h);
// The people who stand about are walked round, not through (the keeper already stands inside his stall's box).
for (const p of layout.people ?? []) if (!inBox(p)) place.solids.push({ x: p.x, y: p.y, r: PERSON_SOLID });
place.dock = { x: layout.dock[0], y: layout.dock[1] - DOCK_INLAND };
place.arrive = { x: layout.arrive[0], y: layout.arrive[1] };
// On an island he wakes where he steps ashore. A town keeps the spot the game gave it (in its square), unless his
// layout names one; the tests say whether that spot is still ground.
const wake = layout.home?.wake ?? layout.wake;
if (wake) place.wake = { x: wake[0], y: wake[1] };
else place.wake = { ...place.arrive };
// The town on the island: its outline is home, where nothing comes for him.
place.home = layout.home ? { outline: curve(layout.home.outline).map(([x, y]) => [round(x), round(y)]) } : null;
// The grounds, the ones that lie inside another first (his beach is the land where the other two are not).
if (layout.grounds) {
  const area = (g) => g.box[2] * g.box[3];
  place.biomes = [...layout.grounds].sort((a, b) => area(a) - area(b)).map((g) => ({ id: g.id, name: g.name, levels: g.levels, outline: curve(g.outline).map(([x, y]) => [round(x), round(y)]) }));
}
// The stall is where one trades: the shop is at his stall, whoever keeps it.
const stall = layout.props.find((p) => p.name === 'stall');
if (place.shop && stall) Object.assign(place.shop, { x: stall.x, y: stall.y });
if (place.chest && layout.chest) {
  place.chest.x = layout.chest[0];
  place.chest.y = layout.chest[1];
  place.solids.push({ x: layout.chest[0], y: layout.chest[1], r: CHEST_SOLID });
}
// Every box of his is a zone; how many live in it is the game's, by the box's size.
const ROOM = { 'sand-crab': 60000, 'reef-gull': 115000, 'coconut-crab': 230000 };
place.zones = [];
for (const [kind, boxes] of Object.entries(layout.zones ?? {})) {
  for (const [x, y, w, h, level] of boxes) place.zones.push({ kind, count: Math.max(1, Math.round((w * h) / (ROOM[kind] ?? 100000))), x, y, w, h, level: level ?? 0 });
}

// Written the way the file is kept by hand: a point, a circle and a box each on one line.
const num = '(-?[\\d.]+)';
const text = JSON.stringify(data, null, 2)
  .replace(new RegExp(`\\[\\s+${num},\\s+${num}\\s+\\]`, 'g'), '[$1, $2]')
  .replace(/\{\s+("[a-zA-Z]+": (?:-?[\d.]+|"[^"]*")(?:,\s+"[a-zA-Z]+": (?:-?[\d.]+|"[^"]*"))*)\s+\}/g, (_all, body) => `{ ${body.replace(/,\s+/g, ', ')} }`);
writeFileSync(dataFile, text + '\n');
console.log(`${id} laid out from art/${art}/place.json: land ${place.land.length} corners, ${place.water.length} waters, ${place.solids.length} round things and ${place.boxes.length} boxes to walk round`);
console.log(`  dock ${place.dock.x}, ${place.dock.y}; ashore at ${place.arrive.x}, ${place.arrive.y}; wakes at ${place.wake.x}, ${place.wake.y}; chest ${place.chest ? `${place.chest.x}, ${place.chest.y}` : 'none'}; stall ${place.shop ? `${place.shop.x}, ${place.shop.y}` : 'none'}`);
for (const z of place.zones) console.log(`  ${z.count} ${z.kind}: ${z.x}, ${z.y}, ${z.w} by ${z.h}`);

function fail(msg) {
  console.error(msg);
  process.exit(1);
}
