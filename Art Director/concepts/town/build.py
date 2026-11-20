"""build.py: the models for three concepts of the pirate town on Crab Cay (Leonard, AD, 2026-11-20; every design is mine).
Robin, 2026-11-20, in Victor, GD's chat: "Make the starter island a pirate town"; and of my offer of a real town with more
houses, a tavern and a lookout: "Yeah do an updated pirate town suggested". Three towns, each its own idea:
  1 port     the harbour town grown: plaster houses round a cobbled square, a tavern, a lookout tower, flags
  2 wreck    a town built of ships: an upturned hull for a tavern, a stern for a house, a mast for a lookout, sails for roofs
  3 stilts   a town on a deck over the water: thatched huts, a rope of flags, fish racks, posts
Made the way the island's props are (blender/drok.py, blender/props.py). Nothing here is in the game.
  node tools/blender.js concepts/town/build.py -- work/town/render [name,name...]"""
import sys, os, math, json
HERE = os.path.dirname(os.path.abspath(__file__)); BL = os.path.abspath(os.path.join(HERE, '..', '..', 'blender'))
if BL not in sys.path: sys.path.insert(0, BL)
import bpy, bmesh
from mathutils import Vector, Matrix
import drok as D, props
from drok import sph, cap, box, cyl, plate

D.HEX.update({'thatch': '#efc965', 'thatchLo': '#cf9c3c', 'hull': '#b9743f', 'hullLo': '#96592e', 'wallYellow': '#ffe08a', 'wallPink': '#ffc4b0', 'wallBlue': '#bfe6ee', 'roofTeal': '#2aa198', 'roofYellow': '#ffd640', 'cannon': '#3a3040', 'fish': '#9fd6e6'})
def tube(bm, pts, r, seg=6):
    for a, b in zip(pts, pts[1:]): cap(bm, a, b, r, r, seg=seg)
def pitched(bm, w, d, h, rh, along='y', over=0.12):
    """a pitched roof on a box w by d by h; its ridge runs back (y) or across (x)"""
    a, b = w / 2 + over, d / 2 + over
    if along == 'y': P = [(-a, -b, h), (a, -b, h), (a, b, h), (-a, b, h), (0, -b, h + rh), (0, b, h + rh)]; F = ((0, 1, 4), (1, 2, 5, 4), (2, 3, 5), (3, 0, 4, 5), (0, 3, 2, 1))
    else: P = [(-a, -b, h), (a, -b, h), (a, b, h), (-a, b, h), (-a, 0, h + rh), (a, 0, h + rh)]; F = ((0, 1, 5, 4), (1, 2, 5), (2, 3, 4, 5), (3, 0, 4), (0, 3, 2, 1))
    v = [bm.verts.new(p) for p in P]
    for f in F: bm.faces.new([v[i] for i in f])
def flag(bm_pole, st, top, col='red', w=0.5, h=0.32, mark=True):
    """a flag flying to the right of a pole's top"""
    bm = bmesh.new(); plate(bm, [(top[0], top[1], top[2]), (top[0] + w, top[1], top[2] - h * 0.12), (top[0] + w * 0.86, top[1], top[2] - h * 0.5), (top[0] + w, top[1], top[2] - h * 0.9), (top[0], top[1], top[2] - h)]); st.make(bm, 'flag', col, solid=0.02, smooth=False)
    if mark:
        bm = bmesh.new(); c = Vector((top[0] + w * 0.42, top[1] - 0.02, top[2] - h * 0.5))
        for a in (40, -40): box(bm, c, (w * 0.5, 0.012, 0.045), rot=D.ry(a))
        st.make(bm, 'mark', 'white', smooth=False, line=False)

