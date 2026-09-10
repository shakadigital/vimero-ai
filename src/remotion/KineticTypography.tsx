import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

export type SubtitleToken = {
  text: string;
  offset: number; // in 100-nanosecond ticks (10,000 ticks = 1 ms)
  duration: number; // in ticks
};

export const KineticTypography: React.FC<{ subtitles?: SubtitleToken[] }> = ({ subtitles }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!subtitles || subtitles.length === 0) {
    return null;
  }

  const currentMs = (frame / fps) * 1000;

  // Temukan kata mana yang sedang aktif berdasarkan currentMs
  // offset dalam ticks (10.000 = 1 ms)
  const activeWordIndex = subtitles.findIndex((sub) => {
    const subStartMs = sub.offset / 10000;
    const subEndMs = (sub.offset + sub.duration) / 10000;
    // Berikan sedikit kelonggaran
    return currentMs >= subStartMs && currentMs <= subEndMs + 100;
  });

  const activeWord = activeWordIndex !== -1 ? subtitles[activeWordIndex].text : '';

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          padding: '40px',
          maxWidth: '80%',
        }}
      >
        {activeWord && (
          <h1
            style={{
              color: '#fbbf24', // Amber/Yellow
              fontSize: '120px',
              fontWeight: '900',
              textAlign: 'center',
              textShadow: '0 8px 30px rgba(0,0,0,0.8), 0 4px 10px rgba(0,0,0,0.6)',
              textTransform: 'uppercase',
              fontFamily: 'sans-serif',
              transform: 'scale(1.1)', // Karaoke pop effect
            }}
          >
            {activeWord}
          </h1>
        )}
      </div>
    </AbsoluteFill>
  );
};
