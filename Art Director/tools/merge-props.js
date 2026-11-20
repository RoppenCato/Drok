// merge-props.js: one render folder for big Crab Cay's props (Leonard, AD, 2026-11-20): the small island's 23 and what the
// town adds (three houses, the stall, the well, the sign, the lamp), so tools/packset.js makes ONE atlas for the place.
//   node tools/merge-props.js      then: node tools/packset.js island work/crab-cay/render work/crab-cay/atlas
const fs = require('fs'); const path = require('path'); const R = path.resolve(__dirname, '..');
const a = JSON.parse(fs.readFileSync(path.join(R, 'work/island/render/meta.json'), 'utf8')), b = JSON.parse(fs.readFileSync(path.join(R, 'work/harbour/render/meta.json'), 'utf8')), out = path.join(R, 'work/crab-cay/render'), have = new Set(a.items.map(i => i.name)), items = [];
fs.mkdirSync(out, { recursive: true });
for (const [dir, list] of [['work/island/render', a.items], ['work/harbour/render', b.items.filter(i => !have.has(i.name))]]) for (const it of list) { fs.copyFileSync(path.join(R, dir, it.file), path.join(out, it.file)); items.push(it); }
fs.writeFileSync(path.join(out, 'meta.json'), JSON.stringify({ px: a.px, unit: a.unit, items }, null, 1)); console.log('merged', items.length, 'pictures:', items.map(i => i.name).join(' '));
