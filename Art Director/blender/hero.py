"""hero.py: the Warrior's body (Leonard, AD, 2026-11-20; the design is mine until Robin judges it).
A nobody from the harbour: bare head, a linen shirt with rolled sleeves, blue trousers, a rope for a belt, bare feet.
Plain and poor on purpose (Robin, 2026-11-20: "Make a name"): the gear he finds is what makes him look like somebody.
His hands are empty here. The cutlass, the buckler and the hat are their own pictures (gear.py), and every frame says
where they ride: hand (the right fist and the way the blade points), off (the left fist, where the buckler sits), head.
  node tools/blender.js blender/hero.py -- work/hero/render [clip,clip...]
He is built facing -Y: his right is -X. About one unit tall, so about 54 design pixels on the screen."""
import sys, os, math
HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path: sys.path.insert(0, HERE)
import bmesh
from mathutils import Vector, Matrix
import drok as D
from drok import sph, cap, mix, ik2

UA, FA, TH, SH = 0.14, 0.15, 0.135, 0.135          # upper arm, forearm, thigh, shin: the same in every pose
HEAD_R = 0.215
LOOK_UP = -9.0
REST = dict(bob=0.0, lean=0.0, twist=0.0, sway=0.0, yaw=0.0, nod=0.0,   # nod is added to LOOK_UP: he holds his face a little up, toward the camera above him
           
            rh=(-0.26, -0.07, 0.40), rd=(-0.66, -0.22, 0.72),      # the right fist, and the way the blade points from it: up and out, never across his face
            lh=(0.19, -0.19, 0.46),                                # the left fist, where the buckler sits
            rf=(-0.09, 0.02, 0.0), lf=(0.09, -0.02, 0.0),          # the feet: where the sole stands; z lifts it
            tip=0.0, drop=0.0, eyes='open')
def pose(**o): p = dict(REST); p.update(o); return p
def blend(a, b, k):
    out = {}
    for key in a:
        x, y = a[key], b[key]
        out[key] = tuple(x[i] + (y[i] - x[i]) * k for i in range(len(x))) if isinstance(x, tuple) else (x + (y - x) * k if isinstance(x, (int, float)) else (x if k < 0.5 else y))
    return out

def frame_of(p):
    """the torso's turn, the pelvis, the head's middle and the head's turn for a pose: what gear.py builds a hat and a buckler on"""
    T = D.rx(p['lean']) @ D.rz(p['twist']); pel = Vector((p['sway'], 0.0, 0.30 + p['bob'])); head = pel + (T @ Vector((0, -0.012, 0.47)))
    return T, pel, head, T @ D.rz(p['yaw']) @ D.rx(p['nod'] + LOOK_UP)
def off_of(p):
    """where the buckler sits: just in front of the left fist"""
    T, pel, head, HR = frame_of(p); LS = pel + (T @ Vector((0.19, 0, 0.275))); LE, LH = ik2(LS, p['lh'], UA, FA, (0.6, 0.5, -0.6)); return LH + (T @ Vector((0, -0.05, 0)))

