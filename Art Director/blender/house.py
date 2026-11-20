"""house.py: the things that lie and stand on the floors of the house's first world (Leonard, AD, 2026-11-20; every design is mine).
Robin, 2026-11-20: a shrunk person in a house; of three sizes "Go for 2": he is bean size, 1.5 cm, so a centimetre is
36 design pixels. Each thing is built in centimetres, whole, with its origin where it meets the floor, and made the way the
island's props were (blender/drok.py: two flat tones, the dark line). The first dozen are the models of the concept still
(concepts/house/build.py); the rest are new. tools/things.js lays the shadow under each and packs them.
  node tools/blender.js blender/house.py -- work/things/render [name,name...]"""
import sys, os, math, random, json
HERE = os.path.dirname(os.path.abspath(__file__)); CON = os.path.abspath(os.path.join(HERE, '..', 'concepts', 'house'))
for p in (HERE, CON):
    if p not in sys.path: sys.path.insert(0, p)
import bpy, bmesh
from mathutils import Vector, Matrix
import drok as D, build as B
from drok import sph, cap, box, cyl, mix, plate
from build import sharp, cut

CM = 36.0
D.HEX.update({
    'sugar': '#ffffff', 'sugarLo': '#e8e4f6', 'water': '#aee6f2', 'spool': '#f0c78c', 'spoolHi': '#fbe0b0', 'yarn': '#ff6a94', 'yarnHi': '#ff94b2', 'beadB': '#ffd640', 'card': '#c9a86a', 'puzzle': '#73cf52', 'puzzleHi': '#9be07a',
    'wax': '#3fb95e', 'waxHi': '#73cf52', 'paper': '#fff6e0', 'blockWood': '#f2cf9a', 'blockHi': '#fbe3b8', 'legT': '#e9423a', 'legTHi': '#ff6a55', 'legC': '#fff3d6', 'legCHi': '#ffffff', 'raisin': '#7a3f6b', 'fluff': '#d6cdee', 'cork': '#e0b27a', 'corkHi': '#f0cb98',
    'corkDark': '#b98850', 'wrap': '#ff6a94', 'wrapHi': '#ffc2d2', 'corn': '#fff6d6', 'cornHi': '#ffd640', 'juice': '#f6883a', 'juiceHi': '#ffb066', 'match': '#3d86b8', 'matchHi': '#5aa6d6', 'tray': '#f2cf9a', 'trayIn': '#d9a86a', 'strike': '#7a4a3a', 'matchHead': '#e9423a',
})

def tube(bm, pts, r, seg=8):
    for a, b in zip(pts, pts[1:]): cap(bm, a, b, r, r, seg=seg)
def blob(seed, r, wob=0.4, flat=0.72, sub=2):
    bm = bmesh.new(); rnd = random.Random(seed); bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=r)
    for v in bm.verts: v.co *= 1 - wob / 2 + rnd.random() * wob; v.co.z *= flat; v.co.z += r * flat * 0.6
    return bm
def puddle(seed, rx, ry, n=44, wob=0.3, z=0.02):
    """a soft, uneven outline: a spilt drop"""
    rnd = random.Random(seed); ph = [rnd.random() * math.tau for _ in range(3)]; k = lambda a: 1 + wob * (0.5 * math.sin(2 * a + ph[0]) + 0.3 * math.sin(3 * a + ph[1]) + 0.2 * math.sin(5 * a + ph[2]))
    return [(rx * math.cos(i / n * math.tau) * k(i / n * math.tau), ry * math.sin(i / n * math.tau) * k(i / n * math.tau), z) for i in range(n)]

# ---------------------------------------------------------------- the new things, in centimetres
def sugar():
    def b(st):
        bm = bmesh.new(); box(bm, (0, 0, 0.75), (1.5, 1.5, 1.5)); o = st.make(bm, 'cube', 'sugar', smooth=False); md = o.modifiers.new('bv', 'BEVEL'); md.width = 0.1; md.segments = 2
        rnd = random.Random(4); bm = bmesh.new()
        for i in range(16): sph(bm, (rnd.uniform(-0.62, 0.62), -0.752, rnd.uniform(0.15, 1.35)), 0.05, (1, 0.3, 1), seg=6)
        for i in range(12): sph(bm, (rnd.uniform(-0.62, 0.62), rnd.uniform(-0.62, 0.62), 1.502), 0.05, (1, 1, 0.3), seg=6)
        st.make(bm, 'grains', 'sugarLo', line=False); return None
    return b
