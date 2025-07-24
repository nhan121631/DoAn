// // src/components/layouts/AuthPageLayout.tsx
// "use client"; // Đây là một Client Component

// import React from 'react';

// interface AuthPageLayoutProps {
//   children: React.ReactNode;
// }

// const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({ children }) => {
//   return (
//     <div className="relative min-h-screen flex items-center justify-center bg-gray-50 overflow-hidden font-sans">
//       {/* Header: Anywhere app. Home Join */}
//       <header className="absolute top-0 left-0 w-full px-8 py-6 flex justify-between items-center z-20">
//         <div className="flex items-center space-x-2">
//           {/* Blue circle logo */}
//           <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
//             {/* Có thể thêm icon hoặc chữ cái đầu của logo nếu muốn */}
//           </div>
//           <span className="font-bold text-gray-800 text-lg">Anywhere app.</span>
//         </div>
//         <nav className="hidden sm:block"> {/* Hide on small screens for cleaner mobile view */}
//           <ul className="flex space-x-8">
//             <li><a href="/" className="text-gray-600 hover:text-blue-500 transition-colors duration-200 text-lg">Home</a></li>
//             <li><a href="/auth/register" className="text-gray-600 hover:text-blue-500 transition-colors duration-200 text-lg">Join</a></li>
//           </ul>
//         </nav>
//       </header>

//       {/* Background cong và hình ảnh núi - Hiện thị trên màn hình lớn */}
//       <div className="absolute inset-y-0 right-0 w-[60%] bg-white curved-bg hidden lg:block shadow-xl">
//         <div
//           className="absolute inset-0 bg-cover bg-center"
//           style={{ backgroundImage: 'url("/images/mountain-lake-bg.jpg")' }}
//         >
//           {/* Lớp phủ màu để hình ảnh trông hài hòa hơn */}
//           <div className="absolute inset-0 bg-blue-900 opacity-20"></div>
//         </div>
//         {/* Logo nhỏ ở góc phải dưới */}
//         <div className="absolute bottom-8 right-8 text-white text-opacity-70 text-4xl transform -rotate-12">
//             .IV
//         </div>
//       </div>

//       {/* Content wrapper cho form - nằm ở giữa màn hình (hoặc lệch trái trên desktop) */}
//       <div className="relative z-10 p-8 bg-white shadow-xl rounded-2xl w-full max-w-md mx-4 lg:mx-0 lg:ml-auto lg:mr-[30%] xl:mr-[35%] flex flex-col justify-center min-h-[500px]">
//         {children}
//       </div>

//       {/*
//         Lưu ý: Các style cho `.curved-bg` cần được thêm vào file CSS toàn cục của bạn
//         (ví dụ: `src/app/globals.css`).
//       */}
//     </div>
//   );
// };

// export default AuthPageLayout;