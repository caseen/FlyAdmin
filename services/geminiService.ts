
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedTicketData } from "../types";

export const extractTicketData = async (base64Pdf: string): Promise<ExtractedTicketData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: base64Pdf,
          },
        },
        {
          text: "Analyze this flight ticket PDF and extract the following information into a valid JSON object: passengers (array of names), segments (From - To), flightDate (YYYY-MM-DD), flightTime (HH:MM), pnr, eTicket, issuedDate (YYYY-MM-DD). If information is missing, use empty strings. Return ONLY the JSON.",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          passengers: { type: Type.ARRAY, items: { type: Type.STRING } },
          segments: { type: Type.STRING },
          flightDate: { type: Type.STRING },
          flightTime: { type: Type.STRING },
          pnr: { type: Type.STRING },
          eTicket: { type: Type.STRING },
          issuedDate: { type: Type.STRING },
        },
        required: ["passengers", "segments", "flightDate", "pnr"]
      },
    },
  });

  try {
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as ExtractedTicketData;
  } catch (error) {
    console.error("Failed to parse AI response", error);
    throw new Error("Failed to extract data from PDF. Please enter details manually.");
  }
};
