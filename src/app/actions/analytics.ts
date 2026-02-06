"use server";

import { getAnalyticsInsight } from "@/ai/flows/get-analytics-insights";
import { z } from "zod";
import { type Prompt, type PromptEvent } from "@/lib/types";

const InsightSchema = z.object({
  prompts: z.any(), // Zod doesn't have a great way to validate complex array objects from FormData
  events: z.any(),
});


export async function handleInsight(prevState: any, formData: FormData) {
    const prompts = JSON.parse(formData.get("prompts") as string) as Prompt[];
    const events = JSON.parse(formData.get("events") as string) as PromptEvent[];
  
    if (!prompts || !events) {
        return {
            message: "Invalid input.",
            response: null,
        };
    }
  
  try {
    const response = await getAnalyticsInsight({ prompts, events });
    return {
      message: "Success",
      response: response,
    };
  } catch (error) {
    console.error(error);
    return {
      message: "An error occurred.",
      response: "Sorry, I couldn't generate an insight at this time. Please try again.",
    };
  }
}