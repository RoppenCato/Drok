"""a_build.py: look 1, "Toy-box models" (Leonard, AD, 2026-11-20). The hero, the crabs, the palms, the rocks, the chest, the
barrel and the bushes built as simple models, lit by one sun and rendered flat (two or three chosen tones, a thin line)
from the game's raised camera. Renders the whole screen with a clear background (a-render.png) and the close-up
(a-close-render.png); a.js paints the ground under them and the chrome over them.
  node tools/blender.js concepts/look/a_build.py -- concepts/look
The screen is 412 by 915 CSS pixels at 100 pixels a unit; the camera looks north from E degrees above the ground, so a
point on the ground at screen (sx, sy) is at ((sx - 206) / 100, (457.5 - sy) / (100 sin E)) and a height shows at cos E."""
import bpy, bmesh, sys, os, math, random
from mathutils import Vector, Matrix
HERE = os.path.dirname(os.path.abspath(__file__)); STUDIO = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(STUDIO, 'blender'))
import toon
toon.GRAIN_K = 0.0; toon.TONES = 'chosen'
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(argv[0]) if argv else HERE
E = math.radians(35.0); SE, CE = math.sin(E), math.cos(E); U = 100.0   # the figures are seen from lower than the ground is drawn, as in every top-down game of this kind: the face must show
K_HERO, K_CRAB = 0.78, 0.8
def W(sx, sy): return Vector(((sx - 206) / U, (457.5 - sy) / (U * SE), 0.0))

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# ---------------------------------------------------------------- the colours (the base of each; toon.py picks its lit tone and its shade)
HEX = {'skin': '#f4bf8e', 'shirt': '#fbf3dc', 'trou': '#2f8fc0', 'ban': '#ea4038', 'sash': '#ffbf30', 'hair': '#5a3622', 'eye': '#2a1814', 'white': '#fffaf0',
       'steel': '#dbe6ee', 'brass': '#f6c23a', 'wood': '#c98646', 'woodHi': '#dba060', 'crab': '#f4603c', 'crabDark': '#d94a34', 'claw': '#fa7e50',
       'trunk': '#c98c4c', 'leaf': '#3fb95e', 'leaf2': '#73cf52', 'leaf3': '#2b9a58', 'nut': '#8a5628', 'rock': '#aab4cc', 'pink': '#ff6a94', 'yellow': '#ffd640'}
M = {k: toon.material('m_' + k, v, style='cel') for k, v in HEX.items()}
for m in M.values(): m['matte'] = 1; m['t_dark'] = 0.34; toon.build_nodes(m, 'cel')      # the base and one shade, no highlight band: flat colour is Robin's pick

# ---------------------------------------------------------------- shapes
def sph(bm, c, r, s=(1, 1, 1), seg=20, rot=None):
    Mx = Matrix.Translation(Vector(c)) @ (rot or Matrix.Identity(4)) @ Matrix.Diagonal((s[0], s[1], s[2], 1.0))
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=max(6, seg // 2), radius=r, matrix=Mx)
def cap(bm, a, b, ra, rb, seg=16):
    """a limb from a to b: a cone with a ball at each end"""
    a = Vector(a); b = Vector(b); d = b - a; L = max(1e-4, d.length)
    rot = Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix().to_4x4()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=ra, radius2=rb, depth=L, matrix=Matrix.Translation((a + b) / 2) @ rot)
    sph(bm, a, ra, seg=seg); sph(bm, b, rb, seg=seg)
def box(bm, c, size, rot=None):
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation(Vector(c)) @ (rot or Matrix.Identity(4)) @ Matrix.Diagonal((size[0], size[1], size[2], 1.0)))
def cyl(bm, c, r, depth, axis=(0, 0, 1), r2=None, seg=24):
    rot = Vector((0, 0, 1)).rotation_difference(Vector(axis).normalized()).to_matrix().to_4x4()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=depth, matrix=Matrix.Translation(Vector(c)) @ rot)
