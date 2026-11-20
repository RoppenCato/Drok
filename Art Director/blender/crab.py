"""crab.py: the crabs of the first island (Leonard, AD, 2026-11-20; the designs are mine).
  sand-crab      level 1, about 30 design units across: round, bright, two even claws; it rears up and lifts both before it nips
  coconut-crab   level 5, about 46 across: long and dark on stilted legs, one giant claw, a coconut husk on its back; a slow, heavy slam
Both are built facing -Y from one pose (a dict), but each has its own outline and its own way of moving (docs/rules.md 5).
  node tools/blender.js blender/crab.py -- sand-crab work/sand-crab/render [clip,clip...]"""
import sys, os, math
HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path: sys.path.insert(0, HERE)
import bmesh
from mathutils import Vector, Matrix
import drok as D
from drok import sph, cap, mix

KINDS = {
    'sand-crab': dict(k=0.62, shell='crab', legs='crabDark', claw='claw', thumb='crabDark', body=(0.43, 0.3, 0.17), z=0.2, big=(1.0, 1.0), leg=0.05, reach=1.0, husk=False),
    'coconut-crab': dict(k=0.9, shell='coco', legs='leg', claw='cocoClaw', thumb='cocoDark', body=(0.36, 0.44, 0.2), z=0.3, big=(1.75, 0.8), leg=0.055, reach=1.25, husk=True),
}
REST = dict(bob=0.0, rear=0.0, up=0.0, snap=0.0, wide=0.0, phase=None, shut=False, roll=0.0, squash=0.0, curl=0.0, slam=0.0)
def pose(**o): p = dict(REST); p.update(o); return p

