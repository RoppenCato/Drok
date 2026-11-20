"""swamp.py: the things that stand on the second island, a swamp (Leonard, AD, 2026-11-20; the designs are mine).
Robin, 2026-11-20: "have the GD make a second island to go to with some of the new mobs. That island needs to look
different and have its own theme. A swamp maybe." Mangroves on arched roots with moss hanging from them, a bare dead
tree, reeds, a mossy log, a stump, toadstools red and glowing, ferns, mossy stones, a crooked lantern. Each is one
picture with its origin where it meets the ground, in the look of the figures (two flat tones, the dark line), as the
first island's props are (props.py).
  node tools/blender.js blender/swamp.py -- work/mire/render [name,name...]"""
import sys, os, math, random, json
HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path: sys.path.insert(0, HERE)
import bmesh
from mathutils import Vector, Matrix
import drok as D
from drok import sph, cap, box, cyl, leaf, mix, plate
import props as PR
V = Vector
D.HEX.update({'mangrove': '#7a5648', 'moss': '#2f8f6e', 'moss2': '#52ad6a', 'moss3': '#1f736a', 'hang': '#9fd0a0', 'reed': '#a6d24e', 'reed2': '#6fae4c', 'cattail': '#7a4a2a',
              'log': '#8f6549', 'logIn': '#4f352c', 'dead': '#b6a8b8', 'capRed': '#ee4a4a', 'capGlow': '#63e6dc', 'stalk': '#f6ecd0', 'rockDark': '#8a90a6', 'lotus': '#ff8ab0'})

def tube(bm, pts, r0, r1, seg=10):
    n = len(pts) - 1
    for i in range(n): cap(bm, pts[i], pts[i + 1], r0 + (r1 - r0) * i / n, r0 + (r1 - r0) * (i + 1) / n, seg=seg)
def arc(a, c, b, n=6):
    return [mix(mix(a, c, i / n), mix(c, b, i / n), i / n) for i in range(n + 1)]

def mangrove(seed, h, lean, crown, roots=7):
    """a tree standing on arched roots, a low wide crown of moss, pale moss hanging from it"""
    def b(st):
        rnd = random.Random(seed); kz = 0.62 + rnd.random() * 0.12; knot = V((0, 0, kz)); bm = bmesh.new()
        for i in range(roots):
            a = i / roots * math.tau + (rnd.random() - 0.5) * 0.4; R = 0.55 + rnd.random() * 0.22; foot = V((math.cos(a) * R, math.sin(a) * R * 0.8, 0.0))
            tube(bm, arc(knot + V((0, 0, -0.08)), V((math.cos(a) * R * 0.85, math.sin(a) * R * 0.7, kz * 1.05)), foot), 0.085, 0.04, seg=8)
        top = V((lean, 0, h)); trunk = arc(knot, V((-lean * 0.3, 0, kz + (h - kz) * 0.55)), top, n=7); tube(bm, trunk, 0.17, 0.1, seg=12)
        for s in (-1, 1): tube(bm, arc(trunk[4], trunk[4] + V((s * 0.3, 0, 0.25)), top + V((s * crown * 0.6, 0.05, -0.02))), 0.07, 0.045, seg=8)
        st.make(bm, 'wood', 'mangrove', remesh=0.02, soften=2)
        bm = bmesh.new(); blobs = []
        for i in range(5):
            a = i / 5 * math.tau + rnd.random(); d = crown * (0.25 + rnd.random() * 0.45); c = top + V((math.cos(a) * d, math.sin(a) * d * 0.7, 0.12 + rnd.random() * 0.12)); r = crown * (0.42 + rnd.random() * 0.2); blobs.append((c, r))
            sph(bm, c, r, (1, 1, 0.58), seg=14)
        st.make(bm, 'crown', 'moss', remesh=0.035, soften=3)
        bm = bmesh.new()
        for c, r in blobs[:3]: sph(bm, c + V((-r * 0.2, -r * 0.1, r * 0.32)), r * 0.62, (1, 1, 0.5), seg=12)
        st.make(bm, 'crown_top', 'moss2', remesh=0.03, soften=3)
        bm = bmesh.new()      # the hanging moss: strands from under the crown's edge, each its own length
        for i in range(9):
            a = math.pi + (i / 8 - 0.5) * 2.6 + (rnd.random() - 0.5) * 0.2; d = crown * (0.75 + rnd.random() * 0.2); p = top + V((math.cos(a) * d, math.sin(a) * d * 0.7 - 0.05, 0.02)); L = 0.3 + rnd.random() * 0.45
            cap(bm, p, p + V(((rnd.random() - 0.5) * 0.06, 0, -L)), 0.045, 0.012, seg=6)
        st.make(bm, 'hang', 'hang', line=False); return None
    return b
