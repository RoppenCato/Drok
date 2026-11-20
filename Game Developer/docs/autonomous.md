# What the Game Developer may do alone

Robin, 2026-11-04 (the template): a list the Game Developer works through on his own in a long session, while Robin is
away or asleep, asking the Art and Sound Directors for what is needed as he goes. Robin, 2026-11-20, his pick for
Drok: anything on the chapter's checklist that needs no decision of his: build, test, ask the studios, commit each
item, report in the morning. The rules first, then the list.

## The rules of a session alone

1. Only items that need no decision of Robin's: a build, a fix, a test, a check, a doc, a request to a studio, a
   stand-in. Never a design change, a felt number set as final, a pick between concepts or songs, an install, a
   deploy, a cost, or anything that touches his save or his page.
2. One item at a time, in the order below. Tests, the typecheck, and the pane at the judging size before the commit. A
   commit per item, pushed. An item that fails twice is left with a note and the next is taken.
3. The studios are asked with the form in `requests.md`; a stand-in goes in the game meanwhile; a drop that lands during
   the session is copied in and committed.
4. Everything learnt goes where it belongs at once: a bug into a test, an idea into `idea-bank.md`, a mistake into
   `lessons.md`, a changed system into `docs\state\`.
5. The session ends with the morning report (the form in `requests.md`): done, asked, checked, waits for Robin, found,
   next. Robin's usage rule holds: at 90% of the weekly limit, switch to Opus.

## The list (kept current; from `plan-chapter-1.md`, the items that need no decision of his)

Robin, 2026-11-20: "work through the list until you are done... I dont need to approve or answer any questions until
you are done." The game side of chapter 1 (items 1 to 11 of the plan) was built in that session. What is left that
needs no decision of his:

- `[ ]` Each drop from Leonard, AD: copy the folder whole into `client\public\art\<name>\`, wire it in the place of
  its stand-in, check it in the pane at 412 by 915, update `docs\state\art.md`, commit. All of wave 1 is in
  (2026-11-20). Still to come from him when asked: a coat on the body; whatever Robin's judging changes.
- `[ ]` Load the pictures by place: only the place he is in, its monsters and the glass in memory; the other place
  and the chart loaded when he opens the chart or sails, and let go when he leaves. Today all of it is loaded at
  the start, about 62 MB decoded, over the 48 MB set for a place (`docs\art-demands.md`). Before a third place.
- `[ ]` The audio layer (mute, volumes, the sprite's map) when Hugh, SD's first sprite lands; `docs\state\sound.md`.
- `[ ]` A longer balance run: the bot on ten seeds, with a clumsier player as well (no slam dodging, late potions),
  printing falls and time for each level, so Robin's first numbers have a range to sit in.
- `[x]` Things that cannot be walked through, with a way round them for a tap: done 2026-11-20 with Leonard, AD's
  island (`docs\state\rules.md`, "The ground"). The harbour's houses get the same when his harbour lands.

## Never alone

- Which of the three ways to steer stays, and its felt numbers (the walk's speed, the dead zones).
- Cleave or Whirlwind; which hand is the default; the share lost on death; the levels of the job advancements.
- The look and the music picks; anything in Leonard, AD's or Hugh, SD's folder.
- The deploy to Cloudflare Pages (his login) and starting Hugh, SD's chat (his word).
- His save and his page: never reloaded, never overwritten.

## The last report

2026-11-20 (chapter 1 with all of wave 1's art): the game side built and tested, Leonard, AD's whole wave 1 wired
in (the Warrior, gear, monsters, island, loot, glass, the harbour town, the sea chart, the icon), 95 tests, pushed.
The plan's "Waits for Robin" is the list: play it and judge the look; pick a way to steer; the deploy to
Cloudflare Pages; start Hugh, SD's chat in the desktop app; the felt numbers; the smaller open points in the brief.
