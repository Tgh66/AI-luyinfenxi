import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const parseResult = (text: string): AnalysisResult => {
  try {
    // Clean up potential markdown code blocks if the model adds them despite schema
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse JSON", e);
    throw new Error("Invalid response format from AI");
  }
};

export const analyzeSalesCall = async (
  audioBase64: string,
  mimeType: string
): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an expert Sales Coaching AI. 
    Analyze the attached audio recording of a sales call.
    
    Tasks:
    1. Generate a diarized transcript. Identify speakers as "Salesperson" and "Prospect" (or similar roles based on context).
    2. Analyze the sentiment engagement level throughout the call (0-100 scale, where 100 is high excitement/positive agreement, 0 is angry/disengaged). provide distinct data points at regular intervals.
    3. Create a coaching card with 3 specific things the salesperson did well (Strengths) and 3 missed opportunities/areas for improvement.
    4. Provide a brief executive summary.

    Return the data strictly in JSON format matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Using Flash for speed and large context window which fits audio well
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: audioBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcript: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  speaker: { type: Type.STRING },
                  text: { type: Type.STRING },
                  timestamp: { type: Type.STRING, description: "Format MM:SS" },
                },
                required: ["speaker", "text", "timestamp"],
              },
            },
            sentimentGraph: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeOffset: { type: Type.NUMBER, description: "Seconds from start" },
                  label: { type: Type.STRING, description: "Time label MM:SS" },
                  score: { type: Type.NUMBER, description: "0-100 sentiment score" },
                  sentiment: { type: Type.STRING, enum: ["positive", "neutral", "negative"] },
                },
                required: ["timeOffset", "label", "score", "sentiment"],
              },
            },
            coaching: {
              type: Type.OBJECT,
              properties: {
                strengths: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ["title", "description"],
                  },
                },
                improvements: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ["title", "description"],
                  },
                },
                summary: { type: Type.STRING },
              },
              required: ["strengths", "improvements", "summary"],
            },
          },
          required: ["transcript", "sentimentGraph", "coaching"],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response generated");
    }

    return parseResult(response.text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