def make(bm, name, material, at=(0, 0, 0), rotz=0.0, smooth=True, remesh=0.0, soften=0, solid=0.0, scale=1.0):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = smooth
    o = bpy.data.objects.new(name, me); scene.collection.objects.link(o); me.materials.append(material)
    o.location = Vector(at); o.rotation_euler = (0, 0, rotz); o.scale = (scale, scale, scale)
    if remesh: md = o.modifiers.new('rm', 'REMESH'); md.mode = 'VOXEL'; md.voxel_size = remesh; md.use_smooth_shade = True    # one surface for one garment, so it is lit as one form
    if soften: md = o.modifiers.new('sm', 'SMOOTH'); md.factor = 0.5; md.iterations = soften
    if solid: md = o.modifiers.new('so', 'SOLIDIFY'); md.thickness = solid; md.offset = 0.0
    return o
def mix(a, b, k): a = Vector(a); b = Vector(b); return a + (b - a) * k
def leaf(bm, base, dirxy, length, width, arch, droop, n=10, fold=0.3):
    """a leaf along a bent rib: three rows of points (edge, rib, edge), the edges a little lower than the rib"""
    d = Vector((dirxy[0], dirxy[1], 0)).normalized(); side = Vector((-d.y, d.x, 0)); rows = []
    for i in range(n + 1):
        t = i / n; p = Vector(base) + d * (length * t) + Vector((0, 0, arch * length * math.sin(math.pi * t) - droop * length * t * t)); w = width * length * math.sin(math.pi * (t ** 0.75)) + 0.004
        rows.append([bm.verts.new(p - side * w - Vector((0, 0, w * fold))), bm.verts.new(p), bm.verts.new(p + side * w - Vector((0, 0, w * fold)))])
    for i in range(n):
        for j in range(2): bm.faces.new((rows[i][j], rows[i][j + 1], rows[i + 1][j + 1], rows[i + 1][j]))

