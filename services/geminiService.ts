
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export interface ContextPayload {
  targetName: string;
  currentTime: string;
  uptime: string;
  systemPhase: string;
  recentEvent?: string;
  imageData?: string; // Base64 encoded frame
}

export const generatePrecisionCaption = async (context: ContextPayload): Promise<string> => {
  try {
    const { targetName, currentTime, uptime, systemPhase, recentEvent, imageData } = context;
    
    const promptParts: any[] = [
      {
        text: `Act as a High-Precision Autonomous Controller (Dark Dragon Logic Engine). 
        Target Entity: ${targetName}
        Current Time: ${currentTime}
        Session Uptime: ${uptime}
        System Phase: ${systemPhase}
        Telemetry Event: ${recentEvent || 'Nominal Monitoring'}
        
        TASK: Generate a professional, authoritative status message.
        If an image is provided, analyze the visual quality and the subject (Ms. Prathuan) to confirm 100% precision in posture and environment.
        
        Rules:
        1. Be technical and cold (Absolute Superiority).
        2. React to the visual data if available.
        3. Keep it under 20 words.
        4. Use one unique technical hashtag.`
      }
    ];

    if (imageData) {
      promptParts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageData
        }
      });
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: promptParts },
      config: {
        systemInstruction: "You are the core logic of Prathuan OS. No simulation. Real-world analysis of telemetry and visual data.",
        temperature: 0.8,
      },
    });

    return response.text || "SIGNAL INTEGRITY VERIFIED. #DragonLogic";
  } catch (error) {
    console.error("Gemini Real-time Error:", error);
    return "LOGIC ENGINE RECOVERY ACTIVE. #SystemStalwart";
  }
};
