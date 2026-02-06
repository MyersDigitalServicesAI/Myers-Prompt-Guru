import type { Timestamp } from 'firebase/firestore';

export type UserProfile = {
    id: string;
    email: string;
    isPro: boolean;
    googleId?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid';
    subscriptionEndDate?: Date;
    cancelAtPeriodEnd?: boolean;
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
