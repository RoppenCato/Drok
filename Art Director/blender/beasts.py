"""beasts.py: six small beasts (Leonard, AD, 2026-11-20; the designs are mine). Robin, 2026-11-20, of the six candidates
shown for the grove in place of the reef gull ("I think the birds are weird starting mobs"): "Build all of them".
  palm-monkey     a cheeky monkey out of the palms: it rears with both arms thrown high, then slaps
  bristle-piglet  a striped wild piglet: head down and a hoof scraping, then a butt; it has a `charge` gallop too
  wharf-rat       a ship's rat with an eye patch: it sits up on its haunches, teeth out, then nips
  frill-lizard    a blue lizard: it rears and throws its orange frill wide open, then snaps
  hop-toad        a fat yellow toad that moves in hops: its throat swells to a ball, then its tongue lashes
  plum-viper      a fat violet snake: coiled, it pulls its head far back, then strikes across a gap
Each is built facing -Y from one pose (a dict) for every frame, as the crabs are: its own outline, its own way of moving
(docs/rules.md 5). The limbs reach from the body to feet that stay on the ground, so a body may bob, rear or lunge.
  node tools/blender.js blender/beasts.py -- <kind> work/<kind>/render [clip,clip...|all] [quick]
quick renders one facing only (se), for a look at the poses before the full set."""
import sys, os, math
HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path: sys.path.insert(0, HERE)
import bmesh
from mathutils import Vector, Matrix
import drok as D
from drok import sph, cap, plate, mix
V = Vector; TAU = math.tau
def T(x, y, z): return Matrix.Translation(V((x, y, z)))
def about(p, R): return Matrix.Translation(V(p)) @ R @ Matrix.Translation(-V(p))
def scale3(x, y, z): return Matrix.Diagonal((x, y, z, 1.0))
def tube(bm, pts, r0, r1=None, seg=10, rad=None):
    """a limb through points; its radius from r0 to r1, or from rad(t)"""
    n = len(pts) - 1; r1 = r0 if r1 is None else r1; f = rad or (lambda t: r0 + (r1 - r0) * t)
    for i in range(n): cap(bm, pts[i], pts[i + 1], f(i / n), f((i + 1) / n), seg=seg)
def lerp(a, b, k): return a + (b - a) * k
def step(ph, amp, lift):
    """a foot's place in its stride: how far along (forward is -Y) and how high; it is on the ground for half the turn"""
    return -amp * math.sin(ph), lift * max(0.0, math.cos(ph))

class Rig:
    """the pieces of one pose: each made where it rests, then put by its matrix; done() adds what moves the whole beast"""
    def __init__(self, st): self.st = st; self.made = []
    def mk(self, bm, name, mat, M=None, **kw):
        o = self.st.make(bm, name, mat, **kw); self.made.append((o, M if M is not None else Matrix.Identity(4))); return o
    def done(self, G=None):
        for o, M in self.made: o.matrix_local = (G @ M) if G is not None else M
    def beads(self, pts, r, M, brow=0.5, shut=False):
        """dark bead eyes with a glint and a heavy brow (the gull's); shut: a dark line"""
        bm = bmesh.new()
        for p in pts:
            if shut: cap(bm, V(p) + V((-r * 1.1, -r * 0.3, 0)), V(p) + V((r * 1.1, -r * 0.3, 0)), r * 0.3, r * 0.3, seg=6)
            else: sph(bm, p, r, seg=10)
        self.mk(bm, 'eyes', 'eye', M, line=False)
        if not shut:
            bm = bmesh.new()
            for p in pts: sph(bm, V(p) + V((-r * 0.3, -r * 0.75, r * 0.45)), r * 0.38, seg=6)
            self.mk(bm, 'glints', 'white', M, line=False)
        if brow:
            bm = bmesh.new()
            for p in pts:
                s = 1 if p[0] > 0 else -1; q = V(p); up = 0.3 if shut else 1.0
                cap(bm, q + V((-s * r * 1.1, -r * 0.6, r * up)), q + V((s * r * 1.3, -r * 0.2, r * (up + brow))), r * 0.42, r * 0.34, seg=6)
            self.mk(bm, 'brows', 'black', M, line=False)
    def balls(self, pts, r, M, lid, look=(0, -1, 0.1), shut=False):
        """white eyes with a dark pupil (the crabs'); shut: the lid's colour"""
        bm = bmesh.new()
        for p in pts: sph(bm, p, r, seg=14)
        self.mk(bm, 'eyes', lid if shut else 'white', M)
        if not shut:
            bm = bmesh.new(); d = V(look).normalized()
            for p in pts: sph(bm, V(p) + d * r * 0.7, r * 0.52, seg=10)
            self.mk(bm, 'pupils', 'eye', M, line=False)

def fall(p, lift):
    """what moves the whole beast: a lunge forward, a jump, and the roll onto its back as it dies"""
    r = p.get('roll', 0.0)
    return T(0, -p.get('fwd', 0.0), p.get('jump', 0.0) + lift * min(1.0, abs(r) / 90.0)) @ D.ry(r)

