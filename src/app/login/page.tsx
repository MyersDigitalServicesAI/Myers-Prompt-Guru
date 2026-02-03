"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AppLogo } from "@/components/app/app-logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";
import { useAuth, useUser } from "@/firebase";
import { AuthError, onAuthStateChanged } from "firebase/auth";
import {
  initiateEmailSignIn,
  initiateEmailSignUp,
  initiateGoogleSignIn,
} from "@/firebase/non-blocking-login";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.62-4.55 1.62-3.83 0-6.94-3.1-6.94-6.93s3.1-6.94 6.94-6.94c2.2 0 3.58.87 4.43 1.68l2.5-2.5C18.16 3.79 15.48 3 12.48 3c-5.2 0-9.4 4.2-9.4 9.4s4.2 9.4 9.4 9.4c5.33 0 9.13-3.83 9.13-9.25 0-.8-.08-1.32-.18-1.82z"
    />
  </svg>
);

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/");
    }
  }, [user, isUserLoading, router]);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        // user object is handled by the useUser hook.
        // this listener is primarily for handling auth errors on this page.
      },
      (error: AuthError) => {
        switch (error.code) {
          case "auth/invalid-email":
            setError("Invalid email address format.");
            break;
          case "auth/user-not-found":
          case "auth/wrong-password":
          case "auth/invalid-credential":
            setError("Invalid email or password.");
            break;
          case "auth/email-already-in-use":
            setError("An account already exists with this email address.");
            break;
          case "auth/weak-password":
            setError("Password should be at least 6 characters long.");
            break;
          case "auth/popup-closed-by-user":
            setError("Sign-in process was cancelled.");
            break;
          default:
            setError("An unexpected error occurred. Please try again.");
            console.error("Auth Error:", error);
            break;
        }
      }
    );
    return () => unsubscribe();
  }, [auth]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (isSignUp) {
      initiateEmailSignUp(auth, email, password);
    } else {
      initiateEmailSignIn(auth, email, password);
    }
  };

  const handleGoogleSignIn = () => {
    setError(null);
    initiateGoogleSignIn(auth);
  };

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <AppLogo />
          </div>
          <CardTitle className="text-2xl">
            {isSignUp ? "Create an Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Enter your details to get started."
              : "Enter your credentials to access your prompt library."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Button
              variant="outline"
              className="w-full"
              type="button"
              onClick={handleGoogleSignIn}
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              Sign {isSignUp ? "up" : "in"} with Google
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
               {error && (
                <p className="text-sm text-center text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full">
                {isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </form>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center">
           <div className="text-sm">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
