// numbered.js: a numbered board of pictures of mixed shapes (Leonard, AD, 2026-11-20). For asking Robin with a
// reference board: every picture at one width in columns, each next one under the shortest column, a big number in a
// disc on it and a line under it, a title across the top. He answers in the chat with the numbers. board.js makes the
// plain contact sheet (file names, no numbers); concepts.js lays two to four stills of one shape side by side.
//   node tools/numbered.js <out.jpg|.png> [--cols 3] [--width 400] [--title "Which kind of dark?"] [--labels "a|b|c"] <1.jpg> <2.jpg> ...
const P = require('./paint.js'); const path = require('path');
(async () => {
  const args = process.argv.slice(2); const out = args.shift(); const opt = { cols: '3', width: '400', title: '', labels: '' }; const pics = [];
  for (let i = 0; i < args.length; i++) { if (args[i].startsWith('--')) opt[args[i].slice(2)] = args[++i]; else pics.push(args[i]); }
  if (!out || !pics.length) { console.log('usage: node tools/numbered.js <out.jpg> [--cols 3] [--width 400] [--title "..."] [--labels "a|b|c"] <1.jpg> <2.jpg> ...'); process.exit(1); }
  const cols = +opt.cols, CW = +opt.width, gap = 18, cap = 50, top = opt.title ? 84 : gap, labels = opt.labels ? opt.labels.split('|') : pics.map(p => path.basename(p).replace(/\.(png|jpe?g)$/i, ''));
  const tall = new Array(cols).fill(top), cells = [];
  for (let i = 0; i < pics.length; i++) {
    const im = await P.loadImage(pics[i]), h = Math.round(im.height * CW / im.width), c = tall.indexOf(Math.min(...tall));
    cells.push({ im, n: i + 1, x: gap + c * (CW + gap), y: tall[c], h, text: labels[i] || '' }); tall[c] += h + cap + gap;
  }
  const W = gap + cols * (CW + gap), H = Math.max(...tall), cv = P.createCanvas(W, H), g = cv.getContext('2d');
  g.fillStyle = '#17151a'; g.fillRect(0, 0, W, H); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  if (opt.title) P.label(g, opt.title, W / 2, 44, 30, '#f0e8d8', { align: 'center' });
  for (const c of cells) {
    g.drawImage(c.im, c.x, c.y, CW, c.h); g.strokeStyle = '#3a3544'; g.lineWidth = 2; g.strokeRect(c.x + 1, c.y + 1, CW - 2, c.h - 2);
    g.beginPath(); g.arc(c.x + 38, c.y + 38, 30, 0, 7); g.fillStyle = '#f4c14a'; g.fill(); P.ink(g, 3, '#2a2030');   // the number, big, in a disc at the top left
    P.label(g, String(c.n), c.x + 38, c.y + 40, 34, '#2a2030', { align: 'center' });
    g.save(); g.font = 'bold 19px Arial'; let size = 19; while (g.measureText(`${c.n}. ${c.text}`).width > CW - 8 && size > 12) { size--; g.font = `bold ${size}px Arial`; } g.restore();
    P.label(g, `${c.n}. ${c.text}`, c.x + CW / 2, c.y + c.h + cap / 2, size, '#f0e8d8', { align: 'center' });
  }
  P.save(cv, out); console.log('wrote', out, cells.length, 'pictures', W + 'x' + H);
})();
