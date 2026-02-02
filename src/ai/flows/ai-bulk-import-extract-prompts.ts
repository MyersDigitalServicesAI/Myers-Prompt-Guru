'use server';

/**
 * @fileOverview Extracts multiple prompts from a text or image input and formats them into JSON objects.
 *
 * - extractPrompts - A function that extracts prompts from the input and returns them as JSON objects.
 * - ExtractPromptsInput - The input type for the extractPrompts function.
 * - ExtractPromptsOutput - The return type for the extractPrompts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractPromptsInputSchema = z.object({
  input: z.string().describe('Text input containing multiple prompts.'),
});
export type ExtractPromptsInput = z.infer<typeof ExtractPromptsInputSchema>;

const ExtractPromptsOutputSchema = z.array(
  z.object({
    title: z.string().describe('Title of the prompt.'),
    description: z.string().describe('Description of the prompt.'),
    template: z.string().describe('The prompt template.'),
    category: z.string().describe('Category of the prompt.'),
    tags: z.array(z.string()).describe('Tags associated with the prompt.'),
  })
);
export type ExtractPromptsOutput = z.infer<typeof ExtractPromptsOutputSchema>;

export async function extractPrompts(input: ExtractPromptsInput): Promise<ExtractPromptsOutput> {
  return extractPromptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractPromptsPrompt',
  input: {schema: ExtractPromptsInputSchema},
  output: {schema: ExtractPromptsOutputSchema},
  prompt: `You are a prompt extraction expert. You will receive a text input that contains multiple prompts.
Your task is to extract each individual prompt from the text, and format it as a JSON object with the following fields:

- title: A concise title for the prompt.
- description: A brief description of what the prompt does.
- template: The actual prompt text, including any variables enclosed in square brackets (e.g., [variableName]).
- category: The category that best describes the prompt.
- tags: An array of relevant tags for the prompt.

Return a JSON array containing these objects. Be as accurate as possible.

Here is the input text:
{{{input}}}`,
});

const extractPromptsFlow = ai.defineFlow(
  {
    name: 'extractPromptsFlow',
    inputSchema: ExtractPromptsInputSchema,
    outputSchema: ExtractPromptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
