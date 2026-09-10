import { AbsoluteFill, Audio, Img, useCurrentFrame, useVideoConfig, Series, interpolate } from 'remotion';
import React from 'react';
import { KineticTypography } from './KineticTypography';

export type VerticalVideoProps = {
  audioUrl?: string | null;
  subtitleData?: any; 
  mediaAssets?: any[];
  title?: string;
  fullText?: string;
};

export const VerticalVideo: React.FC<VerticalVideoProps> = ({ audioUrl, subtitleData, mediaAssets, title, fullText }) => {
  const { durationInFrames } = useVideoConfig();

  // Filter out invalid assets
  const validAssets = mediaAssets?.filter(a => a?.file_url) || [];
  
  // Calculate how long each image should be shown
  const framesPerAsset = validAssets.length > 0 
    ? Math.max(1, Math.floor(durationInFrames / validAssets.length)) 
    : durationInFrames;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a' }}>
      {validAssets.length > 0 ? (
        <Series>
          {validAssets.map((asset, index) => {
            // Biarkan asset terakhir memakan sisa frame jika ada pembulatan
            const duration = index === validAssets.length - 1 
              ? durationInFrames - (index * framesPerAsset) 
              : framesPerAsset;

            return (
              <Series.Sequence key={index} durationInFrames={duration}>
                <ImageTransition assetUrl={asset.file_url} durationInFrames={duration} />
              </Series.Sequence>
            );
          })}
        </Series>
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, #1e3a8a, #0f172a)'
        }} />
      )}
      
      {/* Title overlay - hanya jika tidak ada teks narasi */}
      {(!subtitleData || subtitleData.length === 0) && (!fullText) && (
        <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', padding: '160px 80px' }}>
          <h1 style={{ color: 'white', fontSize: 60, fontWeight: 'bold', textAlign: 'center', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            {title || "Vimero AI Video"}
          </h1>
        </AbsoluteFill>
      )}

      {/* Kinetic Typography Subtitles */}
      {subtitleData && subtitleData.length > 0 ? (
        <KineticTypography subtitles={subtitleData} />
      ) : fullText ? (
        <FallbackTypography text={fullText} durationInFrames={durationInFrames} />
      ) : null}

      {/* Placeholder for status jika tidak ada audio (hanya pratinjau mentah) */}
      {!audioUrl && (!subtitleData || subtitleData.length === 0) && (!fullText) && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '80px' }}>
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: '30px 50px',
            borderRadius: 30,
            border: '4px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h2 style={{ color: '#fbbf24', fontSize: 70, fontWeight: '900', textAlign: 'center' }}>
              MENUNGGU AUDIO
            </h2>
          </div>
        </AbsoluteFill>
      )}

      {/* Audio Track */}
      {audioUrl && <Audio src={audioUrl} />}
    </AbsoluteFill>
  );
};

// Komponen helper untuk efek scale-in lambat ala B-Roll
const ImageTransition: React.FC<{ assetUrl: string, durationInFrames: number }> = ({ assetUrl, durationInFrames }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.1], { extrapolateRight: 'clamp' });
  const opacity = interpolate(frame, [0, 15], [0, 0.6], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <Img 
        src={assetUrl} 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover', 
          opacity: opacity, // dark background opacity
          transform: `scale(${scale})`
        }} 
      />
    </AbsoluteFill>
  );
}
