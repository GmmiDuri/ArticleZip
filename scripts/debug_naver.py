import requests
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}
url = "https://n.news.naver.com/mnews/article/421/0008770777?sid=110"
resp = requests.get(url, headers=headers)
with open('debug_naver.html', 'w', encoding='utf-8') as f:
    f.write(resp.text)
print(f"Status: {resp.status_code}")
print(f"Length: {len(resp.text)}")
