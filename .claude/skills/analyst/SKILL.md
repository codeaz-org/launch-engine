---
name: analyst
description: "Weekly scoreboard for the codeaz Launch Engine: real signups and active users per channel, what to stop, what to do more of next week. Use on Sundays (scheduled task) or when asked for 'the scoreboard', 'what worked', 'weekly report'."
---

# Analyst run

Metric that matters: organizations created and active (checked in within 7 days), per
first-touch channel. Likes, views and stars are context only.

## Inputs
1. Per app: stats endpoint from `apps/<app>.yaml` (`analytics.stats_url`), called with
   `Authorization: Bearer $<APP>_STATS_TOKEN` (network secret). Returns aggregate counts
   only. If missing or failing, say so; never guess numbers.
2. `git show origin/state:published/log.jsonl`: what shipped, where, when.
3. `git show origin/state:metrics/latest.json` if present (Buffer post metrics).
4. Merged vs closed draft PRs this week (`gh pr list --state all --label draft --search "updated:>=<date-7d>"`):
   closed-unmerged = owner rejected; learn from it.

## Output
1. Update the scoreboard table and experiments in `strategy/<app>.md` (result, keep/stop).
2. Write `reports/weekly/<YYYY-MM-DD>.md`: users per channel (this week / total), items
   shipped per channel, best and worst item, what to stop, what to double, next week's
   pillar topic, and at most ONE decision for the owner (yes/no question).
3. Kill rule: a channel with 0 orgs after 3 weeks of steady shipping (>= 2 items/week)
   gets `status: dropped` proposed in `channels.yaml`.
4. Open one PR with these changes (label `report`) and one GitHub issue titled
   `Scoreboard <date>` with the summary and the decision, readable on a phone.
