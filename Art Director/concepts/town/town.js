// town.js: three concepts of the pirate town on Crab Cay, each laid out on the island itself (Leonard, AD, 2026-11-20; mine).
// Robin, 2026-11-20: "Make the starter island a pirate town"; then, of my offer of a real town: "Yeah do an updated pirate
// town suggested". Each town is given to tools/isle.js as a layout, so its ground is painted into the island's ground at
// half a pixel a unit, as the game would show it, and tools/scene.js draws the stills from that.
//   1 port     plaster houses round a cobbled square, a tavern, a lookout tower, flags
//   2 wreck    built of ships on the sand: an upturned hull, a stern, a mast, sails; planks to walk on
//   3 stilts   on a deck over a little bay: thatched huts, a lookout, fish racks, a rope of flags
// Every town has what the game needs: a square where he wakes, the stall, the dock, four people, ways out to the beach on
// both sides and north to the grove; its outline is `home`.
//   node concepts/town/town.js [3]        the three islands (or one) into work/crab-cay-1 .. -3, an overview of each town into work/town/
const P = require('../../tools/paint.js'); const D = require('../../tools/dress.js'); const I = require('../../tools/isle.js'); const fs = require('fs'); const path = require('path');
const R = P.ROOT, base = JSON.parse(JSON.stringify(I.ISLES['crab-cay']));
// the island as it was when the three were drawn: a straight shore at the landing, the dock at 1400, 3972, three pieces long
base.land = base.land.map(p => ({ '1400,3770': [1400, 4000], '1830,3890': [1800, 3975], '970,3890': [1020, 3970] })[p.join(',')] || p); base.dock = [1400, 3972]; delete base.dockN;
// what stands in the way of each new piece: a box about its foot (width, depth in units), or a circle
const FOOT = { tavern: [150, 60], 'house-a': [100, 50], 'house-b': [84, 46], 'house-c': [122, 52], 'house-d': [90, 46], 'house-e': [116, 50], 'house-f': [80, 44], 'hull-house': [200, 62], 'stern-house': [112, 44], 'hut-a': [100, 46], 'hut-b': [80, 44], 'hut-c': [132, 52], 'cabin-a': [146, 70], 'cabin-b': [130, 68], 'cabin-c': [180, 78], stall: [108, 44], awning: [100, 40],
  tower: 30, 'tower-thatch': 30, mast: 10, well: 18, lamp: 5, sign: 6, cannon: 14, anchor: 12, barrel: 10, crate: 10, boat: 22, post: 6, rack: [70, 10], 'palm-a': 12, 'palm-b': 12, 'palm-c': 10, 'bush-b': 16, bunting: 0 };
const town = (o) => { const props = o.props.map(([name, x, y]) => ({ name, x, y })), solid = []; for (const q of props) { const f = FOOT[q.name]; if (Array.isArray(f)) solid.push({ x: q.x - f[0] / 2, y: q.y - f[1] + 8, w: f[0], h: f[1] }); else if (f) solid.push({ x: q.x, y: q.y - 3, r: f }); if (q.name === 'bunting') solid.push({ x: q.x - 84, y: q.y - 2, r: 4 }, { x: q.x + 84, y: q.y - 2, r: 4 }); }
  return Object.assign({ dock: o.dock || base.dock, props, solid, people: o.people.map(([who, x, y, facing]) => ({ who, x, y, facing })) }, o.ground); };
