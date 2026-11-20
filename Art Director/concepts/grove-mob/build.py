"""concepts/grove-mob/build.py: six quick candidates for the grove's monster on Crab Cay, levels 3 to 4, to take the reef
gull's place (Leonard, AD, 2026-11-20). Robin, 2026-11-20, in Victor, GD's chat: "I think the birds are weird starting mobs."
One standing still of each, in the game's look, to pick from. Not rigged, no clips: the one he picks is built properly in
blender/ afterwards. Each is built facing -Y at the size it would have beside the Warrior (one unit tall).
  node tools/blender.js concepts/grove-mob/build.py -- work/grove-mob/render [name,name...]"""
import sys, os, math
HERE = os.path.dirname(os.path.abspath(__file__)); BL = os.path.abspath(os.path.join(HERE, '..', '..', 'blender'))
if BL not in sys.path: sys.path.insert(0, BL)
import bmesh
from mathutils import Vector, Matrix
import drok as D
from drok import sph, cap, plate

D.HEX.update({
    'fur': '#a8683a', 'furPale': '#f7dcae', 'furDark': '#7a4526',
    'viper': '#8d63d2', 'viperDark': '#6a45ad', 'viperBelly': '#ffe9a8', 'tongue': '#e9423a',
    'pig': '#b9744a', 'pigDark': '#8a4f2e', 'pigStripe': '#f6dcae', 'snout': '#ff9a9a', 'hoof': '#5a3622',
    'rat': '#8e9aa8', 'ratPink': '#ff9aa8', 'ratBelly': '#e8e2d6',
    'liz': '#2f9fd0', 'lizBelly': '#ffe27a', 'frill': '#ff9a3a', 'frillRim': '#e9423a',
    'frog': '#ffd640', 'frogLeg': '#2b3f78', 'frogToe': '#ff8a3a', 'frogBelly': '#fff3c8',
})
V = Vector

def tube(bm, pts, r0, r1=None, seg=10, rad=None):
    """a limb through points; its radius from r0 to r1, or from rad(t)"""
    n = len(pts) - 1; r1 = r0 if r1 is None else r1; f = rad or (lambda t: r0 + (r1 - r0) * t)
    for i in range(n): cap(bm, pts[i], pts[i + 1], f(i / n), f((i + 1) / n), seg=seg)

def beads(st, pts, r, brow=0.5):
    """dark bead eyes with a glint and a heavy brow: the gull's eyes, so the cast is one hand"""
    bm = bmesh.new()
    for p in pts: sph(bm, p, r, seg=10)
    st.make(bm, 'eyes', 'eye', line=False)
    bm = bmesh.new()
    for p in pts: sph(bm, V(p) + V((-r * 0.3, -r * 0.75, r * 0.45)), r * 0.38, seg=6)
    st.make(bm, 'glints', 'white', line=False)
    if brow:
        bm = bmesh.new()
        for p in pts:
            s = 1 if p[0] > 0 else -1; p = V(p)
            cap(bm, p + V((-s * r * 1.1, -r * 0.6, r * 1.0)), p + V((s * r * 1.3, -r * 0.2, r * (1.0 + brow))), r * 0.42, r * 0.34, seg=6)
        st.make(bm, 'brows', 'black', line=False)

def balls(st, pts, r, look=(0, -1, 0.1)):
    """white eyes with a dark pupil: the crabs' eyes"""
    bm = bmesh.new()
    for p in pts: sph(bm, p, r, seg=14)
    st.make(bm, 'eyes', 'white')
    bm = bmesh.new(); d = V(look).normalized()
    for p in pts: sph(bm, V(p) + d * r * 0.7, r * 0.52, seg=10)
    st.make(bm, 'pupils', 'eye', line=False)