# ================================================================= the palm monkey
MONKEY = dict(bob=0.0, rear=0.0, up=0.0, slap=0.0, spread=0.0, phase=None, tail=0.0, sway=0.0, nod=0.0, turn=0.0, open=0.0, shut=False, roll=0.0, fwd=0.0, jump=0.0)
CURL = [(0, 0.17, -0.05), (0.02, 0.29, -0.06), (0.04, 0.41, 0.01), (0.05, 0.47, 0.15), (0.05, 0.45, 0.3), (0.04, 0.35, 0.4), (0.03, 0.23, 0.38), (0.03, 0.18, 0.28), (0.03, 0.23, 0.2), (0.03, 0.31, 0.22)]
def monkey(st, p):
    R = Rig(st); C0 = V((0, 0.07, 0.25)); hip = V((0, 0.2, -0.1))
    Bm = T(0, 0, p['bob']) @ T(*C0) @ about(hip, D.rx(-p['rear'])); Bt = T(0, 0, p['bob']) @ T(*C0) @ about(hip, D.rx(-p['rear'] * 0.4))
    bp = lambda x, y, z: Bm @ V((x, y, z))
    bm = bmesh.new(); sph(bm, (0, 0, 0), 1.0, (0.17, 0.2, 0.2), seg=24); R.mk(bm, 'body', 'fur', Bm, remesh=0.012, soften=3)
    bm = bmesh.new(); sph(bm, (0, -0.145, -0.02), 1.0, (0.105, 0.07, 0.13), seg=16); R.mk(bm, 'belly', 'furPale', Bm)
    # the head: it stays level while the body rears
    Hm = Bm @ T(0, -0.18, 0.28) @ D.rx(p['rear'] * 0.75 + p['nod']) @ D.rz(p['turn'])
    bm = bmesh.new(); sph(bm, (0, 0, 0), 0.19, (1.05, 0.95, 0.94), seg=24)
    for s in (-1, 1): sph(bm, (s * 0.215, 0.05, 0.04), 0.092, (1, 0.5, 1), seg=14)
    R.mk(bm, 'head', 'fur', Hm, remesh=0.012, soften=2)
    bm = bmesh.new()
    for s in (-1, 1): sph(bm, (s * 0.222, 0.015, 0.04), 0.054, (1, 0.4, 1), seg=10)
    R.mk(bm, 'ears_in', 'furPale', Hm, line=False)
    bm = bmesh.new()
    for s in (-1, 1): sph(bm, (s * 0.068, -0.152, 0.03), 0.078, (1, 0.45, 1.05), seg=14)
    sph(bm, (0, -0.17, -0.065), 0.1, (1.08, 0.62, 0.74), seg=16)
    R.mk(bm, 'mask', 'furPale', Hm, remesh=0.01, soften=2)
    bm = bmesh.new(); sph(bm, (0, -0.235, -0.04), 0.016, (1.3, 1, 0.8), seg=6)
    if p['open'] > 0: sph(bm, (0, -0.228, -0.09), 0.03 + 0.022 * p['open'], (1.25, 0.6, 0.7 + 0.5 * p['open']), seg=10)
    else: tube(bm, [V((-0.055, -0.228, -0.075)), V((0, -0.24, -0.09)), V((0.06, -0.225, -0.068))], 0.009, seg=6)
    R.mk(bm, 'mouth', 'eye', Hm, line=False)
    R.beads([(-0.07, -0.195, 0.035), (0.07, -0.195, 0.035)], 0.03, Hm, brow=0.55, shut=p['shut'])
    # long arms with the knuckles on the ground, legs folded under; up throws the arms overhead, slap brings them down in front
    limbs = bmesh.new(); ends = bmesh.new(); sp = p['spread']
    for s in (-1, 1):
        ph = None if p['phase'] is None else p['phase'] + (0 if s > 0 else math.pi)
        dy, lf = step(ph, 0.11, 0.09) if ph is not None else (0.0, 0.0); dy2, lf2 = step(ph + math.pi, 0.11, 0.08) if ph is not None else (0.0, 0.0)
        hand = V((s * 0.18, -0.25 + dy, 0.06 + lf)); hand = mix(hand, bp(s * 0.25, -0.16, 0.66), p['up']); hand = mix(hand, V((s * 0.1, -0.5, 0.2)), p['slap']); hand = mix(hand, bp(s * 0.44, -0.06, 0.28), sp)
        foot = mix(V((s * 0.25, -0.05 + dy2, 0.05 + lf2)), bp(s * 0.36, 0.2, -0.3), sp)
        sh = bp(s * 0.14, -0.12, 0.12); hp = bp(s * 0.12, 0.06, -0.08)
        el = mix(sh, hand, 0.5) + V((s * 0.09, 0.03, -0.02 + 0.05 * p['up'])); kn = mix(hp, foot, 0.5) + V((s * 0.1, -0.03, 0.08 * (1 - sp)))
        tube(limbs, [sh, el, hand], 0.05, 0.045); tube(limbs, [hp, kn, foot], 0.058, 0.045)
        sph(ends, hand + V((0, -0.02, -0.015)), 0.056, (1, 1.2, 0.75), seg=10); sph(ends, foot + V((0, -0.04, -0.01)), 0.056, (1, 1.5, 0.7), seg=10)
    R.mk(limbs, 'limbs', 'fur', remesh=0.012, soften=2); R.mk(ends, 'hands', 'furDark')
    pts = []
    for i, c in enumerate(CURL):
        q = mix(V(c), V((0, 0.17 + 0.075 * i, -0.05 + 0.04 * i)), p['tail']); q.x += 0.035 * math.sin(p['sway'] + i * 0.6) * i / 9; pts.append(Bt @ q)
    bm = bmesh.new(); tube(bm, pts, 0.04, 0.03); R.mk(bm, 'tail', 'furDark')
    R.done(fall(p, 0.2)); return {'ref': (bp(0, 0, 0), V((0, 0, 1)))}
def monkey_clips():
    P = lambda **o: dict(MONKEY, **o)
    stand = [P(bob=0.012 * math.sin(i / 4 * TAU), sway=i / 4 * TAU, turn=7 * math.sin(i / 4 * TAU)) for i in range(4)]
    move = [P(phase=i / 4 * TAU, bob=0.02 * abs(math.sin(i / 4 * TAU)), sway=i / 4 * TAU, rear=-4) for i in range(4)]
    attack = [P(rear=14, up=0.4, bob=0.02, open=0.2), P(rear=30, up=0.85, bob=0.03, open=0.5, tail=0.3), P(rear=38, up=1.0, bob=0.04, open=1.0, tail=0.5),      # the tell: it rears, both arms high
              P(rear=-12, slap=1.0, fwd=0.26, open=1.0, tail=0.8), P(rear=-8, slap=0.7, fwd=0.22, open=0.5, tail=0.5), P(slap=0.2, fwd=0.08, tail=0.2)]
    hit = [P(rear=28, spread=1.0, tail=1.0, shut=True, fwd=-0.08, jump=0.05, open=0.6)]
    die = [P(roll=60, shut=True, spread=0.7, tail=1.0), P(roll=130, shut=True, spread=0.5, tail=1.0), P(roll=180, shut=True, spread=0.35, tail=0.8), P(roll=180, shut=True, spread=0.35, tail=0.8)]      # the last two are one picture: the atlas holds it once
    return {'stand': {'frames': stand, 'delay': 180, 'loop': True}, 'move': {'frames': move, 'delay': 90, 'loop': True, 'stride': round(4 * 0.11 * D.UNIT, 2)},
            'attack1': {'frames': attack, 'delay': [110, 130, 220, 60, 90, 100], 'blow': 3, 'note': 'the wind-up is frames 1 to 3, 460 ms: it rears and throws both arms up; the slap lands on frame 4; it is drawn up to 15 design units ahead of its origin while it slaps'},
            'hit1': {'frames': hit, 'delay': 160}, 'die1': {'frames': die, 'delay': [90, 90, 140, 220], 'fade': 2}}

