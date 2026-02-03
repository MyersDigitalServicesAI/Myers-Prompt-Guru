"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { handleScreenshotImport } from "@/app/actions/prompts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Loader2, Sparkles, Upload } from "lucide-react";
import Image from "next/image";
import { Textarea } from "../ui/textarea";
import { useToast } from "@/hooks/use-toast";

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

export function ScreenshotImportTab() {
  const [imageData, setImageData] = React.useState<string | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const [formState, formAction] = React.useActionState(handleScreenshotImport, {
    message: "",
    refinedPrompt: null,
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
    // The hidden input will carry the image data.
    // We pass the formData to the action.
    formAction(formData);
  };
  
  const handleCopyToClipboard = () => {
    if (formState.refinedPrompt) {
        navigator.clipboard.writeText(formState.refinedPrompt);
        toast({
            title: 'Copied to clipboard!',
        });
    }
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
    // Create a new empty FormData and pass to the action to reset the state
    const formData = new FormData();
    formAction(formData);
  }

  if (formState.refinedPrompt && !formState.error) {
    return (
        <div className="space-y-4 py-4">
            <Alert>
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                    Here is the refined prompt from your screenshot.
                </AlertDescription>
            </Alert>
            <div className="relative">
                <Textarea
                    readOnly
                    value={formState.refinedPrompt}
                    rows={8}
                    className="text-sm pr-10"
                />
                 <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={handleCopyToClipboard}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
            <Button onClick={resetForm} variant="outline" className="w-full">Start Over</Button>
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
