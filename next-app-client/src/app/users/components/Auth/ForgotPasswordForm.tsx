"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { MdErrorOutline } from 'react-icons/md'; 
import { useForm, SubmitHandler } from 'react-hook-form';

interface IForgotPasswordInputs {
  email: string;
}

export default function ForgotPasswordForm() {
  const [generalErrorMessage, setGeneralErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<IForgotPasswordInputs>();

  const onSubmit: SubmitHandler<IForgotPasswordInputs> = async (values) => {
    setGeneralErrorMessage('');
    setSuccessMessage('');

    console.log('Đang gửi yêu cầu đặt lại mật khẩu cho email:', values.email);

    try {
      
      const data = await new Promise(() => setTimeout(() => {
        if (values.email === 'test@example.com') { 
          return { success: true, message: 'Đã gửi liên kết đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư đến!' };
        } else {
          return { success: false, message: 'Email không tồn tại trong hệ thống hoặc đã xảy ra lỗi. Vui lòng thử lại.' };
        }
      }, 2000)); // Simulate 2 second delay

      if (data.success) {
        setSuccessMessage(data.message);
        reset();
      } else {
        setGeneralErrorMessage(data.message);
      }
    } catch (error) {
      setGeneralErrorMessage('Đã xảy ra lỗi kết nối. Vui lòng thử lại.');
      console.error('Forgot password error:', error);
    }
  };

  return (
    // Main form container with transparent background and blur effect
    <div className="relative w-full max-w-md p-8 shadow-xl bg-white/20 backdrop-blur-md rounded-xl">
      <h2 className="mb-4 text-3xl font-bold text-white">Khôi phục mật khẩu</h2>
      <p className="mb-6 text-gray-200">Nhập Email của bạn để nhận liên kết đặt lại mật khẩu</p> 

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Email Input */}
        <div className="mb-6">
          <label htmlFor="email" className="sr-only">Email</label>
          <input
            type="email" 
            id="email"
            className={`w-full p-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white`}
            placeholder="Email của bạn" 
            {...register("email", { 
              required: "Vui lòng nhập Email.",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, 
                message: "Email không hợp lệ."
              }
            })}
          />
          {errors.email && (
            <p className="flex items-center mt-1 text-xs text-red-500">
              <MdErrorOutline className="w-4 h-4 mr-1" />
              {errors.email.message}
            </p>
          )}
        </div>

        {generalErrorMessage && (
          <div className="relative px-4 py-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded" role="alert">
            <span className="block sm:inline">{generalErrorMessage}</span>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="relative px-4 py-3 mb-4 text-sm text-green-700 bg-green-100 border border-green-400 rounded" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="flex items-center justify-center w-full gap-2 py-3 text-lg font-semibold text-black transition duration-300 bg-gray-200 rounded-md hover:bg-gray-400"
        >
          Gửi lại mật khẩu <span className="text-xl">&rarr;</span> 
        </button>
      </form>

      {/* Contact Info */}
      <div className="mt-8 text-sm text-center text-gray-300">
        <p>Nếu bạn cần hỗ trợ, vui lòng liên hệ SĐT/Zalo: <span className="font-bold text-gray-200">0347 002 025</span>.</p>
      </div>

      {/* Back to Login Link */}
      <div className="mt-6 text-center"> 
        <Link href="/auth/login" className="text-sm text-gray-200 hover:underline">
          Quay lại Đăng nhập
        </Link>
      </div>
    </div>
  );
}
