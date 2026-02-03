export type UserProfile = {
    id: string;
    email: string;
    isPro: boolean;
    googleId?: string;
};

export type Prompt = {
    id: string;
    title: string;
    description: string;
    template: string;
    category: string;
    tags: string[];
    userId: string;
    isBookmarked: boolean;
};
