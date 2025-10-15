import { GEMINI_TTS_URL, GEMINI_API_KEY } from './constants';

/**
 * Utility to convert base64 audio data to ArrayBuffer.
 * @param {string} base64 - Base64 encoded string.
 * @returns {ArrayBuffer}
 */
const base64ToArrayBuffer = (base64) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};

/**
 * Utility to convert 16-bit PCM audio buffer to a playable WAV Blob.
 * @param {Int16Array} pcm16 - Signed 16-bit PCM data.
 * @param {number} sampleRate - Sample rate of the audio.
 * @returns {Blob} WAV audio Blob.
 */
const pcmToWav = (pcm16, sampleRate) => {
    const numChannels = 1;
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;

    const buffer = new ArrayBuffer(44 + pcm16.length * bytesPerSample);
    const view = new DataView(buffer);
    let offset = 0;

    // RIFF header
    view.setUint32(offset, 0x52494646, false); offset += 4; // "RIFF"
    view.setUint32(offset, 36 + pcm16.length * bytesPerSample, true); offset += 4; // file size
    view.setUint32(offset, 0x57415645, false); offset += 4; // "WAVE"

    // FMT sub-chunk
    view.setUint32(offset, 0x666d7420, false); offset += 4; // "fmt "
    view.setUint32(offset, 16, true); offset += 4; // sub-chunk size (16 for PCM)
    view.setUint16(offset, 1, true); offset += 2; // audio format (1 = PCM)
    view.setUint16(offset, numChannels, true); offset += 2; // number of channels
    view.setUint32(offset, sampleRate, true); offset += 4; // sample rate
    view.setUint32(offset, byteRate, true); offset += 4; // byte rate
    view.setUint16(offset, blockAlign, true); offset += 2; // block align
    view.setUint16(offset, 16, true); offset += 2; // bits per sample (16-bit)

    // DATA sub-chunk
    view.setUint32(offset, 0x64617461, false); offset += 4; // "data"
    view.setUint32(offset, pcm16.length * bytesPerSample, true); offset += 4; // data size

    // Write PCM data
    for (let i = 0; i < pcm16.length; i++) {
        view.setInt16(offset, pcm16[i], true);
        offset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
};

/**
 * Fetches and plays TTS audio from the Gemini API with exponential backoff.
 * @param {string} text - The text to speak.
 * @param {string} voiceName - The voice to use (e.g., 'Kore', 'Leda').
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 */
export const speak = async (text, voiceName = 'Puck', maxRetries = 3) => {
    // Only attempt to speak if an API key is present
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "") {
        console.warn("TTS skipped: GEMINI_API_KEY is empty or not configured.");
        return;
    }

    const payload = {
        contents: [{
            parts: [{ text: text }]
        }],
        generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voiceName }
                }
            }
        }
    };

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(`${GEMINI_TTS_URL}${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                // Handle rate limiting with exponential backoff
                if (response.status === 429 && attempt < maxRetries - 1) {
                    const delay = Math.pow(2, attempt) * 1000;
                    console.warn(`TTS rate limited. Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue; 
                }
                throw new Error(`TTS API failed with status ${response.status}`);
            }

            const result = await response.json();
            const candidate = result.candidates?.[0];
            
            if (!candidate) {
                throw new Error("TTS API generation failure: No candidate in response.");
            }
            
            const part = candidate.content?.parts?.[0];
            const audioData = part?.inlineData?.data;
            const mimeType = part?.inlineData?.mimeType;

            if (audioData && mimeType && mimeType.startsWith("audio/L16")) {
                const sampleRateMatch = mimeType.match(/rate=(\d+)/);
                const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 24000;
                
                const pcmData = base64ToArrayBuffer(audioData);
                const pcm16 = new Int16Array(pcmData);
                
                const wavBlob = pcmToWav(pcm16, sampleRate);
                const audioUrl = URL.createObjectURL(wavBlob);
                
                const audio = new Audio(audioUrl);
                
                // Clean up the object URL after the audio finishes playing
                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                };
                
                await audio.play().catch(e => {
                    console.error("Error playing audio:", e);
                    URL.revokeObjectURL(audioUrl);
                });
                
                return; // Success, exit the retry loop
            } else {
                throw new Error("Invalid or missing audio data in TTS response.");
            }
        } catch (error) {
            console.error(`TTS attempt ${attempt + 1}/${maxRetries} failed:`, error);
            
            // If this was the last attempt, log final failure
            if (attempt === maxRetries - 1) {
                console.error("TTS failed after all retry attempts.");
            }
        }
    }
};