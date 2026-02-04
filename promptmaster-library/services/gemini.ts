import { Category } from "../types";

export interface ExtractedPrompt {
  title: string;
  description: string;
  template: string;
  category: Category;
  tags: string[];
}

/**
 * Uses the backend API to parse unstructured text into structured prompts.
 */
export const extractPromptsFromText = async (text: string): Promise<ExtractedPrompt[]> => {
  const response = await fetch('/api/extract-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, categories: Object.values(Category) })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "AI Extraction Failed");
  }

  return response.json();
};

/**
 * Uses the backend API to extract prompts from an image (screenshot/photo).
 */
export const extractPromptsFromImage = async (base64Data: string, mimeType: string): Promise<ExtractedPrompt[]> => {
  const response = await fetch('/api/extract-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Data, mimeType, categories: Object.values(Category) })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "AI Image Extraction Failed");
  }

  return response.json();
};

/**
 * Placeholder for Guru Chat functionality.
 * The actual chat logic is handled in GuruChat.tsx calling /api/guru-chat.
 */
export const sendGuruMessage = async (messages: { role: string; text: string }[]) => {
  const response = await fetch('/api/guru-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Guru Chat Failed");
  }

  return response.json();
};
