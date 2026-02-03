'use client';

import * as React from 'react';
import { AppSidebar } from '@/components/app/sidebar';
import { AppHeader } from '@/components/app/header';
import { PromptCard } from '@/components/app/prompt-card';
import { VariableInputs } from '@/components/app/variable-inputs';
import { type Prompt, type UserProfile } from '@/lib/types';
import { GuruChat } from '@/components/app/guru-chat';
import { SidebarInset } from '@/components/ui/sidebar';
import { GoProDialog } from '@/components/app/go-pro-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser, useDoc, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, collection, query, orderBy } from 'firebase/firestore';

function DashboardLoading() {
  return (
    <div className="flex h-screen w-full flex-col">
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-6 w-3/4" />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-8 w-1/4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        </main>
      </SidebarInset>
    </div>
  );
}

function EmptyState() {
    return (
        <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No prompts yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Get started by creating or importing a new prompt.
            </p>
            <div className="mt-6">
                {/* The AddPromptDialog is available in the header/sidebar */}
            </div>
        </div>
    )
}

export default function DashboardPage() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const userRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userRef);

  const promptsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'prompts'), orderBy('title'));
  }, [user, firestore]);
  const { data: prompts, isLoading: arePromptsLoading } = useCollection<Prompt>(promptsQuery);

  const [variables, setVariables] = React.useState<Record<string, string>>({});
  
  const isPro = userProfile?.isPro ?? false;

  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  const allVariables = React.useMemo(() => {
    const varSet = new Set<string>();
    if (prompts) {
        prompts.forEach(prompt => {
            const matches = prompt.template.match(/\[(.*?)\]/g);
            if (matches) {
                matches.forEach(match => {
                varSet.add(match.substring(1, match.length - 1));
                });
            }
        });
    }
    return Array.from(varSet);
  }, [prompts]);

  React.useEffect(() => {
    const initialVars: Record<string, string> = {};
    allVariables.forEach(v => {
      initialVars[v] = '';
    });
    setVariables(initialVars);
  }, [allVariables]);

  const isLoading = isAuthLoading || isProfileLoading || arePromptsLoading;

  if (isLoading || !user) {
    return <DashboardLoading />;
  }

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Prompt Library</h1>
            <p className="text-muted-foreground">
              Discover, create, and manage your AI prompts. Use the inputs below to see them update in real-time.
            </p>
          </div>
          <VariableInputs
            variables={allVariables}
            values={variables}
            onValueChange={(key, value) => setVariables(prev => ({ ...prev, [key]: value }))}
          />
          {prompts && prompts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {prompts.map(prompt => (
                <PromptCard key={prompt.id} prompt={prompt} variables={variables} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-24">
                <EmptyState />
            </div>
          )}
        </main>
        {isPro ? <GuruChat /> : (
          <GoProDialog>
            <Button
                variant="default"
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
                >
                <Sparkles className="h-6 w-6" />
                <span className="sr-only">Open Guru Chat</span>
            </Button>
          </GoProDialog>
        )}
      </SidebarInset>
    </>
  );
}
