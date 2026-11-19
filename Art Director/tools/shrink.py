"""Shrinks the PNGs of a delivery for the phone (Perry, AD, 2026-10-31; Robin: the art must stay small on the phone, unlike
the Survival game's): every PNG under a folder is quantised to a 255-colour palette with its transparency kept (what pngquant
does; PIL here), which cuts a painted sprite's file to about a third with no visible change at phone size. Prints the before
and after sizes. Run it on out/<name>/ after packing; the originals in work/ stay untouched. Not for glows, fades or soft
gradients: those band under additive blending, so they stay RGBA (skip them with --skip glow,burst).

  python tools/shrink.py <folder> [--colors 255] [--skip name,name] [--dry]"""
import os, sys
from PIL import Image
args = sys.argv[1:]; folder = args[0]; colors = int(args[args.index('--colors') + 1]) if '--colors' in args else 255; dry = '--dry' in args
skip = args[args.index('--skip') + 1].split(',') if '--skip' in args else []
before = after = 0; n = 0
for root, _, files in os.walk(folder):
    for f in files:
        if not f.lower().endswith('.png'): continue
        if any(s and s in f for s in skip): continue
        p = os.path.join(root, f); b = os.path.getsize(p); before += b
        im = Image.open(p)
        if im.mode == 'P': after += b; continue
        im = im.convert('RGBA'); q = im.quantize(colors=colors, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
        if not dry: q.save(p, optimize=True)
        a = os.path.getsize(p) if not dry else b; after += a; n += 1
print('%d files: %.1f MB -> %.1f MB' % (n, before / 1e6, after / 1e6))