# ================================================================= the bristle piglet
PIGLET = dict(bob=0.0, pitch=0.0, nod=0.0, phase=None, gallop=None, scrape=None, ear=0.0, wag=0.0, spread=0.0, shut=False, roll=0.0, fwd=0.0, jump=0.0)
def piglet(st, p):
    R = Rig(st); C0 = V((0, 0.08, 0.26)); Bm = T(0, 0, p['bob']) @ T(*C0) @ D.rx(p['pitch']); bp = lambda x, y, z: Bm @ V((x, y, z))
    bm = bmesh.new(); sph(bm, (0, 0, 0), 1.0, (0.2, 0.27, 0.19), seg=24); R.mk(bm, 'body', 'pig', Bm, remesh=0.012, soften=3)
    bm = bmesh.new()      # a piglet's pale stripes along the back
    for x, z in ((0.0, 0.192), (-0.1, 0.16), (0.1, 0.16)): sph(bm, (x, 0.06, z), 1.0, (0.026, 0.16, 0.012), seg=10, rot=D.ry(x * 280))
    R.mk(bm, 'stripes', 'pigStripe', Bm, line=False)
    bm = bmesh.new()
    for i in range(2): y = -0.2 + i * 0.075; cap(bm, (0, y, 0.2), (0, y + 0.04, 0.285), 0.034, 0.006, seg=8)
    R.mk(bm, 'bristles', 'hoof', Bm)
    tail = [V((0.0, 0.25, 0.04)), V((0.02, 0.31, 0.08)), V((0.05, 0.32, 0.14)), V((0.02, 0.29, 0.17)), V((-0.02, 0.32, 0.14)), V((0.0, 0.36, 0.17))]
    bm = bmesh.new(); tube(bm, [q + V((0.03 * math.sin(p['wag']) * i / 5, 0, 0)) for i, q in enumerate(tail)], 0.022, 0.014, seg=8); R.mk(bm, 'tail', 'pigDark', Bm)
    # the head: nod lowers the snout
    Hm = Bm @ T(0, -0.28, 0.04) @ D.rx(p['nod'])
    bm = bmesh.new(); sph(bm, (0, 0, 0), 0.175, (1.0, 0.98, 0.95), seg=24); R.mk(bm, 'head', 'pig', Hm, remesh=0.012, soften=2)
    bm = bmesh.new(); D.cyl(bm, (0, -0.185, -0.035), 0.072, 0.09, axis=(0, -1, 0.1), seg=16); R.mk(bm, 'snout', 'snout', Hm)
    bm = bmesh.new()
    for s in (-1, 1): sph(bm, (s * 0.027, -0.232, -0.028), 0.015, (1, 0.5, 1.3), seg=6)
    R.mk(bm, 'nostrils', 'eye', Hm, line=False)
    bm = bmesh.new(); e = p['ear']
    for s in (-1, 1): cap(bm, (s * 0.1, 0.0, 0.13), (s * (0.22 - 0.04 * e), -0.06 + 0.14 * e, 0.2 - 0.07 * e), 0.065, 0.018, seg=10)
    R.mk(bm, 'ears', 'pigDark', Hm)
    bm = bmesh.new()
    for s in (-1, 1): cap(bm, (s * 0.075, -0.16, -0.09), (s * 0.115, -0.22, -0.01), 0.022, 0.008, seg=8)
    R.mk(bm, 'tusks', 'white', Hm)
    bm = bmesh.new()
    for i in range(2): y = -0.07 + i * 0.075; cap(bm, (0, y, 0.155), (0, y + 0.04, 0.24), 0.034, 0.006, seg=8)
    R.mk(bm, 'crest', 'hoof', Hm)
    R.beads([(-0.09, -0.13, 0.07), (0.09, -0.13, 0.07)], 0.03, Hm, brow=0.6, shut=p['shut'])
    # four short legs: a trot in diagonal pairs, a gallop in front and hind pairs, one hoof that scrapes
    bm = bmesh.new(); sp = p['spread']
    for s in (-1, 1):
        for front in (True, False):
            dy = lf = 0.0
            if p['phase'] is not None: dy, lf = step(p['phase'] + (0 if (s > 0) == front else math.pi), 0.09, 0.06)
            if p['gallop'] is not None: dy, lf = step(p['gallop'] + (0 if front else 2.4) + (0.3 if s > 0 else 0), 0.16, 0.1)
            if p['scrape'] is not None and front and s > 0: dy = -0.1 * p['scrape']; lf = 0.05 * (1 - abs(p['scrape']))
            root = bp(s * 0.11, -0.2, -0.1) if front else bp(s * 0.12, 0.14, -0.1)
            foot = V((s * 0.12, (-0.14 if front else 0.24) + dy, 0.035 + lf)); foot = mix(foot, bp(s * 0.22, -0.28 if front else 0.32, -0.2), sp)
            cap(bm, root, foot, 0.055, 0.042, seg=10)
    R.mk(bm, 'legs', 'hoof')
    R.done(fall(p, 0.18)); return {'ref': (bp(0, 0, 0), V((0, 0, 1)))}
