# codeaz Launch Engine

AI-run system that releases and markets codeaz apps and brings **real users**. Agents run as
Claude Code cloud scheduled tasks (routines) against this repo. The owner approves from the
GitHub mobile app, ~15 min/day.

Success metric: **signups and active users**. Not likes, views, followers or stars.

## Guardrails (hard rules, never break them)

1. **No unreviewed public speech.** Every public action (post, reply, comment, video,
   article, listing) starts as a pull request. Merging the PR is the only approval.
   Routines have no approval prompts, so an agent must never post, comment, reply, publish
   or schedule anything itself. Only `scripts/publish.mjs`, run by the publish workflow on
   merge to `main`, talks to Buffer with write access.
2. **No DMs, fake accounts, fake reviews, vote rings, upvote requests or astroturfing.**
3. **One real account per platform** (codeaz on TikTok, LinkedIn, Instagram). Never create
   accounts.
4. **Low volume, human tone, no spam.** Helpful first. Mention the app only where it truly
   solves the problem in the thread. Always disclose "I'm the maker" when mentioning it.
   Read and follow each community's rules (subreddit sidebar/wiki, forum guidelines) before
   drafting; record which rules were checked in the draft.
5. **Never commit secrets.** Keys live in GitHub Actions secrets or a local `.env`
   (gitignored). Never print a key in logs, PRs, issues or reports.
6. **EUR 0 budget.** Only the existing Claude subscription and free tiers. Before using
   anything that could cost money (paid plan, paid API, trial that needs a card, usage
   credits), stop and ask the owner in an issue.
7. **Kill rule:** a channel with zero users after 3 weeks of steady effort is dropped.
   The Analyst proposes the drop; the owner confirms by closing the issue.
8. **Respect platform terms.** Research is read-only and low volume. No scraping behind
   logins, no evading blocks, no automated engagement (likes, follows, comments).
9. **Drafts only** for Show HN, Product Hunt, Reddit, directories (AlternativeTo, SaaSHub,
   awesome-lists) and DEV/Hashnode. The owner submits these manually.

## Repo layout

| Path | What lives there | Written by |
|---|---|---|
| `apps/<app>.yaml` | App registry: audience, pain, keywords, competitors, links, channels | Owner + Growth Lead |
| `.claude/skills/engine/`, `.claude/skills/analyst/` | The two agents (engine = scout+writer+replier+video+growth lead) | Engineering |
| `.claude/skills/*` (others) | Vendored marketing skills, see `VENDORED.md` | - |
| `drafts/<app>/<type>/<date>-<slug>.md` | Drafts (post, reply, video, article, listing) with frontmatter | Writer, Replier, Video Producer |
| `state` branch: `queue/pending.jsonl` | Approved items waiting for Buffer capacity | `scripts/publish.mjs` |
| `state` branch: `published/log.jsonl` | One line per scheduled item: Buffer post ID, channel, link | `scripts/publish.mjs` |
| `channels.yaml` | Channel playbook: how each ships, caps, status | Engine + Analyst |
| `strategy/<app>.md` | Calendar, scoreboard, experiments, decisions | Engine + Analyst |
| `reports/runs/<date>.md` | Engine run log | Engine |
| `research/scout/<app>/<date>-<am|pm>.md` | Ranked threads and topics | Scout |
| `reports/plans/<date>-<app>.md` | Weekly plan (mirrored to an issue) | Growth Lead |
| `reports/weekly/<date>.md` | Scoreboard (mirrored to an issue) | Analyst |
| `scripts/` | Buffer client, publisher, validators | Engineering |
| `docs/` | Architecture, verified limits, runbooks | Engineering |

## Draft format

Every draft is a Markdown file with YAML frontmatter. The body is the exact public text.

```yaml
---
app: asincly
type: post            # post | reply | video | article | listing | seo-page
channels: [linkedin]  # buffer channels: linkedin | instagram | tiktok. Empty = manual
schedule: queue       # queue | 2026-11-03T15:07:00Z (UTC)
media: []             # public, stable HTTPS URLs only (Buffer fetches at publish time)
link: https://asincly.codeaz.org/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-w2
manual_target: null   # for drafts-only: e.g. https://news.ycombinator.com/submit
rules_checked: null   # for replies/communities: link to the rules you read
---
```

## Agent rules

- One PR per draft (or one PR per small batch of the same type and day). PR title:
  `[<app>][<type>] <short summary>`. Label: `draft`, `<app>`, `<type>`.
- Branch from `main`; routines push to `claude/` branches.
- Every published link carries UTM params:
  `utm_source=<platform>&utm_medium=<social|community|directory|article|video>&utm_campaign=<app>-<week>`.
- Write English (Romanian for ochipesantier). Plain, specific, no hype words, no emoji walls.
- Respect Buffer limits (see `docs/LIMITS.md`). Never call Buffer from an agent session.
- When unsure whether something is allowed, don't do it; open an issue with the question.
