# 🧩 User Story User

## **User Story #1: Xem danh sách các phòng trọ**  

As a **User**,  
I want to **view a list of available rental rooms** with filtering and search capabilities,  
so that I can find suitable accommodation options based on my preferences and budget.

---

### ✅ Acceptance Criteria (User Story #1)

- [ ] Hiển thị danh sách tất cả phòng trọ **đã được duyệt** với thông tin:
  - 🏠 **Hình ảnh đại diện** phòng
  - 📝 **Tiêu đề** tin đăng
  - 💰 **Giá thuê** (theo tháng)
  - 📏 **Diện tích** (m²)
  - 📍 **Địa chỉ** (xã, tỉnh/thành phố)
  - 🏷️ **Loại tin**: Thường, Nổi bật
  - 📅 **Ngày đăng**
  - 👤 **Tên chủ nhà**
- [ ] **Tính năng tìm kiếm và lọc**:
  - 🔍 **Tìm kiếm**: Theo tiêu đề, địa chỉ, khu vực
  - 💵 **Lọc theo giá**: Slider hoặc input min/max
  - 📐 **Lọc theo diện tích**: Nhỏ (<20m²), Trung bình (20-40m²), Lớn (>40m²)
  - 🌍 **Lọc theo khu vực**: Quận/huyện, tỉnh/thành phố
  - 🏷️ **Lọc theo loại tin**: Tất cả, Thường, Nổi bật
  - 📅 **Lọc theo ngày đăng**: Hôm nay, Tuần này, Tháng này
- [ ] **Sắp xếp danh sách**:
  - Mới nhất → Cũ nhất
  - Giá: Thấp → Cao / Cao → Thấp
  - Diện tích: Nhỏ → Lớn / Lớn → Nhỏ
  - Độ ưu tiên: Nổi bật → Thường
- [ ] **Giao diện và trải nghiệm**:
  - Layout grid responsive (desktop/tablet/mobile)
  - Pagination hoặc infinite scroll
  - Loading skeleton khi tải dữ liệu
  - Empty state khi không có kết quả
- [ ] **Tương tác với tin đăng**:
  - Click vào tin để xem chi tiết
  - Nút "Yêu thích" để lưu tin đăng
  - Nút "Liên hệ" nhanh

### 🔥 Priority (User Story #1): `High`

### 🎯 Story Points (User Story #1): `8`

### 🖼 UI Design (User Story #1)

---

## **User Story #2: Xem chi tiết phòng trọ**

As a **User**,
I want to **view detailed information about a rental room**, including amenities and related rooms in the same area,
so that I can make an informed decision and discover more options nearby.

---

### ✅ Acceptance Criteria (User Story #2)

- [ ] Hiển thị đầy đủ thông tin chi tiết của phòng trọ:
  - 🏠 **Hình ảnh** (slider hoặc gallery)
  - 📝 **Tiêu đề** tin đăng
  - 💰 **Giá thuê**
  - 📏 **Diện tích**
  - 📍 **Địa chỉ**
  - 👤 **Chủ nhà** (tên, liên hệ)
  - 📅 **Ngày đăng**
  - 🏷️ **Loại tin**
  - 📝 **Mô tả chi tiết**
  - 🛋️ **Tiện ích**: Wifi, máy lạnh, WC riêng, bếp, ban công, chỗ để xe, camera, v.v.
- [ ] Hiển thị **bản đồ vị trí** (Google Maps hoặc tương đương)
- [ ] Hiển thị **các phòng trọ khác trong cùng khu vực**:
  - Danh sách phòng trọ gần đó (cùng quận/huyện, bán kính 2km)
  - Hiển thị hình ảnh, giá, diện tích, địa chỉ, loại tin
  - Click để chuyển sang chi tiết phòng khác
- [ ] Nút "Yêu thích" để lưu phòng trọ
- [ ] Nút "Liên hệ" nhanh với chủ nhà
- [ ] Giao diện responsive, tối ưu cho mobile

### 🔥 Priority (User Story #2): `High`

