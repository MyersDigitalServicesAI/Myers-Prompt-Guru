"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/firebase";

const proFeatures = [
    "Unlimited Prompt Saves & Storage",
    "Bulk Import from Text",
    "Import from Screenshot",
    "Access to Guru Chat AI Assistant",
    "Advanced Search & Filtering",
    "Priority Support",
];

export function GoProDialog({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleUpgrade = async () => {
    if (!user) {
      setError("Please sign in to upgrade");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Call our API to create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
            </div>
          <DialogTitle className="text-center">Upgrade to Myers Prompt Guru Pro</DialogTitle>
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
            {error && (
              <div className="text-sm text-destructive text-center">
                {error}
              </div>
            )}
        </div>
        <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
          <Button 
            onClick={handleUpgrade} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Upgrade for $5.00/month'
            )}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="ghost" className="w-full" disabled={isLoading}>
                Not now
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
