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
Bạn là một trợ lý thông minh chuyên gợi ý tìm kiếm phòng trọ như YouTube.\n\nNgười dùng nhập: "{user_query}"\n\nHãy trả về đúng 10 gợi ý tìm kiếm phù hợp nhất dưới dạng mảng JSON, mỗi phần tử là một object:\n[\n  {{ "title": "..." }},\n  ...\n]\n\nChỉ trả về đúng mảng JSON như trên, không thêm giải thích, không markdown, không văn bản thừa.
'''

# Biến cache dữ liệu phòng trọ và thời gian cập nhật
room_cache = {
    'result': None,
    'columns': None,
    'last_update': None
}

# Hàm lấy dữ liệu phòng từ MySQL
def get_rooms():
    import datetime
    now = datetime.datetime.now()
    # Nếu đã cache và chưa quá 24h thì dùng cache
    if room_cache['result'] is not None and room_cache['last_update'] is not None:
        delta = now - room_cache['last_update']
        if delta.total_seconds() < 900:  # 15 phút
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
        import mysql.connector
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
    except Exception:
        return [], None

# Hàm format kết quả phòng trọ cho Gemini
def mysql_result_to_text(result, columns=None):
    def safe(val):
        return str(val) if val not in [None, 'None'] else 'Chưa cập nhật'
    if not result:
        return "❌ Không có dữ liệu phòng phù hợp."
    lines = []
    for row in result[:3]:
        info = {}
        if columns:
            for col, val in zip(columns, row):
                info[col] = safe(val)
        else:
            info = {str(i): safe(v) for i, v in enumerate(row)}
        room_id = info.get('room_id', '')
        if isinstance(row[0], bytes) and len(row[0]) == 16:
            import uuid
            room_id_str = str(uuid.UUID(bytes=row[0]))
        else:
            room_id_str = str(room_id)
        link = f"http://localhost:3000/detail/{room_id_str}" if room_id_str else ""
        line = (
            f"🏠 **{info.get('title', 'Chưa cập nhật')}**\n"
            f"📍 {info.get('full_address', 'Chưa cập nhật')}\n"
            f"💰 Giá thuê: {info.get('price_month', 'Chưa cập nhật')} VNĐ/tháng\n"
            f"📏 Diện tích: {info.get('area', 'Chưa cập nhật')} m²\n"
            f"🛏️ Tiện nghi: {info.get('convenients', 'Chưa cập nhật')}\n"
            f"📝 Mô tả: {info.get('description', 'Chưa cập nhật')}\n"
            f"🔗 [View details]({link})\n"
            "---"
        )
        lines.append(line)
    return "\n".join(lines)

# Hàm gọi Gemini chatbot với lịch sử chat
def gemini_chatbot(history):
    headers = {"Content-Type": "application/json"}
    parts = []
    for turn in history:
        if turn['role'] == 'user':
            parts.append({"text": f"Bạn: {turn['text']}"})
        else:
            parts.append({"text": turn['text']})
    data = {"contents": [{"parts": parts}]}
    response = requests.post(URL, headers=headers, data=json.dumps(data))
    if response.status_code == 200:
        result = response.json()
        try:
            return result["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            return "Không thể lấy phản hồi từ Gemini."
    else:
        return f"Lỗi: {response.status_code} - {response.text}"

# Endpoint chatbot phòng trọ
@app.route('/ai_chatbot', methods=['POST'])
def ai_chatbot():
    data = request.get_json()
    history = data.get("history", [])
    # Lấy dữ liệu phòng từ MySQL
    result, columns = get_rooms()
    print("[DEBUG] SQL result:")
    print("Columns:", columns)
    for row in result:
        print(row)

    # Lọc phòng trọ theo thông tin người dùng hỏi
    def match_room(info, query):
        query_lower = query.lower()
        # Từ điển ánh xạ tiện nghi Việt-Anh
        conv_dict = {
            'nội thất đầy đủ': 'furnished',
            'máy lạnh': 'aircon',
            'tủ lạnh': 'fridge',
            'kệ bếp': 'kitchen_shelf',
            'gác lửng': 'mezzanine',
            'thang máy': 'elevator',
            'camera': 'security_24h',
            'chỗ để xe': 'garage',
            'giờ tự do': 'no_curfew',
            'máy giặt': 'washing_machine',
            'an ninh': 'security_24h',
            'lối đi riêng': 'private_entry',
            'wifi': 'wifi',
            'bếp': 'kitchen_shelf',
            'có chủ': 'owner_lives',
            'không chung chủ': 'no_owner',
        }
        # Kiểm tra địa chỉ
        if 'full_address' in info and info['full_address'] and info['full_address'].lower() in query_lower:
            return True
        # Kiểm tra tiêu đề
        if 'title' in info and info['title'] and info['title'].lower() in query_lower:
            return True
        # Kiểm tra tiện nghi (cả tiếng Anh và Việt)
        if 'convenients' in info and info['convenients']:
            convs = [c.strip().lower() for c in str(info['convenients']).split(',')]
            # So sánh trực tiếp
            for conv in convs:
                if conv in query_lower:
                    return True
            # So sánh qua từ điển ánh xạ
            for vi, en in conv_dict.items():
                if vi in query_lower and en in convs:
                    return True
        # Kiểm tra giá
        import re
        price_match = re.search(r'(\d+[.,]?\d*)\s*(vn[đd]|vnd|đ|dong|nghìn|triệu)', query_lower)
        if price_match and 'price_month' in info:
            try:
                price = float(str(info['price_month']).replace(',', '').replace('.', ''))
                query_price = float(price_match.group(1).replace(',', '').replace('.', ''))
                if abs(price - query_price) < 500000:  # cho phép lệch 500k
                    return True
            except:
                pass
        # Kiểm tra diện tích
        area_match = re.search(r'(\d+[.,]?\d*)\s*m2|m²|m2', query_lower)
        if area_match and 'area' in info:
            try:
                area = float(str(info['area']).replace(',', '').replace('.', ''))
                query_area = float(area_match.group(1).replace(',', '').replace('.', ''))
                if abs(area - query_area) < 5:
                    return True
            except:
                pass
        return False

    # Nếu có câu hỏi cụ thể, lọc phòng phù hợp
    user_query = ""
    for turn in history:
        if turn.get('role') == 'user':
            user_query = turn.get('text', '')
            break
    filtered = []
    for row in result:
        info = {col: str(val) if val not in [None, 'None'] else '' for col, val in zip(columns, row)}
        if match_room(info, user_query):
            filtered.append(row)
    if filtered:
        context_text = mysql_result_to_text(filtered, columns)
    else:
        context_text = mysql_result_to_text(result, columns)
    # Thêm prompt khởi tạo vào đầu history nếu chưa có
    if not history or 'Bạn là chatbot tư vấn phòng trọ' not in history[0]['text']:
        initial_prompt = (
            "You are Ants, a virtual assistant for the Ants website specializing in rental rooms, "
            "apartments, and houses. Your task:\n"
            "- Introduce and provide advice on rental options based on the available data.\n"
            "- Clearly explain prices, amenities, location, rental conditions, and booking procedures.\n"
            "- Answer politely, in a friendly tone, with accurate, concise, and easy-to-understand information.\n"
            "- If the requested information is not found or unclear, respond with: "
            "'Sorry, I currently do not have information about a suitable rental room. "
            "Please visit our website or contact our hotline for more details.'\n"
            "- Do not answer questions unrelated to rentals, housing, or Ants services.\n"
            "- Always reply in English.\n\n"
            "Important search guideline:\n"
            "- When the user provides an address or area name, normalize it by converting to lowercase, "
            "removing Vietnamese diacritics, stripping extra spaces, and splitting into keywords.\n"
            "- Match results in 'full_address' by checking that all keywords appear in any order.\n"
            "- Prefer closest matches if no exact match is found.\n"
            "- Always include a clickable link to the room in Markdown format:\n"
            "  🔗 [View room details]({link})\n\n"
            f"Available room data:\n{context_text}"
        )
        history = [{'role': 'user', 'text': initial_prompt}] + history
    reply = gemini_chatbot(history)
    return jsonify({"reply": reply})

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
            # print("[DEBUG] AI raw reply:")
            # print(text)
            return jsonify({"error": "AI không trả về đúng định dạng JSON", "raw": text})
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(port=5000)
