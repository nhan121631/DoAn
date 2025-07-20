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
  sender: 'admin' | 'user'; 
  message: string; 
  timestamp: string; 
};

// Định nghĩa kiểu dữ liệu cho một bình luận
export type CommentData = {
  key: string;
  roomId: string; 
  roomName: string; 
  userName: string; 
  content: string; 
  date: string; 
  status: "New" | "Responded"; 
  isHidden: boolean; 
  replies?: Reply[]; 
};


export type CommentFormValues = {
  newReplyContent: string; 
};