# ---------------------------------------------------------------- 1: the port
def building(w, d, h, wall, roof, along='x', storeys=2, door=0.0, sign=None, balcony=False, chimney=True):
    def b(st):
        bm = bmesh.new(); box(bm, (0, 0, h / 2), (w, d, h)); st.make(bm, 'walls', wall, smooth=False)
        rh = (d if along == 'x' else w) * 0.42; bm = bmesh.new(); pitched(bm, w, d, h, rh, along); st.make(bm, 'roof', roof, smooth=False)
        bm = bmesh.new(); box(bm, (door * w, -d / 2 - 0.01, 0.34), (0.42 if sign else 0.3, 0.04, 0.68)); st.make(bm, 'door', 'woodDark', smooth=False)
        bm = bmesh.new(); n = max(2, int(w / 0.75))
        for s in range(storeys):
            z = h * (0.36 + 0.42 * s) if storeys > 1 else h * 0.6
            for i in range(n):
                x = (i - (n - 1) / 2) * (w / n)
                if s == 0 and abs(x - door * w) < 0.36: continue
                box(bm, (x, -d / 2 - 0.01, z), (0.26, 0.04, 0.3))
        st.make(bm, 'windows', 'glass', smooth=False)
        bm = bmesh.new()
        if balcony: box(bm, (0, -d / 2 - 0.16, h * 0.56), (w * 0.62, 0.3, 0.05)); box(bm, (0, -d / 2 - 0.3, h * 0.56 + 0.13), (w * 0.62, 0.04, 0.05)); [box(bm, (sx * w * 0.3, -d / 2 - 0.3, h * 0.56 + 0.07), (0.04, 0.04, 0.16)) for sx in (-1, 0, 1)]
        if chimney: box(bm, (w * 0.28, d * 0.2 if along == 'x' else 0, h + rh * 0.62), (0.2, 0.2, 0.5))
        box(bm, (0, -d / 2 - 0.02, 0.03), (w + 0.06, 0.06, 0.06)); st.make(bm, 'trim', 'woodHi', smooth=False)
        if sign:      # a board hung from a bracket over the door, a mug on it
            bm = bmesh.new(); box(bm, (door * w + 0.45, -d / 2 - 0.3, h * 0.5 + 0.34), (0.05, 0.62, 0.05)); st.make(bm, 'bracket', 'black', smooth=False)
            bm = bmesh.new(); box(bm, (door * w + 0.45, -d / 2 - 0.5, h * 0.5 + 0.08), (0.42, 0.05, 0.38)); st.make(bm, 'board', 'woodHi', smooth=False)
            bm = bmesh.new(); cyl(bm, (door * w + 0.45, -d / 2 - 0.54, h * 0.5 + 0.07), 0.09, 0.03, axis=(0, 1, 0), seg=12); box(bm, (door * w + 0.57, -d / 2 - 0.54, h * 0.5 + 0.07), (0.07, 0.03, 0.1)); st.make(bm, 'mug', 'gold', line=False)
        return None
    return b
def tower(roof='roof', thatch=False):
    def b(st):
        bm = bmesh.new()
        for sx in (-1, 1):
            for sy in (-1, 1): cap(bm, (sx * 0.5, sy * 0.5, 0), (sx * 0.4, sy * 0.4, 2.7), 0.07, 0.06, seg=8); cyl(bm, (sx * 0.46, sy * 0.46, 3.15), 0.045, 0.75, seg=6)
        for sx in (-1, 1): cap(bm, (sx * 0.5, -0.5, 0.2), (-sx * 0.42, -0.42, 2.4), 0.04, 0.04, seg=6)
        st.make(bm, 'posts', 'woodDark')
        bm = bmesh.new(); box(bm, (0, 0, 2.72), (1.3, 1.3, 0.09)); box(bm, (0, -0.63, 3.05), (1.3, 0.05, 0.07)); box(bm, (0, 0.63, 3.05), (1.3, 0.05, 0.07))
        for sx in (-1, 1): box(bm, (sx * 0.63, 0, 3.05), (0.05, 1.3, 0.07))
        st.make(bm, 'deck', 'woodHi', smooth=False)
        bm = bmesh.new(); v = [bm.verts.new(p) for p in ((-0.78, -0.78, 3.5), (0.78, -0.78, 3.5), (0.78, 0.78, 3.5), (-0.78, 0.78, 3.5), (0, 0, 4.15))]
        for f in ((0, 1, 4), (1, 2, 4), (2, 3, 4), (3, 0, 4), (0, 3, 2, 1)): bm.faces.new([v[i] for i in f])
        st.make(bm, 'roof', 'thatch' if thatch else roof, smooth=False)
        bm = bmesh.new()
        for sx in (-1, 1): cap(bm, (sx * 0.16 - 0.1, -0.56, 0), (sx * 0.16 - 0.1, -0.66, 2.7), 0.03, 0.03, seg=6)
        for i in range(8): box(bm, (-0.1, -0.57 - i * 0.012, 0.3 + i * 0.32), (0.34, 0.04, 0.04))
        st.make(bm, 'ladder', 'wood', smooth=False)
        bm = bmesh.new(); cyl(bm, (0, 0, 4.5), 0.03, 0.8, seg=6); st.make(bm, 'pole', 'woodDark'); flag(None, st, (0.02, 0, 4.88)); return None
    return b
