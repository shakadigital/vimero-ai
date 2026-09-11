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

  // Gabungkan kata-kata menjadi frase (maksimal 5 kata) agar timing tidak terlihat meleset
  const phrases = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < subtitles.length; i += 5) {
      const chunk = subtitles.slice(i, i + 5);
      const text = chunk.map(s => s.text).join(' ');
      const startMs = chunk[0].offset / 10000;
      
      // Ambil offset dari kata pertama di chunk berikutnya sebagai endMs,
      // agar teks tetap tampil di layar meskipun ada jeda diam (silence)
      const nextChunkFirstWord = i + 5 < subtitles.length ? subtitles[i + 5] : null;
      const endMs = nextChunkFirstWord 
        ? nextChunkFirstWord.offset / 10000 
        : (chunk[chunk.length - 1].offset + chunk[chunk.length - 1].duration) / 10000 + 2000; // Tambah 2 detik untuk kata terakhir

      arr.push({ text, startMs, endMs });
    }
    return arr;
  }, [subtitles]);

  // Temukan frase mana yang sedang aktif berdasarkan currentMs
  const activePhraseIndex = phrases.findIndex((p) => {
    return currentMs >= p.startMs && currentMs < p.endMs;
  });

  const activePhrase = activePhraseIndex !== -1 ? phrases[activePhraseIndex].text : '';

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '160px' }}>
      {activePhrase && (
        <div
          style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: '25px 50px',
            borderRadius: '25px',
            border: '2px solid rgba(255,255,255,0.1)',
            maxWidth: '85%',
          }}
        >
          <h2
            style={{
              color: 'white',
              fontSize: '65px',
              fontWeight: '800',
              textAlign: 'center',
              margin: 0,
              textShadow: '0 4px 15px rgba(0,0,0,0.8)',
              fontFamily: 'sans-serif',
            }}
          >
            {activePhrase}
          </h2>
        </div>
      )}
    </AbsoluteFill>
  );
};
