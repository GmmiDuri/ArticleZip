import feedparser
from bs4 import BeautifulSoup
import json
import os
import sys
import time
from datetime import datetime
from collections import Counter
import numpy as np

# Firebase Admin Imports
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# 결과 저장을 위한 경로 설정
sys.path.append(os.path.dirname(__file__))

from deep_translator import GoogleTranslator

# Initialize Firebase for Crawler
cred_path = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")
if not firebase_admin._apps:
    try:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin Initialized")
    except Exception as e:
        print(f"Warning: Firebase init failed: {e}")

db = firestore.client()

def get_user_vectors():
    """Fetch all user preference vectors from users/{uid}/preferences and calculate average."""
    try:
        all_vectors = []

        # 모든 사용자의 preferences 서브컬렉션에서 벡터 수집
        users_ref = db.collection('users')
        for user_doc in users_ref.stream():
            prefs = users_ref.document(user_doc.id).collection('preferences').stream()
            for pref_doc in prefs:
                data = pref_doc.to_dict()
                if 'vector' in data and data['vector']:
                    all_vectors.append(data['vector'])
        
        if not all_vectors:
            return None
        
        # Calculate average vector
        avg_vector = np.mean(all_vectors, axis=0)
        return avg_vector
    except Exception as e:
        print(f"Error fetching user vectors: {e}")
        return None

def get_user_keywords():
    """
    users/{uid}/preferences 서브컬렉션에서 키워드 빈도를 집계합니다.
    Returns: Counter 객체 (e.g., Counter({'dementia': 3, 'cancer': 2, ...}))
    """
    try:
        keyword_counter = Counter()
        users_ref = db.collection('users')
        for user_doc in users_ref.stream():
            prefs = users_ref.document(user_doc.id).collection('preferences').stream()
            for pref_doc in prefs:
                data = pref_doc.to_dict()
                if 'keywords' in data and data['keywords']:
                    for kw in data['keywords']:
                        keyword_counter[kw.lower()] += 1
        
        if keyword_counter:
            print(f"User keyword profile loaded: {len(keyword_counter)} unique keywords")
            print(f"  Top 10: {keyword_counter.most_common(10)}")
        else:
            print("No user keyword data found.")
        
        return keyword_counter
    except Exception as e:
        print(f"Error fetching user keywords: {e}")
        return Counter()

def keyword_similarity(article_keywords, user_keyword_freq):
    """
    논문 키워드와 사용자 키워드 빈도 프로필 간의 유사도를 계산합니다.
    겹치는 키워드의 빈도를 가중치로 사용하여 0~1 사이 값을 반환합니다.
    """
    if not article_keywords or not user_keyword_freq:
        return 0.0
    
    total_freq = sum(user_keyword_freq.values())
    if total_freq == 0:
        return 0.0
    
    score = 0.0
    for kw in article_keywords:
        kw_lower = kw.lower()
        if kw_lower in user_keyword_freq:
            score += user_keyword_freq[kw_lower]
    
    # Normalize: score / total_freq, capped at 1.0
    normalized = min(score / total_freq, 1.0)
    return normalized

def cosine_similarity(v1, v2):
    dot_product = np.dot(v1, v2)
    norm_a = np.linalg.norm(v1)
    norm_b = np.linalg.norm(v2)
    if norm_a == 0 or norm_b == 0:
        return 0
    return dot_product / (norm_a * norm_b)

def get_vector_by_press(press):
    # Mock vector generation consistent with frontend
    if press == 'JAMA': return [0.9, 0.1, 0.2, 0.0, 0.5]
    elif press == 'The Lancet': return [0.85, 0.2, 0.3, 0.1, 0.4]
    elif press == 'Nature': return [0.2, 0.9, 0.1, 0.8, 0.3]
    elif press == 'Science': return [0.2, 0.85, 0.1, 0.9, 0.3]
    elif press == 'Cell': return [0.1, 0.95, 0.0, 0.4, 0.2]
    elif press == 'BMJ': return [0.8, 0.15, 0.6, 0.1, 0.5]
    else: return [0.5, 0.5, 0.5, 0.5, 0.5]

