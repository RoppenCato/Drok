// Runs a Blender Python script headless (the Survival game's tools/blender.js, copied 2026-10-13):
//   node tools/blender.js <script.py> [-- args...]
// Finds blender.exe from BLENDER in the environment, else "blender" in tools/paths.json, else the newest "Blender
// Foundation" install under Program Files. The pipeline that uses it is the studio's docs/3d-to-sprites.md.
const { spawnSync } = require('child_process'); const fs = require('fs'); const path = require('path');
function findBlender() {
  if (process.env.BLENDER && fs.existsSync(process.env.BLENDER)) return process.env.BLENDER;
  try { const P = JSON.parse(fs.readFileSync(path.join(__dirname, 'paths.json'), 'utf8')); if (P.blender && fs.existsSync(P.blender)) return P.blender; } catch (e) { }
  const roots = ['C:\\Program Files\\Blender Foundation', 'C:\\Program Files (x86)\\Blender Foundation'];
  for (const r of roots) {
    if (!fs.existsSync(r)) continue;
    const vs = fs.readdirSync(r).filter(d => fs.existsSync(path.join(r, d, 'blender.exe'))).sort().reverse();
    if (vs.length) return path.join(r, vs[0], 'blender.exe');
  }
  return 'blender';
}
function run(script, extra, cwd) {
  const r = spawnSync(findBlender(), ['-b', '-P', script, '--', ...extra], { stdio: 'inherit', cwd });
  return r.status == null ? 1 : r.status;
}
module.exports = { findBlender, run };
if (require.main === module) {
  const args = process.argv.slice(2); const i = args.indexOf('--');
  process.exit(run(args[0], i >= 0 ? args.slice(i + 1) : []));
}