def drop(seed=2, rx=0.9, ry=0.62, m='water'):
    def b(st):
        bm = bmesh.new(); plate(bm, puddle(seed, rx, ry)); st.make(bm, 'drop', m, solid=0.03, smooth=False)
        bm = bmesh.new(); sph(bm, (-rx * 0.3, ry * 0.25, 0.05), rx * 0.2, (1.6, 0.7, 0.1), seg=10); sph(bm, (rx * 0.25, -ry * 0.3, 0.05), rx * 0.09, (1, 1, 0.1), seg=8); st.make(bm, 'shine', 'white', line=False); return None
    return b
def spool():
    def b(st):
        bm = bmesh.new(); cyl(bm, (0, 0, 0.18), 1.6, 0.36, seg=36); cyl(bm, (0, 0, 3.62), 1.6, 0.36, seg=36); sharp(st.make(bm, 'ends', 'spool'))
        bm = bmesh.new(); cyl(bm, (0, 0, 3.805), 1.36, 0.02, seg=36); sharp(st.make(bm, 'top', 'spoolHi'))
        bm = bmesh.new(); cyl(bm, (0, 0, 3.82), 0.42, 0.02, seg=20); st.make(bm, 'hole', 'eye', line=False)
        bm = bmesh.new(); cyl(bm, (0, 0, 1.9), 1.28, 3.1, seg=36); sharp(st.make(bm, 'thread', 'thread'))
        bm = bmesh.new()
        for i in range(7): z = 0.62 + i * 0.43; cyl(bm, (0, 0, z), 1.292, 0.07, seg=36)
        st.make(bm, 'turns', 'red', line=False)
        bm = bmesh.new(); tube(bm, [(1.2, -0.5, 0.5), (1.9, -1.0, 0.07), (2.5, -0.6, 0.07), (3.0, -1.1, 0.07)], 0.07, seg=6); st.make(bm, 'tail', 'thread'); return None
    return b
def needle():
    def b(st):
        bm = bmesh.new(); cyl(bm, (0.2, 0, 0.09), 0.09, 3.8, axis=(1, 0, 0), seg=10); cyl(bm, (2.3, 0, 0.09), 0.09, 0.5, axis=(1, 0, 0), r2=0.01, seg=10); sph(bm, (-1.9, 0, 0.09), 0.16, (2.0, 0.8, 0.5), seg=12); sharp(st.make(bm, 'needle', 'steel'))
        bm = bmesh.new(); sph(bm, (-1.9, 0, 0.14), 0.07, (2.4, 0.6, 0.4), seg=8); st.make(bm, 'eye', 'eye', line=False)
        bm = bmesh.new(); tube(bm, [(-1.9, 0.0, 0.12), (-2.2, -0.45, 0.06), (-1.6, -0.8, 0.06), (-0.9, -0.55, 0.06), (-0.4, -0.9, 0.06)], 0.06, seg=6); st.make(bm, 'thread', 'thread'); return None
    return b
def safety_pin():
    def b(st):
        bm = bmesh.new(); tube(bm, [(-1.3, 0.28, 0.08), (1.05, 0.28, 0.08)], 0.07, seg=8); tube(bm, [(-1.3, -0.28, 0.08), (1.2, -0.22, 0.08)], 0.07, seg=8)
        n = 10; tube(bm, [(-1.3 - 0.28 * math.sin(i / n * math.pi), 0.28 * math.cos(i / n * math.pi), 0.08 + 0.05 * math.sin(i / n * math.pi)) for i in range(n + 1)], 0.07, seg=8); st.make(bm, 'wire', 'steel')
        bm = bmesh.new(); sph(bm, (1.25, 0.0, 0.1), 0.36, (1.0, 1.15, 0.36), seg=16); st.make(bm, 'head', 'brass'); return None
    return b
