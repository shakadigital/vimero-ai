import { AbsoluteFill, Audio, Img, Video, useCurrentFrame, useVideoConfig, Series, interpolate } from 'remotion';
import React from 'react';
import { KineticTypography } from './KineticTypography';

export type VerticalVideoProps = {
  audioUrl?: string | null;
  subtitleData?: SubtitleToken[];
  mediaAssets?: MediaAsset[];
  title?: string;
  fullText?: string;
  contentSegments?: { hook: number, body: number, cta: number };
};

type SubtitleToken = {
  text: string;
  offset: number;
  duration: number;
};

type MediaAsset = {
  file_url: string;
  type?: string;
};

export const VerticalVideo: React.FC<VerticalVideoProps> = ({ audioUrl, subtitleData, mediaAssets, title, fullText }) => {
  const { durationInFrames } = useVideoConfig();

  // Filter out invalid assets
  const validAssets = mediaAssets?.filter(a => a?.file_url) || [];
  
  // Calculate proportional durations based on sentence lengths
  let durations: number[] = [];
  
  if (validAssets.length > 0) {
    const sentences = (fullText || '').split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    
    if (sentences.length >= validAssets.length && sentences.length > 1) {
      // Group sentences into chunks based on number of assets
      const chunks: string[] = [];
      const sentencesPerChunk = sentences.length / validAssets.length;
      
      let currentChunk = '';
      let chunkIndex = 0;
      
      for (let i = 0; i < sentences.length; i++) {
        currentChunk += sentences[i] + ' ';
        if (i + 1 >= Math.round((chunkIndex + 1) * sentencesPerChunk) && chunkIndex < validAssets.length - 1) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
          chunkIndex++;
        }
      }
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
      }
      
      const totalChars = chunks.reduce((acc, c) => acc + c.length, 0) || 1;
      durations = validAssets.map((_, index) => {
        if (index === validAssets.length - 1) {
          return durationInFrames - durations.reduce((total, duration) => total + duration, 0);
        }
        const chunkLength = chunks[index]?.length || (totalChars / validAssets.length);
        return Math.floor((chunkLength / totalChars) * durationInFrames);
      });
    } else {
      // Fallback rata jika kalimat terlalu sedikit
      const framesPerAsset = Math.floor(durationInFrames / validAssets.length);
      durations = validAssets.map((_, index) => 
        index === validAssets.length - 1 ? durationInFrames - (index * framesPerAsset) : framesPerAsset
      );
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a' }}>
      {validAssets.length > 0 ? (
        <Series>
          {validAssets.map((asset, index) => {
            const duration = durations[index];

            return (
              <Series.Sequence key={index} durationInFrames={duration}>
                <MediaTransition asset={asset} durationInFrames={duration} />
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

// Komponen helper untuk efek transisi aset (Video atau Gambar)
const MediaTransition: React.FC<{ asset: MediaAsset, durationInFrames: number }> = ({ asset, durationInFrames }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.1], { extrapolateRight: 'clamp' });
  const opacity = interpolate(frame, [0, 15], [0, 0.6], { extrapolateRight: 'clamp' });
  const isVideo = asset.type === 'video' || asset.file_url.endsWith('.mp4');

  return (
    <AbsoluteFill>
      {isVideo ? (
        <Video 
          src={asset.file_url}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: opacity,
            transform: `scale(${scale})`
          }}
          muted
          loop
        />
      ) : (
        <Img 
          src={asset.file_url} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            opacity: opacity,
            transform: `scale(${scale})`
          }} 
        />
      )}
    </AbsoluteFill>
  );
}

// Komponen helper untuk efek teks dinamis jika TTS gagal memberikan data subtitle
const FallbackTypography: React.FC<{ text: string, durationInFrames: number }> = ({ text, durationInFrames }) => {
  const frame = useCurrentFrame();
  const words = text.split(' ').filter(w => w.trim() !== '');
  if (words.length === 0) return null;
  
  // Gabungkan kata-kata menjadi frase (maksimal 5 kata)
  const phrases: string[] = [];
  for (let i = 0; i < words.length; i += 5) {
    phrases.push(words.slice(i, i + 5).join(' '));
  }

  // Asumsikan padding 30 frame (1 detik) di awal dan akhir
  const activeDuration = Math.max(1, durationInFrames - 60); 
  const framesPerPhrase = activeDuration / phrases.length;
  
  const currentPhraseIndex = Math.floor((frame - 30) / framesPerPhrase);
  
  // Tampilkan kata jika berada di dalam rentang
  const activePhrase = currentPhraseIndex >= 0 && currentPhraseIndex < phrases.length ? phrases[currentPhraseIndex] : '';

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '160px' }}>
      {activePhrase && (
        <div style={{ backgroundColor: 'rgba(0,0,0,0.6)', padding: '25px 50px', borderRadius: '25px', border: '2px solid rgba(255,255,255,0.1)', maxWidth: '85%' }}>
          <h2 style={{ color: 'white', fontSize: '65px', fontWeight: '800', textAlign: 'center', margin: 0, textShadow: '0 4px 15px rgba(0,0,0,0.8)' }}>
            {activePhrase}
          </h2>
        </div>
      )}
    </AbsoluteFill>
  );
}
