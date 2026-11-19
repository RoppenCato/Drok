// rig.js: a figure on a skeleton (the template's, from Zite's hybrid rig by Mitch, AD, 2026-11-01, and FapleGlory's mage
// by Harold, AD, 2026-11-04; rules.md 7 to 9 and 52). Robin, on the mage posed by hand: "you need to get the rigging of the
// characters arms and legs correct"; on the rig: "Yeah thats a lot better."
//
// What it gives: ONE skeleton of named joints; two bones of fixed length per limb; a solver that places the elbow or the
// knee from where the hand or the foot goes; a limb as one smooth shape round its three joints; a walk cycle and a breath
// from one formula; poses as plain objects, blended with lerp; and a writer for the clips as sheets (a PNG per clip, one
// row, the browser starter's meta.json) plus a render dir for pack.js. The drawing of the parts is the game's: a draw
// function takes a solved pose and paints the parts in depth order with the game's hand. The worked example is
// FapleGlory's `Art Director\tools\rig\mage.js` (the mage: robe, hat, staff, the face from rules.md 51).
//
//   const R = require('./rig.js');
//   const base = R.skeleton({ hF: [17, -46] });                 // the rest pose, in figure units, the feet at 0, facing right
//   const clips = { idle: { fps: 8, frames: R.breath(base, 6) }, walk: { fps: 12, frames: R.walkCycle(base, 8) } };
//   R.writeSheets(clips, drawPose, { scale: 0.66, cell: { w: 160, h: 130, ax: 80, ay: 124 }, out, render, px: 3, hit });
//
// The rules the rig keeps (Zite's, Robin's words): one view for the whole figure, the face follows the body; the near
// limbs (the viewer's side) in front, the far ones behind; a held thing turns with the hand and never crosses the face
// (a raised weapon rises beside the head on the near side); the feet are the origin of every frame; bone lengths never
// change between poses; a hand or foot asked beyond the bones' reach is held at their full length.
const P = require('./paint.js'); const fs = require('fs'); const path = require('path');

// ---------------------------------------------------------------- the skeleton
// bone lengths in figure units, one for every pose; override per game (a chibi has short arms, a knight long ones)
const BONES = { upper: 15, fore: 13, thigh: 13, shin: 12 };
// the rest pose: a figure about 97 units to the top of the head, facing right, in a three-quarter view; near = the viewer's side (screen-left), far = past the torso
const REST = {
  hip: [0, -30], neck: [2, -56], head: [2, -79],
  shF: [-11, -52], hF: [17, -46],       // the near shoulder and hand
  shB: [13, -52], hB: [21, -28],        // the far shoulder and hand
  hipF: [-5, -30], footF: [-8, 0], hipB: [6, -30], footB: [7, -1],
  feetA: [0, 0], tilt: 0, lie: 0, mood: 'ok'
};
function skeleton(over = {}, rest = REST) { return { ...rest, ...over }; }
const vec = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
// blend two poses: points and numbers slide, everything else switches at the middle
function lerp(A, B, k) { const J = {}; for (const key of Object.keys(A)) { const a = A[key], b = B[key] === undefined ? a : B[key]; J[key] = Array.isArray(a) ? (Array.isArray(a[0]) ? a : vec(a, b, k)) : typeof a === 'number' ? a + (b - a) * k : (k < 0.5 ? a : b); } return J; }
// move a set of joints together (the upper body in a breath, everything above the hips in a bob)
function shift(J, keys, dx, dy) { const K = { ...J }; for (const k of keys) K[k] = [J[k][0] + dx, J[k][1] + dy]; return K; }
const UPPER_BODY = ['neck', 'head', 'shF', 'hF', 'shB', 'hB'], ABOVE_HIPS = ['hip', 'hipF', 'hipB', ...UPPER_BODY];

