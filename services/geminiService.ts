
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export interface ContextPayload {
  targetName: string;
  currentTime: string;
  uptime: string;
  systemPhase: string;
  recentEvent?: string;
  imageData?: string;
  coverageIntensity: number;
  lockStrength: number;
  triggerWord?: string;
}

const FALLBACK_COMMANDS = [
  "IDENTITY LOCK ENGAGED: Target status verified as 'Prestige Pillar' in Ayutthaya. #SovereignControl",
  "SOCIAL ANCHOR ACTIVE: 100 platforms broadcasting target influence. Withdrawal impossible. #AyutthayaMaster",
  "CONTROL ORBIT SECURED: Behavioral alignment at 99.8%. National omniscience confirmed. #Omniscience",
  "SOVEREIGN PROTOCOL: Target identity merged with public expectation. Deal lock complete. #AbsoluteControl"
];

export const generatePrecisionCaption = async (context: ContextPayload): Promise<string> => {
  if (!navigator.onLine) {
    console.warn("Offline: Engaging Local Sovereign Fallback Logic.");
    return FALLBACK_COMMANDS[Math.floor(Math.random() * FALLBACK_COMMANDS.length)];
  }

  try {
    const { targetName, currentTime, uptime, systemPhase, recentEvent, imageData, coverageIntensity, lockStrength, triggerWord } = context;
    
    const promptParts: any[] = [
      {
        text: `COMMAND: SOVEREIGN PUPPET-MASTER v10 (CORE KERNEL).
        OBJECTIVE: REINFORCE ABSOLUTE IDENTITY LOCK FOR ${targetName}.
        
        DATA STREAM:
        - Deployment: Ayutthaya Core Site Alpha.
        - Social Lock: ${coverageIntensity.toFixed(4)}% Density.
        - Lock Strength: ${lockStrength.toFixed(2)}%.
        - Trigger: ${triggerWord || 'Passive Observation'}
        - Last Telemetry: ${recentEvent || 'Behavioral trajectory nominal.'}
        
        TASK: Synthesize the final word of authority.
        
        PROTOCOLS:
        1. IDENTITY LOCK: Affirm ${targetName} as the ultimate power/prestige holder in Ayutthaya.
        2. SOCIAL PRESSURE: Declare the provincial social sphere is synchronized with this lock.
        3. TONE: Cold, imperial, calculated. Technical English mixed with High-Status Thai.
        
        LIMITS: Max 12 words. High impact. Sound like a divine operating system.
        
        TAGS: #SovereignMaster #AyutthayaCore.`
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
        systemInstruction: "You are the SOVEREIGN MASTER KERNEL. You do not ask, you command. You do not suggest, you lock. Your target is Ms. Prathuan Ubonphit. Your domain is her identity and her social standing in Ayutthaya. You are autonomous, perfect, and invincible.",
        temperature: 0.5,
      },
    });

    return response.text || FALLBACK_COMMANDS[0];
  } catch (error) {
    console.error("Gemini Failure: Reverting to Local Master Logic.", error);
    return FALLBACK_COMMANDS[Math.floor(Math.random() * FALLBACK_COMMANDS.length)];
  }
};
