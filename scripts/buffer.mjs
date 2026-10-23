#!/usr/bin/env node
// Minimal Buffer GraphQL client (https://developers.buffer.com). Zero dependencies, Node 22+.
// Usage:
//   BUFFER_API_KEY=... node scripts/buffer.mjs whoami      # account + organizations
//   BUFFER_API_KEY=... node scripts/buffer.mjs channels    # channels per organization
//   BUFFER_API_KEY=... node scripts/buffer.mjs scheduled   # scheduled posts per channel
// Every call counts against Buffer's rolling limits (free: 100/15 min, 250/24 h, 3,000/30 days).

const ENDPOINT = 'https://api.buffer.com';

export async function gql(query, variables = {}) {
  const key = process.env.BUFFER_API_KEY;
  if (!key) throw new Error('BUFFER_API_KEY is not set');
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ query, variables }),
  });
  if (res.status === 429) {
    throw new Error(`Buffer rate limit hit; retry after ${res.headers.get('retry-after')}s`);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.errors) {
    throw new Error(`Buffer ${res.status}: ${JSON.stringify(body.errors ?? body)}`);
  }
  return body.data;
}

export async function organizations() {
  const data = await gql(`query { account { id email organizations { id name } } }`);
  return data.account;
}

export async function channels(organizationId) {
  const data = await gql(
    `query ($org: OrganizationId!) {
      channels(input: { organizationId: $org }) { id name displayName service isQueuePaused }
    }`,
    { org: organizationId },
  );
  return data.channels;
}

export async function scheduledPosts(organizationId) {
  const data = await gql(
    `query ($org: OrganizationId!) {
      posts(input: { organizationId: $org, filter: { status: [scheduled] },
                     sort: [{ field: dueAt, direction: asc }] }) {
        edges { node { id channelId dueAt } }
      }
    }`,
    { org: organizationId },
  );
  return data.posts.edges.map((e) => e.node);
}

// input: { channelId, text, dueAt?, assets?, metadata? } ; dueAt (ISO UTC) => customScheduled, else addToQueue
// Schema checked by introspection 2026-10-23: `assets` is required (may be empty);
// Instagram needs metadata.instagram { type, shouldShareToFeed }.
export async function createPost({ channelId, text, dueAt, assets = [], metadata }) {
  const input = {
    channelId,
    text,
    schedulingType: 'automatic',
    mode: dueAt ? 'customScheduled' : 'addToQueue',
    assets,
    ...(dueAt && { dueAt }),
    ...(metadata && { metadata }),
  };
  const data = await gql(
    `mutation ($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess { post { id dueAt } }
        ... on MutationError { message }
      }
    }`,
    { input },
  );
  if (data.createPost.message) throw new Error(`createPost: ${data.createPost.message}`);
  return data.createPost.post;
}

async function main(cmd) {
  const account = await organizations();
  if (cmd === 'whoami') return console.log(JSON.stringify(account, null, 2));
  for (const org of account.organizations) {
    if (cmd === 'channels') {
      console.log(org.name, JSON.stringify(await channels(org.id), null, 2));
    } else if (cmd === 'scheduled') {
      const counts = {};
      for (const p of await scheduledPosts(org.id)) counts[p.channelId] = (counts[p.channelId] ?? 0) + 1;
      console.log(org.name, counts);
    } else {
      throw new Error(`unknown command: ${cmd}`);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main(process.argv[2] ?? 'whoami').catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
