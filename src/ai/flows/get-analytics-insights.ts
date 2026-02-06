'use server';

/**
 * @fileOverview Analyzes user prompt interaction data to provide actionable insights.
 * 
 * - getAnalyticsInsight - A function that takes prompt and event data and returns an AI-generated insight.
 * - GetAnalyticsInsightInput - The input type for the function.
 * - GetAnalyticsInsightOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import { type Prompt, type PromptEvent } from '@/lib/types';
import {z} from 'genkit';

const GetAnalyticsInsightInputSchema = z.object({
    prompts: z.array(z.any()), // Using any() because Zod schemas for nested objects are verbose for this use case
    events: z.array(z.any()),
});
export type GetAnalyticsInsightInput = z.infer<typeof GetAnalyticsInsightInputSchema>;

const GetAnalyticsInsightOutputSchema = z.string();
export type GetAnalyticsInsightOutput = z.infer<typeof GetAnalyticsInsightOutputSchema>;

export async function getAnalyticsInsight(input: GetAnalyticsInsightInput): Promise<GetAnalyticsInsightOutput> {
  return getAnalyticsInsightFlow(input);
}

const getAnalyticsInsightFlow = ai.defineFlow(
  {
    name: 'getAnalyticsInsightFlow',
    inputSchema: GetAnalyticsInsightInputSchema,
    outputSchema: GetAnalyticsInsightOutputSchema,
  },
  async ({prompts, events}) => {
    // Basic data processing
    const promptMap = prompts.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
    }, {} as Record<string, Prompt>);

    const copyCount = events.filter(e => e.type === 'copied').length;
    const bookmarkCount = events.filter(e => e.type === 'bookmarked').length;

    const copiedPrompts = events
        .filter(e => e.type === 'copied')
        .map(e => promptMap[e.promptId]?.title)
        .filter(Boolean);

    const bookmarkedPrompts = events
        .filter(e => e.type === 'bookmarked')
        .map(e => promptMap[e.promptId]?.title)
        .filter(Boolean);
    
    // Constructing the prompt for the LLM
    const { text } = await ai.generate({
        prompt: `You are a helpful AI assistant specializing in prompt engineering.
        Analyze the following user interaction data and provide one or two actionable insights to help the user create better prompts.
        The user has copied prompts ${copyCount} times and bookmarked prompts ${bookmarkCount} times.
        
        The most copied prompts are: ${JSON.stringify(copiedPrompts.slice(0, 5))}
        The most bookmarked prompts are: ${JSON.stringify(bookmarkedPrompts.slice(0, 5))}

        Based on this, what is one key takeaway or suggestion you have for the user? Be concise and encouraging. For example: "It looks like your 'Marketing' prompts are getting a lot of use! Consider creating more variations for different social media platforms."
        `,
    });

    return text!;
  }
);
