# API Gemini (Flask Backend)

## Mục đích
API này cung cấp các endpoint AI chatbot và AI search cho hệ thống Ants KTC, sử dụng mô hình Gemini và kết nối MySQL để lấy dữ liệu phòng trọ.

## Chức năng chính
- Chatbot AI trả lời tư vấn phòng trọ, quy trình thuê, tiện nghi, giá cả...
- Gợi ý tìm kiếm phòng trọ thông minh theo từ khóa người dùng.
- Kết nối MySQL để lấy dữ liệu phòng trọ, cache dữ liệu để tăng hiệu năng.

## Cấu trúc thư mục
- `api_gemini.py`: File chính, chứa Flask app và các route.
- `Dockerfile`: Đóng gói backend thành Docker image.
- `.env`: Lưu các biến môi trường (API_KEY, DB_HOST, ...).

## Cài đặt & Chạy local
1. Cài Python >= 3.8
2. Cài các package:
   ```bash
   pip install -r requirements.txt
   ```
3. Tạo file `.env` với các biến:
   ```env
   API_KEY=your_gemini_api_key
   DB_HOST=...
   DB_USER=...
   DB_PASSWORD=...
   DB_NAME=...
   DB_PORT=...
   ```
4. Chạy server:
   ```bash
   python api_gemini.py
   ```

## Chạy bằng Docker
```bash
docker build -t nhan12163/ants-chatbot:latest .
docker run -d -p 5000:5000 --env-file .env --name ants-chatbot nhan12163/ants-chatbot:latest
```

## Các endpoint
- `POST /ai_chatbot`  
  Input: `{ "history": [...] }`  
  Output: `{ "reply": "..." }`
- `POST /ai_search`  
  Input: `{ "query": "..." }`  
  Output: `[ { "title": "..." }, ... ]`

## Lưu ý
- Không commit file `.env` lên git.
- Đảm bảo API_KEY hợp lệ để gọi Gemini API.
- Dữ liệu phòng trọ lấy từ MySQL, cần cấu hình đúng DB.

## Liên hệ
- Dev: nhan12163
- Dự án: Ants KTC
