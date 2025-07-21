# 🧩 User Story Landlord

## **User Story #1: Landlord quản lý thông tin bài đăng cho thuê phòng**

As a **landlord**, I want to **manage my room listings** effectively so that I can ensure my properties are well-represented and attract potential tenants.

---

### ✅ Acceptance Criteria (User Story #1)

- [ ] 🗂️ Landlord có thể xem danh sách các phòng trọ đã đăng.
- [ ] 📝 Mỗi phòng hiển thị đầy đủ thông tin: tên phòng, địa chỉ, diện tích, giá, trạng thái duyệt, trạng thái thuê, ngày bắt đầu/kết thúc đăng tin.
- [ ] 🛠️ Landlord có thể thực hiện các thao tác:
  - 👁️‍🗨️ Ẩn/hiện bài đăng phòng.
  - ℹ️ Xem chi tiết phòng.
  - ⏳ Gia hạn thời gian đăng tin.
- [ ] ✅ Các thao tác đều có xác nhận và thông báo rõ ràng.
- [ ] 🔄 Dữ liệu phòng được đồng bộ với backend (API).
- [ ] 🔍 (Optional) Có thể lọc, tìm kiếm phòng theo trạng thái hoặc từ khóa.

### 🔥 Priority: `High`

### 🎯 Story Points `5`

### 🖼 UI Design (User Story #1)

---

## **User Story #2: Landlord thêm bài đăng phòng mới**

As a **landlord**, I want to **add a new room listing** so that I can attract potential tenants and fill my vacancies.

---

### ✅ Acceptance Criteria (User Story #2)

- [ ] ➕ Landlord có thể truy cập trang thêm phòng mới.
- [ ] 🏢 Form thêm phòng chia rõ vùng thông tin phòng, thông tin liên hệ, mô tả, tiền điện-nước, tiện nghi.
- [ ] 🖼️ Upload được nhiều hình ảnh phòng, có thể xem trước và xóa ảnh (antd).
- [ ] 🛡️ Validate bắt buộc cho tất cả trường trừ mô tả, số điện thoại kiểm tra hợp lệ.
- [ ] 🔙 Có nút quay lại về trang quản lý phòng.
- [ ] ✅ Khi submit, hiển thị thông báo thành công và reset form.
- [ ] 🔄 Dữ liệu phòng mới được lưu lên backend (API).
- [ ] (Optional) Có thể thêm tiện nghi, giá dịch vụ, hoặc các trường mở rộng khác.

### 🔥 Priority `High`

### 🎯 Story Points `8`

### 🖼 UI Design (User Story #2)

---

## **User Story #3: Landlord chỉnh sửa thông tin phòng**

As a **landlord**, I want to **edit room information** so that I can update details and keep my listings accurate and attractive.

---

### ✅ Acceptance Criteria (User Story #3)

- [ ] ✏️ Landlord có thể truy cập trang chỉnh sửa thông tin phòng.
- [ ] 🏢 Form chỉnh sửa giống form thêm phòng, cho phép cập nhật các trường thông tin, hình ảnh, tiện nghi, mô tả, tiền điện-nước, liên hệ.
- [ ] 🛡️ Validate bắt buộc cho tất cả trường trừ mô tả, số điện thoại kiểm tra hợp lệ.
- [ ] �️ Upload/xóa/thay đổi hình ảnh phòng.
- [ ] ✅ Khi submit, hiển thị thông báo thành công và cập nhật dữ liệu lên backend (API).

### 🔥 Priority `High`

### 🎯 Story Points `8`

### 🖼 UI Design (User Story #3)

---

## **User Story #4: Landlord nạp tiền vào hệ thống website**

### ✅ Acceptance Criteria (User Story #4)

- [ ] 💳 Landlord có thể truy cập trang nạp tiền vào tài khoản.
- [ ] 📝 Form nạp tiền có trường số tiền, mô tả giao dịch, phương thức thanh toán (VNPay).
- [ ] 🛡️ Validate số tiền tối thiểu, kiểm tra hợp lệ trước khi gửi.
- [ ] 🔄 Khi submit, chuyển hướng sang cổng thanh toán VNPay và lưu giao dịch vào backend (API).
- [ ] ✅ Hiển thị thông báo thành công, trạng thái xử lý rõ ràng.
- [ ] 📋 Có nút xem lịch sử giao dịch và tra cứu giao dịch.
- [ ] (Optional) Có thể thêm nhiều phương thức thanh toán khác trong tương lai.

### 🔥 Priority `High`

### 🎯 Story Points `8`

### 🖼 UI Design (User Story #4)

---

## **User Story #5: Landlord xem thống kê lịch sử nạp tiền vào hệ thống**