# ---------------------------------------------------------------- 1. the palm monkey
def monkey(st):
    bm = bmesh.new(); sph(bm, (0, 0.07, 0.25), 1.0, (0.17, 0.2, 0.2), seg=24); st.make(bm, 'body', 'fur', remesh=0.012, soften=3)
    bm = bmesh.new(); sph(bm, (0, -0.075, 0.23), 1.0, (0.105, 0.07, 0.13), seg=16); st.make(bm, 'belly', 'furPale')
    bm = bmesh.new(); sph(bm, (0, -0.11, 0.53), 0.19, (1.05, 0.95, 0.94), seg=24)
    for s in (-1, 1): sph(bm, (s * 0.215, -0.06, 0.57), 0.092, (1, 0.5, 1), seg=14)
    st.make(bm, 'head', 'fur', remesh=0.012, soften=2)
    bm = bmesh.new()
    for s in (-1, 1): sph(bm, (s * 0.222, -0.095, 0.57), 0.054, (1, 0.4, 1), seg=10)
    st.make(bm, 'ears_in', 'furPale', line=False)
    bm = bmesh.new()      # the pale face: two rounds for the eyes and a muzzle
    for s in (-1, 1): sph(bm, (s * 0.068, -0.262, 0.56), 0.078, (1, 0.45, 1.05), seg=14)
    sph(bm, (0, -0.28, 0.465), 0.1, (1.08, 0.62, 0.74), seg=16)
    st.make(bm, 'mask', 'furPale', remesh=0.01, soften=2)
    bm = bmesh.new(); tube(bm, [V((-0.055, -0.338, 0.455)), V((0, -0.35, 0.44)), V((0.06, -0.335, 0.462))], 0.009, seg=6); sph(bm, (0, -0.345, 0.49), 0.016, (1.3, 1, 0.8), seg=6)
    st.make(bm, 'mouth', 'eye', line=False)
    beads(st, [(-0.07, -0.305, 0.565), (0.07, -0.305, 0.565)], 0.03, brow=0.55)
    bm = bmesh.new()
    for s in (-1, 1):      # long arms, knuckles on the ground; the legs folded
        tube(bm, [V((s * 0.14, -0.05, 0.37)), V((s * 0.25, -0.13, 0.22)), V((s * 0.18, -0.25, 0.06))], 0.05, 0.045)
        tube(bm, [V((s * 0.12, 0.13, 0.17)), V((s * 0.27, 0.05, 0.21)), V((s * 0.25, -0.05, 0.05))], 0.058, 0.045)
    st.make(bm, 'limbs', 'fur', remesh=0.012, soften=2)
    bm = bmesh.new()
    for s in (-1, 1): sph(bm, (s * 0.18, -0.27, 0.045), 0.056, (1, 1.2, 0.75), seg=10); sph(bm, (s * 0.25, -0.09, 0.04), 0.056, (1, 1.5, 0.7), seg=10)
    st.make(bm, 'hands', 'furDark')
    tail = [(0, 0.24, 0.2), (0.02, 0.36, 0.19), (0.04, 0.48, 0.26), (0.05, 0.54, 0.4), (0.05, 0.52, 0.55), (0.04, 0.42, 0.65), (0.03, 0.3, 0.63), (0.03, 0.25, 0.53), (0.03, 0.3, 0.45), (0.03, 0.38, 0.47)]
    bm = bmesh.new(); tube(bm, [V(p) for p in tail], 0.04, 0.03); st.make(bm, 'tail', 'furDark')

# ---------------------------------------------------------------- 2. the plum viper
def snake(st):
    N = 30; pts = []
    for i in range(N + 1):
        t = i / N; a = math.radians(170 + t * 630); r = 0.25 - 0.09 * t
        pts.append(V((math.cos(a) * r, 0.06 + math.sin(a) * r * 0.92, 0.07 + 0.15 * t)))
    H = 0.1      # how far the head is lifted clear of the coil
    neck = [V((-0.02, 0.17, 0.32)), V((-0.01, 0.14, 0.46)), V((0, 0.06, 0.58 + H * 0.6)), V((0, -0.07, 0.59 + H))]
    bm = bmesh.new(); tube(bm, pts, 0, seg=12, rad=lambda t: 0.022 + 0.058 * min(1.0, t * 2.6)); tube(bm, [pts[-1]] + neck, 0.08, 0.07, seg=12)
    sph(bm, (0, -0.17, 0.59 + H), 1.0, (0.135, 0.17, 0.092), seg=20)
    st.make(bm, 'body', 'viper', remesh=0.011, soften=3)
    bm = bmesh.new(); sph(bm, (0, -0.2, 0.55 + H), 1.0, (0.1, 0.125, 0.05), seg=14); tube(bm, [V((0, -0.04, 0.53 + H)), V((0, 0.03, 0.5 + H * 0.6)), V((-0.01, 0.1, 0.42)), V((-0.02, 0.13, 0.3))], 0.05, 0.05)
    st.make(bm, 'belly', 'viperBelly')
    bm = bmesh.new()      # dark saddles along the back
    for i in range(6, N, 4): p = pts[i]; sph(bm, p + V((0, 0, 0.055)), 0.05, (1.1, 1.1, 0.5), seg=8)
    sph(bm, (0, -0.12, 0.672 + H), 0.05, (1.0, 1.4, 0.4), seg=8)
    st.make(bm, 'marks', 'viperDark', line=False)
    bm = bmesh.new(); tube(bm, [V((0, -0.32, 0.575 + H)), V((0, -0.41, 0.56 + H))], 0.012, seg=6)
    for s in (-1, 1): tube(bm, [V((0, -0.41, 0.56 + H)), V((s * 0.035, -0.46, 0.57 + H))], 0.01, seg=6)
    st.make(bm, 'tongue', 'tongue', line=False)
    balls(st, [(-0.085, -0.25, 0.65 + H), (0.085, -0.25, 0.65 + H)], 0.052)
    bm = bmesh.new()
    for s in (-1, 1): cap(bm, (s * 0.025, -0.275, 0.69 + H), (s * 0.15, -0.21, 0.735 + H), 0.017, 0.014, seg=6)
    st.make(bm, 'brows', 'viperDark', line=False)
    for o in st.objs: o.scale = (1.18, 1.18, 1.18)