// ---------------------------------------------------------------- the solver
// the middle joint for a root, an end and two lengths; side +1 bends it to the right of the root-to-end line, -1 to the left
function ik(root, end, L1, L2, side) {
  const dx = end[0] - root[0], dy = end[1] - root[1], L = Math.max(0.01, Math.min(L1 + L2 - 0.01, Math.hypot(dx, dy))), ux = dx / L, uy = dy / L;
  const a = (L1 * L1 - L2 * L2 + L * L) / (2 * L), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  return [root[0] + ux * a - uy * h * side, root[1] + uy * a + ux * h * side];
}
// the end of a limb held at the bones' full length when the pose asks more
function reach(root, end, L) { const dx = end[0] - root[0], dy = end[1] - root[1], d = Math.hypot(dx, dy); return d <= L ? end : [root[0] + dx / d * L, root[1] + dy / d * L]; }
// elbows bend back and down (the lower of the two answers), knees bend forward (the one further toward the facing)
function solve(J0, B = BONES) {
  const J = { ...J0, hF: reach(J0.shF, J0.hF, B.upper + B.fore - 0.5), hB: reach(J0.shB, J0.hB, B.upper + B.fore - 0.5), footF: reach(J0.hipF, J0.footF, B.thigh + B.shin - 0.5), footB: reach(J0.hipB, J0.footB, B.thigh + B.shin - 0.5) };
  const elbow = (sh, hd) => { const a = ik(sh, hd, B.upper, B.fore, 1), b = ik(sh, hd, B.upper, B.fore, -1); return a[1] > b[1] ? a : b; };
  const knee = (hp, ft) => { const a = ik(hp, ft, B.thigh, B.shin, 1), b = ik(hp, ft, B.thigh, B.shin, -1); return a[0] > b[0] ? a : b; };
  return { ...J, elF: elbow(J.shF, J.hF), elB: elbow(J.shB, J.hB), kneeF: knee(J.hipF, J.footF), kneeB: knee(J.hipB, J.footB) };
}

// ---------------------------------------------------------------- the shapes
// a smooth closed path through points (Catmull-Rom), for limbs, hems and anything that must flow round joints
const smoothPath = (pts, k = 0.5) => g => { const n = pts.length; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 0; i < n; i++) { const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]; g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * k / 3, p1[1] + (p2[1] - p0[1]) * k / 3, p2[0] - (p3[0] - p1[0]) * k / 3, p2[1] - (p3[1] - p1[1]) * k / 3, p2[0], p2[1]); } g.closePath(); };
// a limb as one shape round its three joints: the root's cap, the middle joint, the end, each its own half-width
function limbPath(a, m, b, wa, wm, wb) {
  const nrm = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1; return [-dy / L, dx / L, dx / L, dy / L]; };
  const [n1x, n1y, u1x, u1y] = nrm(a, m), [n2x, n2y, u2x, u2y] = nrm(m, b), nx = (n1x + n2x) / 2, ny = (n1y + n2y) / 2;
  return smoothPath([[a[0] - u1x * wa * 0.7, a[1] - u1y * wa * 0.7], [a[0] + n1x * wa, a[1] + n1y * wa], [m[0] + nx * wm, m[1] + ny * wm], [b[0] + n2x * wb, b[1] + n2y * wb], [b[0] + u2x * wb * 0.6, b[1] + u2y * wb * 0.6], [b[0] - n2x * wb, b[1] - n2y * wb], [m[0] - nx * wm, m[1] - ny * wm], [a[0] - n1x * wa, a[1] - n1y * wa]], 0.6);
}
// the angle of a bone, for a part that turns with it (a hand, a boot, a held thing)
const angleOf = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
// where a held thing's point lands: hd the hand, L along the thing, a its lean from straight up (positive leans forward)
const alongHeld = (hd, L, a) => [hd[0] + L * Math.sin(a), hd[1] - L * Math.cos(a)];

// ---------------------------------------------------------------- the cycles
// a breath: the upper body rises and settles over n frames; o.sway(J, s) may add the late parts (a hat's tip, a scarf)
function breath(base, n = 6, o = {}) { return Array.from({ length: n }, (_, i) => { const s = Math.sin(i / n * Math.PI * 2), J = shift(base, UPPER_BODY, 0, -(o.rise || 1.6) * s); return o.sway ? o.sway(J, s) : J; }); }
// one stride over n frames: the near foot forward at a quarter, the lift on the cosine, a bob, the far hand swinging against the near foot;
// o.swing the feet's half travel (14), o.lift (5), o.bob (1.6), o.nearHand how much the near hand follows (0.2: it holds something), o.extra(J, s, c)
function walkCycle(base, n = 8, o = {}) {
  const swing = o.swing || 14, lift = o.lift || 5, bobK = o.bob || 1.6, nearK = o.nearHand === undefined ? 0.2 : o.nearHand;
  return Array.from({ length: n }, (_, i) => {
    const t = i / n, s = Math.sin(t * 2 * Math.PI), c = Math.cos(t * 2 * Math.PI), bob = -bobK * (1 - Math.abs(s)) + bobK * 0.25;
    let J = shift(base, ABOVE_HIPS, 1, bob);
    J.footF = [base.footF[0] + 2 + swing * s, base.footF[1] - lift * Math.max(0, c)]; J.footB = [base.footB[0] - 2 - swing * s, base.footB[1] - lift * Math.max(0, -c)];
    J.feetA = [0.4 * Math.max(0, c), 0.4 * Math.max(0, -c)];
    J.hF = [J.hF[0] - 15 * nearK * s, J.hF[1] + 7 * nearK * s]; J.hB = [J.hB[0] + 7 * s, J.hB[1] - 2 * Math.abs(s)];
    return o.extra ? o.extra(J, s, c) : J;
  });
}
// the stride the game needs for a walk picked by distance: units per cycle, for a figure drawn at `scale` px a figure unit on a screen of `unitPx` px a unit
const strideUnits = (swing, scale, unitPx) => Math.round(4 * swing * scale / unitPx);

