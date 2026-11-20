"""props.py: the things that stand on the first island and in the harbour (Leonard, AD, 2026-11-20; the designs are mine).
Each is one picture with its origin where it meets the ground; the game sorts it by that point. Models, in the look of the
figures (two flat tones, the dark line), so a palm and the Warrior belong to one world. The ground itself is painted
(tools/ground.js) and has no line.
  node tools/blender.js blender/props.py -- island work/island/render      (or: harbour work/harbour/render)"""
import sys, os, math, random, json
HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path: sys.path.insert(0, HERE)
import bmesh
from mathutils import Vector, Matrix
import drok as D
from drok import sph, cap, box, cyl, leaf, mix, plate

def cut_below(bm, z=0.0):
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], dist=1e-5, plane_co=(0, 0, z), plane_no=(0, 0, 1), clear_inner=True)
def palm(seed, h, lean, r):
    def b(st):
        rnd = random.Random(seed); base = Vector((0, 0, 0)); top = Vector((lean, 0, h)); ctl = Vector((lean * 0.1, 0, h * 0.6))
        at = lambda t: mix(mix(base, ctl, t), mix(ctl, top, t), t); bm = bmesh.new(); n = 9
        for i in range(n): cap(bm, at(i / n), at((i + 1) / n), (0.16 - 0.06 * i / n) * 1.08, 0.16 - 0.06 * (i + 1) / n, seg=14)
        st.make(bm, 'trunk', 'trunk')
        for i in range(9):
            a = i / 9 * math.tau + (rnd.random() - 0.5) * 0.35 + 0.3; bm = bmesh.new()
            leaf(bm, top + Vector((0, 0, 0.03)), (math.cos(a), math.sin(a)), r * (0.85 + rnd.random() * 0.3), 0.21 + rnd.random() * 0.05, 0.3, 0.42, n=12, fold=0.5)
            st.make(bm, 'leaf', 'leaf' if i % 3 else 'leaf2', solid=0.035)
        bm = bmesh.new()
        for dx, dy in ((-0.09, -0.07), (0.09, -0.09), (0.0, -0.14)): sph(bm, top + Vector((dx, dy, -0.1)), 0.1, seg=12)
        st.make(bm, 'nuts', 'nut'); return None
    return b
def bush(seed, size, flower=None):
    def b(st):
        rnd = random.Random(seed); bm = bmesh.new()
        for i in range(3 + int(rnd.random() * 3)): sph(bm, Vector(((rnd.random() - 0.5) * size * 1.3, (rnd.random() - 0.5) * size * 0.7, size * (0.35 + rnd.random() * 0.3))), size * (0.5 + rnd.random() * 0.35), (1, 1, 0.85), seg=14)
        st.make(bm, 'bush', rnd.choice(['leaf', 'leaf3', 'leaf2']), remesh=0.03, soften=3)
        if flower:
            bm = bmesh.new()
            for j in range(2 + int(rnd.random() * 2)):
                c = Vector(((rnd.random() - 0.5) * size, -size * 0.45, size * (0.5 + rnd.random() * 0.4)))
                for i in range(5): a = i / 5 * math.tau; sph(bm, c + Vector((math.cos(a) * 0.07, 0, math.sin(a) * 0.07)), 0.06, seg=8)
            st.make(bm, 'flowers', flower, line=False)
        return None
    return b
def bigleaf(seed, size):
    def b(st):
        rnd = random.Random(seed)
        for i in range(6 + int(rnd.random() * 3)):
            a = rnd.random() * math.tau; bm = bmesh.new(); leaf(bm, Vector((0, 0, 0.06)), (math.cos(a), math.sin(a)), size * (1.0 + rnd.random() * 0.6), 0.32 + rnd.random() * 0.08, 0.62, 0.3, n=8, fold=0.35)
            st.make(bm, 'bigleaf', rnd.choice(['leaf', 'leaf2', 'leaf3']), solid=0.035)
        return None
    return b
def rock(seed, r, m='rock'):
    def b(st):
        rnd = random.Random(seed); bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=2, radius=r)
        for v in bm.verts: v.co *= 0.86 + rnd.random() * 0.28; v.co.z *= 0.7; v.co.y *= 0.85; v.co.z += r * 0.38
        st.make(bm, 'rock', m, smooth=False); return None
    return b