# ---------------------------------------------------------------- 3. the bristle piglet
def piglet(st):
    bm = bmesh.new(); sph(bm, (0, 0.08, 0.26), 1.0, (0.2, 0.27, 0.19), seg=24); sph(bm, (0, -0.2, 0.3), 0.175, (1.0, 0.98, 0.95), seg=24)
    st.make(bm, 'body', 'pig', remesh=0.012, soften=3)
    bm = bmesh.new(); D.cyl(bm, (0, -0.385, 0.265), 0.072, 0.09, axis=(0, -1, 0.1), seg=16); st.make(bm, 'snout', 'snout')
    bm = bmesh.new()
    for s in (-1, 1): sph(bm, (s * 0.027, -0.432, 0.272), 0.015, (1, 0.5, 1.3), seg=6)
    st.make(bm, 'nostrils', 'eye', line=False)
    bm = bmesh.new()
    for s in (-1, 1): cap(bm, (s * 0.1, -0.2, 0.43), (s * 0.22, -0.26, 0.5), 0.065, 0.018, seg=10)
    st.make(bm, 'ears', 'pigDark')
    bm = bmesh.new()
    for s in (-1, 1): cap(bm, (s * 0.075, -0.36, 0.21), (s * 0.115, -0.42, 0.29), 0.022, 0.008, seg=8)
    st.make(bm, 'tusks', 'white')
    bm = bmesh.new()
    for s in (-1, 1): cap(bm, (s * 0.11, -0.12, 0.15), (s * 0.12, -0.14, 0.035), 0.055, 0.042, seg=10); cap(bm, (s * 0.12, 0.22, 0.15), (s * 0.13, 0.24, 0.035), 0.058, 0.042, seg=10)
    st.make(bm, 'legs', 'hoof')
    bm = bmesh.new()      # a piglet's pale stripes along the back, and a ridge of bristles over the head
    for x, z in ((0.0, 0.452), (-0.1, 0.42), (0.1, 0.42)): sph(bm, (x, 0.12, z), 1.0, (0.026, 0.17, 0.012), seg=10, rot=D.ry(x * 280))
    st.make(bm, 'stripes', 'pigStripe', line=False)
    bm = bmesh.new()
    for i in range(4): y = -0.27 + i * 0.075; z = 0.455 + 0.012 * (1.5 - abs(i - 1.5)); cap(bm, (0, y, z), (0, y + 0.04, z + 0.085), 0.034, 0.006, seg=8)
    st.make(bm, 'bristles', 'hoof')
    bm = bmesh.new(); tail = [V((0.0, 0.33, 0.3 + 0.0)), V((0.02, 0.39, 0.34)), V((0.05, 0.4, 0.4)), V((0.02, 0.37, 0.43)), V((-0.02, 0.4, 0.4)), V((0.0, 0.44, 0.43))]
    tube(bm, tail, 0.022, 0.014, seg=8); st.make(bm, 'tail', 'pigDark')
    beads(st, [(-0.09, -0.33, 0.37), (0.09, -0.33, 0.37)], 0.03, brow=0.6)

