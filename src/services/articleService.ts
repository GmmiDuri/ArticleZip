import type { Editorial, UserArticleSelection } from '../types';
import localData from '../data/medical_journal_data.json';
import { saveUserPreference } from './firebase';
import { extractKeywords } from './geminiService';

// Keep track of previously served articles to ensure "freshness" on refresh
let previouslyServedIds: Set<string> = new Set();

export const fetchArticles = async (isRefresh: boolean = false): Promise<Editorial[]> => {
    try {
        if (!isRefresh) {
            previouslyServedIds.clear();
        }

        // Map all articles from JSON data
        let allArticles: Editorial[] = localData
            .map((data: any, index: number) => ({
                id: data.url || `local-${index}`,
                title: data.title,
                content_summary: data.content_summary,
                summary_bullets: data.summary_bullets || [],
                keywords: data.keywords || [],
                image_prompt: data.image_prompt || '',
                stance: 'N/A',
                stance_score: 5,
                policy_impact: '',
                url: data.url,
                original_title: data.original_title,
                category: 'Medical/Science',
                press: data.press,
                author: data.author,
                vector: filterVector(data.vector, data.press),
                created_at: data.created_at,
                image_url: data.image_url || `https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800`,
                recommendation_score: data.recommendation_score || 0,
                published_date: data.published_date || ''
            }));

        // If refreshing, filter out previously served articles
        if (isRefresh) {
            let freshArticles = allArticles.filter(a => !previouslyServedIds.has(a.id));

            // If no fresh articles remain, clear history and use all
            if (freshArticles.length === 0) {
                previouslyServedIds.clear();
                freshArticles = allArticles;
            }

            // Sort by recommendation score if scores exist, otherwise shuffle
            const hasScores = freshArticles.some(a => (a as any).recommendation_score > 0);
            if (hasScores) {
                freshArticles.sort((a, b) => ((b as any).recommendation_score || 0) - ((a as any).recommendation_score || 0));
            } else {
                freshArticles.sort(() => 0.5 - Math.random());
            }

            // Take up to 15 articles
            const picks = freshArticles.slice(0, 15);
            picks.forEach(p => previouslyServedIds.add(p.id));
            return picks;
        }

        // Initial load: sort by recommendation score if available, otherwise maintain order
        const hasScores = allArticles.some(a => (a as any).recommendation_score > 0);
        if (hasScores) {
            allArticles.sort((a, b) => ((b as any).recommendation_score || 0) - ((a as any).recommendation_score || 0));
        }

        // Take up to 15 articles
        const result = allArticles.slice(0, 15);
        result.forEach(p => previouslyServedIds.add(p.id));
        return result;
    } catch (error) {
        console.error("Error fetching articles:", error);
        return [];
    }
};

const getVectorByPress = (press: string): number[] => {
    switch (press) {
        case 'JAMA': return [0.9, 0.1, 0.2, 0.0, 0.5];
        case 'JAMA Neurology': return [0.9, 0.15, 0.2, 0.05, 0.5];
        case 'The Lancet': return [0.85, 0.2, 0.3, 0.1, 0.4];
        case 'Nature': return [0.2, 0.9, 0.1, 0.8, 0.3];
        case 'Nature Medicine': return [0.7, 0.6, 0.3, 0.5, 0.4];
        case 'Science': return [0.2, 0.85, 0.1, 0.9, 0.3];
        case 'PNAS': return [0.3, 0.8, 0.15, 0.7, 0.3];
        case 'Cell': return [0.1, 0.95, 0.0, 0.4, 0.2];
        case 'Cell Stem Cell': return [0.15, 0.9, 0.05, 0.45, 0.25];
        case 'BMJ': return [0.8, 0.15, 0.6, 0.1, 0.5];
        default: return [0.5, 0.5, 0.5, 0.5, 0.5];
    }
};

const filterVector = (vec: any, press: string): number[] => {
    if (Array.isArray(vec) && vec.length > 0) return vec;
    return getVectorByPress(press);
}


/**
 * 논문 클릭 시 이벤트 트리거:
 * 1. 논문의 제목, 분야, 초록 데이터를 캡처
 * 2. Gemini API로 핵심 키워드 5개 추출
 * 3. Firestore user_preferences 컬렉션에 정제된 데이터 저장
 * @returns 추출된 키워드 배열 (UserContext에서 keyword_profile 업데이트에 사용)
 */
export const trackArticleClick = async (
    article: Editorial,
    userId: string
): Promise<string[]> => {
    try {
        // 1. Gemini API로 키워드 추출
        const titleForExtraction = article.original_title || article.title;
        const keywords = await extractKeywords(titleForExtraction, article.content_summary);

        // 2. UserArticleSelection 객체 구성
        const selection: UserArticleSelection = {
            userId,
            articleId: article.id,
            title: article.title,
            originalTitle: article.original_title || article.title,
            category: article.category,
            press: article.press,
            abstract: article.content_summary,
            keywords: keywords.length > 0 ? keywords : (article.keywords || []),
            vector: article.vector,
            selectedAt: new Date().toISOString(),
            source: 'click'
        };

        // 3. Firebase에 저장 (비동기, 블로킹하지 않음)
        saveUserPreference(selection);

        console.log('[ArticleService] Article click tracked:', {
            title: selection.title,
            keywords: selection.keywords
        });

        return selection.keywords;
    } catch (error) {
        console.error('[ArticleService] Error tracking article click:', error);
        return article.keywords || [];
    }
};

