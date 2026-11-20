// own.js: a sketch, not a piece yet (Leonard, AD, 2026-11-20): his own health and rage over his head as ONE small piece.
// Robin, 2026-11-20: "the heros health bar should show over his character, and the rage bar below it. It needs to be
// fixated well enough that it doesnt become messy when fighting mobs." "keep the UI as clean as possible."
// One dark outline, two rooms: health 7 tall, rage 3.4 tall under it, a heart on the left end. Cream wells, so it is
// never taken for a monster's dark bar. Called by tools/scene.js:
//   node tools/scene.js out.png --pile bare --no-arrow --over concepts/own-bars/own.js --at 595,1896
const WELL = '#cdbfae', INK = '#33203a', HP = '#f0503c', HPHI = '#ff7a62', RAGE = '#ff9a2e', RAGEHI = '#ffc060';
function ownBar(g, c, x, y, w, hp, rage) {   // x the middle, y the top
  const L = 1.6, D = 1.2, H1 = 7, H2 = 3.4, h = L + H1 + D + H2 + L, x0 = x - w / 2, rr = (a, b, ww, hh, r) => { g.beginPath(); c.P.rr(g, a, b, ww, hh, r); };
  rr(x0, y, w, h, 5.5); g.fillStyle = INK; g.fill();
  g.save(); rr(x0 + L, y + L, w - 2 * L, h - 2 * L, 3.9); g.clip();
  g.fillStyle = WELL; g.fillRect(x0, y + L, w, H1); g.fillRect(x0, y + L + H1 + D, w, H2);
  const fw = w - 2 * L; g.fillStyle = HP; g.fillRect(x0 + L, y + L, fw * hp, H1); g.fillStyle = HPHI; g.fillRect(x0 + L, y + L + 1, fw * hp, 1.8);
  g.fillStyle = RAGE; g.fillRect(x0 + L, y + L + H1 + D, fw * rage, H2); g.fillStyle = RAGEHI; g.fillRect(x0 + L, y + L + H1 + D + 0.5, fw * rage, 1);
  g.restore();
  c.piece('mark/heart', x0 + 1, y + L + H1 / 2 + 0.5, 0.6);
}
module.exports = { draw(g, c) { ownBar(g, c, Math.round(c.sx(c.hero.x)) + 2, Math.round(c.sy(c.hero.y) - c.heroTop - 22), 52, 0.76, 0.84); }, ownBar };
