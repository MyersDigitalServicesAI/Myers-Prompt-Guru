'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
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
import { FileText, Sparkles, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { Input } from '@/components/ui/input';

const categories = [
    { name: 'Creative' },
    { name: 'Technical' },
    { name: 'Marketing' },
    { name: 'Health' },
    { name: 'Lifestyle' },
  ];

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

function EmptyState({ onReset }: { onReset: () => void }) {
    return (
        <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No Prompts Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Your search or filter returned no results.
            </p>
            <div className="mt-6">
                <Button onClick={onReset}>Clear Filters</Button>
            </div>
        </div>
    )
}

export default function DashboardPage() {
  const { user, userProfile, isUserLoading: isAuthLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const firestore = useFirestore();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState(searchParams.get('category') || 'All');

  React.useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'All');
  }, [searchParams]);

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

  const filteredPrompts = React.useMemo(() => {
    if (!prompts) return [];
    return prompts.filter(prompt => {
      const categoryMatch = selectedCategory === 'All' || prompt.category === selectedCategory;
      const searchMatch = searchQuery.trim() === '' || 
                          prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return categoryMatch && searchMatch;
    });
  }, [prompts, selectedCategory, searchQuery]);

  const allVariables = React.useMemo(() => {
    const varSet = new Set<string>();
    if (filteredPrompts) {
        filteredPrompts.forEach(prompt => {
            const matches = prompt.template.match(/\[(.*?)\]/g);
            if (matches) {
                matches.forEach(match => {
                varSet.add(match.substring(1, match.length - 1));
                });
            }
        });
    }
    return Array.from(varSet);
  }, [filteredPrompts]);

  React.useEffect(() => {
    const initialVars: Record<string, string> = {};
    allVariables.forEach(v => {
      initialVars[v] = values[v] || '';
    });
    setVariables(initialVars);
  }, [allVariables]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    router.push('/');
  }

  const isLoading = isAuthLoading || arePromptsLoading;

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

          <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search by title, description, or tag..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Button variant={selectedCategory === 'All' ? 'default' : 'outline'} onClick={() => setSelectedCategory('All')}>All</Button>
                {categories.map(cat => (
                    <Button key={cat.name} variant={selectedCategory === cat.name ? 'default' : 'outline'} onClick={() => setSelectedCategory(cat.name)}>{cat.name}</Button>
                ))}
            </div>
          </div>

          <VariableInputs
            variables={allVariables}
            values={variables}
            onValueChange={(key, value) => setVariables(prev => ({ ...prev, [key]: value }))}
          />

          {filteredPrompts && filteredPrompts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPrompts.map(prompt => (
                <PromptCard key={prompt.id} prompt={prompt} variables={variables} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-24">
                <EmptyState onReset={handleResetFilters} />
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
