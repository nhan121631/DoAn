@app.route('/ai_search', methods=['POST'])
def ai_search():
    data = request.get_json()
    user_query = data.get('query', '')

    if not user_query:
        return jsonify({"error": "Missing query"}), 400

    knowledge = '''
    Bạn là một trợ lý thông minh chuyên gợi ý tìm kiếm phòng trọ như YouTube.\n\n
    Người dùng nhập: "{user_query}"\n\n
    Hãy trả về đúng 10 gợi ý tìm kiếm phù hợp nhất dưới dạng mảng JSON, mỗi phần tử là một object:
    [
      {{ "title": "..." }},
      ...
    ]
    Chỉ trả về đúng mảng JSON như trên, không thêm giải thích, không markdown, không văn bản thừa.
    '''

    prompt = knowledge.replace('{user_query}', user_query)
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    headers = {"Content-Type": "application/json"}

    API_KEY = os.getenv("API_KEY")
    MODEL = "gemini-2.0-flash"
    URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"

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
            return jsonify({"error": "AI không trả về đúng định dạng JSON", "raw": text})
    except Exception as e:
        return jsonify({"error": str(e)})