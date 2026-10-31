---
app: asincly
type: article
channels: []
schedule: queue
media: []
link: https://github.com/codeaz-org/asincly?utm_source=dev&utm_medium=article&utm_campaign=asincly-w2&utm_content=rls-per-request
manual_target: https://dev.to/new
rules_checked: https://dev.to/code-of-conduct
experiment: E2
---

TITLE: Row-level security on every request in Next.js and Postgres, without an ORM leak
TAGS: postgres, nextjs, security, opensource

BODY:

I'm the maker of Asincly, an open-source async standup tool. Teams record a two-minute
check-in, and the people in other time zones read a summary instead of attending a call.
That means we store the most sensitive text a team produces: what people are blocked on,
who they are waiting for, what they said out loud. So tenant isolation was the first
design decision, not a later hardening pass.

This post covers how we enforce it in Postgres with row-level security (RLS), and the
two mistakes that RLS makes easy.

## The rule

Every domain table has RLS enabled and forced. Policies check team membership. The app
connects as a non-superuser role (`asincly_app`), because a superuser or the table owner
bypasses RLS silently. `FORCE ROW LEVEL SECURITY` covers the owner case; the separate role
covers the rest.

```sql
ALTER TABLE team ENABLE ROW LEVEL SECURITY;
ALTER TABLE team FORCE ROW LEVEL SECURITY;
```

## Telling Postgres who is asking

Policies need to know the current user. We pass it as a transaction-local setting:

```ts
export function withUser<T>(userId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
  if (!userId) throw new Error("withUser: userId is required");
  return appDb.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.current_user_id', ${userId}, true)`);
    return fn(tx);
  });
}
```

The `true` makes the setting local to the transaction, so it is discarded at commit. That
matters with a connection pool: a plain session-level `SET` would leak one user's identity
to the next request that reuses the connection.

A policy then reads the setting through small helper functions, for example
`is_org_member(org_id)`, which checks the `member` table against
`current_user_id()`. Keeping the membership logic in `SECURITY DEFINER` helpers avoids
recursive policies when a policy on `member` needs to read `member`.

## Mistake 1: a second, unrestricted client

Some code legitimately acts for nobody in particular: cron jobs, webhooks, the auth
adapter. Those use a separate owner client that bypasses RLS. The risk is that it becomes
the easy import. We put the two clients in one file, comment which is which, and use an
ESLint rule that allowlists the files permitted to import the owner client. Everything
else must go through `withUser()`.

## Mistake 2: not testing it

RLS failures are silent: a missing policy returns zero rows or, worse, too many. We keep
a test (`src/db/rls.test.ts`) that seeds two organizations with disjoint users and asserts
that a user running under `withUser()` sees only their own org and team, table by table.
A new table without a policy fails that suite.

## What it does not do

RLS stops one tenant reading another's rows. It does not replace input validation (every
server action parses input with Zod), encryption (transcripts and AI drafts are encrypted
with AES-256-GCM before they hit the database), or keeping video out of the app server
(browsers upload straight to the bucket with pre-signed URLs). Defense in depth means each
layer assumes the one above it is wrong.

## Try it

The code is AGPL-3.0 and self-hostable with Docker Compose:
https://github.com/codeaz-org/asincly?utm_source=dev&utm_medium=article&utm_campaign=asincly-w2&utm_content=rls-per-request

If you have run RLS in production, I'd like to hear what bit you, especially around
connection pooling and policy performance.

---
OWNER STEPS (manual, after merge)
1. Go to https://dev.to/new and paste the BODY. Set the title and the 4 tags above.
2. Check the code blocks render. Add the cover image only if you have one; none is required.
3. Best time: a weekday morning US Eastern, around 13:00-15:00 UTC, Nov 3-5 (week 2), after the Show HN has gone out or the day before it, not the same hour.
4. Publish, then optionally cross-post to Hashnode with canonical URL set to the DEV article.
5. Do not ask for upvotes or reactions anywhere.