def build(st, p):
    T, pel, head, HR = frame_of(p); L = p.get('look') or {}       # look: other colours for the same body (the harbour's people, blender/people.py)
    at = lambda v: pel + (T @ Vector(v))                                   # a place on the torso
    chest, neck = at((0, 0, 0.17)), at((0, 0, 0.30))
    Hm = Matrix.Translation(head) @ HR; hp = lambda v: Hm @ Vector(v)     # a place on the head
    RS, LS = at((-0.19, 0, 0.275)), at((0.19, 0, 0.275))
    RE, RH = ik2(RS, p['rh'], UA, FA, (-0.6, 0.5, -0.6)); LE, LH = ik2(LS, p['lh'], UA, FA, (0.6, 0.5, -0.6))
    hipT = D.rz(p['twist'] * 0.3); RP, LP = pel + (hipT @ Vector((-0.085, 0, -0.015))), pel + (hipT @ Vector((0.085, 0, -0.015)))
    RA, LA = Vector(p['rf']) + Vector((0, 0, 0.045)), Vector(p['lf']) + Vector((0, 0, 0.045))
    RK, RA = ik2(RP, RA, TH, SH, (0, -1, 0.15)); LK, LA = ik2(LP, LA, TH, SH, (0, -1, 0.15))
    made = []          # every object with the place it was given: a matrix read back from Blender before the scene is evaluated is stale
    def mk(bm, name, m, M=None, **kw):
        o = st.make(bm, name, m, **kw); made.append((o, M or Matrix.Identity(4)))
        if M is not None: o.matrix_local = M
        return o
    # skin: the head, the neck, the forearms and fists, the shins and feet
    bm = bmesh.new(); sph(bm, head, HEAD_R, (1, 0.96, 0.95), seg=32, rot=HR); sph(bm, neck, 0.07); sph(bm, hp((0, -0.212, -0.035)), 0.027)
    for sx in (-1, 1): sph(bm, hp((sx * 0.207, 0.01, -0.01)), 0.047, (0.6, 1, 1.15))
    cap(bm, RE, RH, 0.052, 0.048); sph(bm, RH, 0.064); cap(bm, LE, LH, 0.052, 0.048); sph(bm, LH, 0.064)
    cap(bm, RK, RA, 0.05, 0.045); cap(bm, LK, LA, 0.05, 0.045)
    for A in (RA, LA): sph(bm, (A.x, A.y - 0.045, A.z - 0.008), 0.05, (1, 1.75, 0.72))
    mk(bm, 'skin', L.get('skin', 'skin'), remesh=0.006, soften=10)
    bm = bmesh.new(); sph(bm, chest, 0.17, (1, 0.76, 1.04), seg=28, rot=T); cap(bm, RS, RE, 0.07, 0.064); cap(bm, LS, LE, 0.07, 0.064)
    mk(bm, 'shirt', L.get('shirt', 'linen'), remesh=0.006, soften=14)
    bm = bmesh.new(); sph(bm, pel + Vector((0, 0, 0.015)), 0.155, (1, 0.8, 0.72)); cap(bm, RP, RK, 0.08, 0.068); cap(bm, LP, LK, 0.08, 0.068); cap(bm, RK, mix(RK, RA, 0.5), 0.068, 0.062); cap(bm, LK, mix(LK, LA, 0.5), 0.068, 0.062)
    mk(bm, 'trousers', L.get('trou', 'trou'), remesh=0.006, soften=14)
    bm = bmesh.new(); sph(bm, pel + (T @ Vector((0, 0, 0.09))), 0.166, (1.03, 0.82, 0.24), rot=T); sph(bm, pel + (T @ Vector((-0.15, -0.06, 0.03))), 0.035, (0.6, 0.6, 1.9))
    mk(bm, 'rope', L.get('belt', 'rope'), remesh=0.008, soften=3)
    # hair close to the skull, so every hat covers it: the crown and the back, a short fringe, and the brows
    bm = bmesh.new(); sph(bm, (0, 0, 0), HEAD_R + 0.012, (1, 0.96, 0.95), seg=32)
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], dist=1e-5, plane_co=(0, -0.05, 0.075), plane_no=(0, 0.62, 1), clear_inner=True)
    sph(bm, (-0.07, -0.16, 0.13), 0.06, (1.2, 0.7, 0.6), seg=12); sph(bm, (0.06, -0.165, 0.125), 0.055, (1.3, 0.7, 0.6), seg=12)
    shut = p['eyes'] != 'open'
    for sx in (-1, 1): cap(bm, (sx * 0.04, -0.206, 0.075 if not shut else 0.095), (sx * 0.135, -0.165, 0.098), 0.016, 0.013, seg=8)
    mk(bm, 'hair', L.get('hair', 'hair'), M=Hm)
    # the face: big eyes, a glint, a mouth
    if not shut:
        bm = bmesh.new()
        for sx in (-1, 1): sph(bm, (sx * 0.092, -0.176, -0.004), 0.06, (0.9, 0.42, 1.22), seg=16)
        mk(bm, 'whites', 'white', M=Hm, line=False)
        bm = bmesh.new()
        for sx in (-1, 1): sph(bm, (sx * 0.094, -0.194, -0.012), 0.041, (0.85, 0.4, 1.22), seg=14)
        cap(bm, (-0.035, -0.202, -0.105), (0.04, -0.2, -0.1), 0.009, 0.009, seg=8)
        mk(bm, 'eyes', 'eye', M=Hm, line=False)
        bm = bmesh.new()
        for sx in (-1, 1): sph(bm, (sx * 0.094 - 0.014, -0.21, 0.008), 0.012, seg=8)
        mk(bm, 'glints', 'white', M=Hm, line=False)
    else:
        bm = bmesh.new()
        for sx in (-1, 1): cap(bm, (sx * 0.05, -0.2, -0.005), (sx * 0.095, -0.2, -0.03), 0.011, 0.011, seg=8); cap(bm, (sx * 0.095, -0.2, -0.03), (sx * 0.14, -0.185, -0.005), 0.011, 0.011, seg=8)
        sph(bm, (0.0, -0.2, -0.105), 0.03, (1, 0.5, 1.1), seg=10)
        mk(bm, 'eyes', 'eye', M=Hm, line=False)
    # a fall: the whole body tips back about the heels and settles on the ground
    pts = {'hand': (RH, Vector(p['rd'])), 'off': (LH + (T @ Vector((0, -0.05, 0))), T @ Vector((0, 0, 1))), 'head': (head, HR @ Vector((0, 0, 1))), 'ref': (chest, Vector((0, 0, 1)))}
    if p['tip'] or p['drop']:
        piv = Vector((0, 0.06, 0)); F = Matrix.Translation(Vector((0, 0, p['drop']))) @ Matrix.Translation(piv) @ D.rx(-p['tip']) @ Matrix.Translation(-piv)
        for o, M in made: o.matrix_local = F @ M
        pts = {k: (F @ Vector(a), F.to_3x3() @ Vector(d)) for k, (a, d) in pts.items()}
    return pts

