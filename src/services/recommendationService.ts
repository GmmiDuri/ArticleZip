import type { Editorial } from '../types';

/**
 * Calculates the cosine similarity between two vectors.
 * @param vecA First vector
 * @param vecB Second vector
 * @returns Similarity score between -1 and 1
 */
export const calculateCosineSimilarity = (vecA: number[], vecB: number[]): number => {
    if (vecA.length !== vecB.length) {
        throw new Error('Vectors must have the same dimensionality');
    }

    const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
};

/**
 * Updates the user's vector profile based on a newly read article.
 * Simple moving average approach for demonstration, or weighted average.
 * @param currentProfile Current user vector
 * @param articleVector Vector of the article just read
 * @returns Updated user vector
 */
export const updateUserVector = (currentProfile: number[], articleVector: number[]): number[] => {
    // Simple average: (Current + New) / 2
    // In a real app, you might use a decay factor or weighted average based on history length.
    return currentProfile.map((val, i) => (val + articleVector[i]) / 2);
};

/**
 * Sorts articles based on similarity to the user's profile.
 * @param userProfile User's current vector profile
 * @param articles List of available articles
 * @returns Articles sorted by similarity (descending)
 */
export const getRecommendedArticles = (userProfile: number[], articles: Editorial[]): Editorial[] => {
    return [...articles].sort((a, b) => {
        const scoreA = calculateCosineSimilarity(userProfile, a.vector);
        const scoreB = calculateCosineSimilarity(userProfile, b.vector);
        return scoreB - scoreA;
    });
};
