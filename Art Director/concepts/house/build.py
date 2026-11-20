"""build.py: the models for the three concepts of the new theme (Leonard, AD, 2026-11-20; every design is mine).
Robin, 2026-11-20: "A shrunk person and enemies are insects", "inside a house", and he "really liked the color and
aestethic of what we have now". So these are made the way the island was: small models, two flat tones, the dark line
(blender/drok.py). Nothing here is in the game.

The same kitchen floor is shown at three sizes of hero. A thing of the house is built in centimetres and rendered at the
size's pixels a centimetre; an insect and the hero's gear are built in the hero's own units (one unit is his height).
  thumb   he is 5 cm tall     10.8 design pixels a cm
  bean    he is 1.5 cm tall   36
  ant     he is 0.6 cm tall   90
  node tools/blender.js concepts/house/build.py -- work/house [thumb,bean,ant] [name,name...]"""
import sys, os, math, random, json
HERE = os.path.dirname(os.path.abspath(__file__)); BL = os.path.abspath(os.path.join(HERE, '..', '..', 'blender'))
if BL not in sys.path: sys.path.insert(0, BL)
import bpy, bmesh
from mathutils import Vector, Matrix
import drok as D, hero, gear, props
from drok import sph, cap, box, cyl, mix, plate

SE, CE = D.SE, D.CE
CM = {'thumb': 10.8, 'bean': 36.0, 'ant': 90.0}
D.HEX.update({
    'ant': '#5a55a0', 'antDark': '#3b3768', 'lady': '#f0443a', 'roach': '#c2692c', 'roachHi': '#e39a44', 'roachDark': '#7d4322', 'spider': '#9a68e0', 'spiderDark': '#5f3fa6', 'cream': '#fff3d6',
    'goldHi': '#ffd95e', 'marble': '#3d9cff', 'brick': '#f0443a', 'brickHi': '#ff6a55', 'pea': '#73cf52', 'cereal': '#f0b04a', 'crumb': '#e9bd7a', 'crumbDark': '#cf9a55', 'dice': '#f3ead6', 'diceHi': '#fffaf0',
    'pencil': '#ffd640', 'pencilHi': '#ffe680', 'eraser': '#ff8fa8', 'pencilWood': '#f2cf9a', 'capRed': '#f0443a', 'capRedHi': '#ff6a55', 'button': '#3d86b8', 'buttonHi': '#5aa6d6', 'pasta': '#ffd97a', 'pastaIn': '#d9a94a',
    'chair': '#d08a48', 'chairHi': '#e3a460', 'table': '#3d86b8', 'tableHi': '#5aa6d6', 'pad': '#8e9aa8', 'bowl': '#ffd640', 'bowlIn': '#e9a92a', 'kibble': '#a8683a', 'lentil': '#f6883a', 'thread': '#e9423a',
})

def sharp(o, deg=35):
    md = o.modifiers.new('es', 'EDGE_SPLIT'); md.split_angle = math.radians(deg); return o
def cut(bm, co, no):
    """keep what lies on the side the normal points to"""
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], dist=1e-6, plane_co=co, plane_no=no, clear_inner=True)

