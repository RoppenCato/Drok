"""town.py: the pieces of the pirate town at Crab Cay's landing (Leonard, AD, 2026-11-20).
Robin, 2026-11-20, of three towns: "3, but the buildings need to look nicer and have some depth to them. Theres also no
contrast to the floor so it all kinda melts together." And of the changed still: "Yes". So the town is the one on stilts.
Its models were made as concepts (concepts/town/build.py, where every builder is); this file renders the ones the town
uses, for the game: three huts on their own platforms (cabin-a, cabin-b, the tavern cabin-c), the thatched lookout, the
fish rack, a post, a rope of flags.
  node tools/blender.js blender/town.py -- work/crab-cay/town
  then tools/merge-props.js, tools/shade.js and tools/packset.js: the commands are in out/crab-cay/NOTES.md"""
import sys, os, json
HERE = os.path.dirname(os.path.abspath(__file__)); CON = os.path.abspath(os.path.join(HERE, '..', 'concepts', 'town'))
for p in (HERE, CON):
    if p not in sys.path: sys.path.insert(0, p)
import drok as D, build as B

USED = ('cabin-a', 'cabin-b', 'cabin-c', 'tower-thatch', 'rack', 'post', 'bunting')
if __name__ == '__main__':
    a = D.args(); out = os.path.abspath(a[0]) if a else os.path.join(HERE, '..', 'work', 'crab-cay', 'town'); st = D.Stage(); recs = []
    for it in B.ITEMS:
        if it['name'] in USED: recs += D.render_items(st, [it], out, it['frame'])
    json.dump({'px': D.PX, 'unit': D.UNIT, 'items': recs}, open(os.path.join(out, 'meta.json'), 'w', encoding='utf-8'), indent=1); print('town:', len(recs), 'pictures')