def yarn():
    def b(st):
        bm = bmesh.new(); sph(bm, (0, 0, 2.5), 2.5, seg=36); st.make(bm, 'ball', 'yarn')
        bm = bmesh.new(); rnd = random.Random(6)
        for k in range(9):
            ax = Vector((rnd.uniform(-1, 1), rnd.uniform(-1, 1), rnd.uniform(-0.4, 1))).normalized(); u = ax.orthogonal().normalized(); w = ax.cross(u); n = 28
            for off in (-0.16, 0.0, 0.16):
                rr = math.sqrt(max(0.01, 2.52 ** 2 - (off * 2.5) ** 2)); pts = [Vector((0, 0, 2.5)) + ax * off * 2.5 + (u * math.cos(i / n * math.tau) + w * math.sin(i / n * math.tau)) * rr for i in range(n + 1)]
                tube(bm, pts, 0.05, seg=4)
        st.make(bm, 'turns', 'yarnHi', line=False)
        bm = bmesh.new(); tube(bm, [(1.6, -1.6, 0.4), (2.4, -2.3, 0.1), (3.2, -1.9, 0.1), (3.5, -2.6, 0.1), (2.9, -3.0, 0.1)], 0.1, seg=6); st.make(bm, 'strand', 'yarn'); return None
    return b
def bead(m):
    def b(st):
        bm = bmesh.new(); sph(bm, (0, 0, 0.42), 0.45, (1, 1, 0.92), seg=20); st.make(bm, 'bead', m)
        bm = bmesh.new(); sph(bm, (0, 0, 0.83), 0.13, (1, 1, 0.3), seg=8); st.make(bm, 'hole', 'eye', line=False)
        bm = bmesh.new(); sph(bm, (-0.17, -0.3, 0.6), 0.08, (1.5, 0.6, 1), seg=6); st.make(bm, 'shine', 'white', line=False); return None
    return b
def puzzle():
    def b(st):
        P2 = [(-1.2, -1.2), (-0.3, -1.2)] + [(0.33 * math.cos(a) * 1.0, -1.5 + 0.33 * math.sin(a)) for a in [math.radians(200 - i * 44) for i in range(6)]] + [(0.3, -1.2), (1.2, -1.2), (1.2, -0.3)]
        P2 += [(1.5 + 0.33 * math.cos(a), 0.33 * math.sin(a)) for a in [math.radians(-110 + i * 44) for i in range(6)]] + [(1.2, 0.3), (1.2, 1.2), (0.3, 1.2)]
        P2 += [(0.33 * math.cos(a), 0.9 + 0.33 * math.sin(a)) for a in [math.radians(20 - i * 44) for i in range(6)]] + [(-0.3, 1.2), (-1.2, 1.2), (-1.2, 0.3)]
        P2 += [(-0.9 + 0.33 * math.cos(a), 0.33 * math.sin(a)) for a in [math.radians(110 - i * 44) for i in range(6)]] + [(-1.2, -0.3)]
        bm = bmesh.new(); plate(bm, [(x, y, 0.1) for x, y in P2]); st.make(bm, 'card', 'card', solid=0.2, smooth=False)
        bm = bmesh.new(); plate(bm, [(x * 0.94, y * 0.94, 0.215) for x, y in P2]); st.make(bm, 'picture', 'puzzle', solid=0.02, smooth=False)
        bm = bmesh.new(); sph(bm, (-0.2, 0.1, 0.23), 0.5, (1.3, 0.8, 0.05), seg=12); st.make(bm, 'patch', 'puzzleHi', line=False); return None
    return b
def crayon():
    def b(st):
        ax = (1, 0, 0); r = 0.42
        bm = bmesh.new(); cyl(bm, (0, 0, r), r, 6.8, axis=ax, seg=20); cyl(bm, (3.75, 0, r), r, 0.7, axis=ax, r2=0.16, seg=20); sph(bm, (4.1, 0, r), 0.16, seg=10); sharp(st.make(bm, 'wax', 'wax'))
        bm = bmesh.new(); cyl(bm, (-0.5, 0, r), r * 1.05, 4.6, axis=ax, seg=20); sharp(st.make(bm, 'paper', 'paper'))
        bm = bmesh.new(); cyl(bm, (-2.4, 0, r), r * 1.07, 0.28, axis=ax, seg=20); cyl(bm, (1.4, 0, r), r * 1.07, 0.28, axis=ax, seg=20); st.make(bm, 'bands', 'waxHi', line=False); return None
    return b
