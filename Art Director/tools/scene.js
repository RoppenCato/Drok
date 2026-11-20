// scene.js: a judging picture drawn the way the game draws (Leonard, AD, 2026-11-20): a place's ground at double size, its
// props and the figures sorted by where their feet stand, flat shadows, the glass on top at the game's own places.
// The glass is laid out as the game's hud.ts has it since Robin's first play (2026-11-20: "the buttons should be in the
// middle at the bottom"; health "at the bottom"): level and money top left; bag, chart and hero top right; in the middle
// at the bottom the pile: experience along the floor, Charge, Cleave and the potion in a row, rage and health over them,
// who he fights over those. The Warrior stands 45 above the screen's middle (60 while the pile held his bars). --pile mine draws the pile as Leonard, AD
// would stack it. Everything comes from out/ as delivered, so if this picture is right the deliveries are right.
// --pile bare is the pile when his own bars go with him over his head (Robin, 2026-11-20; the game's three ways to try):
// the plate with the name only, the discs, experience. --over <file.js> calls that module's draw(g, c) after the
// figures, for a sketch of a piece that is not in out/ yet (c: sx, sy, hero, heroTop, piece, pill, P, G, W, H).
// With --pile bare his own bar is drawn over his head from out/glass (Robin, 2026-11-20: "I think 4, but the heart isnt
// needed"); --own 0.76,0.84 sets his health and rage, --own none leaves the bar out (for a sketch with --over).
// --c1 dx,dy puts the crab he fights there from his feet (62,20 if not said). --clear tries a rule (Leonard, AD): a
// monster's bar never lies on his head or his bar; one that would is lifted to sit right above his bar.
//   node tools/scene.js <out.png> [--place crab-cay] [--mob reef-gull] [--lv 3] [--no-mobs] [--at 640,2040] [--no-glass] [--pile mine|bare] [--own 0.76,0.84|none] [--c1 62,20] [--clear] [--no-arrow] [--over work/x.js] [--stick 300,560] [--use "Open chest"] [--crop x,y,w,h,zoom]
const P = require('./paint.js'); const D = require('./dress.js'); const fs = require('fs'); const path = require('path');
const G = require('./glass.js');
const W = P.JUDGE.w, H = P.JUDGE.h, FONT = 'Trebuchet MS';
async function main() {
  const args = process.argv.slice(2), out = args[0], opt = k => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : null; };
  const at = (opt('at') || '640,2040').split(',').map(Number), S = 2, R = P.ROOT, mine = opt('pile') === 'mine', bare = opt('pile') === 'bare', arrow = !args.includes('--no-arrow');
  // --place crab-cay: another place than the small island, from out/<place> or, until it is delivered, work/<place>; its ground may be at less than a pixel a unit (place.json: ground.px)
  const pname = opt('place') || 'island', pdir = path.join(R, fs.existsSync(path.join(R, 'out', pname, 'place.json')) ? 'out' : 'work', pname), mob = opt('mob') || 'sand-crab', mobs = !args.includes('--no-mobs'), mobName = { 'sand-crab': 'Sand crab', 'reef-gull': 'Reef gull', 'coconut-crab': 'Coconut crab' }[mob] || mob, mobLv = 'Lv ' + (opt('lv') || 1);
  const place = JSON.parse(fs.readFileSync(path.join(pdir, 'place.json'), 'utf8')), ground = await P.loadImage(path.join(pdir, 'ground.png')), gp = (place.ground && place.ground.px) || 1;
  const A = await D.load(), isl = await D.atlas(fs.existsSync(path.join(pdir, 'island.json')) ? pdir : path.join(R, 'out/island'), 'island'), crab = await D.atlas(path.join(R, 'out', mob), mob), glass = await D.atlas(path.join(R, 'out/glass'), 'glass');
  const loot = fs.existsSync(path.join(R, 'out/loot/loot.json')) ? await D.atlas(path.join(R, 'out/loot'), 'loot') : null;
  const cv = P.createCanvas(W * S, H * S), g = cv.getContext('2d'); g.scale(S, S); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  const cam = [at[0] - W / 2, at[1] - (H / 2 - 45)], sx = x => x - cam[0], sy = y => y - cam[1];
  // the ground: one pixel a unit, drawn at two; below the place's foot the game draws out the picture's last row
  const gh = Math.max(0, Math.min(H, ground.height / gp - cam[1])); if (gh > 0) g.drawImage(ground, cam[0] * gp, cam[1] * gp, W * gp, gh * gp, 0, 0, W, gh); if (gh < H) g.drawImage(ground, cam[0] * gp, ground.height - 1, W * gp, 1, 0, gh, W, H - gh);
  const shadow = (x, y, rx, ry) => { g.save(); g.globalAlpha = 0.24; g.fillStyle = '#5b4a82'; g.beginPath(); g.ellipse(sx(x) + rx * 0.2, sy(y) + 1, rx, ry, 0, 0, 7); g.fill(); g.restore(); };
  const sprite = (At, key, x, y) => { g.save(); g.translate(sx(x), sy(y)); g.scale(0.5, 0.5); D.pic(g, At, key); g.restore(); };
  // the glass's pieces: one as it is; a pill cut left and right, w long, k times its own height, its middle at y
  const fr = key => glass.j.frames[key].frame, it = key => glass.j.items[key];
  const piece = (key, x, y, k = 1) => { g.save(); g.translate(x, y); g.scale(0.5 * k, 0.5 * k); D.pic(g, glass, key); g.restore(); };
  const pill = (key, x, y, w, k = 1) => { const f = fr(key), [l, , r] = it(key).slice, pw = Math.round(w / k * 2); if (pw < l + r) return; const t = P.createCanvas(pw, f.h), q = t.getContext('2d');   // put together at its own pixels, then drawn as one picture: no seams
    q.drawImage(glass.im, f.x, f.y, l, f.h, 0, 0, l, f.h); q.drawImage(glass.im, f.x + l, f.y, f.w - l - r, f.h, l, 0, pw - l - r, f.h); q.drawImage(glass.im, f.x + f.w - r, f.y, r, f.h, pw - r, 0, r, f.h); g.drawImage(t, x, y - f.h / 4 * k, w, f.h / 2 * k); };
  const txt = (t, x, y, s, c, o = {}) => P.label(g, t, x, y, s, c, { font: FONT, ...o });
  const white = (t, x, y, s, o = {}) => txt(t, x, y, s, '#ffffff', { stroke: G.INK, strokeW: s > 13 ? 4 : 3, ...o });
  // a bar of the glass: the well w long with its middle at y, a round-ended fill inside (and the pale part a blow just took)
  const bar = (kind, x, y, w, part, k = 1, lost = 0) => { pill('bar/well', x, y, w, k); const full = w - 6 * k; if (lost > part) pill('fill/lost', x + 3 * k, y - k, full * lost, k); if (part > 0) pill('fill/' + kind, x + 3 * k, y - k, Math.max(10 * k, full * part), k); };
  // the bar over a monster: w is the fill's whole length; the one he fights a fifth bigger, with the gold rim and the arrow
  const mobBar = (x, y, w, part, lost, fought) => { const k = fought ? 1.2 : 1, key = fought ? 'mob/well-mine' : 'mob/well', inset = it(key).inset * k, full = w * k, x0 = x - full / 2; pill(key, x0 - inset, y, full + inset * 2, k); if (lost > part) pill('mob/lost', x0, y, full * lost, k); if (part > 0) pill('mob/hp', x0, y, Math.max(5 * k, full * part), k); if (fought && arrow) piece('mark/mine', x, y - 16); };
  // his own bar: the back, the flat fills in its two rooms (the pale one is what a blow just took), the frame on top
  const flat = (key, x, y, w, h) => { const f = fr(key); g.drawImage(glass.im, f.x + 1, f.y, f.w - 2, f.h, x, y, w, h); };
  const ownBar = (x, y, w, hp, rage, lost = 0) => { const r = it('own/frame').rooms, x0 = x - w / 2, y0 = y - fr('own/frame').h / 4, full = w - 2 * r.hp.x; pill('own/back', x0, y, w); if (lost > hp) flat('own/lost', x0 + r.hp.x, y0 + r.hp.y, full * lost, r.hp.h); if (hp > 0) flat('own/hp', x0 + r.hp.x, y0 + r.hp.y, full * hp, r.hp.h); if (rage > 0) flat('own/rage', x0 + r.rage.x, y0 + r.rage.y, full * rage, r.rage.h); pill('own/frame', x0, y, w); };
  // who is where: the hero in the middle, a crab he fights winding up, a hurt one coming, a whole one idling
  const hero = { x: at[0], y: at[1] }, c1o = (opt('c1') || '62,20').split(',').map(Number), c1 = { x: at[0] + c1o[0], y: at[1] + c1o[1], f: { action: 'attack1', facing: 'nw', i: 2 } }, c2 = { x: at[0] - 96, y: at[1] + 70, f: { action: 'move', facing: 'e', i: 1 } }, c3 = { x: at[0] + 120, y: at[1] - 150, f: { action: 'stand', facing: 's', i: 0 } }, drop = { x: at[0] + 70, y: at[1] - 70 }, coins = { x: at[0] - 30, y: at[1] + 150 };
  const has = new Set(crab.j.meta.facings || ['s', 'se', 'e', 'ne', 'n']), fit = f => has.has(D.FLIP[f] || f) ? f : ({ nw: 'w', ne: 'e', sw: 'w', se: 'e' }[f] || 's'); for (const c of [c1, c2, c3]) c.f.facing = fit(c.f.facing);
  const things = [];
  for (const p of place.props) { const f = isl.j.frames[p.name]; if (!f) continue; if (sx(p.x) < -160 || sx(p.x) > W + 160 || sy(p.y) < -60 || sy(p.y) > H + 300) continue; things.push({ y: p.y, shadow: () => shadow(p.x, p.y, f.frame.w * 0.16, f.frame.w * 0.055), draw: () => sprite(isl, p.name, p.x, p.y) }); }
  things.push({ y: hero.y, shadow: () => shadow(hero.x, hero.y, 15, 6), draw: () => D.hero(g, A, { action: 'stand', facing: 'se', i: 0, cutlass: 'rusty', buckler: 'plank', hat: 'bandana' }, sx(hero.x), sy(hero.y), 0.5) });
  if (mobs) for (const c of [c1, c2, c3]) things.push({ y: c.y, shadow: () => shadow(c.x, c.y, 17, 7), draw: () => D.figure(g, crab, c.f, sx(c.x), sy(c.y), 0.5) });
  if (mobs) piece('mark/target', sx(c1.x), sy(c1.y) + 2);                                                  // the ring under the one he fights
  if (loot) { for (const [key, q, rar] of [['gear', drop, 'rare'], ['coins', coins, null]]) { if (rar) { g.save(); g.translate(sx(q.x), sy(q.y)); g.scale(0.5, 0.5); D.pic(g, loot, 'ring/' + rar); g.restore(); } things.push({ y: q.y, shadow: () => shadow(q.x, q.y, 8, 3), draw: () => sprite(loot, key, q.x, q.y) }); } }
  things.sort((a, b) => a.y - b.y); for (const t of things) t.shadow(); for (const t of things) t.draw();
  // over the monsters: a bar on the one he fights and on any that is hurt, at one height for the kind (its standing picture's)
  const o0 = D.frameOf(crab, 'stand', 's', 0).origin, top = (o0.y !== undefined ? o0.y : o0[1]) / 2;
  const h0 = D.frameOf(A.hero, 'stand', 's', 0).origin, heroTop = (h0.y !== undefined ? h0.y : h0[1]) / 2, own = opt('own') || '0.76,0.84', ownOn = bare && own !== 'none', ownY = Math.round(sy(hero.y) - heroTop - 13);
  // --clear: his bar and his head are a box no monster's bar lies on; a bar that would is lifted to sit right above his bar
  const lift = (x, y, w, k) => { if (!ownOn || !args.includes('--clear')) return y; const hw = w * k / 2 + 6 * k, hh = 8.5 * k, hx = sx(hero.x), dx = Math.abs(x - hx), onBar = dx < hw + 26 && y + hh > ownY - 5.5 && y - hh < ownY + 5.5, onFace = dx < hw + 4 && y + hh > ownY + 7.5 && y - hh < sy(hero.y) - heroTop + 28; return onBar || onFace ? ownY - 7.5 - 2 - hh : y; };   // his bar is 52 by 15; the middle of his face 8 wide, down to his chin: a bar that only grazes his head from the side stays
  const y1 = lift(sx(c1.x), sy(c1.y) - top - 14, 44, 1.2), y2 = lift(sx(c2.x), sy(c2.y) - top - 12, 44, 1);
  if (mobs) { mobBar(sx(c1.x), y1, 44, 0.45, 0.62, true); mobBar(sx(c2.x), y2, 44, 0.7, 0, false);
  white('14', sx(c1.x) + (y1 < sy(c1.y) - top - 14 ? 44 : 30), y1 - 20, 20, { align: 'center' }); }   // a blow's number goes with the bar
  if (ownOn) { const [hp, rage, lost] = own.split(',').map(Number); ownBar(Math.round(sx(hero.x)), ownY, it('own/frame').length, hp, rage, lost || 0); }   // over the monsters' bars, at one height: his standing picture's
  const over = opt('over'); if (over) { const h0 = D.frameOf(A.hero, 'stand', 's', 0).origin; require(path.resolve(over)).draw(g, { sx, sy, hero, heroTop: (h0.y !== undefined ? h0.y : h0[1]) / 2, piece, pill, P, G, W, H }); }                       // a blow's number rises beside the bar, not over it
  if (!args.includes('--no-glass')) {
    // the top: the menu, his level and money; bag, chart and hero
    piece('button/menu', 30, 30); white('Lv 2', 62, 30, 16); piece('mark/coin', 122, 30); white('86', 134, 30, 16);
    piece('button/bag', 286, 30); piece('button/chart', 334, 30); piece('button/hero', 382, 30);
    // the pile in the middle at the bottom
    const ROW_Y = H - 64, BAR_W = 200, BAR_X = (W - BAR_W) / 2, XP_Y = H - 14, RAGE_Y = ROW_Y - 54, HP_Y = RAGE_Y - 20, PLATE_Y = HP_Y - 38, USE_Y = PLATE_Y - 50;
    const discs = () => { for (const [key, dx, r] of [['charge', -84, 36], ['cleave', 0, 36], ['potion', 78, 28]]) { const x = W / 2 + dx, y = ROW_Y + (36 - r); piece('skill/' + key, x, y, r * 2 / 76); if (key === 'potion') white('3', x + r * 0.55, y + r * 0.6, 13, { align: 'center' }); } };
    if (bare) {    // his own bars go with him: the pile is the plate with the name, the discs and experience
      bar('xp', BAR_X, XP_Y, BAR_W, 0.38, 0.72); discs(); if (mobs) { pill('plate', BAR_X, ROW_Y - 62, BAR_W); txt(mobName, W / 2 - 84, ROW_Y - 67, 14, G.INK); txt(mobLv, W / 2 + 84, ROW_Y - 67, 12, '#7a6a80', { align: 'right' }); }
    } else if (!mine) {   // as the game stacked it first (Victor, GD, 710cb4c), with the round fills
      bar('xp', BAR_X, XP_Y, BAR_W, 0.38); discs(); bar('rage', BAR_X, RAGE_Y, BAR_W, 0.45); bar('hp', BAR_X, HP_Y, BAR_W, 0.87); white('87 / 100', W / 2, HP_Y, 12, { align: 'center' });
      pill('plate', BAR_X, PLATE_Y, BAR_W); txt('Sand crab', W / 2 - 84, PLATE_Y - 5, 14, G.INK); txt('Lv 1', W / 2 + 84, PLATE_Y - 5, 12, '#7a6a80', { align: 'right' }); bar('hp', W / 2 - 88, PLATE_Y + 14, 176, 0.45, 1, 0.62);
    } else {       // mine: his health the biggest thing with a heart on its end; the monster's bar dark, as over its head
      bar('xp', BAR_X, XP_Y, BAR_W, 0.38, 0.72); discs();
      bar('rage', BAR_X + 16, RAGE_Y + 3, BAR_W - 16, 0.45, 0.8); bar('hp', BAR_X, HP_Y - 2, BAR_W, 0.87, 1.3); piece('mark/heart', BAR_X + 3, HP_Y - 3, 1); white('87 / 100', W / 2 + 6, HP_Y - 3.5, 14, { align: 'center' });
      pill('plate', BAR_X, PLATE_Y - 6, BAR_W); txt('Sand crab', W / 2 - 84, PLATE_Y - 11, 14, G.INK); txt('Lv 1', W / 2 + 84, PLATE_Y - 11, 12, '#7a6a80', { align: 'right' });
      { const k = 1.2, key = 'mob/well-mine', inset = it(key).inset * k, full = 172, x0 = W / 2 - full / 2, y = PLATE_Y + 9; pill(key, x0 - inset, y, full + inset * 2, k); pill('mob/lost', x0, y, full * 0.62, k); pill('mob/hp', x0, y, full * 0.45, k); }
    }
    const use = opt('use'); if (use) { pill('button/context', W / 2 - 78, USE_Y - (mine ? 6 : 0), 156); txt(use, W / 2, USE_Y - 3 - (mine ? 6 : 0), 17, G.INK, { align: 'center' }); }
    const stick = opt('stick'); if (stick) { const [x, y] = stick.split(',').map(Number), a = -0.6; piece('stick/ring', x, y); piece('stick/knob', x + Math.cos(a) * 30, y + Math.sin(a) * 30); }
  }
  const crop = opt('crop');
  if (crop) { const [x, y, w, h, z] = crop.split(',').map(Number), c2v = P.createCanvas(w * z, h * z), g2 = c2v.getContext('2d'); g2.imageSmoothingEnabled = true; g2.imageSmoothingQuality = 'high'; g2.drawImage(cv, x * S, y * S, w * S, h * S, 0, 0, w * z, h * z); P.save(c2v, out); }
  else P.save(cv, out);
  console.log('wrote', out);
}
main();