def bunting(length=3.0, h=1.5):
    def b(st):
        bm = bmesh.new()
        for sx in (-1, 1): cyl(bm, (sx * length / 2, 0, h / 2), 0.045, h, seg=8)
        st.make(bm, 'posts', 'woodDark')
        n = 9; line = [Vector((-length / 2 + length * i / (n * 2), 0, h - 0.04 - 0.22 * math.sin(math.pi * i / (n * 2)))) for i in range(n * 2 + 1)]
        bm = bmesh.new(); tube(bm, line, 0.012, seg=4); st.make(bm, 'line', 'rope', line=False)
        for k, col in enumerate(('red', 'yellow', 'trou', 'white')):
            bm = bmesh.new()
            for i in range(n):
                if i % 4 != k: continue
                a, c = line[i * 2], line[i * 2 + 2]; plate(bm, [a, c, (a + c) / 2 + Vector((0, 0, -0.26))])
            st.make(bm, 'pennants' + col, col, solid=0.02, smooth=False)
        return None
    return b
def cannon():
    def b(st):
        bm = bmesh.new(); box(bm, (0, 0.05, 0.2), (0.44, 0.8, 0.16)); box(bm, (0, 0.2, 0.33), (0.4, 0.4, 0.12)); st.make(bm, 'carriage', 'wood', smooth=False)
        bm = bmesh.new()
        for sx in (-1, 1):
            for y in (-0.2, 0.3): cyl(bm, (sx * 0.26, y, 0.13), 0.13, 0.07, axis=(1, 0, 0), seg=12)
        st.make(bm, 'wheels', 'woodDark')
        bm = bmesh.new(); cyl(bm, (0, -0.1, 0.42), 0.14, 1.0, axis=(0, -1, 0.12), r2=0.1, seg=14); sph(bm, (0, 0.42, 0.37), 0.15, seg=12); cyl(bm, (0, -0.6, 0.48), 0.125, 0.07, axis=(0, -1, 0.12), seg=14); st.make(bm, 'barrel', 'cannon'); return None
    return b