As a **landlord**, I want to **view my payment history and statistics** so that I can track all my top-ups, check transaction status, and manage my spending transparently.

---

### ✅ Acceptance Criteria (User Story #5)

- [ ] 📊 Landlord có thể truy cập trang thống kê lịch sử nạp tiền.
- [ ] 🗂️ Hiển thị danh sách các giao dịch nạp tiền với thông tin: mã giao dịch, số tiền, mô tả, ngân hàng, trạng thái, thời gian, ...
- [ ] 🔍 Có thể lọc, tìm kiếm, phân loại giao dịch theo trạng thái (thành công/thất bại), sắp xếp theo thời gian, số tiền, ...
- [ ] 🔄 Dữ liệu giao dịch được lấy từ database.
- [ ] ✅ Hiển thị tổng số giao dịch, tổng số tiền đã nạp thành công, số giao dịch thất bại.
- [ ] 📋 Có nút tra cứu chi tiết từng giao dịch.
- [ ] (Optional) Có thể xuất file thống kê (CSV, Excel) hoặc xem biểu đồ tổng quan.

### 🔥 Priority `Medium`

### 🎯 Story Points `5`

### 🖼 UI Design (User Story #5)

---

## **User Story #6: Landlord xem thông tin yêu cầu của khách hàng**

As a **landlord**, I want to **view details of customer requests** so that I can understand and respond to each request accurately and efficiently.

---

### ✅ Acceptance Criteria (User Story #6)

- [ ] 👁️ Landlord có thể xem chi tiết thông tin từng yêu cầu của khách hàng.
- [ ] 🗂️ Hiển thị đầy đủ các trường: tên phòng, tên khách, số điện thoại, mô tả yêu cầu, trạng thái xử lý, ngày gửi yêu cầu.
- [ ] 📝 Nút chỉnh sửa trạng thái yêu cầu (đang xử lý, đã hoàn thành).
- [ ] 🔄 Dữ liệu yêu cầu được lấy từ backend (API).
- [ ] (Optional) Có thể thêm chức năng liên hệ khách hàng hoặc ghi chú nội bộ.

### 🔥 Priority `Medium`

### 🎯 Story Points `3`

### 🖼 UI Design (User Story #6)

---

## **User Story #7: Landlord quản lý bảo trì phòng**

As a **landlord**, I want to **manage room maintenance requests** so that I can track, update, and resolve maintenance issues efficiently for my properties.

---

### ✅ Acceptance Criteria (User Story #7)

- [ ] 🛠️ Landlord có thể truy cập trang quản lý bảo trì phòng.
- [ ] 🗂️ Hiển thị danh sách các yêu cầu bảo trì với thông tin: tên phòng, địa chỉ, vấn đề, chi phí, ngày, trạng thái xử lý.
- [ ] ✏️ Chỉnh sửa thông tin yêu cầu bảo trì (vấn đề, chi phí, trạng thái, ...).
- [ ] 🗑️ Xóa yêu cầu bảo trì.
- [ ] 🔍 Tìm kiếm, lọc yêu cầu theo trạng thái, phòng, thời gian, ...
- [ ] ✅ Các thao tác đều có xác nhận và thông báo rõ ràng.
- [ ] 🔄 Dữ liệu bảo trì được đồng bộ với backend (API).
- [ ] (Optional) Có thể xuất file thống kê hoặc xem biểu đồ tổng quan chi phí bảo trì.

### 🔥 Priority `Medium`

### 🎯 Story Points `5`

### 🖼 UI Design (User Story #7)

---

## **User Story #8: Landlord thêm mới yêu cầu bảo trì phòng**

As a **landlord**, I want to **create new maintenance requests for each room** so that I can quickly report and track issues that need fixing.

---

### ✅ Acceptance Criteria (User Story #8)

- [ ] ➕ Landlord có thể truy cập trang thêm mới yêu cầu bảo trì cho từng phòng.
- [ ] 🏢 Form thêm mới bảo trì gồm các trường: chọn phòng, địa chỉ, vấn đề, chi phí dự kiến, ngày yêu cầu.
- [ ] 🛡️ Validate bắt buộc cho tất cả trường, kiểm tra hợp lệ dữ liệu nhập vào.
- [ ] ✅ Khi submit, hiển thị thông báo thành công và lưu dữ liệu lên backend (API).
- [ ] 🔙 Có nút quay lại về trang quản lý bảo trì.
- [ ] 🖥️ Giao diện form đẹp, responsive, có dark mode.
- [ ] (Optional) Có thể upload hình ảnh minh họa vấn đề cần bảo trì.

### 🔥 Priority `Medium`

### 🎯 Story Points `5`

### 🖼 UI Design (User Story #8)

---

## **User Story #9: Landlord quản lý hợp đồng cho thuê phòng**

