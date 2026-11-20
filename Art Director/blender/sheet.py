"""sheet.py: the Warrior once more, for his own window (Leonard, AD, 2026-11-20).
In the hero's window the game drew his field picture at 2.2 times, so he was soft beside the sharp slots. Here he is
rendered at TWICE the field's pixels: the same model, the same stand, the same points for his gear, facing the camera only,
and each cutlass, buckler and hat he can wear at the same size. The files have the field's own names and forms (hero.json
with its actions and points, gear.json with its items), so the game draws them with the code it has: only the scale differs
(meta.filePx 4: four file pixels a design unit of the field's hero).
  node tools/blender.js blender/sheet.py -- work/hero-sheet
  node tools/pack.js hero work/hero-sheet/hero out/hero-sheet --px 4
  node tools/packset.js gear work/hero-sheet/gear out/hero-sheet"""
import sys, os, json
HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path: sys.path.insert(0, HERE)
import drok as D, hero, gear

K = 2                                               # how many times the field's pixels
class Big(D.Stage):
    def frame(self, w, h, ox, oy, px=D.PX, unit=D.UNIT): super().frame(w, h, ox, oy, px, unit * K)
big = lambda fr: tuple(int(v * K) for v in fr)

if __name__ == '__main__':
    a = D.args(); root = os.path.abspath(a[0]) if a else os.path.join(HERE, '..', 'work', 'hero-sheet')
    st = Big(line=0.56 * 1.5)                       # the line half as heavy again: at twice the size it then weighs what the window's own lines weigh
    out = os.path.join(root, 'hero'); D.render_clips(st, 'hero', hero.build, {'stand': hero.CLIPS['stand']}, out, big(hero.FRAME), facings=(('s', 0.0),), rest=hero.pose(), relative=('off', 'head'))
    m = json.load(open(os.path.join(out, 'meta.json'), encoding='utf-8')); m['px'] = D.PX * K; json.dump(m, open(os.path.join(out, 'meta.json'), 'w', encoding='utf-8'), indent=1)
    recs = []; out = os.path.join(root, 'gear')
    for it in gear.items():
        if '/' in it['name'] and not it['name'].endswith('/s'): continue
        it = dict(it); it['frame'] = big(it.get('frame', gear.FRAME)); recs += D.render_items(st, [it], out, it['frame'], unit=it.get('unit', D.UNIT))
    json.dump({'px': D.PX * K, 'unit': D.UNIT, 'items': recs}, open(os.path.join(out, 'meta.json'), 'w', encoding='utf-8'), indent=1)
    print('sheet:', len(recs), 'pieces of gear')
