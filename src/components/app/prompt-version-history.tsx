'use client';

import * as React from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Prompt, PromptVersion } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { History, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function VersionHistoryLoading() {
    return (
        <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
            ))}
        </div>
    );
}

interface PromptVersionHistoryProps {
    prompt: Prompt;
    onRestore: (versionData: PromptVersion) => void;
}

export function PromptVersionHistory({ prompt, onRestore }: PromptVersionHistoryProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const memoizedVersionsQuery = useMemoFirebase(() => {
        if (!prompt) return null;
        return query(
            collection(firestore, 'users', prompt.userId, 'prompts', prompt.id, 'versions'),
            orderBy('savedAt', 'desc')
        );
    }, [firestore, prompt]);

    const { data: versions, isLoading } = useCollection<PromptVersion>(memoizedVersionsQuery);

    const handleRestoreClick = (version: PromptVersion) => {
        onRestore(version);
        toast({
            title: 'Prompt Restored',
            description: 'The prompt has been restored to the selected version.',
        });
    }

    if (isLoading) {
        return <VersionHistoryLoading />;
    }
    
    if (!versions || versions.length === 0) {
        return (
            <div className="text-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-12">
                 <History className="mx-auto h-8 w-8 text-muted-foreground" />
                 <p className="mt-4 text-sm text-muted-foreground">No version history found for this prompt.</p>
                 <p className="text-xs text-muted-foreground">Edits you make will be saved here.</p>
            </div>
        );
    }

    return (
        <Accordion type="single" collapsible className="w-full">
            {versions.map(version => (
                <AccordionItem key={version.id} value={version.id}>
                    <AccordionTrigger>
                        <div className="flex items-center gap-4">
                            <span className="font-semibold">Version saved {formatDistanceToNow(version.savedAt.toDate(), { addSuffix: true })}</span>
                            <Badge variant="outline">{version.category}</Badge>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 prose prose-sm dark:prose-invert max-w-none">
                            <h4>{version.title}</h4>
                            <p>{version.description}</p>
                            <div className="rounded-lg border bg-secondary/30 p-4 text-sm text-foreground/80">
                                <p className='leading-relaxed'>{version.template}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {version.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                            </div>
                            <Button size="sm" variant="outline" onClick={() => handleRestoreClick(version)}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Restore this version
                            </Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
