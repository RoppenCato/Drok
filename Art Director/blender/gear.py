"""gear.py: the first gear the Warrior finds, three tiers of each (Leonard, AD, 2026-11-20; the designs are mine).
  cutlass: rusty, sailor's, corsair's      one picture each: the grip at the origin, the blade pointing up; the game turns it by the hand point's r
  buckler: plank, iron, brass              five pictures each (s, se, e, ne, n), made on the body's rest pose; the origin is the body's off point
  hat: bandana, tricorn, feathered         five pictures each, made on the rest pose's head; the origin is the body's head point
and each, with three coats (linen shirt, sailor's coat, corsair's coat), as an icon of 48 for the bag.
Each tier has its own outline, not only its own colour: a rare piece must look rare by its shape (Robin, 2026-11-20: no glow on the hero).
  node tools/blender.js blender/gear.py -- work/gear/render"""
import sys, os, math
HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path: sys.path.insert(0, HERE)
import bmesh
from mathutils import Vector, Matrix
import drok as D, hero
from drok import sph, cap, box, cyl, plate

REST = hero.pose(); T, PEL, HEAD, HR = hero.frame_of(REST); OFF = hero.off_of(REST); R = hero.HEAD_R

# ---------------------------------------------------------------- cutlasses: built standing in the XZ plane, the grip at the origin
BLADES = {     # a cutlass is broad and curved: the back hollow, the belly full, wider toward the point
    'rusty': dict(prof=[(-0.03, 0.07), (-0.05, 0.2), (-0.045, 0.31), (-0.01, 0.37), (0.02, 0.4), (0.05, 0.36), (0.07, 0.29), (0.045, 0.265), (0.072, 0.23), (0.062, 0.14), (0.04, 0.07)], edge=None, blade='rust', grip='woodDark', guard='iron', bow=False, tassel=None),
    'sailor': dict(prof=[(-0.03, 0.07), (-0.052, 0.22), (-0.05, 0.36), (-0.012, 0.47), (0.05, 0.545), (0.092, 0.47), (0.098, 0.34), (0.078, 0.2), (0.045, 0.07)], edge=[(0.03, 0.09), (0.058, 0.22), (0.07, 0.35), (0.062, 0.46), (0.05, 0.52), (0.092, 0.47), (0.098, 0.34), (0.078, 0.2), (0.045, 0.07)], blade='steel', grip='wood', guard='brass', bow=True, tassel=None),
    'corsair': dict(prof=[(-0.03, 0.07), (-0.06, 0.24), (-0.066, 0.42), (-0.03, 0.56), (0.03, 0.64), (0.1, 0.69), (0.135, 0.6), (0.135, 0.44), (0.105, 0.26), (0.05, 0.07)], edge=[(0.032, 0.09), (0.078, 0.26), (0.1, 0.44), (0.098, 0.58), (0.1, 0.66), (0.135, 0.6), (0.135, 0.44), (0.105, 0.26), (0.05, 0.07)], blade='steel', grip='navy', guard='gold', bow=True, tassel='red'),
}
def cutlass(kind):
    B = BLADES[kind]
    def b(st):
        bm = bmesh.new(); plate(bm, [(x, 0, z) for x, z in B['prof']]); st.make(bm, 'blade', B['blade'], solid=0.024, smooth=False)
        if B['edge']: bm = bmesh.new(); plate(bm, [(x, -0.014, z) for x, z in B['edge']]); st.make(bm, 'edge', 'white', solid=0.006, smooth=False)     # the ground edge, a lighter band
        else:
            bm = bmesh.new()
            for x, z in ((-0.012, 0.16), (0.008, 0.3), (-0.014, 0.33)): sph(bm, (x, -0.014, z), 0.012, (1, 0.4, 1.4), seg=8)                          # pits of rust
            st.make(bm, 'pits', 'woodDark', line=False)
        bm = bmesh.new(); cap(bm, (0, 0, -0.065), (0, 0, 0.05), 0.023, 0.023); st.make(bm, 'grip', B['grip'])
        bm = bmesh.new(); box(bm, (0.004, 0, 0.062), (0.15 if B['bow'] else 0.12, 0.034, 0.024)); sph(bm, (0, 0, -0.075), 0.03)
        if B['bow']: cap(bm, (0.072, 0, 0.06), (0.078, 0, -0.01), 0.013, 0.013, seg=8); cap(bm, (0.078, 0, -0.01), (0.02, 0, -0.078), 0.013, 0.013, seg=8)
        if kind == 'corsair': sph(bm, (0.045, -0.01, 0.0), 0.05, (1, 0.5, 1.25), seg=12)                                                                # a shell guard
        st.make(bm, 'guard', B['guard'])
        if B['tassel']: bm = bmesh.new(); cap(bm, (0, 0, -0.1), (-0.05, 0, -0.16), 0.014, 0.024, seg=8); st.make(bm, 'tassel', B['tassel'])
        return None
    return b

