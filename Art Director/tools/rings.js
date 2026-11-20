// rings.js: the coloured effect under loot on the ground, one for each rarity (Leonard, AD, 2026-11-20; the colours are mine).
// Robin, 2026-11-19: "Needs to have coloroed effects for rarity." A flat ring with a soft fill, in the rarity's colour, and a
// small four-point spark the game may make blink. Added to work/loot/render and its meta.json, beside the modelled loot.
//   node tools/rings.js       (after: node tools/blender.js blender/props.py -- loot work/loot/render)
const P = require('./paint.js'); const fs = require('fs'); const path = require('path'); const { RARITY } = require('./glass.js');
const OUT = path.join(P.ROOT, 'work/loot/render'), S = 2, metaF = path.join(OUT, 'meta.json'), meta = JSON.parse(fs.readFileSync(metaF, 'utf8'));
meta.items = meta.items.filter(it => !it.name.startsWith('ring/') && !it.name.startsWith('spark'));
const LIGHT = { common: '#f4efe6', uncommon: '#6fe07f', rare: '#5fb2ff', epic: '#cf8cff' };
for (const [k, col] of Object.entries(RARITY)) {
  const w = 52, h = 28, cv = P.createCanvas(w * S, h * S), g = cv.getContext('2d'); g.scale(S, S);
  g.beginPath(); g.ellipse(w / 2, h / 2, 21, 9.5, 0, 0, 7); g.fillStyle = P.alpha(LIGHT[k], k === 'common' ? 0.35 : 0.5); g.fill(); g.lineWidth = k === 'common' ? 1.6 : 2.4; g.strokeStyle = k === 'common' ? LIGHT[k] : col; g.stroke();
  if (k === 'epic') { g.beginPath(); g.ellipse(w / 2, h / 2, 24.5, 12, 0, 0, 7); g.lineWidth = 1; g.strokeStyle = LIGHT[k]; g.stroke(); }
  const file = 'ring_' + k + '.png'; P.save(cv, path.join(OUT, file)); meta.items.push({ name: 'ring/' + k, file, origin: [w, h], data: { soft: true, keep: true, colour: col, light: LIGHT[k] } });
}
{ const w = 16, cv = P.createCanvas(w * S, w * S), g = cv.getContext('2d'); g.scale(S, S); g.fillStyle = '#ffffff'; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 1.8 : 7; g.lineTo(8 + Math.cos(a) * r, 8 + Math.sin(a) * r); } g.closePath(); g.fill(); P.save(cv, path.join(OUT, 'spark.png')); meta.items.push({ name: 'spark', file: 'spark.png', origin: [w, w], data: { soft: true, keep: true, note: 'white: tint it with the rarity\'s light colour' } }); }
meta.rarity = RARITY; meta.rarityLight = LIGHT; fs.writeFileSync(metaF, JSON.stringify(meta, null, 1)); console.log('drew the rings', Object.keys(RARITY).join(', '));
