# How gear shows on the hero: the ways, and what each needs from the game

Leonard, AD, 2026-11-20, for open question 21 of the brief ("Drawn or modelled, and how gear shows on the hero").
Sent to Victor, GD the same day, before anything is recommended to Robin. Nothing here is decided. The numbers are
estimates of mine from the sizes below, not measurements.

## What we know

- One hero who lives for a long time and finds a lot of gear, with rare drops that matter (Robin, 2026-11-19).
- Seen from above "like Zelda" (Robin, 2026-11-19), on a phone, portrait, 412 by 915. So the hero is small: about 64
  CSS pixels tall is my starting guess. At that size a sword, a shield, a helmet and the colour and bulk of the armour
  can be read. Boots, gloves, a belt and rings cannot.
- Seen from above he turns. That means several facings of every frame: four (down, up, and one side the game flips, so
  three drawn) or eight (five drawn if the game flips, eight if not).
- It must work offline once installed (Robin, 2026-11-19). So every gear picture in the game is part of the install,
  even though only the worn ones are in memory.

## The sizes behind the numbers (mine)

- Files at 2x. The hero's body about 110 by 140 file pixels a frame after trimming.
- About 40 frames a facing for a Warrior: stand 6, walk 8, attack 8, a skill 8, hit 2, die 8.
- Decoded memory is width times height times 4 bytes, whatever the PNG weighs.
- So the body alone: 3 drawn facings about 7 MB decoded, 5 drawn about 12 MB, 8 drawn about 20 MB.

## The four ways

### 1. Colour only

One hero. Gear changes his colours and nothing else: the game tints him, or tints an armour layer apart from the skin.

- **The game needs:** a tint on one or two sprites. Nothing more.
- **Atlases and memory:** one or two, 12 to 25 MB decoded.
- **A new piece of gear costs:** no art.
- **Robin sees:** colours change, shapes never. A tint over grey goes flat (`rules.md` 11). The weakest for a loot game.

### 2. Stacked layers, every frame of every piece (Diablo 2 worked this way)

The body, and one atlas for each worn piece, all with the same frames, drawn on the same point at the feet.

- **The game needs:** a figure made of up to seven sprites that share one frame number; a table of the draw order for
  each facing, and for the weapon and shield for each frame (in front of the body, or behind); loading only what is
  worn and freeing what is taken off; perhaps baking the stack into one texture when the gear changes, so the hero is
  one draw again.
- **Atlases and memory:** the body about 12 MB, each worn piece 2 to 7 MB. Six pieces worn: 30 to 45 MB with five drawn
  facings, half as much again with eight.
- **A new piece of gear costs:** about 200 rendered frames, 100 to 400 KB on disk. Sixty looks is 6 to 24 MB of install.
  Only possible if the hero is modelled; nobody draws that by hand.
- **Robin sees:** every big piece, exactly right in every pose.

### 3. Small parts on a skeleton, posed by data (MapleStory works this way)

The game holds the poses and builds the hero each frame from about fourteen small part pictures. A gear piece is one
small picture for each view.

- **The game needs:** a drawer that places 14 to 20 small sprites a frame from a pose table (each part's place, turn and
  order, for every clip, frame and facing: about 150 KB of data); swapping a part's picture.
- **Atlases and memory:** one small atlas, under 3 MB for everything worn.
- **A new piece of gear costs:** three or five small pictures, 5 to 20 KB.
- **Robin sees:** every piece. But seen from above, arms and legs point at the camera, and flat parts cannot shorten.
  It reads as a paper doll (`rules.md` 1, 7, 28). It suits a side view with one facing. I do not think it suits this one.

### 4. A whole body, with the stiff pieces riding on it (Zelda's sword and shield, taken further)

The body with its armour is one set of frames, as in way 2. The stiff things are not frames at all: the weapon, the
shield and the helmet (a cloak or shoulders if wanted) are each a few small pictures per facing. The body's data
carries marked points for every frame (the hand, the other hand, the head, the back: where it is, how it is turned,
in front or behind), and the game places the small pictures there.

