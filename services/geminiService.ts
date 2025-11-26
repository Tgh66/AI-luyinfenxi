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
    你是一位专业的销售教练 AI。
    请分析附件中的销售通话录音。
    
    任务：
    1. 生成对话逐字稿。识别说话人为“销售员”和“潜在客户”（或根据语境识别角色）。
    2. 分析整个通话的情感参与度（0-100分，100为高度兴奋/积极一致，0为愤怒/不参与）。定期提供不同的数据点。
    3. 创建一个辅导卡片，列出销售员做的好的 3 个具体方面（优势）和 3 个错失的机会/改进领域。
    4. 提供简短的执行摘要。

    请严格按照 JSON 格式返回数据，符合 Schema 定义。
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
                  timestamp: { type: Type.STRING, description: "格式 MM:SS" },
                },
                required: ["speaker", "text", "timestamp"],
              },
            },
            sentimentGraph: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeOffset: { type: Type.NUMBER, description: "距离开始的秒数" },
                  label: { type: Type.STRING, description: "时间标签 MM:SS" },
                  score: { type: Type.NUMBER, description: "0-100 情感得分" },
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