def deadtree(seed, h):
    def b(st):
        rnd = random.Random(seed); bm = bmesh.new(); top = V((0.18, 0, h)); trunk = arc(V((0, 0, 0)), V((-0.2, 0, h * 0.5)), top, n=7); tube(bm, trunk, 0.17, 0.07, seg=10)
        for i, (k, s) in enumerate(((3, -1), (4, 1), (6, -1))):
            base = trunk[k]; tip = base + V((s * (0.5 + rnd.random() * 0.25), 0.05, 0.4 + rnd.random() * 0.3)); pts = arc(base, base + V((s * 0.35, 0, 0.08)), tip, n=4); tube(bm, pts, 0.06, 0.025, seg=8)
            tube(bm, [pts[2], pts[2] + V((s * 0.12, 0, 0.3))], 0.035, 0.015, seg=6)
        for a in (0.4, 2.3, 4.2): cap(bm, (0, 0, 0.1), (math.cos(a) * 0.3, math.sin(a) * 0.24, 0.0), 0.1, 0.04, seg=8)
        st.make(bm, 'wood', 'dead', remesh=0.018, soften=2); return None
    return b
def reeds(seed, n, tall, heads):
    """a clump of reeds; no line on the blades (thin things ink to black, docs/rules.md 26); cattails on some stems"""
    def b(st):
        rnd = random.Random(seed); tips = []
        for i in range(n):
            a = -1.0 + i * (2.0 / max(1, n - 1)) + (rnd.random() - 0.5) * 0.25; bm = bmesh.new(); L = tall * (0.7 + rnd.random() * 0.4); base = V(((rnd.random() - 0.5) * 0.25, (rnd.random() - 0.5) * 0.12, 0))
            leaf(bm, base, (math.sin(a) * 0.5, -0.2 + rnd.random() * 0.4), L * 0.45, 0.12, 2.1, 0.12, n=7, fold=0.4); st.make(bm, 'blade', 'reed' if i % 2 else 'reed2', solid=0.03, line=False)
        bm = bmesh.new(); stems = bmesh.new()
        for i in range(heads):
            x = (i - (heads - 1) / 2) * 0.16 + (rnd.random() - 0.5) * 0.06; hh = tall * (0.85 + rnd.random() * 0.3); lean = (rnd.random() - 0.5) * 0.16
            cap(stems, (x, 0, 0), (x + lean, 0, hh), 0.022, 0.018, seg=6); cap(bm, (x + lean * 0.8, 0, hh * 0.78), (x + lean, 0, hh * 0.98), 0.055, 0.05, seg=8)
        st.make(stems, 'stems', 'reed2', line=False)
        if heads: st.make(bm, 'heads', 'cattail')
        return None
    return b
def log(seed):
    def b(st):
        rnd = random.Random(seed); R = D.rz(18); bm = bmesh.new(); cyl(bm, (0, 0, 0.2), 0.21, 1.15, axis=(1, 0, 0), seg=14); cap(bm, (0.2, 0, 0.36), (0.32, 0.05, 0.6), 0.06, 0.04, seg=8)
        o = st.make(bm, 'log', 'log'); o.matrix_local = R
        bm = bmesh.new(); cyl(bm, (-0.578, 0, 0.2), 0.15, 0.01, axis=(1, 0, 0), seg=12); o = st.make(bm, 'hollow', 'logIn', line=False); o.matrix_local = R
        bm = bmesh.new()
        for x, r in ((-0.25, 0.17), (0.12, 0.13), (0.4, 0.15)): sph(bm, (x, -0.04, 0.37), r, (1.3, 0.9, 0.4), seg=10)
        o = st.make(bm, 'moss', 'moss2', remesh=0.02, soften=2); o.matrix_local = R; return None
    return b
def shrooms(seed, cap_m, n=3, big=1.0):
    """toadstools: pale stalks, round caps with pale spots"""
    def b(st):
        rnd = random.Random(seed); stalks = bmesh.new(); caps = bmesh.new(); dots = bmesh.new()
        for i in range(n):
            x = (i - (n - 1) / 2) * 0.2 * big + (rnd.random() - 0.5) * 0.06; y = (rnd.random() - 0.5) * 0.14; hh = big * (0.16 + rnd.random() * 0.2); r = big * (0.1 + rnd.random() * 0.06)
            cap(stalks, (x, y, 0), (x, y, hh), 0.04 * big, 0.032 * big, seg=8); sph(caps, (x, y, hh), r, (1, 1, 0.7), seg=14)
            for k in range(3): a = k * 2.1 + rnd.random(); sph(dots, (x + math.cos(a) * r * 0.5, y - r * 0.55, hh + r * 0.3 + math.sin(a) * r * 0.2), r * 0.17, seg=6)
        PR.cut_below(caps, -1)      # nothing to cut; the caps are whole
        st.make(stalks, 'stalks', 'stalk'); st.make(caps, 'caps', cap_m); st.make(dots, 'dots', 'white', line=False); return None
    return b