# ---------------------------------------------------------------- bucklers: a disc about a centre, its face along f
def buckler(kind, c, f):
    def b(st):
        f_ = Vector(f).normalized(); c_ = Vector(c); Rm = Vector((0, 0, 1)).rotation_difference(f_).to_matrix().to_4x4(); at = lambda x, y, z: c_ + (Rm @ Vector((x, y, z)))
        if kind == 'plank':
            bm = bmesh.new(); cyl(bm, c_, 0.15, 0.03, axis=f_, seg=12); st.make(bm, 'face', 'wood', smooth=False)
            bm = bmesh.new(); box(bm, at(0, 0.055, 0.02), (0.26, 0.036, 0.014), rot=Rm); box(bm, at(0, -0.055, 0.02), (0.26, 0.036, 0.014), rot=Rm); st.make(bm, 'battens', 'woodDark', smooth=False)
            bm = bmesh.new()
            for x, y in ((-0.09, 0.055), (0.09, 0.055), (-0.09, -0.055), (0.09, -0.055)): sph(bm, at(x, y, 0.03), 0.012, seg=8)
            st.make(bm, 'nails', 'iron', line=False)
        elif kind == 'iron':
            bm = bmesh.new(); cyl(bm, c_, 0.172, 0.026, axis=f_); st.make(bm, 'rim', 'iron')
            bm = bmesh.new(); cyl(bm, at(0, 0, 0.006), 0.14, 0.03, axis=f_); st.make(bm, 'face', 'wood')
            bm = bmesh.new(); sph(bm, at(0, 0, 0.03), 0.05)
            for i in range(6): a = i / 6 * math.tau; sph(bm, at(math.cos(a) * 0.105, math.sin(a) * 0.105, 0.022), 0.013, seg=8)
            st.make(bm, 'boss', 'iron')
        else:
            bm = bmesh.new(); cyl(bm, c_, 0.188, 0.028, axis=f_); st.make(bm, 'rim', 'brass')
            bm = bmesh.new(); cyl(bm, at(0, 0, 0.006), 0.152, 0.032, axis=f_); st.make(bm, 'face', 'red')
            bm = bmesh.new(); sph(bm, at(0, 0, 0.032), 0.056)
            for i in range(4): a = i / 4 * math.tau + 0.785; box(bm, at(math.cos(a) * 0.09, math.sin(a) * 0.09, 0.024), (0.11, 0.028, 0.012), rot=Rm @ D.rz(math.degrees(a)))
            st.make(bm, 'boss', 'brass')
        return c_
    return b