# ---------------------------------------------------------------- 4. the wharf rat
def rat(st):
    bm = bmesh.new(); sph(bm, (0, 0.14, 0.2), 1.0, (0.17, 0.23, 0.17), seg=24); sph(bm, (0, -0.1, 0.2), 1.0, (0.125, 0.16, 0.125), seg=20); cap(bm, (0, -0.2, 0.19), (0, -0.37, 0.155), 0.09, 0.04, seg=14)
    for s in (-1, 1): sph(bm, (s * 0.13, 0.19, 0.12), 0.095, seg=12); cap(bm, (s * 0.085, -0.14, 0.12), (s * 0.095, -0.16, 0.05), 0.045, 0.035, seg=8)
    st.make(bm, 'body', 'rat', remesh=0.011, soften=3)
    bm = bmesh.new(); sph(bm, (0, -0.395, 0.16), 0.036, seg=10); st.make(bm, 'nose', 'ratPink')
    for s in (-1, 1):      # big round ears, pink inside
        R = D.rz(s * -24) @ D.ry(s * 12)
        bm = bmesh.new(); sph(bm, (s * 0.135, -0.06, 0.37), 0.115, (1, 0.22, 1), seg=16, rot=R); st.make(bm, 'ear', 'rat')
        bm = bmesh.new(); sph(bm, (s * 0.14, -0.085, 0.37), 0.075, (1, 0.2, 1), seg=12, rot=R); st.make(bm, 'ear_in', 'ratPink', line=False)
    bm = bmesh.new()
    for s in (-1, 1): D.box(bm, (s * 0.014, -0.375, 0.1), (0.024, 0.016, 0.045))
    st.make(bm, 'teeth', 'white')
    bm = bmesh.new()
    for s in (-1, 1): sph(bm, (s * 0.095, -0.19, 0.03), 0.042, (1, 1.5, 0.6), seg=8); sph(bm, (s * 0.15, 0.14, 0.03), 0.048, (1, 1.8, 0.6), seg=8)
    st.make(bm, 'feet', 'ratPink')
    tail = [(0, 0.34, 0.12), (0.08, 0.47, 0.05), (0.04, 0.6, 0.035), (-0.08, 0.7, 0.035), (-0.1, 0.82, 0.04), (-0.02, 0.92, 0.07)]
    bm = bmesh.new(); tube(bm, [V(p) for p in tail], 0.034, 0.013, seg=8); st.make(bm, 'tail', 'ratPink')
    beads(st, [(0.074, -0.245, 0.278)], 0.034, brow=0.5)
    bm = bmesh.new(); sph(bm, (-0.072, -0.25, 0.275), 0.046, (1, 0.5, 1), seg=10)      # a pirate's eye patch and its strap
    tube(bm, [V((-0.1, -0.22, 0.31)), V((-0.06, -0.1, 0.335)), V((0.02, -0.02, 0.33))], 0.011, seg=6); tube(bm, [V((-0.03, -0.26, 0.3)), V((0.04, -0.2, 0.33)), V((0.1, -0.1, 0.31))], 0.011, seg=6)
    st.make(bm, 'patch', 'black', line=False)

# ---------------------------------------------------------------- 5. the frill lizard
def lizard(st):
    spine = [V((0, -0.2, 0.3)), V((0, -0.1, 0.22)), V((0.0, 0.02, 0.15)), V((0.03, 0.16, 0.12)), V((0.0, 0.3, 0.11))]
    tail = [V((0.0, 0.3, 0.11)), V((-0.07, 0.45, 0.075)), V((-0.04, 0.6, 0.055)), V((0.07, 0.72, 0.05)), V((0.14, 0.84, 0.06)), V((0.12, 0.95, 0.1))]
    bm = bmesh.new(); tube(bm, spine, 0, seg=12, rad=lambda t: 0.062 + 0.036 * math.sin(math.pi * min(1.0, t * 1.15))); tube(bm, tail, 0.07, 0.012, seg=10)
    sph(bm, (0, -0.27, 0.315), 1.0, (0.088, 0.135, 0.075), seg=18)
    st.make(bm, 'body', 'liz', remesh=0.011, soften=3)
    bm = bmesh.new(); sph(bm, (0, -0.3, 0.285), 1.0, (0.07, 0.1, 0.04), seg=12); st.make(bm, 'jaw', 'lizBelly')
    C = V((0, -0.14, 0.3))      # the frill: a scalloped fan behind the head, half open while it stands; the wind-up throws it wide
    def fan(r, back):
        pts = []; n = 14
        for i in range(n + 1):
            a = math.radians(-35 + 250 * i / n); rr = r * (1.0 if i % 2 == 0 else 0.88); z = math.sin(a) * rr
            pts.append(C + V((math.cos(a) * rr, back + z * 0.32, z)))
        pts.append(C + V((0, back, -0.07))); return pts
    bm = bmesh.new(); plate(bm, fan(0.235, 0.012)); st.make(bm, 'rim', 'frillRim', solid=0.014, smooth=False)
    bm = bmesh.new(); plate(bm, fan(0.195, 0.0)); st.make(bm, 'frill', 'frill', solid=0.016, smooth=False, line=False)
    bm = bmesh.new()
    for s in (-1, 1):      # sprawled legs, the elbows high
        tube(bm, [V((s * 0.07, -0.03, 0.15)), V((s * 0.2, -0.05, 0.2)), V((s * 0.24, -0.14, 0.03))], 0.036, 0.03, seg=8)
        tube(bm, [V((s * 0.07, 0.25, 0.12)), V((s * 0.21, 0.2, 0.19)), V((s * 0.27, 0.31, 0.03))], 0.04, 0.032, seg=8)
        sph(bm, (s * 0.25, -0.16, 0.025), 0.045, (1.2, 1.4, 0.5), seg=8); sph(bm, (s * 0.28, 0.33, 0.025), 0.05, (1.2, 1.5, 0.5), seg=8)
    st.make(bm, 'legs', 'liz', remesh=0.011, soften=2)
    bm = bmesh.new()
    for i, (y, z) in enumerate(((0.0, 0.245), (0.1, 0.225), (0.2, 0.21), (0.3, 0.19))): sph(bm, (0.01 * i, y, z), 0.03, (1, 1.3, 0.5), seg=8)
    st.make(bm, 'spots', 'lizBelly', line=False)
    balls(st, [(-0.068, -0.32, 0.365), (0.068, -0.32, 0.365)], 0.04)

