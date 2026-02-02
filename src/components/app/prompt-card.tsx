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
import { Bookmark, Clipboard, Star, ThumbsDown, ThumbsUp } from 'lucide-react';
import { type Prompt } from '@/lib/prompts';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PromptCardProps {
  prompt: Prompt;
  variables: Record<string, string>;
}

export function PromptCard({ prompt, variables }: PromptCardProps) {
  const [isBookmarked, setIsBookmarked] = React.useState(prompt.isBookmarked);
  const { toast } = useToast();

  const filledTemplate = React.useMemo(() => {
    return prompt.template.replace(/\[(.*?)\]/g, (match, varName) => {
      return variables[varName] ? `**${variables[varName]}**` : match;
    });
  }, [prompt.template, variables]);

  const handleCopyToClipboard = () => {
    const rawText = prompt.template.replace(/\[(.*?)\]/g, (match, varName) => {
      return variables[varName] || match;
    });
    navigator.clipboard.writeText(rawText);
    toast({
      title: 'Copied to clipboard!',
      description: 'The filled prompt has been copied.',
    });
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? 'Bookmark removed' : 'Prompt bookmarked!',
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
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{prompt.title}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleBookmark}
          >
            <Bookmark className={cn('h-5 w-5', isBookmarked && 'fill-primary text-primary')} />
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
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
                <Star className="h-4 w-4" />
                Rate
            </Button>
        </div>
        <Button size="sm" onClick={handleCopyToClipboard}>
          <Clipboard className="mr-2 h-4 w-4" />
          Copy
        </Button>
      </CardFooter>
    </Card>
  );
}
