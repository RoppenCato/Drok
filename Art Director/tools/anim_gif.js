// anim_gif.js: a packed figure moving at its real delays (Perry, AD, 2026-10-31): every action in turn, on a piece of the
// stage picture, shown at the judging size (the files' scale halved), fades applied from a0 and a1. Writes a GIF through
// tools/gif.py (PIL). For looking on the PC: GIFs show as stills on Robin's phone, so he gets the moving page instead.
// The stage and the feet's place come from tools/paths.json ("stage") unless given.
//   node tools/anim_gif.js <atlas.json> <out.gif> [--bg work/stage/fight.png] [--at 590,1270] [--size 560] [--actions stand,move,attack1,hit1,die1] [--loops 2]
const fs = require('fs'); const path = require('path'); const { spawnSync } = require('child_process'); const P = require('./paint.js');
const ROOT = P.ROOT; const a = process.argv.slice(2); const [atlas, out] = a; const opt = k => a.includes('--' + k) ? a[a.indexOf('--' + k) + 1] : null;
(async () => {
  const J = JSON.parse(fs.readFileSync(path.resolve(ROOT, atlas), 'utf8')), dir = path.dirname(path.resolve(ROOT, atlas)), ST = P.PATHS.stage || {}, PX = J.meta.filePx || P.FILE_PX;
  const bgFile = path.resolve(ROOT, opt('bg') || ST.file || 'work/stage/fight.png'), [ax, ay] = (opt('at') || (ST.at || [590, 1270]).join(',')).split(',').map(Number), SZ = +(opt('size') || 560), loops = +(opt('loops') || 2);
  const bg = await P.loadImage(bgFile), cv = P.createCanvas(SZ, SZ), g = cv.getContext('2d'); const x0 = Math.round(ax - SZ / 2), y0 = Math.round(ay - SZ * 0.75);
  g.drawImage(bg, x0, y0, SZ, SZ, 0, 0, SZ, SZ); const tmp = path.dirname(path.resolve(ROOT, out)), bgCrop = path.join(tmp, '_gifbg.png'); P.save(cv, bgCrop);   // the scratch files beside the gif, not among the sheets
  const acts = (opt('actions') || Object.keys(J.actions).join(',')).split(',').filter(k => J.actions[k]); const frames = [];
  for (const act of acts) {
    const A = J.actions[act], n = A.loop ? loops : 1;
    for (let k = 0; k < n; k++) for (const F of A.frames) frames.push({ delay: F.delay, text: act, layers: [{ file: path.join(dir, 'frames', F.name.split('/').slice(1).join('_') + '.png'), x: ax - x0 - F.origin.x, y: ay - y0 - F.origin.y, alpha: F.a0 !== undefined ? Math.round((F.a0 + F.a1) / 2) : 255 }] });
  }
  const spec = { w: SZ, h: SZ, bg: bgCrop, scale: 1 / PX, frames }; const specFile = path.join(tmp, '_gif.json'); fs.writeFileSync(specFile, JSON.stringify(spec));
  const r = spawnSync('python', [path.join(__dirname, 'gif.py'), specFile, path.resolve(ROOT, out)], { stdio: 'inherit' }); if (r.status) process.exit(r.status);
})();
