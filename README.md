# launch-engine

The codeaz Launch Engine: AI agents (Claude Code cloud scheduled tasks) draft launches,
posts, replies and videos for codeaz apps; the owner approves by merging PRs; a GitHub
Action schedules approved items in Buffer and logs every link.

Rules for agents: [CLAUDE.md](./CLAUDE.md). Verified vendor limits: [docs/LIMITS.md](./docs/LIMITS.md).

## Flow

```
Routine (Scout/Writer/Replier/Video) --> PR with drafts/<app>/... --> owner merges on phone
   --> .github/workflows/publish.yml --> Buffer (LinkedIn, Instagram, TikTok)
   --> state branch: published/log.jsonl   (manual channels: owner submits the draft by hand)
```

## Run it

- Daily (cloud): scheduled task "engine" runs the `engine` skill and opens draft PRs.
- Weekly (cloud, Sunday): scheduled task "analyst" posts the scoreboard issue.
- Now, from a laptop: `claude "run the engine"` in this repo.

Approve = merge the PR on your phone. Reject = close it.

## Apps

| App | Status | Registry |
|---|---|---|
| Asincly | pilot | [apps/asincly.yaml](./apps/asincly.yaml) |
| rescue.codeaz.org | week 6 | - |
| ochipesantier (RO) | later | - |

## Local commands

```bash
npm ci
cp .env.example .env              # add BUFFER_API_KEY (never commit it)
npm run buffer -- whoami          # check the key
npm run buffer -- channels        # list connected channels
npm run buffer -- scheduled       # scheduled posts per channel
npm run publish:dry -- drafts/... # what the publisher would do
```
