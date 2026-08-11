import { env } from "../config/env.js";

const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

/** Synthesizes Arabic (or any language ElevenLabs' multilingual model supports) narration.
 *  Requires ELEVENLABS_API_KEY to be set; ELEVENLABS_VOICE_ID defaults to a generic multilingual
 *  voice -- swap it for a specific Egyptian-Arabic voice ID from your ElevenLabs account whenever
 *  you want, no code change needed. */
export async function synthesizeSpeech(text: string): Promise<Buffer> {
  if (!env.ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is not configured");
  }

  const res = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${env.ELEVENLABS_VOICE_ID}`, {
    method: "POST",
    headers: {
      "xi-api-key": env.ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75, use_speaker_boost: true },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`ElevenLabs TTS request failed (${res.status}): ${detail.slice(0, 300)}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
