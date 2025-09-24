# 🚀 Kế hoạch phân công công việc

## 1. Backend API

### 🔹 Nhân

- Xử lý **PostType**, **Convenients**, **Address**, **Auth**
- Quản lý **Room/User**
- Thêm Room với **Chunk Upload Video**
- API **Request khi đã thuê phòng**
- Tích hợp **Gemini Chatbot**
- Quản lí thống kê bên Landlord
- Quản lý **Profile**
- Tích hợp **API Gemini** để tự động duyệt phòng và send thông tin về slack
- Xử lý **Modified Transaction** (payment backend)
- Tính năng **Map**: hiển thị phòng theo vị trí, gợi ý phòng quanh khu vực click trên bản đồ

### 🔹 Khôi

- **Transaction**
- **Wallet**
- **Room/Admin**, **Room/Landlord**
- Bổ sung **RoomUser (get tọa độ)**
- **Bookings**
- Quản lý **Preferences Address** (ưu tiên hiển thị phòng theo khu vực)
- Xây dựng **Matching & gợi ý phòng qua email**

### 🔹 Trung

- **Manage Accounts**
- **Favorite**
- **Maintain**

### 🔹 Nam

- **Contract**
- **Feedback**
- **Bill**

### 🔹 Đức

- **Chat socket Firebase**

✅ Tiến độ: **API đã hoàn thành ~90–95%**

---

## 2. Frontend UI

### 👨‍💻 Admin Panel

- **Trung**: Quản lý **Accounts**
- **Khôi**: Quản lý **Rooms**
- **Nhân**: Quản lý **PostType**

### 🏠 Landlord Panel

- **Nhân**: Trang **Profile**, **Rental Room**
- **Khôi**: Trang **Rooms Manage**, **Deposit (nạp tiền)**, **Transaction History**
- **Trung**: Trang **Manage Request**, **Manage Maintain**
- **Nam**: Trang **Feedback Manage**, **Contract Manage**
- **Đức**: Trang **Chat**

### 👤 User Panel

- **Nhân**:
  - Dựng **Layout Map**, **Card Room trên map**
  - Thanh **lọc phòng** (filter sidebar)
  - **Header**, **Trang chi tiết phòng**
  - Các thành phần **UI phụ ở trang chủ**
- **Khôi**:
  - **RoomVipCard**, **RoomNormalCard**
  - **Quảng cáo (Ads)**
- **Trung**:
  - **Footer**
  - Trang **So sánh Room**
  - Trang **NewPost** (hiển thị phòng mới đăng)
  - **Card thông tin Landlord** trong trang chi tiết
- **Nam**:
  - Trang **Contract**
  - Trang **Bill**
  - Component **Feedback**
- **Đức**:
  - Trang **UI Chat real-time**
  <!-- - Trang **Khai báo tạm trú** -->
- **Tất cả thành viên**:
  - Với **UserDashboard**, ai phụ trách API nào thì **tự làm UI cho API đó**

### 🎨 Chung

- Giao diện sẽ được **update liên tục**
- Các thành phần nhỏ, tinh chỉnh UI/UX: **mọi thành viên cùng tham gia**

---

📌 Nhìn chung:

- **Nhân** thiên về **Auth/Profile/Map & User UI**
- **Khôi** mạnh về **Transaction/Room & Admin/Landlord UI**
- **Trung** lo **Accounts/Favorite/Maintain + UI phụ trợ**
- **Nam** tập trung **Contract/Bill & Feedback**
- **Đức** phụ trách **Chat real-time (socket Firebase)**

---

## Đang cập nhật tiếp

- **Trung**: Viết api fetch **Landlord**, thêm giao diện **Landlord Card** trong trang chi tiết phòng (**Done**)
- **Khôi**: Bổ sung check box receive email, xử lý thêm chổ booking (**Done**)
- **Nam**: Viết api contract, bill, và hoàn thiện giao diện contract manage (**Done**)
- **Đức**: Viết api khai báo tạm trú và hoàn thiện giao diện (**Done**)