def piglet_clips():
    P = lambda **o: dict(PIGLET, **o)
    stand = [P(bob=0.008 * math.sin(i / 4 * TAU), ear=(0.5 if i == 2 else 0.0), wag=i / 4 * TAU) for i in range(4)]
    move = [P(phase=i / 4 * TAU, bob=0.015 * abs(math.sin(i / 4 * TAU * 2)), wag=i / 4 * TAU) for i in range(4)]
    charge = [P(gallop=i / 4 * TAU, pitch=8 + 4 * math.sin(i / 4 * TAU), nod=16, ear=1.0, bob=0.02 + 0.02 * math.sin(i / 4 * TAU), wag=i) for i in range(4)]
    attack = [P(pitch=8, nod=14, scrape=1.0, fwd=-0.02), P(pitch=13, nod=22, scrape=-1.0, ear=0.6, fwd=-0.04), P(pitch=16, nod=26, scrape=1.0, ear=0.8, fwd=-0.05), P(pitch=18, nod=28, scrape=-1.0, ear=1.0, fwd=-0.06),     # the tell: head down, a hoof scraping
              P(pitch=-8, nod=-26, fwd=0.3, gallop=1.2, ear=1.0, bob=0.02), P(pitch=-5, nod=-10, fwd=0.26, ear=0.6), P(fwd=0.1, nod=4)]
    hit = [P(pitch=-24, nod=-15, spread=0.6, shut=True, fwd=-0.08, jump=0.05, ear=1.0)]
    die = [P(roll=70, shut=True, spread=0.5, ear=1.0), P(roll=150, shut=True, spread=0.7, ear=1.0), P(roll=180, shut=True, spread=0.9, ear=1.0), P(roll=180, shut=True, spread=1.0, ear=1.0)]
    return {'stand': {'frames': stand, 'delay': 200, 'loop': True}, 'move': {'frames': move, 'delay': 90, 'loop': True, 'stride': round(4 * 0.09 * D.UNIT, 2)},
            'charge': {'frames': charge, 'delay': 70, 'loop': True, 'stride': round(4 * 0.16 * D.UNIT, 2), 'note': 'a gallop with the head down, for a rule that has it charge; not one of the five every monster has'},
            'attack1': {'frames': attack, 'delay': [120, 120, 120, 160, 60, 90, 100], 'blow': 4, 'note': 'the wind-up is frames 1 to 4, 520 ms: head down, a front hoof scraping twice; the butt lands on frame 5; it is drawn up to 17 design units ahead of its origin while it butts'},
            'hit1': {'frames': hit, 'delay': 160}, 'die1': {'frames': die, 'delay': [90, 90, 140, 220], 'fade': 2}}

# ================================================================= the wharf rat
RAT = dict(bob=0.0, rear=0.0, nod=0.0, phase=None, wave=0.0, open=0.0, spread=0.0, shut=False, roll=0.0, fwd=0.0, jump=0.0)
def rat(st, p):
    R = Rig(st); C0 = V((0, 0.1, 0.19)); hip = V((0, 0.14, -0.1)); Bm = T(0, 0, p['bob']) @ T(*C0) @ about(hip, D.rx(-p['rear'])); bp = lambda x, y, z: Bm @ V((x, y, z))
    bm = bmesh.new(); sph(bm, (0, 0.04, 0.01), 1.0, (0.17, 0.23, 0.17), seg=24); sph(bm, (0, -0.12, -0.005), 1.0, (0.13, 0.17, 0.125), seg=20)
    for s in (-1, 1): sph(bm, (s * 0.13, 0.09, -0.07), 0.095, seg=12)
    R.mk(bm, 'body', 'rat', Bm, remesh=0.011, soften=3)
    bm = bmesh.new(); sph(bm, (0, -0.1, -0.075), 1.0, (0.095, 0.19, 0.07), seg=14); R.mk(bm, 'belly', 'ratBelly', Bm)
    # the head: it stays level while the body sits up
    Hm = Bm @ T(0, -0.24, 0.02) @ D.rx(p['rear'] * 0.85 + p['nod'])
    bm = bmesh.new(); sph(bm, (0, 0, 0), 1.0, (0.125, 0.15, 0.125), seg=20); cap(bm, (0, -0.07, -0.02), (0, -0.235, -0.055), 0.088, 0.04, seg=14); R.mk(bm, 'head', 'rat', Hm, remesh=0.011, soften=2)
    bm = bmesh.new(); sph(bm, (0, -0.26, -0.05), 0.036, seg=10); R.mk(bm, 'nose', 'ratPink', Hm)
    for s in (-1, 1):
        Re = D.rz(s * -24) @ D.ry(s * 12)
        bm = bmesh.new(); sph(bm, (s * 0.135, 0.08, 0.16), 0.115, (1, 0.22, 1), seg=16, rot=Re); R.mk(bm, 'ear', 'rat', Hm)
        bm = bmesh.new(); sph(bm, (s * 0.14, 0.055, 0.16), 0.075, (1, 0.2, 1), seg=12, rot=Re); R.mk(bm, 'ear_in', 'ratPink', Hm, line=False)
    o = p['open']
    if o > 0: bm = bmesh.new(); sph(bm, (0, -0.2, -0.1 - 0.02 * o), 0.045, (0.9, 1.5, 0.5 + 0.5 * o), seg=10); R.mk(bm, 'mouth', 'mouth', Hm, line=False)
    bm = bmesh.new()
    for s in (-1, 1): D.box(bm, (s * 0.014, -0.238, -0.105 - 0.012 * o), (0.024, 0.016, 0.045 + 0.02 * o))
    R.mk(bm, 'teeth', 'white', Hm)
    R.beads([(0.074, -0.105, 0.068)], 0.034, Hm, brow=0.5, shut=p['shut'])
    bm = bmesh.new(); sph(bm, (-0.072, -0.11, 0.065), 0.046, (1, 0.5, 1), seg=10)      # a pirate's eye patch and its strap
    tube(bm, [V((-0.1, -0.08, 0.1)), V((-0.06, 0.04, 0.125)), V((0.02, 0.12, 0.12))], 0.011, seg=6); tube(bm, [V((-0.03, -0.12, 0.09)), V((0.04, -0.06, 0.12)), V((0.1, 0.04, 0.1))], 0.011, seg=6)
    R.mk(bm, 'patch', 'black', Hm, line=False)
    # the paws: the hind ones stay down; the front ones are held to the chest when it sits up
    legs = bmesh.new(); feet = bmesh.new(); up = min(1.0, max(0.0, p['rear']) / 40.0); sp = p['spread']
    for s in (-1, 1):
        ph = None if p['phase'] is None else p['phase'] + (0 if s > 0 else math.pi)
        dy, lf = step(ph, 0.08, 0.05) if ph is not None else (0.0, 0.0); dy2, lf2 = step(ph + math.pi, 0.08, 0.05) if ph is not None else (0.0, 0.0)
        paw = mix(V((s * 0.095, -0.19 + dy, 0.03 + lf)), bp(s * 0.075, -0.3, -0.07), up); paw = mix(paw, bp(s * 0.2, -0.26, 0.02), sp)
        cap(legs, bp(s * 0.085, -0.2, -0.05), paw, 0.045, 0.035, seg=8); sph(feet, paw, 0.042, (1, 1.5, 0.6), seg=8)
        sph(feet, mix(V((s * 0.15, 0.14 + dy2, 0.03 + lf2)), bp(s * 0.22, 0.2, -0.16), sp), 0.048, (1, 1.8, 0.6), seg=8)
    R.mk(legs, 'legs', 'rat'); R.mk(feet, 'feet', 'ratPink')
    root = bp(0, 0.26, -0.07); pts = [root]
    for i in range(1, 7): k = i / 6; pts.append(V((0.1 * math.sin(p['wave'] + i * 1.1) * (0.3 + 0.7 * k), root.y + 0.1 * i, max(0.035, root.z * (1 - i / 2.5)) + (0.03 if i == 6 else 0))))
    bm = bmesh.new(); tube(bm, pts, 0.034, 0.013, seg=8); R.mk(bm, 'tail', 'ratPink')
    R.done(fall(p, 0.16)); return {'ref': (bp(0, 0, 0), V((0, 0, 1)))}
