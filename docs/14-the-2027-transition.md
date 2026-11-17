# The 2027 transition

*Facts in this chapter reviewed 16 November 2026. The rest of the system was compiled in August 2026.*

MLS is in the middle of the largest structural change in its history. Any brand or product work done now will outlive the current season vocabulary, so this chapter exists to keep the rest of the system from going stale silently.

**Design consequence up front: the crest is not changing.** The "new era" language attaches entirely to the calendar and competition format. MLS is reframing meaning, not redrawing marks. Everything in chapters 02 through 07 survives this.

---

## The decision

Approved by the **MLS Board of Governors on 13 November 2025**. The league is moving from a spring-to-fall calendar to a **summer-to-spring** one, aligning with the world's top leagues.

> Calendar shift is one of the most important decisions in our history. Aligning our schedule with the world's top leagues will strengthen our clubs' global competitiveness.

## 2026 — unchanged

The 2026 season runs on the legacy spring-to-fall calendar, with a mid-season break for the World Cup. Play resumed 16–17 July 2026.

## 2027 MLS Sprint Season — the bridge

This is the official name and it is now controlled vocabulary. Announced 19 March 2026; schedule released **29 October 2026**.

- **Window:** February to May 2027, inclusive of playoffs and MLS Cup
- **Opening weekend:** **19 February 2027**, Inter Miami CF v FC Cincinnati first, then thirteen more matches across the Saturday and Sunday
- **Decision Day 2027:** **8 May 2027**, the close of the regular season
- **Regular season:** 14 matches — 7 home, 7 away, conference opponents only, each once
- **Playoffs:** top 8 per conference, 16 clubs, single-elimination bracket per conference
- **Hosting:** every playoff match including MLS Cup is hosted by the club higher in the final 2027 Supporters' Shield standings
- **Final:** East champion v West champion, **2027 MLS Cup presented by Audi**, **Memorial Day weekend**, May 2027. The round-by-round postseason schedule is still to be announced
- **Supporters' Shield: retained**, awarded on best overall regular-season record, governing home-field advantage throughout and carrying a Concacaf Champions Cup berth

MLS's own framing: *"fast-paced, high-stakes"*, where *"every game has high stakes"*, under the banner **"A New Era for Major League Soccer."**

## 2027–28 onward — the steady state

- Regular season kicks off **mid-to-late July 2027**
- Concludes with **Audi MLS Cup Playoffs and MLS Cup presented by Audi in late May 2028**
- **34-match** regular season retained
- **Winter break:** play pauses mid-December, no matches in January, resumes February
- MLS states **91%** of matches fall inside the current season window despite the flip
- The league says it is introducing *"a new regular season format that blends elements of the global game with North American sports traditions"* and will review potential adjustments to the playoff format
- **The two-non-league-competitions cap is gone.** Reported 2 September 2026: MLS has lifted the rule limiting a club to two non-league competitions per season. All **27 US-based clubs** enter the **2027 U.S. Open Cup**, first round July 2027, immediately before the 2027–28 season opens, alongside Leagues Cup and Concacaf Champions Cup participation. The three Canadian clubs remain ineligible for the Open Cup and continue in the Canadian Championship

### Qualification off the Sprint Season

- **2028 Concacaf Champions Cup (5–6 berths):** MLS Cup winner, Supporters' Shield winner, both conference regular-season winners, then next-best by Shield standings
- **2028 Leagues Cup:** top 9 per conference (18 clubs)
- **2028 U.S. Open Cup:** format to be announced by U.S. Soccer. US-based club participation is no longer capped — see the cap change above
- **2028 Canadian Championship:** all three Canadian clubs continue

---

## Reported but NOT confirmed

Multiple outlets report that 2027–28 will replace the Eastern/Western conference structure with **five geographic divisions of six clubs** and a **single league table** (10 divisional matches + 24 others = 34).

**MLS's own November 2025 release does not mention divisions, a divisional format, a single league table, or the elimination of conferences at all.** However, the incoming commissioner referred on 4 August 2026 to *"the new playoffs, the new divisions"* as settled matters.

**Treat as strongly expected but not officially announced. Do not state division names or alignments — those are speculative in every source.**

Practical consequence for anyone building now: **do not hard-code "Eastern" and "Western" as the only possible groupings.** `data/clubs.json` carries a `conference` field per club; if divisions arrive, that field changes and the standings component should not need rewriting to accommodate it.

### Vancouver relocation — open

A Las Vegas investor group's formal offer to buy the **Vancouver Whitecaps** and relocate the club reached the league office on 30 April 2026 and is **unresolved as of November 2026**. Any sale and move needs an MLS Board of Governors vote and a negotiated relocation fee; local business and provincial efforts to keep the club in Vancouver are active, and the league has signalled a preference for a Vancouver solution. No vote has been scheduled and nothing is decided.

This is the live risk to club data — not expansion. Treat club name, market and tricode as values, never as constants: `data/clubs.json` is the single source for all three, and the Whitecaps entry is the most exposed row in the file.

---

## Leadership

**Don Garber** — commissioner since 1999, through the end of 2026, a 27-year tenure. Becomes **Chairman in 2027**.

**Larry Berg** — announced 3 August 2026, formally introduced 4 August. **Effective as commissioner 1 January 2027.** MLS's third commissioner. Co-Managing Owner of LAFC; Co-Chair of MLS's Sporting and Competition Committee; three decades in private equity; previously held ownership stakes in AS Roma and Swansea City.

His stated priorities, from the official announcement and his first press remarks:

> I'm honored to lead Major League Soccer into its next era. Thanks to the vision and commitment of so many people, Major League Soccer has achieved tremendous success, but I believe our greatest opportunities are still ahead.

> We have an extraordinary opportunity to strengthen the quality of our competition, develop more world-class players, deepen our connection with supporters, and continue elevating Major League Soccer's place in the global game.

> Simply put, the foundation has been built. Now it's our responsibility to build on it.

> Obviously the foundation's terrific but I think it all starts with quality on the field.

> Youth development in MLS is very near and dear to my heart. I feel like we have the clay, we've built the foundation.

> It's about finding media partners that want to co-create the future with us.

Note the tonal continuity with [08 Voice](08-voice-and-tone.md): foundation acknowledged, standing treated as unfinished. Same posture as the outgoing commissioner, different specifics.

**He has said nothing publicly about brand, crest or visual identity.** If a brand refresh is coming, there is no public signal of it yet.

---

## What goes stale, and when

| Section | Risk | Trigger |
|---|---|---|
| Roster figures in [09 Vocabulary](09-vocabulary.md) | **High** — annual | Every January |
| "Regular Season", offseason and transfer-window vocabulary | **High** | July 2027 |
| Playoff round names | **Medium** | Format review, TBA |
| Eastern/Western conference structure | **Medium** | If the divisional restructure is confirmed |
| Club count | **Low** — no expansion announced | New club award |
| Club identity and market in `data/clubs.json` | **Medium** | Vancouver relocation bid, live and unresolved — needs a Board of Governors vote |
| Crest, colour, typography, devices | **Low** | No signal of a refresh |
| Voice, vocabulary, editorial style | **Low** | Stable across the transition |

Build products so the seasonal vocabulary is swappable. Chapters 01 through 07 and 08 through 12 are the durable core.
