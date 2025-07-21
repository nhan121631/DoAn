# 🧩 User Story Admin

## **User Story #1: Admin xem thống kê hệ thống**  

As an **admin**, I want to **view system statistics** such as user count, room approvals, revenue, and top-paying users, so that I can monitor platform activity and make informed decisions.

---

### ✅ Acceptance Criteria (User Story #1)

- [ ] Chỉ **admin** có thể truy cập trang thống kê.
- [ ] Hiển thị các chỉ số sau:
  - 👤 **Tổng số tài khoản người dùng**
  - 🏘 **Tổng số phòng trọ**
  - ✅ **Số phòng đã được duyệt**
  - ⏳ **Số phòng đang chờ duyệt**
  - 💰 **Tổng doanh thu**
  - 🏆 **Top 5 người dùng nộp tiền nhiều nhất**
- [ ] Giao diện hiển thị rõ ràng, trực quan, tương thích desktop.
- [ ] Số liệu lấy từ backend API.
- [ ] (Optional) Có thể lọc theo khoảng thời gian (tháng/năm).

### 🔥 Priority: `High`

### 🎯 Story Points `8`

### 🖼 UI Design (User Story #1)

---

## **User Story #2: Chỉnh sửa bảng giá khi đăng tin**  

As a **Admin** ,  
I want to **edit the pricing options** when posting a room listing,  
so that I can control how much users need to pay for each type of listing package.

---

### ✅ Acceptance Criteria (User Story #2)

- [ ] Người dùng có thể chỉnh sửa **giá đăng tin** từ trang quản trị.
- [ ] Bảng giá hiển thị các loại tin:  
  - 🟢 Tin thường  
  - 🔵 Tin nổi bật (ưu tiên hiển thị)  
- [ ] Mỗi loại tin có thể cấu hình:
  - Giá theo **ngày / tuần / tháng**
  - Thời gian hiệu lực mặc định
- [ ] Giá mới được áp dụng ngay khi lưu thay đổi.
- [ ] Hiển thị cảnh báo xác nhận trước khi thay đổi (nếu đang có tin đang áp dụng giá cũ).
- [ ] Chỉ role `admin` (hoặc `staff-pricing`) được phép chỉnh sửa.

### 🔥 Priority `Medium`

### 🎯 Story Points `5`

### 🖼 UI Design (User Story #2)

---

