import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Promo, totalFrames, type PromoProps } from './Promo';

const sample: PromoProps = {
  brand: { name: 'Asincly', accent: '#f59e0b', background: '#1c1814', ink: '#f3ece2' },
  beats: [
    { show: 'A 09:30 standup in New York is **22:30 in Tokyo**.', frames: 75 },
    { show: 'Talk for **two minutes** in your own morning.', frames: 75 },
  ],
  end: { headline: 'Async standups. **Free** for up to 3.', url: 'asincly.codeaz.org', frames: 75 },
};

const Root: React.FC = () => (
  <Composition
    id="Promo"
    component={Promo}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={totalFrames(sample)}
    defaultProps={sample}
    calculateMetadata={({ props }) => ({ durationInFrames: totalFrames(props) })}
  />
);

registerRoot(Root);
