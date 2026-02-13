import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserPreference, Editorial } from '../types';
import { updateUserVector } from '../services/recommendationService';
import { trackArticleClick } from '../services/articleService';
import { auth, signInWithGoogle, signOutUser, signInWithEmail, signUpWithEmail } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface UserContextType {
    user: User | null;
    userPreference: UserPreference | null;
    loading: boolean;
    readArticle: (article: Editorial) => void;
    updateInterests: (categories: string[]) => void;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    emailSignIn: (email: string, password: string) => Promise<void>;
    emailSignUp: (email: string, password: string, name: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const getStorageKey = (uid: string) => `userPreference_${uid}`;

const loadUserPreference = (uid: string): UserPreference => {
    const saved = localStorage.getItem(getStorageKey(uid));
    if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.keyword_profile) {
            parsed.keyword_profile = {};
        }
        return { ...parsed, uid };
    }
    return {
        uid,
        interests: {},
        read_history: [],
        vector_profile: [0.1, 0.1, 0.1, 0.1, 0.1],
        keyword_profile: {}
    };
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userPreference, setUserPreference] = useState<UserPreference | null>(null);
    const [loading, setLoading] = useState(true);

    // Firebase Auth 상태 리스너
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                const appUser: User = {
                    uid: firebaseUser.uid,
                    name: firebaseUser.displayName || 'User',
                    email: firebaseUser.email || '',
                    photoURL: firebaseUser.photoURL || undefined
                };
                setUser(appUser);
                setUserPreference(loadUserPreference(firebaseUser.uid));
            } else {
                setUser(null);
                setUserPreference(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async () => {
        await signInWithGoogle();
    };

    const handleSignOut = async () => {
        if (user) {
            // 로그아웃 전 현재 상태 저장
            if (userPreference) {
                localStorage.setItem(getStorageKey(user.uid), JSON.stringify(userPreference));
            }
        }
        await signOutUser();
    };

    const readArticle = (article: Editorial) => {
        if (!userPreference || !user) return;

        // 1. Update Read History (Prevent duplicates)
        if (userPreference.read_history.includes(article.id)) {
            console.log(`[User Context] Article "${article.title}" already read.`);
            return;
        }

        const newHistory = [...userPreference.read_history, article.id];

        // 2. Update Vector Profile (Core Logic)
        const newVector = updateUserVector(userPreference.vector_profile, article.vector);

        // 3. Firebase 저장 + Gemini 키워드 추출 (비동기)
        trackArticleClick(article, user.uid).then((keywords) => {
            // 4. keyword_profile 업데이트 — 키워드 빈도 누적
            const updatedKeywordProfile = { ...userPreference.keyword_profile };
            keywords.forEach(keyword => {
                const key = keyword.toLowerCase();
                updatedKeywordProfile[key] = (updatedKeywordProfile[key] || 0) + 1;
            });

            const preferenceWithKeywords = {
                ...userPreference,
                read_history: newHistory,
                vector_profile: newVector,
                keyword_profile: updatedKeywordProfile
            };

            setUserPreference(preferenceWithKeywords);
            localStorage.setItem(getStorageKey(user.uid), JSON.stringify(preferenceWithKeywords));

            console.log('[User Context] keyword_profile updated:', updatedKeywordProfile);
        });

        // 즉시 벡터 프로필은 업데이트 (키워드는 비동기로 나중에 업데이트)
        const newPreference = {
            ...userPreference,
            read_history: newHistory,
            vector_profile: newVector
        };

        setUserPreference(newPreference);
        localStorage.setItem(getStorageKey(user.uid), JSON.stringify(newPreference));

        console.log(`[User Context] Read "${article.title}". New Vector:`, newVector);
    };

    const updateInterests = (categories: string[]) => {
        if (!userPreference || !user) return;

        const CATEGORY_MAP = ['정치', '경제', '사회', 'IT/과학', '세계'];

        const newVector = CATEGORY_MAP.map(cat =>
            categories.includes(cat) ? 0.8 : 0.0
        );

        const newPreference = {
            ...userPreference,
            vector_profile: newVector
        };

        setUserPreference(newPreference);
        localStorage.setItem(getStorageKey(user.uid), JSON.stringify(newPreference));

        console.log(`[User Context] Interests updated: ${categories}. New Vector:`, newVector);
    };

    const emailSignIn = async (email: string, password: string) => {
        await signInWithEmail(email, password);
    };

    const emailSignUp = async (email: string, password: string, name: string) => {
        await signUpWithEmail(email, password, name);
    };

    return (
        <UserContext.Provider value={{
            user,
            userPreference,
            loading,
            readArticle,
            updateInterests,
            signIn,
            signOut: handleSignOut,
            emailSignIn,
            emailSignUp
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};


