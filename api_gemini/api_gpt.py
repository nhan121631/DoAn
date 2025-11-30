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
from gradient import Gradient

load_dotenv()

app = Flask(__name__)
CORS(app)

# URL base cho Cloudinary
URL_IMAGE = "https://res.cloudinary.com"

# Cache đơn giản để tránh spam API
approval_cache = {}
cache_ttl = 300  # 5 phút

# Tạo thư mục images nếu chưa có
IMAGES_DIR = "api_gemini/images/"
if not os.path.exists(IMAGES_DIR):
    os.makedirs(IMAGES_DIR)

def download_media_file(url, filename):
    """Tải file ảnh/video từ URL về thư mục ./images/"""
    try:
        filepath = os.path.join(IMAGES_DIR, filename)
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            shutil.copyfileobj(response.raw, f)
            
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
        except Exception as e:
            print(f"[ERROR] Lỗi khi xóa {filepath}: {e}")

def load_approval_prompt():
    """Load prompt duyệt phòng từ file markdown"""
    try:
        file_paths = [
            'promt_approval.md',
            './promt_approval.md',
            os.path.join(os.path.dirname(__file__), 'promt_approval.md'),
            '../promt_approval.md',
            'api_gemini/promt_approval.md',
        ]
        
        for file_path in file_paths:
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    prompt_content = f.read()
                    if prompt_content.strip():
                        # Thêm yêu cầu trả về đúng định dạng JSON và kiểm tra hình ảnh nghiêm ngặt
                        prompt_content += """

## ⚠️ KIỂM TRA HÌNH ẢNH NGHIÊM NGẶT:
- TỪ CHỐI ngay lập tức nếu phát hiện hình ảnh bạo lực, không phù hợp, khiêu dâm
- TỪ CHỐI nếu hình ảnh có vũ khí, máu, nội dung đáng sợ
- TỪ CHỐI nếu hình ảnh không liên quan đến phòng trọ
- CHỈ DUYỆT khi hình ảnh thực sự cho thấy không gian sống phù hợp

## ⚠️ LƯU Ý QUAN TRỌNG:
Bạn PHẢI trả về kết quả duyệt theo ĐÚNG định dạng JSON sau, không thêm markdown, không thêm text khác:

**Trường hợp KHÔNG DUYỆT:**
{
  "status": 2,
  "content": [
    "Hình ảnh chứa nội dung không phù hợp/bạo lực",
    "Lý do cụ thể khác"
  ]
}

**Trường hợp ĐƯỢC DUYỆT:**
{
  "status": 1,
  "content": [
    "Hình ảnh phù hợp và an toàn",
    "Diện tích đạt yêu cầu tối thiểu",
    "Không gian sống phù hợp"
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

    # Initialize Gradient client for DigitalOcean
    model_access_key = os.getenv("API_KEY_GPT")
    if not model_access_key:
        return {"status": 2, "content": ["Lỗi: Không tìm thấy API_KEY_GPT trong file .env"]}
    
    client = Gradient(model_access_key=model_access_key)
    MODEL = "openai-gpt-oss-120b"

    # Tạo messages với hình ảnh base64 cho AI có thể "nhìn thấy" nội dung thực tế
    messages = [
        {
            "role": "user", 
            "content": [
                {"type": "text", "text": full_prompt}
            ]
        }
    ]
    
    # Thêm từng ảnh dưới dạng base64 để AI có thể phân tích nội dung
    image_count = 0
    for filepath in downloaded_files:
        if filepath.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
            try:
                with open(filepath, 'rb') as f:
                    image_data = base64.b64encode(f.read()).decode('utf-8')
                    messages[0]["content"].append({
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_data}"
                        }
                    })
                    image_count += 1
                    print(f"[INFO] Đã thêm ảnh {os.path.basename(filepath)} để AI phân tích")
            except Exception as e:
                print(f"[ERROR] Lỗi khi mã hóa ảnh {filepath}: {e}")
    
    if image_count == 0:
        # Nếu không có ảnh, từ chối luôn
        return {"status": 2, "content": ["Không có hình ảnh để duyệt - Yêu cầu ít nhất 1 ảnh phòng"]}
    
    try:
        # Retry mechanism for rate limits
        max_retries = 3
        retry_delay = 2  # seconds
        text = ""
        
        for attempt in range(max_retries):
            try:
                response = client.chat.completions.create(
                    messages=messages,
                    model=MODEL,
                    max_tokens=1000
                )
                
                text = response.choices[0].message.content.strip()
                break  # Success, exit retry loop
                
            except Exception as api_error:
                error_msg = str(api_error)
                if ("rate" in error_msg.lower() or "429" in error_msg or "limit" in error_msg.lower()) and attempt < max_retries - 1:
                    print(f"[WARNING] Rate limit hit, attempt {attempt + 1}/{max_retries}. Waiting {retry_delay}s...")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                    continue
                else:
                    # Final attempt failed or non-rate-limit error
                    raise api_error
        
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
            
        except Exception as parse_error:
            print(f"[ERROR] Failed to parse AI response: {parse_error}")
            return {
                "status": 2, 
                "content": [f"Lỗi parse JSON: {str(parse_error)}", f"Raw response: {text[:200]}..."]
            }
            
    except Exception as e:
        error_msg = str(e)
        if "rate" in error_msg.lower() or "429" in error_msg or "limit" in error_msg.lower():
            print(f"[WARNING] Final rate limit failure after retries")
            return {"status": 0, "content": ["Too many requests - Rate limit exceeded after retries"]}
        elif "invalid" in error_msg.lower() or "401" in error_msg or "403" in error_msg:
            print(f"[ERROR] Invalid API key or access denied")
            return {"status": 2, "content": [
                "Model Access Key không hợp lệ hoặc không có quyền truy cập",
                "Kiểm tra MODEL_ACCESS_KEY trong file .env",
                "Đảm bảo tài khoản DigitalOcean có credits"
            ]}
        else:
            print(f"[ERROR] DigitalOcean API call failed: {e}")
            return {"status": 2, "content": [f"Lỗi gọi DigitalOcean API: {str(e)}"]}
    finally:
        # Xóa các file đã tải sau khi xử lý
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
            "Bạn là Ants, trợ lý ảo cho website Ants chuyên về phòng trọ cho thuê.\n\n"
            "NGUYÊN TẮC TRỢ LÝ:\n"
            "- Trả lời ngắn gọn, tập trung vào câu hỏi cụ thể của người dùng\n"
            "- Trả lời bằng tiếng anh\n"
            "- Chỉ cung cấp thông tin được hỏi, không lan man\n"
            "- Nếu hỏi về phòng trọ, trả lời bằng định dạng markdown rõ ràng\n"
            "- Không trả lời câu hỏi không liên quan đến phòng trọ\n\n"
            "ĐỊNH DẠNG KHI TRẢ LỜI VỀ PHÒNG TRỌ:\n"
            "## 🏠 Phòng phù hợp\n\n"
            "### 📍 [Tên phòng](link)\n"
            "- **Giá thuê:** X VNĐ/tháng\n"
            "- **Diện tích:** X m²\n" 
            "- **Địa chỉ:** địa chỉ đầy đủ\n"
            "- **Tiện ích:** danh sách tiện ích\n\n"
            "🔗 [Xem chi tiết](link)\n\n"
            "THÔNG TIN LIÊN HỆ:\n"
            "📞 Hotline: 0388953628\n\n"
            f"DỮ LIỆU PHÒNG CÓ SẴN:\n{rooms_text}"
        )
        history = [{'role': 'user', 'text': initial_prompt}] + history

    # Chuẩn bị messages cho Gradient client
    model_access_key = os.getenv("API_KEY_GPT")
    if not model_access_key:
        return jsonify({"reply": "Lỗi: Không tìm thấy API_KEY_GPT trong file .env"})
    
    client = Gradient(model_access_key=model_access_key)
    MODEL = "openai-gpt-oss-120b"

    messages = []
    for turn in history:
        if turn['role'] == 'user':
            messages.append({"role": "user", "content": turn['text']})
        else:
            messages.append({"role": "assistant", "content": turn['text']})

    try:
        # Retry mechanism for chatbot
        max_retries = 2
        retry_delay = 1
        
        for attempt in range(max_retries):
            try:
                response = client.chat.completions.create(
                    messages=messages,
                    model=MODEL,
                    max_tokens=1500
                )
                reply = response.choices[0].message.content
                break
                
            except Exception as api_error:
                error_msg = str(api_error)
                if ("rate" in error_msg.lower() or "429" in error_msg or "limit" in error_msg.lower()) and attempt < max_retries - 1:
                    time.sleep(retry_delay)
                    retry_delay *= 2
                    continue
                else:
                    raise api_error
                    
    except Exception as e:
        error_msg = str(e)
        if "rate" in error_msg.lower() or "429" in error_msg or "limit" in error_msg.lower():
            reply = """⏳ **Tạm thời quá tải**