def block():
    def b(st):
        bm = bmesh.new(); box(bm, (0, 0, 1.5), (3.0, 3.0, 3.0)); o = st.make(bm, 'block', 'blockWood', smooth=False); md = o.modifiers.new('bv', 'BEVEL'); md.width = 0.16; md.segments = 2
        bm = bmesh.new(); box(bm, (0, 0, 3.0), (2.4, 2.4, 0.02)); st.make(bm, 'top', 'rare', smooth=False)
        bm = bmesh.new(); box(bm, (0, 0, 3.02), (1.9, 1.9, 0.02)); st.make(bm, 'topIn', 'blockHi', smooth=False, line=False)
        bm = bmesh.new(); n = 5
        for i in range(n): a = math.radians(90 + i * 144); c = math.radians(90 + (i + 1) * 144); cap(bm, (0.72 * math.cos(a), 0.72 * math.sin(a), 3.04), (0.72 * math.cos(c), 0.72 * math.sin(c), 3.04), 0.1, 0.1, seg=6)
        st.make(bm, 'star', 'rare', line=False)
        bm = bmesh.new(); box(bm, (0, -1.5, 1.5), (2.4, 0.02, 2.4)); st.make(bm, 'front', 'red', smooth=False)
        bm = bmesh.new(); box(bm, (0, -1.52, 1.5), (1.9, 0.02, 1.9)); st.make(bm, 'frontIn', 'blockHi', smooth=False, line=False)
        bm = bmesh.new()
        for a, c in (((-0.55, 0.85), (0.0, 2.2)), ((0.55, 0.85), (0.0, 2.2)), ((-0.32, 1.3), (0.32, 1.3))): cap(bm, (a[0], -1.54, a[1]), (c[0], -1.54, c[1]), 0.13, 0.13, seg=6)
        st.make(bm, 'letter', 'red', line=False)
        bm = bmesh.new(); box(bm, (1.5, 0, 1.5), (0.02, 2.4, 2.4)); st.make(bm, 'side', 'leaf', smooth=False); return None
    return b
def fork():
    """lying along X, the handle at -X: 19 cm of steel"""
    def b(st):
        H = [(-9.5, -0.62), (-9.2, -0.8), (-8.6, -0.82), (-3.4, -0.42), (-0.6, -0.36), (0.6, -1.25), (4.2, -1.3), (4.2, 1.3), (0.6, 1.25), (-0.6, 0.36), (-3.4, 0.42), (-8.6, 0.82), (-9.2, 0.8), (-9.5, 0.62)]
        bm = bmesh.new(); plate(bm, [(x, y, 0.16) for x, y in H]); st.make(bm, 'fork', 'steel', solid=0.26, smooth=False)
        bm = bmesh.new()
        for i in range(4): y = -1.05 + i * 0.7; box(bm, (6.75, y, 0.16), (5.3, 0.42, 0.26)); cyl(bm, (9.5, y, 0.16), 0.21, 0.26, seg=10)
        st.make(bm, 'tines', 'steel', smooth=False)
        bm = bmesh.new(); plate(bm, [(-8.9, -0.5, 0.3), (-4.0, -0.2, 0.3), (-4.0, 0.2, 0.3), (-8.9, 0.5, 0.3)]); st.make(bm, 'groove', 'iron', solid=0.02, smooth=False, line=False); return None
    return b
def raisin():
    def b(st):
        bm = blob(9, 0.62, wob=0.5, flat=0.7, sub=2); st.make(bm, 'raisin', 'raisin', smooth=False); return None
    return b
