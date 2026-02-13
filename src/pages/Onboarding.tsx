import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Check, Sparkles, Newspaper } from 'lucide-react';

const CATEGORIES = [
    { id: '정치', label: '정치', icon: '⚖️', desc: '국회, 입법, 행정 소식' },
    { id: '경제', label: '경제', icon: '📈', desc: '금융, 증권, 부동산 트렌드' },
    { id: '사회', label: '사회', icon: '👥', desc: '교육, 노동, 환경 이슈' },
    { id: 'IT/과학', label: 'IT/과학', icon: '💻', desc: 'AI, 테크, 모바일 신기술' },
    { id: '세계', label: '세계', icon: '🌍', desc: '글로벌 정세와 국제 뉴스' },
];

const Onboarding: React.FC = () => {
    const { updateInterests } = useUser();
    const navigate = useNavigate();
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const toggleCategory = (id: string) => {
        setSelectedCategories(prev =>
            prev.includes(id)
                ? prev.filter(c => c !== id)
                : [...prev, id]
        );
    };

    const handleComplete = () => {
        if (selectedCategories.length === 0) return;
        updateInterests(selectedCategories);
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 flex flex-col items-center justify-center p-6 font-sans">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px] opacity-40"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[100px] opacity-30"></div>
            </div>

            <div className="relative z-10 w-full max-w-3xl text-center space-y-12 animate-fade-in-up">

                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="p-3 bg-yellow-400 rounded-xl shadow-lg shadow-yellow-400/20">
                            <Newspaper className="w-8 h-8 text-slate-900" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                        관심 분야를 선택해주세요
                    </h1>
                    <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
                        선택하신 관심사를 분석하여<br className="md:hidden" /> <span className="text-yellow-400 font-bold">인공지능 큐레이터</span>가 딱 맞는 기사를 추천해드립니다.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {CATEGORIES.map((cat) => {
                        const isSelected = selectedCategories.includes(cat.id);
                        return (
                            <button
                                key={cat.id}
                                onClick={() => toggleCategory(cat.id)}
                                className={`relative group p-6 rounded-2xl border transition-all duration-300 text-left hover:-translate-y-1
                                    ${isSelected
                                        ? 'bg-yellow-400/10 border-yellow-400/50 shadow-lg shadow-yellow-400/10'
                                        : 'bg-slate-800/40 border-white/5 hover:border-white/10 hover:bg-slate-800/60'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-3xl">{cat.icon}</span>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                        ${isSelected
                                            ? 'bg-yellow-400 border-yellow-400 text-slate-900'
                                            : 'border-slate-600 group-hover:border-slate-500'
                                        }`}
                                    >
                                        {isSelected && <Check className="w-4 h-4" strokeWidth={3} />}
                                    </div>
                                </div>
                                <h3 className={`text-lg font-bold mb-1 ${isSelected ? 'text-yellow-400' : 'text-white'}`}>
                                    {cat.label}
                                </h3>
                                <p className="text-xs text-slate-400 font-medium">
                                    {cat.desc}
                                </p>
                            </button>
                        );
                    })}
                </div>

                {/* Footer Action */}
                <div className="pt-8">
                    <button
                        onClick={handleComplete}
                        disabled={selectedCategories.length === 0}
                        className={`px-10 py-4 rounded-xl text-lg font-bold transition-all duration-300 flex items-center gap-2 mx-auto
                            ${selectedCategories.length > 0
                                ? 'bg-yellow-400 text-slate-900 shadow-xl shadow-yellow-400/20 hover:scale-105 hover:bg-yellow-300'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        <Sparkles className="w-5 h-5" />
                        맞춤 큐레이션 시작하기
                    </button>
                    <p className="mt-4 text-sm text-slate-500">
                        나중에 프로필에서 언제든지 변경할 수 있습니다.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