def scrape_medical_journals():
    feeds = {
        "JAMA": "https://jamanetwork.com/rss/site_67/mostRecent.xml",
        "The Lancet": "https://www.thelancet.com/rssfeed/lancet_current.xml",
        "Nature": "http://feeds.nature.com/nature/rss/current",
        "Science": "https://www.science.org/rss/express", 
        "Cell": "https://www.cell.com/cell/current.rss",
        "BMJ": "https://www.bmj.com/rss/research.xml"
    }

    articles = []
    MAX_PER_JOURNAL = 20
    translator = GoogleTranslator(source='en', target='ko')
    user_vector_profile = get_user_vectors()
    user_keyword_profile = get_user_keywords()
    
    if user_vector_profile is not None:
        print(f"User vector profile loaded. (Dim: {len(user_vector_profile)})")
    else:
        print("No user vector history found. Using default ordering.")

    print("Starting article collection... (Skipping AI analysis)")

    for journal_name, rss_url in feeds.items():
        print(f"\nFetching {journal_name}...")
        try:
            feed = feedparser.parse(rss_url)
            count = 0
            for entry in feed.entries:
                if count >= MAX_PER_JOURNAL: break
                
                try:
                    title_en = entry.title
                    link = entry.link
                    
                    if any(title_en.strip().lower().startswith(tag) for tag in ['[editorial]', '[comment]', '[correspondence]', '[news]', '[perspective]']):
                        continue

                    try:
                        title_ko = translator.translate(title_en)
                        time.sleep(0.5) 
                    except Exception as e:
                        print(f"  > Translation failed: {e}")
                        title_ko = title_en

                    abstract = "No summary available"
                    if hasattr(entry, 'description'):
                        soup = BeautifulSoup(entry.description, 'html.parser')
                        abstract = soup.get_text().strip()[:300] + "..."
                    elif hasattr(entry, 'summary'):
                        soup = BeautifulSoup(entry.summary, 'html.parser')
                        abstract = soup.get_text().strip()[:300] + "..."

                    # Extract keywords from title for matching
                    article_keywords = [w.lower() for w in title_en.split() if len(w) > 3]

                    # Generate Vector
                    vector = get_vector_by_press(journal_name)
                    
                    # Calculate Recommendation Score (Hybrid: vector + keyword)
                    vec_score = 0.0
                    kw_score = 0.0
                    
                    if user_vector_profile is not None:
                        vec_score = cosine_similarity(user_vector_profile, vector)
                    
                    if user_keyword_profile:
                        kw_score = keyword_similarity(article_keywords, user_keyword_profile)
                    
                    # Weighted combination: 50% vector + 50% keyword
                    rec_score = vec_score * 0.5 + kw_score * 0.5

                    articles.append({
                        "title": title_ko,
                        "original_title": title_en,
                        "url": link,
                        "press": journal_name,
                        "content_summary": abstract,
                        "created_at": datetime.now().isoformat(),
                        "summary_bullets": ["Waiting for AI summary"],
                        "keywords": article_keywords[:10],
                        "clinical_impact": "N/A",
                        "vector": vector,
                        "recommendation_score": rec_score
                    })
                    count += 1
                    
                except Exception as e:
                    pass
        except Exception as e:
            print(f"Error ({journal_name}): {e}")

    # Sort all articles by recommendation score descending
    articles.sort(key=lambda x: x.get('recommendation_score', 0), reverse=True)

    return articles

if __name__ == "__main__":
    results = scrape_medical_journals()
    
    # Save path: src/data/medical_journal_data.json
    output_path = os.path.join(os.path.dirname(__file__), '../src/data/medical_journal_data.json')
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=4)
    
    print(f"\nCollection complete! {len(results)} articles saved.")
    print(f"Saved to: {os.path.abspath(output_path)}")
