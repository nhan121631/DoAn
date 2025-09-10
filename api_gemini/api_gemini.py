from flask import Flask, request, jsonify
from flask_cors import CORS
import os, datetime
import mysql.connector
import requests, json
from dotenv import load_dotenv
import base64
import time
import shutil
from urllib.parse import urlparse

load_dotenv()

app = Flask(__name__)
CORS(app)

# URL base cho Cloudinary
URL_IMAGE = "https://res.cloudinary.com"

# Tạo thư mục images nếu chưa có
IMAGES_DIR = "api_gemini/images/"
if not os.path.exists(IMAGES_DIR):
    os.makedirs(IMAGES_DIR)

def download_media_file(url, filename):
    """Tải file ảnh/video từ URL về thư mục ./images/"""
    try:
        filepath = os.path.join(IMAGES_DIR, filename)
        print(f"[DEBUG] Đang tải {url} về {filepath}...")
        
        # Tải file
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            shutil.copyfileobj(response.raw, f)
            
        print(f"[DEBUG] Đã tải thành công: {filename}")
        return filepath
    except Exception as e:
        print(f"[ERROR] Lỗi khi tải {url}: {e}")
        return None

def cleanup_media_files(filepaths):
    """Xóa các file ảnh/video sau khi xử lý"""
    for filepath in filepaths:
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
                print(f"[DEBUG] Đã xóa file: {filepath}")
        except Exception as e:
            print(f"[ERROR] Lỗi khi xóa {filepath}: {e}")

def load_approval_prompt():
    """Load prompt duyệt phòng từ file markdown"""
    try:
        print("[DEBUG] Đang tìm file promt_approval.md...")
        
        # Thử các đường dẫn có thể có
        file_paths = [
            'promt_approval.md',  # Cùng thư mục
            './promt_approval.md',  # Cùng thư mục với ./
            os.path.join(os.path.dirname(__file__), 'promt_approval.md'),  # Absolute path
            '../promt_approval.md',  # Thư mục cha
            'api_gemini/promt_approval.md',  # Từ root project
        ]
        
        for file_path in file_paths:
            if os.path.exists(file_path):
                print(f"[DEBUG] Tìm thấy file: {file_path}")
                with open(file_path, 'r', encoding='utf-8') as f:
                    prompt_content = f.read()
                    if prompt_content.strip():
                        print(f"✅ [SUCCESS] Đã tải thành công file promt_approval.md ({len(prompt_content)} ký tự)")
                        # Thêm yêu cầu trả về đúng định dạng JSON
                        prompt_content += """

## ⚠️ LƯU Ý QUAN TRỌNG:
Bạn PHẢI trả về kết quả duyệt theo ĐÚNG định dạng JSON sau, không thêm markdown, không thêm text khác:

**Trường hợp KHÔNG DUYỆT:**
{
  "status": 2,
  "content": [
    "Lý do cụ thể 1",
    "Lý do cụ thể 2",
    "..."
  ]
}

**Trường hợp ĐƯỢC DUYỆT:**
{
  "status": 1,
  "content": [
    "Diện tích đạt yêu cầu tối thiểu",
    "Mật độ người/phòng phù hợp",
    "Hình ảnh đầy đủ và rõ ràng",
    "Giá thuê và điện nước hợp lý"
  ]
}

CHỈ trả về JSON thuần, không có ```json, không có giải thích thêm."""
                        return prompt_content
                    else:
                        print(f"[WARNING] File {file_path} trống")
        
        # Nếu không tìm thấy file nào hoặc tất cả đều trống
        print("❌ [FATAL ERROR] Không tìm thấy file promt_approval.md hoặc file trống!")
        return None
        
    except Exception as e:
        print(f"❌ [ERROR] Lỗi khi đọc file promt_approval.md: {e}")
        return None

