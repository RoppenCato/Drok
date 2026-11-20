// window.js: the hero's window drawn from the glass's own pieces, the way the game puts them together (Leonard, AD, 2026-11-20).
// Robin, 2026-11-20, picking the treasure chest of three wooden looks: "I think 3 is good. Nice contrast. But mind the text
// needs to fit and not overlap with stuff". So this drawer is for checking exactly that: it stretches the pieces by their
// `slice` as the game does (glass.ts), lays the window out with the game's own numbers (client/src/view/panels.ts,
// buildSheet) and fills it with long names and big numbers. --fix lays it out with the few changes that keep every word and
// every piece clear of the frame and of each other; they are listed in out/glass/NOTES.md for Victor, GD.
//   node tools/window.js <out.png> [--fix] [--sheet] [--state bag|worn|none] [--font "Segoe UI"] [--glass work/glass/out] [--crop x,y,w,h,zoom]
const P = require('./paint.js'); const D = require('./dress.js'); const G = require('./glass.js'); const fs = require('fs'); const path = require('path');
const W = 412, H = 915, S = 2, CX = 206, F = { x: 20, y: 118, w: 372, h: 690 }, R = P.ROOT;
async function main() {
  const args = process.argv.slice(2), out = args[0], opt = k => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : null; }, fix = args.includes('--fix'), state = opt('state') || 'bag', FONT = opt('font') || 'Segoe UI';
  const gdir = path.join(R, opt('glass') || (fs.existsSync(path.join(R, 'work/glass/out/glass.json')) ? 'work/glass/out' : 'out/glass')), glass = await D.atlas(gdir, 'glass'), A = await D.load(), icons = await D.atlas(path.join(R, 'out/gear'), 'gear-icons'), I = G.CH.words;
  const bgF = path.join(R, 'work/wood/bg.png'), cv = P.createCanvas(W * S, H * S), g = cv.getContext('2d'); g.scale(S, S); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  if (fs.existsSync(bgF)) g.drawImage(await P.loadImage(bgF), 0, 0, W, H); else { g.fillStyle = '#f8e7b6'; g.fillRect(0, 0, W, H); }
  const fr = key => { const f = glass.j.frames[key]; if (!f) throw new Error('no piece ' + key); return f.frame; }, it = key => glass.j.items[key];
  const piece = (key, x, y, k = 1, a = 1) => { g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(0.5 * k, 0.5 * k); D.pic(g, glass, key); g.restore(); };
  // a piece cut in nine by its slice (left, top, right, bottom, file pixels) and stretched to w by h units about x, y
  const stretch = (key, x, y, w, h) => { const f = fr(key), [l, t, r, b] = it(key).slice, cw = [l, f.w - l - r, r], ch = [t, f.h - t - b, b], dw = [l / 2, w - (l + r) / 2, r / 2], dh = [t / 2, h - (t + b) / 2, b / 2]; let sy = f.y, dy = y - h / 2;
    for (let j = 0; j < 3; j++) { let sx = f.x, dx = x - w / 2; for (let i = 0; i < 3; i++) { if (cw[i] > 0 && ch[j] > 0 && dw[i] > 0 && dh[j] > 0) g.drawImage(glass.im, sx, sy, cw[i], ch[j], dx, dy, dw[i], dh[j]); sx += cw[i]; dx += dw[i]; } sy += ch[j]; dy += dh[j]; } };
  const txt = (t, x, y, s, c, align = 'center') => P.label(g, t, x, y, s, c, { font: FONT, align }), wide = (t, s) => { g.save(); g.font = `bold ${s}px ${FONT}`; const w = g.measureText(t).width; g.restore(); return w; };
  const wrap = (t, s, max) => { const out2 = []; let cur = ''; for (const w of t.split(' ')) { if (cur && wide(cur + ' ' + w, s) > max) { out2.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; } out2.push(cur); return out2; };
  const icon = (key, x, y, size) => { const f = icons.j.frames['icon/' + key]; if (!f) return; const k = size * 0.74 / (f.frame.w / 2); g.save(); g.translate(x, y); g.scale(0.5 * k, 0.5 * k); D.pic(g, icons, 'icon/' + key); g.restore(); };
  const slot = (x, y, size, piece2, kind, chosen) => { const k = size / (fr('slot/empty').w / 2); piece(piece2 ? 'slot/' + piece2[1] : 'slot/empty', x, y + 1 * k, k); if (piece2) icon(piece2[0], x, y, size); else if (kind) piece('mark/slot-' + kind, x, y, k); if (chosen) piece('slot/chosen', x, y, k); };
  const button = (x, y, w, h, t, go) => { stretch(go ? 'button/context' : 'button/plain', x, y + 2, w, h + 6); txt(t, x, y, 15, go ? I.onGold : I.text); };
  // the top of the screen and the veil
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, W, H);
  for (const [k, x] of [['menu', 30], ['bag', 286], ['chart', 334], ['hero', 382]]) piece('button/' + k, x, 31);
  P.label(g, 'Lv 5', 62, 30, 16, '#ffffff', { font: FONT, stroke: G.INK, strokeW: 4 }); piece('mark/coin', 122, 30); P.label(g, '9480', 134, 30, 16, '#ffffff', { font: FONT, stroke: G.INK, strokeW: 4 });
  // the frame every window shares
  stretch('panel', F.x + F.w / 2, F.y + F.h / 2, F.w, F.h); stretch('panel/title', CX, F.y + 6, 236, 44); txt('Hero', CX, F.y + 5, 18, I.onGold); piece('button/close', F.x + F.w - 12, F.y + 10);
  const left = F.x + 22, right = F.x + F.w - 22, top = F.y + 82;
  txt('Level 5 Warrior', left, F.y + 46, 16, I.text, 'left'); txt('1380 of 1500 xp', CX + 20, F.y + 46, 13, I.dim); txt('9480 gold', right, F.y + 46, 15, I.gold, 'right');
  g.fillStyle = G.CH.grain; g.fillRect(left, F.y + 61, F.w - 44, 10); g.fillStyle = G.COL.xp; g.fillRect(left + 1, F.y + 62, (F.w - 46) * 0.92, 8);
  // the hero and the nine places on him
  const boxW = fix ? 164 : 150, hx = fix ? CX + 8 : CX; stretch(glass.j.frames.niche ? 'niche' : 'row', CX, top + 73, boxW, 146);      // changed: the box 164 wide, he stands 8 to the right, 4 lower and at 2.0 times, so his longest cutlass and tallest hat stay inside it
  // the hero: his field picture blown up, or (--sheet) the one rendered for this window at twice the pixels (out/hero-sheet, meta.filePx 4)
  const sdir = path.join(R, 'out/hero-sheet'), big = args.includes('--sheet') && fs.existsSync(path.join(sdir, 'hero.json')) ? { hero: await D.atlas(sdir, 'hero'), gear: await D.atlas(sdir, 'gear') } : null, times = fix ? 2.0 : 2.2;
  D.hero(g, big || A, { action: 'stand', facing: 's', i: 0, cutlass: 'corsair', buckler: 'brass', hat: 'feathered' }, hx, top + (fix ? 136 : 132), (big ? 1 / big.hero.j.meta.filePx : 0.5) * times);
  const worn = { hat: ['hat-feathered', 'epic'], coat: ['coat-corsair', 'rare'], weapon: ['cutlass-corsair', 'rare'], shield: ['buckler-brass', 'epic'] };
  const places = [...['hat', 'coat', 'legs', 'boots'].map((k, i) => [k, CX - 122, top + 23 + i * 50]), ...['weapon', 'shield', 'necklace'].map((k, i) => [k, CX + 122, top + 23 + i * 50]), ['trinket', CX + 72, top + 173], ['trinket', CX + 122, top + 173]];
  for (const [kind, x, y] of places) slot(x, y, 46, worn[kind], kind, state === 'worn' && kind === 'weapon');
  txt('trinkets', CX + 44, top + 173, 13, I.dim, 'right');
  ['Health 1420 of 1600', 'A swing 114 to 139', 'Armour 64', 'Crit 10%'].forEach((line, i) => txt(line, i % 2 === 0 ? left + 8 : CX + 22, top + 212 + Math.floor(i / 2) * 20, 14, I.text, 'left'));
  // the bag
  const gy = F.y + 336; txt('Bag 20 of 20', left, gy, 13, I.dim, 'left'); txt('Potions 10 of 10', right, gy, 13, I.dim, 'right');
  const keys = ['cutlass-corsair', 'buckler-iron', 'hat-tricorn', 'coat-sailor', 'buckler-brass', 'hat-feathered', 'cutlass-rusty', 'coat-corsair', 'hat-bandana', 'cutlass-sailor', 'buckler-plank', 'coat-linen'], rars = ['rare', 'uncommon', 'rare', 'uncommon', 'epic', 'epic', 'common', 'rare', 'common', 'uncommon', 'common', 'common'];
  const size = fix ? 44 : 46, gap = 5, gx = CX - (7 * size + 6 * gap) / 2 + size / 2;
  for (let i = 0; i < 20; i++) { const x = gx + (i % 7) * (size + gap), y = gy + 20 + size / 2 + Math.floor(i / 7) * (size + gap); slot(x, y, size, [keys[i % 12], rars[i % 12]], null, state === 'bag' && i === 2); if (i % 3 === 0) { g.beginPath(); g.moveTo(x + 13, y - 19); g.lineTo(x + 19, y - 9); g.lineTo(x + 7, y - 9); g.closePath(); g.fillStyle = '#3fd45a'; g.fill(); g.lineWidth = 1.3; g.strokeStyle = G.INK; g.stroke(); } }
  // the card
  const cy = gy + 20 + 3 * (size + gap) + 4, ch = 124, by = cy + ch + (fix ? 21 : 26); stretch('row', CX, cy + ch / 2, F.w - 28, ch);
  if (state === 'bag') { const half = (F.w - 28) / 2, x1 = CX - half, x2 = CX; g.fillStyle = I.dim; g.globalAlpha = 0.4; g.fillRect(CX - 1, cy + 8, 2, ch - 16); g.globalAlpha = 1;
    const hy = fix ? 41 : 46, r0 = fix ? 73 : 78, rs = fix ? 16 : 17;      // changed: the head 5 higher, the rows from 73 in steps of 16, so a third row ends 12 above the card's foot
    const head = (x0, title, pc, name) => { txt(title, x0 + 10, cy + (fix ? 12 : 13), 13, I.dim, 'left'); slot(x0 + 28, cy + hy, fix ? 38 : 40, pc, null, false); const lines = wrap(name, 14, half - 60); lines.forEach((w, i) => txt(w, x0 + 54, cy + hy + (i - (lines.length - 1) / 2) * 15, 14, P.lighten(G.RARITY[pc[1]], 0.22), 'left')); };
    head(x1, 'In the bag', ['hat-tricorn', 'rare'], 'Black pearl necklace'); head(x2, 'He wears (2nd)', ['hat-feathered', 'epic'], 'Shark tooth necklace');
    [['damage', 13, 10], ['health', 240, 260], ['armour', 12, 12]].forEach(([word, mine, his], i) => { const y = cy + r0 + i * rs, d = mine - his; txt(`${mine} ${word}`, x1 + 10, y, 14, I.text, 'left'); txt(`${his} ${word}`, x2 + 10, y, 14, I.text, 'left');
      if (d === 0) txt('=', x2 - 10, y, 14, I.dim, 'right'); else { const col = d > 0 ? I.good : I.bad, t = String(Math.abs(d)), tw = wide(t, 14); txt(t, x2 - 10, y, 14, col, 'right'); const ax = x2 - 10 - tw - 9, s = d > 0 ? 1 : -1; g.beginPath(); g.moveTo(ax, y - 5 * s); g.lineTo(ax + 6, y + 4 * s); g.lineTo(ax - 6, y + 4 * s); g.closePath(); g.fillStyle = col; g.fill(); } });
    const bs = [['Wear', true], ['Sell 1240', false], ['Drop', false]], bw = fix ? 100 : 104, span = (bs.length - 1) * (bw + 10); bs.forEach(([t, go], i) => button(CX - span / 2 + i * (bw + 10), by, bw, 40, t, go));
  } else if (state === 'worn') { slot(left + 36, cy + 36, 52, ['cutlass-corsair', 'rare'], null, false); txt("Corsair's cutlass", left + 76, cy + 18, 17, P.lighten(G.RARITY.rare, 0.22), 'left'); txt('Worn · rare cutlass', left + 76, cy + 38, 13, I.dim, 'left'); txt('Damage 9 to 13', left + 76, cy + 58, 15, I.text, 'left'); txt('He wears this now.', left + 8, cy + 84, 13, I.dim, 'left'); txt('Worth 420 gold at the stall', left + 8, cy + 106, 13, I.dim, 'left'); button(CX, by, 104, 40, 'Take off', false);
  } else { txt('Tap a piece to look at it.', CX, cy + 46, 15, I.dim); txt('Tap what he wears to take it off.', CX, cy + 70, 13, I.dim); const felled = 'Felled: Sand crab 128, Reef gull 64, Coconut crab 12  ·  Falls: 3';
    if (fix) { txt('Felled: Sand crab 128, Reef gull 64, Coconut crab 12', CX, by - 9, 13, I.dim); txt('Falls: 3', CX, by + 8, 13, I.dim); } else txt(felled, CX, by, 13, I.dim); }      // changed: two lines, the falls on their own
  P.save(cv, out); console.log('wrote', out);
  const crop = opt('crop'); if (crop) { const [x, y, w, h, z] = crop.split(',').map(Number), c2 = P.createCanvas(w * z, h * z), g2 = c2.getContext('2d'); g2.imageSmoothingEnabled = true; g2.imageSmoothingQuality = 'high'; g2.drawImage(cv, x * S, y * S, w * S, h * S, 0, 0, w * z, h * z); P.save(c2, out.replace(/\.png$/, '-crop.png')); }
}
main().catch(e => { console.error(e); process.exit(1); });
