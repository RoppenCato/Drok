// compare.js: the judging picture of a figure (Perry, AD, 2026-10-31; after the Survival game's): the figure beside our
// player on the stage at the judging size (a cut of the laid-out scene), then the key frame of every action at the judging
// size and at 2x on the flat colour, our player for scale. With --before, the game's current sheets in a row above (none
// yet: the first delivery has only an after). The stage and the feet's place in it come from tools/paths.json ("stage").
//   node tools/compare.js <atlas.json> <out.png> [--scene work/stage/fight.png] [--at 590,1270] [--before <dir>]
const fs = require('fs'); const path = require('path'); const P = require('./paint.js'); const { player, load } = require('./player.js');
const ROOT = P.ROOT; const a = process.argv.slice(2); const [atlas, out] = a; const opt = k => a.includes('--' + k) ? a[a.indexOf('--' + k) + 1] : null;
const KEY = { stand: [0], move: [0, 1, 2, 4], hit1: [0], attack1: [3, 5, 6], die1: [3, 4, 7] }, ZOOM = { stand: [0], move: [2], hit1: [0], attack1: [3, 6], die1: [4] };   // every key pose at the judging size; the telling six at 2x
(async () => { await load();
  const J = JSON.parse(fs.readFileSync(path.resolve(ROOT, atlas), 'utf8')), dir = path.dirname(path.resolve(ROOT, atlas)), im = await P.loadImage(path.join(dir, J.meta.image));
  const ST = P.PATHS.stage || {}, name = path.basename(atlas, '.json'), scene = await P.loadImage(path.resolve(ROOT, opt('scene') || ST.file || 'work/stage/fight.png')), [ax, ay] = (opt('at') || (ST.at || [590, 1270]).join(',')).split(',').map(Number);
  const pick = K => { const out = []; for (const [act, idx] of Object.entries(K)) if (J.actions[act]) for (const i of idx) if (J.actions[act].frames[i]) out.push({ act, i, F: J.actions[act].frames[i] }); return out; };
  const frames = pick(KEY), zoomed = pick(ZOOM), PX = J.meta.filePx || P.FILE_PX, JW = P.JUDGE.w;
  const CW = 240, CSSW = Math.max(JW, Math.ceil(120 + frames.length * CW / 2 + 60), Math.ceil(240 + zoomed.length * CW + 60)), W = CSSW * 2, SC_H = 300, ROW1 = 190, ROW2 = 190 * 2 + 40, H = 50 + SC_H + 30 + ROW1 + 30 + ROW2 + 20;
  const cv = P.createCanvas(W, Math.round(H * 2)), g = cv.getContext('2d'); g.scale(2, 2); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.fillStyle = P.FLAT; g.fillRect(0, 0, CSSW, H);
  g.fillStyle = 'rgba(248,236,198,0.95)'; g.fillRect(0, 0, CSSW, 40); P.label(g, name + ': beside our player on the stage, at the judging size; every action\'s key pose below', 10, 20, 12, P.INK);
  // row 0: the scene cut round the figures, 1:1 (the scene is at the files' scale, shown at 1x CSS); the feet about six tenths across and eight tenths down
  const sx = Math.max(0, Math.min(scene.width - JW * PX, ax - JW * PX * 0.6)), sy = Math.max(0, Math.min(scene.height - SC_H * PX, ay - SC_H * PX * 0.78)); g.drawImage(scene, sx, sy, JW * PX, SC_H * PX, 0, 50, JW, SC_H);
  const draw = (F, x, y, s) => { const fr = J.frames[F.name].frame; g.drawImage(im, fr.x, fr.y, fr.w, fr.h, x - F.origin.x * s / PX, y - F.origin.y * s / PX, fr.w * s / PX, fr.h * s / PX); };
  const row = (y, s, list) => { g.strokeStyle = 'rgba(43,35,32,0.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, y); g.lineTo(CSSW, y); g.stroke(); player(g, 40 * s, y, s); list.forEach((f, k) => { const x = 120 * s + k * CW * s / 2; draw(f.F, x, y, s); P.tag(g, f.act + ' ' + f.i, x - 20, y + 14, 10); }); };
  // row 1: every key pose at the judging size (a strip wider than the screen: a sheet of judging-size cuts); row 2: the telling six at 2x
  row(50 + SC_H + 30 + ROW1 - 30, 1, frames); P.tag(g, 'at the judging size (1x CSS)', 8, 50 + SC_H + 30 + 8, 11);
  row(50 + SC_H + 30 + ROW1 + 30 + ROW2 - 50, 2, zoomed); P.tag(g, '2x', 8, 50 + SC_H + 30 + ROW1 + 30 + 8, 11);
  P.save(cv, path.resolve(ROOT, out)); console.log('wrote', out, frames.length, 'key poses');
})();