# ---------------------------------------------------------------- the clips
def stand(i, n=6):
    s = math.sin(i / n * math.tau)
    return pose(bob=0.006 * s, rh=(-0.26, -0.07, 0.40 + 0.008 * s), rd=(-0.66 + 0.03 * s, -0.22, 0.72), lh=(0.19, -0.19, 0.46 + 0.006 * s), nod=1.5 * s)
def move(i, n=8):       # one stride: the right foot forward at a quarter; the hips lead, the chest turns against them
    t = i / n; s = math.sin(t * math.tau); c = math.cos(t * math.tau)
    return pose(bob=-0.016 * (1 - abs(s)) + 0.004, lean=5, twist=7 * s, sway=0.008 * s,
                rf=(-0.085, 0.01 - 0.115 * s, 0.055 * max(0.0, c)), lf=(0.085, 0.01 + 0.115 * s, 0.055 * max(0.0, -c)),
                rh=(-0.26, -0.07 + 0.06 * s, 0.40 + 0.015 * abs(s)), rd=(-0.66, -0.22 + 0.12 * s, 0.72), lh=(0.19, -0.19 - 0.03 * s, 0.46))
STRIDE = 4 * 0.115 * D.UNIT                    # design units the feet cover in one cycle of move: the game picks the frame by distance walked
A_WIND = pose(rh=(-0.30, 0.10, 0.74), rd=(-0.2, 0.55, 0.8), twist=-22, lean=-4, lf=(0.09, -0.10, 0.0), bob=-0.01, lh=(0.2, -0.22, 0.48))
A_PEAK = pose(rh=(-0.27, 0.16, 0.80), rd=(-0.1, 0.75, 0.65), twist=-30, lean=-6, lf=(0.09, -0.11, 0.0), bob=-0.005, lh=(0.2, -0.24, 0.5))
A_BLOW = pose(rh=(-0.02, -0.34, 0.50), rd=(0.25, -0.9, -0.12), twist=28, lean=14, lf=(0.09, -0.17, 0.0), rf=(-0.09, 0.07, 0.0), bob=-0.03, lh=(0.24, -0.1, 0.44), nod=4)
A_THRU = pose(rh=(0.12, -0.28, 0.36), rd=(0.6, -0.6, -0.5), twist=36, lean=16, lf=(0.09, -0.17, 0.0), rf=(-0.09, 0.07, 0.0), bob=-0.035, lh=(0.25, -0.06, 0.44), nod=5)
ATTACK = [A_WIND, A_PEAK, A_BLOW, A_THRU, blend(A_THRU, pose(), 0.5), blend(A_THRU, pose(), 0.85)]
def sweep(k):           # the cleave: low, the blade level, swept from behind his right to his left
    a = math.radians(-150 + 215 * k); r = 0.36
    return pose(bob=-0.035, lean=8, twist=-42 + 92 * k, rh=(r * math.cos(a) * 1.0 - 0.02, r * math.sin(a) * 0.95 - 0.03, 0.5), rd=(math.cos(a), math.sin(a), 0.02),
                lh=(0.22, -0.12 + 0.1 * k, 0.42), lf=(0.11, -0.08, 0.0), rf=(-0.11, 0.06, 0.0), nod=3)