# ---------------------------------------------------------------- hats: built round a head whose middle and turn are given
def hat(kind, Hm):
    def b(st):
        def mk(bm, name, m, **kw): o = st.make(bm, name, m, **kw); o.matrix_local = Hm; return o
        def crown(r, z0, tilt=0.1, squash=(1, 0.96, 0.95)):
            bm = bmesh.new(); sph(bm, (0, 0, 0), r, squash, seg=32); bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], dist=1e-5, plane_co=(0, 0, z0), plane_no=(0, tilt, 1), clear_inner=True); return bm
        if kind == 'bandana':
            bm = crown(R + 0.016, 0.085); sph(bm, (-0.07, 0.205, 0.075), 0.045); cap(bm, (-0.07, 0.205, 0.075), (-0.2, 0.33, 0.06), 0.036, 0.014); cap(bm, (-0.07, 0.205, 0.075), (-0.1, 0.35, -0.03), 0.036, 0.014); mk(bm, 'cloth', 'red')
            bm = bmesh.new()
            for x, y, z in ((-0.1, -0.13, 0.17), (0.06, -0.15, 0.17), (0.14, -0.02, 0.18), (-0.03, 0.02, 0.232), (-0.15, 0.03, 0.16), (0.06, 0.13, 0.19)): sph(bm, (x, y, z), 0.02, seg=8)
            mk(bm, 'dots', 'white', line=False)
        elif kind == 'tricorn':
            C3 = [(0.0, -0.4), (0.345, 0.2), (-0.345, 0.2)]; z = 0.1
            bm = bmesh.new(); pts = []
            for i in range(3):
                a, b2 = Vector(C3[i]), Vector(C3[(i + 1) % 3]); pts += [(a.x, a.y, z), ((a.x * 0.6 + b2.x * 0.4) * 0.86, (a.y * 0.6 + b2.y * 0.4) * 0.86, z), ((a.x * 0.4 + b2.x * 0.6) * 0.86, (a.y * 0.4 + b2.y * 0.6) * 0.86, z)]
            plate(bm, pts); mk(bm, 'brim', 'black', solid=0.03, smooth=False)
            bm = bmesh.new()
            for i in range(3):       # the three sides rolled up against the crown
                a, b2 = Vector(C3[i]), Vector(C3[(i + 1) % 3]); m = (a + b2) / 2 * 0.62; cap(bm, (a.x * 0.92, a.y * 0.92, z + 0.02), (m.x, m.y, z + 0.1), 0.03, 0.05); cap(bm, (m.x, m.y, z + 0.1), (b2.x * 0.92, b2.y * 0.92, z + 0.02), 0.05, 0.03)
            mk(bm, 'rolls', 'black', remesh=0.012, soften=3)
            bm = crown(R + 0.03, 0.09, squash=(1, 0.96, 0.98)); mk(bm, 'crown', 'black')
            bm = bmesh.new()
            for i in range(3):
                a, b2 = Vector(C3[i]), Vector(C3[(i + 1) % 3]); m = (a + b2) / 2 * 0.62; cap(bm, (a.x * 0.95, a.y * 0.95, z + 0.045), (m.x * 1.04, m.y * 1.04, z + 0.15), 0.011, 0.011, seg=8); cap(bm, (m.x * 1.04, m.y * 1.04, z + 0.15), (b2.x * 0.95, b2.y * 0.95, z + 0.045), 0.011, 0.011, seg=8)
            mk(bm, 'trim', 'gold')
        else:      # the feathered hat: a wide brim, a tall crown, a gold band, a red plume swept back
            bm = bmesh.new(); cyl(bm, (0, 0.02, 0.1), 0.39, 0.03, axis=(0.1, 0.12, 1), seg=28); mk(bm, 'brim', 'navy')
            bm = crown(R + 0.03, 0.09, squash=(1, 0.96, 1.16)); mk(bm, 'crown', 'navy')
            bm = bmesh.new(); cyl(bm, (0, 0.012, 0.125), R + 0.043, 0.04, axis=(0.1, 0.12, 1), seg=28); mk(bm, 'band', 'gold')
            bm = bmesh.new(); D.leaf(bm, (0.17, 0.0, 0.15), (0.35, 1.0), 0.5, 0.2, 0.5, 0.18, n=10, fold=0.5); mk(bm, 'plume', 'plume', solid=0.03)
            bm = bmesh.new(); D.leaf(bm, (0.19, 0.03, 0.14), (0.7, 0.7), 0.3, 0.2, 0.5, 0.3, n=8, fold=0.5); mk(bm, 'plume2', 'feather', solid=0.025)
        return Hm @ Vector((0, 0, 0))
    return b

