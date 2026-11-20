// glass.js: the glass over the game, as pieces (Leonard, AD, 2026-11-20; the design is mine). Cream panels with the figures'
// dark line and a small hard shadow, round buttons, strong flat colour only where a thumb goes. Drawn in design units and
// written at two pixels a unit into work/glass/render with a meta.json for tools/packset.js. A piece that stretches says
// how in its data: slice [left, top, right, bottom] in file pixels (nine-slice), or fill: true (stretch it whole).
//   node tools/glass.js        then  node tools/packset.js glass work/glass/render out/glass
const P = require('./paint.js'); const fs = require('fs'); const path = require('path');
const INK = '#33203a', CREAM = '#fffaec', CREAM2 = '#f3e8cc', WELL = '#cdbfae', SH = 'rgba(51,32,58,0.30)';
const RARITY = { common: '#b9b2a6', uncommon: '#4cc463', rare: '#3d9cff', epic: '#b666f2' };
const COL = { hp: '#f0503c', hpHi: '#ff7a62', rage: '#ff9a2e', rageHi: '#ffc060', xp: '#6fd060', xpHi: '#9be88a', cleave: '#f0503c', charge: '#3f9fe8', potion: '#4cbf68', gold: '#f6c23a' };
const S = 2, OUT = path.join(P.ROOT, 'work/glass/render'), items = [];
const rr = (x, y, w, h, r) => g => { g.beginPath(); P.rr(g, x, y, w, h, r); };
const disc = (x, y, r) => g => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.closePath(); };
// a piece: fill, a hard shadow below, the line
function panel(g, path, col, o = {}) { const lw = o.lw === undefined ? 1.6 : o.lw; if (o.shadow !== 0) { g.save(); g.translate(0, o.shadow || 2); path(g); g.fillStyle = SH; g.fill(); g.restore(); } path(g); g.fillStyle = col; g.fill(); if (o.hi) { g.save(); path(g); g.clip(); o.hi(g); g.restore(); } if (lw) { path(g); g.lineWidth = lw; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke(); } }
function piece(name, w, h, draw, data) { const cv = P.createCanvas(w * S, h * S), g = cv.getContext('2d'); g.scale(S, S); g.lineCap = 'round'; g.lineJoin = 'round'; draw(g, w, h); const file = name.replace(/\//g, '_') + '.png'; P.save(cv, path.join(OUT, file)); items.push({ name, file, origin: [w * S / 2, h * S / 2], data: { keep: true, ...(data || {}) } }); }
const ICON = {
  bag: (g, x, y, s) => { g.beginPath(); P.rr(g, x - 7 * s, y - 4 * s, 14 * s, 12 * s, 3.5 * s); g.fill(); g.stroke(); g.beginPath(); g.moveTo(x - 4 * s, y - 4 * s); g.quadraticCurveTo(x, y - 12 * s, x + 4 * s, y - 4 * s); g.stroke(); },
  chart: (g, x, y, s) => { g.beginPath(); g.moveTo(x - 8 * s, y - 6 * s); g.lineTo(x - 3 * s, y - 8 * s); g.lineTo(x + 3 * s, y - 6 * s); g.lineTo(x + 8 * s, y - 8 * s); g.lineTo(x + 8 * s, y + 6 * s); g.lineTo(x + 3 * s, y + 8 * s); g.lineTo(x - 3 * s, y + 6 * s); g.lineTo(x - 8 * s, y + 8 * s); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.moveTo(x - 3 * s, y - 8 * s); g.lineTo(x - 3 * s, y + 6 * s); g.moveTo(x + 3 * s, y - 6 * s); g.lineTo(x + 3 * s, y + 8 * s); g.stroke(); },
  hero: (g, x, y, s) => { g.beginPath(); g.arc(x, y - 4 * s, 4.5 * s, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.moveTo(x - 8 * s, y + 8 * s); g.quadraticCurveTo(x - 8 * s, y + 1 * s, x, y + 1 * s); g.quadraticCurveTo(x + 8 * s, y + 1 * s, x + 8 * s, y + 8 * s); g.closePath(); g.fill(); g.stroke(); },
  menu: (g, x, y, s) => { for (const dy of [-5, 0, 5]) { g.beginPath(); g.moveTo(x - 7 * s, y + dy * s); g.lineTo(x + 7 * s, y + dy * s); g.stroke(); } },
  close: (g, x, y, s) => { g.beginPath(); g.moveTo(x - 5 * s, y - 5 * s); g.lineTo(x + 5 * s, y + 5 * s); g.moveTo(x + 5 * s, y - 5 * s); g.lineTo(x - 5 * s, y + 5 * s); g.stroke(); },
  charge: (g, x, y, s) => { for (const dx of [-7, 0, 7]) { g.beginPath(); g.moveTo(x + (dx - 4) * s, y - 8 * s); g.lineTo(x + (dx + 4) * s, y); g.lineTo(x + (dx - 4) * s, y + 8 * s); g.stroke(); } },
  cleave: (g, x, y, s) => { g.beginPath(); g.arc(x - 2 * s, y + 3 * s, 13 * s, -2.5, 0.35); g.arc(x - 5 * s, y + 7 * s, 11 * s, 0.1, -2.2, true); g.closePath(); g.fill(); g.stroke(); },
  potion: (g, x, y, s) => { g.beginPath(); g.moveTo(x - 3 * s, y - 10 * s); g.lineTo(x + 3 * s, y - 10 * s); g.lineTo(x + 3 * s, y - 4 * s); g.quadraticCurveTo(x + 10 * s, y, x + 8 * s, y + 7 * s); g.quadraticCurveTo(x, y + 13 * s, x - 8 * s, y + 7 * s); g.quadraticCurveTo(x - 10 * s, y, x - 3 * s, y - 4 * s); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.moveTo(x - 4.5 * s, y - 11 * s); g.lineTo(x + 4.5 * s, y - 11 * s); g.stroke(); },
};
function build() {
  fs.mkdirSync(OUT, { recursive: true });
  // bars: a well that stretches, and three fills that stretch whole
  piece('bar/well', 40, 18, (g) => { panel(g, rr(2, 2, 36, 12, 6), WELL); }, { slice: [16, 0, 16, 0], inner: [6, 6, 6, 6], note: 'the fill goes inside, 2 design units in from each side, 8 tall' });
  for (const k of ['hp', 'rage', 'xp']) piece('bar/' + k, 8, 8, (g) => { g.fillStyle = COL[k]; g.fillRect(0, 0, 8, 8); g.fillStyle = COL[k + 'Hi']; g.fillRect(0, 1, 8, 2.2); }, { fill: true });
  // the skill discs: 68 across (the game's size), each its own colour and sign
  for (const [k, sc] of [['cleave', 1.1], ['charge', 1.0], ['potion', 0.95]]) piece('skill/' + k, 76, 78, (g) => {
    panel(g, disc(38, 38, 34), COL[k], { lw: 2, shadow: 3, hi: gg => { gg.fillStyle = 'rgba(255,255,255,0.22)'; gg.beginPath(); gg.ellipse(38, 19, 38, 21, 0, 0, 7); gg.fill(); } });
    g.fillStyle = '#ffffff'; g.strokeStyle = k === 'charge' ? '#ffffff' : INK; g.lineWidth = k === 'charge' ? 4 : 1.8; ICON[k](g, 38, 38, 34 / 24 * sc); });
  piece('skill/empty', 76, 78, (g) => { panel(g, disc(38, 38, 34), 'rgba(255,250,236,0.55)', { lw: 2, shadow: 3 }); }, { note: 'a place for a skill he has not learnt' });
  // the top buttons, the menu and the close cross
  for (const k of ['bag', 'chart', 'hero', 'menu']) piece('button/' + k, 44, 46, (g) => { panel(g, disc(22, 22, 19), CREAM, { lw: 1.6 }); g.fillStyle = '#ffe2a0'; g.strokeStyle = INK; g.lineWidth = k === 'menu' ? 2.4 : 1.5; ICON[k](g, 22, 22.5, 1); });
  piece('button/close', 36, 38, (g) => { panel(g, disc(18, 18, 15), '#f0503c', { lw: 1.6 }); g.strokeStyle = '#ffffff'; g.lineWidth = 3; ICON.close(g, 18, 18, 1); });
  // the button that names what a tap does here ("Open", "Shop", "Sail"), the target's name plate, a row, a panel and its title
  piece('button/context', 64, 48, (g) => { panel(g, rr(2, 2, 60, 40, 20), COL.gold, { lw: 2, shadow: 3, hi: gg => { gg.fillStyle = 'rgba(255,255,255,0.3)'; gg.fillRect(0, 0, 64, 16); } }); }, { slice: [44, 0, 44, 0], note: 'dark words on it, 18 bold' });
  piece('plate', 48, 34, (g) => { panel(g, rr(2, 2, 44, 28, 14), CREAM, { lw: 1.6 }); }, { slice: [32, 0, 32, 0] });
  piece('row', 48, 44, (g) => { panel(g, rr(2, 2, 44, 38, 10), CREAM2, { lw: 1.4, shadow: 1.5 }); }, { slice: [24, 24, 24, 24] });
  piece('panel', 96, 100, (g) => { panel(g, rr(3, 3, 90, 90, 18), CREAM, { lw: 2.2, shadow: 4 }); }, { slice: [44, 44, 44, 52] });
  piece('panel/title', 96, 44, (g) => { panel(g, rr(3, 3, 90, 36, 18), '#3f9fe8', { lw: 2.2, shadow: 0, hi: gg => { gg.fillStyle = 'rgba(255,255,255,0.2)'; gg.fillRect(0, 0, 96, 16); } }); }, { slice: [44, 0, 44, 0], note: 'white words on it, 18 bold; it sits on the panel\'s top edge' });
  // a slot of the bag, its edge in the rarity's colour
  for (const [k, col] of Object.entries(RARITY)) piece('slot/' + k, 56, 58, (g) => { panel(g, rr(3, 3, 50, 50, 10), CREAM2, { lw: 0, shadow: 2 }); rr(4.5, 4.5, 47, 47, 8.5)(g); g.lineWidth = 4; g.strokeStyle = col; g.stroke(); rr(3, 3, 50, 50, 10)(g); g.lineWidth = 1.5; g.strokeStyle = INK; g.stroke(); }, { note: 'an icon of 48 sits in its middle' });
  piece('slot/empty', 56, 58, (g) => { panel(g, rr(3, 3, 50, 50, 10), WELL, { lw: 1.5, shadow: 0 }); });
  // small marks: a coin, the quest's ! and ?, the ring under a picked target, the ring where a tap landed
  piece('mark/coin', 16, 16, (g) => { panel(g, disc(8, 8, 6.2), COL.gold, { lw: 1.4, shadow: 0 }); g.fillStyle = '#d99a26'; g.beginPath(); g.arc(8, 8, 2.6, 0, 7); g.fill(); });
  for (const [k, ch] of [['quest', '!'], ['done', '?']]) piece('mark/' + k, 28, 34, (g) => { panel(g, disc(14, 14, 11), k === 'quest' ? COL.gold : '#6fd060', { lw: 1.6 }); P.label(g, ch, 14, 14.5, 17, INK, { align: 'center', font: 'Trebuchet MS' }); });
  piece('mark/target', 76, 36, (g) => { g.beginPath(); g.ellipse(38, 18, 35, 15, 0, 0, 7); g.fillStyle = 'rgba(255,74,82,0.16)'; g.fill(); g.lineWidth = 2.2; g.strokeStyle = '#ff4a52'; g.stroke(); }, { soft: true, note: 'under the picked target, at its feet' });
  piece('mark/tap', 44, 24, (g) => { g.beginPath(); g.ellipse(22, 12, 19, 9, 0, 0, 7); g.lineWidth = 2.2; g.strokeStyle = '#ffffff'; g.stroke(); }, { soft: true, note: 'where a tap landed' });
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify({ px: S, items, rarity: RARITY, colours: COL, ink: INK, cream: CREAM }, null, 1)); console.log('drew', items.length, 'pieces of glass');
}
if (require.main === module) build();
module.exports = { RARITY, COL, INK, CREAM, CREAM2, WELL, ICON };