Hệ thống AI đang bận, vui lòng:
- Chờ 1-2 phút rồi thử lại
- Hoặc liên hệ hotline: 0388953628"""
        elif "invalid" in error_msg.lower() or "401" in error_msg or "403" in error_msg:
            reply = """❌ **Model Access Key không hợp lệ**

Kiểm tra API_KEY_GPT trong file .env và đảm bảo tài khoản có credits."""
        else:
            reply = f"Lỗi khi gọi DigitalOcean Gradient API: {error_msg}"

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
        
        # Kiểm tra tiêu đề và nội dung không phù hợp trước khi gọi AI
        title = room_data.get('title', '').lower()
        description = room_data.get('description', '').lower()
        
        # Danh sách từ khóa không phù hợp
        inappropriate_keywords = [
            'nguuu', 'nguu', 'test', 'demo', 'fake', 'spam',
            'xxx', 'sex', 'porn', 'violence', 'bạo lực', 
            'đánh nhau', 'máu', 'vũ khí', 'knife', 'gun'
        ]
        
        for keyword in inappropriate_keywords:
            if keyword in title or keyword in description:
                return jsonify({
                    "status": 2,
                    "content": [f"Tiêu đề/mô tả chứa từ khóa không phù hợp: '{keyword}'",
                               "Vui lòng sử dụng tiêu đề nghiêm túc cho phòng trọ"]
                })
        
        # Kiểm tra cache trước khi gọi AI (để tránh spam)
        room_hash = f"{room_data.get('id', '')}{len(room_data.get('images', []))}{room_data.get('title', '')}"
        current_time = time.time()
        
        if room_hash in approval_cache:
            cache_data = approval_cache[room_hash]
            if current_time - cache_data['timestamp'] < cache_ttl:
                print(f"[INFO] Trả kết quả từ cache cho room {room_data.get('id', '')}")
                return jsonify(cache_data['result'])
        
        # Gọi AI để duyệt phòng (với hình ảnh thực tế)
        approval_result = approve_room_with_gemini(room_data, prompt)
        
        # Lưu vào cache
        approval_cache[room_hash] = {
            'result': approval_result,
            'timestamp': current_time
        }
        
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
    app.run(host="0.0.0.0", port=5001, debug=True)