# ---------------------------------------------------------------- the insects: built facing -Y, k times the hero's unit; round, with big eyes
def ant(k=1.0, rear=0.0, step=None, jaws=0.0):
    def b(st):
        R = D.rx(-rear); R3 = R.to_3x3(); piv = Vector((0, 0.42 * k, 0.12 * k))
        bp = lambda x, y, z: piv + (R3 @ (Vector((x * k, y * k, z * k)) - piv))
        bm = bmesh.new(); sph(bm, bp(0, 0.4, 0.3), 0.21 * k, (1, 1.34, 0.9), seg=24, rot=R @ D.rx(-10)); st.make(bm, 'abdomen', 'ant')
        bm = bmesh.new(); sph(bm, bp(0, 0.03, 0.25), 0.125 * k, (0.95, 1.35, 0.9), seg=16, rot=R); sph(bm, bp(0, 0.2, 0.24), 0.06 * k, seg=10); st.make(bm, 'thorax', 'ant')
        bm = bmesh.new(); sph(bm, bp(0, -0.25, 0.31), 0.185 * k, (1.06, 0.95, 0.92), seg=24, rot=R); st.make(bm, 'head', 'ant')
        bm = bmesh.new()
        for s in (-1, 1): cap(bm, bp(s * (0.09 + 0.05 * jaws), -0.38, 0.22), bp(s * (0.03 + 0.1 * jaws), -0.54, 0.19), 0.042 * k, 0.014 * k, seg=8)
        st.make(bm, 'jaws', 'antDark')
        bm = bmesh.new(); ROOT = [(0.09, -0.06), (0.1, 0.03), (0.09, 0.12)]; TIP = [(0.34, -0.36), (0.46, 0.06), (0.4, 0.5)]
        for s in (-1, 1):
            for i in range(3):
                r = bp(s * ROOT[i][0], ROOT[i][1], 0.2); ty = TIP[i][1]; lift = 0.0
                if step is not None: ph = step + (i + (0 if s > 0 else 1)) * math.pi; ty += 0.1 * math.sin(ph); lift = 0.1 * max(0.0, math.cos(ph))
                t = Vector((s * TIP[i][0] * k, ty * k, lift * k))
                if i == 0 and rear: t = bp(s * 0.3, -0.44, 0.1)          # reared up: the front pair leaves the ground
                kn = mix(r, t, 0.5) + Vector((s * 0.07 * k, 0, 0.24 * k)); cap(bm, r, kn, 0.036 * k, 0.03 * k, seg=8); cap(bm, kn, t, 0.03 * k, 0.016 * k, seg=8)
        st.make(bm, 'legs', 'antDark')
        bm = bmesh.new()
        for s in (-1, 1): a, b2, c = bp(s * 0.08, -0.33, 0.44), bp(s * 0.2, -0.44, 0.64), bp(s * 0.25, -0.66, 0.52); cap(bm, a, b2, 0.026 * k, 0.024 * k, seg=6); cap(bm, b2, c, 0.024 * k, 0.02 * k, seg=6)
        st.make(bm, 'feelers', 'antDark', line=False)
        e = [bp(s * 0.105, -0.37, 0.38) for s in (-1, 1)]; bm = bmesh.new()
        for q in e: sph(bm, q, 0.078 * k, seg=14)
        st.make(bm, 'eyes', 'white'); bm = bmesh.new()
        for q in e: sph(bm, q + (R3 @ Vector((0, -0.05 * k, 0.03 * k))), 0.042 * k, seg=10)
        st.make(bm, 'pupils', 'eye', line=False); return None
    return b

def ladybird(k=1.0, step=None):
    def b(st):
        v = lambda x, y, z: Vector((x * k, y * k, z * k)); c = v(0, 0.05, 0.07); ax = (0.3 * k, 0.342 * k, 0.252 * k)
        for s in (-1, 1):                                                   # the two wing covers, a hair apart
            bm = bmesh.new(); sph(bm, c, 0.3 * k, (1, 1.14, 0.84), seg=32); cut(bm, v(s * 0.007, 0, 0), (s, 0, 0)); cut(bm, v(0, 0, 0.06), (0, 0, 1)); bmesh.ops.holes_fill(bm, edges=bm.edges[:]); st.make(bm, 'cover', 'lady')
        bm = bmesh.new(); sph(bm, c, 0.25 * k, (1, 1.14, 0.7), seg=24); cut(bm, v(0, 0, 0.05), (0, 0, 1)); st.make(bm, 'under', 'black')
        bm = bmesh.new()
        for s in (-1, 1):
            for x, y, r in ((0.12, -0.1, 0.055), (0.18, 0.12, 0.06), (0.085, 0.27, 0.05)):
                X, Y = s * x * k, y * k; z = c.z + ax[2] * math.sqrt(max(0.0, 1 - (X / ax[0]) ** 2 - ((Y - c.y) / ax[1]) ** 2)); n = Vector((X / ax[0] ** 2, (Y - c.y) / ax[1] ** 2, (z - c.z) / ax[2] ** 2)).normalized()
                sph(bm, Vector((X, Y, z)) + n * 0.004 * k, r * k, (1, 1, 0.3), seg=12, rot=Vector((0, 0, 1)).rotation_difference(n).to_matrix().to_4x4())
        st.make(bm, 'spots', 'black', line=False)
        bm = bmesh.new(); sph(bm, v(0, -0.27, 0.13), 0.14 * k, (1.25, 0.85, 0.9), seg=20); st.make(bm, 'head', 'black')
        bm = bmesh.new()
        for s in (-1, 1): sph(bm, v(s * 0.115, -0.31, 0.2), 0.05 * k, (1, 0.7, 0.9), seg=10)
        st.make(bm, 'cheeks', 'cream', line=False)
        e = [v(s * 0.06, -0.385, 0.16) for s in (-1, 1)]; bm = bmesh.new()
        for q in e: sph(bm, q, 0.052 * k, seg=12)
        st.make(bm, 'eyes', 'white', line=False); bm = bmesh.new()
        for q in e: sph(bm, q + Vector((0, -0.036 * k, 0.02 * k)), 0.028 * k, seg=8)
        st.make(bm, 'pupils', 'eye', line=False)
        bm = bmesh.new()
        for s in (-1, 1):
            for i, y in enumerate((-0.14, 0.05, 0.24)):
                ty = y + (-0.1, 0.0, 0.12)[i]
                if step is not None: ty += 0.06 * math.sin(step + (i + (0 if s > 0 else 1)) * math.pi)
                cap(bm, v(s * 0.2, y, 0.08), v(s * 0.36, ty, 0.0), 0.034 * k, 0.02 * k, seg=8)
            cap(bm, v(s * 0.05, -0.38, 0.24), v(s * 0.12, -0.5, 0.3), 0.02 * k, 0.016 * k, seg=6)
        st.make(bm, 'legs', 'black'); return None
    return b

