export interface Editorial {
    id: string;
    title: string;
    original_title?: string;
    press: string;
    category: string;
    author?: string;
    image_url: string;
    content_summary: string;
    summary_bullets?: string[];
    keywords?: string[];
    image_prompt?: string;
    stance?: string;
    stance_score?: number;
    policy_impact?: string;
    url: string;
    created_at: string;
    vector: number[];
}

export interface UserPreference {
    uid: string;
    interests: Record<string, number>; // e.g., { "Technology": 0.8, "Politics": 0.2 }
    read_history: string[]; // List of Editorial IDs
    vector_profile: number[]; // Aggregated user vector
    keyword_profile: Record<string, number>; // { "dementia": 3, "cancer": 1, ... }
}

export interface UserArticleSelection {
    userId: string;
    articleId: string;
    title: string;
    originalTitle: string;
    category: string;
    press: string;
    abstract: string;
    keywords: string[];
    vector: number[];
    selectedAt: string;
    source: 'click' | 'like';
}

export interface User {
    uid: string;
    name: string;
    email: string;
    photoURL?: string;
}
