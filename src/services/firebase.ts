import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import type { UserArticleSelection } from "../types";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

/**
 * Google 로그인
 */
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log("[Firebase Auth] Signed in:", result.user.displayName);
        return result.user;
    } catch (error) {
        console.error("[Firebase Auth] Sign-in error:", error);
        throw error;
    }
};

/**
 * 로그아웃
 */
export const signOutUser = async () => {
    try {
        await signOut(auth);
        console.log("[Firebase Auth] Signed out");
    } catch (error) {
        console.error("[Firebase Auth] Sign-out error:", error);
        throw error;
    }
};

/**
 * Firestore는 undefined 값을 허용하지 않으므로 제거
 */
const removeUndefined = (obj: Record<string, any>): Record<string, any> => {
    return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => v !== undefined)
    );
};

/**
 * 논문 클릭 시 users/{uid}/preferences 서브컬렉션에 정제된 데이터 저장
 * - 제목, 분야, 초록, Gemini 추출 키워드, 벡터, 선택 시간
 */
export const saveUserPreference = async (selection: UserArticleSelection) => {
    try {
        const { collection, addDoc } = await import("firebase/firestore");
        const uid = selection.userId;
        if (!uid) {
            console.warn("[Firebase] No userId provided, skipping save.");
            return;
        }
        await addDoc(collection(db, "users", uid, "preferences"), removeUndefined({
            ...selection,
            savedAt: new Date().toISOString()
        }));
        console.log("[Firebase] User preference saved to users/" + uid + "/preferences:", {
            title: selection.title,
            keywords: selection.keywords,
            source: selection.source
        });
    } catch (e) {
        console.error("[Firebase] Error saving to user_preferences:", e);
    }
};

export default app;

