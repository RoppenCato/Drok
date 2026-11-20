// frames.js: runs the moving page's own script outside a browser and saves its picture at chosen moments, so the look
// picture is made of the real motion (Leonard, AD, 2026-11-20). The page's script is taken from chest-opening.html as it
// stands; only its picture loader is swapped for this canvas library's.
//   node concepts/chest-burst/frames.js <rarity> <out dir> <ms after the start, or p+ms after the pop> ...
//   node concepts/chest-burst/frames.js rare work/chest-burst/f 300 800 p+40 p+160 p+420 p+800 p+1400 p+2600
const fs = require('fs'); const path = require('path'); const P = require('../../tools/paint.js');
const HERE = __dirname, [rarity, outDir, ...times] = process.argv.slice(2);
(async () => {
  const html = fs.readFileSync(path.join(HERE, 'chest-opening.html'), 'utf8'), a = html.lastIndexOf('<script>'), b = html.lastIndexOf('</script>'); let js = html.slice(a + 8, b);
  const loader = "const load = n => new Promise((ok, no) => { const i = new Image(); i.onload = () => { img[n] = i; ok(); }; i.onerror = no; i.src = n + '.png'; });";
  if (!js.includes(loader)) throw new Error('the page\'s loader line has changed: mend frames.js');
  js = js.replace(loader, "const load = async n => { img[n] = await __load(n + '.png'); };");
  const el = () => ({ children: [], classList: { toggle() { } }, style: {}, setAttribute() { }, getAttribute() { return 'false'; }, addEventListener() { }, appendChild(c) { this.children.push(c); } });
  const cv = P.createCanvas(800, 1040); cv.addEventListener = () => { }; const els = { cv };
  const doc = { getElementById: id => els[id] || (els[id] = el()), createElement: t => t === 'canvas' ? P.createCanvas(1, 1) : el() };
  const rnd = P.rng(3), math = Object.create(Math); math.random = rnd;
  const api = new Function('document', 'performance', 'requestAnimationFrame', '__load', 'Math', js + '\n; return { frame, set(r) { rar = r; T = 0; parts = null; }, T: () => T, last: () => last, charge: () => TIMES[rar].charge, ready: () => Object.keys(img).length === 5 };')(doc, { now: () => 0 }, () => { }, f => P.loadImage(path.join(HERE, f)), math);
  for (let i = 0; i < 200 && !api.ready(); i++) await new Promise(r => setTimeout(r, 10));
  api.set(rarity || 'rare'); fs.mkdirSync(outDir, { recursive: true });
  const want = times.map(t => t.startsWith('p+') ? api.charge() + +t.slice(2) : +t); let n = 0;
  for (const ms of want) { let guard = 0; while (api.T() < ms && guard++ < 5000) api.frame(api.last() + 16); const o = P.createCanvas(400, 520), g = o.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(cv, 0, 0, 400, 520); P.save(o, path.join(outDir, (++n) + '.png')); }
  console.log('saved', n, 'frames of', rarity, 'at', want.join(', '), 'ms');
})();