def roach(k=1.0, step=None):
    def b(st):
        v = lambda x, y, z: Vector((x * k, y * k, z * k))
        bm = bmesh.new(); sph(bm, v(0, 0.1, 0.1), k, (0.2, 0.45, 0.07), seg=24); st.make(bm, 'belly', 'roachDark')
        for s in (-1, 1): bm = bmesh.new(); sph(bm, v(s * 0.05, 0.13, 0.135), k, (0.165, 0.43, 0.075), seg=24, rot=D.rz(-s * 5)); st.make(bm, 'wing', 'roach')
        bm = bmesh.new(); sph(bm, v(0, -0.29, 0.155), k, (0.2, 0.15, 0.085), seg=24); st.make(bm, 'shield', 'roachHi')
        bm = bmesh.new(); sph(bm, v(0, -0.43, 0.11), 0.085 * k, (1.2, 0.85, 0.9), seg=14); st.make(bm, 'head', 'roachDark')
        e = [v(s * 0.06, -0.47, 0.15) for s in (-1, 1)]; bm = bmesh.new()
        for q in e: sph(bm, q, 0.046 * k, seg=12)
        st.make(bm, 'eyes', 'white', line=False); bm = bmesh.new()
        for q in e: sph(bm, q + Vector((0, -0.03 * k, 0.02 * k)), 0.025 * k, seg=8)
        st.make(bm, 'pupils', 'eye', line=False)
        bm = bmesh.new(); L = [((0.14, -0.24), (0.32, -0.38), (0.4, -0.54)), ((0.17, -0.04), (0.4, -0.02), (0.54, 0.14)), ((0.15, 0.14), (0.36, 0.32), (0.44, 0.68))]
        for s in (-1, 1):
            for i, (r, kn, t) in enumerate(L):
                d = 0.07 * math.sin(step + (i + (0 if s > 0 else 1)) * math.pi) if step is not None else 0.0
                a, m, z = v(s * r[0], r[1], 0.09), v(s * kn[0], kn[1] + d * 0.5, 0.2), v(s * t[0], t[1] + d, 0.0); cap(bm, a, m, 0.04 * k, 0.032 * k, seg=8); cap(bm, m, z, 0.032 * k, 0.014 * k, seg=8)
            cap(bm, v(s * 0.05, 0.53, 0.1), v(s * 0.11, 0.66, 0.07), 0.022 * k, 0.012 * k, seg=6)
        st.make(bm, 'legs', 'roachDark')
        bm = bmesh.new()
        for s in (-1, 1):
            pts = [v(s * 0.04, -0.48, 0.17), v(s * 0.2, -0.74, 0.3), v(s * 0.42, -0.9, 0.24), v(s * 0.6, -0.93, 0.1)]
            for i in range(3): cap(bm, pts[i], pts[i + 1], (0.022 - 0.004 * i) * k, (0.018 - 0.004 * i) * k, seg=6)
        st.make(bm, 'feelers', 'roachDark', line=False); return None
    return b

def spider(k=1.0, step=None):
    def b(st):
        v = lambda x, y, z: Vector((x * k, y * k, z * k))
        bm = bmesh.new(); sph(bm, v(0, 0.22, 0.3), 0.27 * k, (1, 1.12, 0.95), seg=28); st.make(bm, 'abdomen', 'spider')
        bm = bmesh.new()
        for y, r in ((0.1, 0.045), (0.22, 0.055), (0.34, 0.04)): sph(bm, v(0, y, 0.3 + 0.255 * math.sqrt(max(0.0, 1 - ((y - 0.22) / 0.3) ** 2))), r * k, (1, 1, 0.3), seg=10)
        st.make(bm, 'marks', 'cream', line=False)
        bm = bmesh.new(); sph(bm, v(0, -0.12, 0.25), 0.175 * k, (1.05, 1, 0.9), seg=24); st.make(bm, 'chest', 'spider')
        bm = bmesh.new()
        for s in (-1, 1): cap(bm, v(s * 0.05, -0.27, 0.19), v(s * 0.04, -0.31, 0.09), 0.035 * k, 0.014 * k, seg=8)
        st.make(bm, 'fangs', 'spiderDark')
        bm = bmesh.new(); L = [((0.36, -0.5), (0.44, -0.84)), ((0.52, -0.22), (0.8, -0.3)), ((0.52, 0.12), (0.8, 0.3)), ((0.38, 0.42), (0.5, 0.8))]
        for s in (-1, 1):
            for i, (kn, t) in enumerate(L):
                d = 0.08 * math.sin(step + (i + (0 if s > 0 else 1)) * math.pi) if step is not None else 0.0
                a, m, z = v(s * 0.13, -0.2 + i * 0.08, 0.24), v(s * kn[0], kn[1] + d * 0.5, 0.52), v(s * t[0], t[1] + d, 0.0); cap(bm, a, m, 0.045 * k, 0.036 * k, seg=8); cap(bm, m, z, 0.036 * k, 0.016 * k, seg=8)
        st.make(bm, 'legs', 'spiderDark')
        E = [(0.075, -0.26, 0.335, 0.07), (0.155, -0.2, 0.34, 0.036)]; bm = bmesh.new()
        for s in (-1, 1):
            for x, y, z, r in E: sph(bm, v(s * x, y, z), r * k, seg=12)
        st.make(bm, 'eyes', 'white', line=False); bm = bmesh.new()
        for s in (-1, 1):
            for x, y, z, r in E: sph(bm, v(s * x, y, z) + Vector((0, -0.6 * r * k, 0.35 * r * k)), 0.55 * r * k, seg=8)
        st.make(bm, 'pupils', 'eye', line=False); return None
    return b

