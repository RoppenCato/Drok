// dress.js: the Warrior drawn the way the game draws him (Leonard, AD, 2026-11-20): one body frame from out/hero, and the
// cutlass, the buckler and the hat from out/gear put on the points that frame carries. The studio's judging pictures use
// it, and it is the reference for Victor, GD's drawer: if this picture is right, the data is right.
//   const D = require('./dress.js'); const A = await D.load(); D.hero(g, A, { action: 'stand', facing: 'se', i: 0, cutlass: 'rusty', buckler: 'plank', hat: 'bandana' }, x, y, scale)
// facing may be any of the eight: sw, w and nw are se, e and ne flipped. x, y is where his feet stand, in the context's own
// units; scale is context units a file pixel (0.5 draws 2x files at their design size).
const P = require('./paint.js'); const fs = require('fs'); const path = require('path');
const FLIP = { sw: 'se', w: 'e', nw: 'ne' };
async function atlas(dir, name) { const j = JSON.parse(fs.readFileSync(path.join(dir, name + '.json'), 'utf8')); return { j, im: await P.loadImage(path.join(dir, j.meta.image)) }; }
async function load(root = P.ROOT) { return { hero: await atlas(path.join(root, 'out/hero'), 'hero'), gear: await atlas(path.join(root, 'out/gear'), 'gear') }; }
// one picture of an atlas with its origin at (0, 0)
function pic(g, A, key) { const f = A.j.frames[key]; if (!f) throw new Error('no picture ' + key); const { x, y, w, h } = f.frame; g.drawImage(A.im, x, y, w, h, -f.pivot.x * w, -f.pivot.y * h, w, h); }
function frameOf(A, action, facing, i) { const fr = A.j.actions[action].frames.filter(f => f.facing === facing); return fr[((i % fr.length) + fr.length) % fr.length]; }
function hero(g, A, o, x, y, scale = 0.5) {
  const flip = !!FLIP[o.facing], fc = FLIP[o.facing] || o.facing, F = frameOf(A.hero, o.action, fc, o.i || 0), pts = F.points || {};
  const piece = (pt, key, turn) => { if (!pt || !key) return; g.save(); g.translate(pt.x, pt.y); g.rotate(turn * Math.PI / 180); pic(g, A.gear, key); g.restore(); };
  const parts = [   // what rides where: the buckler on off, the cutlass on hand, the hat on head; each behind or over the body as its point says
    { pt: pts.off, key: o.buckler && `buckler-${o.buckler}/${fc}`, turn: pts.off ? pts.off.r : 0 },
    { pt: pts.hand, key: o.cutlass && `cutlass-${o.cutlass}`, turn: pts.hand ? pts.hand.r : 0 },
    { pt: pts.head, key: o.hat && `hat-${o.hat}/${fc}`, turn: pts.head ? pts.head.r : 0 }];
  g.save(); g.translate(x, y); g.scale(flip ? -scale : scale, scale); if (F.a0 !== undefined) g.globalAlpha = (F.a0 + F.a1) / 510;
  for (const p of parts) if (p.pt && !p.pt.front) piece(p.pt, p.key, p.turn);
  pic(g, A.hero, F.name);
  for (const p of parts) if (p.pt && p.pt.front) piece(p.pt, p.key, p.turn);
  g.restore(); return F;
}
// a figure with no gear (a monster): the same call without the pieces
function figure(g, A, o, x, y, scale = 0.5) { const flip = !!FLIP[o.facing], fc = FLIP[o.facing] || o.facing, F = frameOf(A, o.action, fc, o.i || 0); g.save(); g.translate(x, y); g.scale(flip ? -scale : scale, scale); if (F.a0 !== undefined) g.globalAlpha = (F.a0 + F.a1) / 510; pic(g, A, F.name); g.restore(); return F; }
module.exports = { load, atlas, pic, frameOf, hero, figure, FLIP };