def rat_clips():
    P = lambda **o: dict(RAT, **o)
    stand = [P(nod=6 * math.sin(i / 4 * TAU), bob=0.006 * math.sin(i / 4 * TAU), wave=i / 4 * TAU) for i in range(4)]
    move = [P(phase=i / 4 * TAU, bob=0.012 * abs(math.sin(i / 4 * TAU * 2)), wave=i / 4 * TAU * 2, nod=4) for i in range(4)]
    attack = [P(rear=25, bob=0.01, wave=1), P(rear=50, open=0.6, wave=2), P(rear=58, open=1.0, wave=3),      # the tell: it sits up on its haunches, teeth out
              P(rear=-6, fwd=0.3, nod=10, open=1.0, wave=4), P(rear=-4, fwd=0.24, open=0.5, wave=5), P(fwd=0.08, wave=6)]
    hit = [P(rear=50, jump=0.08, fwd=-0.1, shut=True, spread=1.0, open=0.6, wave=2)]
    die = [P(roll=70, shut=True, spread=0.6, wave=1), P(roll=150, shut=True, spread=0.8, wave=1), P(roll=180, shut=True, spread=1.0, wave=1), P(roll=180, shut=True, spread=1.0, wave=1)]
    return {'stand': {'frames': stand, 'delay': 160, 'loop': True}, 'move': {'frames': move, 'delay': 70, 'loop': True, 'stride': round(4 * 0.08 * D.UNIT, 2)},
            'attack1': {'frames': attack, 'delay': [110, 120, 200, 60, 90, 100], 'blow': 3, 'note': 'the wind-up is frames 1 to 3, 430 ms: it sits up on its haunches with its teeth out; the nip lands on frame 4; it is drawn up to 17 design units ahead of its origin while it nips'},
            'hit1': {'frames': hit, 'delay': 160}, 'die1': {'frames': die, 'delay': [90, 90, 140, 220], 'fade': 2}}

# ================================================================= the frill lizard
LIZARD = dict(bob=0.0, rear=0.0, frill=0.55, phase=None, wave=0.0, open=0.0, nod=0.0, spread=0.0, shut=False, roll=0.0, fwd=0.0, jump=0.0)
def lizard(st, p):
    R = Rig(st); C0 = V((0, 0.14, 0.13)); hip = V((0, 0.14, -0.03)); Bm = T(0, 0, p['bob']) @ T(*C0) @ about(hip, D.rx(-p['rear'])); bp = lambda x, y, z: Bm @ V((x, y, z))
    ph = p['phase']; bend = lambda i: 0.0 if ph is None else 0.035 * math.sin(ph + i * 0.9)
    spine = [bp(bend(i) + x, y, z) for i, (x, y, z) in enumerate(((0, -0.34, 0.17), (0, -0.24, 0.09), (0, -0.12, 0.02), (0.03, 0.02, -0.01), (0, 0.16, -0.02)))]
    root = spine[-1]; tail = [root]
    for i in range(1, 6): k = i / 5; tail.append(V((root.x + 0.11 * math.sin(p['wave'] + i * 0.95) * k, root.y + 0.135 * i, max(0.05, root.z - 0.03 * i) + (0.04 if i == 5 else 0))))
    bm = bmesh.new(); tube(bm, spine, 0, seg=12, rad=lambda t: 0.062 + 0.036 * math.sin(math.pi * min(1.0, t * 1.15))); tube(bm, tail, 0.07, 0.012, seg=10)
    R.mk(bm, 'body', 'liz', remesh=0.011, soften=3)
    bm = bmesh.new()
    for i, (x, y, z) in enumerate(((0.0, -0.14, 0.115), (0.01, -0.04, 0.095), (0.02, 0.06, 0.08), (0.03, 0.16, 0.06))): sph(bm, (x + bend(i + 1), y, z), 0.03, (1, 1.3, 0.5), seg=8)
    R.mk(bm, 'spots', 'lizBelly', Bm, line=False)
    # the head and its frill: half open while it stands, thrown wide for the tell, shut when it is hurt
    Hm = Bm @ T(0, -0.41, 0.185) @ D.rx(p['rear'] * 0.7 + p['nod']); o = p['open']
    bm = bmesh.new(); sph(bm, (0, 0, 0.012 * o), 1.0, (0.088, 0.135, 0.075), seg=18); R.mk(bm, 'head', 'liz', Hm, remesh=0.011, soften=2)
    if o > 0: bm = bmesh.new(); sph(bm, (0, -0.04, -0.03), 1.0, (0.066, 0.1, 0.02 + 0.03 * o), seg=12); R.mk(bm, 'mouth', 'mouth', Hm, line=False)
    bm = bmesh.new(); sph(bm, (0, -0.03, -0.03 - 0.05 * o), 1.0, (0.07, 0.1, 0.04), seg=12, rot=D.rx(-18 * o)); R.mk(bm, 'jaw', 'lizBelly', Hm)
    f = p['frill']; rim = 0.14 + 0.16 * f; lean = 0.75 - 0.6 * f; Cf = V((0, 0.13, -0.015))
    def fan(r, back):
        pts = []; n = 14
        for i in range(n + 1):
            a = math.radians(-35 + 250 * i / n); rr = r * (1.0 if i % 2 == 0 else 0.88); z = math.sin(a) * rr
            pts.append(Cf + V((math.cos(a) * rr, back + z * lean, z)))
        pts.append(Cf + V((0, back, -0.07))); return pts
    bm = bmesh.new(); plate(bm, fan(rim, 0.012)); R.mk(bm, 'rim', 'frillRim', Hm, solid=0.014, smooth=False)
    bm = bmesh.new(); plate(bm, fan(rim * 0.83, 0.0)); R.mk(bm, 'frill', 'frill', Hm, solid=0.016, smooth=False, line=False)
    R.balls([(-0.068, -0.05, 0.05), (0.068, -0.05, 0.05)], 0.04, Hm, 'liz', shut=p['shut'])
    # sprawled legs, the elbows high; the front ones leave the ground when it rears
    bm = bmesh.new(); up = min(1.0, max(0.0, p['rear']) / 35.0); sp = p['spread']
    for s in (-1, 1):
        q = None if ph is None else ph + (0 if s > 0 else math.pi)
        dy, lf = step(q, 0.1, 0.06) if q is not None else (0.0, 0.0); dy2, lf2 = step(q + math.pi, 0.1, 0.06) if q is not None else (0.0, 0.0)
        ff = mix(V((s * 0.24, -0.14 + dy, 0.03 + lf)), bp(s * 0.22, -0.22, 0.02), up); ff = mix(ff, bp(s * 0.3, -0.2, 0.04), sp)
        hf = mix(V((s * 0.27, 0.31 + dy2, 0.03 + lf2)), bp(s * 0.32, 0.22, 0.04), sp)
        fr = bp(s * 0.07, -0.17, 0.02); hr = bp(s * 0.07, 0.11, -0.01)
        tube(bm, [fr, mix(fr, ff, 0.5) + V((s * 0.05, 0.03, 0.09)), ff], 0.036, 0.03, seg=8); tube(bm, [hr, mix(hr, hf, 0.45) + V((s * 0.04, -0.03, 0.1)), hf], 0.04, 0.032, seg=8)
        sph(bm, ff + V((s * 0.01, -0.02, -0.005)), 0.045, (1.2, 1.4, 0.5), seg=8); sph(bm, hf + V((s * 0.01, 0.02, -0.005)), 0.05, (1.2, 1.5, 0.5), seg=8)
    R.mk(bm, 'legs', 'liz', remesh=0.011, soften=2)
    R.done(fall(p, 0.14)); return {'ref': (bp(0, 0, 0), V((0, 0, 1)))}