As a **landlord**, I want to **manage rental contracts and tenant information** so that I can track all rental activities, contract status, and tenant details efficiently.

---

### ✅ Acceptance Criteria (User Story #9)

- [ ] 🏠 Landlord có thể truy cập trang quản lý cho thuê phòng.
- [ ] 🗂️ Hiển thị danh sách hợp đồng thuê với thông tin: tên khách thuê, số điện thoại, phòng, địa chỉ, ngày bắt đầu/kết thúc, số người thuê, tổng tiền, trạng thái hợp đồng, trạng thái xóa.
- [ ] 👁️ Xem chi tiết hợp đồng thuê, trạng thái (chờ duyệt, đã duyệt, bị từ chối, chờ đặt cọc, đã đặt cọc, hết hạn, đang thuê, đã xóa).
- [ ] ✏️ Chỉnh sửa trạng thái hợp đồng (duyệt, từ chối, xác nhận đặt cọc, kết thúc hợp đồng, ...).
- [ ] 🗑️ Xóa hợp đồng thuê.
- [ ] 🔍 Tìm kiếm, lọc hợp đồng theo trạng thái, phòng, khách thuê, thời gian, ...
- [ ] ✅ Các thao tác đều có xác nhận và thông báo rõ ràng.
- [ ] 🔄 Dữ liệu hợp đồng được đồng bộ với backend (API).
- [ ] (Optional) Có thể xuất file thống kê hoặc xem biểu đồ tổng quan hợp đồng, doanh thu.

### 🔥 Priority `High`

### 🎯 Story Points `8`

### 🖼 UI Design (User Story #9)

## **User Story #10: Landlord quản lý bình luận phòng trọ**

As a **landlord**, I want to **xem, trả lời, ẩn/hiện, xóa, tìm kiếm, xác nhận và đồng bộ bình luận của khách thuê** so that tôi có thể kiểm soát nội dung phản hồi, nâng cao chất lượng dịch vụ và xử lý các vấn đề phát sinh kịp thời.

---

### ✅ Acceptance Criteria (User Story #10)

- [ ] 🗂️ Hiển thị danh sách bình luận của khách thuê theo từng phòng, sắp xếp mới nhất lên đầu.
- [ ] 🔍 Có ô tìm kiếm cho phép lọc bình luận theo từ khóa (nội dung, tên phòng, tên khách).
- [ ] 👁️ Click vào nội dung bình luận để xem chi tiết, bao gồm lịch sử trả lời giữa landlord và khách.
- [ ] 💬 Landlord có thể trả lời từng bình luận, nội dung trả lời được lưu lại và hiển thị trong lịch sử. Sau khi trả lời, trạng thái chuyển thành "Đã phản hồi".
- [ ] 👁️‍🗨️ Landlord có thể ẩn hoặc hiện bình luận bất kỳ.
- [ ] 🗑️ Landlord có thể xóa bình luận khỏi hệ thống, xác nhận trước khi xóa.
- [ ] 🔄 Tất cả thao tác (thêm, sửa, xóa, ẩn/hiện, trả lời) sẽ được đồng bộ với backend khi hoàn thiện API.

### 🔥 Priority `High`

### 🎯 Story Points `8`

### 🖼 UI Design (User Story #10)

---

## **User Story #11: Landlord quản lý hồ sơ cá nhân**

As a **landlord**, I want to **xem, chỉnh sửa và cập nhật thông tin hồ sơ cá nhân** so that tôi có thể quản lý thông tin liên hệ, tài khoản, avatar và đảm bảo dữ liệu cá nhân luôn chính xác, bảo mật.

---

### ✅ Acceptance Criteria (User Story #11)

- [ ] 👁️ Landlord có thể xem đầy đủ thông tin hồ sơ cá nhân: tên, số điện thoại, email, địa chỉ, avatar, số dư tài khoản, thông tin ngân hàng.
- [ ] ✏️ Có nút chỉnh sửa hồ sơ, mở modal cho phép cập nhật các trường thông tin cá nhân và avatar.
- [ ] 🖼️ Cho phép upload, xem trước và thay đổi ảnh đại diện (avatar).
- [ ] 🛡️ Validate bắt buộc cho các trường: tên, số điện thoại, email, địa chỉ, kiểm tra hợp lệ dữ liệu nhập vào.
- [ ] 💾 Khi lưu, cập nhật thông tin lên backend (API), hiển thị thông báo thành công hoặc lỗi.
- [ ] 🔄 Dữ liệu hồ sơ được đồng bộ với backend, đảm bảo bảo mật thông tin cá nhân.

### 🔥 Priority `Medium`

### 🎯 Story Points `5`

### 🖼 UI Design (User Story #11)

---
