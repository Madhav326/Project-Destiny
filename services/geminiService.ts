
import { GoogleGenAI, Type } from "@google/genai";
import { DesignState, AiResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDesignDescription = async (design: DesignState): Promise<AiResponse> => {
  // Use gemini-3-flash-preview for product description generation task as it is recommended for Basic Text Tasks
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are a luxury jewelry copywriter for a high-end brand called "Lumière".
    Create a compelling product description for a custom pendant that fuses the letters "${design.letter1}" and "${design.letter2}".
    The piece is made of ${design.metal}.
    The design is a "Shadow Illusion" where the pendant looks like "${design.letter1}" from the front and "${design.letter2}" from the side.
    
    Output JSON with:
    - title: A short, poetic name for the piece.
    - description: A 2-sentence evocative description emphasizing the connection between the two letters and the material quality.
    - priceEstimate: A realistic price estimate string (e.g. "$1,200").
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            priceEstimate: { type: Type.STRING }
          },
          required: ["title", "description", "priceEstimate"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AiResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      title: "The Union Collection",
      description: "A timeless piece celebrating the unique bond between two distinct characters, crafted in fine metal.",
      priceEstimate: "$TBD"
    };
  }
};