def approve_room_with_gemini(room_data, prompt):
    """Duyệt phòng bằng AI Gemini với ảnh/video"""
    
    # Xử lý URL ảnh và video  
    media_urls = []
    if room_data.get('images') and isinstance(room_data['images'], list):
        media_urls = [f"{URL_IMAGE}{url}" for url in room_data['images'] if url]
    
    # Tải các file ảnh/video về ./images/
    downloaded_files = []
    for i, url in enumerate(media_urls):
        # Lấy tên file từ URL
        parsed_url = urlparse(url)
        filename = os.path.basename(parsed_url.path)
        if not filename or '.' not in filename:
            # Tạo tên file dựa trên index và loại media
            extension = '.jpg' if '/image/' in url else '.mp4' if '/video/' in url else '.jpg'
            filename = f"room_{room_data.get('id', 'unknown')}_{i+1}{extension}"
        
        filepath = download_media_file(url, filename)
        if filepath:
            downloaded_files.append(filepath)
    
    # Chuyển dữ liệu phòng thành text để gửi AI
    convenients_text = ', '.join(room_data.get('convenients', [])) if isinstance(room_data.get('convenients'), list) else str(room_data.get('convenients', ''))
    
    room_info = f"""
Thông tin phòng trọ cần duyệt:
- ID: {room_data.get('id', '')}
- Tiêu đề: {room_data.get('title', '')}
- Mô tả: {room_data.get('description', '')[:500] if room_data.get('description') else 'Không có mô tả'}
- Giá thuê: {room_data.get('priceMonth', 0):,} VNĐ/tháng
- Tiền cọc: {room_data.get('priceDeposit', 0):,} VNĐ
- Diện tích: {room_data.get('area', 0)} m²
- Kích thước: {room_data.get('length', 0)}m x {room_data.get('width', 0)}m
- Số người tối đa: {room_data.get('maxPeople', 0)}
- Giá điện: {room_data.get('elecPrice', 0):,} đ/kW
- Giá nước: {room_data.get('waterPrice', 0):,} đ/m³
- Địa chỉ: {room_data.get('fullAddress', '')}
- Tiện ích: {convenients_text}
- Số lượng ảnh/video: {len(media_urls)}

DANH SÁCH FILE ĐÃ TẢI:
{chr(10).join([f"- {os.path.basename(f)}" for f in downloaded_files])}
    """

    full_prompt = f"{prompt}\n\n{room_info}\n\nHãy duyệt phòng này dựa trên thông tin và hình ảnh/video đã tải. Trả về ĐÚNG định dạng JSON yêu cầu, không có markdown, không có text thừa."

    API_KEY = os.getenv("API_KEY")
    MODEL = "gemini-2.0-flash"
    URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"

    # Tạo payload với ảnh/video đã tải
    payload_parts = [{"text": full_prompt}]
    
    # Thêm các file ảnh vào payload (chỉ ảnh, video cần xử lý khác)
    for filepath in downloaded_files:
        if filepath.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
            try:
                with open(filepath, 'rb') as f:
                    image_data = base64.b64encode(f.read()).decode('utf-8')
                    payload_parts.append({
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": image_data
                        }
                    })
                    print(f"[DEBUG] Đã thêm ảnh {os.path.basename(filepath)} vào payload")
            except Exception as e:
                print(f"[ERROR] Lỗi khi thêm ảnh {filepath}: {e}")

    payload = {"contents": [{"parts": payload_parts}]}
    headers = {"Content-Type": "application/json"}
    
    try:
        print(f"[DEBUG] Đang gửi request tới Gemini AI với {len(downloaded_files)} files...")
        resp = requests.post(URL, headers=headers, data=json.dumps(payload), timeout=20)
        
        # Kiểm tra lỗi 429 (Too Many Requests)
        if resp.status_code == 429:
            print(f"[WARNING] Rate limit exceeded (429), returning status 0...")
            return {"status": 0, "content": ["Too many requests - Rate limit exceeded"]}
        
        resp.raise_for_status()
        result = resp.json()
        text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
        
        # Parse JSON response
        try:
            # Loại bỏ markdown formatting
            if '```json' in text:
                text = text.split('```json')[1].split('```')[0].strip()
            elif '```' in text:
                text = text.split('```')[1].split('```')[0].strip()
            
            # Loại bỏ text thừa trước và sau JSON
            json_start = text.find('{')
            json_end = text.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                text = text[json_start:json_end]
            
            approval_result = json.loads(text)
            
            # Validate JSON structure
            if not isinstance(approval_result, dict):
                raise ValueError("Response is not a dict")
            if 'status' not in approval_result or 'content' not in approval_result:
                raise ValueError("Missing required fields")
            if not isinstance(approval_result['content'], list):
                raise ValueError("Content must be a list")
            
            return approval_result
            
        except Exception as e:
            print(f"[ERROR] Failed to parse AI response: {e}")
            print(f"[DEBUG] Raw response: {text}")
            return {
                "status": 2, 
                "content": [f"Lỗi parse JSON: {str(e)}", f"Raw response: {text[:200]}..."]
            }
            
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 429:
            print(f"[WARNING] Rate limit exceeded (429), returning status 0...")
            return {"status": 0, "content": ["Too many requests - Rate limit exceeded"]}
        else:
            print(f"[ERROR] HTTP Error: {e}")
            return {"status": 2, "content": [f"Lỗi HTTP: {str(e)}"]}
    except Exception as e:
        print(f"[ERROR] AI API call failed: {e}")
        return {"status": 2, "content": [f"Lỗi gọi API: {str(e)}"]}
    finally:
        # Xóa các file đã tải sau khi xử lý
        print(f"[DEBUG] Đang xóa {len(downloaded_files)} files đã tải...")
        cleanup_media_files(downloaded_files)


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
        import uuid
        room_id = info.get('room_id', '')
        if isinstance(row[0], bytes) and len(row[0]) == 16:
            room_id_str = str(uuid.UUID(bytes=row[0]))
        else:
            room_id_str = str(room_id)
        link = f"http://localhost:3000/detail/{room_id_str}"
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