// ---------------------------------------------------------------- the sheets
// clips: { name: { fps, frames: [pose...], loop?, cell? } }; draw(g, solvedPose) paints the figure with its feet at (0, 0) facing right;
// o: scale (px a figure unit), cell {w, h, ax, ay} (the frame and the anchor at the feet), out (the sheet folder), render (frames + meta.json
// for pack.js), px (the game's px a unit), hit {clip: {x, y, w, h}} in units from the feet, layers (names; one 'body' when not split), stride
function writeSheets(clips, draw, o) {
  const cell0 = o.cell, scale = o.scale || 1; fs.mkdirSync(o.out, { recursive: true }); if (o.render) fs.mkdirSync(o.render, { recursive: true });
  const widest = Object.values(clips).reduce((m, C) => { const c = C.cell || cell0; return { w: Math.max(m.w, c.w), h: Math.max(m.h, c.h), ax: Math.max(m.ax, c.ax), ay: Math.max(m.ay, c.ay) }; }, { w: 0, h: 0, ax: 0, ay: 0 });
  const anims = {}, renderMeta = { origin: [widest.ax, widest.ay], px: 1, actions: {} };
  for (const [clip, C] of Object.entries(clips)) {
    const cell = C.cell || cell0, sheet = P.createCanvas(cell.w * C.frames.length, cell.h), sg = sheet.getContext('2d'), delay = Math.round(1000 / C.fps);
    renderMeta.actions[clip] = { delay, loop: C.loop !== undefined ? C.loop : (clip === 'idle' || clip === 'walk' || clip === 'stand' || clip === 'move'), frames: [] };
    C.frames.forEach((J, i) => {
      const cv = P.createCanvas(cell.w, cell.h), g = cv.getContext('2d'); g.save(); g.translate(cell.ax, cell.ay); g.scale(scale, scale); draw(g, solve(J, o.bones || BONES)); g.restore();
      sg.drawImage(cv, i * cell.w, 0);
      if (o.render) {
        const big = P.createCanvas(widest.w, widest.h); big.getContext('2d').drawImage(cv, widest.ax - cell.ax, widest.ay - cell.ay);
        const file = `${clip}_${String(i).padStart(2, '0')}.png`; P.save(big, path.join(o.render, file));
        const hb = (o.hit || {})[clip]; renderMeta.actions[clip].frames.push({ file, delay, lt: hb ? [widest.ax + hb.x * (o.px || 1), widest.ay + hb.y * (o.px || 1)] : undefined, rb: hb ? [widest.ax + (hb.x + hb.w) * (o.px || 1), widest.ay + (hb.y + hb.h) * (o.px || 1)] : undefined });
      }
    });
    P.save(sheet, path.join(o.out, clip + '.png'));
    anims[clip] = { frames: C.frames.length, fps: C.fps, sheets: {} }; for (const l of (o.layers || ['body'])) anims[clip].sheets[l] = clip + '.png';
    if (C.stride) anims[clip].stride = C.stride;
    if (C.cell) { anims[clip].frame = { w: cell.w, h: cell.h }; anims[clip].anchor = { x: cell.ax, y: cell.ay }; }
  }
  const meta = { px: o.px || 1, frame: { w: cell0.w, h: cell0.h }, anchor: { x: cell0.ax, y: cell0.ay }, dirs: 1, layers: o.layers || ['body'], anims, hit: o.hit || {} };
  fs.writeFileSync(path.join(o.out, 'meta.json'), JSON.stringify(meta, null, 1)); if (o.render) fs.writeFileSync(path.join(o.render, 'meta.json'), JSON.stringify(renderMeta, null, 1));
  return meta;
}
module.exports = { BONES, REST, UPPER_BODY, ABOVE_HIPS, skeleton, lerp, shift, ik, reach, solve, smoothPath, limbPath, angleOf, alongHeld, breath, walkCycle, strideUnits, writeSheets };
