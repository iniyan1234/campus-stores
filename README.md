# Campus Stores: my work sample

**Roll number:** ME23B170
**What I changed:** `app.js` only. The change is on the Loan register, Requests and Inventory screens.
**To see it:** run `python3 -m http.server 8000 --bind 127.0.0.1`, open `http://localhost:8000`, click **Restart sample shift**, and follow the walkthrough below.

## What I did on the shift

1. Read request RQ-214 and the Desk book, then issued the projector (PR-04), speaker (SP-02) and adapter (AD-12) to Kabir Sen.
2. At 7:30 pm, recorded the return of the projector and speaker. Kabir's Desk book message said Leela Das still had the adapter and would bring it at 9 am.
3. Left a handover note naming AD-12 and Leela.
4. On Saturday at 9 am, Leela arrived with the adapter. I closed the AD-12 slip.

## One moment the product handles well

**The issue form stops the desk handing out the wrong thing.** After issuing an item to a community, other communities cannot get the same thing until it is returned. For example, I tried issuing PR-04 projector to Kabir Sen and after issuing it, the item vanishes from the list of other items when I go for a new slip. 

The form also only lists units that can really leave, so units in repair or already on loan never appear. The desk can't over-issue, and nobody has to remember the approved quantity.

## One moment I would change

**On Saturday I closed the adapter slip with nothing on screen to check it against.**

Kabir's slip said "Kabir Sen, due Fri 8 pm". The fact that mattered, that Leela held the adapter and would bring it at 9 am, sat only in a free-text Desk book message. That message didn't say which of the two adapters (AD-12 or AD-15) was out. When Leela arrived, I closed the slip as AD-12, and the app confirmed it. I was confident only because I had written "AD-12" in my own handover note. If Leela had held AD-15, the app would have accepted the wrong closure just as readily.

Three smaller things come from the same cause:
- At 7:30 pm the app gave me no way to record "still out, with Leela, back at 9 am" except free text.
- The slip never showed as late, even though it was due Friday 8 pm.
- Inventory showed AD-12 as "On loan" with no holder.

## My change

A slip now records **where the unit is and when it is due back**, and returning a unit asks you to **confirm the label on the item in your hands**.

- **Record return** opens a short panel: *Where is this unit right now?*
  - **It is at the desk:** pick the unit label from the item in front of you. If it doesn't match the slip, the slip stays open and the message names the mismatch, and the other slip if the label belongs to one.
  - **Still out with someone:** pick *Currently with* and *Expected back*. The slip stays open and updates.
- The **Loan register** shows `With Leela Das · Expected Sat 9 am (was Fri 8 pm)` and an **Overdue** badge when a slip is past its expected time.
- The **Requests** screen shows where each approved item is now, with a summary such as `2 of 3 returned · 1 still out`.
- **Inventory** shows who has each unit that is on loan.

I did not add live scanning, notifications or new roles. This is the smallest change that puts the missing fact on the slip.

## The same job with the change

1. **Fri 3:45 pm:** Issue PR-04, SP-02 and AD-12 to Kabir, as before. The Requests screen shows `0 of 3 returned · 3 still out`.
2. **Fri 7:30 pm:** On the projector and speaker slips, choose *It is at the desk* and pick the label on each unit. On the adapter slip, choose *Still out with someone*, then *Leela Das* and *Sat 9 am*. The request now shows `2 of 3 returned · 1 still out`, and the register row reads `With Leela Das · Expected Sat 9 am (was Fri 8 pm)`.
3. **Sat 9 am:** The register shows the adapter slip as open and not overdue. Leela hands over the adapter. Choose *It is at the desk*, then pick the label on it. If it reads AD-15, the app refuses and names AD-12. If it reads AD-12, the slip closes. I never need the Desk book to do this.

## What I would keep

- One slip per physical unit.
- The issue-form checks for units that are in repair, already on loan, outside the request, or over the approved quantity.
- The Desk book for messages from clubs and general handover notes. It stays as the place for context, and the slip now carries the facts the next shift must act on.

## One observation at a real counter

At the counter, count how often a returned item is matched to its slip by asking someone or by reading free-text notes, over a few busy shifts. If the change helped, that count goes down, and so does the number of slips closed against the wrong unit. I would also note how long the morning shift takes to close a slip that was handed over overnight.

## Limits of this prototype

- The "Currently with" list is the sample's five people. A real desk needs free text or a student lookup.
- Overdue is judged against the sample's shift clock (Friday 3:45 pm, Friday 7:30 pm, Saturday 9 am), not a real calendar.
- Matching the label depends on the person actually reading it. The app can check what they pick but not what they hold.
