'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc }from 'firebase/firestore';
import { GoProDialog } from '@/components/app/go-pro-dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, BarChartHorizontal } from 'lucide-react';
import { type UserProfile } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Placeholder data - we will replace this with real data soon
const copiedData = [
    { prompt: "Story Starter", copies: 102, fill: "var(--color-copies)" },
    { prompt: "Marketing Email", copies: 78, fill: "var(--color-copies)" },
    { prompt: "Bug Report", copies: 54, fill: "var(--color-copies)" },
    { prompt: "Social Media Post", copies: 45, fill: "var(--color-copies)" },
    { prompt: "Recipe Generator", copies: 21, fill: "var(--color-copies)" },
]
const bookmarkedData = [
    { prompt: "Story Starter", bookmarks: 85, fill: "var(--color-bookmarks)" },
    { prompt: "Social Media Post", bookmarks: 62, fill: "var(--color-bookmarks)" },
    { prompt: "Marketing Email", bookmarks: 41, fill: "var(--color-bookmarks)" },
    { prompt: "Travel Itinerary", bookmarks: 33, fill: "var(--color-bookmarks)" },
    { prompt: "Code Explanation", bookmarks: 18, fill: "var(--color-bookmarks)" },
]

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

    const isLoading = isAuthLoading || isProfileLoading;

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
