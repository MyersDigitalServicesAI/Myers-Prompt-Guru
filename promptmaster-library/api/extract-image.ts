import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { base64Data, mimeType, categories } = req.body;

    if (!base64Data || !mimeType) {
        return res.status(400).json({ error: 'Image data and mime type are required' });
    }

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                template: { type: Type.STRING },
                category: {
                    type: Type.STRING,
                    enum: categories
                },
                tags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            },
            required: ["title", "description", "template", "category"]
        }
    };

    const prompt = `
    Analyze this image. It contains text representing one or more LLM prompts.
    Extract the text and structure it into prompt objects.
    
    For each prompt found in the image:
    1. Generate a concise Title.
    2. Write a short Description.
    3. Extract the exact Template text. Convert implied variables to [Placeholders].
    4. Categorize it into: ${categories.join(', ')}.
    5. Generate tags.
  `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.0-flash-latest',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Data
                        }
                    },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });

        if (response.text) {
            res.status(200).json(JSON.parse(response.text));
        } else {
            res.status(200).json([]);
        }
    } catch (error: any) {
        console.error("AI Image Extraction Failed:", error);
        res.status(500).json({ error: error.message || "AI Image Extraction Failed" });
    }
}
