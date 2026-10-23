# Verified limits (checked 2026-10-23)

Re-check these when a vendor changes plans. Sources linked.

## Claude Code cloud scheduled tasks (routines)
Source: https://code.claude.com/docs/en/routines

- Runs on Anthropic cloud; laptop can be off. Pro, Max, Team, Enterprise.
- Runs draw down normal subscription usage (same pool as interactive sessions). This is the
  real limit for us: keep agents short and few.
- Hourly caps: 100 scheduled runs/hour per account; Run now/API fires 30/hour per task.
- Cron no more often than once per hour. Avoid exact :00 (late starts); use e.g. :07.
- Triggers: schedule, API (`/fire`), GitHub events (pull_request, release only; needs the
  Claude GitHub App on the repo).
- Pushes go to `claude/` branches; PRs carry the owner's GitHub identity.
- Network: Default env = "Trusted" allowlist only. Reddit/HN/RSS hosts must be added to a
  Custom environment. Keys for APIs go in network secrets, not env vars.
- No approval prompts (auto mode). Hence: agents never get the Buffer key.
- Without usage credits, runs over the subscription limit are rejected (no surprise charges).
  **Do not turn on usage credits** (costs money).

## Buffer (free plan)
Sources: https://developers.buffer.com/guides/api-limits.html,
https://developers.buffer.com/guides/hosting-media.html

- API: GraphQL at `https://api.buffer.com`, `Authorization: Bearer <key>`; 1 API key on free.
  Key is account-wide (all orgs and channels). Legacy REST API retires 2027-02-01.
- Rate limits (rolling): **100 / 15 min, 250 / 24 h, 3,000 / 30 days**. 429 + Retry-After.
  (Brief said 100/day; real daily cap is 250. We still budget ~20 creates per run.)
- 3 channels; **10 scheduled posts per channel** at a time (third-party sources; confirm in
  the Buffer UI once connected).
- No upload endpoint. Media must be a **public, stable HTTPS URL** that stays live until
  publish time. No signed/expiring URLs, no Drive/Dropbox share links.
- MCP server `https://mcp.buffer.com/mcp` (OAuth, full account access, `create_post` can
  publish immediately). **Not used by agents** for that reason; GitHub Action only.
- TikTok: auto-publish works for videos meeting TikTok requirements; trending sounds etc.
  need manual notification publishing.
