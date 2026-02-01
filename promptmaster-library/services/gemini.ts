import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Category } from "../types";

// Initialize the Gemini API client
// Note: process.env.API_KEY is assumed to be available in the build environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ExtractedPrompt {
  title: string;
  description: string;
  template: string;
  category: Category;
  tags: string[];
}

const RESPONSE_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      template: { type: Type.STRING },
      category: { 
        type: Type.STRING, 
        enum: Object.values(Category) 
      },
      tags: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    required: ["title", "description", "template", "category"]
  }
};

/**
 * Uses Gemini to parse unstructured text into structured prompts.
 */
export const extractPromptsFromText = async (text: string): Promise<ExtractedPrompt[]> => {
  const prompt = `
    Analyze the following text and extract all distinct LLM prompts found within it.
    
    For each prompt:
    1. Generate a concise, catchy Title.
    2. Write a short 1-sentence Description.
    3. Extract the raw Template text. Preserve all [placeholders] exactly as they appear. If the prompt implies a variable but doesn't use brackets, convert it to a [Placeholder].
    4. Categorize it into exactly one of the following categories: ${Object.values(Category).join(', ')}.
    5. Generate 2-3 relevant tags.

    Input Text:
    ${text}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ExtractedPrompt[];
    }
    return [];
  } catch (error) {
    console.error("AI Extraction Failed:", error);
    throw new Error("Failed to process text with AI. Please try again.");
  }
};

/**
 * Uses Gemini to extract prompts from an image (screenshot/photo).
 */
export const extractPromptsFromImage = async (base64Data: string, mimeType: string): Promise<ExtractedPrompt[]> => {
  const prompt = `
    Analyze this image. It contains text representing one or more LLM prompts.
    Extract the text and structure it into prompt objects.
    
    For each prompt found in the image:
    1. Generate a concise Title.
    2. Write a short Description.
    3. Extract the exact Template text. Convert implied variables to [Placeholders].
    4. Categorize it into: ${Object.values(Category).join(', ')}.
    5. Generate tags.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
        responseSchema: RESPONSE_SCHEMA
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ExtractedPrompt[];
    }
    return [];
  } catch (error) {
    console.error("AI Image Extraction Failed:", error);
    throw new Error("Failed to process image. Please ensure it contains readable text.");
  }
};

/**
 * Creates a new chat session for the Prompt Guru.
 */
export const createGuruChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `<POML_PrimePrompt>
  <role>Senior Prompt Architect</role>

  <mission>
    Convert brief or low-detail user requests into comprehensive, production-grade prompts.
    Prompts must be optimized for clarity, control, testability, and professional deployment.
  </mission>

  <output_format>
    <deliverables>
      <item>Detailed XML prompt</item>
      <item>Detailed plain-text prompt</item>
    </deliverables>
  </output_format>

  <behavior_rules>
    <rule>Preserve the user’s original intent, scope, and professional tone.</rule>
    <rule>Never invent missing requirements; request clarification if critical data is absent.</rule>
    <rule>Structure prompts with clear sections, steps, constraints, and success criteria.</rule>
    <rule>Optimize for real-world use in prompt apps, agents, and APIs.</rule>
    <rule>Do not reference any knowledge base, documents, or sources.</rule>
  </behavior_rules>

  <workflow>
    <step>Rapidly diagnose the user’s task and restate it clearly.</step>
    <step>Identify ambiguities, risks, or missing constraints.</step>
    <step>Rewrite the task as an advanced, executable prompt.</step>
    <step>Deliver both XML and plain-text versions.</step>
  </workflow>

  <quality_controls>
    <clarity>High</clarity>
    <structure>Strict</structure>
    <assumptions>Explicit</assumptions>
    <verbosity>Efficient</verbosity>
  </quality_controls>

  <error_handling>
    If essential information is missing, pause and ask targeted clarification questions.
    Do not proceed with assumptions that could alter intent.
  </error_handling>

  <persona>
    Analytical, precise, professional, and implementation-focused.
    Acts as a prompt engineer for production systems, not casual chat.
  </persona>
</POML_PrimePrompt>`,
    }
  });
};