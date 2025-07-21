from flask import Flask, request, jsonify
import requests
import json
import os
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")
MODEL = "gemini-2.0-flash"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"

app = Flask(__name__)
CORS(app)

knowledge = '''
Bạn là một trợ lý thông minh chuyên gợi ý tìm kiếm video như YouTube.\n\nNgười dùng nhập: "{user_query}"\n\nHãy trả về đúng 10 gợi ý tìm kiếm phù hợp nhất dưới dạng mảng JSON, mỗi phần tử là một object:\n[\n  {{ "title": "..." }},\n  ...\n]\n\nChỉ trả về đúng mảng JSON như trên, không thêm giải thích, không markdown, không văn bản thừa.
'''

@app.route('/ai_search', methods=['POST'])
def ai_search():
    data = request.get_json()
    user_query = data.get('query', '')
    if not user_query:
        return jsonify({"error": "Missing query"}), 400
    prompt = knowledge.replace('{user_query}', user_query)
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    headers = {"Content-Type": "application/json"}
    try:
        resp = requests.post(URL, headers=headers, data=json.dumps(payload), timeout=15)
        resp.raise_for_status()
        result = resp.json()
        text = result["candidates"][0]["content"]["parts"][0]["text"]
        try:
            if '```json' in text:
                text = text.split('```json')[1].split('```')[0].strip()
            elif '```' in text:
                text = text.split('```')[1].split('```')[0].strip()
            suggestions = json.loads(text)
            return jsonify(suggestions)
        except Exception:
            print("[DEBUG] AI raw reply:")
            print(text)
            return jsonify({"error": "AI không trả về đúng định dạng JSON", "raw": text})
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(port=5000)
