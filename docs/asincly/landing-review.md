# Landing page review: asincly.codeaz.org (2026-10-23)

Checked live page, SSR HTML (what crawlers and link previews see), OG image, and the copy in
`src/components/split-landing.tsx`.

## Works
- Strong story: "The standup at 09:30" (sync pain) → "The standup whenever you wake" →
  "Kill the meeting. Keep the standup." Matches the positioning brief.
- Server-rendered: crawlers see the copy and the H1. OG image returns 200.
- "Start free" is always visible in the top bar; mobile layout exists.
- Trust line (open source, self-hostable, encrypted at rest) next to the final CTA.

## Fixed in asincly#20
- "Free for up to 3 people" added next to the final CTA (was only on /pricing).
- Footer links to /guides (internal links help the guides rank).

## Recommended next (not done, owner's call: design changes)
1. **Say what it is in the first screen.** Cold visitors from LinkedIn/TikTok see "The
   standup at 09:30." with no product statement until they scroll. Add one quiet line under
   it: "Asincly: async standups. Talk for two minutes, AI writes the check-in."
2. **The scroll story is long (10 screens).** Add a small "See how it works ↓ / Start free"
   pair in the first screen for people who won't scroll.
3. **Show the open-source angle earlier** for HN/DEV traffic: a GitHub link in the top bar.
4. **Social proof:** none yet. Don't fake it. Once real: a GitHub star count or a one-line
   quote from a real team.
5. **Measure:** visits per campaign now come from asincly#20; compare visits → orgs per
   channel in the weekly scoreboard before changing the hero.
