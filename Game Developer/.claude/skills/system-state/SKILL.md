---
name: system-state
description: Before changing any system of the game (the rules, the client, the server, the world, the protocol, art, sound, a page or test scene), read how it stands now in docs/state/<system>.md, and after the change update that file (what is true now, Robin's decisions marked as his). Use whenever a game system is worked on.
---

# How each system stands

`CLAUDE.md` keeps the direction, Robin's decisions and the rules of working. How each system is built now lives in
`docs\state\`, one file per system (its `README.md` lists them), so no session has to read everything to change one
thing.

1. Read the file for the system before changing it (search it for the function or name first), and `CLAUDE.md` for
   what else the change touches (the save's version, the protocol, the budgets).
2. After the change, write what is now true there, in the same voice: what it does, its numbers, whose decision
   (Robin's with the date, or "mine"). Remove what describes something gone; no dated paragraphs appended.
3. A change to how systems connect goes in `CLAUDE.md`. A change to the direction, Robin's decisions or the rules of
   working goes in `CLAUDE.md` or the brief.
4. A file that does not exist yet is created the day its system first exists.
