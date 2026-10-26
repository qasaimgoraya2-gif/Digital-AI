import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Chat endpoint (Gemini 3.8 Flash)
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { messages, userMessage, imageBase64, language, voiceType, isVoiceMode } = req.body;

    if (!userMessage && !imageBase64 && (!messages || messages.length === 0)) {
      return res.status(400).json({ error: 'No message provided' });
    }

    if (!ai) {
      // Graceful conversational response if API key is pending configuration
      const simulatedResponses: Record<string, string> = {
        Urdu: "وعلیکم السلام! میں Q AI ہوں۔ میں آپ کی کس طرح مدد کر سکتا ہوں؟",
        Hindi: "नमस्ते! मैं Q AI हूँ। मैं आज आपकी क्या सहायता कर सकता हूँ?",
        Pashto: "سلام! زه Q AI یم. زه نن ستاسو څه ډول مرسته کولی شم؟",
        English: "Hello! I'm Q AI, your personal AI assistant. How can I help you today?",
      };
      const reply = simulatedResponses[language] || simulatedResponses.English;
      return res.json({
        reply,
        note: 'AI Studio API key is not set; providing built-in response.',
      });
    }

    // Build system instruction based on language, voice personality, and mode
    const langInstructions: Record<string, string> = {
      Urdu: 'Respond in natural, polite Urdu (اردو). You are Q AI, a friendly, intelligent personal AI assistant. Give very fast, direct, 1-sentence spoken replies.',
      Hindi: 'Respond in natural, friendly Hindi (हिन्दी). You are Q AI, a friendly, intelligent personal AI assistant. Give very fast, direct, 1-sentence spoken replies.',
      Pashto: 'Respond in natural, polite Pashto (پښتو). You are Q AI, a friendly, intelligent personal AI assistant. Give very fast, direct, 1-sentence spoken replies.',
      English: 'Respond in concise, natural, friendly English. You are Q AI, a helpful, intelligent personal AI assistant. Keep responses short and punchy.',
    };

    const personality = voiceType || 'Female (Soft)';
    const voiceModeInstruction = isVoiceMode
      ? ' This is live voice: speak directly in 1 short clear sentence (maximum 15-20 words) so it can be spoken out immediately without waiting.'
      : ' Format responses cleanly with brief paragraphs.';

    const systemInstruction = `${langInstructions[language || 'English'] || langInstructions.English} Persona: ${personality}.${voiceModeInstruction}`;

    // Format chat contents with optional image
    let contents: any[] = [];
    const latestUserParts: any[] = [];

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
      latestUserParts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    latestUserParts.push({
      text: userMessage || (imageBase64 ? 'Please describe this screenshot or image and tell me what you see.' : 'Hello'),
    });

    if (Array.isArray(messages) && messages.length > 0) {
      contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));
      contents.push({ role: 'user', parts: latestUserParts });
    } else {
      contents = latestUserParts;
    }

    // Helper for timeout (12 seconds)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out')), 12000)
    );

    const callPromise = ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents,
      config: {
        systemInstruction,
        temperature: 0.5,
        maxOutputTokens: isVoiceMode ? 55 : 250,
      },
    });

    const response = await Promise.race([callPromise, timeoutPromise]);
    const reply = response.text?.trim() || "I'm listening and ready to help!";
    return res.json({ reply });
  } catch (err: any) {
    console.error('Chat error:', err.message || err);
    const fallbackAnswers: Record<string, string> = {
      Urdu: 'جی ہاں! میں آپ کی مدد کے لیے تیار ہوں۔',
      Hindi: 'हाँ! मैं आपकी सहायता के लिए तैयार हूँ।',
      Pashto: 'هو! زه دلته ستاسو د مرستې لپاره چمتو یم.',
      English: "I'm right here with you! How can I help?",
    };
    const lang = req.body?.language || 'English';
    const fallback = fallbackAnswers[lang] || fallbackAnswers.English;
    return res.json({
      reply: fallback,
      warning: err.message,
    });
  }
});

// Text-to-Speech endpoint (Gemini 3.8 Flash Lite TTS with fallback)
app.post('/api/gemini/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceType, language } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Missing text parameter' });
    }

    // Map Voice Type to Gemini Prebuilt voices ('Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr')
    let voiceName = 'Kore'; // Female (Soft)
    if (voiceType === 'Male (Deep)') {
      voiceName = 'Fenrir';
    } else if (voiceType === 'Female (Energetic)') {
      voiceName = 'Puck';
    } else if (voiceType === 'Male (Calm)') {
      voiceName = 'Charon';
    } else if (voiceType === 'Female (Soft)') {
      voiceName = 'Kore';
    }

    if (!ai) {
      return res.json({
        fallbackToSpeechSynthesis: true,
        text,
        voiceName,
        language,
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [{ text }],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioBase64) {
        return res.json({
          audioBase64,
          mimeType: 'audio/wav',
          fallbackToSpeechSynthesis: false,
        });
      }
    } catch (ttsErr: any) {
      console.warn('Gemini TTS warning, falling back to speech synthesis:', ttsErr.message);
    }

    // If Gemini TTS wasn't available or errored, tell client to use Web Speech Synthesis
    return res.json({
      fallbackToSpeechSynthesis: true,
      text,
      voiceName,
      language,
    });
  } catch (err: any) {
    console.error('TTS error:', err);
    return res.status(500).json({
      fallbackToSpeechSynthesis: true,
      error: err.message,
    });
  }
});

// Audio Transcription endpoint (Gemini 3.5 Transcribe)
app.post('/api/gemini/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'Missing audioBase64 data' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured. Please use browser speech recognition.',
      });
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          { text: 'Transcribe the spoken words verbatim. Do not add explanations or formatting.' },
        ],
      },
    });

    const transcription = response.text?.trim() || '';
    return res.json({ transcription });
  } catch (err: any) {
    console.error('Transcription error:', err);
    return res.status(500).json({
      error: err.message || 'Transcription failed',
    });
  }
});

// Setup Vite development middleware or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Q AI server running at http://0.0.0.0:${port}`);
  });
}

startServer();
