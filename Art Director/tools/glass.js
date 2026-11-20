// glass.js: the glass over the game, as pieces (Leonard, AD, 2026-11-20; the design is mine). Cream panels with the figures'
// dark line and a small hard shadow, round buttons, strong flat colour only where a thumb goes. Drawn in design units and
// written at two pixels a unit into work/glass/render with a meta.json for tools/packset.js. A piece that stretches says
// how in its data: slice [left, top, right, bottom] in file pixels (nine-slice), or fill: true (stretch it whole).
//   node tools/glass.js        then  node tools/packset.js glass work/glass/render out/glass
const P = require('./paint.js'); const fs = require('fs'); const path = require('path');
const INK = '#33203a', CREAM = '#fffaec', CREAM2 = '#f3e8cc', WELL = '#cdbfae', PLUM = '#5a4062', SH = 'rgba(51,32,58,0.30)';
const RARITY = { common: '#b9b2a6', uncommon: '#4cc463', rare: '#3d9cff', epic: '#b666f2' };
const COL = { hp: '#f0503c', hpHi: '#ff7a62', rage: '#b8122f', rageHi: '#d2324a', xp: '#6fd060', xpHi: '#9be88a', cleave: '#f0503c', charge: '#3f9fe8', potion: '#4cbf68', gold: '#f6c23a' };
// Rage is red (Robin, 2026-11-20: "rage is traditionally red. So they need to be distinctive different red colors"): health
// keeps the light red of every health bar, rage is a deep crimson. The two differ most in how light they are (mine).
const S = 2, OUT = path.join(P.ROOT, 'work/glass/render'), items = [];
const CH = { wood: '#6b3f27', woodB: '#5e3621', grain: '#42241a', iron: '#4b4759', ironHi: '#77728a', ironLo: '#34313f', gold: '#f6c23a', goldHi: '#ffe27a', goldLo: '#c4871c', velvet: '#45294e', velvetLo: '#2f1b38', velvetHi: '#5d3b68', velvetMark: '#6d4a7a', linen: '#ecdcb4', linenLo: '#d6c294', cream: '#fff3d6', inset: '#43261a',
  words: { text: '#fff3d6', dim: '#dab892', good: '#93e283', bad: '#ff9482', gold: '#ffd95e', onGold: '#3a2414' } };   // the window's colours; `words` is what the game writes with on the dark wood and on a gold plate
