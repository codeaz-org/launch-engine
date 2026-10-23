#!/usr/bin/env node
// Daily: fetch status, public link and metrics for every post in the publish log, and write
// $STATE_DIR/metrics/latest.json for the Analyst. Read-only against Buffer; batched with
// GraphQL aliases (max 30 per request), so it costs ceil(posts / 30) requests per day.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { gql } from './buffer.mjs';

const STATE_DIR = process.env.STATE_DIR ?? 'state';
const LOG = `${STATE_DIR}/published/log.jsonl`;
const OUT = `${STATE_DIR}/metrics/latest.json`;
const BATCH = 30;

const entries = existsSync(LOG)
  ? (await readFile(LOG, 'utf8')).split('\n').filter(Boolean).map((l) => JSON.parse(l))
  : [];

const posts = [];
for (let i = 0; i < entries.length; i += BATCH) {
  const batch = entries.slice(i, i + BATCH);
  const query = `query {${batch
    .map((e, j) => `p${j}: post(input: { id: "${e.buffer_post_id}" }) {
        id status sentAt externalLink metricsUpdatedAt metrics { name type value }
      }`)
    .join('\n')}}`;
  const data = await gql(query);
  batch.forEach((e, j) => {
    const p = data[`p${j}`];
    posts.push({
      draft: e.draft, app: e.app, type: e.type, channel: e.channel, link: e.link,
      buffer_post_id: e.buffer_post_id, status: p?.status ?? 'missing', sent_at: p?.sentAt ?? null,
      public_url: p?.externalLink ?? null, metrics_updated_at: p?.metricsUpdatedAt ?? null,
      metrics: Object.fromEntries((p?.metrics ?? []).map((m) => [m.type ?? m.name, m.value])),
    });
  });
}

await mkdir(`${STATE_DIR}/metrics`, { recursive: true });
await writeFile(OUT, JSON.stringify({ generated_at: new Date().toISOString(), posts }, null, 2) + '\n');
console.log(`Wrote metrics for ${posts.length} posts.`);