def lizard_clips():
    P = lambda **o: dict(LIZARD, **o)
    stand = [P(frill=0.55 + 0.07 * math.sin(i / 4 * TAU), bob=0.006 * math.sin(i / 4 * TAU), wave=i / 4 * TAU, nod=3 * math.sin(i / 4 * TAU)) for i in range(4)]
    move = [P(phase=i / 4 * TAU, wave=i / 4 * TAU * 2, frill=0.38, bob=0.008) for i in range(4)]
    attack = [P(rear=18, frill=0.75, open=0.3, wave=1), P(rear=38, frill=1.0, open=0.8, wave=2), P(rear=46, frill=1.0, open=1.0, bob=0.02, wave=3),      # the tell: it rears and throws the frill wide
              P(rear=-8, fwd=0.3, frill=0.7, open=1.0, nod=8, wave=4), P(rear=-5, fwd=0.24, frill=0.6, open=0.4, wave=5), P(fwd=0.08, wave=6)]
    hit = [P(frill=0.06, rear=14, jump=0.04, fwd=-0.08, shut=True, spread=0.7, open=0.5)]
    die = [P(roll=70, frill=0.06, shut=True, spread=0.5), P(roll=150, frill=0.06, shut=True, spread=0.8), P(roll=180, frill=0.06, shut=True, spread=1.0), P(roll=180, frill=0.06, shut=True, spread=1.0)]
    return {'stand': {'frames': stand, 'delay': 200, 'loop': True}, 'move': {'frames': move, 'delay': 80, 'loop': True, 'stride': round(4 * 0.1 * D.UNIT, 2)},
            'attack1': {'frames': attack, 'delay': [110, 130, 240, 60, 90, 100], 'blow': 3, 'note': 'the wind-up is frames 1 to 3, 480 ms: it rears and throws its frill wide open; the snap lands on frame 4; it is drawn up to 17 design units ahead of its origin while it snaps'},
            'hit1': {'frames': hit, 'delay': 160}, 'die1': {'frames': die, 'delay': [90, 90, 140, 220], 'fade': 2}}

# ================================================================= the hop toad
TOAD = dict(z=0.0, sq=0.0, throat=0.0, ext=0.0, tongue=0.0, open=0.0, pitch=0.0, shut=False, roll=0.0, fwd=0.0, jump=0.0)
def toad(st, p):
    R = Rig(st); sq = p['sq']; Lm = T(0, 0, p['z']); C0 = V((0, 0.05, 0.2 * (1 - 0.3 * sq)))
    Bm = Lm @ T(*C0) @ D.rx(-10 + p['pitch']) @ scale3(1 + 0.22 * sq, 1 + 0.05 * sq, 1 - 0.32 * sq); bp = lambda x, y, z: Bm @ V((x, y, z))
    bm = bmesh.new(); sph(bm, (0, 0, 0), 1.0, (0.24, 0.26, 0.185), seg=28)
    for s in (-1, 1): sph(bm, (s * 0.125, -0.15, 0.175), 0.09, seg=16)
    R.mk(bm, 'body', 'frog', Bm, remesh=0.012, soften=3)
    t = p['throat']; bm = bmesh.new(); sph(bm, (0, -0.17 - 0.1 * t, -0.06 - 0.02 * t), 1.0, (0.17 + 0.1 * t, 0.115 + 0.16 * t, 0.1 + 0.14 * t), seg=18); R.mk(bm, 'throat', 'frogBelly', Bm)
    R.balls([(-0.13, -0.2, 0.19), (0.13, -0.2, 0.19)], 0.066, Bm, 'frog', look=(0, -1, 0.05), shut=p['shut'])
    o = p['open']
    if o > 0: bm = bmesh.new(); sph(bm, (0, -0.24, 0.035), 1.0, (0.15, 0.06, 0.03 + 0.05 * o), seg=12); R.mk(bm, 'mouth', 'mouth', Bm, line=False)
    else:
        bm = bmesh.new(); tube(bm, [V((u * 0.19, -0.265 + 0.09 * u * u, 0.045 + 0.03 * u * u)) for u in (i / 4 - 1 for i in range(9))], 0.009, seg=6); R.mk(bm, 'mouth', 'eye', Bm, line=False)
    if p['tongue'] > 0:      # the tongue: straight out of the mouth, a knob on its end
        a = bp(0, -0.25, 0.03); b = a + V((0, -0.6 * p['tongue'], -0.06 * p['tongue'])); bm = bmesh.new(); cap(bm, a, b, 0.03, 0.024, seg=8); sph(bm, b, 0.052, seg=10); R.mk(bm, 'tongue', 'snout')
    bm = bmesh.new()
    for x, y, z, r in ((0.0, 0.05, 0.185, 0.05), (-0.11, 0.15, 0.13, 0.04), (0.12, 0.12, 0.145, 0.045), (0.02, 0.21, 0.105, 0.034), (-0.06, -0.05, 0.185, 0.03)): sph(bm, (x, y, z), r, (1, 1, 0.3), seg=8)
    R.mk(bm, 'spots', 'frogLeg', Bm, line=False)
    # the hind legs: folded on the ground, thrown out behind in the leap (ext); small front legs
    legs = bmesh.new(); toes = bmesh.new(); e = p['ext']
    for s in (-1, 1):
        hipp = bp(s * 0.16, 0.15, -0.07)
        knee = mix(Lm @ V((s * 0.31, -0.02, 0.18)), hipp + V((s * 0.07, 0.2, -0.05)), e); ank = mix(Lm @ V((s * 0.28, 0.22, 0.05)), hipp + V((s * 0.09, 0.42, -0.1)), e); toe = mix(Lm @ V((s * 0.34, 0.1, 0.025)), ank + V((s * 0.03, 0.15, -0.03)), e)
        cap(legs, hipp, knee, 0.075, 0.055, seg=12); cap(legs, knee, ank, 0.05, 0.036, seg=10); cap(legs, ank, toe, 0.034, 0.03, seg=8)
        hand = Lm @ V((s * 0.215, -0.26, 0.03)); hand = mix(hand, bp(s * 0.2, -0.3, -0.12), min(1.0, p['z'] / 0.12)); cap(legs, bp(s * 0.17, -0.18, -0.06), hand, 0.045, 0.034, seg=10)
        sph(toes, toe, 0.06, (1.0, 2.0 - 0.6 * e, 0.42), seg=10, rot=D.rz(s * 24)); sph(toes, hand, 0.05, (1.3, 1.3, 0.45), seg=10)
    R.mk(legs, 'legs', 'frogLeg', remesh=0.011, soften=2); R.mk(toes, 'toes', 'frogToe')
    R.done(fall(p, 0.2)); return {'ref': (bp(0, 0, 0), V((0, 0, 1)))}
