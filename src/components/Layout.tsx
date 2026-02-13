import React, { useState } from 'react';
import { Newspaper, User, Home, LogIn, LogOut, X, Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const { user, loading, signIn, signOut, emailSignIn, emailSignUp } = useUser();

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    const navItems = [
        { icon: Home, label: '홈', path: '/' },
        { icon: User, label: '프로필', path: '/profile' },
    ];

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setDisplayName('');
        setAuthError('');
        setAuthLoading(false);
    };

    const openModal = (signUp: boolean) => {
        setIsSignUp(signUp);
        resetForm();
        setShowAuthModal(true);
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        setAuthLoading(true);
        try {
            if (isSignUp) {
                if (!displayName.trim()) {
                    setAuthError('이름을 입력해주세요.');
                    setAuthLoading(false);
                    return;
                }
                await emailSignUp(email, password, displayName);
            } else {
                await emailSignIn(email, password);
            }
            setShowAuthModal(false);
            resetForm();
        } catch (error: any) {
            const code = error?.code || '';
            if (code === 'auth/email-already-in-use') {
                setAuthError('이미 등록된 이메일입니다.');
            } else if (code === 'auth/weak-password') {
                setAuthError('비밀번호는 6자 이상이어야 합니다.');
            } else if (code === 'auth/invalid-email') {
                setAuthError('유효하지 않은 이메일 형식입니다.');
            } else if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
                setAuthError('이메일 또는 비밀번호가 올바르지 않습니다.');
            } else {
                setAuthError('인증 오류가 발생했습니다. 다시 시도해주세요.');
            }
            setAuthLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setAuthLoading(true);
        try {
            await signIn();
            setShowAuthModal(false);
            resetForm();
        } catch {
            setAuthError('Google 로그인에 실패했습니다.');
            setAuthLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-yellow-500 selection:text-black">
            {/* Background Ambience */}
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
                                            {user.photoURL ? (
                                                <img
                                                    src={user.photoURL}
                                                    alt={user.name}
                                                    className="w-8 h-8 rounded-full border-2 border-yellow-400/50"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full border-2 border-yellow-400/50 bg-yellow-400/20 flex items-center justify-center">
                                                    <span className="text-sm font-bold text-yellow-400">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
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
                                        onClick={() => openModal(false)}
                                        className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg shadow-yellow-400/20 hover:shadow-yellow-300/30"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        로그인
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

            {/* Auth Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}></div>
                    <div className="relative bg-slate-800 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in">
                        {/* Close button */}
                        <button
                            onClick={() => setShowAuthModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {isSignUp ? '회원가입' : '로그인'}
                        </h2>
                        <p className="text-sm text-slate-400 mb-6">
                            {isSignUp ? '새 계정을 만들어 시작하세요' : 'ArticleZip에 오신 것을 환영합니다'}
                        </p>

                        {/* Google Login */}
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={authLoading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-gray-800 rounded-xl font-bold text-sm transition-all duration-200 mb-4 disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google로 계속하기
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-1 h-px bg-white/10"></div>
                            <span className="text-xs text-slate-500 font-medium">또는</span>
                            <div className="flex-1 h-px bg-white/10"></div>
                        </div>

                        {/* Email Form */}
                        <form onSubmit={handleEmailAuth} className="space-y-3">
                            {isSignUp && (
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">이름</label>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="표시할 이름"
                                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/20 transition-all"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">이메일</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">비밀번호</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="6자 이상"
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/20 transition-all"
                                />
                            </div>

                            {/* Error message */}
                            {authError && (
                                <p className="text-red-400 text-xs font-medium bg-red-400/10 px-3 py-2 rounded-lg">
                                    {authError}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={authLoading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-yellow-400/20 disabled:opacity-50"
                            >
                                <Mail className="w-4 h-4" />
                                {authLoading ? '처리 중...' : (isSignUp ? '회원가입' : '이메일로 로그인')}
                            </button>
                        </form>

                        {/* Toggle sign-up / sign-in */}
                        <p className="text-center text-sm text-slate-400 mt-5">
                            {isSignUp ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}{' '}
                            <button
                                onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }}
                                className="text-yellow-400 hover:text-yellow-300 font-bold transition-colors"
                            >
                                {isSignUp ? '로그인' : '회원가입'}
                            </button>
                        </p>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="relative z-10 pt-28 pb-20 px-4 md:px-0">
                <div className="max-w-4xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
