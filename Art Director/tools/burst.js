// burst.js: the light of a chest that opens (Leonard, AD, 2026-11-20; the pieces are mine). Robin, 2026-11-20, in Victor,
// GD's chat: "chests should have a cool effect when you open them like in zite." Zite's chest shines in the colour of its
// best prize, shakes, pops and bursts into sparkles of that colour. These are the pieces for that on Drok's field: all
// white, so the game tints each with the rarity's light colour (out/loot: light), and a gold coin that turns.
//   node tools/burst.js                         draws them into work/chest-burst/render with a meta.json
//   node tools/packset.js burst work/chest-burst/render out/chest-burst --tight --width 512
const P = require('./paint.js'); const fs = require('fs'); const path = require('path');
const OUT = path.join(P.ROOT, 'work/chest-burst/render'), S = 2, items = [], W = '#ffffff', a = k => P.alpha(W, k), rnd = P.rng(7);
fs.mkdirSync(OUT, { recursive: true });
// a piece w by h design units; its origin its middle unless said (then it is trimmed and the origin is that point)
const piece = (name, w, h, draw, data = {}, origin) => { const cv = P.createCanvas(w * S, h * S), g = cv.getContext('2d'); g.scale(S, S); draw(g, w, h); const file = name.replace(/\//g, '_') + '.png'; P.save(cv, path.join(OUT, file));
  items.push({ name, file, origin: origin ? [origin[0] * S, origin[1] * S] : [w * S / 2, h * S / 2], data: Object.assign(origin ? { soft: true } : { soft: true, keep: true }, data) }); };

// the glow: a soft round light. Behind the chest while it shines; blown up for the pop
piece('glow', 96, 96, (g, w) => { g.fillStyle = P.rad(g, w / 2, w / 2, w / 2, w / 2, w / 2, [[0, a(1)], [0.22, a(0.86)], [0.5, a(0.4)], [0.78, a(0.12)], [1, a(0)]]); g.fillRect(0, 0, w, w); }, { note: 'white: tint it; behind the chest, its middle on the chest\'s mouth' });
// the rays: fourteen uneven rays from one middle, each fading out. Turned slowly behind the open chest
piece('rays', 136, 136, (g, w) => { const c = w / 2, n = 14;
  for (let i = 0; i < n; i++) { const ang = (i + (rnd() - 0.5) * 0.5) / n * Math.PI * 2, L = c * (i % 2 ? 0.62 + rnd() * 0.14 : 0.86 + rnd() * 0.14), hw = (i % 2 ? 0.07 : 0.1) + rnd() * 0.03;
    g.beginPath(); g.moveTo(c, c); g.arc(c, c, L, ang - hw, ang + hw); g.closePath(); g.fillStyle = P.rad(g, c, c, c, c, L, [[0, a(0.0)], [0.1, a(0.8)], [0.45, a(0.42)], [1, a(0)]]); g.fill(); }
  g.fillStyle = P.rad(g, c, c, c, c, 16, [[0, a(0.9)], [1, a(0)]]); g.fillRect(c - 16, c - 16, 32, 32); }, { note: 'white: tint it; behind the chest on its mouth, turning about 40 degrees a second' });
// the beam: a shaft of light standing in the chest's mouth, widening and fading upward. Its origin is its foot
piece('beam', 56, 132, (g, w, h) => { const foot = h - 6;
  for (let y = 2; y < foot; y += 0.5) { const t = (foot - y) / (foot - 2), hw = 13 + 13 * t, k = Math.pow(1 - t, 1.3) * 0.9 * Math.min(1, t * 12 + 0.25);      // row by row: wider and fainter upward, soft at both sides
    g.fillStyle = P.lin(g, w / 2 - hw, 0, w / 2 + hw, 0, [[0, a(0)], [0.3, a(k * 0.55)], [0.5, a(k)], [0.7, a(k * 0.55)], [1, a(0)]]); g.fillRect(w / 2 - hw, y, hw * 2, 0.5); }
  g.fillStyle = P.rad(g, w / 2, foot, w / 2, foot, 16, [[0, a(0.9)], [1, a(0)]]); g.save(); g.translate(0, foot); g.scale(1, 0.4); g.translate(0, -foot); g.fillRect(w / 2 - 16, foot - 16, 32, 32); g.restore(); }, { note: 'white: tint it; over the chest, its origin on the mouth; stretch it upward as it opens' }, [28, 126]);
// the ring: a flat ring on the ground that runs outward from the chest as it pops
piece('ring', 108, 64, (g, w, h) => { for (const [lw, k] of [[8, 0.14], [5, 0.3], [2.4, 1]]) { g.beginPath(); g.ellipse(w / 2, h / 2, 48, 27, 0, 0, 7); g.lineWidth = lw; g.strokeStyle = a(k); g.stroke(); } }, { note: 'white: tint it; on the ground under the chest, grown from 0.3 to 1.8 while it fades' });
// the star: a sparkle with a halo, thrown out by the burst. out/loot's spark is the small plain one
piece('star', 30, 30, (g, w) => { const c = w / 2; g.fillStyle = P.rad(g, c, c, c, c, 11, [[0, a(0.55)], [1, a(0)]]); g.fillRect(0, 0, w, w); g.fillStyle = W; g.beginPath();
  for (let i = 0; i < 16; i++) { const ang = i * Math.PI / 8, r = i % 4 === 0 ? 14 : i % 2 === 0 ? 6 : 2.3; g.lineTo(c + Math.cos(ang) * r, c + Math.sin(ang) * r); } g.closePath(); g.fill(); }, { note: 'white: tint it; thrown out, turning, grown then shrunk to nothing' });
// the mote: a small soft dot of light, for the dust that hangs after the burst
piece('mote', 10, 10, (g, w) => { g.fillStyle = P.rad(g, w / 2, w / 2, w / 2, w / 2, w / 2, [[0, a(1)], [0.4, a(0.8)], [1, a(0)]]); g.fillRect(0, 0, w, w); }, { note: 'white: tint it' });
// the coin: four pictures of one gold coin turning, with the dark line. Thrown out of the chest in a fountain
const INK = '#33203a', GOLD = '#f6c23a', SHADE = '#d99a1e', SHINE = '#fff3c0';
[1, 0.68, 0.2, 0.68].forEach((k, i) => piece('coin/' + (i + 1), 14, 14, (g, w) => { const c = w / 2, rx = Math.max(1.3, 5 * k);
  g.beginPath(); g.ellipse(c, c, rx + 1.1, 6.1, 0, 0, 7); g.fillStyle = INK; g.fill();
  g.beginPath(); g.ellipse(c, c, rx, 5, 0, 0, 7); g.fillStyle = i === 2 ? SHADE : GOLD; g.fill();
  if (k > 0.3) { g.beginPath(); g.ellipse(c + (i === 3 ? 0.8 : -0.8) * k, c + 0.6, rx * 0.62, 3.1, 0, 0, 7); g.fillStyle = SHADE; g.fill(); g.beginPath(); g.ellipse(c + (i === 3 ? 1.5 : -1.5) * k, c - 1.6, rx * 0.26, 1.2, 0, 0, 7); g.fillStyle = SHINE; g.fill(); } },
  { soft: false, keep: true, delay: 70, note: 'gold as it is, no tint; play 1 to 4 round and round while it flies' }));
fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify({ px: S, items }, null, 1)); console.log('drew', items.length, 'pieces of the chest\'s burst');
