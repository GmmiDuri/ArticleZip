import React from 'react';
import { Newspaper, User, Home, LogIn, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const { user, loading, signIn, signOut } = useUser();

    const navItems = [
        { icon: Home, label: '홈', path: '/' },
        { icon: User, label: '프로필', path: '/profile' },
    ];

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-yellow-500 selection:text-black">
            {/* Background Ambience - Navy/Yellow Theme */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px] opacity-40"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[100px] opacity-30"></div>
            </div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
                <div className="glass px-6 py-4">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="p-2.5 bg-yellow-400 rounded-lg shadow-lg shadow-yellow-400/20 group-hover:scale-105 transition-all duration-300">
                                <Newspaper className="w-6 h-6 text-slate-900" />
                            </div>
                            <h1 className="text-xl font-bold text-white tracking-tight group-hover:text-yellow-400 transition-colors">
                                ArticleZip
                            </h1>
                        </Link>

                        <div className="flex items-center gap-4">
                            <nav className="hidden md:flex items-center gap-2">
                                {navItems.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2
                      ${isActive
                                                    ? 'bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-400/20'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>

                            {/* Auth Button */}
                            {!loading && (
                                user ? (
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            {user.photoURL && (
                                                <img
                                                    src={user.photoURL}
                                                    alt={user.name}
                                                    className="w-8 h-8 rounded-full border-2 border-yellow-400/50"
                                                />
                                            )}
                                            <span className="text-sm text-slate-300 hidden md:inline font-medium">
                                                {user.name}
                                            </span>
                                        </div>
                                        <button
                                            onClick={signOut}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                            title="로그아웃"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span className="hidden md:inline">로그아웃</span>
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={signIn}
                                        className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg shadow-yellow-400/20 hover:shadow-yellow-300/30"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        Google 로그인
                                    </button>
                                )
                            )}
                        </div>

                        <button className="md:hidden p-2 text-slate-400 hover:text-white">
                            <div className="w-6 h-0.5 bg-current mb-1.5"></div>
                            <div className="w-6 h-0.5 bg-current mb-1.5"></div>
                            <div className="w-6 h-0.5 bg-current"></div>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 pt-28 pb-20 px-4 md:px-0">
                <div className="max-w-4xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Footer / Mobile Nav could go here */}
        </div>
    );
};

export default Layout;

