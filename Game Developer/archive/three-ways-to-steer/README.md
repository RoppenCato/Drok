# The three ways to steer (the control test), put away 2026-11-20

**What**: `controls.ts` as it was while the game had three ways to steer on a switch in the settings (Robin,
2026-11-19: "three control schemes for me to try on my phone, so I can pick by feel"): 1 Tap, 2 Hold (he walks
towards a held finger), 3 Stick (a stick where the thumb comes down).

**Why it is here**: Robin played and answered with none of the three alone (2026-11-20): "click to move is good, but
there needs to be a simple wqy to also move freely", "both available at the same time". The game now has one way: a
tap and a stick together (`client\src\controls.ts`). Tap and Stick live on in it. **Hold is gone from the game**,
and this file is the only place its code is kept: the dead zone of 14 units under the finger and the push that
grows to full over the next 40.

**What went with it** and is not kept here, since git has it (the commit before this folder appeared): the `scheme`
in the rules' state and its action, the "Steering" row in the settings, the three help lines.

**To bring Hold back**, should Robin ask for "walk towards my finger": the `hold` function here still fits; it only
sends `steer`, which the rules take as before. It is not compiled: this folder is outside the TypeScript project.
