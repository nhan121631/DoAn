import os, datetime
import mysql.connector
import requests, json
import uuid
import pandas as pd
from dotenv import load_dotenv
import urllib.request
import shutil
from urllib.parse import urlparse
import base64
import time

load_dotenv()

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
        print("📋 File này là BẮT BUỘC để chạy chương trình duyệt phòng.")
        print("🔍 Vui lòng đảm bảo file promt_approval.md tồn tại trong một trong các vị trí:")
        for path in file_paths:
            print(f"   - {path}")
        raise SystemExit("Chương trình dừng: Thiếu file promt_approval.md")
        
    except UnicodeDecodeError:
        print("❌ [FATAL ERROR] Lỗi encoding khi đọc file promt_approval.md!")
        print("📋 File có thể bị lỗi định dạng hoặc encoding không phải UTF-8.")
        raise SystemExit("Chương trình dừng: Lỗi encoding file promt_approval.md")
    except Exception as e:
        print(f"❌ [FATAL ERROR] Lỗi không xác định khi đọc file promt_approval.md: {e}")
        raise SystemExit(f"Chương trình dừng: {str(e)}")


# Hàm lấy dữ liệu phòng từ MySQL để duyệt
def get_pending_rooms():
    """Lấy dữ liệu phòng chờ duyệt từ MySQL"""
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
        r.elec_price,
        r.water_price,
        r.length,
        r.width,
        r.max_people,
        r.post_start_date,
        r.post_end_date,
        CONCAT(a.name_street, ', ', w.name, ', ', d.name, ', ', p.name) AS full_address,
        GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') AS convenients,
        COUNT(DISTINCT i.id) as media_count,
        GROUP_CONCAT(DISTINCT i.url SEPARATOR '|||') as media_urls
    FROM rooms r
    JOIN addresses a ON r.address_id = a.id
    JOIN wards w ON a.ward_id = w.id
    JOIN districts d ON w.district_id = d.id
    JOIN provinces p ON d.province_id = p.id
    LEFT JOIN room_convenients rc ON r.id = rc.room_id
    LEFT JOIN convenients c ON rc.convenient_id = c.id
    LEFT JOIN images i ON r.id = i.room_id
    WHERE r.approval = 0 AND r.is_removed = 0 
    GROUP BY r.id
    ORDER BY r.post_start_date DESC
    LIMIT 50;'''  # Giới hạn 50 phòng để test

    try:
        # Debug database connection info
        print(f"[DEBUG] Connecting to DB: {host}:{port}/{database} as {user}")
        
        conn = mysql.connector.connect(host=host, user=user, port=port, password=password, database=database)
        cursor = conn.cursor()
        
        # Test connection first
        cursor.execute("SELECT 1")
        cursor.fetchone()
        print(f"[DEBUG] Database connection successful")
        
        # Execute main query
        cursor.execute(query)
        result = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        
        print(f"[DEBUG] Query returned {len(result)} rows")
        if result:
            print(f"[DEBUG] First row sample: {dict(zip(columns[:5], result[0][:5]))}")
            
        cursor.close()
        conn.close()
        return result, columns
    except Exception as e:
        print(f"[ERROR] Database connection failed: {e}")
        print(f"[DEBUG] Connection details: host={host}, port={port}, database={database}, user={user}")
        return [], None

def approve_room_with_ai(room_data, prompt):
    """Duyệt từng phòng bằng AI Gemini với ảnh/video tải về xử lý rồi xóa"""
    # Xử lý URL ảnh và video
    media_urls = []
    
    if room_data.get('media_urls'):
        media_urls = [f"{URL_IMAGE}{url}" for url in room_data['media_urls'].split('|||') if url]
    
    # Tải các file ảnh/video về ./images/
    downloaded_files = []
    for i, url in enumerate(media_urls):
        # Lấy tên file từ URL
        parsed_url = urlparse(url)
        filename = os.path.basename(parsed_url.path)
        if not filename or '.' not in filename:
            # Tạo tên file dựa trên index và loại media
            extension = '.jpg' if '/image/' in url else '.mp4' if '/video/' in url else '.jpg'
            filename = f"room_{room_data.get('room_id', 'unknown')}_{i+1}{extension}"
        
        filepath = download_media_file(url, filename)
        if filepath:
            downloaded_files.append(filepath)
    
    # Chuyển dữ liệu phòng thành text để gửi AI
    room_info = f"""
Thông tin phòng trọ cần duyệt:
- ID: {room_data.get('room_id', '')}
- Tiêu đề: {room_data.get('title', '')}
- Mô tả: {room_data.get('description', '')[:500] if room_data.get('description') else 'Không có mô tả'}
- Giá thuê: {room_data.get('price_month', 0):,} VNĐ/tháng
- Tiền cọc: {room_data.get('price_deposit', 0):,} VNĐ
- Diện tích: {room_data.get('area', 0)} m²
- Kích thước: {room_data.get('length', 0)}m x {room_data.get('width', 0)}m
- Số người tối đa: {room_data.get('max_people', 0)}
- Giá điện: {room_data.get('elec_price', 0):,} đ/kW
- Giá nước: {room_data.get('water_price', 0):,} đ/m³
- Địa chỉ: {room_data.get('full_address', '')}
- Tiện ích: {room_data.get('convenients', '')}
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
        resp.raise_for_status()
        result = resp.json()
        text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
        
        # Parse JSON response - cải thiện xử lý
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
                "status": 0, 
                "content": [f"Lỗi parse JSON: {str(e)}", f"Raw response: {text[:200]}..."]
            }
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 429:
            print(f"[WARNING] Rate limit exceeded, waiting 20 seconds...")
            time.sleep(20)  # Wait 20 seconds before retrying
            # Retry once after waiting
            try:
                print(f"[DEBUG] Retrying request to Gemini AI...")
                resp = requests.post(URL, headers=headers, data=json.dumps(payload), timeout=60)
                resp.raise_for_status()
                result = resp.json()
                text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
                
                # Same parsing logic as above
                try:
                    if '```json' in text:
                        text = text.split('```json')[1].split('```')[0].strip()
                    elif '```' in text:
                        text = text.split('```')[1].split('```')[0].strip()
                    
                    json_start = text.find('{')
                    json_end = text.rfind('}') + 1
                    if json_start >= 0 and json_end > json_start:
                        text = text[json_start:json_end]
                    
                    approval_result = json.loads(text)
                    
                    if not isinstance(approval_result, dict):
                        raise ValueError("Response is not a dict")
                    if 'status' not in approval_result or 'content' not in approval_result:
                        raise ValueError("Missing required fields")
                    if not isinstance(approval_result['content'], list):
                        raise ValueError("Content must be a list")
                    
                    return approval_result
                    
                except Exception as parse_e:
                    print(f"[ERROR] Failed to parse retry response: {parse_e}")
                    return {"status": 2, "content": [f"Lỗi parse sau retry: {str(parse_e)}"]}
            except Exception as retry_e:
                print(f"[ERROR] Retry failed: {retry_e}")
                return {"status": 2, "content": [f"Lỗi retry API: {str(retry_e)}"]}
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

def save_to_csv(results, filename="./api_gemini/room_approval_results.csv"):
    """Lưu kết quả duyệt vào file CSV"""
    try:
        # Tạo DataFrame với chỉ 3 cột: tên phòng, status, lý do
        df_data = []
        for result in results:
            room_data = result['room_data']
            approval = result['approval']
            
            df_data.append({
                'Tên phòng': room_data.get('title', ''),
                'Status': 'DUYỆT' if approval.get('status') == 1 else 'KHÔNG DUYỆT',
                'Lý do': '; '.join(approval.get('content', []))
            })
        
        df = pd.DataFrame(df_data)
        
        # Lưu vào file CSV với encoding UTF-8-BOM để Excel mở được tiếng Việt
        df.to_csv(filename, index=False, encoding='utf-8-sig')
        
        print(f"✅ Đã lưu kết quả vào file: {filename}")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to save CSV: {e}")
        return False

def main():
    """Hàm chính - duyệt phòng và xuất Excel"""
    print("🏠 Bắt đầu quá trình duyệt phòng trọ...")
    
    # Load prompt
    prompt = load_approval_prompt()
    print("📋 Đã tải prompt duyệt phòng")
    
    # Lấy dữ liệu phòng chờ duyệt
    rooms_data, columns = get_pending_rooms()
    if not rooms_data:
        print("❌ Không có phòng nào cần duyệt hoặc lỗi kết nối database")
        return
    
    print(f"📊 Tìm thấy {len(rooms_data)} phòng cần duyệt")
    
    # Duyệt từng phòng
    results = []
    for i, room_row in enumerate(rooms_data, 1):
        room_data = {col: val for col, val in zip(columns, room_row)}
        print(f"\n🔍 Đang duyệt phòng {i}/{len(rooms_data)}: {room_data.get('title', 'N/A')}")
        
        # Thêm delay giữa các request để tránh rate limit
        if i > 1:  # Không delay cho request đầu tiên
            print(f"[DEBUG] Waiting 5 seconds to avoid rate limit...")
            time.sleep(5)
        
        approval_result = approve_room_with_ai(room_data, prompt)
        
        results.append({
            'room_data': room_data,
            'approval': approval_result
        })
        
        status_text = "✅ DUYỆT" if approval_result.get('status') == 1 else "❌ KHÔNG DUYỆT"
        print(f"   {status_text}: {'; '.join(approval_result.get('content', []))}")
    
    # Lưu kết quả vào CSV
    print(f"\n💾 Lưu kết quả {len(results)} phòng vào CSV...")
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"room_approval_{timestamp}.csv"
    
    if save_to_csv(results, filename):
        print(f"🎉 Hoàn thành! Kết quả đã được lưu vào file: {filename}")
        
        # Thống kê
        approved = sum(1 for r in results if r['approval'].get('status') == 1)
        rejected = len(results) - approved
        print(f"\n📈 Thống kê:")
        print(f"   - Tổng số phòng: {len(results)}")
        print(f"   - Được duyệt: {approved}")
        print(f"   - Không duyệt: {rejected}")
    else:
        print("❌ Lỗi khi lưu file CSV")

if __name__ == '__main__':
    main()