# ---------------------------------------------------------------- 6. the hop toad
def frog(st):
    bm = bmesh.new(); sph(bm, (0, 0.05, 0.2), 1.0, (0.24, 0.26, 0.185), seg=28, rot=D.rx(-10))
    for s in (-1, 1): sph(bm, (s * 0.125, -0.1, 0.375), 0.09, seg=16)
    st.make(bm, 'body', 'frog', remesh=0.012, soften=3)
    bm = bmesh.new(); sph(bm, (0, -0.12, 0.14), 1.0, (0.17, 0.115, 0.1), seg=16); st.make(bm, 'throat', 'frogBelly')
    balls(st, [(-0.13, -0.15, 0.39), (0.13, -0.15, 0.39)], 0.066, look=(0, -1, 0.05))
    bm = bmesh.new(); mouth = []
    for i in range(9): t = i / 8 * 2 - 1; mouth.append(V((t * 0.19, -0.215 + 0.09 * t * t, 0.245 + 0.03 * t * t)))
    tube(bm, mouth, 0.009, seg=6); st.make(bm, 'mouth', 'eye', line=False)
    bm = bmesh.new()
    for s in (-1, 1):      # the hind legs folded for the hop; small front legs
        cap(bm, (s * 0.16, 0.2, 0.13), (s * 0.31, -0.02, 0.18), 0.075, 0.055, seg=12); cap(bm, (s * 0.31, -0.02, 0.18), (s * 0.28, 0.22, 0.05), 0.05, 0.036, seg=10)
        cap(bm, (s * 0.17, -0.13, 0.14), (s * 0.21, -0.23, 0.04), 0.045, 0.034, seg=10)
    st.make(bm, 'legs', 'frogLeg', remesh=0.011, soften=2)
    bm = bmesh.new()
    for s in (-1, 1): sph(bm, (s * 0.34, 0.1, 0.025), 0.06, (1.0, 2.0, 0.42), seg=10, rot=D.rz(s * 24)); sph(bm, (s * 0.215, -0.26, 0.025), 0.05, (1.3, 1.3, 0.45), seg=10)
    st.make(bm, 'toes', 'frogToe')
    bm = bmesh.new()
    for x, y, z, r in ((0.0, 0.1, 0.385, 0.05), (-0.11, 0.2, 0.33, 0.04), (0.12, 0.17, 0.345, 0.045), (0.02, 0.26, 0.305, 0.034), (-0.06, 0.0, 0.385, 0.03)): sph(bm, (x, y, z), r, (1, 1, 0.3), seg=8)
    st.make(bm, 'spots', 'frogLeg', line=False)

CANDS = [('monkey', monkey), ('snake', snake), ('piglet', piglet), ('rat', rat), ('lizard', lizard), ('frog', frog)]
if __name__ == '__main__':
    a = D.args(); out = os.path.abspath(a[0]) if a else os.path.join(HERE, '..', '..', 'work', 'grove-mob', 'render'); only = a[1].split(',') if len(a) > 1 else None
    items = []
    for name, fn in CANDS:
        if only and name not in only: continue
        for f, turn in (('sw', -45.0), ('e', 90.0)):      # facing the Warrior from his right; and from the side, for the outline
            items.append({'name': name + '/' + f, 'build': (lambda st, fn=fn: fn(st)), 'turn': turn})
    D.render_items(D.Stage(), items, out, (320, 288, 160, 200))