// the mark of each place on him, about 0, 0 and about 24 across (one path; holes by the even-odd rule)
const SLOTMARK = {
  hat: g => { g.moveTo(-12, 5); g.quadraticCurveTo(-14, -2, -6, -3); g.quadraticCurveTo(0, -13, 6, -3); g.quadraticCurveTo(14, -2, 12, 5); g.quadraticCurveTo(0, 0, -12, 5); g.closePath(); },
  coat: g => { g.moveTo(-5, -10); g.lineTo(-1.5, -7); g.lineTo(1.5, -7); g.lineTo(5, -10); g.lineTo(12, -5); g.lineTo(9, 0); g.lineTo(6, -2); g.lineTo(7, 11); g.lineTo(-7, 11); g.lineTo(-6, -2); g.lineTo(-9, 0); g.lineTo(-12, -5); g.closePath(); },
  legs: g => { g.moveTo(-9, -10); g.lineTo(9, -10); g.lineTo(10.5, 10); g.lineTo(3, 10); g.lineTo(0, -1); g.lineTo(-3, 10); g.lineTo(-10.5, 10); g.closePath(); },
  boots: g => { g.moveTo(-6, -11); g.lineTo(3, -11); g.lineTo(3, 2); g.quadraticCurveTo(12, 3, 12, 9); g.lineTo(12, 11); g.lineTo(-6, 11); g.closePath(); },
  weapon: g => { g.moveTo(-10, 10); g.lineTo(-6, 6); g.lineTo(-8, 3); g.lineTo(-5, 1); g.lineTo(-3, 4); g.quadraticCurveTo(7, 0, 11, -11); g.quadraticCurveTo(11, 3, -1, 8); g.lineTo(-6, 12); g.closePath(); },
  shield: g => { g.arc(0, 0, 11, 0, 7); g.closePath(); g.moveTo(4, 0); g.arc(0, 0, 4, 0, 7); },
  necklace: g => { g.moveTo(-11, -9); g.quadraticCurveTo(0, 9, 11, -9); g.lineTo(8.4, -9.6); g.quadraticCurveTo(0, 5, -8.4, -9.6); g.closePath(); g.moveTo(-4, 2.5); g.lineTo(4, 2.5); g.lineTo(0, 12); g.closePath(); },
  trinket: g => { g.arc(0, 0, 10.5, 0, 7); g.closePath(); g.moveTo(0, -6); g.lineTo(4.5, 0); g.lineTo(0, 6); g.lineTo(-4.5, 0); g.closePath(); },
};
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
  piece('bar/well', 40, 18, (g) => { panel(g, rr(2, 2, 36, 12, 6), WELL); }, { slice: [16, 0, 16, 0], note: 'a fill/hp, fill/rage or fill/xp pill goes inside: see its own note' });
  for (const k of ['hp', 'rage', 'xp']) piece('bar/' + k, 8, 8, (g) => { g.fillStyle = COL[k]; g.fillRect(0, 0, 8, 8); g.fillStyle = COL[k + 'Hi']; g.fillRect(0, 1, 8, 2.2); }, { fill: true, note: 'the first, flat fill: its square corners show outside the round well; fill/* takes its place' });
  // the skill discs: 68 across (the game's size), each its own colour and sign
  for (const [k, sc] of [['cleave', 1.1], ['charge', 1.0], ['potion', 0.95]]) piece('skill/' + k, 76, 78, (g) => {
    panel(g, disc(38, 38, 34), COL[k], { lw: 2, shadow: 3, hi: gg => { gg.fillStyle = 'rgba(255,255,255,0.22)'; gg.beginPath(); gg.ellipse(38, 19, 38, 21, 0, 0, 7); gg.fill(); } });
    g.fillStyle = '#ffffff'; g.strokeStyle = k === 'charge' ? '#ffffff' : INK; g.lineWidth = k === 'charge' ? 4 : 1.8; ICON[k](g, 38, 38, 34 / 24 * sc); });
  piece('skill/empty', 76, 78, (g) => { panel(g, disc(38, 38, 34), 'rgba(255,250,236,0.55)', { lw: 2, shadow: 3 }); }, { note: 'a place for a skill he has not learnt' });
  // ---------------------------------------------------------------- the windows: the inside of a treasure chest
  // Robin, 2026-11-20, of three wooden looks (concepts/wood): "I think 3 is good. Nice contrast. But mind the text needs to fit
  // and not overlap with stuff". Dark wood in standing boards, iron bands, gold plates and angles, velvet in an empty slot,
  // pale linen under a piece he owns. Everything that frames stays in the outer 12 units of a window, so no word meets it.
  const line = (g, lw = 1.6, col = INK) => { g.lineWidth = lw; g.strokeStyle = col; g.lineJoin = 'round'; g.stroke(); };
  const under = (g, shape, dy = 3) => { g.save(); g.translate(0, dy); shape(g); g.fillStyle = SH; g.fill(); g.restore(); };
  const stud = (g, x, y, r) => { disc(x, y, r)(g); g.fillStyle = CH.goldLo; g.fill(); line(g, 1.1); disc(x - r * 0.3, y - r * 0.3, r * 0.36)(g); g.fillStyle = CH.goldHi; g.fill(); };
  const band = (g, x, y, w, h) => { g.save(); rr(x, y, w, h, 1.5)(g); g.fillStyle = CH.iron; g.fill(); g.clip(); g.fillStyle = CH.ironHi; if (w > h) g.fillRect(x, y, w, h * 0.34); else g.fillRect(x, y, w * 0.34, h); g.restore(); rr(x, y, w, h, 1.5)(g); line(g, 1.3); };
  const plated = (g, shape, x, y, w, h, [col, hi, lo]) => { g.save(); shape(g); g.fillStyle = col; g.fill(); g.clip(); g.fillStyle = hi; g.fillRect(x, y, w, h * 0.36); g.fillStyle = lo; g.fillRect(x, y + h * 0.84, w, h * 0.16); g.restore(); shape(g); line(g); };
  const GOLD = [CH.gold, CH.goldHi, CH.goldLo], IRON = [CH.iron, CH.ironHi, CH.ironLo];
  const lined = (g, x, y, w, h, r, rim) => { g.save(); rr(x, y, w, h, r)(g); g.fillStyle = CH.velvet; g.fill(); g.clip(); g.fillStyle = CH.velvetLo; g.fillRect(x, y, w, 6); g.fillStyle = CH.velvetHi; g.fillRect(x, y + h - 4, w, 4); g.restore(); rr(x + 1.6, y + 1.6, w - 3.2, h - 3.2, r - 1)(g); line(g, 3, rim); rr(x, y, w, h, r)(g); line(g); rr(x + 3.4, y + 3.4, w - 6.8, h - 6.8, Math.max(1, r - 3))(g); line(g, 1); };
  // the top buttons and the close cross: a gold ring round dark wood, a pale sign; a red stone in a gold ring
  for (const k of ['bag', 'chart', 'hero', 'menu']) piece('button/' + k, 44, 46, (g) => { under(g, disc(22, 22, 19), 2); disc(22, 22, 19)(g); g.fillStyle = CH.gold; g.fill(); line(g); g.save(); disc(22, 22, 15.5)(g); g.clip(); g.fillStyle = CH.wood; g.fillRect(0, 0, 44, 44); g.fillStyle = CH.goldHi; g.restore(); disc(22, 22, 15.5)(g); line(g, 1.3); g.fillStyle = CH.cream; g.strokeStyle = INK; g.lineWidth = k === 'menu' ? 2.4 : 1.5; if (k === 'menu') g.strokeStyle = CH.cream; ICON[k](g, 22, 22.5, 1); });
  piece('button/close', 36, 38, (g) => { under(g, disc(18, 18, 16), 2); disc(18, 18, 16)(g); g.fillStyle = CH.gold; g.fill(); line(g); g.save(); disc(18, 18, 12)(g); g.fillStyle = '#e0352f'; g.fill(); g.clip(); g.fillStyle = '#f26a5c'; g.beginPath(); g.moveTo(6, 6); g.lineTo(22, 6); g.lineTo(6, 22); g.closePath(); g.fill(); g.restore(); disc(18, 18, 12)(g); line(g, 1.3); g.strokeStyle = '#ffffff'; g.lineWidth = 2.8; ICON.close(g, 18, 18, 0.82); });
  // buttons: a gold plate for the one that does the thing ("Wear", "Open", "Sail"), an iron plate for the rest
  piece('button/context', 64, 48, (g) => { under(g, rr(2, 2, 60, 40, 8)); plated(g, rr(2, 2, 60, 40, 8), 2, 2, 60, 40, GOLD); }, { slice: [44, 0, 44, 0], note: 'the button that does the thing: dark words on it (#3a2414), 15 to 18 bold' });
  piece('button/plain', 64, 48, (g) => { under(g, rr(2, 2, 60, 40, 8)); plated(g, rr(2, 2, 60, 40, 8), 2, 2, 60, 40, IRON); }, { slice: [44, 0, 44, 0], note: 'every other button: pale words on it (#fff3d6), 15 bold. NEW: the game drew these with row' });
  piece('plate', 48, 34, (g) => { panel(g, rr(2, 2, 44, 28, 14), CREAM, { lw: 1.6 }); }, { slice: [32, 0, 32, 0] });
  // what words lie on inside a window: a dark, sunk board with a thin gold edge; and the hero's own place, lined with velvet
  piece('row', 48, 44, (g) => { rr(2, 2, 44, 38, 8)(g); g.fillStyle = CH.inset; g.fill(); rr(3.6, 3.6, 40.8, 34.8, 7)(g); line(g, 2.4, CH.goldLo); rr(2, 2, 44, 38, 8)(g); line(g); }, { slice: [24, 24, 24, 24], note: 'the card of a piece, a row of a list: pale words on it' });
  piece('niche', 48, 48, (g) => { lined(g, 2, 2, 44, 44, 8, CH.gold); }, { slice: [24, 24, 24, 24], note: 'NEW: the box the hero stands in on his sheet' });
  // the window itself. It is as wide as every window of the game (372) and is stretched only in height: its boards stand, so
  // they take that. The bands' studs and the gold angles sit in the top and bottom 64 units, which do not stretch.
  piece('panel', 372, 164, (g) => { const x = 2, y = 2, w = 368, h = 156, body = rr(x, y, w, h, 10), r = P.rng(6), n = 8;
    under(g, body, 4); g.save(); body(g); g.clip(); for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? CH.woodB : CH.wood; g.fillRect(x + i * w / n, y, w / n + 1, h); }
    g.strokeStyle = CH.grain; g.lineWidth = 1.4; for (let i = 1; i < n; i++) { g.beginPath(); g.moveTo(x + i * w / n, y); g.lineTo(x + i * w / n, y + h); g.stroke(); }
    g.globalAlpha = 0.45; g.lineWidth = 1; for (let i = 0; i < n; i++) for (let k = 0; k < 2; k++) { const gx = x + (i + 0.18 + r() * 0.64) * w / n; g.beginPath(); g.moveTo(gx, y); g.lineTo(gx, y + h); g.stroke(); } g.restore();
    band(g, x + 2, y + 2, 6, h - 4); band(g, x + w - 8, y + 2, 6, h - 4); band(g, x + 2, y + 2, w - 4, 6); band(g, x + 2, y + h - 8, w - 4, 6);
    for (const sx of [40, 332]) stud(g, sx, y + 5, 2.4); for (let sx = 46; sx < 330; sx += 46.6) stud(g, sx, y + h - 5, 2.4); for (const sy of [50, h - 44]) { stud(g, x + 5, sy, 2.4); stud(g, x + w - 5, sy, 2.4); }
    for (const [cx, cy, ex, ey] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) { g.save(); body(g); g.clip(); g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + ex * 22, cy); g.lineTo(cx + ex * 22, cy + ey * 9); g.lineTo(cx + ex * 9, cy + ey * 9); g.lineTo(cx + ex * 9, cy + ey * 22); g.lineTo(cx, cy + ey * 22); g.closePath(); g.fillStyle = CH.gold; g.fill(); line(g, 1.4); g.restore(); stud(g, cx + ex * 5, cy + ey * 5, 2.2); stud(g, cx + ex * 16.5, cy + ey * 4.6, 1.7); stud(g, cx + ex * 4.6, cy + ey * 16.5, 1.7); }
    body(g); line(g, 2); }, { slice: [128, 128, 128, 128], note: 'every window is 372 wide, so it is never stretched across; its top and bottom 64 units keep their size and the 36 between are stretched in height. Keep words and pieces 14 units in from its sides and 14 up from its bottom; its gold angles fill 22 by 22 in each corner' });
  piece('panel/title', 96, 44, (g) => { const shape = gg => { gg.beginPath(); gg.moveTo(17, 3); gg.lineTo(79, 3); gg.lineTo(93, 21); gg.lineTo(79, 39); gg.lineTo(17, 39); gg.lineTo(3, 21); gg.closePath(); }; under(g, shape); plated(g, shape, 3, 3, 90, 36, GOLD); stud(g, 18, 21, 2.6); stud(g, 78, 21, 2.6); }, { slice: [44, 0, 44, 0], note: 'DARK words on it now (#3a2414), 18 bold; it sits on the panel\'s top edge. The words have 190 units at the title\'s 236' });
  // a slot: a piece he owns lies on pale linen inside its rarity's colour; an empty one is lined with velvet
  for (const [k, col] of Object.entries(RARITY)) piece('slot/' + k, 56, 58, (g) => { under(g, rr(3, 3, 50, 50, 7), 2); g.save(); rr(3, 3, 50, 50, 7)(g); g.fillStyle = CH.linen; g.fill(); g.clip(); g.fillStyle = CH.linenLo; g.fillRect(3, 3, 50, 6); g.restore(); rr(4.8, 4.8, 46.4, 46.4, 5.5)(g); line(g, 3.6, col); rr(3, 3, 50, 50, 7)(g); line(g, 1.5); rr(7, 7, 42, 42, 3.5)(g); line(g, 1); }, { note: 'an icon of 48 sits in its middle' });
  piece('slot/empty', 56, 58, (g) => { lined(g, 3, 3, 50, 50, 7, CH.ironHi); }, { note: 'draw it at full strength: the dark velvet already says empty' });
  piece('slot/chosen', 64, 64, (g) => { rr(3.5, 3.5, 57, 57, 9)(g); line(g, 5.4); rr(3.5, 3.5, 57, 57, 9)(g); line(g, 2.6, CH.goldHi); }, { note: 'NEW: a gold frame laid over the slot that is being looked at, its middle on the slot\'s middle, scaled as the slot is (it is 64 where the slot is 56)' });
  // the mark in an empty place on him: what belongs there
  for (const [k, draw] of Object.entries(SLOTMARK)) piece('mark/slot-' + k, 32, 32, (g) => { g.translate(16, 16); g.beginPath(); draw(g); g.fillStyle = CH.velvetMark; g.fill('evenodd'); }, { note: 'NEW: in the middle of an empty slot of that place; the two trinket places share mark/slot-trinket' });
  // small marks: a coin, the quest's ! and ?, the ring under a picked target, the ring where a tap landed
  piece('mark/coin', 16, 16, (g) => { panel(g, disc(8, 8, 6.2), COL.gold, { lw: 1.4, shadow: 0 }); g.fillStyle = '#d99a26'; g.beginPath(); g.arc(8, 8, 2.6, 0, 7); g.fill(); });
  for (const [k, ch] of [['quest', '!'], ['done', '?']]) piece('mark/' + k, 28, 34, (g) => { panel(g, disc(14, 14, 11), k === 'quest' ? COL.gold : '#6fd060', { lw: 1.6 }); P.label(g, ch, 14, 14.5, 17, INK, { align: 'center', font: 'Trebuchet MS' }); });
  piece('mark/target', 76, 36, (g) => { g.beginPath(); g.ellipse(38, 18, 35, 15, 0, 0, 7); g.fillStyle = 'rgba(255,74,82,0.16)'; g.fill(); g.lineWidth = 2.2; g.strokeStyle = '#ff4a52'; g.stroke(); }, { soft: true, note: 'under the picked target, at its feet' });
  piece('mark/tap', 44, 24, (g) => { g.beginPath(); g.ellipse(22, 12, 19, 9, 0, 0, 7); g.lineWidth = 2.2; g.strokeStyle = '#ffffff'; g.stroke(); }, { soft: true, note: 'where a tap landed' });
  // Over a monster's head (Robin, 2026-11-20: health "on mobs needs to be easier to see"): a dark well, so it reads on sand,
  // grass and rock alike, with the same red inside. The one he fights has a gold rim between two dark lines (gold alone is
  // lost on sand) and an arrow over it. The pale fill is what a blow just took: it lags and then shrinks.
  piece('mob/well', 28, 13, (g) => { rr(1, 1, 26, 11, 4.2)(g); g.fillStyle = INK; g.fill(); rr(2.5, 2.5, 23, 8, 2.2)(g); g.fillStyle = PLUM; g.fill(); }, { slice: [12, 0, 12, 0], inset: 3, fill: 7, note: 'the fill goes inside, 3 design units in from each side, 7 tall' });
  piece('mob/well-mine', 32, 17, (g) => { rr(1, 1, 30, 15, 6.2)(g); g.fillStyle = INK; g.fill(); rr(2, 2, 28, 13, 5.2)(g); g.fillStyle = COL.gold; g.fill(); g.save(); g.beginPath(); g.rect(0, 0, 32, 7); g.clip(); rr(2, 2, 28, 13, 5.2)(g); g.fillStyle = '#ffe07a'; g.fill(); g.restore(); rr(3.5, 3.5, 25, 10, 3.6)(g); g.fillStyle = INK; g.fill(); rr(4.5, 4.5, 23, 8, 2.2)(g); g.fillStyle = PLUM; g.fill(); }, { slice: [16, 0, 16, 0], inset: 5, fill: 7, note: 'the well of the one he fights: the fill goes 5 design units in from each side, 7 tall; draw this whole bar a fifth bigger than the others' });
  // Fills with round ends (Leonard, AD, 2026-11-20: the flat fills showed square corners outside the round wells on the real
  // screen). A fill is a pill cut left and right: make it as long as the bar's part, its ends stay round. `fill/*` fit
  // `bar/well`, `mob/*` fit the two wells over a monster. The pale one is what a blow just took: it lags and then shrinks.
  const FILL = { hp: [COL.hp, COL.hpHi], rage: [COL.rage, COL.rageHi], xp: [COL.xp, COL.xpHi], lost: ['#fff1c9', '#ffffff'] };
  const fillPill = (w, h, r, [col, hi]) => (g) => { rr(0, 0, w, h, r)(g); g.fillStyle = col; g.fill(); g.save(); rr(0, 0, w, h, r)(g); g.clip(); g.fillStyle = hi; g.fillRect(0, h * 0.12, w, h * 0.26); g.restore(); };
  for (const k of ['hp', 'rage', 'xp', 'lost']) piece('fill/' + k, 24, 10, fillPill(24, 10, 5, FILL[k]), { slice: [10, 0, 10, 0], x: 3, y: -1, note: 'inside bar/well: its left end 3 design units in from the well\'s, its middle 1 unit above the well\'s middle (the well has a shadow under it); as long as the part, the whole is the well\'s length less 6; hide it at nothing' });
  for (const k of ['hp', 'lost']) piece('mob/' + k, 12, 7, fillPill(12, 7, 2, FILL[k]), { slice: [5, 0, 5, 0], note: 'inside mob/well (3 units in from each end) or mob/well-mine (5 in), on the well\'s middle' });
  piece('mark/mine', 18, 16, (g) => { const tri = gg => { gg.beginPath(); gg.moveTo(4, 3.5); gg.lineTo(14, 3.5); gg.lineTo(9, 11); gg.closePath(); }; g.lineJoin = 'round'; g.save(); g.translate(0, 1.6); tri(g); g.lineWidth = 3.4; g.strokeStyle = SH; g.stroke(); g.restore(); tri(g); g.lineWidth = 4.6; g.strokeStyle = INK; g.stroke(); tri(g); g.lineWidth = 1.6; g.strokeStyle = COL.gold; g.stroke(); g.fillStyle = COL.gold; g.fill(); }, { note: 'an arrow over the bar of the one he fights; let it bob 2 units, once a second' });
  // A heart for the left end of his own health bar, so his bar is never taken for the monster's.
  piece('mark/heart', 30, 30, (g) => { const heart = gg => { gg.beginPath(); gg.moveTo(15, 25); gg.bezierCurveTo(-1, 14, 4, 2.5, 15, 9); gg.bezierCurveTo(26, 2.5, 31, 14, 15, 25); gg.closePath(); }; panel(g, heart, COL.hp, { lw: 1.8, shadow: 2, hi: gg => { gg.fillStyle = COL.hpHi; gg.beginPath(); gg.ellipse(10, 9.5, 4.2, 2.6, -0.6, 0, 7); gg.fill(); } }); });
  // His own bar, over his head (Robin, 2026-11-20: "I think the heros health bar should show over his character, and the rage
  // bar below it"; of the four shown: "I think 4, but the heart isnt needed"). One dark outline with two rooms: health over
  // rage. Three layers, so no corner can poke out: own/back under, the flat fills in the rooms, own/frame on top. Health
  // has its light stripe, rage is flat: a second thing that tells them apart at a glance.
  const OWN = { w: 28, h: 15, r: 5, line: 1.5, hp: 7, bar: 1, rage: 4 }, OWN_NOTE = 'his own bar, 52 long over his head: own/back, then own/lost, own/hp and own/rage in the rooms, then own/frame on top';
  piece('own/back', OWN.w, OWN.h, (g) => { rr(0.5, 0.5, OWN.w - 1, OWN.h - 1, OWN.r - 0.5)(g); g.fillStyle = WELL; g.fill(); }, { slice: [16, 0, 16, 0], note: OWN_NOTE + '; this is the empty rooms\' colour, as long as the frame' });
  piece('own/frame', OWN.w, OWN.h, (g) => { const L = OWN.line; rr(0, 0, OWN.w, OWN.h, OWN.r)(g); g.fillStyle = INK; g.fill(); g.save(); rr(L, L, OWN.w - 2 * L, OWN.h - 2 * L, OWN.r - L)(g); g.clip(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000000'; g.fillRect(0, L, OWN.w, OWN.hp); g.fillRect(0, L + OWN.hp + OWN.bar, OWN.w, OWN.rage); g.restore(); },
    { slice: [16, 0, 16, 0], length: 52, rooms: { hp: { x: OWN.line, y: OWN.line, h: OWN.hp }, rage: { x: OWN.line, y: OWN.line + OWN.hp + OWN.bar, h: OWN.rage } }, note: OWN_NOTE + '; rooms: where each fill starts from the frame\'s top left corner and how tall it is, in design units; a whole fill is the frame\'s length less 3' });
  piece('own/hp', 8, OWN.hp, (g) => { g.fillStyle = COL.hp; g.fillRect(0, 0, 8, OWN.hp); g.fillStyle = COL.hpHi; g.fillRect(0, 1, 8, 2); }, { fill: true, note: OWN_NOTE + '; stretch it whole to the part\'s length' });
  piece('own/rage', 8, OWN.rage, (g) => { g.fillStyle = COL.rage; g.fillRect(0, 0, 8, OWN.rage); }, { fill: true, note: OWN_NOTE + '; stretch it whole to the part\'s length' });
  piece('own/lost', 8, OWN.hp, (g) => { g.fillStyle = '#fff1c9'; g.fillRect(0, 0, 8, OWN.hp); }, { fill: true, note: OWN_NOTE + '; what a blow just took, in the health room under own/hp: it lags and then shrinks' });
  // The stick (Robin, 2026-11-20: "a moving stick"): a ring where the thumb came down and a knob under the thumb. Cream with
  // the dark line, see-through: the ring's inside is all but clear, so a crab under it is still seen.
  piece('stick/ring', 100, 100, (g) => { const c = 50; g.beginPath(); g.arc(c, c, 44, 0, 7); g.fillStyle = 'rgba(51,32,58,0.07)'; g.fill(); g.beginPath(); g.arc(c, c, 43.5, 0, 7); g.lineWidth = 7; g.strokeStyle = 'rgba(51,32,58,0.5)'; g.stroke(); g.beginPath(); g.arc(c, c, 43.5, 0, 7); g.lineWidth = 4.2; g.strokeStyle = 'rgba(255,250,236,0.92)'; g.stroke();
    for (let k = 0; k < 4; k++) { g.save(); g.translate(c, c); g.rotate(k * Math.PI / 2); const v = () => { g.beginPath(); g.moveTo(-5, -29); g.lineTo(0, -34); g.lineTo(5, -29); }; v(); g.lineWidth = 4.6; g.strokeStyle = 'rgba(51,32,58,0.4)'; g.stroke(); v(); g.lineWidth = 2.2; g.strokeStyle = 'rgba(255,250,236,0.9)'; g.stroke(); g.restore(); } }, { soft: true, radius: 46, note: 'where the thumb came down; its see-through is in the picture, draw it at full strength' });
  piece('stick/knob', 52, 52, (g) => { disc(26, 28.5, 22)(g); g.fillStyle = 'rgba(51,32,58,0.16)'; g.fill(); disc(26, 26, 22)(g); g.fillStyle = 'rgba(255,250,236,0.46)'; g.fill(); g.save(); disc(26, 26, 22)(g); g.clip(); g.fillStyle = 'rgba(255,255,255,0.22)'; g.beginPath(); g.ellipse(26, 13, 24, 12, 0, 0, 7); g.fill(); g.restore(); disc(26, 26, 22)(g); g.lineWidth = 1.8; g.strokeStyle = 'rgba(51,32,58,0.8)'; g.stroke(); g.beginPath(); g.arc(26, 26, 12.5, 0, 7); g.lineWidth = 1.4; g.strokeStyle = 'rgba(51,32,58,0.28)'; g.stroke(); }, { soft: true, radius: 22, note: 'under the thumb' });
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify({ px: S, items, rarity: RARITY, colours: COL, ink: INK, cream: CREAM, window: CH }, null, 1)); console.log('drew', items.length, 'pieces of glass');
}
if (require.main === module) build();
module.exports = { RARITY, COL, INK, CREAM, CREAM2, WELL, ICON, CH, SLOTMARK };
