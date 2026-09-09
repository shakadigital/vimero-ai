import { AbsoluteFill, Audio, Img, useCurrentFrame, useVideoConfig } from 'remotion';
import React from 'react';

export type VerticalVideoProps = {
  audioUrl?: string | null;
  subtitleData?: any; // For later kinetic typography
  mediaAssets?: any[];
  title?: string;
};

export const VerticalVideo: React.FC<VerticalVideoProps> = ({ audioUrl, subtitleData, mediaAssets, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Simple background using the first media asset (from Creative Studio)
  const bgImage = mediaAssets && mediaAssets.length > 0 
    ? mediaAssets[0].file_url 
    : null;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a' }}>
      {bgImage ? (
        <Img 
          src={bgImage} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} 
        />
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, #1e3a8a, #0f172a)'
        }} />
      )}
      
      {/* Title overlay */}
      <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', padding: '160px 80px' }}>
        <h1 style={{ color: 'white', fontSize: 60, fontWeight: 'bold', textAlign: 'center', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
          {title || "Vimero AI Video"}
        </h1>
      </AbsoluteFill>

      {/* Placeholder for Subtitles or status */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '80px' }}>
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: '30px 50px',
          borderRadius: 30,
          border: '4px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{ color: '#fbbf24', fontSize: 70, fontWeight: '900', textAlign: 'center' }}>
            {audioUrl ? 'SEDANG MEMUTAR AUDIO' : 'MENUNGGU AUDIO'}
          </h2>
        </div>
      </AbsoluteFill>

      {/* Audio Track */}
      {audioUrl && <Audio src={audioUrl} />}
    </AbsoluteFill>
  );
};
