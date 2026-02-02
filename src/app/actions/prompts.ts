"use server";

import { extractPrompts, type ExtractPromptsOutput } from "@/ai/flows/ai-bulk-import-extract-prompts";
import { z } from "zod";

const BulkImportSchema = z.object({
  text: z.string().min(10, "Input text must be at least 10 characters long."),
});

type BulkImportState = {
  message: string;
  prompts: ExtractPromptsOutput | null;
  error?: boolean;
};

export async function handleBulkImport(
  prevState: BulkImportState,
  formData: FormData
): Promise<BulkImportState> {
  const validatedFields = BulkImportSchema.safeParse({
    text: formData.get("text"),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed: " + validatedFields.error.flatten().fieldErrors.text?.[0],
      prompts: null,
      error: true,
    };
  }

  try {
    const prompts = await extractPrompts({ input: validatedFields.data.text });

    if (!prompts || prompts.length === 0) {
      return {
        message: "No prompts could be extracted. Please check your input and try again.",
        prompts: null,
        error: true,
      };
    }

    // Here you would typically save the prompts to Firestore.
    // For this example, we'll just return them to the client.

    return {
      message: `Successfully extracted ${prompts.length} prompts.`,
      prompts,
      error: false,
    };
  } catch (e) {
    console.error(e);
    return {
      message: "An unexpected error occurred while extracting prompts.",
      prompts: null,
      error: true,
    };
  }
}
