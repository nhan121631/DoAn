// Định nghĩa kiểu dữ liệu cho một phòng
export type Room = {
  name: string;
  address: string;
};

// Định nghĩa kiểu dữ liệu cho dữ liệu bảo trì
export type MaintainData = {
  key: string;
  roomName: string;
  address: string;
  issue: string;
  cost: number;
  date: string;
  status: "Pending" | "Completed" | "In Progress";
};

// Định nghĩa kiểu dữ liệu cho các giá trị từ Form
export type FormValues = {
  roomName: string;
  address: string;
  issue: string;
  cost: number;
  status?: "Pending" | "Completed" | "In Progress";
};

//--------------------------------------//





export type Reply = {
  sender: 'admin' | 'user'; // Người gửi: quản trị viên hay người dùng
  message: string; // Nội dung tin nhắn
  timestamp: string; // Thời gian gửi tin nhắn
};

// Định nghĩa kiểu dữ liệu cho một bình luận
export type CommentData = {
  key: string;
  roomId: string; // ID của phòng liên quan
  roomName: string; // Tên phòng (để hiển thị)
  userName: string; // Tên người bình luận
  content: string; // Nội dung bình luận gốc
  date: string; // Ngày bình luận
  status: "New" | "Responded"; // Trạng thái bình luận: "New" (mới) hoặc "Đã Reply" (đã phản hồi)
  isHidden: boolean; // Trạng thái ẩn/hiện của bình luận
  replies?: Reply[]; // Mảng các phản hồi trong chuỗi hội thoại (tùy chọn)
};

// Định nghĩa kiểu dữ liệu cho các giá trị từ Form phản hồi
// Form này chỉ cần trường newReplyContent để admin nhập phản hồi mới
export type CommentFormValues = {
  newReplyContent: string; // Nội dung phản hồi mới từ admin
};