def tuft(seed):
    def b(st):
        rnd = random.Random(seed)
        for i in range(5):
            a = -0.9 + i * 0.45 + (rnd.random() - 0.5) * 0.2; bm = bmesh.new(); leaf(bm, Vector((0, 0, 0)), (math.sin(a), -0.3 + rnd.random() * 0.6), 0.3 + rnd.random() * 0.14, 0.14, 1.1, 0.2, n=6, fold=0.4)
            st.make(bm, 'blade', 'leaf2' if i % 2 else 'leaf', solid=0.03, line=False)      # no line on grass: thin things ink to black (docs/rules.md 26)
        return None
    return b
def chest(open_=0.0):
    def b(st):
        bm = bmesh.new(); box(bm, (0, 0, 0.17), (0.6, 0.38, 0.34)); st.make(bm, 'chest', 'wood', smooth=False)
        Lm = Matrix.Translation(Vector((0, 0.19, 0.34))) @ D.rx(-95 * open_) @ Matrix.Translation(Vector((0, -0.19, 0)))     # the lid on its hinge at the back
        bm = bmesh.new(); cyl(bm, (0, 0, 0), 0.19, 0.6, axis=(1, 0, 0)); cut_below(bm)
        o = st.make(bm, 'lid', 'woodHi'); o.matrix_local = Lm
        bm = bmesh.new()
        for dx in (-0.2, 0.2): box(bm, (dx, 0, 0.172), (0.08, 0.4, 0.35))
        box(bm, (0, -0.2, 0.28), (0.12, 0.04, 0.14)); st.make(bm, 'bands', 'brass', smooth=False)
        bm = bmesh.new()
        for dx in (-0.2, 0.2): cyl(bm, (dx, 0, 0), 0.2, 0.08, axis=(1, 0, 0))
        cut_below(bm); o = st.make(bm, 'lidbands', 'brass'); o.matrix_local = Lm
        if open_ > 0.5:      # what is inside
            bm = bmesh.new()
            for i in range(9): sph(bm, (-0.2 + (i % 5) * 0.1, -0.06 + (i // 5) * 0.12, 0.33 + 0.03 * (i % 2)), 0.07, (1, 1, 0.5), seg=10)
            st.make(bm, 'gold', 'gold')
        return None
    return b
def barrel():
    def b(st):
        bm = bmesh.new(); cyl(bm, (0, 0, 0.16), 0.2, 0.32, r2=0.25); cyl(bm, (0, 0, 0.48), 0.25, 0.32, r2=0.2); st.make(bm, 'barrel', 'wood')
        bm = bmesh.new(); cyl(bm, (0, 0, 0.14), 0.232, 0.055, r2=0.24); cyl(bm, (0, 0, 0.5), 0.24, 0.055, r2=0.232); st.make(bm, 'hoops', 'iron')
        bm = bmesh.new(); cyl(bm, (0, 0, 0.645), 0.175, 0.02); st.make(bm, 'top', 'woodHi'); return None
    return b
def crate():
    def b(st):
        bm = bmesh.new(); box(bm, (0, 0, 0.21), (0.44, 0.44, 0.42)); st.make(bm, 'crate', 'woodHi', smooth=False)
        bm = bmesh.new()
        for z in (0.04, 0.38): box(bm, (0, -0.225, z), (0.46, 0.03, 0.07)); box(bm, (0.225, 0, z), (0.03, 0.46, 0.07)); box(bm, (-0.225, 0, z), (0.03, 0.46, 0.07))
        box(bm, (0, -0.225, 0.21), (0.07, 0.03, 0.36), rot=D.ry(42)); st.make(bm, 'slats', 'wood', smooth=False); return None
    return b
def dock(n=3):
    """a piece of dock running away from the camera: planks on posts; pieces set end to end make a longer one"""
    def b(st):
        bm = bmesh.new()
        for i in range(n * 3): box(bm, (0, 0.08 + i * 0.19, 0.25 + 0.006 * (i % 2)), (1.1, 0.17, 0.06))
        st.make(bm, 'planks', 'woodHi', smooth=False)
        bm = bmesh.new()
        for sx in (-1, 1):
            for j in range(2): cyl(bm, (sx * 0.5, 0.08 + j * (n * 3 - 1) * 0.19, 0.19), 0.07, 0.5, seg=10)
        st.make(bm, 'posts', 'woodDark'); return None
    return b
def boat():
    def b(st):
        bm = bmesh.new(); sph(bm, (0, 0, 0.16), 1.0, (0.36, 0.8, 0.24), seg=24)
        bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], dist=1e-5, plane_co=(0, 0, 0.2), plane_no=(0, 0, 1), clear_outer=True)
        st.make(bm, 'hull', 'wood', solid=0.05)
        bm = bmesh.new()
        for y in (-0.3, 0.25): box(bm, (0, y, 0.17), (0.6, 0.12, 0.04))
        st.make(bm, 'seats', 'woodHi', smooth=False); return None
    return b

# ---------------------------------------------------------------- the harbour: houses, a stall, a sign, a lamp, a well
def house(w, d, h, roof='roof', wall='plaster', door=True):
    def b(st):
        bm = bmesh.new(); box(bm, (0, 0, h / 2), (w, d, h)); st.make(bm, 'walls', wall, smooth=False)
        bm = bmesh.new(); rh = w * 0.42     # a pitched roof, its ridge running back
        v = [bm.verts.new(p) for p in ((-w / 2 - 0.1, -d / 2 - 0.1, h), (w / 2 + 0.1, -d / 2 - 0.1, h), (w / 2 + 0.1, d / 2 + 0.1, h), (-w / 2 - 0.1, d / 2 + 0.1, h), (0, -d / 2 - 0.1, h + rh), (0, d / 2 + 0.1, h + rh))]
        for f in ((0, 1, 4), (1, 2, 5, 4), (2, 3, 5), (3, 0, 4, 5), (0, 3, 2, 1)): bm.faces.new([v[i] for i in f])
        st.make(bm, 'roof', roof, smooth=False)
        if door: bm = bmesh.new(); box(bm, (-w * 0.18, -d / 2 - 0.01, 0.3), (0.3, 0.04, 0.6)); st.make(bm, 'door', 'woodDark', smooth=False)
        bm = bmesh.new(); box(bm, (w * 0.2, -d / 2 - 0.01, h * 0.58), (0.3, 0.04, 0.3))
        if h > 1.6: box(bm, (-w * 0.2, -d / 2 - 0.01, h * 0.78), (0.26, 0.04, 0.26))
        st.make(bm, 'windows', 'glass', smooth=False)
        bm = bmesh.new(); box(bm, (w * 0.2, -d / 2 - 0.03, h * 0.58 - 0.18), (0.38, 0.06, 0.05)); box(bm, (w * 0.3, 0, h + rh * 0.55), (0.18, 0.18, 0.5)); st.make(bm, 'trim', 'woodHi', smooth=False); return None
    return b
def stall():
    def b(st):
        bm = bmesh.new(); box(bm, (0, 0, 0.3), (1.1, 0.5, 0.6)); st.make(bm, 'counter', 'wood', smooth=False)
        bm = bmesh.new()
        for sx in (-1, 1): cyl(bm, (sx * 0.52, 0.2, 0.75), 0.04, 1.5, seg=8); cyl(bm, (sx * 0.52, -0.22, 0.65), 0.04, 1.3, seg=8)
        st.make(bm, 'poles', 'woodDark')
        for i in range(5):       # a striped awning, sloping to the front
            bm = bmesh.new(); x = -0.52 + i * 0.26; plate(bm, [(x - 0.13, 0.3, 1.5), (x + 0.13, 0.3, 1.5), (x + 0.13, -0.42, 1.2), (x - 0.13, -0.42, 1.2)]); st.make(bm, 'awning', 'awning' if i % 2 else 'white', solid=0.03, smooth=False)
        for x, m in ((-0.35, 'red'), (0.0, 'yellow'), (0.35, 'leaf2')):
            bm = bmesh.new()
            for j in range(4): sph(bm, (x - 0.08 + (j % 2) * 0.14, -0.1 + (j // 2) * 0.14, 0.66), 0.08, seg=10)
            st.make(bm, 'goods', m)
        return None
    return b
def sign():
    def b(st):
        bm = bmesh.new(); cyl(bm, (0, 0, 0.45), 0.045, 0.9, seg=8); st.make(bm, 'post', 'woodDark')
        bm = bmesh.new(); box(bm, (0, -0.02, 0.8), (0.5, 0.05, 0.28)); st.make(bm, 'board', 'woodHi', smooth=False); return None
    return b
def lamp():
    def b(st):
        bm = bmesh.new(); cyl(bm, (0, 0, 0.6), 0.04, 1.2, seg=8); cyl(bm, (0, 0, 0.03), 0.1, 0.06, seg=10); st.make(bm, 'post', 'black')
        bm = bmesh.new(); box(bm, (0, 0, 1.3), (0.18, 0.18, 0.22)); st.make(bm, 'light', 'yellow', smooth=False)
        bm = bmesh.new(); cyl(bm, (0, 0, 1.45), 0.16, 0.08, r2=0.03, seg=8); st.make(bm, 'cap', 'black'); return None
    return b
def well():
    def b(st):
        bm = bmesh.new(); cyl(bm, (0, 0, 0.2), 0.36, 0.4, seg=14); st.make(bm, 'ring', 'stone', smooth=False)
        bm = bmesh.new(); cyl(bm, (0, 0, 0.405), 0.28, 0.01, seg=14); st.make(bm, 'water', 'glass')
        bm = bmesh.new()
        for sx in (-1, 1): cyl(bm, (sx * 0.33, 0, 0.65), 0.04, 0.9, seg=8)
        box(bm, (0, 0, 1.08), (0.8, 0.5, 0.06)); st.make(bm, 'frame', 'woodDark', smooth=False); return None
    return b

def coins():
    def b(st):
        bm = bmesh.new()
        for x, y, z in ((0, 0, 0.03), (0.13, 0.04, 0.03), (-0.1, 0.08, 0.03), (0.05, -0.1, 0.03), (0.03, 0.02, 0.09), (-0.04, -0.03, 0.14)): cyl(bm, (x, y, z), 0.09, 0.05, seg=12)
        st.make(bm, 'coins', 'gold'); return None
    return b
def bundle():
    def b(st):
        bm = bmesh.new(); sph(bm, (0, 0, 0.13), 0.17, (1.1, 0.95, 0.8), seg=16); sph(bm, (0.0, 0, 0.3), 0.07, (1.3, 1.0, 0.7), seg=10); st.make(bm, 'sack', 'linen', remesh=0.012, soften=3)
        bm = bmesh.new(); cyl(bm, (0, 0, 0.26), 0.07, 0.035, seg=10); st.make(bm, 'tie', 'rope'); return None
    return b
def potion():
    def b(st):
        bm = bmesh.new(); sph(bm, (0, 0, 0.12), 0.12, seg=14); cyl(bm, (0, 0, 0.25), 0.05, 0.1, seg=10); st.make(bm, 'bottle', 'red', remesh=0.01, soften=2)
        bm = bmesh.new(); cyl(bm, (0, 0, 0.32), 0.055, 0.05, seg=10); st.make(bm, 'cork', 'wood')
        bm = bmesh.new(); sph(bm, (-0.05, -0.09, 0.16), 0.03, (1, 0.5, 1.6), seg=8); st.make(bm, 'shine', 'white', line=False); return None
    return b

SETS = {
    'loot': [('coins', coins()), ('gear', bundle()), ('potion', potion())],
    'island': [('palm-a', palm(3, 2.9, 0.55, 1.25)), ('palm-b', palm(8, 2.5, -0.5, 1.1)), ('palm-c', palm(5, 1.9, 0.2, 1.0)), ('bush-a', bush(11, 0.42)), ('bush-b', bush(12, 0.5, 'pink')), ('bush-c', bush(14, 0.36, 'yellow')), ('bush-d', bush(15, 0.6)),
               ('bigleaf-a', bigleaf(21, 0.5)), ('bigleaf-b', bigleaf(22, 0.62)), ('rock-a', rock(2, 0.5)), ('rock-b', rock(4, 0.28)), ('rock-c', rock(7, 0.36)), ('rock-d', rock(9, 0.75)), ('rock-e', rock(13, 1.05)), ('tuft-a', tuft(1)), ('tuft-b', tuft(2)),
               ('barrel', barrel()), ('crate', crate()), ('dock', dock(3)), ('boat', boat()), ('chest/closed', chest(0.0)), ('chest/opening', chest(0.45)), ('chest/open', chest(1.0))],
    'harbour': [('house-a', house(1.9, 1.4, 1.5, 'roof')), ('house-b', house(1.6, 1.3, 1.9, 'roofBlue')), ('house-c', house(2.3, 1.5, 1.4, 'roof')), ('stall', stall()), ('sign', sign()), ('lamp', lamp()), ('well', well()),
                ('barrel', barrel()), ('crate', crate()), ('dock', dock(3)), ('boat', boat()), ('palm-b', palm(8, 2.5, -0.5, 1.1)), ('bush-b', bush(12, 0.5, 'pink'))],
}
if __name__ == '__main__':
    a = D.args(); which = a[0] if a else 'island'; out = os.path.abspath(a[1]) if len(a) > 1 else os.path.join(HERE, '..', 'work', which, 'render'); st = D.Stage(); recs = []
    for name, fn in SETS[which]: recs += D.render_items(st, [{'name': name, 'build': fn}], out, (512, 512, 256, 400))
    json.dump({'px': D.PX, 'unit': D.UNIT, 'items': recs}, open(os.path.join(out, 'meta.json'), 'w', encoding='utf-8'), indent=1)