def dust():
    def b(st):
        rnd = random.Random(3); bm = bmesh.new()
        for i in range(11): a = rnd.random() * math.tau; d = rnd.random() * 0.95; sph(bm, (d * math.cos(a) * 1.3, d * math.sin(a) * 0.9, 0.55 + rnd.random() * 0.5), 0.5 + rnd.random() * 0.3, seg=12)
        st.make(bm, 'fluff', 'fluff', remesh=0.09, soften=3)
        bm = bmesh.new()
        for i in range(7): a = rnd.random() * math.tau; p = Vector((1.2 * math.cos(a), 0.8 * math.sin(a), 0.5)); tube(bm, [p, p * 1.3 + Vector((0, 0, 0.25)), p * 1.55 + Vector((rnd.uniform(-0.2, 0.2), 0, -0.1))], 0.035, seg=4)
        st.make(bm, 'hairs', 'iron', line=False); return None
    return b
def cork():
    def b(st):
        ax = (1, 0, 0); r = 1.1
        bm = bmesh.new(); cyl(bm, (0, 0, r), r, 4.4, axis=ax, r2=r * 0.94, seg=28); sharp(st.make(bm, 'cork', 'cork'))
        bm = bmesh.new(); cyl(bm, (-2.205, 0, r), r * 0.86, 0.02, axis=ax, seg=24); st.make(bm, 'end', 'corkHi', line=False)
        rnd = random.Random(8); bm = bmesh.new()
        for i in range(16): x = rnd.uniform(-1.9, 1.9); a = rnd.uniform(-2.2, 0.2); sph(bm, (x, r * math.sin(a) * 1.0, r + r * math.cos(a) * 1.0), 0.09, (1.6, 0.6, 0.6), seg=6)
        st.make(bm, 'specks', 'corkDark', line=False); return None
    return b
def wrapper():
    def b(st):
        bm = bmesh.new(); plate(bm, [(-1.1, -0.7, 0.06), (1.1, -0.7, 0.06), (1.1, 0.7, 0.06), (-1.1, 0.7, 0.06)]); st.make(bm, 'middle', 'wrap', solid=0.1, smooth=False)
        bm = bmesh.new()
        for s in (-1, 1): plate(bm, [(s * 1.1, -0.2, 0.05), (s * 2.3, -0.95, 0.05), (s * 2.5, -0.3, 0.05), (s * 2.35, 0.4, 0.05), (s * 2.1, 0.95, 0.05), (s * 1.1, 0.2, 0.05)] if s > 0 else [(s * 1.1, 0.2, 0.05), (s * 2.1, 0.95, 0.05), (s * 2.35, 0.4, 0.05), (s * 2.5, -0.3, 0.05), (s * 2.3, -0.95, 0.05), (s * 1.1, -0.2, 0.05)])
        st.make(bm, 'ends', 'wrapHi', solid=0.06, smooth=False)
        bm = bmesh.new()
        for x in (-0.7, -0.23, 0.23, 0.7): box(bm, (x, 0, 0.115), (0.18, 1.4, 0.01))
        st.make(bm, 'stripes', 'white', smooth=False, line=False); return None
    return b
def popcorn():
    def b(st):
        bm = bmesh.new()
        for x, y, z, r in ((0, 0, 0.5, 0.5), (0.42, 0.1, 0.62, 0.38), (-0.4, 0.15, 0.6, 0.4), (0.05, -0.3, 0.8, 0.36), (0.1, 0.3, 0.95, 0.34)): sph(bm, (x, y, z), r, seg=12)
        st.make(bm, 'puff', 'corn', remesh=0.07, soften=2)
        bm = bmesh.new(); sph(bm, (0.05, -0.42, 0.42), 0.2, (1.2, 0.6, 1), seg=8); st.make(bm, 'hull', 'cornHi', line=False); return None
    return b
