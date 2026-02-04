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
import { Loader2, Sparkles, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ScrollArea } from "../ui/scroll-area";
import { type ExtractPromptsOutput } from "@/ai/flows/ai-bulk-import-extract-prompts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScreenshotImportTab } from "./screenshot-import-tab";
import { useFirestore, addDocumentNonBlocking, useUser } from "@/firebase";
import { collection } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { GoProDialog } from "./go-pro-dialog";

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

function ExtractedPrompts({ prompts, onSave }: { prompts: ExtractPromptsOutput, onSave: () => void }) {
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = () => {
    setIsSaving(true);
    onSave();
    // The parent component will show a toast.
    // We can assume it will unmount this component.
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertTitle>Extraction Successful!</AlertTitle>
        <AlertDescription>
          {`We found ${prompts.length} prompts. Review them below and save them to your library.`}
        </AlertDescription>
      </Alert>
      <ScrollArea className="h-64 rounded-md border p-4">
        <pre className="text-xs">{JSON.stringify(prompts, null, 2)}</pre>
      </ScrollArea>
       <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save to Library
        </Button>
    </div>
  );
}

function BulkImportTab() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleSavePrompts = (promptsToSave: ExtractPromptsOutput) => {
        if (!user) {
            toast({ variant: "destructive", title: "You must be logged in to save prompts." });
            return;
        }

        const promptsCollection = collection(firestore, 'users', user.uid, 'prompts');

        promptsToSave.forEach(prompt => {
            addDocumentNonBlocking(promptsCollection, { ...prompt, userId: user.uid, isBookmarked: false });
        });

        toast({
            title: "Prompts saved!",
            description: `${promptsToSave.length} new prompts have been added to your library.`,
        });
        
        // This will cause the parent to reset, which unmounts this component
        // A more sophisticated implementation might use a callback to reset the form state.
        window.location.reload(); 
    };

    const [formState, formAction] = React.useActionState(handleBulkImport, {
        message: "",
        prompts: null,
        error: false,
    });
    
    if (formState.prompts && !formState.error) {
        return <div className="py-4"><ExtractedPrompts prompts={formState.prompts} onSave={() => handleSavePrompts(formState.prompts!)} /></div>;
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

function NonProPlaceholder() {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Unlock AI-Powered Imports</h3>
            <p className="text-muted-foreground text-sm">
                Upgrade to Pro to instantly import prompts from text or screenshots.
            </p>
            <GoProDialog>
                <Button>Upgrade to Pro</Button>
            </GoProDialog>
        </div>
    )
}

export function AddPromptDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const { userProfile } = useUser();
  
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

        {userProfile?.isPro ? (
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
        ) : (
            <NonProPlaceholder />
        )}

      </DialogContent>
    </Dialog>
  );
}