CLEAVE = [sweep(0.0), sweep(0.18), sweep(0.42), sweep(0.66), sweep(0.86), sweep(1.0), blend(sweep(1.0), pose(), 0.6)]
def dash(i):            # the charge: a lean, the buckler leading, the blade trailing, a long stride
    a = [(0.20, -0.22), (0.02, -0.02), (-0.22, 0.20), (-0.02, 0.02)][i]; up = [(0.03, 0.0), (0.09, 0.0), (0.0, 0.03), (0.0, 0.09)][i]
    return pose(lean=26, bob=-0.045 + (0.012 if i % 2 else 0), nod=-12, lh=(0.05, -0.36, 0.44), rh=(-0.27, 0.2, 0.34), rd=(-0.2, 0.9, -0.3), rf=(-0.09, a[0], up[0]), lf=(0.09, a[1], up[1]))
HIT = [pose(lean=-16, bob=-0.012, rh=(-0.36, 0.0, 0.62), rd=(-0.6, -0.1, 0.8), lh=(0.34, -0.04, 0.6), nod=-12, eyes='shut', rf=(-0.1, 0.09, 0.0)),
       pose(lean=-8, bob=-0.006, rh=(-0.31, -0.04, 0.5), rd=(-0.4, -0.3, 0.87), lh=(0.27, -0.12, 0.52), nod=-6, eyes='shut', rf=(-0.1, 0.06, 0.0))]
def fall(tip, drop, k):  # the arms fly up, then lie out
    return pose(tip=tip, drop=drop, lean=-10, nod=-10, eyes='shut', rh=(-0.36 - 0.06 * k, 0.02, 0.62 - 0.1 * k), rd=(-0.8, 0.0, 0.6), lh=(0.34 + 0.06 * k, 0.0, 0.6 - 0.1 * k), rf=(-0.1, 0.03, 0.0), lf=(0.1, -0.03, 0.0))
DIE = [HIT[0], fall(26, 0.0, 0.2), fall(58, 0.03, 0.6), fall(86, 0.1, 1.0), fall(90, 0.115, 1.0), fall(90, 0.11, 1.0)]
CLIPS = {
    'stand': {'frames': [stand(i) for i in range(6)], 'delay': 125, 'loop': True},
    'move': {'frames': [move(i) for i in range(8)], 'delay': 75, 'loop': True, 'stride': round(STRIDE, 2)},
    'attack1': {'frames': ATTACK, 'delay': [60, 60, 70, 90, 90, 90], 'blow': 2},
    'cleave': {'frames': CLEAVE, 'delay': [50, 50, 50, 60, 60, 80, 100], 'blow': 3},
    'charge': {'frames': [dash(i) for i in range(4)], 'delay': 70, 'loop': True},
    'hit1': {'frames': HIT, 'delay': [90, 110]},
    'die1': {'frames': DIE, 'delay': [80, 80, 80, 90, 120, 200], 'fade': 2},
}
FRAME = (288, 240, 144, 160)
if __name__ == '__main__':
    a = D.args(); out = os.path.abspath(a[0]) if a else os.path.join(HERE, '..', 'work', 'hero', 'render'); only = a[1].split(',') if len(a) > 1 else None
    D.render_clips(D.Stage(), 'hero', build, CLIPS, out, FRAME, only=only, rest=pose(), relative=('off', 'head'))
