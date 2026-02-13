import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import json
import os

# 1. Initialize Firebase Admin SDK
# You must download 'serviceAccountKey.json' from Firebase Console -> Project Settings -> Service Accounts
# and place it in the same folder as this script.
cred_path = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")

if not os.path.exists(cred_path):
    print(f"Error: {cred_path} not found.")
    print("Please download the Service Account Key from Firebase Console and save it as 'scripts/serviceAccountKey.json'.")
    exit(1)

cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

db = firestore.client()

def upload_articles():
    # 2. Read scanned data
    json_path = os.path.join(os.path.dirname(__file__), "../medical_journal_data.json")
    if not os.path.exists(json_path):
        print("Error: naver_news_data.json not found. Run naver_crawler.py first.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        articles = json.load(f)

    print(f"Uploading {len(articles)} articles to Firestore...")

    # 3. Upload to 'articles' collection
    collection_ref = db.collection("articles")
    
    batch = db.batch()
    count = 0
    
    for article in articles:
        # Use URL or Title hash as ID to prevent duplicates if desired, 
        # or let Firestore generate ID. Here we use a generated ID but check for existing could be added.
        # For this example, we'll let Firestore generate valid IDs or use a deterministic ID if we had one.
        # Let's verify if URL exists to avoid duplicates is a good practice, but for batch speed we might skip read.
        
        # Simple approach: Create a new document
        doc_ref = collection_ref.document()
        batch.set(doc_ref, article)
        count += 1
        
        if count % 400 == 0: # Batch limit is 500
            batch.commit()
            batch = db.batch()
            print(f"Committed {count} articles...")

    if count % 400 != 0:
        batch.commit()

    print(f"Successfully uploaded {count} articles to Firestore.")

if __name__ == "__main__":
    upload_articles()
