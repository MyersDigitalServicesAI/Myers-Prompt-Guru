"use server";

import { guruChatAssistance } from "@/ai/flows/guru-chat-assistance";
import { z } from "zod";

const ChatSchema = z.object({
  query: z.string().min(1, "Query cannot be empty."),
});

export async function handleChat(prevState: any, formData: FormData) {
  const validatedFields = ChatSchema.safeParse({
    query: formData.get("query"),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid query.",
      response: null,
      query: formData.get("query"),
    };
  }
  
  try {
    const response = await guruChatAssistance(validatedFields.data.query);
    return {
      message: "Success",
      response: response,
      query: validatedFields.data.query,
    };
  } catch (error) {
    console.error(error);
    return {
      message: "An error occurred.",
      response: "Sorry, I couldn't process that. Please try again.",
      query: validatedFields.data.query,
    };
  }
}