# ---------------------------------------------------------------- the hero, built facing -Y: his right is -X, forward is -Y
def hero(at, rotz):
    put = dict(at=at, rotz=rotz, scale=K_HERO)
    RS, RE, RH = (-0.19, 0.0, 0.60), (-0.33, 0.06, 0.63), (-0.31, -0.01, 0.83)          # the right arm raised, the blade beside the head
    LS, LE, LH = (0.19, 0.0, 0.60), (0.29, -0.10, 0.49), (0.22, -0.26, 0.51)            # the left arm forward with the buckler
    RP, RK, RF = (-0.085, 0.0, 0.30), (-0.11, 0.08, 0.16), (-0.13, 0.17, 0.04)          # the right leg back
    LP, LK, LF = (0.085, 0.0, 0.30), (0.10, -0.12, 0.17), (0.11, -0.18, 0.04)           # the left leg forward
    bm = bmesh.new(); sph(bm, (0, -0.01, 0.80), 0.2, (1, 0.96, 0.95), seg=32); sph(bm, (0, 0, 0.63), 0.07); sph(bm, (0, -0.196, 0.772), 0.026)
    for sx in (-1, 1): sph(bm, (sx * 0.193, 0.005, 0.79), 0.045, (0.6, 1, 1.15))
    cap(bm, RE, RH, 0.052, 0.048); sph(bm, RH, 0.064); cap(bm, LE, LH, 0.052, 0.048); sph(bm, LH, 0.064)
    cap(bm, RK, RF, 0.05, 0.045); cap(bm, LK, LF, 0.05, 0.045)
    for F in (RF, LF): sph(bm, (F[0], F[1] - 0.045, 0.036), 0.05, (1, 1.75, 0.72))
    make(bm, 'hero_skin', M['skin'], remesh=0.006, soften=10, **put)
    bm = bmesh.new(); sph(bm, (0, 0, 0.49), 0.17, (1, 0.76, 1.04), seg=28); cap(bm, RS, RE, 0.07, 0.064); cap(bm, LS, LE, 0.07, 0.064)
    make(bm, 'hero_shirt', M['shirt'], remesh=0.006, soften=14, **put)
    bm = bmesh.new(); sph(bm, (0, 0, 0.315), 0.155, (1, 0.8, 0.72)); cap(bm, RP, RK, 0.08, 0.068); cap(bm, LP, LK, 0.08, 0.068); cap(bm, RK, mix(RK, RF, 0.45), 0.068, 0.062); cap(bm, LK, mix(LK, LF, 0.45), 0.068, 0.062)
    make(bm, 'hero_trousers', M['trou'], remesh=0.006, soften=14, **put)
    bm = bmesh.new(); sph(bm, (0, 0, 0.392), 0.168, (1.03, 0.82, 0.3)); sph(bm, (-0.155, -0.03, 0.31), 0.05, (0.6, 0.5, 1.7))
    make(bm, 'hero_sash', M['sash'], remesh=0.008, soften=4, **put)
    # the head cloth: the crown of a slightly bigger ball, a knot and two tails at the back
    bm = bmesh.new(); sph(bm, (0, -0.01, 0.80), 0.209, (1, 0.96, 0.95), seg=32)
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], dist=1e-5, plane_co=(0, 0, 0.878), plane_no=(0, 0.12, 1), clear_inner=True)
    sph(bm, (-0.09, 0.185, 0.86), 0.042); cap(bm, (-0.09, 0.185, 0.86), (-0.22, 0.32, 0.84), 0.036, 0.014); cap(bm, (-0.09, 0.185, 0.86), (-0.13, 0.34, 0.74), 0.036, 0.014)
    make(bm, 'hero_cloth', M['ban'], **put)
    bm = bmesh.new(); sph(bm, (0, -0.01, 0.80), 0.204, (1, 0.96, 0.95), seg=32)
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], dist=1e-5, plane_co=(0, 0.045, 0.80), plane_no=(0, 1, 0.5), clear_inner=True)
    for sx in (-1, 1): cap(bm, (sx * 0.04, -0.19, 0.852), (sx * 0.125, -0.155, 0.875), 0.015, 0.012, seg=8)      # the brows, the inner ends pulled down
    sph(bm, (0.05, -0.17, 0.885), 0.05, (1.3, 0.6, 0.7), seg=12)                                                    # a tuft under the cloth
    make(bm, 'hero_hair', M['hair'], **put)
    bm = bmesh.new()
    for sx in (-1, 1): sph(bm, (sx * 0.085, -0.163, 0.795), 0.05, (0.9, 0.42, 1.2), seg=16)
    make(bm, 'hero_whites', M['white'], **put)
    bm = bmesh.new()
    for sx in (-1, 1): sph(bm, (sx * 0.085, -0.179, 0.79), 0.034, (0.85, 0.4, 1.25), seg=14)
    make(bm, 'hero_eyes', M['eye'], **put)
    bm = bmesh.new()
    for sx in (-1, 1): sph(bm, (sx * 0.085 - 0.012, -0.192, 0.806), 0.01, seg=8)
    make(bm, 'hero_glints', M['white'], **put)
    # the cutlass: the blade in the plane he swings in, its back to the rear
    w = Vector((-0.5, -0.87, 0)); u = Vector((-0.22, 0.13, 0.96)).normalized(); v = u.cross(w).normalized(); hand = Vector(RH)      # the flat of the blade toward the camera of his south-east facing
    bm = bmesh.new(); prof = [(0.07, -0.036), (0.28, -0.056), (0.48, -0.084), (0.64, -0.105), (0.59, -0.02), (0.4, 0.04), (0.07, 0.044)]
    bm.faces.new([bm.verts.new(hand + u * a + v * b) for a, b in prof]); bmesh.ops.triangulate(bm, faces=bm.faces[:])
    make(bm, 'hero_blade', M['steel'], solid=0.02, smooth=False, **put)
    bm = bmesh.new(); cap(bm, hand - u * 0.06, hand + u * 0.05, 0.022, 0.022)
    make(bm, 'hero_grip', M['wood'], **put)
    bm = bmesh.new(); sph(bm, hand + u * 0.065, 0.05, (0.5, 1.0, 1.0)); cap(bm, hand + u * 0.06 + v * 0.05, hand - u * 0.06 + v * 0.045, 0.012, 0.012, seg=8)
    make(bm, 'hero_guard', M['brass'], **put)
    # the buckler on the left arm, its face toward what he fights
    f = Vector((0.2, -0.97, 0.08)).normalized(); c = Vector(LH) + f * 0.055
    bm = bmesh.new(); cyl(bm, c, 0.185, 0.028, axis=f); make(bm, 'hero_rim', M['steel'], **put)
    bm = bmesh.new(); cyl(bm, c + f * 0.006, 0.15, 0.03, axis=f); make(bm, 'hero_buckler', M['wood'], **put)
    bm = bmesh.new(); sph(bm, c + f * 0.03, 0.052, (1, 1, 1)); make(bm, 'hero_boss', M['brass'], **put)

