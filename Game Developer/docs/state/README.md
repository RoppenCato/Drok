# How each system stands

`CLAUDE.md` keeps the direction, Robin's decisions and the rules of working. How each system is built now lives here,
one file per system, so no session has to read everything to change one thing. A file is created the day its system
first exists; the first two exist from the setup.

| File | What it covers |
| --- | --- |
| `rules.md` | the game's rules: the state's shape, the actions and their events, the data files and their numbers, the save's version and migrations; its tests |
| `client.md` | the screen: scenes or pages, the input, the sizes, the frame log and error log, the settings, the build |
| `server.md` | (when there is one) each actor, the database, accounts, the save, the tunnel |
| `protocol.md` | (when there is a server) every message between client and server: name, fields, who sends it, when; the snapshot and its version |
| `world.md` | (when the world is generated) seeds, regions, what is static and what is live |
| `art.md` | what art is in the game, where it lives, how it is drawn, the atlas or sheet form, the budgets |
| `sound.md` | what music and sounds are in the game, where they live, when they play, the budgets |
| `pages.md` | every page, test scene, editor and tool the browser pane can open, with its URL and what it is for |

The rules (the skill `system-state`):

1. Read the file for the system before changing it (search it for the function or name first), and `CLAUDE.md` for
   what else the change touches.
2. After the change, write what is now true there, in the same voice: what it does, its numbers, whose decision
   (Robin's with the date, or "mine"). Remove what describes something gone; no dated paragraphs appended.
3. A change to how systems connect goes in the map in `CLAUDE.md`. A change to the direction, Robin's decisions or the
   rules of working goes in `CLAUDE.md` or the brief.
