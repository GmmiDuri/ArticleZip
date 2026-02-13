import google.generativeai as genai
import os
import sys

# Add current directory to path
sys.path.append(os.path.dirname(__file__))

def load_env():
    env_path = os.path.join(os.path.dirname(__file__), '../.env')
    api_key = None
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                if line.startswith('VITE_GEMINI_API_KEY='):
                    api_key = line.strip().split('=')[1]
                    break
    return api_key

api_key = load_env()
if not api_key:
    print("No API Key found")
    sys.exit(1)

genai.configure(api_key=api_key)

try:
    print("Listing models...")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error listing models: {e}")