def stump(seed):
    def b(st):
        bm = bmesh.new(); cyl(bm, (0, 0, 0.17), 0.26, 0.34, r2=0.22, seg=12)
        for a in (0.3, 1.7, 3.0, 4.4, 5.4): cap(bm, (math.cos(a) * 0.18, math.sin(a) * 0.16, 0.12), (math.cos(a) * 0.4, math.sin(a) * 0.32, 0.0), 0.09, 0.04, seg=8)
        st.make(bm, 'stump', 'log', remesh=0.02, soften=2)
        bm = bmesh.new(); cyl(bm, (0, 0, 0.345), 0.2, 0.012, seg=12); st.make(bm, 'top', 'woodHi', line=False)
        shrooms(seed, 'capRed', n=2, big=0.7)(st)
        for o in st.objs[-3:]: o.location = (0.26, -0.2, 0.0)
        return None
    return b
def fern(seed, size):
    def b(st):
        rnd = random.Random(seed)
        for i in range(8):
            a = rnd.random() * math.tau; bm = bmesh.new(); leaf(bm, V((0, 0, 0.05)), (math.cos(a), math.sin(a)), size * (1.0 + rnd.random() * 0.5), 0.2 + rnd.random() * 0.06, 0.75, 0.42, n=9, fold=0.45)
            st.make(bm, 'frond', rnd.choice(['moss', 'moss2', 'moss2', 'leaf3']), solid=0.035)
        return None
    return b
def mossrock(seed, r):
    def b(st):
        PR.rock(seed, r, 'rockDark')(st); bm = bmesh.new(); rnd = random.Random(seed + 50)
        for i in range(3): sph(bm, ((rnd.random() - 0.5) * r * 0.8, (rnd.random() - 0.5) * r * 0.4, r * (0.86 + rnd.random() * 0.08)), r * (0.4 + rnd.random() * 0.2), (1.2, 1.0, 0.4), seg=10)
        st.make(bm, 'moss', 'moss2', remesh=0.025, soften=2); return None
    return b
def lantern():
    """a crooked post with a lamp hung from its arm: the way through the swamp is marked with these"""
    def b(st):
        bm = bmesh.new(); tube(bm, arc(V((0, 0, 0)), V((-0.12, 0, 0.7)), V((0.05, 0, 1.35))), 0.06, 0.045, seg=8); tube(bm, [V((0.05, 0, 1.3)), V((0.36, 0, 1.4))], 0.04, 0.03, seg=8)
        st.make(bm, 'post', 'woodDark')
        bm = bmesh.new(); cap(bm, (0.34, 0, 1.38), (0.34, 0, 1.2), 0.012, 0.012, seg=6); st.make(bm, 'cord', 'black', line=False)
        bm = bmesh.new(); box(bm, (0.34, 0, 1.07), (0.2, 0.2, 0.24)); st.make(bm, 'light', 'yellow', smooth=False)
        bm = bmesh.new(); cyl(bm, (0.34, 0, 1.22), 0.17, 0.08, r2=0.04, seg=8); cyl(bm, (0.34, 0, 0.94), 0.13, 0.03, seg=8); st.make(bm, 'cap', 'black'); return None
    return b

ITEMS = [('mangrove-a', mangrove(3, 2.5, 0.35, 1.05)), ('mangrove-b', mangrove(8, 2.05, -0.4, 0.9, roots=6)), ('mangrove-c', mangrove(12, 1.6, 0.15, 0.72, roots=5)), ('deadtree', deadtree(4, 1.9)),
         ('reeds-a', reeds(1, 6, 1.0, 3)), ('reeds-b', reeds(2, 5, 0.75, 2)), ('reeds-c', reeds(5, 4, 0.55, 0)), ('log', log(1)), ('stump', stump(2)),
         ('shroom-red', shrooms(3, 'capRed')), ('shroom-glow', shrooms(6, 'capGlow', n=4)), ('fern-a', fern(21, 0.42)), ('fern-b', fern(24, 0.55)),
         ('mossrock-a', mossrock(2, 0.46)), ('mossrock-b', mossrock(7, 0.3)), ('mossrock-c', mossrock(9, 0.72)), ('lantern', lantern())]
if __name__ == '__main__':
    a = D.args(); out = os.path.abspath(a[0]) if a else os.path.join(HERE, '..', 'work', 'mire', 'render'); only = a[1].split(',') if len(a) > 1 else None; st = D.Stage(); recs = []
    for name, fn in ITEMS:
        if only and name not in only: continue
        recs += D.render_items(st, [{'name': name, 'build': fn}], out, (512, 512, 256, 400))
    json.dump({'px': D.PX, 'unit': D.UNIT, 'items': recs}, open(os.path.join(out, 'meta.json'), 'w', encoding='utf-8'), indent=1)