# ---------------------------------------------------------------- the things of the house, in centimetres; the origin is where it meets the floor
def leg(h, r=1.75, wood='chair', ring=0.0):
    """the foot of a chair or a table: a round leg on a glide; the picture's top is faded out by the painter (no seat, no table top)"""
    def b(st):
        bm = bmesh.new(); cyl(bm, (0, 0, 0.5 + h / 2), r * 0.84, h, r2=r, seg=32); sharp(st.make(bm, 'leg', wood))
        if ring:
            bm = bmesh.new(); sph(bm, (0, 0, ring), r * 1.16, (1, 1, 0.42), seg=24); st.make(bm, 'ring', wood + 'Hi')
        bm = bmesh.new(); cyl(bm, (0, 0, 0.25), r * 0.74, 0.5, seg=24); sharp(st.make(bm, 'glide', 'pad')); return None
    return b
def coin():
    def b(st):
        bm = bmesh.new(); cyl(bm, (0, 0, 0.09), 1.15, 0.18, seg=48); sharp(st.make(bm, 'coin', 'gold'))
        bm = bmesh.new(); cyl(bm, (0, 0, 0.185), 0.93, 0.02, seg=48); sharp(st.make(bm, 'face', 'goldHi'))
        bm = bmesh.new(); box(bm, (0.04, 0, 0.2), (0.17, 0.95, 0.03)); box(bm, (-0.1, 0.3, 0.2), (0.34, 0.15, 0.03), rot=D.rz(38)); box(bm, (0.04, -0.46, 0.2), (0.6, 0.15, 0.03)); st.make(bm, 'one', 'gold', smooth=False); return None
    return b
def brick():
    def b(st):
        bm = bmesh.new(); box(bm, (0, 0, 0.48), (3.18, 1.58, 0.96)); st.make(bm, 'brick', 'brick', smooth=False)
        bm = bmesh.new(); box(bm, (0, 0, 0.97), (3.18, 1.58, 0.02)); st.make(bm, 'top', 'brickHi', smooth=False)
        bm = bmesh.new()
        for i in range(4):
            for j in range(2): cyl(bm, (-1.2 + i * 0.8, -0.4 + j * 0.8, 1.07), 0.25, 0.18, seg=16)
        sharp(st.make(bm, 'studs', 'brickHi')); return None
    return b
def marble():
    def b(st):
        bm = bmesh.new(); sph(bm, (0, 0, 0.8), 0.8, seg=32); st.make(bm, 'marble', 'marble')
        bm = bmesh.new(); sph(bm, (-0.3, -0.5, 1.22), 0.17, (1.5, 0.6, 1), seg=10); sph(bm, (0.36, -0.6, 0.6), 0.08, seg=8); st.make(bm, 'shine', 'white', line=False)
        bm = bmesh.new()
        for i in range(7): a = -0.5 + i * 0.32; sph(bm, (0.76 * math.sin(a) * 0.5 + 0.1, -0.66, 0.8 + 0.5 * math.cos(a * 1.3) * math.sin(a)), 0.07, (1, 0.5, 1), seg=6)
        st.make(bm, 'swirl', 'glass', line=False); return None
    return b
def dice():
    def b(st):
        bm = bmesh.new(); box(bm, (0, 0, 0.8), (1.6, 1.6, 1.6)); o = st.make(bm, 'dice', 'dice', smooth=False); md = o.modifiers.new('bv', 'BEVEL'); md.width = 0.2; md.segments = 3
        bm = bmesh.new(); box(bm, (0, 0, 1.6), (1.3, 1.3, 0.015)); st.make(bm, 'top', 'diceHi', smooth=False, line=False)
        bm = bmesh.new()
        for x, y in ((-0.4, -0.4), (0.4, 0.4), (0, 0), (-0.4, 0.4), (0.4, -0.4)): sph(bm, (x, y, 1.61), 0.15, (1, 1, 0.25), seg=10)       # five on top
        for x, z in ((-0.4, 1.2), (0, 0.8), (0.4, 0.4)): sph(bm, (x, -0.81, z), 0.15, (1, 0.25, 1), seg=10)                              # three in front
        for y, z in ((-0.4, 1.2), (-0.4, 0.8), (-0.4, 0.4), (0.4, 1.2), (0.4, 0.8), (0.4, 0.4)): sph(bm, (0.81, y, z), 0.15, (0.25, 1, 1), seg=10)   # six on its side
        st.make(bm, 'pips', 'eye', line=False); return None
    return b
