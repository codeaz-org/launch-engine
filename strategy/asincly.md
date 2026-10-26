# Asincly strategy state

Living file. The engine reads it every run; the Analyst rewrites the scoreboard weekly.
Start date of the launch kit: 2026-10-26 (week 1).

## Baseline
- Signups (orgs created) before launch: 0. Active users: 0.
- Attribution: first-touch UTM saved on the organization at onboarding (pending Asincly PR),
  read through the stats endpoint by the Analyst.

## Launch calendar (from the brief; the engine adapts it to data)
| Week | Dates | Focus |
|---|---|---|
| 1 | 10-26 to 11-01 | Foundations: positioning, guides route + attribution live, launch video, first LinkedIn posts, directory copy |
| 2 | 11-02 to 11-08 | Launch: Show HN, directories, launch video everywhere, "how we built it" (DEV/Hashnode) |
| 3 | 11-09 to 11-15 | Scout + replies live: 3-5 approved replies/day |
| 4 | 11-16 to 11-22 | Weekly video series + 2 guides/week |
| 5 | 11-23 to 11-29 | Product Hunt with what worked |
| 6 | 11-30 to 12-06 | Review; keep what brought users; add rescue.codeaz.org |

## Scoreboard (Analyst updates)
| Channel | Status | Items shipped | Visits | Orgs created | Active orgs | Since |
|---|---|---|---|---|---|---|
| (unattributed) | n/a | n/a | n/a | 1 | 1 | pre-launch |
| linkedin | explore | 0 live (2 scheduled in Buffer: 10-28, 10-30; video PR #14 merged for 10-29) | n/a | 0 | 0 | 2026-10-23 |
| seo | explore | 0 (guides asincly#21, #22 drafted, not confirmed live) | n/a | 0 | 0 | 2026-10-23 |
| hackernews | explore | 0 (draft approved, post week 2) | n/a | 0 | 0 | 2026-10-23 |
| directories | explore | 0 (copy approved, owner submits) | n/a | 0 | 0 | 2026-10-23 |
| reddit, dev, hashnode, instagram, tiktok | explore | 0 | n/a | 0 | 0 | 2026-10-23 |

Stats 2026-10-25 (api/stats): orgs 1, orgs_7d 0, orgs_28d 1, active_users_7d 1, check_ins_7d 2.
Only row in bySource is source null (the 1 org, active). Same as 2026-10-23; likely the owner's test org.
Visits are not measured (first-party stats count orgs only).

## Beliefs and experiments
Each experiment: id, channel, hypothesis, what counts as success, end date.
- E1 seo: "geekbot alternative" + "async standup across time zones" guides bring organic signups within 4 weeks.
- E2 hackernews: Show HN with the open-source + self-host angle brings the first 10 orgs.
- E3 linkedin: time-zone pain stories from the maker get more clicks than feature posts.
- E4 reddit: genuinely helpful answers in r/remotework and r/EngineeringManagers bring signups at low volume.
- E5 directories: AlternativeTo + awesome-selfhosted listings bring steady trickle of self-host + cloud users.

## Decisions log
- 2026-10-23: Analytics = first-party attribution in Asincly (no third-party script, fits the
  privacy positioning; Umami free has no API, PostHog adds cookies/consent). Revisit if we
  need visit-level funnels.
- 2026-10-23: Positioning wedge = async standups across time zones (product + site already say it).
- 2026-10-23: Maker face/name optional; prefer faceless screen-recorded demos and "I'm the maker" text disclosure.
- 2026-10-23 (Analyst): week 0, nothing published, no channel has data. No kill-rule action.
  E1-E5 stay open; first real read is the 2026-11-06 scoreboard.
- 2026-10-25 (Analyst): still nothing live. Stats unchanged (0 attributed orgs). Kill-rule clock has not started for any channel. E1-E5 stay open.