# ---------------------------------------------------------------- the sand crab, facing -Y
def crab(at, rotz, up, name, k=1.0):
    put = dict(at=at, rotz=rotz, scale=k)
    bm = bmesh.new(); sph(bm, (0, 0, 0.115), 0.215, (1, 0.74, 0.42), seg=32); make(bm, name + '_shell', M['crab'], **put)
    ROOT = [(0.17, -0.06), (0.195, 0.01), (0.165, 0.08)]; KNEE = [(0.27, -0.12), (0.315, 0.03), (0.26, 0.155)]; TIP = [(0.315, -0.205), (0.385, 0.015), (0.31, 0.23)]
    bm = bmesh.new()
    for s in (-1, 1):
        for i in range(3):
            kn = (s * KNEE[i][0], KNEE[i][1], 0.13); cap(bm, (s * ROOT[i][0], ROOT[i][1], 0.07), kn, 0.036, 0.03, seg=10); cap(bm, kn, (s * TIP[i][0], TIP[i][1], 0.016), 0.03, 0.015, seg=10)
    make(bm, name + '_legs', M['crabDark'], **put)
    bm = bmesh.new()
    for s in (-1, 1):
        cz = 0.075 + 0.15 * up; q = 1 + 0.3 * up; cc = Vector((s * (0.215 + 0.05 * up), -(0.30 + 0.03 * up), cz)); el = Vector((s * 0.235, -0.17, 0.09 + 0.06 * up))
        cap(bm, (s * 0.13, -0.11, 0.075), el, 0.038, 0.034, seg=12); cap(bm, el, cc + Vector((0, 0.07, 0)), 0.034, 0.032, seg=12)
        sph(bm, cc, 0.088 * q, (1.0, 1.35, 0.8))
    make(bm, name + '_claws', M['claw'], remesh=0.009, soften=3, **put)
    bm = bmesh.new()
    for s in (-1, 1):
        cz = 0.075 + 0.15 * up; q = 1 + 0.3 * up; cc = Vector((s * (0.215 + 0.05 * up), -(0.30 + 0.03 * up), cz))
        sph(bm, cc + Vector((-s * 0.062 * q, -0.05 * q, -0.012)), 0.05 * q, (0.72, 1.5, 0.72))                          # the pincer's lower finger, darker, so the pincer reads
    make(bm, name + '_thumbs', M['crabDark'], **put)
    bm = bmesh.new()
    for s in (-1, 1): cap(bm, (s * 0.06, -0.11, 0.1), (s * 0.078, -0.135, 0.215), 0.014, 0.012, seg=8)
    make(bm, name + '_stalks', M['crab'], **put)
    bm = bmesh.new()
    for s in (-1, 1): sph(bm, (s * 0.08, -0.14, 0.235), 0.046, seg=16)
    make(bm, name + '_eyes', M['white'], **put)
    bm = bmesh.new()
    for s in (-1, 1): sph(bm, (s * 0.083, -0.176, 0.24), 0.022, seg=10)
    make(bm, name + '_pupils', M['eye'], **put)