# ---------------------------------------------------------------- coats, as icons for the bag only (on the body they are a colour for now)
def coat(kind):
    def b(st):
        P = hero.pose(rh=(-0.3, -0.04, 0.22), lh=(0.3, -0.04, 0.22)); T2 = Matrix.Identity(4); pel = Vector((0, 0, 0)); base = {'linen': 'linen', 'sailor': 'navy', 'corsair': 'red'}[kind]
        RS, LS = Vector((-0.19, 0, 0.275)), Vector((0.19, 0, 0.275)); RE, _ = hero.ik2(RS, P['rh'], hero.UA, hero.FA, (-0.6, 0.5, -0.6)); LE, _ = hero.ik2(LS, P['lh'], hero.UA, hero.FA, (0.6, 0.5, -0.6))
        bm = bmesh.new(); sph(bm, (0, 0, 0.17), 0.17, (1, 0.76, 1.04), seg=28); cap(bm, RS, RE, 0.07, 0.064); cap(bm, LS, LE, 0.07, 0.064)
        if kind != 'linen': cap(bm, RE, mix3(RE, P['rh'], 0.8), 0.064, 0.06); cap(bm, LE, mix3(LE, P['lh'], 0.8), 0.064, 0.06); sph(bm, (0, 0.0, 0.0), 0.175, (1, 0.78, 0.9))      # long sleeves and a skirt
        if kind == 'corsair': sph(bm, (0, 0.02, -0.12), 0.19, (1, 0.74, 0.8))
        st.make(bm, 'coat', base, remesh=0.006, soften=12)
        bm = bmesh.new()
        if kind == 'linen': cap(bm, (-0.03, -0.128, 0.3), (0.0, -0.14, 0.2), 0.012, 0.012, seg=8); cap(bm, (0.03, -0.128, 0.3), (0.0, -0.14, 0.2), 0.012, 0.012, seg=8); st.make(bm, 'lace', 'rope')
        else:
            for z in (0.24, 0.15, 0.06, -0.03): sph(bm, (0.045, -0.135 - (0.015 if z < 0.2 else 0), z), 0.02, seg=8)
            if kind == 'corsair':
                for sx in (-1, 1): sph(bm, (sx * 0.2, 0, 0.31), 0.06, (1.2, 0.9, 0.5), seg=12)                    # shoulder pieces
                cap(bm, (-0.05, -0.132, 0.3), (-0.05, -0.15, -0.2), 0.014, 0.014, seg=8)
            st.make(bm, 'buttons', 'gold' if kind == 'corsair' else 'brass')
        return None
    return b
def mix3(a, b, k): a = Vector(a); b = Vector(b); return a + (b - a) * k

FRAME = hero.FRAME
def items():
    out = []
    for k in BLADES: out.append({'name': 'cutlass-' + k, 'build': cutlass(k), 'tilt': True, 'frame': (112, 176, 48, 150)})
    Hm = Matrix.Translation(HEAD) @ HR; f = T @ Vector((0.15, -0.97, 0.12))
    for k in ('plank', 'iron', 'brass'):
        for fc, turn in D.FACINGS: out.append({'name': 'buckler-%s/%s' % (k, fc), 'build': buckler(k, OFF, f), 'turn': turn})
    for k in ('bandana', 'tricorn', 'feathered'):
        for fc, turn in D.FACINGS: out.append({'name': 'hat-%s/%s' % (k, fc), 'build': hat(k, Hm), 'turn': turn})
    return out
def icons():       # each in a box of 96 file pixels (48 on the screen), seen a little from the side
    out = []
    for k in BLADES: out.append({'name': 'icon/cutlass-' + k, 'build': cutlass(k), 'tilt': True, 'frame': (96, 96, 42, 84), 'unit': 58 if k != 'corsair' else 50})
    for k in ('plank', 'iron', 'brass'): out.append({'name': 'icon/buckler-' + k, 'build': buckler(k, (0, 0, 0), (0.3, -0.85, 0.42)), 'frame': (96, 96, 48, 48), 'unit': 112})
    Hi = D.rx(hero.LOOK_UP)
    for k, u in (('bandana', 78), ('tricorn', 48), ('feathered', 52)): out.append({'name': 'icon/hat-' + k, 'build': hat(k, Hi), 'turn': 32, 'frame': (96, 96, 48, 62 if k == 'bandana' else 58), 'unit': u})
    for k in ('linen', 'sailor', 'corsair'): out.append({'name': 'icon/coat-' + k, 'build': coat(k), 'turn': 18, 'frame': (96, 96, 48, 62), 'unit': {'linen': 70, 'sailor': 60, 'corsair': 54}[k]})
    return out
if __name__ == '__main__':
    a = D.args(); out = os.path.abspath(a[0]) if a else os.path.join(HERE, '..', 'work', 'gear', 'render'); st = D.Stage()
    recs = []
    for it in items() + icons():
        r = D.render_items(st, [it], out, FRAME, unit=it.get('unit', D.UNIT)); recs += r
    import json; json.dump({'px': D.PX, 'unit': D.UNIT, 'items': recs}, open(os.path.join(out, 'meta.json'), 'w', encoding='utf-8'), indent=1)
