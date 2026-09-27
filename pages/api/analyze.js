import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Server is missing GEMINI_API_KEY.",
      });
    }

    const {
      text = "",
      language = "English",
      file = null,
    } = req.body || {};

    if (!text.trim() && !file) {
      return res.status(400).json({
        error: "No form content provided.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
You are FormSathi AI, a multilingual form explainer for a social-good hackathon.

Analyze ONLY the supplied form/document.

Explain it in ${language}, using very simple language.

Never invent eligibility, deadlines, fees, offices, documents, benefits,
legal rights, medical advice, or facts not present in the source.

If something is unclear, explicitly say it is unclear and should be
verified with the official office.

You do NOT approve, reject, diagnose, or make final decisions.
A human or official is the final authority.

Return concise structured JSON matching the requested schema.
`;

    const parts = [{ text: prompt }];

    if (text.trim()) {
      parts.push({
        text: "FORM TEXT:\n" + text.slice(0, 30000),
      });
    }

    if (file?.base64 && file?.mimeType) {
      parts.push({
        inlineData: {
          mimeType: file.mimeType,
          data: file.base64,
        },
      });
    }

    const response = await ai.models.generateContent({
     model: "gemini-3.5-flash-lite",

      contents: [
        {
          role: "user",
          parts,
        },
      ],

      config: {
        responseMimeType: "application/json",

        responseSchema: {
          type: "object",

          properties: {
            title: {
              type: "string",
            },

            purpose: {
              type: "string",
            },

            fields: {
              type: "array",
              items: {
                type: "string",
              },
            },

            documents: {
              type: "array",
              items: {
                type: "string",
              },
            },

            steps: {
              type: "array",
              items: {
                type: "string",
              },
            },

            cautions: {
              type: "array",
              items: {
                type: "string",
              },
            },

            disclaimer: {
              type: "string",
            },
          },

          required: [
            "title",
            "purpose",
            "fields",
            "documents",
            "steps",
            "cautions",
            "disclaimer",
          ],
        },
      },
    });

    const result = JSON.parse(response.text);

    return res.status(200).json(result);

  } catch (error) {
    console.error("FormSathi Gemini Error:", error);

    return res.status(500).json({
      error:
        "Gemini analysis failed. Check API key, quota, model availability, and file type. " +
        (error?.message || ""),
    });
  }
}