"""drok.py: what every model of Drok shares (Leonard, AD, 2026-11-20; the look is mine until Robin judges it).

The look: two flat chosen tones a colour (toon.py's cel, no highlight band, no grain) and one dark line, heavier round the
outside. The camera: the game's raised view, 35 degrees above the ground, looking north; figures are built facing the
camera (-Y) and turned for the other facings. The light comes from above and in front, never from a side, so the game's
flip of a facing does not show (Victor, GD, 2026-11-20: the game plays eight facings and flips three of the five drawn).

A figure is rebuilt from its joints for every frame: a pose is a dict of points, build(pose) makes the meshes and says
where the gear rides, and render_clips() turns every clip in every facing into frames and a meta.json for tools/pack.js.
  UNIT: design pixels a model unit (56: a figure one unit tall stands about 54 design pixels on the screen); PX: file pixels a design pixel (2)."""
import bpy, bmesh, sys, os, math, json, random
from mathutils import Vector, Matrix
HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path: sys.path.insert(0, HERE)
import toon
from figure import ik2

E = math.radians(35.0); SE, CE = math.sin(E), math.cos(E)
UNIT, PX = 56.0, 2
S = UNIT * PX                                   # file pixels a model unit
FACINGS = (('s', 0.0), ('se', 45.0), ('e', 90.0), ('ne', 135.0), ('n', 180.0))   # the turn about Z that takes a figure built facing -Y to each
INK = '#33203a'
toon.GRAIN_K = 0.0; toon.TONES = 'chosen'
toon.SUN_DIR = Vector((0.0, 0.42, -0.91)).normalized()      # the light travels down and away from the camera: it comes from above and in front

# ---------------------------------------------------------------- the colours: the base of each; toon.py takes its shade from it
HEX = {
    'skin': '#f4bf8e', 'hair': '#5a3622', 'eye': '#2a1814', 'white': '#fffaf0', 'linen': '#f6ecd0', 'trou': '#3d86b8', 'patch': '#c9a86a', 'rope': '#c9a063',
    'red': '#e9423a', 'navy': '#2b3f78', 'gold': '#f6c23a', 'steel': '#dbe6ee', 'iron': '#8e9aa8', 'rust': '#b9744a', 'brass': '#f2b63a', 'wood': '#c98646', 'woodHi': '#dba060', 'woodDark': '#96592e',
    'black': '#3a3040', 'feather': '#fff3e0', 'plume': '#e9423a', 'crab': '#f4603c', 'crabDark': '#d94a34', 'claw': '#fa7e50', 'coco': '#8a5a34', 'cocoDark': '#6a4226', 'cocoClaw': '#b97a45',
    'gull': '#fbf7ee', 'gullGrey': '#aeb9c8', 'beak': '#f6b03a', 'leg': '#f29a4a',
    'trunk': '#c98c4c', 'leaf': '#3fb95e', 'leaf2': '#73cf52', 'leaf3': '#2b9a58', 'nut': '#8a5628', 'rock': '#aab4cc', 'rockWarm': '#c9b6a0', 'pink': '#ff6a94', 'yellow': '#ffd640',
    'plaster': '#f7ead0', 'roof': '#e2553c', 'roofBlue': '#3d86b8', 'awning': '#ffd640', 'cloth': '#73cf52', 'glass': '#7fd6e6', 'stone': '#c2c7d2', 'sail': '#fbf3dc', 'rare': '#3d9cff',
}
_MATS = {}
def mat(name):
    """a material by its name in HEX: flat, the base and one shade"""
    if name not in _MATS:
        m = toon.material('m_' + name, HEX[name], style='cel'); m['matte'] = 1; m['t_dark'] = 0.34; toon.build_nodes(m, 'cel'); _MATS[name] = m
    return _MATS[name]