# ---------------------------------------------------------------- 2: the town built of ships
def hull_house():
    """an upturned hull for a tavern: its keel is the roof's ridge, a door cut in its side, a round window, a stove pipe"""
    def b(st):
        bm = bmesh.new(); sph(bm, (0, 0, 0), 1.0, (1.85, 0.98, 1.8), seg=32); props.cut_below(bm, 0.0); st.make(bm, 'hull', 'hull')
        bm = bmesh.new()
        for z in (0.4, 0.8, 1.2, 1.5): k = math.sqrt(max(0.0, 1 - (z / 1.8) ** 2)); sph(bm, (0, 0, z), 1.0, (1.85 * k + 0.014, 0.98 * k + 0.014, 0.045), seg=32)
        st.make(bm, 'strakes', 'hullLo', line=False)
        bm = bmesh.new(); box(bm, (0, 0, 1.8), (2.9, 0.12, 0.14)); cap(bm, (-1.45, 0, 1.8), (-1.95, 0, 0.9), 0.07, 0.06, seg=6); cap(bm, (1.45, 0, 1.8), (1.95, 0, 0.9), 0.07, 0.06, seg=6); st.make(bm, 'keel', 'woodDark', smooth=False)
        bm = bmesh.new(); box(bm, (-0.35, -0.9, 0.36), (0.46, 0.14, 0.72)); st.make(bm, 'door', 'woodDark', smooth=False)
        bm = bmesh.new(); box(bm, (-0.35, -0.93, 0.76), (0.58, 0.1, 0.08)); box(bm, (-0.62, -0.93, 0.36), (0.07, 0.1, 0.76)); box(bm, (-0.08, -0.93, 0.36), (0.07, 0.1, 0.76)); cyl(bm, (0.7, -0.83, 0.62), 0.24, 0.1, axis=(0, 1, 0.25), seg=16); st.make(bm, 'frame', 'woodHi', smooth=False)
        bm = bmesh.new(); cyl(bm, (0.7, -0.87, 0.63), 0.17, 0.1, axis=(0, 1, 0.25), seg=16); st.make(bm, 'window', 'glass')
        bm = bmesh.new(); cyl(bm, (0.9, 0.2, 1.75), 0.08, 0.9, seg=8); cyl(bm, (0.9, 0.2, 2.22), 0.12, 0.06, seg=8); st.make(bm, 'pipe', 'cannon')
        bm = bmesh.new(); box(bm, (-0.82, -0.98, 0.9), (0.14, 0.12, 0.18)); st.make(bm, 'lantern', 'yellow', smooth=False); return None
    return b
def stern_house():
    """a ship's stern set in the sand as a house: a row of windows, a rail, a lantern on top"""
    def b(st):
        w, d, h = 2.1, 1.2, 1.9
        bm = bmesh.new(); box(bm, (0, 0, h / 2), (w, d, h)); st.make(bm, 'stern', 'hull', smooth=False)
        bm = bmesh.new()
        for z in (0.3, 0.62, 0.94): box(bm, (0, -d / 2 - 0.006, z), (w, 0.012, 0.03))
        st.make(bm, 'seams', 'hullLo', smooth=False, line=False)
        bm = bmesh.new(); box(bm, (0, -d / 2 - 0.03, 1.36), (w + 0.1, 0.1, 0.5)); box(bm, (0, -d / 2 - 0.05, h + 0.06), (w + 0.16, 0.16, 0.12)); st.make(bm, 'gallery', 'woodHi', smooth=False)
        bm = bmesh.new()
        for i in range(4): box(bm, (-0.72 + i * 0.48, -d / 2 - 0.09, 1.36), (0.34, 0.03, 0.34))
        st.make(bm, 'panes', 'glass', smooth=False)
        bm = bmesh.new(); box(bm, (0, -d / 2 - 0.085, 1.07), (w + 0.12, 0.05, 0.07)); box(bm, (0, -d / 2 - 0.085, 1.65), (w + 0.12, 0.05, 0.07)); st.make(bm, 'gold', 'gold', smooth=False)
        bm = bmesh.new(); box(bm, (0.5, -d / 2 - 0.02, 0.36), (0.42, 0.05, 0.72)); st.make(bm, 'door', 'woodDark', smooth=False)
        bm = bmesh.new()
        for sx in (-1, 0, 1): box(bm, (sx * 0.95, 0.3, h + 0.3), (0.07, 0.07, 0.5))
        box(bm, (0, 0.3, h + 0.56), (2.0, 0.07, 0.07)); st.make(bm, 'rail', 'woodDark', smooth=False)
        bm = bmesh.new(); box(bm, (-0.6, -0.2, h + 0.36), (0.22, 0.22, 0.3)); st.make(bm, 'lantern', 'yellow', smooth=False)
        bm = bmesh.new(); cyl(bm, (-0.6, -0.2, h + 0.56), 0.18, 0.1, r2=0.03, seg=8); cyl(bm, (-0.6, -0.2, h + 0.16), 0.05, 0.12, seg=6); st.make(bm, 'cap', 'cannon'); return None
    return b
