// concepts.js: the numbered concept picture (the template's, 2026-11-04; the board world game's concepts.js painted that
// game's own meadow and stays there). Lays two to four concept stills side by side, scaled to one height, a big number in a
// disc on each and a label under each, so Robin can pick by number from one picture sent into the chat. sites/pick.html
// does the same as a page for the phone, with the pictures at full size.
//   node tools/concepts.js <out.png|.jpg> [--labels "Storybook line|Soft meadow|Enchanted twilight"] [--height 640] [--cols 3] <1.png> <2.png> [<3.png> ...]
const P = require('./paint.js'); const path = require('path');
(async () => {
  const args = process.argv.slice(2); const out = args.shift(); const opt = { labels: '', height: '640', cols: '3' }; const pics = [];
  for (let i = 0; i < args.length; i++) { if (args[i].startsWith('--')) { opt[args[i].slice(2)] = args[++i]; } else pics.push(args[i]); }
  if (!out || !pics.length) { console.log('usage: node tools/concepts.js <out.png> [--labels "a|b|c"] [--height 640] [--cols 3] <1.png> <2.png> ...'); process.exit(1); }
  const labels = opt.labels ? opt.labels.split('|') : pics.map(p => path.basename(p).replace(/\.(png|jpe?g)$/i, '')), CH = +opt.height, cols = Math.min(+opt.cols, pics.length), gap = 24, cap = 44;
  const ims = []; for (const p of pics) ims.push(await P.loadImage(p));
  const cells = ims.map(im => ({ im, w: Math.round(im.width * CH / im.height), h: CH })), rows = Math.ceil(cells.length / cols);
  const colW = Math.max(...cells.map(c => c.w)), W = gap + cols * (colW + gap), H = gap + rows * (CH + cap + gap);
  const cv = P.createCanvas(W, H), g = cv.getContext('2d'); g.fillStyle = '#1c1a22'; g.fillRect(0, 0, W, H); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  cells.forEach((c, i) => {
    const x = gap + (i % cols) * (colW + gap) + (colW - c.w) / 2, y = gap + Math.floor(i / cols) * (CH + cap + gap);
    g.drawImage(c.im, x, y, c.w, c.h); g.strokeStyle = '#3a3544'; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, c.w - 2, c.h - 2);
    g.beginPath(); g.arc(x + 34, y + 34, 26, 0, 7); g.fillStyle = '#f4c14a'; g.fill(); P.ink(g, 3);   // the number, big, in a disc at the top left
    P.label(g, String(i + 1), x + 34, y + 36, 30, P.INK, { align: 'center' });
    P.label(g, `${i + 1}. ${labels[i] || ''}`, x + c.w / 2, y + CH + cap / 2 + 2, 17, '#f0e8d8', { align: 'center' });
  });
  P.save(cv, out); console.log('wrote', out, cells.length, 'concepts');
})();