### 🎯 Story Points (User Story #2): `8`

### 🖼 UI Design (User Story #2)

---

## **User Story #3: Tìm kiếm phòng trọ với đề xuất từ khóa**

As a **User**,  
I want to **search for rental rooms using keywords with instant suggestions**,  
so that I can quickly find relevant rooms and discover popular search terms.

---

### ✅ Acceptance Criteria (User Story #3)

- [ ] Khi người dùng bắt đầu gõ từ khóa vào ô tìm kiếm:
  - Hệ thống hiển thị **danh sách đề xuất từ khóa** (autocomplete/suggestion) dựa trên từ khóa phổ biến, hoặc dữ liệu phòng trọ hiện có.
  - Người dùng có thể chọn một từ khóa từ danh sách đề xuất hoặc tiếp tục gõ.
- [ ] Khi người dùng nhấn nút "Tìm kiếm" hoặc chọn một đề xuất:
  - Hệ thống thực hiện tìm kiếm và **trả về danh sách phòng trọ phù hợp** với từ khóa.
- [ ] Nếu không có kết quả phù hợp, hiển thị trạng thái "Không tìm thấy phòng trọ phù hợp".
- [ ] Giao diện tìm kiếm **responsive**, tối ưu cho mobile.

### 🔥 Priority (User Story #3): `High`

### 🎯 Story Points (User Story #3): `5`

### 🖼 UI Design (User Story #3)

---

## **User Story #4: Thuê phòng trọ và đặt cọc**

As a **User**,  
I want to **rent a room by submitting a rental request and making a deposit after confirmation**,  
so that I can secure my desired room efficiently and transparently.

---

### ✅ Acceptance Criteria (User Story #4)

- [ ] Trên trang chi tiết phòng trọ, hiển thị nút **"Thuê phòng"**.
- [ ] Khi ấn nút "Thuê phòng":
  - Hiển thị **form điền thông tin thuê** (họ tên, số người,, thời gian thuê).
  - Người dùng gửi yêu cầu thuê phòng.
- [ ] Sau khi gửi yêu cầu:
  - Hệ thống chuyển trạng thái sang **"Chờ xác nhận"** từ chủ nhà.
  - Thông báo cho người dùng về trạng thái yêu cầu.
- [ ] Khi chủ nhà xác nhận:
  - Hệ thống gửi thông báo cho người dùng.
  - Hiển thị hướng dẫn **đặt cọc** (chuyển khoản, ví điện tử, v.v.).
  - Người dùng tiến hành đặt cọc để giữ phòng.
- [ ] Giao diện quy trình thuê phòng **rõ ràng, trực quan**, tối ưu cho mobile.

### 🔥 Priority (User Story #4): `High`

### 🎯 Story Points (User Story #4): `8`

### 🖼 UI Design (User Story #4)

---

## **User Story #5: Xem lịch sử thuê phòng**

As a **User**,  
I want to **view my rental history including requests, deposits, and room details**,  
so that I can track my past transactions and manage my bookings efficiently.

---

### ✅ Acceptance Criteria (User Story #5)

- [ ] Có mục **Lịch sử thuê phòng** trong trang cá nhân/tài khoản.
- [ ] Hiển thị danh sách các phòng đã thuê hoặc đã gửi yêu cầu thuê:
  - Thông tin phòng: hình ảnh, tiêu đề, địa chỉ, giá thuê.
  - Trạng thái: Đang chờ xác nhận, Đã xác nhận, Đã đặt cọc, Đã hoàn thành, Đã hủy.
  - Thời gian thuê, số người, ghi chú.
- [ ] Giao diện **responsive**, dễ sử dụng trên mobile.

### 🔥 Priority (User Story #5): `Medium`

### 🎯 Story Points (User Story #5): `5`

### 🖼 UI Design (User Story #5)

---

## **User Story #6: Xem và cập nhật thông tin cá nhân**

As a **User**,  
I want to **view and update my personal information**,  
so that I can keep my account details accurate and secure.

---

