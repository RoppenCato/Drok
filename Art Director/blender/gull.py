"""gull.py: the reef gull of the first island (Leonard, AD, 2026-11-20; the design is mine).
Level 3, about 28 design units across the body: a fat white thief of a bird with grey wings, black wing tips and a hooked
orange beak. It flies: its body hangs above the origin, which stays on the ground where the game lays its shadow.
It is fast: it rises and throws its wings up for three tenths of a second (the tell), swoops down and forward to bite,
and climbs away again.
  node tools/blender.js blender/gull.py -- work/reef-gull/render [clip,clip...]"""
import sys, os, math
HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path: sys.path.insert(0, HERE)
import bmesh
from mathutils import Vector, Matrix
import drok as D
from drok import sph, cap, plate

K = 0.5
REST = dict(z=0.62, flap=0.0, pitch=0.0, fwd=0.0, shut=False, roll=0.0, open=0.0, tuck=0.0)
def pose(**o): p = dict(REST); p.update(o); return p

def build(st, p):
    B = Matrix.Translation(Vector((0, -p['fwd'] * K, p['z'] * K))) @ D.ry(p['roll']) @ D.rx(p['pitch'])     # pitch: the beak goes down
    made = []
    def mk(bm, name, m, M=None, **kw):
        o = st.make(bm, name, m, **kw); o.matrix_local = M or B; made.append(o); return o
    bm = bmesh.new(); sph(bm, (0, 0, 0), 1.0, (0.3 * K, 0.42 * K, 0.27 * K), seg=24); sph(bm, (0, -0.36 * K, 0.16 * K), 0.21 * K, seg=20)        # the body and the head
    mk(bm, 'body', 'gull', remesh=0.012, soften=4)
    bm = bmesh.new()      # the tail, three feathers
    for a in (-0.35, 0.0, 0.35): cap(bm, (0, 0.34 * K, 0.02 * K), (math.sin(a) * 0.22 * K, 0.62 * K, 0.04 * K), 0.07 * K, 0.035 * K, seg=8)
    mk(bm, 'tail', 'gullGrey', remesh=0.012, soften=2)
    # the wings: flap lifts them (+) or drops them (-); each a grey plate with a black tip
    for s in (-1, 1):
        a = math.radians(p['flap'] * 60 + 8); up = math.sin(a); out = math.cos(a); sw = -0.25 * p['tuck']
        root = Vector((s * 0.22 * K, 0.0, 0.1 * K)); mid = root + Vector((s * out * 0.42 * K, 0.06 * K + sw * K, up * 0.42 * K)); tip = mid + Vector((s * out * 0.36 * K, 0.1 * K + sw * K, up * 0.3 * K - 0.04 * K * abs(up)))
        w0, w1 = 0.2 * K, 0.17 * K
        bm = bmesh.new(); plate(bm, [root + Vector((0, -w0, 0)), mid + Vector((0, -w1, 0)), mid + Vector((0, w1 * 1.2, 0)), root + Vector((0, w0 * 1.3, 0))]); mk(bm, 'wing', 'gullGrey', solid=0.03 * K * 2, smooth=False)
        bm = bmesh.new(); plate(bm, [mid + Vector((0, -w1, 0)), tip + Vector((0, -0.02 * K, 0)), tip + Vector((0, 0.1 * K, 0)), mid + Vector((0, w1 * 1.2, 0))]); mk(bm, 'tip', 'black', solid=0.03 * K * 2, smooth=False)
    # the beak, hooked, opening to bite; the feet tucked under
    bm = bmesh.new(); cap(bm, (0, -0.52 * K, 0.15 * K + 0.03 * K * p['open']), (0, -0.78 * K, 0.1 * K + 0.06 * K * p['open']), 0.07 * K, 0.035 * K, seg=10); cap(bm, (0, -0.78 * K, 0.1 * K + 0.06 * K * p['open']), (0, -0.82 * K, 0.02 * K + 0.06 * K * p['open']), 0.035 * K, 0.02 * K, seg=8)
    cap(bm, (0, -0.52 * K, 0.11 * K - 0.04 * K * p['open']), (0, -0.72 * K, 0.06 * K - 0.1 * K * p['open']), 0.05 * K, 0.025 * K, seg=8)
    mk(bm, 'beak', 'beak')
    bm = bmesh.new()
    for s in (-1, 1): cap(bm, (s * 0.1 * K, 0.1 * K, -0.2 * K), (s * 0.12 * K, 0.2 * K, -0.3 * K), 0.03 * K, 0.025 * K, seg=6); sph(bm, (s * 0.12 * K, 0.17 * K, -0.33 * K), 0.05 * K, (1.3, 1.6, 0.5), seg=8)
    mk(bm, 'feet', 'leg')
    # the eyes: small, under heavy brows, so it looks like trouble
    bm = bmesh.new()
    if not p['shut']:
        for s in (-1, 1): sph(bm, (s * 0.11 * K, -0.5 * K, 0.22 * K), 0.05 * K, seg=10)
        mk(bm, 'eyes', 'eye', line=False)
        bm = bmesh.new()
        for s in (-1, 1): sph(bm, (s * 0.1 * K, -0.535 * K, 0.24 * K), 0.016 * K, seg=6)
        mk(bm, 'glints', 'white', line=False)
    bm = bmesh.new()
    for s in (-1, 1): cap(bm, (s * 0.04 * K, -0.54 * K, 0.27 * K if not p['shut'] else 0.24 * K), (s * 0.19 * K, -0.44 * K, 0.31 * K if not p['shut'] else 0.2 * K), 0.022 * K, 0.018 * K, seg=6)
    mk(bm, 'brows', 'black', line=False)
    return {'ref': (B @ Vector((0, 0, 0)), Vector((0, 0, 1)))}