def loop():
    """a ring of breakfast cereal"""
    def b(st):
        bm = bmesh.new(); n = 18
        for i in range(n): a0, a1 = i / n * math.tau, (i + 1) / n * math.tau; cap(bm, (0.42 * math.cos(a0), 0.42 * math.sin(a0), 0.2), (0.42 * math.cos(a1), 0.42 * math.sin(a1), 0.2), 0.2, 0.2, seg=10)
        st.make(bm, 'loop', 'cereal', remesh=0.035, soften=2); return None
    return b
def pea():
    def b(st):
        bm = bmesh.new(); sph(bm, (0, 0, 0.4), 0.4, seg=24); st.make(bm, 'pea', 'pea')
        bm = bmesh.new(); sph(bm, (-0.14, -0.24, 0.62), 0.075, (1.5, 0.6, 1), seg=8); st.make(bm, 'shine', 'leaf2', line=False); return None
    return b
def crumb(seed, r, m='crumb'):
    def b(st):
        rnd = random.Random(seed); bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=2, radius=r)
        for v in bm.verts: v.co *= 0.8 + rnd.random() * 0.4; v.co.z *= 0.72; v.co.y *= 0.9; v.co.z += r * 0.42
        st.make(bm, 'crumb', m, smooth=False); return None
    return b
def macaroni():
    def b(st):
        bm = bmesh.new(); n = 10; P = [(1.0 * math.cos(a), 1.0 * math.sin(a), 0.36) for a in [math.radians(200 + i * 14) for i in range(n + 1)]]
        for i in range(n): cap(bm, P[i], P[i + 1], 0.36, 0.36, seg=12)
        st.make(bm, 'tube', 'pasta', remesh=0.05, soften=2)
        bm = bmesh.new()
        for q, q2 in ((P[0], P[1]), (P[n], P[n - 1])): d = (Vector(q) - Vector(q2)).normalized(); sph(bm, Vector(q) + d * 0.3, 0.22, (1, 1, 0.3), seg=10, rot=Vector((0, 0, 1)).rotation_difference(d).to_matrix().to_4x4())
        st.make(bm, 'holes', 'pastaIn', line=False); return None
    return b
def pencil(length=17.5, tip=True):
    """lying along X, the rubber at -X; without the tip it is cut where the picture ends"""
    def b(st):
        x0 = -length / 2; r = 0.37; ax = (1, 0, 0); body = length - 1.9 - (1.6 if tip else 0)
        bm = bmesh.new(); cyl(bm, (x0 + 1.9 + body / 2, 0, r), r, body, axis=ax, seg=6); st.make(bm, 'body', 'pencil', smooth=False)
        bm = bmesh.new(); cyl(bm, (x0 + 1.4, 0, r), r * 1.04, 1.0, axis=ax, seg=16); sharp(st.make(bm, 'band', 'steel'))
        bm = bmesh.new(); cyl(bm, (x0 + 0.5, 0, r), r * 0.98, 0.9, axis=ax, seg=16); sph(bm, (x0 + 0.08, 0, r), r * 0.96, (0.5, 1, 1), seg=14); st.make(bm, 'rubber', 'eraser')
        if tip:
            bm = bmesh.new(); cyl(bm, (x0 + length - 1.0, 0, r), r, 1.2, axis=ax, r2=0.12, seg=12); sharp(st.make(bm, 'wood', 'pencilWood'))
            bm = bmesh.new(); cyl(bm, (x0 + length - 0.2, 0, r), 0.12, 0.4, axis=ax, r2=0.01, seg=8); st.make(bm, 'lead', 'black')
        return None
    return b
def bottlecap():
    def b(st):
        bm = bmesh.new(); n = 42; lo = [bm.verts.new((math.cos(i / n * math.tau) * (1.5 if i % 2 else 1.36), math.sin(i / n * math.tau) * (1.5 if i % 2 else 1.36), 0.0)) for i in range(n)]; hi = [bm.verts.new((math.cos(i / n * math.tau) * 1.3, math.sin(i / n * math.tau) * 1.3, 0.52)) for i in range(n)]
        for i in range(n): bm.faces.new((lo[i], lo[(i + 1) % n], hi[(i + 1) % n], hi[i]))
        bm.faces.new(hi); st.make(bm, 'skirt', 'capRed', smooth=False)
        bm = bmesh.new(); cyl(bm, (0, 0, 0.53), 1.18, 0.02, seg=32); sharp(st.make(bm, 'top', 'capRedHi'))
        bm = bmesh.new(); n2 = 5
        for i in range(n2): a = i / n2 * math.tau + 0.3; b2 = a + math.tau * 2 / n2; cap(bm, (0.7 * math.cos(a), 0.7 * math.sin(a), 0.55), (0.7 * math.cos(b2), 0.7 * math.sin(b2), 0.55), 0.07, 0.07, seg=6)
        st.make(bm, 'star', 'white', line=False); return None
    return b
