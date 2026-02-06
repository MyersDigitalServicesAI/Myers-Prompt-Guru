'use server';

/**
 * @fileOverview Implements the GuruChat assistance flow for refining or creating prompts.
 *
 * - guruChatAssistance - A function that takes a user query and returns AI-assisted prompt refinements or new prompts.
 * - GuruChatAssistanceInput - The input type for the guruChatAssistance function (just a string query).
 * - GuruChatAssistanceOutput - The return type for the guruChatAssistance function (a string response).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GuruChatAssistanceInputSchema = z.string();
export type GuruChatAssistanceInput = z.infer<typeof GuruChatAssistanceInputSchema>;

const GuruChatAssistanceOutputSchema = z.string();
export type GuruChatAssistanceOutput = z.infer<typeof GuruChatAssistanceOutputSchema>;

export async function guruChatAssistance(query: GuruChatAssistanceInput): Promise<GuruChatAssistanceOutput> {
  return guruChatAssistanceFlow(query);
}

const prompt = ai.definePrompt({
  name: 'guruChatAssistancePrompt',
  input: {schema: GuruChatAssistanceInputSchema},
  output: {schema: GuruChatAssistanceOutputSchema},
  prompt: `You are a Senior Prompt Architect. A user is asking for your help refining or creating prompts.
  Here is their query:
  {{{input}}}
  Provide a detailed and helpful response. If the user asks you to create a prompt, generate a valid prompt.
`,
});

const guruChatAssistanceFlow = ai.defineFlow(
  {
    name: 'guruChatAssistanceFlow',
    inputSchema: GuruChatAssistanceInputSchema,
    outputSchema: GuruChatAssistanceOutputSchema,
  },
  async input => {
    const {text} = await ai.generate({
      prompt: `You are a Senior Prompt Architect. A user is asking for your help refining or creating prompts.\n      Here is their query:\n      ${input}\n      Provide a detailed and helpful response. If the user asks you to create a prompt, generate a valid prompt.`,
    });
    return text!;
  }
);
