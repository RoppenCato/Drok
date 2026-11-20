"""chest_big.py: the chest once more, for its own screen (Leonard, AD, 2026-11-20).
Robin, 2026-11-20, in Victor, GD's chat: "I think the chests should open like in zite where its a big pop up screen and
the game pauses". On that screen the game draws the field's chest at three times its size, so it is soft, and at that size
a box with two bands is too plain. Here is the same chest built richer and rendered at THREE times the field's pixels:
a rounded lid in planks, gold bands with studs, corner caps, a lock with its hasp, feet, and gold heaped inside. Closed,
opening and open, with the field's names. The line is a little heavier than the field's, so at that size it weighs what
the windows' own lines weigh.
  node tools/blender.js blender/chest_big.py -- work/chest-big/render
  node tools/packset.js chest work/chest-big/render out/chest-burst --tight --width 512"""
import sys, os, json, math, random
HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path: sys.path.insert(0, HERE)
import bmesh
from mathutils import Vector, Matrix
import drok as D, props
from drok import sph, cap, box, cyl

K = 3                                               # how many times the field's pixels
class Big(D.Stage):
    def frame(self, w, h, ox, oy, px=D.PX, unit=D.UNIT): super().frame(w, h, ox, oy, px, unit * K)

def chest(open_=0.0):
    def b(st):
        W, Dp, Hb, R = 0.62, 0.4, 0.3, 0.2      # width, depth, the body's height, the lid's rise
        bm = bmesh.new(); box(bm, (0, 0, 0.03), (W + 0.05, Dp + 0.05, 0.06)); st.make(bm, 'base', 'woodDark', smooth=False)
        bm = bmesh.new(); box(bm, (0, 0, 0.06 + Hb / 2), (W, Dp, Hb)); st.make(bm, 'body', 'wood', smooth=False)
        bm = bmesh.new()      # the planks' seams on the front and the sides
        for z in (0.16, 0.26): box(bm, (0, -Dp / 2 - 0.002, z), (W - 0.02, 0.006, 0.012)); box(bm, (W / 2 + 0.002, 0, z), (0.006, Dp - 0.02, 0.012))
        st.make(bm, 'seams', 'woodDark', smooth=False, line=False)
        bm = bmesh.new()
        for sx in (-1, 1):
            for sy in (-1, 1): sph(bm, (sx * (W / 2 - 0.02), sy * (Dp / 2 - 0.02), 0.0), 0.05, (1, 1, 0.7), seg=10)
        st.make(bm, 'feet', 'woodDark')
        top = 0.06 + Hb; Lm = Matrix.Translation(Vector((0, Dp / 2, top))) @ D.rx(-100 * open_) @ Matrix.Translation(Vector((0, -Dp / 2, 0)))     # the lid on its hinge at the back
        bm = bmesh.new(); cyl(bm, (0, 0, 0), R, W, axis=(1, 0, 0), seg=28); bm.transform(Matrix.Diagonal((1, Dp / 2 / R, 1, 1))); props.cut_below(bm); o = st.make(bm, 'lid', 'woodHi'); o.matrix_local = Lm
        bm = bmesh.new()
        for a in (40, 90, 140): r = math.radians(a); box(bm, (0, -math.cos(r) * (Dp / 2 + 0.001), math.sin(r) * (R + 0.001)), (W - 0.02, 0.008, 0.008))
        o = st.make(bm, 'lid_seams', 'wood', smooth=False, line=False); o.matrix_local = Lm
        if open_ > 0.2:      # the dark inside of the lid and of the body
            bm = bmesh.new(); box(bm, (0, 0, 0.004), (W - 0.06, Dp - 0.06, 0.008)); o = st.make(bm, 'lid_in', 'inside', smooth=False, line=False); o.matrix_local = Lm
            bm = bmesh.new(); box(bm, (0, 0, top - 0.002), (W - 0.06, Dp - 0.06, 0.006)); st.make(bm, 'body_in', 'inside', smooth=False, line=False)
        # gold: two straps over body and lid, corner caps, the lock plate and the hasp that comes down from the lid
        bm = bmesh.new()
        for dx in (-0.2, 0.2): box(bm, (dx, 0, 0.06 + Hb / 2), (0.085, Dp + 0.016, Hb + 0.004))
        for sx in (-1, 1): box(bm, (sx * (W / 2 - 0.03), -Dp / 2 - 0.004, 0.1), (0.075, 0.02, 0.09))
        box(bm, (0, -Dp / 2 - 0.012, 0.25), (0.15, 0.03, 0.15)); st.make(bm, 'bands', 'brass', smooth=False)
        bm = bmesh.new()
        for dx in (-0.2, 0.2): cyl(bm, (dx, 0, 0), R + 0.008, 0.085, axis=(1, 0, 0), seg=28)
        bm.transform(Matrix.Diagonal((1, (Dp / 2 + 0.008) / (R + 0.008), 1, 1))); props.cut_below(bm); box(bm, (0, -Dp / 2 - 0.012, 0.035), (0.085, 0.03, 0.09)); o = st.make(bm, 'lid_bands', 'brass'); o.matrix_local = Lm
        bm = bmesh.new()
        for dx in (-0.2, 0.2):
            for z in (0.13, 0.22, 0.31): sph(bm, (dx, -Dp / 2 - 0.012, z), 0.017, seg=8)
        st.make(bm, 'studs', 'yellow', line=False)
        bm = bmesh.new()
        for dx in (-0.2, 0.2):
            for a in (38, 90): r = math.radians(a); sph(bm, (dx, -math.cos(r) * (Dp / 2 + 0.012), math.sin(r) * (R + 0.012)), 0.017, seg=8)
        o = st.make(bm, 'lid_studs', 'yellow', line=False); o.matrix_local = Lm
        bm = bmesh.new(); sph(bm, (0, -Dp / 2 - 0.03, 0.265), 0.022, seg=8); box(bm, (0, -Dp / 2 - 0.03, 0.225), (0.016, 0.01, 0.05)); st.make(bm, 'keyhole', 'eye', smooth=False, line=False)
        if open_ > 0.3:      # what is inside: a heap of coins, a few standing on edge
            rnd = random.Random(4); bm = bmesh.new()
            for i in range(26):
                x = (rnd.random() - 0.5) * (W - 0.14); y = (rnd.random() - 0.5) * (Dp - 0.14); z = top - 0.01 + 0.07 * (1 - abs(x) / (W / 2)) * (1 - abs(y) / (Dp / 2)) + rnd.random() * 0.02
                cyl(bm, (x, y, z), 0.05, 0.016, axis=((rnd.random() - 0.5) * 0.9, (rnd.random() - 0.5) * 0.9, 1), seg=12)
            st.make(bm, 'gold', 'gold')
        return None
    return b

if __name__ == '__main__':
    a = D.args(); out = os.path.abspath(a[0]) if a else os.path.join(HERE, '..', 'work', 'chest-big', 'render'); st = Big(line=0.56 * 1.7); recs = []
    for name, k in (('chest/closed', 0.0), ('chest/opening', 0.42), ('chest/open', 1.0)): recs += D.render_items(st, [{'name': name, 'build': chest(k)}], out, (768, 768, 384, 570))
    json.dump({'px': D.PX * K, 'unit': D.UNIT, 'items': recs}, open(os.path.join(out, 'meta.json'), 'w', encoding='utf-8'), indent=1); print('chest:', len(recs), 'pictures at', K, 'times')