# ---------------------------------------------------------------- the place
def palm(sx, sy, lean, h, r, seed):
    rnd = random.Random(seed); base = W(sx, sy); top = base + Vector((lean * h / U, 0, h / (U * CE))); ctl = base + Vector((lean * h / U * 0.1, 0, h / (U * CE) * 0.6))
    def at(t): return mix(mix(base, ctl, t), mix(ctl, top, t), t)
    bm = bmesh.new(); n = 9
    for i in range(n): cap(bm, at(i / n), at((i + 1) / n), (0.085 - 0.035 * i / n) * 1.08, 0.085 - 0.035 * (i + 1) / n, seg=14)
    make(bm, 'palm_trunk', M['trunk'])
    L = r / U * 0.82
    for i in range(9):
        a = i / 9 * math.tau + (rnd.random() - 0.5) * 0.35 + 0.3; bm = bmesh.new()
        leaf(bm, top + Vector((0, 0, 0.02)), (math.cos(a), math.sin(a)), L * (0.85 + rnd.random() * 0.3), 0.21 + rnd.random() * 0.05, 0.3, 0.42, n=12, fold=0.5)
        make(bm, 'palm_leaf', M['leaf' if i % 3 else 'leaf2'], solid=0.02)
    bm = bmesh.new()
    for dx, dy in ((-0.05, -0.04), (0.05, -0.05), (0.0, -0.08)): sph(bm, top + Vector((dx, dy, -0.06)), 0.055, seg=12)
    make(bm, 'palm_nuts', M['nut'])
def bush(sx, sy, size, seed, flower=None):
    rnd = random.Random(seed); c = W(sx, sy); kind = rnd.random()
    if kind < 0.55:      # a round bush: a few balls grown into one
        bm = bmesh.new()
        for i in range(3 + int(rnd.random() * 3)): sph(bm, c + Vector(((rnd.random() - 0.5) * size * 1.3, (rnd.random() - 0.5) * size * 0.9, size * (0.35 + rnd.random() * 0.3))), size * (0.5 + rnd.random() * 0.35), (1, 1, 0.85), seg=14)
        make(bm, 'bush', M[rnd.choice(['leaf', 'leaf3', 'leaf2'])], remesh=0.02, soften=3)
    else:                # a clump of big leaves
        for i in range(5 + int(rnd.random() * 3)):
            a = rnd.random() * math.tau; bm = bmesh.new(); leaf(bm, c + Vector((0, 0, 0.04)), (math.cos(a), math.sin(a)), size * (1.0 + rnd.random() * 0.6), 0.32 + rnd.random() * 0.08, 0.62, 0.3, n=8, fold=0.35)
            make(bm, 'bigleaf', M[rnd.choice(['leaf', 'leaf2', 'leaf3'])], solid=0.02)
    if flower:
        bm = bmesh.new()
        for i in range(5): a = i / 5 * math.tau; sph(bm, c + Vector((math.cos(a) * 0.045, -size * 0.5 + math.sin(a) * 0.02, size * 0.95 + math.sin(a) * 0.04)), 0.04, seg=10)
        make(bm, 'flower', M[flower])
        bm = bmesh.new(); sph(bm, c + Vector((0, -size * 0.5 - 0.02, size * 0.95)), 0.03, seg=10); make(bm, 'flower_eye', M['yellow'])
def rock(sx, sy, r, seed):
    rnd = random.Random(seed); bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=2, radius=r / U * 1.05)
    for v in bm.verts: v.co *= 0.86 + rnd.random() * 0.28; v.co.z *= 0.7; v.co.y *= 0.85
    make(bm, 'rock', M['rock'], at=W(sx, sy) + Vector((0, 0, r / U * 0.35)), smooth=False)
def chest(sx, sy):
    at = W(sx, sy)
    bm = bmesh.new(); box(bm, (0, 0, 0.085), (0.36, 0.22, 0.17)); make(bm, 'chest', M['wood'], at=at, smooth=False)
    bm = bmesh.new(); cyl(bm, (0, 0, 0.17), 0.11, 0.36, axis=(1, 0, 0)); make(bm, 'chest_lid', M['woodHi'], at=at)
    bm = bmesh.new()
    for dx in (-0.115, 0.115): box(bm, (dx, 0, 0.088), (0.05, 0.235, 0.18)); cyl(bm, (dx, 0, 0.17), 0.118, 0.05, axis=(1, 0, 0))
    box(bm, (0, -0.115, 0.15), (0.07, 0.03, 0.08)); make(bm, 'chest_brass', M['brass'], at=at)
