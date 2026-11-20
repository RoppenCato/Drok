"""people.py: the people of the harbour, who stand (Leonard, AD, 2026-11-20; the designs are mine).
They share the Warrior's body (hero.py) and its breath, each with their own colours and one thing that makes their
outline theirs: the shopkeeper's apron and bald head, the harbour master's tricorn and beard, the fisherwoman's long
dress and headscarf, the old sailor's cap and white whiskers. They give the hunting tasks (Robin, 2026-11-20: "light
quests", a few people who speak in short lines), so each must be told from the others at a glance.
One atlas, `folk`: the action is who it is (shopkeeper, master, fisher, sailor), four frames of standing, in s, se and e.
  node tools/blender.js blender/people.py -- work/folk/render"""
import sys, os, math
HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path: sys.path.insert(0, HERE)
import bmesh
from mathutils import Vector, Matrix
import drok as D, hero, gear
from drok import sph, cap, box, cyl

D.HEX.update({'apron': '#fffaf0', 'green': '#4fae6a', 'grey': '#c9ccd6', 'dress': '#e9507a', 'scarf': '#ffd640', 'tan': '#e2a878', 'dark': '#b9785a', 'cap': '#3d86b8', 'ginger': '#c9652a', 'whisker': '#f1efe8', 'straw': '#e8cc78', 'swampCoat': '#4f8a66'})
WHO = {
    'shopkeeper': dict(look=dict(shirt='green', trou='woodDark', hair='hair', belt='apron', skin='tan'), rh=(-0.2, -0.2, 0.42), lh=(0.2, -0.2, 0.42)),
    'master': dict(look=dict(shirt='navy', trou='white', hair='grey', belt='gold'), rh=(-0.24, -0.03, 0.34), lh=(0.16, -0.16, 0.44)),
    'fisher': dict(look=dict(shirt='dress', trou='dress', hair='ginger', belt='scarf'), rh=(-0.22, -0.1, 0.4), lh=(0.22, -0.1, 0.4)),
    'sailor': dict(look=dict(shirt='linen', trou='navy', hair='whisker', belt='red', skin='dark'), rh=(-0.24, -0.02, 0.33), lh=(0.24, -0.02, 0.33)),
    # the swamp's trader (Victor, GD, 2026-11-20: the camp on the second island has a stall): a wide straw hat, a long moss-green coat, a pack
    'trader': dict(look=dict(shirt='swampCoat', trou='woodDark', hair='whisker', belt='rope', skin='tan'), rh=(-0.22, -0.14, 0.42), lh=(0.22, -0.14, 0.42)),
}
def builder(who):
    W = WHO[who]
    def build(st, p):
        p = dict(p); p['look'] = W['look']; pts = hero.build(st, p); T, pel, head, HR = hero.frame_of(p); Hm = Matrix.Translation(head) @ HR; R = hero.HEAD_R
        def mk(bm, name, m, M=None, **kw):
            o = st.make(bm, name, m, **kw)
            if M is not None: o.matrix_local = M
            return o
        if who == 'shopkeeper':       # a round belly under a white apron; bald on top, a moustache
            bm = bmesh.new(); sph(bm, pel + Vector((0, -0.06, 0.1)), 0.19, (1.0, 0.8, 1.0), seg=20); mk(bm, 'belly', 'green', remesh=0.01, soften=4)
            bm = bmesh.new(); sph(bm, pel + Vector((0, -0.105, 0.04)), 0.19, (0.9, 0.62, 1.2), seg=20); mk(bm, 'apron', 'apron', remesh=0.01, soften=4)
            bm = bmesh.new(); sph(bm, (0, -0.02, 0.07), R + 0.004, (1, 0.96, 0.9), seg=24); mk(bm, 'pate', 'tan', M=Hm, line=False)
            bm = bmesh.new()
            for s in (-1, 1): cap(bm, (s * 0.01, -0.215, -0.075), (s * 0.1, -0.19, -0.1), 0.03, 0.016, seg=8)
            mk(bm, 'moustache', 'hair', M=Hm)
        elif who == 'master':         # a tricorn, a grey beard, gold buttons
            gear.hat('tricorn', Hm)(st)
            bm = bmesh.new(); sph(bm, (0, -0.15, -0.13), 0.13, (1.1, 0.7, 1.0), seg=16); mk(bm, 'beard', 'grey', M=Hm, remesh=0.012, soften=2)
            bm = bmesh.new()
            for z in (0.26, 0.19, 0.12): sph(bm, pel + (T @ Vector((0.04, -0.135, z))), 0.02, seg=8)
            mk(bm, 'buttons', 'gold', line=False)
        elif who == 'fisher':         # a long dress to the ankles, a yellow headscarf, a ginger plait
            bm = bmesh.new(); cyl(bm, pel + Vector((0, 0, -0.13)), 0.24, 0.3, r2=0.15, seg=20); mk(bm, 'skirt', 'dress', remesh=0.012, soften=3)
            bm = bmesh.new(); sph(bm, (0, 0, 0), R + 0.02, (1, 0.96, 0.95), seg=28)
            bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], dist=1e-5, plane_co=(0, 0, 0.06), plane_no=(0, 0.25, 1), clear_inner=True); sph(bm, (0, 0.2, 0.03), 0.06, seg=10); mk(bm, 'scarf', 'scarf', M=Hm)
            bm = bmesh.new(); cap(bm, (0.05, 0.19, -0.03), (0.09, 0.2, -0.32), 0.05, 0.03, seg=10); mk(bm, 'plait', 'ginger', M=Hm)
        elif who == 'trader':         # a wide straw hat, a long coat, a pack on his back
            bm = bmesh.new(); cyl(bm, (0, 0, 0.19), 0.36, 0.2, r2=0.03, seg=20); mk(bm, 'hat', 'straw', M=Hm)
            bm = bmesh.new(); cyl(bm, pel + Vector((0, 0, -0.1)), 0.23, 0.32, r2=0.16, seg=20); mk(bm, 'coat', 'swampCoat', remesh=0.012, soften=3)
            bm = bmesh.new(); sph(bm, pel + (T @ Vector((0, 0.17, 0.2))), 0.14, (1.1, 0.8, 1.2), seg=14); mk(bm, 'pack', 'rope')
        else:                         # a blue cap, white whiskers, a red neckerchief
            bm = bmesh.new(); sph(bm, (0, 0, 0), R + 0.02, (1, 0.96, 0.95), seg=28)
            bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], dist=1e-5, plane_co=(0, 0, 0.11), plane_no=(0, 0.1, 1), clear_inner=True); cyl(bm, (0, -0.19, 0.115), 0.1, 0.025, seg=14); mk(bm, 'cap', 'cap', M=Hm)
            bm = bmesh.new()
            for s in (-1, 1): sph(bm, (s * 0.13, -0.12, -0.1), 0.075, (1, 0.8, 1.1), seg=12)
            mk(bm, 'whiskers', 'whisker', M=Hm, remesh=0.012, soften=2)
            bm = bmesh.new(); sph(bm, pel + (T @ Vector((0, -0.07, 0.3))), 0.09, (1.2, 1.0, 0.6), seg=12); mk(bm, 'kerchief', 'red')
        return {'ref': pts['ref'], 'head': pts['head']}
    return build
def stand(who, i, n=4):
    s = math.sin(i / n * math.tau); W = WHO[who]; rh, lh = W['rh'], W['lh']
    return hero.pose(bob=0.005 * s, rh=(rh[0], rh[1], rh[2] + 0.006 * s), lh=(lh[0], lh[1], lh[2] + 0.006 * s), nod=1.5 * s)
if __name__ == '__main__':
    a = D.args(); out = os.path.abspath(a[0]) if a else os.path.join(HERE, '..', 'work', 'folk', 'render'); st = D.Stage(); facings = tuple(f for f in D.FACINGS if f[0] in ('s', 'se', 'e'))
    import json
    names = a[1].split(',') if len(a) > 1 else [w for w in WHO if w != 'trader']      # the harbour's four unless names are given (the swamp's trader is rendered on his own)
    for who in names:
        D.render_clips(st, 'folk', builder(who), {who: {'frames': [stand(who, i) for i in range(4)], 'delay': 180, 'loop': True}}, out, hero.FRAME, facings=facings, only=[who] if os.path.exists(os.path.join(out, 'meta.json')) else None)
