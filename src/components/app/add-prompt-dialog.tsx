"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { handleBulkImport } from "@/app/actions/prompts";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "../ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ScrollArea } from "../ui/scroll-area";
import { type ExtractPromptsOutput } from "@/ai/flows/ai-bulk-import-extract-prompts";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      Extract Prompts
    </Button>
  );
}

function ExtractedPrompts({ prompts }: { prompts: ExtractPromptsOutput }) {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertTitle>Extraction Successful!</AlertTitle>
        <AlertDescription>
          {`We found ${prompts.length} prompts. Review them below.`}
        </AlertDescription>
      </Alert>
      <ScrollArea className="h-64 rounded-md border p-4">
        <pre className="text-xs">{JSON.stringify(prompts, null, 2)}</pre>
      </ScrollArea>
    </div>
  );
}

export function AddPromptDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [formState, formAction] = React.useActionState(handleBulkImport, {
    message: "",
    prompts: null,
    error: false,
  });

  React.useEffect(() => {
    if (formState.message && !formState.prompts) {
      // Potentially show a toast on error
    }
    if (formState.prompts) {
      // Don't close dialog on success, show results
    }
  }, [formState]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>AI Bulk Import</DialogTitle>
          <DialogDescription>
            Paste a block of text containing one or more prompts. Our AI will
            extract them for you.
          </DialogDescription>
        </DialogHeader>
        {formState.prompts ? (
          <ExtractedPrompts prompts={formState.prompts} />
        ) : (
          <form action={formAction}>
            <div className="grid gap-4 py-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="text">Your Text or Prompts</Label>
                <Textarea
                  placeholder="Paste your content here. You can also include images by pasting them."
                  id="text"
                  name="text"
                  rows={10}
                  required
                />
                {formState.error && formState.message && (
                    <p className="text-sm text-destructive">{formState.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <SubmitButton />
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
