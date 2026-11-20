// bake.js: the pictures and the data for the moving page of a chest opening (Leonard, AD, 2026-11-20).
// Makes, beside this file: bg.png (the cove's ground at the chest, no chest, no hero, two pixels a unit), hero.png (the
// Warrior standing, facing the chest), chest.png (the chest's three pictures in a row), copies of burst.png and loot.png,
// and writes every frame's place into chest-opening.html between its DATA marks.
//   node concepts/chest-burst/bake.js
const { execFileSync } = require('child_process'); const fs = require('fs'); const path = require('path');
const P = require('../../tools/paint.js'); const D = require('../../tools/dress.js');
const HERE = __dirname, R = P.ROOT, CHEST = [100, 170], HERO = [30, 240], VIEW = [200, 260];
(async () => {
  // the ground: the chest stands at 2275, 850; the camera is put so the chest lands at CHEST and the hero is off the picture
  execFileSync('node', ['tools/scene.js', path.join(HERE, 'bg.png'), '--place', 'crab-cay', '--at', '2275,1092.5', '--no-mobs', '--no-loot', '--no-glass', '--own', 'none', '--swap', 'chest/closed=none', '--crop', `106,0,${VIEW[0]},${VIEW[1]},2`], { cwd: R, stdio: 'inherit' });
  const A = await D.load(), hw = 96, hh = 110, hc = P.createCanvas(hw * 2, hh * 2), hg = hc.getContext('2d'); hg.scale(2, 2);
  D.hero(hg, A, { action: 'stand', facing: 'ne', i: 0, cutlass: 'rusty', buckler: 'plank', hat: 'bandana' }, hw / 2, hh - 14, 0.5); P.save(hc, path.join(HERE, 'hero.png'));
  const isl = await D.atlas(path.join(R, 'out/crab-cay'), 'island'), names = ['chest/closed', 'chest/opening', 'chest/open'], cw = 76, ch = 104, cc = P.createCanvas(cw * 3, ch), cg = cc.getContext('2d'), chest = {};
  names.forEach((n, i) => { const F = isl.j.frames[n], f = F.frame; cg.drawImage(isl.im, f.x, f.y, f.w, f.h, i * cw + 1, 0, f.w, f.h); chest[n.split('/')[1]] = { x: i * cw + 1, y: 0, w: f.w, h: f.h, px: F.pivot.x, py: F.pivot.y }; });
  P.save(cc, path.join(HERE, 'chest.png'));
  const frames = (dir, name) => { const j = JSON.parse(fs.readFileSync(path.join(R, dir, name + '.json'), 'utf8')), o = {}; for (const k in j.frames) { const F = j.frames[k]; o[k] = { x: F.frame.x, y: F.frame.y, w: F.frame.w, h: F.frame.h, px: F.pivot.x, py: F.pivot.y }; } fs.copyFileSync(path.join(R, dir, name + '.png'), path.join(HERE, name + '.png')); return { j, o }; };
  const burst = frames('out/chest-burst', 'burst'), loot = frames('out/loot', 'loot'), rarity = {};
  for (const k of ['common', 'uncommon', 'rare', 'epic']) rarity[k] = { col: loot.j.items['ring/' + k].colour, light: loot.j.items['ring/' + k].light };
  const data = { view: VIEW, chest: CHEST, hero: { at: HERO, w: hw * 2, h: hh * 2, px: 0.5, py: (hh - 14) / hh }, mouth: 18, rarity, frames: { chest, burst: burst.o, loot: loot.o } };
  const page = path.join(HERE, 'chest-opening.html'), s = fs.readFileSync(page, 'utf8'), a = s.indexOf('/*DATA*/'), b = s.indexOf('/*END*/');
  if (a < 0 || b < 0) throw new Error('no DATA marks in chest-opening.html');
  fs.writeFileSync(page, s.slice(0, a + 8) + JSON.stringify(data) + s.slice(b)); console.log('baked the page\'s pictures and data');
})();
