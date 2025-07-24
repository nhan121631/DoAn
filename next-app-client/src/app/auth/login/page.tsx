

// import LoginForm from '@/app/users/components/Auth/LoginForm';
// import Image from 'next/image'; 

// export default function LoginPage() {
//   return (
//     // Nền trắng cho toàn bộ trang và căn giữa nội dung
//     <div className="min-h-screen bg-white flex items-center justify-center p-4">
//       {/* Container chính cho giao diện đăng nhập (nhỏ hơn, có bóng đổ, và hiệu ứng chéo) */}
//       {/* max-w-5xl và h-[600px] để giới hạn kích thước tổng thể */}
//       <div className="flex bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-5xl h-[600px]">
//         {/* Cột trái: Hình ảnh nền (ẩn trên mobile, hiển thị trên màn hình lớn) */}
//         <div className="relative hidden lg:block w-1/2 bg-gray-900 overflow-hidden">
//           <Image
//             src="/images/login-bg.jpg" // Đặt ảnh nền của bạn ở đây
//             alt="Login Background"
//             layout="fill"
//             objectFit="cover"
//             className="absolute inset-0 z-0"
//             priority
//           />
//           {/* Lớp phủ mờ trên ảnh */}
//           <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
//           {/* Đã loại bỏ tất cả nội dung văn bản và nút điều hướng khỏi cột này */}
//         </div>

//         {/* Cột phải: Form đăng nhập */}
//         {/* Áp dụng skewX cho cột này để tạo đường chéo và sau đó counter-skew nội dung bên trong */}
//         <div className="w-full lg:w-1/2 flex items-center justify-center p-4 relative z-10 transform -skew-x-12"> {/* Đã tăng độ chéo từ -skew-x-6 lên -skew-x-12 */}
//           {/* LoginForm sẽ được counter-skew bên trong để nội dung không bị méo */}
//           <LoginForm />
//         </div>
//       </div>
//     </div>
//   );
// }
