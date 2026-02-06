"use server";

import { extractPrompts, type ExtractPromptsOutput } from "@/ai/flows/ai-bulk-import-extract-prompts";
import { extractAndRefineFromImage } from "@/ai/flows/extract-and-refine-from-image";
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

const ScreenshotImportSchema = z.object({
    image: z.string().min(1, "Image data is required."),
  });
  
type ScreenshotImportState = {
  message: string;
  prompts: ExtractPromptsOutput | null;
  error?: boolean;
};
  
  export async function handleScreenshotImport(
    prevState: ScreenshotImportState,
    formData: FormData
  ): Promise<ScreenshotImportState> {
    const validatedFields = ScreenshotImportSchema.safeParse({
      image: formData.get("image"),
    });
  
    if (!validatedFields.success) {
      return {
        message: "Validation failed: Image is required.",
        prompts: null,
        error: true,
      };
    }
  
    try {
      // Step 1: Extract and refine text from the image.
      const refinedText = await extractAndRefineFromImage({ imageDataUri: validatedFields.data.image });
  
      if (!refinedText) {
        return {
          message: "Could not extract or refine text from the image. Please try a different image.",
          prompts: null,
          error: true,
        };
      }

      // Step 2: Extract structured prompts from the refined text.
      const prompts = await extractPrompts({ input: refinedText });

      if (!prompts || prompts.length === 0) {
        return {
          message: "Could not structure the extracted text into prompts. Please try a different image.",
          prompts: null,
          error: true,
        };
      }
      
      return {
        message: "Successfully extracted and structured prompts.",
        prompts,
        error: false,
      };
  
    } catch (e) {
      console.error(e);
      return {
        message: "An unexpected error occurred during the process.",
        prompts: null,
        error: true,
      };
    }
  }
