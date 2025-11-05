import { GoogleGenAI, Modality, Type, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateImage = async (
    prompt: string, 
    model: string, 
    aspectRatio: string, 
    numberOfImages: number
) => {
    if (model.startsWith('imagen')) {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt,
            config: {
                numberOfImages,
                aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
                outputMimeType: 'image/png',
            },
        });
        return response.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);
    } else {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: { responseModalities: [Modality.IMAGE] },
        });
        return response.candidates?.[0]?.content?.parts
            .filter(part => part.inlineData)
            .map(part => `data:${part.inlineData!.mimeType};base64,${part.inlineData!.data}`) ?? [];
    }
};

export const editImage = async (base64: string, mimeType: string, prompt: string) => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: base64, mimeType } },
                { text: prompt },
            ],
        },
        config: { responseModalities: [Modality.IMAGE] },
    });

    const resultPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (resultPart?.inlineData) {
        return `data:${resultPart.inlineData.mimeType};base64,${resultPart.inlineData.data}`;
    }
    throw new Error("Could not edit image.");
};

export const textToSpeech = async (text: string, voice: string) => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voice },
                },
            },
        },
    });

    const audioPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (audioPart?.inlineData) {
        return `data:${audioPart.inlineData.mimeType};base64,${audioPart.inlineData.data}`;
    }
    throw new Error("Could not generate audio.");
};


export const imageToText = async (base64: string, mimeType: string) => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: "Extract all text from this image, including text in Arabic and English." },
                { inlineData: { data: base64, mimeType } },
            ],
        },
    });
    return response.text;
};

export const translateText = async (text: string, targetLanguage: 'English' | 'Arabic') => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Translate the following text to ${targetLanguage}:\n\n${text}`,
    });
    return response.text;
};


// For AI Chat
let chatInstance: ReturnType<GoogleGenAI['chats']['create']> | null = null;

export const startChat = () => {
    chatInstance = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are a helpful and creative AI assistant in the Mahmoud-Elhadry AI Studio. Respond in markdown format.',
      },
    });
};

export const sendMessageToChat = async (message: string): Promise<GenerateContentResponse> => {
    if (!chatInstance) {
        startChat();
    }
    return await chatInstance!.sendMessage({ message });
};

export const streamMessageToChat = async (message: string) => {
    if (!chatInstance) {
        startChat();
    }
    return await chatInstance!.sendMessageStream({ message });
};