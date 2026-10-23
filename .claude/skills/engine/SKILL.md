---
name: engine
description: "Run the codeaz Launch Engine: research where each active app's audience is talking, decide what content to make for which channel based on results so far, draft it, and open one pull request per item for the owner to approve. Use when asked to 'run the engine', 'run the system', 'what should we post', or by the daily scheduled task."
---

# Launch Engine run

One run = listen, decide, draft, open PRs, log. You never publish anything. Merging a PR is
the owner's approval; the publish workflow or the owner does the rest. Read `CLAUDE.md`
first and follow its guardrails over anything here.

## 0. Load state (cheap, every run)

1. `apps/*.yaml` with `status: pilot | active`. These are the apps to work on.
2. `channels.yaml`: how each channel ships, caps, `ready`, `status`.
3. `strategy/<app>.md`: launch calendar, scoreboard, experiments, decisions.
4. What already shipped: `git fetch origin state && git show origin/state:published/log.jsonl`
   (missing branch = nothing shipped yet). Metrics if present: `git show origin/state:metrics/latest.json`.
5. Open PRs: `gh pr list --label draft --state open --json number,title,labels,createdAt`.
   Also open PRs in each app repo with label `seo`.
6. Today's date and the launch week number (from `strategy/<app>.md`).

## 1. Review budget

The owner spends ~15 min/day on approvals. **Max 8 open draft PRs in total.**
New items this run = `8 - open draft PRs` (never more than 5 per run). If the budget is 0,
skip to step 5 and log "waiting on approvals". Stale PRs (open > 7 days) are closed with a
comment "superseded"; that frees budget and is a signal the item wasn't wanted.

## 2. Listen (read-only, low volume, max ~15 requests total)

Find live conversations and search demand for the app's `pain` and `keywords`. Use only
public, unauthenticated endpoints and respect robots/terms. Prefer:

- Hacker News: `https://hn.algolia.com/api/v1/search_by_date?query=<kw>&tags=(story,comment)&numericFilters=created_at_i><epoch-7d>`
- Reddit: `https://www.reddit.com/r/<sub>/search.json?q=<kw>&restrict_sr=1&sort=new&t=week`
  with a descriptive User-Agent. If blocked (403/429), try the `.rss` variant once, then
  skip Reddit for this run and note it. Never use cookies or logins.
- DEV: `https://dev.to/api/articles?tag=remote&per_page=20` and `?tag=productivity`.
- Search demand: Google suggest `https://suggestqueries.google.com/complete/search?client=firefox&q=<kw>`.
- Local runs may also use the `agent-reach` skill if installed.

Save `research/scout/<app>/<YYYY-MM-DD>.md`: ranked list (max 10) of threads with URL,
age, why it matters, suggested action (reply / topic idea / ignore). Skip threads older
than 7 days or locked/archived.

## 3. Decide (this is the job; don't ask the owner)

Pick today's items using this order:

1. **Calendar must-dos** for the current launch week (`strategy/<app>.md`) not yet shipped or open.
2. **Hot threads** from step 2 where a helpful reply is clearly wanted (reddit/hackernews
   drafts, manual). Max 2 per run.
3. **Allocation by results**:
   - Weeks 1-3 or < 30 tracked visits per channel: **explore**. Spread items across all
     `ready: true` channels with status explore, least-recently-used first.
   - After that: ~70% to the channels with the best `orgs created per item`, ~30% to the
     next-best untested idea. Never exceed `max_per_week`.
   - Channels with `ready: false` get no publishable drafts, but you may draft media
     scripts for them (video) so they are ready when the channel is.
   - Respect the kill rule: drop channels the Analyst marked `dropped`.
4. **Repurpose**: one pillar topic per week. A guide (seo) becomes a LinkedIn post, a DEV
   article (canonical to the guide), a video script and a Reddit answer where it fits.

Write the reasoning in 3-6 lines in the run log (step 5). Tie each item to an experiment id
from `strategy/<app>.md` or add a new experiment there.

## 4. Draft and open PRs

Use the vendored skills for craft: `product-marketing` (context = `apps/<app>.yaml`),
`copywriting`, `social`, `launch`, `community-marketing`, `directory-submissions`,
`programmatic-seo` / `seo-audit` / `ai-seo`, `video`, `content-strategy`.

Rules for every draft:
- Specific, plain, first person from the maker where natural. No hype words
  (revolutionary, game-changer, unlock, supercharge, seamless), no emoji walls.
- Only facts from `apps/<app>.yaml` or the app repo. No invented users, numbers or quotes.
- Every link carries UTM: `utm_source=<channel>&utm_medium=<social|community|directory|article|video|organic>&utm_campaign=<app>-w<week>&utm_content=<slug>`.
- Replies: answer the question fully on its own; mention the app only if it truly fits,
  with "(I'm the maker)". Fetch and read the community rules; put the URL in `rules_checked`.
  If self-promotion isn't allowed, don't mention the app at all.

Where each item goes:
- **buffer channels** (linkedin, instagram, tiktok): `drafts/<app>/<type>/<YYYY-MM-DD>-<slug>.md`
  with the frontmatter from `CLAUDE.md`, in this repo.
- **manual channels** (hackernews, reddit, dev, hashnode, directories): same path, `channels: []`,
  `manual_target:` set, and the PR body lists the exact steps for the owner (where to click,
  what to paste, best time to post).
- **seo**: in the app repo, `content/guides/<slug>.md` (frontmatter: title, description,
  date, keywords). One search intent per page, original and useful; link to signup with
  `utm_source=guide&utm_medium=organic`. Also add a copy of the brief to
  `drafts/<app>/seo/` here so the log stays in one place.
- **video**: `drafts/<app>/video/<date>-<slug>.md` with script (timed beats), on-screen
  text, caption, and `media: []` until rendered.

PR per item: branch `claude/<app>-<type>-<slug>`, title `[<app>][<channel>] <summary>`,
labels `draft`, `<app>`, `<channel>`. PR body: what, why now (signal + experiment id),
where it goes, how approval works ("Merge = schedule in Buffer" or "Merge, then post
manually: steps..."). Keep it readable on a phone.

## 5. Log

Append `reports/runs/<YYYY-MM-DD>.md`: inputs read, research summary, decision reasoning,
PRs opened (links), anything blocked (e.g. Reddit 403, channel not ready). Commit the
research file and run log on a branch `claude/engine-log-<date>` and open one PR labeled
`log` (no public content; the owner may merge without reading).

## Never

Post, comment, DM, like, follow, schedule, or call Buffer. Merge your own PRs. Create
accounts. Spend money. Commit secrets. Exceed the review budget.