def matchbox(out=0.0):
    """the chest: a matchbox, its tray sliding out toward the camera. out: how far, in cm"""
    def b(st):
        L, Wd, Hh = 5.2, 3.6, 1.6
        bm = bmesh.new(); box(bm, (0, 0, Hh / 2), (Wd, L, Hh)); st.make(bm, 'sleeve', 'match', smooth=False)
        bm = bmesh.new(); box(bm, (0, 0, Hh + 0.005), (Wd - 0.5, L - 0.6, 0.02)); st.make(bm, 'label', 'yellow', smooth=False)
        bm = bmesh.new(); n = 5
        for i in range(n): a = math.radians(90 + i * 144); c = math.radians(90 + (i + 1) * 144); cap(bm, (0.9 * math.cos(a), 0.9 * math.sin(a), Hh + 0.03), (0.9 * math.cos(c), 0.9 * math.sin(c), Hh + 0.03), 0.13, 0.13, seg=6)
        st.make(bm, 'star', 'red', line=False)
        bm = bmesh.new(); box(bm, (Wd / 2 + 0.005, 0, Hh / 2), (0.02, L - 0.3, Hh - 0.3)); box(bm, (-Wd / 2 - 0.005, 0, Hh / 2), (0.02, L - 0.3, Hh - 0.3)); st.make(bm, 'strike', 'strike', smooth=False, line=False)
        y = -out; t = 0.12
        bm = bmesh.new(); box(bm, (0, y, 0.2 + t / 2), (Wd - 0.24, L - 0.1, t)); box(bm, (0, y - (L - 0.1) / 2 + t / 2, 0.2 + (Hh - 0.4) / 2), (Wd - 0.24, t, Hh - 0.4))
        for s in (-1, 1): box(bm, (s * ((Wd - 0.24) / 2 - t / 2), y, 0.2 + (Hh - 0.4) / 2), (t, L - 0.1, Hh - 0.4))
        st.make(bm, 'tray', 'tray', smooth=False)
        if out > 0.3:
            bm = bmesh.new(); box(bm, (0, y - L / 2 + out / 2 + 0.1, 0.34), (Wd - 0.5, max(0.1, out - 0.25), 0.02)); st.make(bm, 'inside', 'trayIn', smooth=False, line=False)
        if out > 1.5:
            bm = bmesh.new()
            for i, x in enumerate((-1.0, -0.35, 0.3, 0.95)): yy = y - L / 2 + 0.55; cyl(bm, (x, yy + 0.9, 0.5), 0.11, 1.9, axis=(0, 1, 0), seg=6)
            st.make(bm, 'sticks', 'blockHi', smooth=False)
            bm = bmesh.new()
            for i, x in enumerate((-1.0, -0.35, 0.3, 0.95)): sph(bm, (x, y - L / 2 + 0.5, 0.5), 0.2, (1, 1.3, 1), seg=8)
            st.make(bm, 'heads', 'matchHead')
        return None
    return b

# ---------------------------------------------------------------- what is rendered. ext: half its width, how far it reaches to the camera, away from it, how tall (cm)
def T(name, build, hw, front, back, tall, turn=0.0, **data): return dict(name=name, build=build, ext=(hw, front, back, tall), turn=turn, data=data)
THINGS = [
    T('coin', B.coin(), 1.2, 1.2, 1.2, 0.3, flat=1), T('dice', B.dice(), 1.25, 1.25, 1.25, 1.7, 28), T('sugar', sugar(), 1.2, 1.2, 1.2, 1.6, 18), T('crumb-a', B.crumb(3, 0.55), 0.8, 0.7, 0.7, 0.9), T('crumb-b', B.crumb(8, 0.34, 'crumbDark'), 0.5, 0.45, 0.45, 0.6),
    T('crumb-c', B.crumb(12, 0.22), 0.34, 0.3, 0.3, 0.4), T('pea', B.pea(), 0.45, 0.45, 0.45, 0.85), T('loop', B.loop(), 0.7, 0.7, 0.7, 0.45, flat=1), T('macaroni', B.macaroni(), 1.5, 1.5, 1.5, 0.8, 20), T('cap', B.bottlecap(), 1.6, 1.6, 1.6, 0.7),
    T('drop', drop(), 1.1, 0.8, 0.8, 0.15, flat=1), T('button', B.button(), 0.8, 0.8, 0.8, 0.3, flat=1), T('marble', B.marble(), 0.85, 0.85, 0.85, 1.7), T('spool', spool(), 3.2, 1.8, 1.8, 4.0), T('needle', needle(), 2.7, 1.3, 1.3, 0.3, 20, flat=1),
    T('safety-pin', safety_pin(), 1.9, 1.1, 1.1, 0.3, -25, flat=1), T('yarn', yarn(), 3.7, 3.4, 2.7, 5.2), T('bead-a', bead('rare'), 0.5, 0.5, 0.5, 0.95), T('bead-b', bead('beadB'), 0.5, 0.5, 0.5, 0.95), T('puzzle', puzzle(), 2.1, 2.1, 2.1, 0.3, 15, flat=1),
    T('crayon', crayon(), 4.4, 2.0, 2.0, 1.0, 16), T('block', block(), 2.3, 2.3, 2.3, 3.2, 20), T('chair-leg', B.leg(24, 1.75, 'legC'), 2.1, 2.1, 2.1, 7.4, fade=1), T('table-leg', B.leg(24, 3.0, 'legT', ring=3.6), 3.9, 3.9, 3.9, 7.4, fade=1),      # taller than the picture: its top edge cuts the leg straight, and tools/things.js fades it out
    T('pencil', B.pencil(17.5), 9.2, 2.0, 2.0, 0.8, 8, parts=3), T('fork', fork(), 9.9, 2.4, 2.4, 0.5, -6, parts=3, low=1), T('raisin', raisin(), 0.8, 0.7, 0.7, 0.9), T('dust', dust(), 2.1, 1.5, 1.5, 1.8), T('cork', cork(), 2.7, 2.3, 2.3, 2.3, 30),
    T('wrapper', wrapper(), 2.8, 1.7, 1.7, 0.2, -15, flat=1), T('popcorn', popcorn(), 1.0, 0.9, 0.9, 1.35), T('stain', drop(7, 2.1, 1.3, 'juice'), 2.4, 1.6, 1.6, 0.15, flat=1),
    T('chest/closed', matchbox(0.0), 2.7, 3.2, 3.2, 1.8, 10), T('chest/opening', matchbox(1.2), 2.7, 4.4, 3.2, 1.8, 10), T('chest/open', matchbox(2.6), 2.7, 5.8, 3.2, 1.8, 10),
]

