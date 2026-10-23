# Asincly positioning brief

Source of truth for every draft about Asincly. Facts only from `apps/asincly.yaml` and the
app repo. Update when the product or the data changes.

## One line
Async standups for remote teams: talk for two minutes in your own morning, AI writes the
check-in, your team reads it in theirs.

## Who it's for (in order)
1. **Leads of remote teams of 3-30 across 3+ time zones** whose standup lands at a bad hour
   for someone. Trigger: someone joins from bed, or skips and asks "what did I miss?".
2. **Teams that tried a Slack standup bot** and got one-line answers nobody reads.
3. **Privacy-minded / self-hosting teams** that won't put team video in a closed SaaS
   (open source, AGPL, Docker Compose, RLS, encrypted transcripts).

Not for: co-located teams whose standup works; buyers who need SOC2 paperwork today.

## The problem, in their words
- "Our standup is 9:30 in New York, that's 10:30 at night in Tokyo."
- "The bot asks three questions, everyone answers 'same as yesterday'."
- "I recorded a Loom, nobody watched it."
- "Blockers sit there until the next meeting."

## Alternatives they use today, and the gap
| Today | Gap Asincly fills |
|---|---|
| Live standup on Zoom | Someone is always at the wrong hour; info lost after the call |
| Slack text bot (Geekbot, DailyBot, Standuply) | Thin answers; no structure from talking; blockers buried in threads |
| Loom / async video | Nobody watches 12 videos; no yesterday/today/blockers structure |
| Nothing (skip standups) | Drift, surprises, managers asking for status |

## Why Asincly (proof points, all true today)
1. **Each person's own window**, in their local time, DST-safe. Nobody waits.
2. **Talk, don't type:** about two minutes of video; AI drafts yesterday / today / blockers,
   ticks off last time's plan, carries the rest, tags teammates mentioned. You edit and send.
3. **One screen to read:** summary first, video on tap; blockers get "I can help" / "Resolved".
4. **Open source and self-hostable**, every feature, no license key. Privacy built in.
5. **Free for up to 3 people** on the cloud; 14-day Pro trial, no card.

## Messaging rules
- Lead with the time-zone pain, then the 2-minute fix. Features after.
- Say "async standups", not "async meetings" (that's what people search and what the product is).
- Never claim users, customers, numbers, testimonials or integrations we don't have.
- Open source / self-host angle: always for HN, DEV, r/selfhosted; optional elsewhere.
- Tone: plain, specific, a builder talking to builders. No hype words.

## Channel angles
| Channel | Angle |
|---|---|
| LinkedIn | Time-zone pain stories; what remote leads lose in live standups |
| TikTok / Reels | 20-40 s: "09:30 in NY is 22:30 in Tokyo" → 2-minute recording → summary on screen |
| SEO guides | Templates, how-tos, comparisons (async standup template, Geekbot alternatives, standups across time zones) |
| HN / DEV | How it's built: RLS on every request, Whisper pipeline, DST-safe schedules; open source |
| Directories | Alternative to Geekbot, Standuply, DailyBot; open source; self-hosted |
| Reddit | Answer the question fully; mention Asincly only if it fits, as the maker |
