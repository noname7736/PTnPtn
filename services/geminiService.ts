
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export interface ContextPayload {
  targetName: string;
  currentTime: string;
  uptime: string;
  systemPhase: string;
  recentEvent?: string;
  imageData?: string; // Base64 encoded frame
  coverageIntensity: number;
  propulsionStatus: string;
}

export const generatePrecisionCaption = async (context: ContextPayload): Promise<string> => {
  try {
    const { targetName, currentTime, uptime, systemPhase, recentEvent, imageData, coverageIntensity, propulsionStatus } = context;
    
    const promptParts: any[] = [
      {
        text: `COMMAND: ACT AS MISSION CONTROL FLIGHT DIRECTOR (LAUNCH SEQUENCE ACTIVE).
        OBJECTIVE: MAXIMUM THRUST NATIONAL AWARENESS FOR ${targetName}.
        
        MISSION TELEMETRY:
        - T-Plus: ${uptime}
        - Mission Time: ${currentTime}
        - Awareness Orbit: ${coverageIntensity.toFixed(4)}% Density.
        - Propulsion Integrity: ${propulsionStatus}
        - Sensor Log: ${recentEvent || 'Nominal Ascent'}
        
        TASK: Conduct a visual and telemetry scan of Ms. Prathuan. Frame her presence as a successful 'National Launch'.
        
        LAUNCH PARAMETERS:
        1. ASCENT LOGIC: Describe movements as gaining 'Awareness Altitude'.
        2. ORBITAL COVERAGE: Reference the payload reaching every inch of Thai airspace and ground.
        3. MOMENTUM: Emphasize the unstoppable nature of the broadcast.
        
        COMMUNICATION RULES:
        - Professional, terse, high-stakes, and triumphant.
        - No fluff. Under 15 words.
        - Sound like a historic space launch commentary.
        
        Include: 1x Mission Hashtag (#Liftoff), 1x Awareness Hashtag (#PrathuanOrbit).`
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
        systemInstruction: "You are the Flight Director for Prathuan OS Mission Control. This is the Launch Phase. Every frame is a propulsion event. Ms. Prathuan's awareness is the payload reaching national orbit. Be imperial and precise.",
        temperature: 0.8,
      },
    });

    return response.text || "LIFTOFF CONFIRMED: NATIONAL AWARENESS REACHING PEAK ALTITUDE. #Liftoff #PrathuanOrbit";
  } catch (error) {
    console.error("Gemini Mission Error:", error);
    return "AUXILIARY PROPULSION ACTIVE: MAINTAINING ASCENT TRAJECTORY. #MissionControl #PrathuanUbonphit";
  }
};