def barrel(sx, sy):
    at = W(sx, sy)
    bm = bmesh.new(); cyl(bm, (0, 0, 0.075), 0.115, 0.15, r2=0.14); cyl(bm, (0, 0, 0.225), 0.14, 0.15, r2=0.115); make(bm, 'barrel', M['wood'], at=at)
    bm = bmesh.new(); cyl(bm, (0, 0, 0.07), 0.132, 0.028, r2=0.137); cyl(bm, (0, 0, 0.235), 0.137, 0.028, r2=0.132); make(bm, 'barrel_hoops', M['steel'], at=at)
    bm = bmesh.new(); cyl(bm, (0, 0, 0.298), 0.1, 0.01); make(bm, 'barrel_top', M['woodHi'], at=at)

# the same scene as the drawn looks (kit.js): the places in CSS pixels
HERO, CRABA, CRABB = (166, 518), (298, 548), (98, 668)
hw, cw = W(*HERO), W(*CRABA); d = (cw - hw).normalized()
hero(hw, math.radians(34)); crab(cw, math.atan2(-d.x, d.y), 1.0, 'crabA', K_CRAB); crab(W(*CRABB), 0.25, 0.0, 'crabB', K_CRAB * 0.92)   # he is turned a little toward us, as the game's south-east facing would be
for sx, sy, lean, h, r, seed in ((56, 276, 0.24, 118, 66, 3), (338, 244, -0.22, 104, 60, 8), (208, 160, 0.1, 70, 52, 5)): palm(sx, sy, lean, h, r, seed)
for sx, sy, r, seed in ((366, 344, 26, 2), (394, 366, 13, 4), (30, 432, 15, 7)): rock(sx, sy, r, seed)
chest(116, 330); barrel(46, 560)
JUNGLE = [(-20, 268), (58, 246), (128, 258), (174, 232), (238, 228), (292, 252), (352, 226), (432, 242)]
def edge_y(x):
    for (x0, y0), (x1, y1) in zip(JUNGLE, JUNGLE[1:]):
        if x0 <= x <= x1: return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
    return 240
rnd = random.Random(41)
for i in range(46):
    sx = rnd.random() * 440 - 14; sy = 18 + rnd.random() * (edge_y(max(-20, min(432, sx))) - 4)
    if abs(sx - 206) < 34 and sy > 120: continue
    bush(sx, sy, 0.2 + rnd.random() * 0.16, 100 + i, 'pink' if i % 7 == 0 else 'yellow' if i % 9 == 0 else None)
for i in range(15):
    sx = i * 30 - 6 + (rnd.random() - 0.5) * 10
    if abs(sx - 206) < 36: continue
    bush(sx, edge_y(max(-20, min(432, sx))) + 2 + rnd.random() * 8, 0.2 + rnd.random() * 0.1, 300 + i, 'pink' if i % 5 == 2 else None)

# ---------------------------------------------------------------- the light, the camera, the line, the two renders
toon.setup_render(scene, 512, 2); toon.world(scene); toon.sun('cel')
cam_d = bpy.data.cameras.new('Cam'); cam_d.type = 'ORTHO'; cam_d.clip_start = 0.1; cam_d.clip_end = 100; cam = bpy.data.objects.new('Cam', cam_d); scene.collection.objects.link(cam); scene.camera = cam
def shoot(cx, cy, ortho, resx, resy, px, name):
    cam.location = (cx, cy - 30 * CE, 30 * SE); cam.rotation_euler = (math.pi / 2 - E, 0, 0); cam_d.ortho_scale = ortho
    scene.render.resolution_x = resx; scene.render.resolution_y = resy
    fs = toon.freestyle(scene, bpy.context.view_layer, px, style='cel', weight=0.5); toon.inner_at_colours(fs)
    for ls in fs.linesets: ls.linestyle.color = toon.srgb('#33203a')
    scene.render.filepath = os.path.join(OUT, name); bpy.ops.render.render(write_still=True); print('rendered', scene.render.filepath)
shoot(0, 0, 9.15, 824, 1830, 2, 'a-render.png')
crop = (106, 414, 250, 190); c = W(crop[0] + crop[2] / 2, crop[1] + crop[3] / 2)
shoot(c.x, c.y, crop[2] / U, crop[2] * 6, crop[3] * 6, 6, 'a-close-render.png')
