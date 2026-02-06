'use server';

/**
 * @fileOverview Extracts text from an image, refines it as a prompt, and returns the result.
 *
 * - extractAndRefineFromImage - A function that handles the image-to-refined-prompt process.
 * - ExtractAndRefineFromImageInput - The input type for the function.
 * - ExtractAndRefineFromImageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { guruChatAssistance } from './guru-chat-assistance';

const ExtractAndRefineFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a prompt or set of prompts, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractAndRefineFromImageInput = z.infer<typeof ExtractAndRefineFromImageInputSchema>;

const ExtractAndRefineFromImageOutputSchema = z.string();
export type ExtractAndRefineFromImageOutput = z.infer<typeof ExtractAndRefineFromImageOutputSchema>;


export async function extractAndRefineFromImage(input: ExtractAndRefineFromImageInput): Promise<ExtractAndRefineFromImageOutput> {
  return extractAndRefineFlow(input);
}


const extractAndRefineFlow = ai.defineFlow(
  {
    name: 'extractAndRefineFlow',
    inputSchema: ExtractAndRefineFromImageInputSchema,
    outputSchema: ExtractAndRefineFromImageOutputSchema,
  },
  async (input) => {
    // Step 1: Extract text from image
    const { text: extractedText } = await ai.generate({
        prompt: [
            { text: 'Extract all text from this image. The image contains one or more prompts. Return only the text content.' },
            { media: { url: input.imageDataUri } },
        ],
        model: 'googleai/gemini-2.5-flash',
    });

    if (!extractedText) {
        throw new Error("Could not extract text from the image.");
    }

    // Step 2: Refine the extracted text using the guru
    const refinementQuery = `Please refine the following prompt(s) for accuracy and effectiveness, then return only the refined prompt template, without any of your own conversational text. Just the prompt:\n\n${extractedText}`;
    const refinedText = await guruChatAssistance(refinementQuery);

    return refinedText;
  }
);
