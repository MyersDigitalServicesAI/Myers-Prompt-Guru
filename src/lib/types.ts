import type { Timestamp } from 'firebase/firestore';

export type UserProfile = {
    id: string;
    email: string;
    isPro: boolean;
    googleId?: string;
};

export type Prompt = {
    id:string;
    title: string;
    description: string;
    template: string;
    category: string;
    tags: string[];
    userId: string;
    isBookmarked: boolean;
};

export type PromptVersion = {
    id: string;
    title: string;
    description: string;
    template: string;
    category: string;
    tags: string[];
    savedAt: Timestamp;
};

export type PromptEvent = {
    id: string;
    promptId: string;
    userId: string;
    type: 'copied' | 'bookmarked' | 'unbookmarked';
    timestamp: Timestamp;
}