def button():
    def b(st):
        bm = bmesh.new(); cyl(bm, (0, 0, 0.11), 0.75, 0.22, seg=36); sharp(st.make(bm, 'button', 'button'))
        bm = bmesh.new(); cyl(bm, (0, 0, 0.225), 0.56, 0.02, seg=36); sharp(st.make(bm, 'dish', 'buttonHi'))
        bm = bmesh.new()
        for x, y in ((-0.17, -0.17), (0.17, -0.17), (-0.17, 0.17), (0.17, 0.17)): sph(bm, (x, y, 0.235), 0.09, (1, 1, 0.3), seg=8)
        st.make(bm, 'holes', 'eye', line=False); return None
    return b
def bowl():
    """a pet's bowl with dry food in it: the house has a cat or a dog"""
    def b(st):
        bm = bmesh.new(); cyl(bm, (0, 0, 2.4), 8.6, 4.8, r2=7.0, seg=48); sharp(st.make(bm, 'bowl', 'bowl'))
        bm = bmesh.new(); cyl(bm, (0, 0, 4.81), 6.2, 0.02, seg=48); sharp(st.make(bm, 'inside', 'bowlIn'))
        rnd = random.Random(5); bm = bmesh.new()
        for i in range(34): a = rnd.random() * math.tau; d = math.sqrt(rnd.random()) * 5.2; sph(bm, (d * math.cos(a), d * math.sin(a), 4.9 + rnd.random() * 0.5), 0.62, (1, 1, 0.8), seg=8)
        st.make(bm, 'food', 'kibble'); return None
    return b

# ---------------------------------------------------------------- what he carries, by his size: found things (in the hero's units, on his points)
def blade(kind):
    """standing in the XZ plane, the grip at the origin, as a cutlass is (blender/gear.py)"""
    def b(st):
        if kind == 'needle':      # thumb: a sewing needle, red thread wound for a grip and tied through its eye
            bm = bmesh.new(); plate(bm, [(x, 0, z) for x, z in ((-0.018, -0.13), (-0.03, -0.06), (-0.03, 0.3), (-0.014, 0.56), (0.0, 0.7), (0.014, 0.56), (0.03, 0.3), (0.03, -0.06), (0.018, -0.13))]); st.make(bm, 'needle', 'steel', solid=0.03, smooth=False)
            bm = bmesh.new(); sph(bm, (0, -0.018, -0.085), 0.012, (0.7, 0.5, 2.4), seg=8); st.make(bm, 'eye', 'eye', line=False)
            bm = bmesh.new(); cap(bm, (0, 0, -0.045), (0, 0, 0.05), 0.036, 0.036, seg=10); cap(bm, (0, 0, -0.1), (-0.08, 0, -0.2), 0.014, 0.014, seg=6); cap(bm, (-0.08, 0, -0.2), (-0.04, 0, -0.31), 0.014, 0.02, seg=6); st.make(bm, 'thread', 'thread')
        elif kind == 'pin':       # bean: a pin with a ball head
            bm = bmesh.new(); plate(bm, [(x, 0, z) for x, z in ((-0.02, -0.04), (-0.02, 0.44), (0.0, 0.6), (0.02, 0.44), (0.02, -0.04))]); st.make(bm, 'pin', 'steel', solid=0.03, smooth=False)
            bm = bmesh.new(); cap(bm, (0, 0, -0.04), (0, 0, 0.05), 0.03, 0.03, seg=10); st.make(bm, 'grip', 'rope')
            bm = bmesh.new(); sph(bm, (0, 0, -0.1), 0.078, seg=16); st.make(bm, 'ball', 'thread')
            bm = bmesh.new(); sph(bm, (-0.03, -0.06, -0.07), 0.018, seg=6); st.make(bm, 'shine', 'white', line=False)
        else:                     # ant: a splinter of wood
            bm = bmesh.new(); plate(bm, [(x, 0, z) for x, z in ((-0.03, -0.06), (-0.045, 0.2), (-0.02, 0.33), (-0.034, 0.4), (0.0, 0.56), (0.03, 0.37), (0.045, 0.18), (0.03, -0.06))]); st.make(bm, 'splinter', 'woodHi', solid=0.035, smooth=False)
            bm = bmesh.new(); cap(bm, (0, 0, -0.04), (0, 0, 0.05), 0.04, 0.04, seg=10); st.make(bm, 'grip', 'rope')
        return None
    return b
