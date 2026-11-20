// icon.js: the app's icon, 512 and 192 (Leonard, AD, 2026-11-20; the design is mine). The Warrior's face in his red head
// cloth on a bright sea, with the game's dark line. The whole square is painted (a phone may cut it to a circle or a
// rounded square), and the face sits inside the middle four fifths.
//   node tools/blender.js blender/icon.py -- work/icon      then      node tools/icon.js
const P = require('./paint.js'); const path = require('path');
(async () => {
  const head = await P.loadImage(path.join(P.ROOT, 'work/icon/head.png')), cv = P.createCanvas(512, 512), g = cv.getContext('2d');
  g.fillStyle = '#30b8d6'; g.fillRect(0, 0, 512, 512);
  g.fillStyle = '#52d6d8'; g.beginPath(); g.arc(256, 250, 214, 0, 7); g.fill(); g.fillStyle = '#8fe6e2'; g.beginPath(); g.arc(256, 250, 168, 0, 7); g.fill();
  g.strokeStyle = '#ffffff'; g.lineWidth = 9; g.lineCap = 'round'; for (const [x, y, w] of [[70, 452, 70], [372, 446, 80], [214, 478, 90]]) { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y - 16, x + w, y); g.stroke(); }
  g.drawImage(head, 0, 22);
  P.save(cv, path.join(P.ROOT, 'out/icon/icon-512.png'));
  const s = P.createCanvas(192, 192), sg = s.getContext('2d'); sg.imageSmoothingEnabled = true; sg.imageSmoothingQuality = 'high'; sg.drawImage(cv, 0, 0, 192, 192); P.save(s, path.join(P.ROOT, 'out/icon/icon-192.png')); console.log('wrote the icon, 512 and 192');
})();
