# Techniques: what the craft guides and the forums teach

Condensed from the Survival game's and the board world game's studios (2026). Each item says where it came from; what
it meant in practice is marked **In practice**. Reddit cannot be read from the studio (it blocks the search tool and
the browser), so the practitioner threads are from Blender Artists, Polycount, Blender Stack Exchange and the Klei
forums. The lessons we learnt ourselves are in `docs\rules.md`.

## 1. Readability (what makes a sprite read in a game)

From the Dota 2 character art guide (Valve; the one everyone cites), RocketBrush on shape language, and Bugnet on
readable game art.

- **Silhouette first.** A character is identifiable at a glance, and the silhouette shows which way it faces. Role
  shows in shape: wide and blocky with a low centre for the heavy, sharp and leaning for the fast, round and upright
  for the gentle. If a thing only reads by its colour, its shape is too weak.
- **The three reads.** Far: the silhouette alone. Middle: the big colour blocks. Close: detail, only where it
  strengthens the first two. Detail is a spending decision: spend it on the face, the gear, the one thing of the beast.
- **Value gradient.** Lightest values high on the body, toward the face and the hands; darker toward the feet, so the
  figure stands on the ground and the eye goes to the head. Saturation belongs to the focal point.
- **States change shape, not just colour.** A charging enemy shifts its outline (windup, scale, spikes): shape reads
  through chaos, tint does not. **In practice:** every windup is a different silhouette from the walk at a quarter size.
- **Value is most readability problems.** A background in the actors' mid-tones swallows them; push it back in value
  and saturation first. A lit side separates a figure more than any outline.
- **The tests:** grey (does it still read?), distance (shrink to a quarter), motion (play the clip), low light (the
  night scene), blockout (the roles distinct before any detail), and the finished thing against its first silhouette,
  to catch over-complication.
- The "70 percent silhouette, 30 percent detail" rule goes round unsourced. Folklore that happens to be right.

## 2. Drawn sprites

From the board world game's own work and the pixel artists on Polycount.

- **A good model is not a good sprite.** A sprite wants a darker tone of its own colour at the edge instead of black,
  fewer colours, flatter planes, one shade.
- **One facing, flipped by the game**, halves the work and the memory; anything with a baked shadow or a lettered side
  is the exception and is never flipped.
- **Thumbnails first.** Bauer composed whole pictures at stamp size before one picture; the same habit finds a weak
  silhouette before any detail is spent.