def shield(kind, c, f):
    """a disc about a centre, its face along f, as a buckler is"""
    def b(st):
        f_ = Vector(f).normalized(); c_ = Vector(c); Rm = Vector((0, 0, 1)).rotation_difference(f_).to_matrix().to_4x4(); at = lambda x, y, z: c_ + (Rm @ Vector((x, y, z)))
        if kind == 'coin':        # thumb: a coin
            bm = bmesh.new(); cyl(bm, c_, 0.205, 0.03, axis=f_, seg=28); sharp(st.make(bm, 'rim', 'gold'))
            bm = bmesh.new(); cyl(bm, at(0, 0, 0.006), 0.165, 0.032, axis=f_, seg=28); sharp(st.make(bm, 'face', 'goldHi'))
            bm = bmesh.new(); box(bm, at(0.01, 0, 0.024), (0.04, 0.2, 0.012), rot=Rm); box(bm, at(-0.02, 0.06, 0.024), (0.07, 0.036, 0.012), rot=Rm @ D.rz(38)); st.make(bm, 'one', 'gold', smooth=False)
        elif kind == 'button':    # bean: a shirt button
            bm = bmesh.new(); cyl(bm, c_, 0.235, 0.04, axis=f_, seg=28); sharp(st.make(bm, 'button', 'button'))
            bm = bmesh.new(); cyl(bm, at(0, 0, 0.006), 0.175, 0.04, axis=f_, seg=28); sharp(st.make(bm, 'dish', 'buttonHi'))
            bm = bmesh.new()
            for x, y in ((-0.055, -0.055), (0.055, -0.055), (-0.055, 0.055), (0.055, 0.055)): sph(bm, at(x, y, 0.028), 0.03, seg=8)
            st.make(bm, 'holes', 'eye', line=False)
        else:                     # ant: a lentil
            bm = bmesh.new(); sph(bm, c_, 0.21, (1, 1, 0.3), seg=24, rot=Rm); st.make(bm, 'lentil', 'lentil')
        return c_
    return b
def thimble(Hm):
    """thumb: a thimble for a helmet"""
    def b(st):
        def mk(bm, name, m, **kw): o = st.make(bm, name, m, **kw); o.matrix_local = Hm; return o
        bm = bmesh.new(); cyl(bm, (0, 0, 0.26), 0.205, 0.3, r2=0.16, seg=24); sph(bm, (0, 0, 0.41), 0.16, (1, 1, 0.4), seg=24); sharp(mk(bm, 'cup', 'steel'), 50)
        bm = bmesh.new(); cyl(bm, (0, 0, 0.115), 0.222, 0.05, seg=24); sharp(mk(bm, 'rim', 'iron'))
        bm = bmesh.new()
        for j, z in enumerate((0.21, 0.28, 0.35)):
            r = 0.205 - (z - 0.11) / 0.3 * 0.045
            for i in range(9): a = (i + 0.5 * j) / 9 * math.tau; sph(bm, (r * math.cos(a), r * math.sin(a), z), 0.016, seg=6)
        mk(bm, 'dimples', 'iron', line=False); return Hm @ Vector((0, 0, 0))
    return b

