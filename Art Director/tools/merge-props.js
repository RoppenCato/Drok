// merge-props.js: several folders of rendered props into one, so tools/packset.js makes ONE atlas for a place
// (Leonard, AD, 2026-11-20). A name that is in an earlier folder is not taken again from a later one.
//   node tools/merge-props.js                                   big Crab Cay: the small island's 23 and the town's 7 into work/crab-cay/render
//   node tools/merge-props.js <out dir> <render dir> <render dir> ... [--not name,name]      (--not: names to leave out)
//   then: node tools/packset.js island <out dir> <atlas dir>
const fs = require('fs'); const path = require('path'); const R = path.resolve(__dirname, '..');
const argv = process.argv.slice(2), ni = argv.indexOf('--not'), not = new Set(ni >= 0 ? argv[ni + 1].split(',') : []), a = ni >= 0 ? argv.filter((v, i) => i !== ni && i !== ni + 1) : argv;
const out = path.resolve(R, a[0] || 'work/crab-cay/render'), dirs = a.length > 1 ? a.slice(1) : ['work/island/render', 'work/harbour/render'], have = new Set(not), items = []; let px, unit;
fs.mkdirSync(out, { recursive: true });
for (const dir of dirs) { const m = JSON.parse(fs.readFileSync(path.join(R, dir, 'meta.json'), 'utf8')); px = px || m.px; unit = unit || m.unit; for (const it of m.items) { if (have.has(it.name)) continue; have.add(it.name); if (path.resolve(R, dir) !== out) fs.copyFileSync(path.join(R, dir, it.file), path.join(out, it.file)); items.push(it); } }
fs.writeFileSync(path.join(out, 'meta.json'), JSON.stringify({ px, unit, items }, null, 1)); console.log('merged', items.length, 'pictures:', items.map(i => i.name).join(' '));