const PEOPLE = (kx, ky) => [['shopkeeper', kx, ky, 's'], ['master', 1490, 3722, 'sw'], ['fisher', 1600, 3895, 's'], ['sailor', 1275, 3895, 'se']];
const TOWNS = {
  1: { name: 'Port', home: [[1400, 3992], [1760, 3965], [1900, 3760], [1910, 3420], [1830, 3170], [1400, 3060], [970, 3170], [890, 3420], [900, 3760], [1040, 3965]], wake: [1400, 3650], at: [1330, 3640],
    layout: town({ ground: { square: [[1400, 3835], [1640, 3815], [1790, 3695], [1810, 3505], [1720, 3365], [1400, 3305], [1080, 3365], [990, 3505], [1010, 3695], [1160, 3815]], grass: [[1400, 3292], [1700, 3272], [1850, 3200], [1790, 3110], [1400, 3078], [1010, 3110], [950, 3200], [1100, 3272]], paths: [[[1400, 3965], [1400, 3830]], [[1400, 3312], [1392, 3200], [1390, 3120]]] },
      props: [['palm-b', 975, 3240], ['palm-a', 1835, 3250], ['bush-b', 1260, 3275], ['tavern', 1175, 3420], ['house-d', 1610, 3405], ['house-a', 1770, 3480], ['house-f', 1010, 3530], ['well', 1430, 3530], ['house-e', 1840, 3640], ['house-c', 985, 3700], ['stall', 1240, 3665], ['lamp', 1130, 3775], ['lamp', 1690, 3760],
        ['bunting', 1262, 3812], ['bunting', 1540, 3812], ['sign', 1335, 3862], ['tower', 1730, 3900], ['cannon', 1140, 3905], ['barrel', 1500, 3905], ['barrel', 1532, 3918], ['crate', 1300, 3925], ['crate', 1590, 3930], ['boat', 1860, 3900], ['palm-c', 905, 3860], ['bush-b', 1060, 3930]],
      people: PEOPLE(1240, 3647) }) },
  2: { name: 'Wreck', home: [[1400, 3992], [1760, 3965], [1920, 3760], [1930, 3440], [1830, 3200], [1400, 3110], [970, 3200], [880, 3440], [890, 3760], [1040, 3965]], wake: [1400, 3670], at: [1370, 3650],
    layout: town({ stallName: 'awning', ground: { stall: 'awning', decks: [{ pts: [[1165, 3545], [1645, 3535], [1662, 3795], [1148, 3805]] }, { pts: [[1352, 3795], [1448, 3795], [1448, 3972], [1352, 3972]] }, { pts: [[1358, 3300], [1442, 3300], [1442, 3545], [1358, 3545]] }], paths: [[[1400, 3300], [1392, 3200], [1390, 3120]]] },
      props: [['palm-b', 990, 3270], ['palm-a', 1800, 3290], ['hull-house', 1150, 3470], ['stern-house', 1660, 3455], ['bunting', 1400, 3536], ['mast', 1830, 3650], ['boat', 985, 3690], ['awning', 1265, 3690], ['well', 1520, 3620], ['post', 1150, 3806], ['post', 1250, 3804], ['post', 1560, 3800], ['post', 1660, 3797],
        ['lamp', 1330, 3812], ['lamp', 1470, 3812], ['anchor', 1590, 3880], ['cannon', 1150, 3900], ['sign', 1310, 3880], ['barrel', 1500, 3905], ['barrel', 1700, 3600], ['crate', 1730, 3620], ['crate', 1235, 3905], ['barrel', 1060, 3610], ['boat', 1850, 3880], ['palm-c', 900, 3860], ['bush-b', 1760, 3930]],
      people: PEOPLE(1265, 3672) }) },
  3: { name: 'Stilts', home: [[1400, 4080], [1740, 4060], [1860, 3860], [1880, 3560], [1790, 3380], [1400, 3320], [1010, 3380], [920, 3560], [940, 3860], [1060, 4060]], wake: [1400, 3900], at: [1390, 3880], dockN: 2,
    land: { '1400,4000': [1400, 3770], '1800,3975': [1830, 3890], '1020,3970': [970, 3890] },      // a little bay at the landing: the deck stands in it, water on both its sides
    layout: town({ dock: [1400, 4030], ground: { deckCol: ['#c9b08f', '#d4bd9d', '#9f8463', '#7a5a3e'], decks: [{ sea: 1, pts: [[1110, 3700], [1690, 3700], [1706, 4032], [1094, 4032]] }, { pts: [[1358, 3440], [1442, 3440], [1442, 3700], [1358, 3700]] }, { sea: 1, pts: [[905, 3905], [1100, 3905], [1100, 3962], [905, 3962]] }, { sea: 1, pts: [[1700, 3905], [1895, 3905], [1895, 3962], [1700, 3962]] }], paths: [[[1400, 3440], [1392, 3300], [1390, 3120]]] },
      props: [['palm-b', 1010, 3470], ['palm-a', 1790, 3480], ['bush-b', 1240, 3560], ['bunting', 1400, 3712], ['cabin-c', 1250, 3830], ['cabin-a', 1580, 3822], ['stall', 1296, 3986], ['cabin-b', 1612, 3982], ['rack', 1470, 4014], ['tower-thatch', 1146, 4016], ['lamp', 1340, 4022], ['lamp', 1460, 4022], ['barrel', 1470, 3850], ['crate', 1140, 3880], ['barrel', 1160, 3900], ['sign', 1330, 3745],
        ...[1100, 1220, 1340, 1460, 1580, 1700].map(x => ['post', x, 4040]), ['post', 905, 3968], ['post', 1895, 3968], ['boat', 1010, 4020], ['boat', 1800, 4030], ['palm-c', 930, 3700], ['bush-b', 1830, 3720]],
      people: [['shopkeeper', 1296, 3968, 's'], ['master', 1470, 3915, 'sw'], ['fisher', 1400, 3975, 's'], ['sailor', 1400, 3775, 'se']] }) },
};
(async () => {
  const atlas = path.join(R, 'work/town/atlas'), only = process.argv[2];
  for (const [n, T] of Object.entries(TOWNS)) { if (only && only !== n) continue; const name = 'crab-cay-' + n, L = JSON.parse(JSON.stringify(base)); L.town = { home: T.home, wake: T.wake, layout: T.layout }; if (T.dockN !== undefined) L.dockN = T.dockN; else delete L.dockN; L.dock = T.layout.dock; L.arrive = [L.dock[0], L.dock[1] - 54];
    if (T.land) L.land = L.land.map(p => T.land[p.join(',')] || p);
    I.ISLES[name] = L; const out = path.join(R, 'work', name); fs.mkdirSync(out, { recursive: true }); for (const f of ['island.json', 'island.png']) fs.copyFileSync(path.join(atlas, f), path.join(out, f)); for (const f of ['folk.json', 'folk.png']) fs.copyFileSync(path.join(R, 'out/harbour', f), path.join(out, f));
    console.log('--- town', n, T.name); await I.make(name);
    // the whole town from above, at one pixel a design unit
    const J = JSON.parse(fs.readFileSync(path.join(out, 'place.json'), 'utf8')), ground = await P.loadImage(path.join(out, 'ground.png')), isl = await D.atlas(out, 'island'), folk = await D.atlas(out, 'folk'), b = [840, 3040, 1120, 1130], cv = P.createCanvas(b[2], b[3]), g = cv.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(ground, b[0] / 2, b[1] / 2, b[2] / 2, Math.min(b[3], J.size.h - b[1]) / 2, 0, 0, b[2], Math.min(b[3], J.size.h - b[1])); if (b[1] + b[3] > J.size.h) g.drawImage(ground, b[0] / 2, ground.height - 1, b[2] / 2, 1, 0, J.size.h - b[1], b[2], b[1] + b[3] - J.size.h);
    const things = J.props.filter(q => q.x > b[0] - 150 && q.x < b[0] + b[2] + 150 && q.y > b[1] - 40 && q.y < b[1] + b[3] + 300).map(q => ({ y: q.y, draw: () => { const f = isl.j.frames[q.name]; if (!f) return; g.save(); g.globalAlpha = 0.24; g.fillStyle = '#5b4a82'; g.beginPath(); g.ellipse(q.x - b[0] + 5, q.y - b[1] + 1, f.frame.w * 0.16, f.frame.w * 0.055, 0, 0, 7); g.fill(); g.restore(); g.save(); g.translate(q.x - b[0], q.y - b[1]); g.scale(0.5, 0.5); D.pic(g, isl, q.name); g.restore(); } }));
    for (const q of J.people) things.push({ y: q.y, draw: () => D.figure(g, folk, { action: q.who, facing: q.facing, i: 0 }, q.x - b[0], q.y - b[1], 0.5) });
    things.sort((a, c) => a.y - c.y); for (const t of things) t.draw(); P.save(cv, path.join(R, 'work/town', n + '-above.png'));
  }
})().catch(e => { console.error(e); process.exit(1); });
module.exports = { TOWNS };
