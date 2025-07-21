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
- [ ] Chỉ role `admin` được phép chỉnh sửa.

### 🔥 Priority `Medium`

### 🎯 Story Points `5`

### 🖼 UI Design (User Story #2)

---

## **User Story #3: Quản lý tài khoản người dùng**

As an **Admin**,  
I want to **manage user accounts** including setting permissions and disabling/enabling accounts, so that I can control user access and maintain platform security.

---

### ✅ Acceptance Criteria (User Story #3)

- [ ] Chỉ **admin** có thể truy cập trang quản lý tài khoản.
- [ ] Hiển thị danh sách tất cả tài khoản người dùng với thông tin:
  - 👤 **Tên người dùng**
  - 📧 **Email**
  - 🏷️ **Vai trò (Role)**: User, Landlord
  - 🟢/🔴 **Trạng thái**: Active/Disabled
  - 📅 **Ngày tạo tài khoản**
- [ ] Có thể **tìm kiếm** và **lọc** tài khoản theo:
  - Tên, email
  - Vai trò
  - Trạng thái
- [ ] Chức năng **phân quyền**:
  - Thay đổi role: User ↔ Landlord
  - Hiển thị cảnh báo xác nhận khi thay đổi quyền
- [ ] Chức năng **quản lý trạng thái**:
  - **Disable account**: Vô hiệu hóa tài khoản (không thể đăng nhập)
  - **Enable account**: Kích hoạt lại tài khoản
  - Hiển thị lý do khi disable
- [ ] Giao diện responsive, có pagination cho danh sách lớn

### 🔥 Priority `High`

### 🎯 Story Points `6`

### 🖼 UI Design (User Story #3)

---

## **User Story #4: Quản lý tin đăng phòng trọ**

As an **Admin**,  
I want to **manage room listings** including approval/rejection, preview posts, and send notifications to landlords,  
so that I can ensure content quality and keep landlords informed about their listing status.

---

### ✅ Acceptance Criteria (User Story #4)

- [ ] Chỉ **admin** hoặc **moderator** có thể truy cập trang quản lý phòng trọ.
- [ ] Hiển thị danh sách tất cả tin đăng phòng trọ với thông tin:
  - 🏠 **Tiêu đề tin đăng**
  - 👤 **Tên chủ phòng**
  - 📧 **Email chủ phòng**
  - 💰 **Giá thuê**
  - 📍 **Địa chỉ**
  - 🟡 **Trạng thái**: Pending, Approved, Rejected
  - 📅 **Ngày đăng**
  - 🏷️ **Loại tin**: Thường, Nổi bật
- [ ] Có thể **tìm kiếm** và **lọc** tin đăng theo:
  - Tiêu đề, địa chỉ
  - Tên chủ phòng
  - Trạng thái duyệt
  - Khoảng giá
  - Ngày đăng
- [ ] Chức năng **xem trước tin đăng**:
  - Hiển thị đầy đủ thông tin như người dùng cuối sẽ thấy
  - Xem hình ảnh, mô tả, tiện ích
  - Kiểm tra thông tin liên hệ
- [ ] Chức năng **duyệt tin đăng**:
  - **Approve**: Duyệt tin đăng (hiển thị công khai)
  - **Reject**: Từ chối tin đăng với lý do cụ thể
- [ ] **Hệ thống email thông báo**:
  - Tự động gửi email khi tin được duyệt
  - Gửi email khi tin bị từ chối (kèm lý do)
  - Gửi email yêu cầu chỉnh sửa
- [ ] Giao diện responsive, có pagination và bulk actions
- [ ] Có thể **tạm dừng** tin đăng đã duyệt nếu vi phạm

### 🔥 Priority (User Story #4): `High`

### 🎯 Story Points (User Story #4): `8`

### 🖼 UI Design (User Story #4)
