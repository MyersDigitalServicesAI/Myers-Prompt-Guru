'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark, Clipboard } from 'lucide-react';
import { type Prompt } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, updateDocumentNonBlocking, addDocumentNonBlocking, useUser } from '@/firebase';
import { doc, collection, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';

interface PromptCardProps {
  prompt: Prompt;
  variables: Record<string, string>;
}

export function PromptCard({ prompt, variables }: PromptCardProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const filledTemplate = React.useMemo(() => {
    return prompt.template.replace(/\[(.*?)\]/g, (match, varName) => {
      return variables[varName] ? `**${variables[varName]}**` : match;
    });
  }, [prompt.template, variables]);

  const handleCopyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const rawText = prompt.template.replace(/\[(.*?)\]/g, (match, varName) => {
      return variables[varName] || match;
    });
    navigator.clipboard.writeText(rawText);
    toast({
      title: 'Copied to clipboard!',
      description: 'The filled prompt has been copied.',
    });
    
    // Add tracking event
    if (user && prompt.id) {
        const eventsCollection = collection(firestore, 'promptEvents');
        addDocumentNonBlocking(eventsCollection, {
            userId: user.uid,
            promptId: prompt.id,
            type: 'copied',
            timestamp: serverTimestamp(),
        });
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!prompt.userId || !prompt.id || !user) return;

    const promptRef = doc(firestore, 'users', prompt.userId, 'prompts', prompt.id);
    const newBookmarkState = !prompt.isBookmarked;

    updateDocumentNonBlocking(promptRef, { isBookmarked: newBookmarkState });
    
    toast({
      title: newBookmarkState ? 'Prompt bookmarked!' : 'Bookmark removed',
    });

    // Add tracking event
    const eventsCollection = collection(firestore, 'promptEvents');
    addDocumentNonBlocking(eventsCollection, {
        userId: user.uid,
        promptId: prompt.id,
        type: newBookmarkState ? 'bookmarked' : 'unbookmarked',
        timestamp: serverTimestamp(),
    });
  };

  // Basic markdown-to-JSX parser for bold text
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-primary">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <Link href={`/prompt/${prompt.id}`} className="flex h-full">
        <Card className="flex w-full flex-col transition-colors hover:border-primary/50">
        <CardHeader>
            <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{prompt.title}</CardTitle>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={handleBookmark}
            >
                <Bookmark className={cn('h-5 w-5', prompt.isBookmarked && 'fill-primary text-primary')} />
            </Button>
            </div>
            <CardDescription>{prompt.description}</CardDescription>
            <div className="flex flex-wrap gap-2 pt-2">
            {prompt.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                {tag}
                </Badge>
            ))}
            </div>
        </CardHeader>
        <CardContent className="flex-grow">
            <div className="prose prose-sm dark:prose-invert rounded-lg border bg-secondary/30 p-4 text-sm text-foreground/80">
            <p className='leading-relaxed'>{renderFormattedText(filledTemplate)}</p>
            </div>
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button size="sm" onClick={handleCopyToClipboard}>
            <Clipboard className="mr-2 h-4 w-4" />
            Copy
            </Button>
        </CardFooter>
        </Card>
    </Link>
  );
}
