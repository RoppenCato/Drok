# The pattern for a set of sounds written from one spec: every source gets the same header, kit and variation loop,
# and a change to the kit or the loop reaches every sound at once. Copy this file to sfx/<category>/_make.py, fill in
# the sounds, run `python -I sfx/<category>/_make.py`, then render each source (docs/pipeline.md: the queue does all of
# them). The bodies are Sonic Pi code calling the layers of sfx/_kit.rb; `r` is the variation's rate nudge (plus or
# minus 5 %), `v` the variation number (0, 1, 2), so three renders of one sound are the same tool, not the same file.
import os
HERE = os.path.dirname(os.path.abspath(__file__))
KIT = r"C:\dev\Drok\Sound Director\sfx\_kit.rb"          # loaded in single quotes below, so the backslashes stay

S = {}
def snd(name, desc, gap, body, cut=116):
    """name: the file and the game's name for it; desc: one line for the header; gap: seconds between variations
    (the whole sound must fit in it, tail and all); body: the layer calls; cut: the plain low-pass over everything."""
    S[name] = (desc, gap, body, cut)

# ---- the sounds: two examples, to be replaced -----------------------------------------------------------------
snd("hit_light", "a light hit on flesh: the skin's slap first, a short body under it, a thin slice of noise after", 1.2, """
  slap 1.6 * r, 0.6
  flesh 1.5 * r, 0.85, 0.12
  slice 108, 0.35, 0.06
  grains 2, 98, 0.12""")
snd("knock_wood", "a small hard object on wood (a die, a chip): a bright knock, almost no body, no weight", 1.0, """
  snd :perc_door, 2.2 * r, 0.9, 0.05
  snd :elec_wood, 1.4 * r, 0.35, 0.03
  grains 2, 96, 0.08, 0.012, 0.01""", 124)

TEMPLATE = """# %(name)s: %(desc)s.
# Written by sfx/<category>/_make.py; change it there, not here. Layers from sfx/_kit.rb (docs/sfx-notes.md): samples
# and noise only in a strike, no room tail.
# name: %(name)s
# seconds: %(secs).1f
# count: 3

use_bpm 60                                  # times in seconds
eval File.read('%(kit)s')

define :one do |v|
  use_random_seed %(seed)d + v
  r = 1 + rrand(-0.05, 0.05)
  with_fx :lpf, cutoff: %(cut)d do%(body)s
  end
end

3.times do |v|
  one v
  sleep %(gap).1f
end
"""
for k, (name, (desc, gap, body, cut)) in enumerate(S.items()):
    body = body.replace("\n  ", "\n    ")
    src = TEMPLATE % dict(name=name, desc=desc, secs=3 * gap + 0.5, seed=700 + 10 * k, cut=cut, body=body, gap=gap, kit=KIT)
    with open(os.path.join(HERE, name + ".rb"), "w", encoding="utf-8") as f:
        f.write(src)
print(len(S), "sources written:", " ".join(S))
