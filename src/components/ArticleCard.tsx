import React from 'react';
import { Calendar } from 'lucide-react';
import type { Editorial } from '../types';

interface ArticleCardProps {
    article: Editorial;
    onClick?: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick }) => {
    const isEditorial = 'press' in article;

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div
            onClick={onClick}
            className="group relative bg-slate-800/50 hover:bg-slate-800/80 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 h-[220px]"
        >
            <div className="flex flex-col md:flex-row h-full">
                {/* Image Section */}
                <div className="md:w-1/3 relative overflow-hidden h-full">
                    <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                    <img
                        src={(article as any).image_url || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800"}
                        alt={article.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    {isEditorial && (
                        <div className="absolute top-4 left-4 z-20">
                            <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/10 uppercase tracking-wider">
                                {(article as Editorial).press}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 p-5 flex flex-col justify-between overflow-hidden">
                    <div className="min-h-0">
                        <div className="flex items-start gap-4 mb-1">
                            {/* Main Title (English) - Clickable link to original article */}
                            <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-lg font-bold text-white hover:text-yellow-400 transition-colors line-clamp-2 leading-snug"
                            >
                                {article.original_title || article.title}
                            </a>
                        </div>

                        {/* Sub Title: Korean translation */}
                        {article.original_title && (
                            <h4 className="text-xs text-slate-400 font-medium leading-relaxed mb-2 line-clamp-1">
                                {article.title}
                            </h4>
                        )}

                        {/* Published Date */}
                        {(article as any).published_date && (
                            <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate((article as any).published_date)}
                            </p>
                        )}
                    </div>

                    {/* Author */}
                    {article.author && (
                        <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                            {article.author}
                        </p>
                    )}

                    {/* Abstract (Truncated) */}
                    <div className="text-sm text-slate-300 leading-relaxed bg-slate-800/30 p-2.5 rounded-lg border border-white/5">
                        <p className="line-clamp-2">
                            {article.content_summary || '요약 없음'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleCard;