### ✅ Acceptance Criteria (User Story #6)

- [ ] Có mục **Thông tin cá nhân** trong trang tài khoản.
- [ ] Hiển thị đầy đủ thông tin: họ tên, số điện thoại, email, mật khẩu (ẩn), ảnh đại diện.
- [ ] Cho phép **chỉnh sửa** các trường thông tin (trừ email nếu đã xác thực).
- [ ] Cho phép **đổi mật khẩu** với xác thực cũ.
- [ ] Cho phép **cập nhật ảnh đại diện**.
- [ ] Hiển thị thông báo khi cập nhật thành công/thất bại.
- [ ] Giao diện **responsive**, dễ sử dụng trên mobile.

### 🔥 Priority (User Story #6): `Medium`

### 🎯 Story Points (User Story #6): `5`

### 🖼 UI Design (User Story #6)

---

## **User Story #7: Đánh giá và bình luận phòng trọ đã thuê**

As a **User**,  
I want to **rate and comment on rooms I have rented**,  
so that I can share my experience and help others make informed decisions.

---

### ✅ Acceptance Criteria (User Story #7)

- [ ] Sau khi hoàn thành thuê phòng, người dùng có thể **đánh giá** (số sao) và **bình luận** về phòng trọ.
- [ ] Chỉ người dùng đã thuê phòng mới được phép đánh giá/bình luận.
- [ ] Các đánh giá/bình luận sẽ hiển thị trên trang chi tiết phòng trọ.
- [ ] Giao diện **responsive**, dễ sử dụng trên mobile.

### 🔥 Priority (User Story #7): `Medium`

### 🎯 Story Points (User Story #7): `5`

### 🖼 UI Design (User Story #7)

---

## **User Story #8: Gửi yêu cầu hỗ trợ cho phòng trọ đang thuê**

As a **User**,  
I want to **submit support requests (repair, maintenance, installation, etc.) for my rented room**,  
so that I can get timely assistance and track the status of my requests.

---

### ✅ Acceptance Criteria (User Story #8)

- [ ] Trong mục lịch sử thuê phòng, hiển thị nút **"Gửi yêu cầu hỗ trợ"** cho từng phòng đang thuê.
- [ ] Khi ấn nút, hiển thị **form gửi yêu cầu** (chọn loại yêu cầu: sửa chữa, bảo trì, lắp đặt..., mô tả chi tiết, hình ảnh minh họa).
- [ ] Người dùng gửi yêu cầu, hệ thống lưu và thông báo cho chủ nhà/quản lý.
- [ ] Hiển thị **trạng thái xử lý** của từng yêu cầu: Đang chờ, Đang xử lý, Đã hoàn thành.
- [ ] Người dùng có thể xem lịch sử các yêu cầu đã gửi cho từng phòng.
- [ ] Giao diện **responsive**, dễ sử dụng trên mobile.

### 🔥 Priority (User Story #8): `Medium`

### 🎯 Story Points (User Story #8): `5`

### 🖼 UI Design (User Story #8)

---

## **User Story #9: Xem tin yêu thích và chat đề xuất phòng phù hợp**

As a **User**,  
I want to **view my favorite rooms and chat to get personalized recommendations**,  
so that I can easily find rooms that match my preferences.

---

### ✅ Acceptance Criteria (User Story #9)

- [ ] Có mục **Danh sách yêu thích** trong tài khoản, hiển thị các phòng trọ đã lưu.
- [ ] Hiển thị thông tin phòng: hình ảnh, tiêu đề, giá, địa chỉ, trạng thái còn trống/đã thuê.
- [ ] Cho phép **xóa khỏi danh sách yêu thích**.
- [ ] Hiển thị form **Đề xuất phòng** để được đề xuất chọn ra phòng phù hợp với bản thân đã mô tả
- [ ] Giao diện **responsive**, dễ sử dụng trên mobile.

### 🔥 Priority (User Story #9): `Medium`

### 🎯 Story Points (User Story #9): `5`

### 🖼 UI Design (User Story #9)