def toad_clips():
    P = lambda **o: dict(TOAD, **o)
    stand = [P(throat=k) for k in (0.0, 0.2, 0.32, 0.12)]
    hop = [P(sq=0.5), P(sq=-0.3, pitch=-22, ext=0.6, z=0.08), P(sq=-0.35, pitch=-18, ext=1.0, z=0.26), P(sq=-0.15, pitch=0, ext=0.7, z=0.28), P(pitch=12, ext=0.3, z=0.1), P(sq=0.6)]
    attack = [P(throat=0.4, sq=0.2), P(throat=0.8, sq=0.1, pitch=-4), P(throat=1.0, pitch=-7),      # the tell: its throat swells to a ball
              P(open=1.0, tongue=1.0, sq=-0.15, pitch=6), P(open=1.0, tongue=0.6, pitch=3), P(open=0.5, tongue=0.15), P(throat=0.1)]
    hit = [P(sq=0.85, shut=True, fwd=-0.06)]
    die = [P(roll=70, shut=True, ext=0.3), P(roll=150, shut=True, ext=0.5), P(roll=180, shut=True, ext=0.6), P(roll=180, shut=True, ext=0.6)]
    return {'stand': {'frames': stand, 'delay': 220, 'loop': True},
            'move': {'frames': hop, 'delay': [80, 60, 90, 90, 60, 100], 'loop': True, 'stride': 40, 'note': 'one hop: it crouches (frame 1), is in the air in frames 2 to 5 (300 ms) and lands (frame 6); the hop is drawn for about 40 design units. It may stand still on frames 1 and 6 and travel only in the air'},
            'attack1': {'frames': attack, 'delay': [130, 150, 240, 70, 80, 80, 90], 'blow': 3, 'note': 'the wind-up is frames 1 to 3, 520 ms: its throat swells to a ball; the tongue lands on frame 4 and reaches 48 design units ahead of its origin'},
            'hit1': {'frames': hit, 'delay': 160}, 'die1': {'frames': die, 'delay': [90, 90, 140, 220], 'fade': 2}}

# ================================================================= the plum viper
VIPER = dict(crawl=None, sway=0.0, back=0.0, strike=0.0, open=0.0, tongue=0.0, droop=0.0, flat=0.0, shut=False, roll=0.0, fwd=0.0, jump=0.0)
def bez(a, b, c, d, n=7):
    out = []
    for i in range(n + 1): t = i / n; u = 1 - t; out.append(a * (u * u * u) + b * (3 * u * u * t) + c * (3 * u * t * t) + d * (t * t * t))
    return out
