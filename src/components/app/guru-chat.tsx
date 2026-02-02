"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Bot, Loader2, Send, Sparkles, User } from "lucide-react";

import { handleChat } from "@/app/actions/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
      <span className="sr-only">Send message</span>
    </Button>
  );
}

export function GuruChat() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const formRef = React.useRef<HTMLFormElement>(null);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  const [formState, formAction] = React.useActionState(handleChat, {
    message: "",
    response: null,
    query: "",
  });

  React.useEffect(() => {
    if (formState.message === "Success" && formState.response) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: formState.query as string },
        { role: "assistant", content: formState.response },
      ]);
      formRef.current?.reset();
    }
  }, [formState]);
  
  React.useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="default"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        >
          <Sparkles className="h-6 w-6" />
          <span className="sr-only">Open Guru Chat</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Guru Chat</SheetTitle>
          <SheetDescription>
            Your Senior Prompt Architect. Ask for help refining or creating
            prompts.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
                <div className="space-y-4 pr-4">
                {messages.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                    <Avatar className="mb-4 h-16 w-16">
                        <AvatarFallback>
                        <Bot className="h-8 w-8" />
                        </AvatarFallback>
                    </Avatar>
                    <p className="text-lg font-medium">How can I help you?</p>
                    <p className="text-sm text-muted-foreground">
                        e.g., "Create a prompt to generate a marketing slogan"
                    </p>
                    </div>
                )}
                {messages.map((message, index) => (
                    <div key={index} className={cn("flex items-start gap-3", message.role === "user" && "justify-end")}>
                        {message.role === "assistant" && (
                             <Avatar className="h-8 w-8">
                                <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                            </Avatar>
                        )}
                        <div className={cn("max-w-xs rounded-lg p-3 text-sm", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary")}>
                            {message.content}
                        </div>
                         {message.role === "user" && (
                             <Avatar className="h-8 w-8">
                                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))}
                </div>
            </ScrollArea>
        </div>
        <div className="mt-4">
          <form
            ref={formRef}
            action={formAction}
            className="flex items-center gap-2"
          >
            <Input
              name="query"
              placeholder="Ask the Guru..."
              className="flex-1"
              autoComplete="off"
            />
            <SubmitButton />
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