def builder(kind):
    K = KINDS[kind]; k = K['k']; bx, by, bz = K['body']
    def build(st, p):
        made = []      # every object with the place it was given (a matrix read back before the scene is evaluated is stale)
        def mk(bm, name, m, M=None, **kw):
            o = st.make(bm, name, m, **kw); made.append((o, M or Matrix.Identity(4)))
            if M is not None: o.matrix_local = M
            return o
        sq = 1 - 0.25 * p['squash']; B = Matrix.Translation(Vector((0, 0, (K['z'] + p['bob']) * k * sq))) @ D.rx(-p['rear'])      # the body's place and its tilt (rear: the front lifts)
        bp = lambda x, y, z=0.0: B @ Vector((x * k, y * k, z * k))
        bm = bmesh.new(); sph(bm, (0, 0, 0), 1.0, (bx * k, by * k, bz * k * sq), seg=32); mk(bm, 'shell', K['shell'], M=B)
        if K['husk']:      # a coconut husk worn on the back, and two long feelers
            bm = bmesh.new(); sph(bm, (0, 0.2 * k, 0.16 * k), 0.26 * k, (1, 1.05, 0.9), seg=20); mk(bm, 'husk', 'nut', M=B)
            bm = bmesh.new()
            for i in range(3): a = -0.6 + i * 0.6; cap(bm, (math.sin(a) * 0.2 * k, 0.2 * k + math.cos(a) * 0.02, 0.36 * k), (math.sin(a) * 0.26 * k, 0.24 * k, 0.2 * k), 0.012, 0.012, seg=6)
            mk(bm, 'husk_marks', 'cocoDark', M=B, line=False)
            bm = bmesh.new()
            for s in (-1, 1): cap(bm, bp(s * 0.1, -0.4, 0.05), bp(s * 0.3, -0.75, 0.3 + 0.1 * p['up']), 0.012, 0.008, seg=6)
            mk(bm, 'feelers', K['thumb'])
        # the legs: three a side; the tips stay on the sand and step in turn
        ROOT = [(0.36, -0.12), (0.41, 0.03), (0.35, 0.17)]; TIP = [(0.66, -0.4), (0.8, 0.04), (0.64, 0.44)]
        bm = bmesh.new()
        for s in (-1, 1):
            for i in range(3):
                r = bp(s * ROOT[i][0] * bx / 0.43, ROOT[i][1], -0.02); tx, ty = s * TIP[i][0] * K['reach'], TIP[i][1] * K['reach']; lift = 0.0
                if p['phase'] is not None: ph = p['phase'] + (i + (0 if s > 0 else 1)) * math.pi; ty += 0.13 * math.sin(ph); lift = 0.12 * max(0.0, math.cos(ph))
                t = Vector((tx * k, ty * k, lift * k)); c = p['curl']
                if c: t = mix(t, bp(s * 0.3, ROOT[i][1], 0.3), c)                              # dying: the legs draw in over the belly
                kn = mix(r, t, 0.5) + Vector((s * 0.06 * k, 0, (0.26 + 0.1 * (K['reach'] - 1)) * k * (1 - c)))
                cap(bm, r, kn, K['leg'] * k, K['leg'] * 0.85 * k, seg=10); cap(bm, kn, t, K['leg'] * 0.85 * k, K['leg'] * 0.4 * k, seg=10)
        mk(bm, 'legs', K['legs'])
        # the claws: up lifts them over the body (the tell), snap throws them forward and down, wide spreads them
        bmc = bmesh.new(); bmt = bmesh.new(); up, sn, slam = p['up'], p['snap'], p['slam']
        for s in (-1, 1):
            q = K['big'][0] if s < 0 else K['big'][1]; lift = up if (s < 0 or not K['husk']) else up * 0.35
            cz = 0.02 + 0.62 * lift - 0.12 * sn - 0.1 * slam; cy = -(0.5 + 0.06 * lift + 0.34 * sn + 0.3 * slam) + 0.3 * lift * (1 if K['husk'] and s < 0 else 0.25)
            cc = bp(s * (0.46 + 0.14 * p['wide'] + 0.06 * lift - 0.16 * sn), cy, cz); el = bp(s * (0.52 + 0.1 * p['wide']), -0.26 - 0.1 * sn, 0.04 + 0.3 * lift)
            cap(bmc, bp(s * 0.3, -0.2, 0.0), el, 0.075 * k, 0.07 * k, seg=12); cap(bmc, el, cc + (B.to_3x3() @ Vector((0, 0.14 * k * q, 0))), 0.07 * k, 0.07 * k * q, seg=12)
            R3 = B.to_3x3() @ D.rz(-s * 14).to_3x3() @ D.rx(-70 * lift + 40 * sn + 55 * slam).to_3x3()
            sph(bmc, cc, 0.19 * k * q, (1.0, 1.35, 0.82), seg=20, rot=R3.to_4x4())
            sph(bmt, cc + R3 @ Vector((-s * 0.12 * k * q, -0.11 * k * q, -0.03 * k * q)), 0.105 * k * q, (0.72, 1.5, 0.72), seg=14, rot=R3.to_4x4())      # the lower finger, darker, so the pincer reads
        mk(bmc, 'claws', K['claw'], remesh=0.009, soften=3); mk(bmt, 'thumbs', K['thumb'])
        # the eyes on their stalks
        bm = bmesh.new(); e = []
        for s in (-1, 1): a = bp(s * 0.13, -by + 0.06, 0.08); b = bp(s * 0.17, -by - 0.02, 0.34); cap(bm, a, b, 0.03 * k, 0.026 * k, seg=8); e.append(b)
        mk(bm, 'stalks', K['shell'])
        if not p['shut']:
            bm = bmesh.new()
            for b in e: sph(bm, b + Vector((0, 0, 0.03 * k)), 0.1 * k, seg=16)
            mk(bm, 'eyes', 'white')
            bm = bmesh.new()
            for b in e: sph(bm, b + (B.to_3x3() @ Vector((0, -0.075 * k, 0.035 * k))), 0.048 * k, seg=10)
            mk(bm, 'pupils', 'eye', line=False)
        else:
            bm = bmesh.new()
            for b in e: sph(bm, b + Vector((0, 0, 0.03 * k)), 0.1 * k, seg=16)
            mk(bm, 'eyes', K['thumb'])
        if p['roll']:
            F = Matrix.Translation(Vector((0, 0, 0.2 * k * min(1.0, abs(p['roll']) / 90.0)))) @ D.ry(p['roll'])
            for o, M in made: o.matrix_local = F @ M
        return {'ref': (bp(0, 0, 0), Vector((0, 0, 1)))}
    return build