def clips():
    hover = [pose(flap=math.sin(i / 4 * math.tau), z=0.62 + 0.03 * math.cos(i / 4 * math.tau)) for i in range(4)]
    fly = [pose(flap=math.sin(i / 4 * math.tau), z=0.6 + 0.02 * math.cos(i / 4 * math.tau), pitch=14, tuck=0.4) for i in range(4)]
    attack = [pose(z=0.74, flap=0.7, pitch=-14, fwd=-0.08), pose(z=0.86, flap=1.0, pitch=-24, fwd=-0.14, open=0.6),                 # the tell: up, wings high, head back, 300 ms
              pose(z=0.3, flap=-0.2, pitch=42, fwd=0.42, open=1.0, tuck=1.0), pose(z=0.26, flap=-0.5, pitch=30, fwd=0.48, open=0.0, tuck=0.8),   # the swoop and the bite
              pose(z=0.5, flap=0.8, pitch=-6, fwd=0.2), pose(z=0.62, flap=-0.4, pitch=0, fwd=0.04)]                                    # and away
    hit = [pose(z=0.56, flap=1.0, pitch=-20, shut=True, roll=18, fwd=-0.06)]
    die = [pose(z=0.5, flap=0.9, pitch=-30, shut=True, roll=40), pose(z=0.3, flap=0.2, pitch=-60, shut=True, roll=110), pose(z=0.13, flap=-0.6, pitch=-90, shut=True, roll=170), pose(z=0.12, flap=-0.8, pitch=-90, shut=True, roll=180)]
    return {
        'stand': {'frames': hover, 'delay': 90, 'loop': True},
        'move': {'frames': fly, 'delay': 70, 'loop': True},
        'attack1': {'frames': attack, 'delay': [140, 160, 60, 90, 90, 100], 'blow': 2, 'note': 'the wind-up is frames 1 and 2, 300 ms; the bite lands on frame 3; it is drawn up to 27 design units ahead of its origin while it swoops'},
        'hit1': {'frames': hit, 'delay': 160},
        'die1': {'frames': die, 'delay': [90, 90, 140, 220], 'fade': 2},
    }
FRAME = (224, 240, 112, 176)
if __name__ == '__main__':
    a = D.args(); out = os.path.abspath(a[0]) if a else os.path.join(HERE, '..', 'work', 'reef-gull', 'render'); only = a[1].split(',') if len(a) > 1 else None
    D.render_clips(D.Stage(), 'reef-gull', build, clips(), out, FRAME, only=only)