# API duyệt phòng - nhận interface và trả về JSON kết quả
@app.route('/ai_approval', methods=['POST'])
def ai_approval():
    """
    API duyệt phòng trọ bằng Gemini AI
    
    Input interface:
    {
        "id": "room_id",
        "title": "Tiêu đề phòng",
        "description": "Mô tả phòng", 
        "priceMonth": 3000000,
        "priceDeposit": 2000000,
        "area": 25,
        "length": 5,
        "width": 5,
        "maxPeople": 2,
        "elecPrice": 3500,
        "waterPrice": 20000,
        "fullAddress": "Địa chỉ đầy đủ",
        "convenients": ["Wifi", "Máy lạnh", "Tủ lạnh"],
        "images": ["/image/upload/...", "/video/upload/..."]
    }
    
    Output:
    {
        "status": 1 (duyệt) / 2 (không duyệt) / 0 (lỗi 429 rate limit),
        "content": ["Lý do 1", "Lý do 2", ...]
    }
    """
    try:
        # Nhận dữ liệu từ request
        room_data = request.get_json()
        
        # Validate required fields
        required_fields = ['id', 'title', 'description', 'priceMonth', 'priceDeposit', 
                          'area', 'length', 'width', 'maxPeople', 'elecPrice', 'waterPrice', 
                          'fullAddress', 'convenients', 'images']
        
        missing_fields = []
        for field in required_fields:
            if field not in room_data:
                missing_fields.append(field)
        
        if missing_fields:
            return jsonify({
                "status": 2,
                "content": [f"Thiếu các trường bắt buộc: {', '.join(missing_fields)}"]
            }), 400
        
        # Load prompt duyệt phòng
        prompt = load_approval_prompt()
        if not prompt:
            return jsonify({
                "status": 2,
                "content": ["Không thể tải file prompt duyệt phòng (promt_approval.md)"]
            }), 500
        
        print(f"[DEBUG] Bắt đầu duyệt phòng ID: {room_data.get('id')}")
        
        # Gọi Gemini để duyệt phòng
        approval_result = approve_room_with_gemini(room_data, prompt)
        
        print(f"[DEBUG] Kết quả duyệt: {approval_result}")
        
        # Trả về kết quả
        return jsonify(approval_result)
        
    except Exception as e:
        print(f"[ERROR] Lỗi trong API room_approval: {e}")
        return jsonify({
            "status": 2,
            "content": [f"Lỗi server: {str(e)}"]
        }), 500

# API search giữ nguyên
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
