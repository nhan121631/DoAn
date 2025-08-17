from flask import Flask, request, jsonify
from flask_cors import CORS
import os, datetime
import mysql.connector
import requests, json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)


# Biến cache dữ liệu phòng trọ
room_cache = {
    'result': None,
    'columns': None,
    'last_update': None
}

# Hàm lấy dữ liệu phòng từ MySQL
def get_rooms():
    now = datetime.datetime.now()
    if room_cache['result'] and room_cache['last_update']:
        delta = now - room_cache['last_update']
        if delta.total_seconds() < 900:  # cache 15 phút
            return room_cache['result'], room_cache['columns']

    host = os.getenv("DB_HOST")
    port = os.getenv("DB_PORT")
    database = os.getenv("DB_NAME")
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")

    query = '''SELECT 
        r.id AS room_id,
        r.title,
        r.description,
        r.price_month,
        r.price_deposit,
        r.area,
        r.post_start_date,
        r.post_end_date,
        CONCAT(a.name_street, ', ', w.name, ', ', d.name, ', ', p.name) AS full_address,
        GROUP_CONCAT(c.name SEPARATOR ', ') AS convenients
    FROM rooms r
    JOIN addresses a ON r.address_id = a.id
    JOIN wards w ON a.ward_id = w.id
    JOIN districts d ON w.district_id = d.id
    JOIN provinces p ON d.province_id = p.id
    LEFT JOIN room_convenients rc ON r.id = rc.room_id
    LEFT JOIN convenients c ON rc.convenient_id = c.id
    WHERE r.approval=1 AND r.available=0 AND r.post_end_date > CURRENT_DATE AND r.is_removed = 0 AND hidden =0
    GROUP BY r.id;'''

    try:
        conn = mysql.connector.connect(host=host, user=user, port=port, password=password, database=database)
        cursor = conn.cursor()
        cursor.execute(query)
        result = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        cursor.close()
        conn.close()

        room_cache['result'] = result
        room_cache['columns'] = columns
        room_cache['last_update'] = now

        return result, columns
    except Exception as e:
        print(f"[ERROR] Database connection failed: {e}")
        return [], None

# API chatbot - dùng prompt chi tiết, dữ liệu thô
@app.route('/ai_chatbot', methods=['POST'])
def ai_chatbot():
    data = request.get_json()
    history = data.get("history", [])

    # Lấy dữ liệu phòng từ MySQL
    result, columns = get_rooms()

    # Chuyển dữ liệu SQL thành văn bản thô
    rooms_text = ""
    for row in result:
        info = {col: str(val) if val not in [None, 'None'] else 'Chưa cập nhật' for col, val in zip(columns, row)}
        link = f"http://localhost:3000/detail/{info.get('room_id','')}"
        rooms_text += f"- Title: {info.get('title','')}\n"
        rooms_text += f"  Address: {info.get('full_address','')}\n"
        rooms_text += f"  Price: {info.get('price_month','')} VNĐ/month\n"
        rooms_text += f"  Area: {info.get('area','')} m²\n"
        rooms_text += f"  Convenients: {info.get('convenients','')}\n"
        # rooms_text += f"  Description: {info.get('description','')}\n"
        rooms_text += f"  Link: {link}\n\n"

    # Thêm prompt chi tiết nếu chưa có
    if not history or 'Bạn là Ants' not in str(history[0]):
        initial_prompt = (
            "Bạn là Ants, trợ lý ảo cho website Ants chuyên về phòng trọ cho thuê, \n"
            "- Luôn trả lời bằng tiếng Anh.\n\n"
            "Nhiệm vụ của bạn:\n"
            "- Giới thiệu và tư vấn về các lựa chọn cho thuê dựa trên dữ liệu có sẵn.\n"
            "- Giải thích rõ ràng giá cả, tiện nghi, vị trí, điều kiện cho thuê và quy trình đặt phòng.\n"
            "- Nếu có câu hỏi cụ thể, hãy trả lời các phòng phù hợp nhất.\n" 
            "- Trả lời lịch sự, giọng điệu thân thiện, cung cấp thông tin chính xác, ngắn gọn và dễ hiểu.\n"
            "- Nếu thông tin không có sẵn, trả lời: "
            "I'm sorry, currently I do not have information about suitable rooms for rent. "
            "Please visit our website or contact our hotline 0388953628 for more details.\n"
            "- Không trả lời các câu hỏi không liên quan đến dịch vụ cho thuê, nhà ở hoặc dịch vụ của Ants.\n"
            "- Quy trình đặt phòng: 1. Tìm kiếm phòng phù hợp 2. Xem chi tiết phòng 3. Chọn đặt phòng 4. Theo dõi trạng thái thuê ở trang lịch sử thuê 5. Đặt cọc qua chuyển khoản là đã hoàn thành thuê phòng.\n"
            "- Always include a clickable link to the room in Markdown format: 🔗 [View room details]({link})\n\n"
            f"Available room data:\n{rooms_text}"
        )
        history = [{'role': 'user', 'text': initial_prompt}] + history

    # Chuẩn bị payload gửi API Gemini
    API_KEY = os.getenv("API_KEY")
    print("API_KEY loaded:", API_KEY)
    MODEL = "gemini-2.0-flash"
    URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"

    parts = []
    for turn in history:
        if turn['role'] == 'user':
            parts.append({"text": f"Bạn: {turn['text']}"})
        else:
            parts.append({"text": turn['text']})

    payload = {"contents": [{"parts": parts}]}
    headers = {"Content-Type": "application/json"}

    try:
        resp = requests.post(URL, headers=headers, data=json.dumps(payload), timeout=15)
        resp.raise_for_status()
        result = resp.json()
        reply = result["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        reply = f"Lỗi khi gọi API: {str(e)}"

    return jsonify({"reply": reply})

# API search giữ nguyên
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

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
