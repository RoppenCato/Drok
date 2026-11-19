# What we learnt about making game art

Numbered so a note can point at one. From Robin's Survival game (Colin, AD, 2026), his board world game Zite (Perry, AD
and Mitch, AD, 2026) and FapleGlory (Harold, AD, 2026). Each lesson carries its why, because the why is what carries to the next game. Robin's words are
quoted; they were exact descriptions every time.

## Construction

1. **A better finish on a doll is still a doll.** Figures made of balls and tubes read as mannequins however well they
   are shaded; Robin called them "wooden dolls". Fix the construction and the proportion: one body, posed with weight,
   hair and cloth as mass. If the shape is wrong, stop polishing.
2. **One form, one line.** A hero painted as separate parts "doesn't look one form; arms and legs are still their own
   parts". Paint each unit as fills first, then one silhouette line round the whole, with only a few inner edges.
3. **Every part faces the same way.** A frontal face on a three-quarter head, a side-on arm on a frontal torso: Robin
   saw it at once. Choose one view (a three-quarter turn worked) and build every part in it; draw a construction
   overlay to prove it.
4. **Eyes are not copies.** A far eye that is the near eye pasted again reads as "two left eyes". Mirror it about the
   face's centre line; in a three-quarter view the far eye is narrower and both look the same way.
5. **A new creature on an old rig is a variant.** "Looks like you just took one of the trolls we already have and
   changed it a bit." A new thing needs its own silhouette and its own way of moving. One shared eye and face
   construction across a cast is different: that keeps them in one hand.
6. **Silhouette first, detail second.** It must read at a quarter size in grey and show which way it faces. Detail goes
   on the face and the gear; hair is a jagged outline, not strands. A pose changes the shape, not only the colour.
7. **Code-drawn characters hit a ceiling, and generated sheets flicker.** Shapes drawn in code read as a doll of parts
   however much anatomy is added: fine for props, ground and planes, not for a hero's face. A sheet made by an image
   tool looks right but no two frames agree, and no anchoring makes them one character. What worked: one skeleton with
   slots, inked parts drawn from its points plus painted parts placed on pivots. Every frame is the same skeleton, so
   nothing flickers, and worn equipment shows in every clip.
8. **Limbs come from the rig, never per frame.** Fixed bone lengths, one solver, joints at the torso's edges, a clear
   near-and-far layer rule, poses by what is held, a hand that follows the forearm. Robin: fix it "at the rig and
   character-construction level", not in the pictures.
9. **Decide wrists and grips before a set.** Without hand bones a weapon just continues the forearm, and every held
   thing looked wrong; weapons at rest hung through the ground. Draw a held thing with its grip at its origin and its
   length along one axis so it turns about the hand; each item says which hand holds it, what it covers, its layer.
10. **A settled proportion stays settled.** Robin tried three leaner heroes and kept the chunky one: "the others look
    too slim and weird proportions." And when he says "stop redesigning, correct the existing", make local corrections
    only.

## Colour and light

11. **Formula colours go grey.** A shader working light and shade out from one base colour gave 6 to 17 percent
    saturation. The thing Robin loved measured as three chosen colours per material, about 40 percent saturated, about
    15 lightness points apart. Choose the tones; when he loves one thing, measure why and copy that.
12. **Check the light reaches the model.** Too weak a sun and every character rendered in its shadow tone for weeks.
    Show a lit side. Shadows cooler than the light, never the same hue darkened. No pure black, no pure white.
13. **Light the whole form once.** Each part lit on its own looks lumpy; in 3D, take normals from a smoothed copy.
14. **Value causes most readability trouble.** A background in the actors' mid-tones swallows them. Push it back in
    value and saturation before adding outline. Near bright and edged, far pale and soft.
15. **Nothing saturated but what may burn.** One hot accent; the rest sits muted round it.
16. **Robin's taste, as a starting guess only.** A flat pastel look was "a bit of a mobile game" that "lacks character";
    he loved saturated, cartoon-like, chosen tones and big simple shapes, and disliked the greyed look of a formula. Ask
    anyway, with pictures.

## Fitting into the scene

17. **The sticker fault.** "The trees look pasted on like stickers": a heavy dark line round a soft thing on a lineless
    ground is a cut-out edge. Props get a thinner, coloured line; figures keep the heavy one so they stand out. Add a
    cast shadow and something at the foot.
18. **What belongs to the ground is painted with the ground.** Sample its colours. For a piece set into a wall, fade its
    sides and let the game's own rim run across.
