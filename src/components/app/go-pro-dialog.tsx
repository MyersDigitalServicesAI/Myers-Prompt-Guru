"use client";

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
import { Check, Sparkles } from "lucide-react";

const proFeatures = [
    "Unlimited Prompt Saves",
    "Access to Guru Chat AI Assistant",
    "Advanced Search & Filtering",
    "Priority Support",
];

export function GoProDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
            </div>
          <DialogTitle className="text-center">Upgrade to PromptMaster Pro</DialogTitle>
          <DialogDescription className="text-center">
            Unlock the full potential of prompt engineering with our Pro features.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <ul className="space-y-2">
                {proFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
        <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
          <Button type="button" className="w-full">
            Upgrade for $5/month
          </Button>
          <Button type="button" variant="ghost" className="w-full">
            Not now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
