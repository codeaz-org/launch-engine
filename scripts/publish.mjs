#!/usr/bin/env node
// Publisher: turns merged (= approved) drafts into Buffer posts, within free-plan limits.
// Run by .github/workflows/publish.yml. Never run from an agent session.
//
//   node scripts/publish.mjs [draft.md ...]   # enqueue these drafts, then drain the queue
//   DRY_RUN=1 node scripts/publish.mjs ...    # show what would happen, call nothing
//
// Queue and log live on the `state` branch (main is PR-only), checked out at $STATE_DIR:
//   $STATE_DIR/queue/pending.jsonl ({draft, channel} per line), $STATE_DIR/published/log.jsonl

import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import { parse } from 'yaml';
import { organizations, channels, scheduledPosts, createPost } from './buffer.mjs';

const MAX_SCHEDULED_PER_CHANNEL = 10; // Buffer free plan: 10 scheduled posts per channel
const MAX_CREATES_PER_RUN = 20;       // keeps a run far under 100 requests / 15 min
const STATE_DIR = process.env.STATE_DIR ?? 'state';
const QUEUE = `${STATE_DIR}/queue/pending.jsonl`;
const LOG = `${STATE_DIR}/published/log.jsonl`;
const DRY_RUN = !!process.env.DRY_RUN;

async function readDraft(path) {
  const src = await readFile(path, 'utf8');
  const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${path}: missing frontmatter`);
  return { meta: parse(m[1]), text: m[2].trim() };
}

async function readJsonl(path) {
  if (!existsSync(path)) return [];
  return (await readFile(path, 'utf8')).split('\n').filter(Boolean).map((l) => JSON.parse(l));
}

const isVideo = (url) => /\.(mp4|mov|webm)$/i.test(url);

function assetsFor(media = []) {
  return media.map((url) => (isVideo(url) ? { video: { url } } : { image: { url } }));
}

// Per-service metadata Buffer requires; a draft's own `metadata.<service>` wins.
function metadataFor(service, meta) {
  const own = meta.metadata?.[service];
  if (service === 'instagram') {
    const type = (meta.media ?? []).some(isVideo) ? 'reel' : 'post';
    return { instagram: { type, shouldShareToFeed: true, ...own } };
  }
  return own ? { [service]: own } : undefined;
}

async function main(drafts) {
  for (const dir of ['queue', 'published']) mkdirSync(`${STATE_DIR}/${dir}`, { recursive: true });
  const pending = await readJsonl(QUEUE);
  const published = new Set((await readJsonl(LOG)).map((l) => `${l.draft}|${l.channel}`));

  for (const path of drafts) {
    const { meta } = await readDraft(path);
    for (const channel of meta.channels ?? []) {
      const key = `${path}|${channel}`;
      if (published.has(key) || pending.some((p) => `${p.draft}|${p.channel}` === key)) continue;
      pending.push({ draft: path, channel });
    }
  }
  if (!pending.length) return console.log('Queue empty.');
  if (DRY_RUN) return console.log('DRY_RUN, would process:', pending);

  const account = await organizations();
  const org = account.organizations[0];
  const byService = Object.fromEntries((await channels(org.id)).map((c) => [c.service, c]));
  const counts = {};
  for (const p of await scheduledPosts(org.id)) counts[p.channelId] = (counts[p.channelId] ?? 0) + 1;

  const remaining = [];
  let creates = 0;
  for (const item of pending) {
    const ch = byService[item.channel];
    if (!ch) {
      console.error(`No Buffer channel for "${item.channel}"; keeping in queue.`);
      remaining.push(item);
      continue;
    }
    if ((counts[ch.id] ?? 0) >= MAX_SCHEDULED_PER_CHANNEL || creates >= MAX_CREATES_PER_RUN) {
      remaining.push(item);
      continue;
    }
    const { meta, text } = await readDraft(item.draft);
    const dueAt = meta.schedule && meta.schedule !== 'queue' ? new Date(meta.schedule).toISOString() : undefined;
    const post = await createPost({
      channelId: ch.id, text, dueAt, assets: assetsFor(meta.media), metadata: metadataFor(item.channel, meta),
    });
    creates++;
    counts[ch.id] = (counts[ch.id] ?? 0) + 1;
    await appendFile(LOG, JSON.stringify({
      at: new Date().toISOString(), app: meta.app, type: meta.type, draft: item.draft,
      channel: item.channel, buffer_post_id: post.id, due_at: post.dueAt, link: meta.link ?? null,
    }) + '\n');
    console.log(`Scheduled ${item.draft} on ${item.channel}: ${post.id}`);
  }
  await writeFile(QUEUE, remaining.map((r) => JSON.stringify(r)).join('\n') + (remaining.length ? '\n' : ''));
  console.log(`Created ${creates}; ${remaining.length} left in queue.`);
}

main(process.argv.slice(2)).catch((e) => {
  console.error(e.message);
  process.exit(1);
});
