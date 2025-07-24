// // src/app/users/components/Auth/LoginForm.tsx
// "use client"; // Đây là Client Component để xử lý tương tác người dùng

// import React, { useState } from 'react';
// import Link from 'next/link';
// import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Icon ẩn/hiện mật khẩu

// export default function LoginForm() {
//   const [email, setEmail] = useState(''); // Đã đổi từ phoneNumber sang email
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false); // Trạng thái ẩn/hiện mật khẩu
//   const [errorMessage, setErrorMessage] = useState(''); // Thông báo lỗi
//   const [successMessage, setSuccessMessage] = useState(''); // Thông báo thành công

//   // Hàm xử lý đăng nhập
//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault(); // Ngăn chặn hành vi mặc định của form

//     setErrorMessage(''); // Reset thông báo lỗi
//     setSuccessMessage(''); // Reset thông báo thành công

//     // Kiểm tra đầu vào cơ bản
//     if (!email || !password) { // Đã đổi từ phoneNumber sang email
//       setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu.'); // Cập nhật thông báo
//       return;
//     }

//     // Logic đăng nhập giả định
//     // Trong thực tế, bạn sẽ gửi yêu cầu POST đến API xác thực của mình
//     console.log('Đang cố gắng đăng nhập với:', { email, password }); // Đã đổi từ phoneNumber sang email

//     try {
//       // Giả lập cuộc gọi API
//       const response = await new Promise((resolve) => setTimeout(() => {
//         // Giả lập kiểm tra với email thay vì số điện thoại
//         if (email === 'test@example.com' && password === 'password123') {
//           resolve({ success: true, message: 'Đăng nhập thành công!' });
//         } else {
//           resolve({ success: false, message: 'Email hoặc mật khẩu không đúng.' }); // Cập nhật thông báo
//         }
//       }, 1500)); // Giả lập độ trễ 1.5 giây

//       if ((response as any).success) {
//         setSuccessMessage((response as any).message);
//         // Chuyển hướng người dùng đến trang chủ hoặc dashboard
//         console.log('Chuyển hướng đến trang chủ...');
//         // router.push('/dashboard'); // Nếu bạn dùng next/navigation router
//       } else {
//         setErrorMessage((response as any).message);
//       }
//     } catch (error) {
//       setErrorMessage('Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.');
//       console.error('Lỗi đăng nhập:', error);
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
//       {/* Header Tabs */}
//       <div className="flex justify-around mb-8 border-b border-gray-200">
//         <Link href="/login" className="py-3 px-4 text-orange-600 font-bold border-b-2 border-orange-600">
//           Đăng nhập
//         </Link>
//         <Link href="/register" className="py-3 px-4 text-gray-500 font-semibold hover:text-orange-600">
//           Tạo tài khoản mới
//         </Link>
//       </div>

//       <form onSubmit={handleLogin}>
//         {/* Email Input */}
//         <div className="mb-6">
//           <label htmlFor="email" className="sr-only">Email</label> {/* Đã đổi htmlFor */}
//           <input
//             type="email" // Đã đổi type thành email
//             id="email" // Đã đổi id
//             className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800"
//             placeholder="Email" // Đã đổi placeholder
//             value={email} // Đã đổi value
//             onChange={(e) => setEmail(e.target.value)} // Đã đổi onChange
//             required
//           />
//         </div>

//         {/* Password Input */}
//         <div className="mb-6 relative">
//           <label htmlFor="password" className="sr-only">Mật khẩu</label>
//           <input
//             type={showPassword ? 'text' : 'password'} // Ẩn/hiện mật khẩu
//             id="password"
//             className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 pr-10" // Thêm padding-right cho icon
//             placeholder="Mật khẩu"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//           <span
//             className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500"
//             onClick={() => setShowPassword(!showPassword)} // Toggle ẩn/hiện
//           >
//             {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Icon mắt */}
//           </span>
//         </div>

//         {/* Error Message */}
//         {errorMessage && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
//             <span className="block sm:inline">{errorMessage}</span>
//           </div>
//         )}

//         {/* Success Message */}
//         {successMessage && (
//           <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
//             <span className="block sm:inline">{successMessage}</span>
//           </div>
//         )}

//         {/* Login Button */}
//         <button
//           type="submit"
//           className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-md transition duration-300"
//         >
//           Đăng nhập
//         </button>
//       </form>

//       {/* Forgot Password Link */}
//       <div className="text-center mt-4">
//         <Link href="/forgot-password" className="text-blue-600 hover:underline text-sm">
//           Bạn quên mật khẩu?
//         </Link>
//       </div>

//       {/* Terms and Privacy */}
//       <div className="text-center text-gray-500 text-xs mt-8">
//         <p>Qua việc đăng nhập hoặc tạo tài khoản, bạn đồng ý với các <Link href="/terms" className="text-blue-600 hover:underline">quy định sử dụng</Link> cũng như <Link href="/privacy" className="text-blue-600 hover:underline">chính sách bảo mật</Link> của chúng tôi</p>
//         <p className="mt-2">Bản quyền © 2015 - 2025 Phongtro123.com</p>
//       </div>
//     </div>
//   );
// }