# ---------------------------------------------------------------- what is rendered, for each size
def fr(unit, hw, front, back, tall, pad=12):
    """the picture for a thing hw wide to each side, reaching front toward the camera, back away from it, and tall"""
    s = unit * D.PX; w = int(2 * hw * s + 2 * pad); up = (back * SE + tall * CE) * s; h = int(up + front * SE * s + 2 * pad)
    return (w + w % 2, h + h % 2, (w + w % 2) // 2, int(up + pad))
def thing(name, build, hw, front, back, tall, turn=0.0): return dict(name=name, build=build, ext=(hw, front, back, tall), turn=turn)
def bug(name, build, k, reach=1.0, tall=0.75, turn=0.0): return dict(name=name, build=build, ext=(reach * k, reach * k, reach * k, tall * k), turn=turn, unit=D.UNIT)
COMMON = [thing('coin', coin(), 1.2, 1.2, 1.2, 0.3), thing('brick', brick(), 2.0, 2.0, 2.0, 1.3, 24), thing('marble', marble(), 0.85, 0.85, 0.85, 1.7), thing('dice', dice(), 1.25, 1.25, 1.25, 1.7, 28), thing('loop', loop(), 0.7, 0.7, 0.7, 0.45),
          thing('pea', pea(), 0.45, 0.45, 0.45, 0.85), thing('crumb-a', crumb(3, 0.55), 0.8, 0.7, 0.7, 0.9), thing('crumb-b', crumb(8, 0.34, 'crumbDark'), 0.5, 0.45, 0.45, 0.6), thing('crumb-c', crumb(12, 0.22), 0.34, 0.3, 0.3, 0.4),
          thing('macaroni', macaroni(), 1.5, 1.5, 1.5, 0.8, 20), thing('cap', bottlecap(), 1.6, 1.6, 1.6, 0.7), thing('button', button(), 0.8, 0.8, 0.8, 0.3)]
SETS = {
    'thumb': COMMON + [thing('table-leg', leg(25, 3.0, 'table', ring=4.6), 3.8, 3.8, 3.8, 26), thing('chair-leg', leg(20, 1.75), 2.1, 2.1, 2.1, 21), thing('bowl', bowl(), 8.8, 8.8, 8.8, 5.6), thing('pencil', pencil(17.5), 9.2, 5.2, 5.2, 0.8, 24),
                       bug('roach-ne', roach(0.75, step=0.6), 0.75, turn=135), bug('roach-e', roach(0.75, step=2.2), 0.75, turn=90), bug('roach-se', roach(0.75, step=1.2), 0.75, turn=45), bug('spider-s', spider(0.64), 0.64, 1.0, 0.8), bug('spider-se', spider(0.64, step=1.0), 0.64, 1.0, 0.8, turn=45)],
    'bean': COMMON + [thing('chair-leg', leg(10, 1.75), 2.1, 2.1, 2.1, 11), thing('pencil', pencil(9.0, tip=False), 5.0, 3.0, 3.0, 0.8, 14),
                      bug('ant-ne', ant(0.66, rear=20, jaws=1.0), 0.66, turn=135), bug('ant-e', ant(0.66, step=0.8), 0.66, turn=90), bug('ant-s', ant(0.66, step=2.4), 0.66), bug('ant-se', ant(0.66, step=1.6), 0.66, turn=45),
                      bug('ladybird-s', ladybird(0.78), 0.78, 0.6, 0.6), bug('ladybird-se', ladybird(0.78, step=1.0), 0.78, 0.6, 0.6, turn=45), bug('roach-e', roach(2.15, step=2.2), 2.15, turn=90), bug('roach-ne', roach(2.15, step=0.6), 2.15, turn=135)],
    'ant': COMMON + [thing('chair-leg', leg(6.4, 1.75), 2.1, 2.1, 2.1, 7.2),
                     bug('ant-ne', ant(1.18, rear=20, jaws=1.0), 1.18, turn=135), bug('ant-e', ant(1.18, step=0.8), 1.18, turn=90), bug('ant-s', ant(1.18, step=2.4), 1.18), bug('ant-se', ant(1.18, step=1.6), 1.18, turn=45),
                     bug('ladybird-s', ladybird(1.7), 1.7, 0.6, 0.6), bug('ladybird-se', ladybird(1.7, step=1.0), 1.7, 0.6, 0.6, turn=45), bug('roach-ne', roach(5.6, step=0.6), 5.6, turn=135), bug('roach-e', roach(5.6, step=2.2), 5.6, turn=90)],
}
def gear_items():
    Hm = Matrix.Translation(gear.HEAD) @ gear.HR; f = gear.T @ Vector((0.15, -0.97, 0.12)); out = []
    for k in ('needle', 'pin', 'splinter'): out.append({'name': 'blade-' + k, 'build': blade(k), 'tilt': True, 'frame': (120, 240, 60, 170), 'unit': D.UNIT})
    for fc, turn in D.FACINGS:
        for k in ('coin', 'button', 'lentil'): out.append({'name': 'shield-%s-%s' % (k, fc), 'build': shield(k, gear.OFF, f), 'turn': turn, 'frame': gear.FRAME, 'unit': D.UNIT})
        out.append({'name': 'thimble-' + fc, 'build': thimble(Hm), 'turn': turn, 'frame': gear.FRAME, 'unit': D.UNIT})
    return out

if __name__ == '__main__':
    a = D.args(); root = os.path.abspath(a[0]) if a else os.path.join(HERE, '..', '..', 'work', 'house'); which = a[1].split(',') if len(a) > 1 else ['thumb', 'bean', 'ant', 'gear']; only = a[2].split(',') if len(a) > 2 else None
    st = D.Stage()
    for size in which:
        out = os.path.join(root, size); recs = []; old = os.path.join(out, 'meta.json')
        if only and os.path.exists(old): recs = [r for r in json.load(open(old, encoding='utf-8'))['items'] if r['name'] not in only]
        items = gear_items() if size == 'gear' else [dict(name=t['name'], build=t['build'], turn=t['turn'], unit=t.get('unit', CM[size]), frame=fr(t.get('unit', CM[size]), *t['ext'])) for t in SETS[size]]
        for it in items:
            if only and it['name'] not in only: continue
            recs += D.render_items(st, [it], out, it['frame'], unit=it['unit'])
        json.dump({'px': D.PX, 'items': recs}, open(os.path.join(out, 'meta.json'), 'w', encoding='utf-8'), indent=1)
        print('size', size, len(recs), 'pictures')