def viper(st, p):
    R = Rig(st); K = 1.18; fl = p['flat']; marks = bmesh.new(); body = bmesh.new()
    if p['crawl'] is None:      # coiled, the head lifted over the coil
        N = 30; pts = []
        for i in range(N + 1):
            t = i / N; a = math.radians(170 + t * 630); r = (0.25 - 0.09 * t) * (1 + 0.15 * fl); pts.append(V((math.cos(a) * r, 0.06 + math.sin(a) * r * 0.92, (0.07 + 0.15 * t) * (1 - 0.35 * fl))))
        E = pts[-1]; Hp = V((0.06 * math.sin(p['sway']), -0.07, 0.69)); Hp = mix(Hp, V((0, 0.12, 0.8)), p['back']); Hp = mix(Hp, V((0, -0.45, 0.34)), p['strike']); Hp = mix(Hp, V((0.16, -0.26, 0.2)), p['droop'])
        neck = bez(E, E + V((-0.04, -0.02, 0.24 * (1 - p['droop']))), Hp + V((0, 0.2 + 0.08 * p['back'], -0.08 + 0.12 * p['strike'])), Hp)
        tube(body, pts, 0, seg=12, rad=lambda t: 0.022 + 0.058 * min(1.0, t * 2.6)); tube(body, neck, 0.08, 0.072, seg=12)
        for i in range(6, N, 4): sph(marks, pts[i] + V((0, 0, 0.055)), 0.05, (1.1, 1.1, 0.5), seg=8)
        pitch = -12 * p['back'] + 30 * p['strike'] + 35 * p['droop']; yaw = 12 * math.sin(p['sway'])
    else:                       # stretched out and sliding: a wave runs down it from head to tail
        N = 26; pts = []
        for i in range(N + 1): t = i / N; pts.append(V((0.11 * math.sin(p['crawl'] - t * 9.0) * (0.3 + 0.7 * math.sin(math.pi * min(1.0, t * 1.4 + 0.15))), -0.3 + 0.95 * t, 0.075)))
        Hp = V((pts[0].x * 0.6, -0.4, 0.22)); neck = bez(pts[0], pts[0] + V((0, -0.08, 0.0)), Hp + V((0, 0.12, -0.1)), Hp, n=5)
        tube(body, pts, 0, seg=12, rad=lambda t: 0.078 * (1 - 0.72 * max(0.0, (t - 0.5) / 0.5) ** 1.5)); tube(body, neck, 0.078, 0.072, seg=12)
        for i in range(3, N - 4, 4): sph(marks, pts[i] + V((0, 0, 0.06)), 0.05, (1.1, 1.1, 0.5), seg=8)
        pitch = 8; yaw = 0
    R.mk(body, 'body', 'viper', remesh=0.011, soften=3)
    bm = bmesh.new(); tube(bm, [q + V((0, -0.05, -0.02)) for q in neck[2:-1]], 0.05, 0.05); R.mk(bm, 'belly', 'viperBelly')
    R.mk(marks, 'marks', 'viperDark', line=False)
    Hm = T(*Hp) @ D.rz(yaw) @ D.rx(pitch); o = p['open']
    bm = bmesh.new(); sph(bm, (0, -0.1, 0.012 * o), 1.0, (0.135, 0.17, 0.092), seg=20); R.mk(bm, 'head', 'viper', Hm, remesh=0.011, soften=2)
    if o > 0:
        bm = bmesh.new(); sph(bm, (0, -0.14, -0.035), 1.0, (0.1, 0.125, 0.02 + 0.035 * o), seg=12); R.mk(bm, 'mouth', 'mouth', Hm, line=False)
        bm = bmesh.new()
        for s in (-1, 1): cap(bm, (s * 0.055, -0.235, -0.02), (s * 0.055, -0.24, -0.02 - 0.06 * o), 0.014, 0.004, seg=6)
        R.mk(bm, 'fangs', 'white', Hm)
    bm = bmesh.new(); sph(bm, (0, -0.13, -0.04 - 0.055 * o), 1.0, (0.1, 0.125, 0.05), seg=14, rot=D.rx(-20 * o)); R.mk(bm, 'jaw', 'viperBelly', Hm)
    bm = bmesh.new(); sph(bm, (0, -0.05, 0.082), 0.05, (1.0, 1.4, 0.4), seg=8); R.mk(bm, 'crown', 'viperDark', Hm, line=False)
    if p['tongue'] > 0:
        bm = bmesh.new(); tube(bm, [V((0, -0.25, -0.02)), V((0, -0.25 - 0.09 * p['tongue'], -0.035))], 0.012, seg=6)
        for s in (-1, 1): tube(bm, [V((0, -0.25 - 0.09 * p['tongue'], -0.035)), V((s * 0.035, -0.3 - 0.09 * p['tongue'], -0.025))], 0.01, seg=6)
        R.mk(bm, 'tongue', 'tongue', Hm, line=False)
    R.balls([(-0.085, -0.18, 0.06), (0.085, -0.18, 0.06)], 0.052, Hm, 'viper', shut=p['shut'])
    bm = bmesh.new()
    for s in (-1, 1): cap(bm, (s * 0.025, -0.205, 0.1), (s * 0.15, -0.14, 0.145), 0.017, 0.014, seg=6)
    R.mk(bm, 'brows', 'viperDark', Hm, line=False)
    R.done(fall(p, 0.0) @ Matrix.Scale(K, 4)); return {'ref': (V((0, 0.06, 0.2)) * K, V((0, 0, 1)))}
def viper_clips():
    P = lambda **o: dict(VIPER, **o)
    stand = [P(sway=i / 4 * TAU, tongue=(1.0 if i == 1 else 0.5 if i == 2 else 0.0)) for i in range(4)]
    move = [P(crawl=i / 4 * TAU) for i in range(4)]
    attack = [P(back=0.4, open=0.2), P(back=0.8, open=0.6), P(back=1.0, open=1.0),      # the tell: the head pulls far back and up, the mouth opens
              P(strike=1.0, open=1.0), P(strike=0.85, open=0.6), P(strike=0.3, open=0.2)]
    hit = [P(flat=1.0, back=0.45, droop=0.32, shut=True, open=0.4)]
    die = [P(droop=0.3, flat=0.2, shut=True), P(droop=0.7, flat=0.6, shut=True), P(droop=1.0, flat=1.0, shut=True), P(droop=1.0, flat=1.0, shut=True)]
    return {'stand': {'frames': stand, 'delay': 200, 'loop': True},
            'move': {'frames': move, 'delay': 100, 'loop': True, 'stride': 30, 'note': 'it uncoils to slide: a wave runs down it; the coil is its standing and fighting shape'},
            'attack1': {'frames': attack, 'delay': [120, 130, 250, 60, 90, 100], 'blow': 3, 'note': 'the wind-up is frames 1 to 3, 500 ms: the head pulls far back and up with the mouth open; the strike lands on frame 4 and reaches 48 design units ahead of its origin'},
            'hit1': {'frames': hit, 'delay': 160}, 'die1': {'frames': die, 'delay': [90, 90, 140, 220], 'fade': 2}}

KINDS = {
    'palm-monkey': (monkey, monkey_clips, (288, 272, 144, 184)),
    'bristle-piglet': (piglet, piglet_clips, (256, 224, 128, 150)),
    'wharf-rat': (rat, rat_clips, (288, 240, 144, 156)),
    'frill-lizard': (lizard, lizard_clips, (320, 256, 160, 166)),
    'hop-toad': (toad, toad_clips, (288, 288, 144, 190)),
    'plum-viper': (viper, viper_clips, (320, 304, 160, 200)),
}
if __name__ == '__main__':
    a = D.args(); kind = a[0] if a else 'palm-monkey'; out = os.path.abspath(a[1]) if len(a) > 1 else os.path.join(HERE, '..', 'work', kind, 'render')
    only = a[2].split(',') if len(a) > 2 and a[2] != 'all' else None; quick = 'quick' in a
    build, clips, frame = KINDS[kind]
    D.render_clips(D.Stage(), kind, build, clips(), out, frame, facings=(('se', 45.0),) if quick else D.FACINGS, only=only)
