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
- Statistics bên admin
- Thêm quản lý **Advertisement (Ads)**

### 🔹 Trung

- **Manage Accounts**
- **Favorite**
- **Maintain**
- Quản lý **Landlord & Landlord Card**
- **Increase views for posts**

### 🔹 Nam

- Quản lý **Contract** giữa landlord và tenant
- Quản lý **Bill** của từng contract
- Quản lý **Resident** của từng contract
- Quản lý **Blog** cho admin, hiển thị bên tenant
- Quản lý **Feedback** của landlord, add and view cho tenant


### 🔹 Đức

- **Chat socket Firebase**
- **Notification for user and landlord**

✅ Tiến độ: **API đã hoàn thành ~90–95%**

---

## 2. Frontend UI

### 👨‍💻 Admin Panel

- **Trung**: Quản lý **Accounts**
- **Khôi**: Quản lý **Rooms**, **Statistics**, **Advertisements**
- **Nhân**: Quản lý **PostType**
- **Nam**: Quản lý **Blog**

### 🏠 Landlord Panel

- **Nhân**: Trang **Profile**, **Rental Room**
- **Khôi**: Trang **Rooms Manage**, **Deposit (nạp tiền)**, **Transaction History**
- **Trung**: Trang **Manage Request**, **Manage Maintain**
- **Nam**: Trang **Feedback Manage**, **Contract Manage**
- **Đức**: Trang **Chat**, **UI Notification**

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
  - Trang **So sánh Room**
  - Trang **NewPost** (hiển thị phòng mới đăng)
  - Trang **Favorited-rooms**
  - **Card thông tin Landlord** trong trang chi tiết
  - Sử dụng **IntersectionObserver + timer để tăng view tự động**
  - **Footer**
- **Nam**:
  - Trang **Contract**
  - Trang **Bill**
  - Trang **Resident**
  - Trang **Blog**
  - Component **Feedback**
- **Đức**:
  - Trang **UI Chat real-time**
  - **UI Notification**
  <!-- - Trang **Khai báo tạm trú** -->
- **Tất cả thành viên**:
  - Với **UserDashboard**, ai phụ trách API nào thì **tự làm UI cho API đó**

### 🎨 Chung

- Giao diện sẽ được **update liên tục**
- Các thành phần nhỏ, tinh chỉnh UI/UX: **mọi thành viên cùng tham gia**