19. **Judge at his size, in the real scene.** Small sheets on a neutral background hid blur and line faults more than
    once. Crop the full-size picture; put the thing beside the player on its own background.
20. **Things on one grid match its camera.** Pieces at one tilt on a ground at another never line up. Tiled pieces
    carry no outline ring (a seam at every join), and every ground tile shares one base colour at its edges.
21. **Nothing stamped.** Regular repetition reads as "robotic" to Robin: identical plates, spines, stepped motion. Every
    repeat its own size, lean and place; richness is many small pieces in clusters. No perfect circles on a map.
22. **The fighters' band stays quiet.** The backdrop Robin chose: the fighters stand on the place's own ground, the way
    runs back to the place's landmark, sky a third of the band at most, far and mid paler with distance, framing only at
    the screen's sides, nothing tall near a fighter, one thin strip drifting and nothing else. Apply the same idea to
    every place.
23. **Check depth order early.** On one altar the fix was the draw order, not the art; Robin's "stairs" on a pier were
    stacked pieces. Test separate pieces at several positions.
24. **Measure the game's real bounds.** A placement laid out from the docs' width stood props past the map's edge.
25. **A shadow baked into a piece means the piece is never flipped**, or the sun moves.

## Thin and small things

26. **Thin things ink to black.** Roots, spines, grass blades and deep-cut ferns became sticks and saws. Give them mass,
    make them part of the outline, or cut them. Robin hates thin black sticks.
27. **Small things vanish, and real size can be too small.** Berries inside a clump disappear: put them on the upper
    front face. Life-size bushes looked knee high and grew by a third.
28. **Faces edge-on disappear under a fixed camera.** A tent with its ridge across the view was a flat rectangle; an arm
    aimed at the camera a stump. Turn long things to show their length.
29. **Things read as other things.** Sucker centres as eyes, water rods as icicles, moss balls as bubbles, a wreath at
    the hairline as eyes. Look at the result as a stranger would.

## Animation

30. **The moonwalk.** An in-place walk played by the clock slides when the stride and the game's speed disagree.
    Measure the stride and let the game pick the frame by distance moved; planted feet then lock.
31. **Too exact is robotic.** A walk rebuilt by maths felt "a little robotic... the torso isn't moving at all". Keep hip
    turn, sway and overlap: hips lead, then chest, head and hair.
32. **Idles at 4 frames a second look laggy.** A breath in four steps reads as stepping; aim for 8 to 12. Never trim an
    idle to fit memory; cut each frame to its own pixels instead. Crossfading frames looked "drunken".
33. **Calm over frantic.** An eight-pose dodge was "too stressful" and lost to a simple squash. A dash is a lean (body
    pitched forward, head low, arms back), not a stretched walk.
34. **For a fast one-shot move, try a small lean held longer first.** Show slowed and real speed side by side.
35. **Watch the frame's edges.** Blades got cut off; big deaths need their own larger frame; a fall sank half into the
    ground until its frames were widened.
36. **The windup is the tell, `hit1` the most exaggerated pose.** Attached parts follow late; feet stay at one height
    unless the thing leaves the ground; the feet are the origin of every frame, so nothing drifts.
37. **Play clips at the real delays.** A row of frames can look fine and still jitter from a moving origin. The same
    head on every walk frame keeps a face from flickering.

## Process

38. **One still first.** Words and written review lists did not converge: every round moved proportion, construction
    and style to answer the last note. Agree the look on one finished picture before anything moves.
39. **Concepts must really differ.** A recombination is not a new vision. Rejected all round: ask for references; a
    board of real pictures and two of Robin's own got us there the same day.
40. **Picks need pictures, numbered.** Robin answered "What?" to a list of names. One page, a picture and a number each.
41. **Take him literally and measure it.** "Pasted on like stickers", "a midget", "two left eyes" each pointed straight
    at the fault.
42. **Averages can lie.** Numbers that match a reference can still look wrong. Measure, then trust the eye at size.
43. **Say exactly which files changed.** A packer rewrote every sheet while five were listed; copying five would have
    broken the game. Deliver the whole folder and list what changed.
44. **Keep files small.** Soft keyed edges doubled an atlas; harden edges and shrink to a palette PNG at delivery.
    Glows and soft gradients stay RGBA: a palette glow banded under additive blending. Nine-slice pieces are drawn
    narrow. A boss is drawn narrow, because a fight leaves little room beside the hero.