def mast():
    """a broken ship's mast for a lookout: a crow's nest, a yard with a sail let down, a flag"""
    def b(st):
        bm = bmesh.new(); cyl(bm, (0, 0, 1.9), 0.11, 3.8, r2=0.08, seg=10); cyl(bm, (0, 0, 2.3), 0.05, 2.5, axis=(1, 0, 0), seg=8); st.make(bm, 'mast', 'woodDark')
        bm = bmesh.new(); cyl(bm, (0, 0, 3.05), 0.3, 0.34, r2=0.36, seg=14); st.make(bm, 'nest', 'woodHi')
        bm = bmesh.new(); cyl(bm, (0, 0, 3.23), 0.37, 0.05, seg=14); cyl(bm, (0, 0, 2.9), 0.31, 0.05, seg=14); st.make(bm, 'hoops', 'cannon')
        bm = bmesh.new(); plate(bm, [(-1.15, -0.04, 2.26), (1.15, -0.04, 2.26), (1.05, -0.1, 1.25), (0.4, -0.16, 1.05), (-0.5, -0.14, 1.12), (-1.08, -0.08, 1.3)]); st.make(bm, 'sail', 'sail', solid=0.03, smooth=False)
        bm = bmesh.new()
        for x in (-0.6, 0.0, 0.6): box(bm, (x, -0.13, 1.72), (0.2, 0.012, 1.0))
        st.make(bm, 'stripes', 'red', smooth=False, line=False)
        for sx in (-1, 1): bm = bmesh.new(); tube(bm, [(sx * 1.2, 0, 2.3), (sx * 0.7, 0.3, 1.2), (sx * 0.9, 0.5, 0.0)], 0.018, seg=4); st.make(bm, 'rope', 'rope', line=False)
        flag(None, st, (0.02, 0, 3.8)); return None
    return b