def foot(st, turn, unit):
    """the outline of what the thing covers on the floor, as the picture shows it: the hull of its points seen from straight above"""
    Rz = Matrix.Rotation(math.radians(turn), 4, 'Z'); pts = []
    dg = bpy.context.evaluated_depsgraph_get()
    for o in st.objs:
        if o.name.split('.')[0] in ('tail', 'strand', 'hairs'): continue                      # a loose thread throws no shadow of its own
        e = o.evaluated_get(dg); me = e.to_mesh()
        for v in me.vertices: q = Rz @ (o.matrix_local @ v.co); pts.append((round(q.x * unit, 1), round(-q.y * D.SE * unit, 1)))
        e.to_mesh_clear()
    pts = sorted(set(pts))
    if len(pts) < 3: return pts
    cross = lambda o, a, b: (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); lo, up = [], []
    for p in pts:
        while len(lo) >= 2 and cross(lo[-2], lo[-1], p) <= 0: lo.pop()
        lo.append(p)
    for p in reversed(pts):
        while len(up) >= 2 and cross(up[-2], up[-1], p) <= 0: up.pop()
        up.append(p)
    hull = lo[:-1] + up[:-1]; step = max(1, len(hull) // 28); return hull[::step]

if __name__ == '__main__':
    a = D.args(); out = os.path.abspath(a[0]) if a else os.path.join(HERE, '..', 'work', 'things', 'render'); only = a[1].split(',') if len(a) > 1 else None
    st = D.Stage(); recs = []; old = os.path.join(out, 'meta.json')
    if only and os.path.exists(old): recs = [r for r in json.load(open(old, encoding='utf-8'))['items'] if r['name'] not in only]
    for t in THINGS:
        if only and t['name'] not in only: continue
        data = dict(t['data'])
        def wrapped(stage, t=t, data=data):
            anchor = t['build'](stage); data['foot'] = foot(stage, t['turn'], CM); return anchor
        recs += D.render_items(st, [dict(name=t['name'], build=wrapped, turn=t['turn'], frame=B.fr(CM, *t['ext']), data=data)], out, B.fr(CM, *t['ext']), unit=CM)
    order = [t['name'] for t in THINGS]; recs.sort(key=lambda r: order.index(r['name']))
    json.dump({'px': D.PX, 'unit': CM, 'items': recs}, open(os.path.join(out, 'meta.json'), 'w', encoding='utf-8'), indent=1)
    print('things:', len(recs), 'pictures')
