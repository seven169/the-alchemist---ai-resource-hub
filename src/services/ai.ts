import { GoogleGenAI, Modality } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateImage(prompt: string, size: "1K" | "2K" | "4K" = "1K") {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export async function generateSpeech(text: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Zephyr' },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
}

export async function startChat() {
  const ai = getAI();
  return ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction: "You are The Alchemist, a wise and technical AI assistant for an AI resource hub. You help users with prompts, AI tools, and creative workflows. Your tone is professional, sophisticated, and slightly mysterious.",
    },
  });
}