# ---------------------------------------------------------------- shapes (all into a bmesh; make() turns it into an object)
def sph(bm, c, r, s=(1, 1, 1), seg=20, rot=None):
    Mx = Matrix.Translation(Vector(c)) @ (rot or Matrix.Identity(4)) @ Matrix.Diagonal((s[0], s[1], s[2], 1.0))
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=max(6, seg // 2), radius=r, matrix=Mx)
def cap(bm, a, b, ra, rb, seg=14):
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
def plate(bm, pts):
    """a flat piece through points (a blade, a brim): one face, cut into triangles; make(..., solid=) gives it its thickness"""
    f = bm.faces.new([bm.verts.new(Vector(p)) for p in pts]); bmesh.ops.triangulate(bm, faces=[f])
def leaf(bm, base, dirxy, length, width, arch, droop, n=10, fold=0.3):
    d = Vector((dirxy[0], dirxy[1], 0)).normalized(); side = Vector((-d.y, d.x, 0)); rows = []
    for i in range(n + 1):
        t = i / n; p = Vector(base) + d * (length * t) + Vector((0, 0, arch * length * math.sin(math.pi * t) - droop * length * t * t)); w = width * length * math.sin(math.pi * (t ** 0.75)) + 0.004
        rows.append([bm.verts.new(p - side * w - Vector((0, 0, w * fold))), bm.verts.new(p), bm.verts.new(p + side * w - Vector((0, 0, w * fold)))])
    for i in range(n):
        for j in range(2): bm.faces.new((rows[i][j], rows[i][j + 1], rows[i + 1][j + 1], rows[i + 1][j]))
def mix(a, b, k): a = Vector(a); b = Vector(b); return a + (b - a) * k
def rx(deg): return Matrix.Rotation(math.radians(deg), 4, 'X')
def ry(deg): return Matrix.Rotation(math.radians(deg), 4, 'Y')
def rz(deg): return Matrix.Rotation(math.radians(deg), 4, 'Z')

class Stage:
    """one empty scene with the look's light, camera and line; root is what a figure hangs on and what the facings turn"""
    def __init__(self, line=0.56):
        bpy.ops.wm.read_factory_settings(use_empty=True); _MATS.clear()
        self.scene = bpy.context.scene; self.line = line
        toon.setup_render(self.scene, 256, PX); toon.world(self.scene); toon.sun('cel').data.use_shadow = False      # no cast shadows: a head must not throw a blot on its own chest
        self.noline = bpy.data.collections.new('NoLine'); self.scene.collection.children.link(self.noline)          # what the line leaves alone (eyes, glints, small marks)
        cd = bpy.data.cameras.new('Cam'); cd.type = 'ORTHO'; cd.clip_start = 0.1; cd.clip_end = 100
        self.cam = bpy.data.objects.new('Cam', cd); self.scene.collection.objects.link(self.cam); self.scene.camera = self.cam
        self.root = bpy.data.objects.new('Root', None); self.scene.collection.objects.link(self.root); self.objs = []
        self._fs_px = None
    def make(self, bm, name, material, smooth=True, remesh=0.0, soften=0, solid=0.0, at=None, rot=None, scale=None, line=True):
        me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
        for p in me.polygons: p.use_smooth = smooth
        o = bpy.data.objects.new(name, me); self.scene.collection.objects.link(o); me.materials.append(mat(material) if isinstance(material, str) else material)
        o.parent = self.root
        if not line: self.noline.objects.link(o)
        if at is not None: o.location = Vector(at)
        if rot is not None: o.rotation_euler = rot
        if scale is not None: o.scale = (scale, scale, scale) if isinstance(scale, (int, float)) else scale
        if remesh: md = o.modifiers.new('rm', 'REMESH'); md.mode = 'VOXEL'; md.voxel_size = remesh; md.use_smooth_shade = True    # one surface a garment, lit as one form
        if soften: md = o.modifiers.new('sm', 'SMOOTH'); md.factor = 0.5; md.iterations = soften
        if solid: md = o.modifiers.new('so', 'SOLIDIFY'); md.thickness = solid; md.offset = 0.0
        self.objs.append(o); return o
    def clear(self):
        for o in self.objs:
            me = o.data; bpy.data.objects.remove(o, do_unlink=True)
            if me and me.users == 0: bpy.data.meshes.remove(me)
        self.objs = []; self.root.rotation_euler = (0, 0, 0); self.root.location = (0, 0, 0)
    def frame(self, w, h, ox, oy, px=PX, unit=UNIT):
        """the picture: w by h file pixels, the model's origin on the ground at pixel (ox, oy)"""
        s = unit * px; ax = (w / 2 - ox) / s; ay = (oy - h / 2) / (s * SE)
        self.cam.location = (ax, ay - 30 * CE, 30 * SE); self.cam.rotation_euler = (math.pi / 2 - E, 0, 0); self.cam.data.ortho_scale = max(w, h) / s
        r = self.scene.render; r.resolution_x = w; r.resolution_y = h; self.w, self.h, self.ox, self.oy, self.s = w, h, ox, oy, s
        if self._fs_px != px:
            fs = toon.freestyle(self.scene, bpy.context.view_layer, px, style='cel', weight=self.line); toon.inner_at_colours(fs)
            for ls in fs.linesets: ls.linestyle.color = toon.srgb(INK); ls.select_by_collection = True; ls.collection = self.noline; ls.collection_negation = 'EXCLUSIVE'
            self._fs_px = px
    def shoot(self, path):
        self.scene.render.filepath = path; bpy.ops.render.render(write_still=True)
    def project(self, p, turn=0.0):
        """a point of the figure (before the facing's turn) as pixels from the frame's origin: x right, y down"""
        q = Matrix.Rotation(math.radians(turn), 3, 'Z') @ Vector(p); return (q.x * self.s, -(q.y * SE + q.z * CE) * self.s)
    def depth(self, p, turn=0.0):
        q = Matrix.Rotation(math.radians(turn), 3, 'Z') @ Vector(p); return q.y * CE - q.z * SE       # larger is further from the camera
    def point(self, p, d, ref, turn):
        """what the game needs to hang a piece: where (x, y from the origin), its turn in degrees clockwise from pointing up, and whether it is over the body"""
        x, y = self.project(p, turn); x2, y2 = self.project(Vector(p) + Vector(d).normalized() * 0.2, turn)
        return {'x': round(x, 1), 'y': round(y, 1), 'r': round(math.degrees(math.atan2(x2 - x, -(y2 - y))), 1), 'front': bool(self.depth(p, turn) <= self.depth(ref, turn) + 0.02)}

def render_clips(stage, name, build, clips, out, frame, facings=FACINGS, only=None, rest=None, relative=()):
    """build(stage, pose) -> points {name: (place, direction)} with 'ref' (a place inside the body) for what is over what.
    clips: {clip: {'frames': [pose...], 'delay': ms or [ms...], 'loop': bool, 'fade': n (the last n frames fade out)}}.
    rest and relative: the points named in relative carry their turn from the rest pose's (a hat and a buckler are pictures
    made on the rest pose, one for each facing, so they turn only by what the pose adds); the others carry it from pointing up.
    Writes <clip>_<facing>_<nn>.png and meta.json (the form tools/pack.js reads, with facing and points on every frame)."""
    os.makedirs(out, exist_ok=True); w, h, ox, oy = frame; stage.frame(w, h, ox, oy)
    meta_path = os.path.join(out, 'meta.json'); meta = {'origin': [ox, oy], 'size': [w, h], 'px': PX, 'unit': UNIT, 'actions': {}}
    if only and os.path.exists(meta_path): meta = json.load(open(meta_path, encoding='utf-8'))
    r0 = {}
    if rest is not None and relative:
        stage.clear(); p0 = build(stage, rest); ref0 = p0['ref'][0]
        for f, turn in facings: r0[f] = {k: stage.point(p0[k][0], p0[k][1], ref0, turn)['r'] for k in relative}
        meta['rest'] = {f: {k: stage.point(p0[k][0], p0[k][1], ref0, turn) for k in p0 if k != 'ref'} for f, turn in facings}
    for clip, C in clips.items():
        if only and clip not in only: continue
        n = len(C['frames']); delays = C['delay'] if isinstance(C['delay'], (list, tuple)) else [C['delay']] * n; fade = C.get('fade', 0)
        A = {'delay': delays[0], 'loop': bool(C.get('loop', False)), 'frames': []}
        for key in ('stride', 'blow', 'note'):
            if key in C: A[key] = C[key]
        per_facing = {f: [] for f, _ in facings}
        for i, pose in enumerate(C['frames']):
            stage.clear(); pts = build(stage, pose) or {}; ref = pts.get('ref', ((0, 0, 0.4), (0, 0, 1)))[0]
            for f, turn in facings:
                stage.root.rotation_euler = (0, 0, math.radians(turn)); file = '%s_%s_%02d.png' % (clip, f, i); stage.shoot(os.path.join(out, file))
                F = {'file': file, 'delay': delays[i], 'facing': f}
                P = {k: stage.point(p, d, ref, turn) for k, (p, d) in pts.items() if k != 'ref'}
                for k in relative:
                    if k in P: P[k]['r'] = round((P[k]['r'] - r0[f][k] + 180) % 360 - 180, 1)
                if P: F['points'] = P
                if fade and i >= n - fade: k = n - i; F['a0'] = int(255 * k / fade); F['a1'] = int(255 * (k - 1) / fade)
                per_facing[f].append(F)
        for f, _ in facings: A['frames'].extend(per_facing[f])
        meta['actions'][clip] = A; print('rendered', name, clip, n, 'frames in', len(facings), 'facings')
    json.dump(meta, open(meta_path, 'w', encoding='utf-8'), indent=1)
    return meta

def render_items(stage, items, out, frame, px=PX, unit=UNIT):
    """single pictures. items: [{'name', 'build': fn(stage) -> anchor point or None, 'turn': degrees about Z, 'tilt': True to lay
    the piece flat toward the camera (built standing in the XZ plane), 'frame': (w, h, ox, oy) if not the common one}].
    Writes <name>.png and meta.json: [{'name', 'file', 'origin': [x, y]}] with the anchor as the origin."""
    os.makedirs(out, exist_ok=True); recs = []
    for it in items:
        w, h, ox, oy = it.get('frame', frame); stage.frame(w, h, ox, oy, px, unit); stage.clear(); anchor = it['build'](stage)
        turn = it.get('turn', 0.0); stage.root.rotation_euler = (-E if it.get('tilt') else 0.0, 0, math.radians(turn))
        file = it['name'].replace('/', '_') + '.png'; stage.shoot(os.path.join(out, file)); o = [ox, oy]
        if anchor is not None and not it.get('tilt'): x, y = stage.project(anchor, turn); o = [round(ox + x, 1), round(oy + y, 1)]
        rec = {'name': it['name'], 'file': file, 'origin': o}
        for k in ('data',):
            if k in it: rec[k] = it[k]
        recs.append(rec); print('rendered', it['name'])
    json.dump({'px': px, 'unit': unit, 'items': recs}, open(os.path.join(out, 'meta.json'), 'w', encoding='utf-8'), indent=1)
    return recs

def args():
    return sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
