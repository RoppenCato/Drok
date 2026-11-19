---
name: playtest-check
description: Check a change the way this game is checked: the tests and the code checks, the browser pane at the judging size with the sound off, a screenshot into the chat, and the exact words for Robin on how to try it on his device. Use after any change to the screen or the rules, before a commit, and whenever Robin says "check it", "does it work", "test it".
---

# Checking a change

The levels are in `docs\tests.md`; the judging size and the links in `docs\platform.md`.

1. **Headless**: `npm test` (the rules, the purity test); `npm run typecheck` or the parse and duplicate checks. Green
   before anything else. When the game has bots, run them when a number changed.
2. **The pane**: show the pane first (a hidden pane does not render); the judging size (the phone preset, or Robin's
   computer size); open the page with `?mute=1`; drive it (the starter's `window.dev` or `?drive=1`) rather than
   clicking where you can; a screenshot cropped at full size; the console read for errors; a tool call into the page
   under about 45 seconds. Reset the viewport after.
3. **Into the chat**: the screenshot with SendUserFile and one line on what it shows.
4. **For Robin**: the link (the LAN link for a phone, the local page or the public site), the screen, what to tap or
   press, what he should see, and what you could not test. Never reload a page he is playing on; a pane save is not
   his.
5. **Then**: `docs\state\` updated for the system touched; the commit with what and why; push.

A fault Robin reports: ask which link and what he sees (or a picture), test that link and the live site before
changing anything, and say what you found in plain words.

**Every round of Robin's play goes into `docs\playtests.md`** (Robin, 2026-11-04): his notes word for word, then a
table of note, found, done, rule. A number he says "works well" to becomes a felt number in `docs\lessons.md`. Answer
him with the same table in the chat, one report for all his notes, then what to check next time in the order he will
meet things.
