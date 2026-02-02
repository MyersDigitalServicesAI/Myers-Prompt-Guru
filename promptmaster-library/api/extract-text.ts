import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, categories } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
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
    Analyze the following text and extract all distinct LLM prompts found within it.
    
    For each prompt:
    1. Generate a concise, catchy Title.
    2. Write a short 1-sentence Description.
    3. Extract the raw Template text. Preserve all [placeholders] exactly as they appear.
    4. Categorize it into exactly one of these categories: ${categories.join(', ')}.
    5. Generate 2-3 relevant tags.

    Input Text:
    ${text}
  `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.0-flash-latest',
            contents: prompt,
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
        console.error("AI Extraction Failed:", error);
        res.status(500).json({ error: error.message || "AI Extraction Failed" });
    }
}
