const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Gemini API를 호출하여 논문의 핵심 키워드 5개를 추출합니다.
 * @param title 논문 제목
 * @param abstract 논문 초록 (content_summary)
 * @returns 키워드 5개 배열, 실패 시 빈 배열
 */
export const extractKeywords = async (title: string, abstract: string): Promise<string[]> => {
    if (!GEMINI_API_KEY) {
        console.warn('[Gemini] API key not configured. Skipping keyword extraction.');
        return [];
    }

    const prompt = `You are a medical research keyword extractor. Given the following article title and abstract, extract exactly 5 core keywords that best represent the research topic and would be useful for recommending similar articles.

Title: ${title}
Abstract: ${abstract}

Rules:
- Return ONLY a JSON array of 5 strings, e.g. ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
- Keywords should be in English, lowercase
- Keywords should be specific research terms, not generic words
- No explanation, just the JSON array`;

    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 200
                }
            })
        });

        if (!response.ok) {
            console.error(`[Gemini] API error: ${response.status} ${response.statusText}`);
            return [];
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!text) {
            console.warn('[Gemini] Empty response from API.');
            return [];
        }

        // Parse the JSON array from the response (handle markdown code blocks)
        const jsonMatch = text.match(/\[.*\]/s);
        if (jsonMatch) {
            const keywords: string[] = JSON.parse(jsonMatch[0]);
            console.log('[Gemini] Extracted keywords:', keywords);
            return keywords.slice(0, 5);
        }

        console.warn('[Gemini] Could not parse keywords from response:', text);
        return [];
    } catch (error) {
        console.error('[Gemini] Keyword extraction failed:', error);
        return [];
    }
};
