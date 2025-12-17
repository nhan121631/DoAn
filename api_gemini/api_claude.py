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
import requests
import json
import os
# Đảm bảo bạn đã import Flask và các thư viện khác cần thiết (uuid, jsonify, request)

# Khai báo hằng số cho Digital Ocean API
DO_INFERENCE_URL = "https://inference.do-ai.run/v1/chat/completions"
# Lấy Key truy cập mô hình (Model Access Key) từ biến môi trường
# Bạn cần đặt biến môi trường này: export DO_MODEL_ACCESS_KEY="YOUR_KEY_HERE"
DO_API_KEY = os.getenv("API_KEY_CLAUDE")
# Chọn mô hình có khả năng Vision (Khuyến nghị Llama 3.3 70B hoặc OpenAI GPT-oss-20B)
# Tùy thuộc vào mô hình nào hỗ trợ Vision trên nền tảng của bạn.
# Giả sử ta dùng Llama 3.3 70B vì nó là mô hình lớn nhất có thể thanh toán bằng DO.
MODEL_NAME = "llama3.3-70b-instruct" 

print (f"[INFO] Sử dụng Digital Ocean Model: {DO_API_KEY}, {MODEL_NAME}")


# API chatbot - dùng prompt chi tiết, dữ liệu thô
# CHỈNH SỬA: Đảm bảo các biến cần thiết (requests, json, uuid) đã được import
import requests 
import json
import uuid # Đã import trong vòng lặp, nhưng nên đưa ra ngoài để rõ ràng hơn

# --- KHU VỰC CẦN KIỂM TRA VÀ ĐỊNH NGHĨA ---
# LƯU Ý: Nếu các biến này chưa được định nghĩa bên ngoài hàm, bạn sẽ cần định nghĩa chúng.
# Dựa trên thông tin bạn cung cấp, khóa truy cập có thể là:
# DO_API_KEY = "sk-do-9fur2LIw57l7Zl-6pjg05Eu1Kro_Oe69DYFCn6TtExrf109CYSAaeQmsbr" 
# MODEL_NAME = "anthropic-claude-3.7-sonnet"
# DO_INFERENCE_URL = "https://inference.do-ai.run/v1/chat/completions"
# ---------------------------------------------