- **An even outline with flat colour inside** (Bilibin's way) prints and scales cleanly; two values and pattern
  (Nielsen) read at any size; a pen line then a wash (Rackham) gives a wobble that feels alive. Pick one hand for the
  whole game and name it in `docs\direction.md`.
- **A figure in parts on a skeleton** (a paper doll): the parts are drawn once in one view, placed on pivots at the
  joints, and every frame is the same parts posed, so the character never flickers and equipment shows. Decide the view
  (side, three-quarter), the layer order (far arm, body, near arm, held thing, hand) and the grips before drawing a
  part. The board world game's rig is the model.
- **Harden the edges and shrink to a palette PNG** at delivery: a painted sprite's file drops to a third with no visible
  change at phone size. Glows and soft gradients stay RGBA, or they band.

## 3. Sprites rendered from a model

From Blender Artists ("Quality of rendered sprites", "2D sprites with 3D Blender?"), Polycount (pre-rendered
sprites with changing gear; "Convincing 3D that looks like 2D"), the Pre Render Creator and Sprite Render Kit notes,
and GameFromScratch's sprite tutorial. The pipeline itself is `docs\3d-to-sprites.md`.

- **One fixed light in the world; turn the model, not the sun.** The lit side is then always the same side of the
  frame whatever the character faces, as a drawn sprite's would be.
- **Small, hard lights.** Big soft lights wash out the forms; a sun with angle 0 gives the hard cel step. **In
  practice:** check the sun is strong enough to cross the step at all; ours was not for weeks.
- **Render larger, scale down with a smooth filter.** A pixel filter width of 0.7 to 1.0 is sharper than 1.4; render at
  twice the final size and halve.
- **Outlines: the silhouette in ink.** Freestyle in the render (a calligraphy modifier for thick and thin, the same
  crease angle on every model) or an inverted hull (a Solidify modifier with negative thickness and backface culling:
  cheap, never misses an edge, no thick-thin). Keep the models' line and the drawn props' line at the same weight at
  game scale.
- **Layers by mattes.** Render the body as an invisible holdout and the weapon normally, so the game stacks body and
  gear; the hard part is hand placement differing per weapon. Separate passes for legs and upper body halve the frames
  when many upper-body clips share one walk.
- **Fewer frames where nobody looks.** The idle at a lower rate, the hit at few frames, fewer directions for small
  things. Sheet weight is the real cost, not render time.
- **PNG between steps, never JPEG.** A PNG optimiser after.
- **Normal maps rendered beside the colour** let a game light sprites by a moving light at run time (Dead Cells,
  Graveyard Keeper); useless on a 2D canvas without shaders, worth knowing if drawing ever moves to WebGL.
- **The hybrid** (pose a model, trace a line from it, shade by hand; BlazBlue) gives more character and no
  reproducibility.

## 4. The hand-drawn look in a render

From the Blender Artists NPR threads, the Blender Nation EEVEE NPR note, the NPR Shader Kit documentation, and the
Blender manual on Freestyle.

- **Shader to RGB into a constant Color Ramp** is the standard cel: the diffuse value cut into two or three bands, the
  shadow band its own colour (the base times a cool tint), never the base darkened. EEVEE only; never Cycles.
- **Watercolour:** noise in the light value so the band's edge is uneven; a mottle multiplied into the fill; pigment
  pooling at the edges by a Layer Weight; a paper texture over the composite.
- **The line on its own pass** (Freestyle "as render pass") lets the compositor recolour or soften it without
  re-rendering.
- **Hatching** in the shadow band by a Wave texture mixed in Linear Light (Don't Starve's shadows).
- **Colour management Standard, not Filmic or AgX**, or the chosen colours shift.
- **Film transparent; render the figure alone.** The contact shadow is the game's job, since it knows the hour.
- A face as a painted decal on the head; a full ball of hair fights the face, so cut it away at the front; hair in front
  of the eyes hides them.

## 5. Animating four-legged beasts

From Cathy Feraday Miller's "Animating four-legged beasts" and "A quick guide to animating animals" (Game Developer),
Toon Boom's four-legged walk module, Animation Mentor, and Muybridge's plates (public domain).

- **Footfall.** Walk: left hind, left fore, right hind, right fore (a four-beat, three feet always down). Gallop: the
  rotary order (left hind, right hind, right fore, left fore) is what most animals do in footage; the diagonal twist it
  gives the spine is what makes a running dog look like a running dog.
- **The body is two bouncing balls** (hips and chest, a quarter cycle apart) **and the head a third**, following with
  overlap. Spine shape is what makes a cat not a horse; a gallop's speed comes from how far the spine gathers.
- **Keys:** four main keys (two stride, two passing), symmetrical or the animal limps; feet on arcs, never straight
  lines in the air; flat tangents stall the motion at the top. A slow walk about 40 frames; a gallop 12 to 16.
- **Order of work:** legs first as a plain gait, then body bounce, head, tail last, toes and ears after. Reuse one base
  cycle across similar bodies and adjust for shape.
- **Reference:** Muybridge's walk, trot and gallop plates, side on and end on. Watch footage at quarter speed; a biped's
  timing on a dog looks wrong at once.

## 6. Two-legged motion

From the Survival game's measurements (2026-10-21) and Mixamo's clips.

- **Idles breathe at 8 to 12 frames a second**; at 4 a breath reads as stepping. The idle is the largest clip in memory,
  so cut each frame to its own pixels rather than cut frames.
- **A walk's stride must match the game's speed**, or the feet slide (the moonwalk). The game picks the frame by
  distance; the studio makes the stride long enough that the cadence stays natural at the game's speeds.
- **Hips lead, then chest, head and hair.** A walk from pure maths with a still torso reads as robotic.
- **A dash is a lean**, the body pitched forward about 25 degrees, the head low, the arms swept back, the back leg
  driving; not a squashed walk.
- Long motion-capture clips thinned to few frames look laggy; pick the frames by pose, not by count.

## 7. Lighting and night

Graveyard Keeper's shadow sprites turned toward each light; a light behind a thing leaving it dark with a lit rim; fog
in height layers; colour tables by hour; Factorio's night as a colder palette, not a black sheet; the painters' rule of
warm light, cool shadow, a rim only on the edges that face the fire.

## Sources

Readability: the Dota 2 Workshop Character Art Guide (Valve, PDF via Steam support); RocketBrush, "Shape language in
game character design"; Bugnet, "Readable game art: why clarity beats detail". Sprites from Blender: Blender Artists
threads 1156814 and 344080; Polycount threads 165034, 69360, 121144; the Pre Render Creator FAQ; the Sprite Render Kit
(blurymind); GameFromScratch, "Easy sprite art in Blender"; Blender Nation, "Technique to create pre-rendered sprites in
Blender" (Linko, 2018). NPR: Blender Artists thread 1103124; Blender Nation, "EEVEE NPR, Blender 2.8 Code Quest"; the
NPR Shader Kit docs; the Blender manual on Freestyle line thickness. Animals: Game Developer (Cathy Feraday Miller);
Toon Boom Learn; School of Motion's walk cycle reference list. Dead Cells: coverage of Thomas Vasseur's pipeline. The
illustrators: the Nationalmuseum on Bauer; the published pictures of Rackham, Bilibin and Nielsen.
