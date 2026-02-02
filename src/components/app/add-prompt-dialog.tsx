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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScreenshotImportTab } from "./screenshot-import-tab";

function BulkImportSubmitButton() {
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

function BulkImportTab() {
    const [formState, formAction] = React.useActionState(handleBulkImport, {
        message: "",
        prompts: null,
        error: false,
    });
    
    if (formState.prompts && !formState.error) {
        return <div className="py-4"><ExtractedPrompts prompts={formState.prompts} /></div>;
    }

    return (
        <form action={formAction}>
            <div className="grid gap-4 py-4">
                <div className="grid w-full gap-1.5">
                <Label htmlFor="text">Your Text or Prompts</Label>
                <Textarea
                    placeholder="Paste your content here."
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
                <BulkImportSubmitButton />
            </DialogFooter>
        </form>
    )
}

export function AddPromptDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>AI-Powered Import</DialogTitle>
          <DialogDescription>
            Use AI to bulk import from text or a screenshot. This is a Pro feature.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="bulk-text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bulk-text">From Text</TabsTrigger>
                <TabsTrigger value="screenshot">From Screenshot</TabsTrigger>
            </TabsList>
            <TabsContent value="bulk-text">
                <BulkImportTab />
            </TabsContent>
            <TabsContent value="screenshot">
                <ScreenshotImportTab />
            </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
