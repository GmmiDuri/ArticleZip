import React, { useState, useEffect } from 'react';
import { fetchArticles } from '../services/articleService';
import ArticleCard from '../components/ArticleCard';
import { useUser } from '../context/UserContext';
import { Sparkles, History } from 'lucide-react';
import { getRecommendedArticles } from '../services/recommendationService';

const Feed: React.FC = () => {
    const { userPreference, readArticle } = useUser();
    const [activeTab, setActiveTab] = useState<'latest' | 'recommended'>('latest');
    const [displayArticles, setDisplayArticles] = useState<any[]>([]);
    const [allArticles, setAllArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAllArticles, setShowAllArticles] = useState(false);

    const loadArticles = async (isRefresh: boolean = false) => {
        setLoading(true);
        try {
            // Simulate network delay for effect
            await new Promise(resolve => setTimeout(resolve, 800));
            const data = await fetchArticles(isRefresh);
            setAllArticles(data);
            // The useEffect below will handle setting displayArticles based on activeTab
        } catch (error) {
            console.error("Failed to load articles", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadArticles(false);
    }, []);

    const handleRefresh = () => {
        loadArticles(true);
    };

    useEffect(() => {
        if (loading) return;

        if (activeTab === 'recommended' && userPreference) {
            // Re-sort based on user vector
            const sorted = getRecommendedArticles(userPreference.vector_profile, allArticles);
            setDisplayArticles(sorted);
        } else {
            // Show latest
            setDisplayArticles(allArticles);
        }
    }, [activeTab, userPreference, allArticles, loading]);

    return (
        <div className="space-y-6 animate-fade-in-up pb-20">
            {/* Header Image & Title Section */}
            <div className="relative rounded-3xl overflow-hidden h-64 shadow-2xl group">
                <img
                    src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=2670&auto=format&fit=crop"
                    alt="Medical Journal Header"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent flex flex-col justify-end p-8">
                    <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">
                        ({new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}) 압축 저널
                    </h2>
                    <p className="text-slate-300 font-medium text-lg drop-shadow-md">
                        엄선된 최신 의학 논문 큐레이션
                    </p>
                </div>
            </div>

            {/* Stats Bar (Read Count) */}
            {userPreference && (
                <div className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-500/20 p-2.5 rounded-xl text-indigo-400">
                            <History className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">오늘 읽은 논문</p>
                            <p className="text-xl font-bold text-white">
                                <span className="text-indigo-400">{userPreference.read_history.length}</span>편
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">개인 맞춤형 피드 반영</p>
                        <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                                style={{ width: `${Math.min(userPreference.read_history.length * 10, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Tabs */}
                <div className="flex bg-slate-800/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
                    <button
                        onClick={() => setActiveTab('latest')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'latest'
                            ? 'bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-400/20'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        최신 1개월
                    </button>
                    <button
                        onClick={() => setActiveTab('recommended')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-1.5 ${activeTab === 'recommended'
                            ? 'bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-400/20'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        추천순
                    </button>
                </div>

                {/* Refresh & Filter Controls */}
                <div className="flex justify-end">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-white/5"
                    >
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        새롭게 압축
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {displayArticles.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">
                            <p>
                                {activeTab === 'latest' && !showAllArticles
                                    ? '최근 1개월 내의 새로운 소식이 없습니다.'
                                    : '표시할 논문이 없습니다.'}
                            </p>
                            {activeTab === 'latest' && !showAllArticles && (
                                <button
                                    onClick={() => setShowAllArticles(true)}
                                    className="mt-4 text-yellow-500 hover:underline"
                                >
                                    전체 보기 (필터 해제)
                                </button>
                            )}
                        </div>
                    ) : (
                        displayArticles.map((article) => (
                            <ArticleCard
                                key={article.id}
                                article={article}
                                onClick={() => readArticle(article)}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Feed;