def clips(kind):
    slow = kind == 'coconut-crab'
    stand = [pose(bob=0.012 * math.sin(i / 3 * math.tau), wide=0.3 * max(0.0, math.sin(i / 3 * math.tau))) for i in range(3)]
    move = [pose(phase=i / 4 * math.tau, bob=0.012 * abs(math.sin(i / 4 * math.tau * 2))) for i in range(4)]
    if not slow:    # it rears up and lifts both claws for half a second, then nips forward
        attack = [pose(up=0.45, rear=8, bob=0.01), pose(up=0.85, rear=16, bob=0.03, wide=0.3), pose(up=1.0, rear=22, bob=0.05, wide=0.5),
                  pose(up=0.1, snap=1.0, rear=-10, bob=-0.03), pose(up=0.0, snap=0.75, rear=-6, bob=-0.02), pose(snap=0.25)]
        A = {'frames': attack, 'delay': [120, 150, 230, 60, 90, 100], 'blow': 3, 'note': 'the wind-up is frames 1 to 3, 500 ms; the nip lands on frame 4'}
    else:           # it rises on its legs and hauls the giant claw overhead for nine tenths of a second, then brings it down in front
        attack = [pose(up=0.3, rear=6, bob=0.03), pose(up=0.6, rear=14, bob=0.07), pose(up=0.85, rear=22, bob=0.1), pose(up=1.0, rear=28, bob=0.12, wide=0.3), pose(up=1.0, rear=30, bob=0.13, wide=0.4), pose(up=1.0, rear=28, bob=0.12, wide=0.3),
                  pose(up=0.0, slam=1.0, rear=-16, bob=-0.06, squash=0.5), pose(up=0.0, slam=0.9, rear=-12, bob=-0.05, squash=0.35), pose(slam=0.4, rear=-5, bob=-0.02), pose(slam=0.1)]
        A = {'frames': attack, 'delay': [140, 150, 160, 160, 150, 140, 70, 120, 120, 120], 'blow': 6, 'note': 'the wind-up is frames 1 to 6, 900 ms; the slam lands on frame 7 and hits everything within 70'}
    hit = [pose(squash=0.7, wide=1.0, shut=True, bob=-0.02, rear=-8)]
    die = [pose(roll=70, shut=True, wide=0.6, curl=0.2), pose(roll=150, shut=True, curl=0.5), pose(roll=180, shut=True, curl=0.8), pose(roll=180, shut=True, curl=1.0, bob=-0.01)]
    return {
        'stand': {'frames': stand, 'delay': 240 if slow else 200, 'loop': True},
        'move': {'frames': move, 'delay': 150 if slow else 100, 'loop': True, 'stride': round(4 * 0.13 * KINDS[kind]['k'] * KINDS[kind]['reach'] * D.UNIT, 2)},
        'attack1': A,
        'hit1': {'frames': hit, 'delay': 160},
        'die1': {'frames': die, 'delay': [90, 90, 140, 220], 'fade': 2},
    }
FRAMES = {'sand-crab': (192, 192, 96, 116), 'coconut-crab': (288, 272, 144, 168)}
if __name__ == '__main__':
    a = D.args(); kind = a[0] if a else 'sand-crab'; out = os.path.abspath(a[1]) if len(a) > 1 else os.path.join(HERE, '..', 'work', kind, 'render'); only = a[2].split(',') if len(a) > 2 else None
    # the coconut crab is big: three facings (s, e, n; the game flips e to w) keep its atlas at 8 MB instead of 16; for a facing it has not, the game takes the nearest
    facings = tuple(f for f in D.FACINGS if f[0] in ('s', 'e', 'n')) if kind == 'coconut-crab' else D.FACINGS
    D.render_clips(D.Stage(), kind, builder(kind), clips(kind), out, FRAMES[kind], facings=facings, only=only)
