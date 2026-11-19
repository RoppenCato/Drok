// chrome.js: the game's chrome drawn plainly for judging pictures (Perry, AD, 2026-10-31): a HUD band with a name, a bar
// and gold, a title pill, a big round action button at the bottom, a panel of four buttons, laid out for the judging size
// in tools/paths.json, so a picture reads as the screen and the art is judged by what the panels leave visible. The chrome
// itself is the game's; this is a stand-in: redraw it to the game's own layout (its docs/state) in the first session.
// Draw on a canvas at 2x of the judging size: each function scales by 2 itself.
const P = require('./paint.js');
function hud(g, title, gold = 120, name = 'Robin  Lv 4') {
  const W = P.JUDGE.w;
  g.save(); g.scale(2, 2); g.fillStyle = 'rgba(248,236,198,0.95)'; g.beginPath(); P.rr(g, 14, 14, W - 28, 62, 14); g.fill(); P.ink(g, 3);
  P.label(g, name, 70, 36, 16, P.INK); g.fillStyle = '#fff'; g.beginPath(); P.rr(g, 70, 48, 150, 12, 6); g.fill(); P.ink(g, 1.5); g.fillStyle = '#6ed34a'; g.beginPath(); P.rr(g, 72, 50, 110, 8, 4); g.fill();
  g.beginPath(); g.arc(W - 112, 44, 8, 0, 7); g.fillStyle = '#ffcc33'; g.fill(); P.ink(g, 1.5); P.label(g, String(gold), W - 96, 44, 16, P.INK);   // the coin before the number, so no digit is covered
  g.fillStyle = 'rgba(248,236,198,0.92)'; g.beginPath(); P.rr(g, W / 2 - 86, 90, 172, 28, 14); g.fill(); P.ink(g, 2.5); P.label(g, title, W / 2, 104, 15, P.INK, { align: 'center' }); g.restore();
}
function roll(g, word = 'ROLL') { const W = P.JUDGE.w, H = P.JUDGE.h, x = W / 2, y = H - 65; g.save(); g.scale(2, 2); g.beginPath(); g.arc(x, y, 44, 0, 7); g.fillStyle = P.rad(g, x - 14, y - 16, x, y, 44, [[0, '#ffe680'], [0.6, '#ffcc33'], [1, '#d99a12']]); g.fill(); P.ink(g, 3.5); P.label(g, word, x, y + 2, 22, P.INK, { align: 'center' }); g.restore(); }
function fightUi(g, words = ['ATTACK', 'SKILL', 'ITEM', 'DEFEND']) {
  const W = P.JUDGE.w, H = P.JUDGE.h, y0 = H - 219, bw = (W - 56) / 2, cols = [24, 24 + bw + 8], rows = [y0 + 14, y0 + 104], colours = ['#e8503e', '#3f7fd8', '#6ab85a', '#8a8f98'];
  g.save(); g.scale(2, 2); g.fillStyle = 'rgba(248,236,198,0.95)'; g.beginPath(); P.rr(g, 14, y0, W - 28, 190, 16); g.fill(); P.ink(g, 3);
  words.forEach((t, i) => { const x = cols[i % 2], y = rows[Math.floor(i / 2)]; g.beginPath(); P.rr(g, x, y, bw, 76, 14); g.fillStyle = colours[i % 4]; g.fill(); P.ink(g, 3); P.label(g, t, x + bw / 2, y + 40, 20, '#fff', { align: 'center', stroke: P.INK, strokeW: 5 }); });
  g.restore();
}
module.exports = { hud, roll, fightUi };
