"""icon.py: the Warrior's head and shoulders, big, for the app's icon (Leonard, AD, 2026-11-20; the design is mine).
The same model and line as in the game, six times the size, in his red head cloth. tools/icon.js puts it on its ground.
  node tools/blender.js blender/icon.py -- work/icon"""
import sys, os, math
HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path: sys.path.insert(0, HERE)
from mathutils import Matrix
import drok as D, hero, gear

if __name__ == '__main__':
    a = D.args(); out = os.path.abspath(a[0]) if a else os.path.join(HERE, '..', 'work', 'icon'); os.makedirs(out, exist_ok=True)
    st = D.Stage(); st.frame(512, 512, 256, 690, px=6, unit=116)
    p = hero.pose(nod=-2, rh=(-0.3, 0.02, 0.36), lh=(0.3, 0.02, 0.36)); hero.build(st, p); T, pel, head, HR = hero.frame_of(p); gear.hat('bandana', Matrix.Translation(head) @ HR)(st)
    st.root.rotation_euler = (0, 0, math.radians(20)); st.shoot(os.path.join(out, 'head.png')); print('rendered the icon head')
