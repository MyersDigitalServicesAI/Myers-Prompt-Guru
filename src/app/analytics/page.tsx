'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { useUser, useDoc, useMemoFirebase, useFirestore, useCollection } from '@/firebase';
import { doc, collection, query } from 'firebase/firestore';
import { GoProDialog } from '@/components/app/go-pro-dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, BarChartHorizontal } from 'lucide-react';
import { type UserProfile, type PromptEvent, type Prompt } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const chartConfig = {
    copies: {
      label: "Copies",
      color: "hsl(var(--chart-1))",
    },
    bookmarks: {
        label: "Bookmarks",
        color: "hsl(var(--chart-2))",
    }
} satisfies ChartConfig;


function AnalyticsLoading() {
  return (
    <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8">
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-6 w-3/4" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
        </div>
    </div>
  );
}

function NonProPlaceholder() {
    return (
        <div className="flex h-[calc(100vh-10rem)] items-center justify-center p-4">
            <Card className="max-w-lg text-center">
                <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                        <BarChartHorizontal className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>AI-Powered Analytics</CardTitle>
                    <CardDescription>This is a Pro feature. Upgrade to get data-driven insights on your most effective prompts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <GoProDialog>
                        <Button><Sparkles className="mr-2 h-4 w-4" />Upgrade to Pro</Button>
                    </GoProDialog>
                </CardContent>
            </Card>
        </div>
    );
}


export default function AnalyticsPage() {
    const { user, isUserLoading: isAuthLoading } = useUser();
    const firestore = useFirestore();

    const userRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userRef);

    const promptsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'users', user.uid, 'prompts'));
    }, [user, firestore]);
    const { data: prompts, isLoading: arePromptsLoading } = useCollection<Prompt>(promptsQuery);

    const eventsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'users', user.uid, 'promptEvents'));
    }, [user, firestore]);
    const { data: events, isLoading: areEventsLoading } = useCollection<PromptEvent>(eventsQuery);

    const { copiedData, bookmarkedData } = React.useMemo(() => {
        if (!events || !prompts) {
            return { copiedData: [], bookmarkedData: [] };
        }

        const promptTitles = prompts.reduce((acc, p) => {
            acc[p.id] = p.title;
            return acc;
        }, {} as Record<string, string>);

        const copyCounts: Record<string, number> = {};
        const bookmarkCounts: Record<string, number> = {};

        for (const event of events) {
            if (event.type === 'copied') {
                copyCounts[event.promptId] = (copyCounts[event.promptId] || 0) + 1;
            } else if (event.type === 'bookmarked') {
                bookmarkCounts[event.promptId] = (bookmarkCounts[event.promptId] || 0) + 1;
            }
        }

        const processData = (counts: Record<string, number>, key: 'copies' | 'bookmarks') => {
            return Object.entries(counts)
                .map(([promptId, count]) => ({
                    prompt: promptTitles[promptId] || 'Deleted Prompt',
                    [key]: count,
                }))
                .filter(item => item.prompt !== 'Deleted Prompt')
                .sort((a, b) => b[key] - a[key])
                .slice(0, 5)
                .map(item => ({...item, fill: key === 'copies' ? 'var(--color-copies)' : 'var(--color-bookmarks)'}));
        };

        const finalCopiedData = processData(copyCounts, 'copies');
        const finalBookmarkedData = processData(bookmarkCounts, 'bookmarks');

        return { copiedData: finalCopiedData, bookmarkedData: finalBookmarkedData };

    }, [events, prompts]);

    const isLoading = isAuthLoading || isProfileLoading || arePromptsLoading || areEventsLoading;

    if (isLoading) {
        return <AnalyticsLoading />;
    }

    if (!userProfile?.isPro) {
        return <NonProPlaceholder />;
    }
    
    return (
        <main className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8">
             <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">Prompt Analytics</h1>
                <p className="text-muted-foreground">
                    Discover which of your prompts are performing the best and why.
                </p>
            </div>
            
            <Alert className="bg-primary/5 border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary">Coming Soon: AI Insights</AlertTitle>
                <AlertDescription>
                   We're building an AI that will analyze this data and give you actionable advice to improve your prompts.
                </AlertDescription>
            </Alert>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Most Copied Prompts</CardTitle>
                        <CardDescription>The prompts that are being copied to the clipboard most often.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ChartContainer config={chartConfig} className="h-64">
                            <BarChart data={copiedData} layout="vertical" margin={{ left: 20 }}>
                                <YAxis dataKey="prompt" type="category" tickLine={false} axisLine={false} tickMargin={10} width={120} />
                                <XAxis dataKey="copies" type="number" hide />
                                <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                                <Bar dataKey="copies" radius={5} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Most Bookmarked Prompts</CardTitle>
                        <CardDescription>Your all-time favorite prompts that you keep coming back to.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-64">
                            <BarChart data={bookmarkedData} layout="vertical" margin={{ left: 20 }}>
                                <YAxis dataKey="prompt" type="category" tickLine={false} axisLine={false} tickMargin={10} width={120} />
                                <XAxis dataKey="bookmarks" type="number" hide />
                                <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                                <Bar dataKey="bookmarks" radius={5} fill="var(--color-bookmarks)" />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
