#!/usr/bin/env node
// Renders a video draft (drafts/<app>/video/<date>-<slug>.md) to out/<app>/<slug>.mp4.
//
//   node render.mjs ../drafts/asincly/video/2026-10-27-launch.md
//
// The draft's frontmatter carries a `video:` block:
//   video:
//     voice: en-US-AndrewNeural        # Edge TTS voice (free); omit for silent captions
//     brand: { name, accent, background, ink }
//     beats:
//       - show: "Caption with **accent** words"
//         say: "Narration for this beat"
//         image: https://...png        # optional public screenshot
//     end: { headline: "...", url: "asincly.codeaz.org", say: "..." }
// Narration is generated with the `edge-tts` CLI (pip install edge-tts); each beat lasts as
// long as its narration (min 2 s). Without edge-tts, beats are timed from word count.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const FPS = 30;
const here = dirname(fileURLToPath(import.meta.url));
const draftPath = resolve(process.argv[2] ?? '');
const src = readFileSync(draftPath, 'utf8');
const m = src.match(/^---\n([\s\S]*?)\n---\n/);
if (!m) throw new Error(`${draftPath}: missing frontmatter`);
const meta = parse(m[1]);
const v = meta.video;
if (!v?.beats?.length) throw new Error(`${draftPath}: no video.beats`);

const app = meta.app;
const slug = basename(draftPath, '.md');
const audioDir = join(here, 'public', app, slug);
mkdirSync(audioDir, { recursive: true });

let tts = true;
try {
  execFileSync('edge-tts', ['--help'], { stdio: 'ignore' });
} catch {
  tts = false;
  console.warn('edge-tts not found: rendering without narration');
}

function seconds(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]);
  return parseFloat(out.toString());
}

function voice(text, name) {
  const words = text?.split(/\s+/).length ?? 0;
  if (!text) return { frames: 2.5 * FPS };
  if (!tts) return { frames: Math.ceil(Math.max(2.5, words / 2.6 + 0.8) * FPS) };
  const file = join(audioDir, `${name}.mp3`);
  execFileSync('edge-tts', ['--voice', v.voice ?? 'en-US-AndrewNeural', '--rate', '+6%', '--text', text, '--write-media', file]);
  return { audio: `${app}/${slug}/${name}.mp3`, frames: Math.ceil(Math.max(2, seconds(file) + 0.5) * FPS) };
}

const props = {
  brand: v.brand ?? { name: meta.app, accent: '#f59e0b', background: '#1c1814', ink: '#f3ece2' },
  beats: v.beats.map((b, i) => ({ show: b.show, image: b.image, ...voice(b.say, `b${i}`) })),
  end: { headline: v.end.headline, url: v.end.url, ...voice(v.end.say, 'end') },
};

const outDir = join(here, 'out', app);
mkdirSync(outDir, { recursive: true });
const propsFile = join(audioDir, 'props.json');
writeFileSync(propsFile, JSON.stringify(props, null, 2));
const out = join(outDir, `${slug}.mp4`);
execFileSync(
  'npx',
  ['remotion', 'render', 'src/index.tsx', 'Promo', out, `--props=${propsFile}`, '--codec=h264', '--audio-codec=aac'],
  { cwd: here, stdio: 'inherit' },
);
if (!existsSync(out)) throw new Error('render produced no file');
console.log(`Rendered ${out} (${seconds(out).toFixed(1)} s)`);