def awning():
    """a market under a sail: four spars, a striped cloth, a table of fruit"""
    def b(st):
        bm = bmesh.new()
        for sx in (-1, 1): cyl(bm, (sx * 0.95, 0.5, 0.8), 0.045, 1.6, seg=8); cyl(bm, (sx * 0.95, -0.5, 0.65), 0.045, 1.3, seg=8)
        st.make(bm, 'spars', 'woodDark')
        for i in range(6):
            bm = bmesh.new(); x = -1.0 + i * 0.4; plate(bm, [(x - 0.2, 0.62, 1.6), (x + 0.2, 0.62, 1.6), (x + 0.2, -0.66, 1.26), (x - 0.2, -0.66, 1.26)]); st.make(bm, 'cloth', 'red' if i % 2 else 'sail', solid=0.03, smooth=False)
        bm = bmesh.new(); box(bm, (0, 0.05, 0.3), (1.5, 0.55, 0.6)); st.make(bm, 'table', 'hull', smooth=False)
        for x, m in ((-0.5, 'yellow'), (0.0, 'leaf2'), (0.5, 'red')):
            bm = bmesh.new()
            for j in range(4): sph(bm, (x - 0.09 + (j % 2) * 0.16, -0.03 + (j // 2) * 0.16, 0.67), 0.09, seg=10)
            st.make(bm, 'goods', m)
        return None
    return b
def anchor():
    def b(st):
        R = D.ry(-24); T = lambda x, y, z: R @ Vector((x, y, z)) + Vector((0, 0, 0.1))
        bm = bmesh.new(); cap(bm, T(0, 0, 0.1), T(0, 0, 1.25), 0.06, 0.05, seg=8); cap(bm, T(-0.32, 0, 1.05), T(0.32, 0, 1.05), 0.045, 0.045, seg=8)
        n = 8; arc = [T(0.55 * math.sin(a), 0, 0.42 - 0.34 * math.cos(a)) for a in [(-0.5 + i / n) * math.pi for i in range(n + 1)]]; tube(bm, arc, 0.06, seg=8)
        for s in (0, n): p = arc[s]; q = arc[1 if s == 0 else n - 1]; d = (p - q).normalized(); cap(bm, p, p + d * 0.04 + Vector((0, 0, 0.2)), 0.1, 0.02, seg=8)
        st.make(bm, 'anchor', 'cannon', remesh=0.02, soften=2)
        bm = bmesh.new(); m = 10; tube(bm, [T(0.13 * math.sin(i / m * math.tau), 0, 1.38 - 0.13 * math.cos(i / m * math.tau)) for i in range(m + 1)], 0.03, seg=6); st.make(bm, 'ring', 'iron'); return None
    return b

# ---------------------------------------------------------------- 3: the town on stilts
def hut(w, d, h, door=0.0, deep=False):
    """a plank hut under a thick roof of palm thatch"""
    def b(st):
        bm = bmesh.new(); box(bm, (0, 0, h / 2), (w, d, h)); st.make(bm, 'walls', 'woodHi', smooth=False)
        bm = bmesh.new()
        for i in range(int(w / 0.22)): box(bm, (-w / 2 + 0.11 + i * 0.22, -d / 2 - 0.006, h / 2), (0.02, 0.012, h))
        st.make(bm, 'planks', 'wood', smooth=False, line=False)
        a, c, rh = w / 2 + 0.34, d / 2 + 0.34, (1.2 if deep else 0.95); bm = bmesh.new(); v = [bm.verts.new(p) for p in ((-a, -c, h - 0.08), (a, -c, h - 0.08), (a, c, h - 0.08), (-a, c, h - 0.08), (-w * 0.2, 0, h + rh), (w * 0.2, 0, h + rh))]
        for f in ((0, 1, 5, 4), (1, 2, 5), (2, 3, 4, 5), (3, 0, 4), (0, 3, 2, 1)): bm.faces.new([v[i] for i in f])
        st.make(bm, 'roof', 'thatch', smooth=False)
        bm = bmesh.new(); box(bm, (0, -c - 0.01, h - 0.06), (2 * a, 0.05, 0.16))
        for i in range(int(2 * a / 0.3)): box(bm, (-a + 0.15 + i * 0.3, -c - 0.03, h - 0.2), (0.16, 0.04, 0.16))
        st.make(bm, 'fringe', 'thatchLo', smooth=False, line=False)
        bm = bmesh.new(); box(bm, (door * w, -d / 2 - 0.01, 0.34), (0.4, 0.04, 0.68)); box(bm, (-door * w if door else w * 0.28, -d / 2 - 0.01, h * 0.58), (0.3, 0.04, 0.28)); st.make(bm, 'openings', 'woodDark', smooth=False)
        bm = bmesh.new(); plate(bm, [(door * w - 0.2, -d / 2 - 0.04, 0.68), (door * w + 0.06, -d / 2 - 0.04, 0.68), (door * w - 0.02, -d / 2 - 0.04, 0.2), (door * w - 0.2, -d / 2 - 0.04, 0.12)]); st.make(bm, 'curtain', 'red', solid=0.02, smooth=False); return None
    return b
def post():
    def b(st):
        bm = bmesh.new(); cyl(bm, (0, 0, 0.42), 0.1, 0.84, r2=0.085, seg=10); st.make(bm, 'post', 'woodDark')
        bm = bmesh.new(); cyl(bm, (0, 0, 0.62), 0.105, 0.1, seg=10); st.make(bm, 'rope', 'rope')
        bm = bmesh.new(); cyl(bm, (0, 0, 0.845), 0.085, 0.01, seg=10); st.make(bm, 'top', 'woodHi', line=False); return None
    return b
def rack():
    """fish hung up to dry"""
    def b(st):
        bm = bmesh.new()
        for sx in (-1, 1): cyl(bm, (sx * 0.7, 0, 0.6), 0.04, 1.2, seg=8); cap(bm, (sx * 0.7, 0, 0.6), (sx * 0.95, 0.25, 0.0), 0.03, 0.03, seg=6)
        cyl(bm, (0, 0, 1.15), 0.035, 1.6, axis=(1, 0, 0), seg=8); st.make(bm, 'frame', 'woodDark')
        bm = bmesh.new()
        for i in range(5): sph(bm, (-0.5 + i * 0.25, -0.02, 0.86), 0.075, (0.8, 0.5, 2.3), seg=10)
        st.make(bm, 'fish', 'fish')
        bm = bmesh.new()
        for i in range(5): plate(bm, [(-0.5 + i * 0.25 - 0.07, -0.02, 0.63), (-0.5 + i * 0.25 + 0.07, -0.02, 0.63), (-0.5 + i * 0.25, -0.02, 0.72)])
        st.make(bm, 'tails', 'trou', solid=0.02, smooth=False, line=False); return None
    return b

T = lambda name, build, frame=(512, 512, 256, 400), turn=0.0: dict(name=name, build=build, frame=frame, turn=turn)
ITEMS = [
    T('tavern', building(2.9, 1.7, 2.3, 'wallYellow', 'roof', 'x', 2, door=-0.12, sign=True, balcony=True), (640, 640, 320, 520)), T('house-d', building(1.7, 1.3, 2.0, 'wallPink', 'roofTeal', 'y', 2, door=0.0), (512, 600, 256, 480)),
    T('house-e', building(2.2, 1.4, 1.5, 'wallBlue', 'roofYellow', 'x', 1, door=0.2), (512, 512, 256, 400)), T('house-f', building(1.5, 1.2, 1.4, 'plaster', 'roofBlue', 'y', 1, door=0.0, chimney=False), (512, 512, 256, 400)),
    T('tower', tower(), (448, 760, 224, 680)), T('bunting', bunting(), (512, 320, 256, 250)), T('cannon', cannon(), (256, 256, 128, 190), 20),
    T('hull-house', hull_house(), (640, 600, 320, 470)), T('stern-house', stern_house(), (512, 600, 256, 480)), T('mast', mast(), (512, 720, 256, 640)), T('awning', awning(), (512, 512, 256, 400)), T('anchor', anchor(), (256, 320, 128, 250)),
    T('hut-a', hut(1.9, 1.3, 1.2, door=-0.18), (512, 512, 256, 400)), T('hut-b', hut(1.5, 1.2, 1.3, door=0.0, deep=True), (512, 560, 256, 440)), T('hut-c', hut(2.5, 1.5, 1.35, door=0.16, deep=True), (640, 600, 320, 470)),
    T('tower-thatch', tower(thatch=True), (448, 760, 224, 680)), T('post', post(), (128, 192, 64, 150)), T('rack', rack(), (384, 320, 192, 250)),
]
if __name__ == '__main__':
    a = D.args(); out = os.path.abspath(a[0]) if a else os.path.join(HERE, '..', '..', 'work', 'town', 'render'); only = a[1].split(',') if len(a) > 1 else None
    st = D.Stage(); recs = []; old = os.path.join(out, 'meta.json')
    if only and os.path.exists(old): recs = [r for r in json.load(open(old, encoding='utf-8'))['items'] if r['name'] not in only]
    for it in ITEMS:
        if only and it['name'] not in only: continue
        recs += D.render_items(st, [it], out, it['frame'])
    json.dump({'px': D.PX, 'unit': D.UNIT, 'items': recs}, open(os.path.join(out, 'meta.json'), 'w', encoding='utf-8'), indent=1); print('town:', len(recs), 'pictures')