45. **Don't ask about everything.** "From now on you don't have to ask on everything unless I specifically tell you
    to." Do the work and show it. If he asks for a plan to confirm, show it and stop. More, not new: when he asks for
    more of a thing, keep the screen he likes and name any redesign as a choice first.
46. **Write his decisions with the date and his words; don't reopen them.** Mark your own choices "mine".

## What the game does at runtime

47. **Find out how Robin runs the game.** Played from disk (file://), reading pixels from a loaded picture throws, and
    a per-pixel effect that worked on localhost broke the real game. Compositing only: drawImage, fills, blend modes,
    an edge from a picture minus itself shifted.
48. **No per-frame blur or filter on the main canvas.** It took Robin to 40 fps in a house. Blur once into a kept canvas
    and draw that. Never read the canvas back in the loop; never make a pattern from a picture every frame; bake once.
49. **Memory counts more than file size.** A boar decoded to 51 MB; a 2048-square atlas is 16 MB decoded whatever the
    PNG weighs. Trim every frame, fewer directions for small things, free a region's kits when the player leaves it.
50. **New layers may need registering**, nine-slices need their corners in data, and a canvas drawing at 1x on a 2x
    screen halves the art's detail. Check in the running game, not only in the studio's pictures.

## Faces

51. **One view per figure, and the face follows the body.** A three-quarter face on a side-on body, or a frontal face on
    a three-quarter head, is what Robin called "all weird" in Zite and again in FapleGlory's first stills (2026-11-04).
    Turn the whole figure the same way: the face's centre line, the collar, the buckle, the arms and the feet all agree
    on one turn. The construction Robin approved in Zite (Mitch, AD, 2026-11-01), measured on a head of radius 22:
    the face's centre line at +0.55 of the head's radius toward the way it faces; the nose and the mouth on that line;
    the eye line just below the head's middle; the near eye wide (about 11.6 by 12.8) on the viewer's side of the line,
    the far eye beyond it close to the silhouette's edge and NARROWER, not smaller (about 7.2 wide, the same height), its
    outer end tipping down where the head curves away; both pupils looking the way it faces. Each eye a white almond
    with a coloured iris, a big dark pupil, one highlight, a heavy upper-lid line, a thin lower lid, a soft shadow under
    the lid, a light brow above in the hair's shade; moods come from the lid and the brow, not the eye's shape. Never
    two copies of one eye ("two left eyes"), never two ovals stuck on, never the near eye the smaller one. The mouth a
    short tapered smile about a quarter of the head's width, centred on the line well below the nose, never tiny.
    Cheeks soft flattened blushes under the eyes at about a quarter alpha, the far one smaller, never dots. Creatures
    take the same eye construction as the hero, scaled to their head; small features high on a body read as huge.
    Judge the face at the game's size beside the player on the real background, never from a big sheet; make the face by
    this construction before the first still, and show it at one, three and five times with the centre and eye lines
    drawn on.

52. **A figure with limbs is built on the rig, from the first still.** FapleGlory's mage was posed by hand in the
    concept stills and Robin saw it at once: "you need to get the rigging of the characters arms and legs correct. Are
    there any templates?" There is one: `tools\rig.js` (from Zite's hybrid rig). One skeleton of named joints; two bones
    of fixed length per limb; a solver that places the elbow (bent back and down) or the knee (bent forward) from where
    the hand or the foot goes, and holds a hand asked beyond the bones' reach at their full length; a limb drawn as one
    smooth shape round its three joints; the hand a mitt at the forearm's end; a held thing gripped at its origin and
    turned with the hand; a clip a list of poses, the walk and the breath from one formula. The rules it keeps: one
    view for the whole figure, the near limbs in front; a raised weapon rises beside the head on the near side, never
    across the face; the feet are the origin of every frame; nothing changes length between poses. Robin, on the first
    rigged mage: "Yeah thats a lot better." Judge the clips on the moving page at real delays before the layers are
    split for gear.

## Drawn or modelled?

**Drawing wins** for a flat 2D game with one facing flipped by the game, for props, the interface, faces and anything
with a big simple face, and whenever Robin asks for "simple". It is cheap to change and lives in small files.
**Sprites rendered from Blender win** when a thing needs many directions, when a whole cast must share one light and one
line, for 2.5D under a fixed camera angle, and for big clip sets from motion capture (Mixamo). Models built by scripts
and never hand-edited can be rebuilt by anyone; one shared look file re-renders everything the same way. The two mix: a
rendered body with drawn faces and props, or drawn parts on a rigged skeleton. The pipeline, and the fuller account of
when to model and when to draw, is `docs\3d-to-sprites.md`.
