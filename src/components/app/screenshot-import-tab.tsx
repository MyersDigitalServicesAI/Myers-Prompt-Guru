"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { handleScreenshotImport } from "@/app/actions/prompts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles, Upload, Save } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { type ExtractPromptsOutput } from "@/ai/flows/ai-bulk-import-extract-prompts";
import { ScrollArea } from "../ui/scroll-area";
import { useFirestore, addDocumentNonBlocking, useUser } from "@/firebase";
import { collection } from "firebase/firestore";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      Extract & Refine
    </Button>
  );
}

function ExtractedScreenshotPrompts({ prompts, onSave }: { prompts: ExtractPromptsOutput, onSave: () => void }) {
    const [isSaving, setIsSaving] = React.useState(false);
  
    const handleSave = () => {
      setIsSaving(true);
      onSave();
    }
  
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTitle>Extraction Successful!</AlertTitle>
          <AlertDescription>
            {`We found ${prompts.length} prompts. Review and save them to your library.`}
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

export function ScreenshotImportTab() {
  const { user } = useUser();
  const [imageData, setImageData] = React.useState<string | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

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
        description: `${promptsToSave.length} new prompts have been added to your library from the screenshot.`,
    });
    
    resetForm();
    window.location.reload();
};

  const [formState, formAction] = React.useActionState(handleScreenshotImport, {
    message: "",
    prompts: null,
    error: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result as string);
        setImagePreview(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (formData: FormData) => {
    formAction(formData);
  };

  const resetForm = () => {
    setImageData(null);
    setImagePreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    if (formRef.current) {
        formRef.current.reset();
    }
  }

  if (formState.prompts && !formState.error) {
    return (
        <div className="space-y-4 py-4">
            <ExtractedScreenshotPrompts prompts={formState.prompts} onSave={() => handleSavePrompts(formState.prompts!)} />
        </div>
    );
  }

  return (
    <form action={handleSubmit} ref={formRef} className="space-y-4 py-4">
      <div className="grid w-full gap-2">
        <Label htmlFor="screenshot" className="text-sm font-medium">Upload Screenshot</Label>
        <Input
          id="screenshot"
          name="screenshot_file"
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
        >
            <Upload className="mr-2 h-4 w-4" />
            {imagePreview ? "Change Image" : "Select Image"}
        </Button>

        {imagePreview && (
            <div className="mt-2 rounded-md border p-2 relative max-h-48 overflow-auto">
                <Image src={imagePreview} alt="Screenshot preview" width={400} height={200} className="w-full h-auto rounded-md object-contain" />
            </div>
        )}
         <input type="hidden" name="image" value={imageData || ''} />

        {formState.error && formState.message && (
            <p className="text-sm text-destructive">{formState.message}</p>
        )}
      </div>
      <SubmitButton disabled={!imageData} />
    </form>
  );
}
