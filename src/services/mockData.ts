import type { Editorial } from '../types';

export const CATEGORIES = ['정치', '경제', '사회', 'IT/과학', '세계'];

const generateRandomVector = (dim: number = 5): number[] => {
    return Array.from({ length: dim }, () => parseFloat((Math.random() * 2 - 1).toFixed(2)));
};

export const MOCK_EDITORIALS: Editorial[] = [
    {
        id: 'k1',
        title: '[사설] 반도체 보조금 전쟁, 국가 명운 걸린 산업 전략 시급하다',
        content_summary: '글로벌 반도체 패권 다툼이 치열해지는 가운데 정부의 적극적인 지원책이 요구됩니다. 경쟁국들의 파격적인 혜택에 대응하는 한국형 전략이 필요합니다.',
        url: 'https://news.naver.com/opinion/series',
        category: '경제',
        press: '한국경제',
        vector: [0.9, 0.4, -0.1, 0.2, 0.1],
        created_at: new Date().toISOString(),
        image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b'
    },
    {
        id: 'k2',
        title: 'AI 시대의 노동, 기술 혁신이 일자리에 미치는 영향 분석',
        content_summary: '인공지능의 급격한 발전으로 노동 시장의 구조적 변화가 예고되고 있습니다. 기술 변화에 소외되는 계층이 없도록 사회적 안전망 확충이 시급합니다.',
        url: 'https://news.naver.com/opinion/column',
        category: '사회',
        press: '매일경제',
        vector: [0.8, -0.2, 0.6, 0.1, -0.1],
        created_at: new Date().toISOString(),
        image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e'
    },
    {
        id: 'k3',
        title: '동아시아 안보 지형 변화와 한국의 외교적 선택지',
        content_summary: '급변하는 국제 정세 속에서 한반도 주변 강대국들의 이해관계가 충돌하고 있습니다. 국익을 최우선으로 하는 유연하면서도 원칙 있는 외교가 절실합니다.',
        url: 'https://news.naver.com/opinion/series',
        category: '정치',
        press: '조선일보',
        vector: [0.2, -0.1, 0.3, 0.9, -0.4],
        created_at: new Date().toISOString(),
        image_url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620'
    }
];

// Generate 7 more Korean dummy articles
const extraItems = [
    { title: '수도권 집중화 현상, 지방 소멸을 막기 위한 골든타임', cat: '사회', press: '한겨레', img: 'city' },
    { title: '금리 동결 배경과 향후 가계 부채 관리 방안', cat: '경제', press: '중앙일보', img: 'finance' },
    { title: '국회 정쟁 뒤로 밀린 민생 법안들, 무엇이 문제인가', cat: '정치', press: '동아일보', img: 'assembly' },
    { title: '우주 항공 강국 도약, 누리호 성공 이후의 과제', cat: 'IT/과학', press: '전자신문', img: 'space' },
    { title: '고령화 사회, 지속 가능한 연금 개혁의 방향성', cat: '사회', press: '경향신문', img: 'old' },
    { title: '글로벌 공급망 재편 속 기업들의 생존 전략', cat: '경제', press: '서울경제', img: 'factory' },
    { title: '탄소 중립 실현을 위한 에너지 믹스 정책 재검토', cat: '사회', press: '세계일보', img: 'nature' }
];

extraItems.forEach((item, i) => {
    MOCK_EDITORIALS.push({
        id: `k${i + 4}`,
        title: item.title,
        content_summary: `${item.title}에 관한 심층적인 분석과 전망을 담은 사설입니다. ${item.cat} 분야의 주요 현안을 전문가의 시선으로 짚어봅니다.`,
        url: 'https://news.naver.com/opinion/series',
        category: item.cat,
        press: item.press,
        vector: generateRandomVector(),
        created_at: new Date().toISOString(),
        image_url: `https://source.unsplash.com/random/800x600?${item.img}`
    });
});
