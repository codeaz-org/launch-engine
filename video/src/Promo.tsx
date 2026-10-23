import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// 9:16 short for TikTok / Reels / LinkedIn: one beat per screen (big caption, optional
// screenshot), narration per beat, end card with the URL. Captions are burned in because
// most people watch muted. Text stays inside the platforms' safe area (top/bottom ~15%).

export type Beat = {
  show: string;          // caption on screen
  say?: string;          // narration text (already rendered to audio by render.mjs)
  image?: string;        // public https URL of a screenshot
  audio?: string;        // file in public/, set by render.mjs
  frames: number;        // set by render.mjs from the audio length
};

export type PromoProps = {
  brand: { name: string; accent: string; background: string; ink: string };
  beats: Beat[];
  end: { headline: string; url: string; frames: number; audio?: string };
};

const Caption: React.FC<{ text: string; ink: string; accent: string }> = ({ text, ink, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  // **word** marks an accent word.
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <div
      style={{
        fontFamily: 'Inter, Helvetica, Arial, sans-serif',
        fontSize: 76,
        lineHeight: 1.08,
        fontWeight: 700,
        letterSpacing: -1.5,
        color: ink,
        textAlign: 'left',
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [40, 0])}px)`,
      }}
    >
      {parts.map((p, i) =>
        p.startsWith('**') ? (
          <span key={i} style={{ color: accent }}>{p.slice(2, -2)}</span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </div>
  );
};

const Shot: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - 6, fps, config: { damping: 200 } });
  return (
    <div
      style={{
        marginTop: 56,
        borderRadius: 28,
        overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
        border: '1px solid rgba(255,255,255,0.12)',
        opacity: enter,
        transform: `scale(${interpolate(enter, [0, 1], [0.94, 1])})`,
      }}
    >
      <Img src={src} style={{ width: '100%', display: 'block' }} />
    </div>
  );
};

const Frame: React.FC<{ brand: PromoProps['brand']; children: React.ReactNode }> = ({ brand, children }) => (
  <AbsoluteFill style={{ background: brand.background, padding: '300px 80px 340px', justifyContent: 'center' }}>
    <div
      style={{
        position: 'absolute', top: 150, left: 80, fontFamily: 'Inter, Helvetica, Arial, sans-serif',
        fontSize: 34, letterSpacing: 6, textTransform: 'uppercase', color: brand.accent, fontWeight: 600,
      }}
    >
      {brand.name}
    </div>
    {children}
  </AbsoluteFill>
);

export const Promo: React.FC<PromoProps> = ({ brand, beats, end }) => {
  let from = 0;
  return (
    <AbsoluteFill style={{ background: brand.background }}>
      {beats.map((b, i) => {
        const start = from;
        from += b.frames;
        return (
          <Sequence key={i} from={start} durationInFrames={b.frames}>
            <Frame brand={brand}>
              <Caption text={b.show} ink={brand.ink} accent={brand.accent} />
              {b.image && <Shot src={b.image} />}
            </Frame>
            {b.audio && <Audio src={staticFile(b.audio)} />}
          </Sequence>
        );
      })}
      <Sequence from={from} durationInFrames={end.frames}>
        <Frame brand={brand}>
          <Caption text={end.headline} ink={brand.ink} accent={brand.accent} />
          <div
            style={{
              marginTop: 64, fontFamily: 'Inter, Helvetica, Arial, sans-serif', fontSize: 52,
              fontWeight: 600, color: brand.accent,
            }}
          >
            {end.url}
          </div>
        </Frame>
        {end.audio && <Audio src={staticFile(end.audio)} />}
      </Sequence>
    </AbsoluteFill>
  );
};

export const totalFrames = (p: PromoProps) => p.beats.reduce((n, b) => n + b.frames, 0) + p.end.frames;