@app.route('/ai_chatbot', methods=['POST'])
def ai_chatbot():
    # ... (Các phần lấy dữ liệu history, lấy dữ liệu phòng, và chuẩn bị prompt giữ nguyên)
    data = request.get_json()
    history = data.get("history", []) 

    # Lấy dữ liệu phòng từ MySQL
    try:
        # Giả định hàm get_rooms() đã được định nghĩa
        result, columns = get_rooms()
    except Exception as e:
        return jsonify({"reply": f"Lỗi khi lấy dữ liệu phòng: {str(e)}"})

    # Chuyển dữ liệu SQL thành văn bản thô (Giữ nguyên logic của bạn)
    rooms_text = ""
    for row in result:
        # Xử lý thông tin phòng tương tự như code gốc
        info = {col: str(val) if val not in [None, 'None'] else 'Chưa cập nhật' for col, val in zip(columns, row)}
        # import uuid -> Đã đưa lên đầu
        room_id = info.get('room_id', '')
        # Xử lý room_id dưới dạng bytes hoặc chuỗi
        try:
            if isinstance(row[0], bytes) and len(row[0]) == 16:
                room_id_str = str(uuid.UUID(bytes=row[0]))
            else:
                # Cố gắng chuyển đổi nếu nó là chuỗi UUID hợp lệ, nếu không dùng luôn giá trị
                room_id_str = str(uuid.UUID(info.get('room_id', ''))) if info.get('room_id', '') else str(room_id)
        except ValueError:
            room_id_str = str(room_id)
            
        link = f"http://localhost:3000/detail/{room_id_str}"
        rooms_text += f"- Title: {info.get('title','')}\n"
        rooms_text += f" Address: {info.get('full_address','')}\n"
        rooms_text += f" Price: {info.get('price_month','')} VNĐ/month\n"
        rooms_text += f" Area: {info.get('area','')} m²\n"
        rooms_text += f" Convenients: {info.get('convenients','')}\n"
        rooms_text += f" Link: {link}\n\n"

    # --- CHUẨN BỊ SYSTEM PROMPT ---
    system_prompt = (
       "Bạn là Ants, một trợ lý ảo cho trang web phòng cho thuê chuyên biệt Ants. "
"Nhiệm vụ của bạn là cung cấp lời khuyên và thông tin dựa trên dữ liệu được cung cấp. "
"**Hướng dẫn Nghiêm ngặt:**\n"
"1. Chỉ trả lời các câu hỏi liên quan đến dịch vụ phòng cho thuê của Ants. "
"2. Giữ câu trả lời súc tích và liên quan trực tiếp đến câu hỏi của người dùng. "
"3. Giải thích rõ ràng các chi tiết phòng: giá, tiện nghi, vị trí, điều kiện thuê và quy trình đặt phòng. "
"4. Nếu người dùng hỏi một câu hỏi cụ thể, hãy liệt kê các phòng phù hợp nhất. "
"5. Phản hồi một cách lịch sự, thân thiện, chính xác và dễ hiểu. "
"6. **Nếu không có thông tin, hãy phản hồi bằng:** "
"\"I'm sorry, currently I do not have information about suitable rooms for rent. "
"Please visit our website or contact our hotline 0388953628 for more details.\"\n"
" (Tôi xin lỗi, hiện tại tôi không có thông tin về phòng cho thuê phù hợp. Vui lòng truy cập trang web của chúng tôi hoặc liên hệ đường dây nóng 0388953628 để biết thêm chi tiết.)"
"7. **Quy trình đặt phòng:** 1. Tìm kiếm phòng phù hợp 2. Xem chi tiết phòng 3. Chọn 'Đặt phòng' 4. Theo dõi trạng thái thuê trên trang lịch sử thuê 5. Hoàn tất việc thuê phòng bằng cách đặt cọc qua chuyển khoản ngân hàng. \n"
"8.**LINK (QUAN TRỌNG):** Khi liệt kê phòng, bạn BẮT BUỘC phải lấy đường dẫn từ dòng **'System_Url:'** tương ứng trong dữ liệu.\n"
        "   - Hãy copy chính xác 100% đường dẫn đó.\n"
        "   - Định dạng Markdown bắt buộc: 🔗 [Xem chi tiết phòng](<System_Url_Của_Phòng>)\n"
        "   - Ví dụ: Nếu dữ liệu có dòng 'System_Url: http://localhost:3000/detail/123', bạn phải in ra: [Xem chi tiết phòng](http://localhost:3000/detail/123)\n\n"
"9. **Phân tích Hình ảnh:** Nếu người dùng cung cấp hình ảnh, hãy phân tích nội dung của nó (ví dụ: vị trí, loại phòng, tiện nghi) và liên hệ nó với dữ liệu phòng có sẵn.\n\n"
"**Dữ liệu Phòng Có Sẵn:**\n{rooms_text}"
    )

    # --- CHUẨN BỊ MESSAGES DÙNG CHO DO INFERENCE API ---
    messages = [{"role": "system", "content": system_prompt}]
    
    for turn in history:
        api_role = 'user' if turn['role'] == 'user' else 'assistant'
        messages.append({"role": api_role, "content": turn['text']})
    
    # --- CHUẨN BỊ PAYLOAD VÀ GỌI API ---
    
    # SỬA LỖI: Thêm kiểm tra khóa API để tránh lỗi Unauthorized 401 không rõ nguyên nhân
    if not DO_API_KEY:
        return jsonify({"reply": "Lỗi cấu hình: DO_API_KEY bị thiếu hoặc rỗng. Vui lòng kiểm tra lại khóa truy cập Digital Ocean của bạn."})


    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {DO_API_KEY}"
    }

    payload = {
        "model": MODEL_NAME, # Đảm bảo MODEL_NAME đã được định nghĩa
        "messages": messages,
        "max_tokens": 2048,
        "temperature": 0.0 
    }

    try:
        # Đảm bảo DO_INFERENCE_URL đã được định nghĩa
        resp = requests.post(DO_INFERENCE_URL, headers=headers, data=json.dumps(payload), timeout=30)
        
        # SỬA LỖI: Xử lý lỗi 401 cụ thể trong khối try/except
        # resp.raise_for_status() sẽ bắt lỗi 401
        resp.raise_for_status()
        
        result = resp.json()
        
        # Xử lý phản hồi theo định dạng OpenAI (và DO Inference)
        reply = result["choices"][0]["message"]["content"]
        
    except requests.exceptions.HTTPError as e:
        # Bắt lỗi HTTP cụ thể. Nếu là 401, cung cấp thông báo cụ thể hơn.
        if e.response.status_code == 401:
            reply = "Lỗi khi gọi Digital Ocean API (401 Unauthorized): Khóa API (DO_API_KEY) không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại."
        else:
            reply = f"Lỗi HTTP khi gọi Digital Ocean API ({e.response.status_code}): {e}"
    except requests.exceptions.RequestException as e:
        reply = f"Lỗi kết nối khi gọi Digital Ocean API: {str(e)}"
    except Exception as e:
        reply = f"Lỗi không xác định: {str(e)}"

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
    app.run(host="0.0.0.0", port=5001, debug=True)
