'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ArrowLeft, Edit, Save, X, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { useDoc, useFirestore, useUser, updateDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { type Prompt, type PromptVersion } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PromptVersionHistory } from '@/components/app/prompt-version-history';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

function PromptPageLoading() {
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-5 w-2/3 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                     <Skeleton className="h-6 w-1/4" />
                     <Skeleton className="h-24 w-full" />
                </CardContent>
                 <CardFooter>
                    <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        </div>
    )
}


export default function PromptDetailPage() {
    const { id: promptId } = useParams<{ id: string }>();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const [isEditing, setIsEditing] = React.useState(false);
    const [formData, setFormData] = React.useState<Partial<Prompt>>({});

    const promptRef = useMemoFirebase(() => {
        if (!user || !promptId) return null;
        return doc(firestore, 'users', user.uid, 'prompts', promptId);
    }, [user, firestore, promptId]);

    const { data: prompt, isLoading: isPromptLoading, error } = useDoc<Prompt>(promptRef);
    
    React.useEffect(() => {
        if (!isUserLoading && !user) {
          router.push('/login');
        }
      }, [user, isUserLoading, router]);

    React.useEffect(() => {
        if (prompt) {
            setFormData(prompt);
        }
    }, [prompt]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'tags') {
            setFormData(prev => ({...prev, tags: value.split(',').map(tag => tag.trim())}));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSave = () => {
        if (!promptRef || !prompt) return;

        // Create a version of the current state before saving
        const versionsCollectionRef = collection(firestore, 'users', prompt.userId, 'prompts', prompt.id, 'versions');
        const versionData = {
            title: prompt.title,
            description: prompt.description,
            template: prompt.template,
            category: prompt.category,
            tags: prompt.tags,
            savedAt: serverTimestamp(),
        };
        addDocumentNonBlocking(versionsCollectionRef, versionData);

        // Save the new data to the main prompt document
        const dataToSave = {
            ...formData,
            // updatedAt: serverTimestamp()
        };
        updateDocumentNonBlocking(promptRef, dataToSave);

        toast({
            title: "Prompt updated!",
            description: "A new version has been saved to its history.",
        });

        setIsEditing(false);
    };

    const handleRestore = (versionData: PromptVersion) => {
        if (!promptRef || !prompt) return;

        // 1. First, save the *current* state as a new version before we overwrite it
        const versionsCollectionRef = collection(firestore, 'users', prompt.userId, 'prompts', prompt.id, 'versions');
        const currentVersionData = {
            title: prompt.title,
            description: prompt.description,
            template: prompt.template,
            category: prompt.category,
            tags: prompt.tags,
            savedAt: serverTimestamp(),
        };
        addDocumentNonBlocking(versionsCollectionRef, currentVersionData);
        
        // 2. Now, update the main document with the restored version's data
        const { id, savedAt, ...restOfVersionData } = versionData; // Omit id and savedAt from the main doc
        updateDocumentNonBlocking(promptRef, restOfVersionData);

        // The useDoc hook will automatically update the UI, including the form fields via useEffect
    };

    const handleDelete = () => {
        if (!promptRef) return;
        
        deleteDocumentNonBlocking(promptRef);

        toast({
            title: "Prompt deleted",
            description: "The prompt has been permanently removed.",
        });

        router.push('/');
    }


    const isLoading = isUserLoading || isPromptLoading;

    if (isLoading) {
        return <PromptPageLoading />;
    }

    if (error) {
        return <div className="p-8 text-destructive">Error loading prompt: {error.message}</div>;
    }

    if (!prompt) {
        return <div className="p-8">Prompt not found.</div>;
    }

    return (
        <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                   <Link href="/">
                     <ArrowLeft className="h-4 w-4" />
                   </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Prompt Details</h1>
            </div>
            <Card>
                <CardHeader>
                    {isEditing ? (
                        <div className="space-y-2">
                             <Label htmlFor="title">Title</Label>
                             <Input id="title" name="title" value={formData.title || ''} onChange={handleInputChange} />
                        </div>
                    ) : (
                        <CardTitle className="text-2xl">{prompt.title}</CardTitle>
                    )}
                     {isEditing ? (
                        <div className="space-y-2">
                             <Label htmlFor="description">Description</Label>
                             <Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} rows={2} />
                        </div>
                    ) : (
                        <CardDescription>{prompt.description}</CardDescription>
                    )}
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="template">Template</Label>
                        {isEditing ? (
                            <Textarea id="template" name="template" value={formData.template || ''} onChange={handleInputChange} rows={8} />
                        ) : (
                            <div className="prose prose-sm dark:prose-invert rounded-lg border bg-secondary/30 p-4 text-sm text-foreground/80 min-h-[150px]">
                                <p className='leading-relaxed'>{prompt.template}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Details</Label>
                        <div className="flex flex-wrap gap-2 items-center">
                             <Badge variant="outline">{prompt.category}</Badge>
                             {isEditing ? (
                                <Input id="tags" name="tags" value={formData.tags?.join(', ') || ''} onChange={handleInputChange} placeholder="tag1, tag2, tag3" />
                             ) : (
                                prompt.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)
                             )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                    {isEditing ? (
                        <div className="flex gap-2">
                            <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/>Save</Button>
                            <Button variant="ghost" onClick={() => setIsEditing(false)}><X className="mr-2 h-4 w-4"/>Cancel</Button>
                        </div>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
                    )}

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="ml-auto"><Trash2 className="mr-2 h-4 w-4"/>Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this prompt and all of its version history.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>

             <div className="mt-8">
                <h2 className="text-2xl font-bold tracking-tight mb-4">Version History</h2>
                <PromptVersionHistory prompt={prompt} onRestore={handleRestore} />
            </div>
        </div>
    );
}