- **The game needs:** one body sprite and up to four small sprites placed from the frame's data; one body atlas loaded
  at a time; small item atlases loaded when worn.
- **Atlases and memory:** the body 12 to 20 MB, everything held under 1 MB.
- **A new piece of gear costs:** a weapon, shield or helmet is a small model or drawing turned to 8 or 16 angles, 10 to
  40 KB. Hundreds are affordable. A new armour look is a full body set, 300 to 600 KB, so there are few of them (my
  guess: six to ten over the whole game), with colour changes between.
- **Robin sees:** every weapon, shield and helmet as its own shape; the armour as a handful of looks. Boots, gloves and
  rings show in the bag only. A rare drop can carry a glow in its rarity's colour, drawn by the game.

## Drawn or modelled

- **Modelled** (built by a script in Blender, rendered to sprites: `3d-to-sprites.md`) is where I lean. A figure that
  turns needs every frame three to eight times, and a model gives them all from one source, in one light. Ways 2 and 4
  both want it. The hero's face is a few pixels from above, so the thing drawing does best is not needed here.
- **Drawn** (in code on `tools\rig.js`) wins for one facing flipped by the game. Here it means drawing every figure
  three or five times over. It stays right for the ground, the props, the interface and the icons.
- The look Robin picks can change this: an inked storybook look pulls toward drawing, a painted or solid look toward
  models. That is why question 20 comes first.

## Where I lean (mine, not yet put to Robin)

Way 4, modelled: the pieces a player can read at this size each get their own shape, and a rare sword costs kilobytes,
so the game can hold as many as the design wants. Way 2 if Robin wants every big piece to show exactly.

## What Robin's picks of 2026-11-20 add

All in the brief.

- The theme is vibrant pirate, and the Warrior fights with cutlass and buckler. So the stiff pieces are the cutlass,
  the buckler, and a hat or a bandana rather than a helmet; the body looks are coats, sashes and breastplates. Nothing
  in the four ways changes.
- The hero is a nobody who makes a name. Gear is how that shows, so it matters more here than in most games that he
  looks different at level 30 than at level 1.
- Gear has sets. A set fits way 4 well: a set is a whole-body look, and wearing the full set is when the look shows.
- Gear has rarities. One colour for each, used for the glow on a drop on the ground, on the piece in the bag and on
  the hero's weapon.

## What Robin picked (Robin, 2026-11-20, in the Art Director's chat)

His picks from choice boxes; the choices were written by Leonard, AD.

- **"The big pieces"**: "Every cutlass, buckler and hat has its own shape. Coats and armour come in a handful of looks,
  and a full set shows as its own look. Boots, gloves and rings show only in the bag." That is way 4. He did not pick
  "Everything" (way 2) or "Little".
- **"No glow on the hero"**: "The rarity colour shows only on the ground and in the bag." So a rare cutlass must look
  rare by its shape and colour alone.
- For the look he picked "Clean line, flat colour". A model rendered with a flat cel finish (flat colour, one shade,
  an ink outline) gives that in every facing, so my lean toward modelled stands. Still to settle with Victor, GD.

## What I asked Victor, GD

1. How many facings will the game play, four or eight, and will it flip the side ones? (Flipping swaps the sword hand,
   as in Zelda, and moves a light that comes from one side.)
2. Will the game draw at the phone's own pixels, as Zite did with its `hires.ts`? The canvas is 412 by 915 today, so 2x
   files would be scaled down and up again.
3. What may the hero cost in decoded memory, and a whole hunting ground with its monsters, on the weakest phone?
4. Is placing small sprites on per-frame points from the atlas data (way 4) fine for the game, or is stacking whole
   layers (way 2) simpler for him?
5. Is there a ceiling on the install's art, since all of it ships?
