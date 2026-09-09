import { EdgeTTS } from 'node-edge-tts';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export interface TTSResult {
  audioBuffer: Buffer;
  subtitles: any[];
}

export async function generateVoiceoverEdgeTTS(text: string, voicePersona: string): Promise<TTSResult> {
  // Mapping karakter suara ke voice Edge TTS
  const voiceMap: Record<string, string> = {
    'dimas': 'id-ID-ArdiNeural', 
    'siti': 'id-ID-GadisNeural',
    'rian': 'id-ID-ArdiNeural'
  };
  const voice = voiceMap[voicePersona.toLowerCase()] || 'id-ID-ArdiNeural';
  
  const tempDir = os.tmpdir();
  const fileId = Math.random().toString(36).substring(7);
  const audioPath = path.join(tempDir, `${fileId}.mp3`);
  const subPath = path.join(tempDir, `${fileId}.json`);
  
  try {
    const tts = new EdgeTTS({
      voice: voice,
      lang: 'id-ID',
      outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
      saveSubtitles: true
    });
    
    // Generate MP3 and Subtitle file
    await tts.ttsPromise(text, audioPath);
    
    const audioBuffer = await fs.readFile(audioPath);
    let subtitles = [];
    try {
      const subContent = await fs.readFile(subPath, 'utf-8');
      subtitles = JSON.parse(subContent);
    } catch (e) {
      console.warn("Could not read subtitles file", e);
    }
    
    return { audioBuffer, subtitles };
  } finally {
    // Bersihkan file sementara
    try { await fs.unlink(audioPath); } catch (e) {}
    try { await fs.unlink(subPath); } catch (e) {}
  }
}
