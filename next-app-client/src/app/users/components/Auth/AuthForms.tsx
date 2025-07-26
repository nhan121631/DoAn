"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import { MdErrorOutline } from 'react-icons/md'; 
import { useForm, SubmitHandler } from 'react-hook-form'; 

import RegisterForm from './RegisterForm'; 

interface ILoginInputs {
  identifier: string; 
  password: string;
}

export default function AuthForms() { 
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login'); 
  
  const [loginGeneralErrorMessage, setLoginGeneralErrorMessage] = useState('');
  const [loginSuccessMessage, setLoginSuccessMessage] = useState('');

  const { register: registerLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = useForm<ILoginInputs>();

  // Handle Login form submission
  const onLoginSubmit: SubmitHandler<ILoginInputs> = async (values) => {
    setLoginGeneralErrorMessage('');
    setLoginSuccessMessage('');

    const { identifier, password } = values;

    const isEmail = identifier.includes('@');
    const loginPayload = isEmail
      ? { email: identifier, password }
      : { phoneNumber: identifier, password };

    console.log('Attempting to log in with:', loginPayload);

    try {
      
      const data = await new Promise(() => setTimeout(() => {
        if ((isEmail && identifier === 'test@example.com' && password === 'password123') ||
            (!isEmail && identifier === '0918180057' && password === 'password123')) {
          return { success: true, message: 'Đăng nhập thành công!' };
        } else {
          return { success: false, message: 'Số điện thoại/Email hoặc mật khẩu không đúng.' };
        }
      }, 1500));

      if (data.success) {
        setLoginSuccessMessage(data.message);
        console.log('Chuyển hướng đến trang chủ...');
      } else {
        setLoginGeneralErrorMessage(data.message);
      }
    } catch (error) {
      setLoginGeneralErrorMessage('Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.');
      console.error('Login error:', error);
    }
  };

  const [showLoginPassword, setShowLoginPassword] = useState(false);

  return (
    <div className="relative w-full max-w-md p-8 shadow-xl bg-white/20 backdrop-blur-md rounded-xl">
      {/* Header Tabs */}
      <div className="flex justify-around mb-8 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('login')}
          className={`py-3 px-4 font-bold transition ${activeTab === 'login' ? 'text-white border-b-2 border-white' : 'text-black hover:text-pink-50'}`}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('register')}
          className={`py-3 px-4 font-bold transition ${activeTab === 'register' ? 'text-white border-b-2 border-white' : 'text-black hover:text-pink-50'}`}
        >
          Tạo tài khoản mới
        </button>
      </div>

      {/* Login Form */}
      {activeTab === 'login' && (
        <form onSubmit={handleLoginSubmit(onLoginSubmit)}>
          {/* Identifier Input (Phone Number or Email) */}
          <div className="mb-4">
            <label htmlFor="loginIdentifier" className="sr-only">Số điện thoại hoặc Email</label>
            <input
              type="text"
              id="loginIdentifier"
              className={`w-full p-3 border ${loginErrors.identifier ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white`}
              placeholder="Số điện thoại hoặc Email"
              {...registerLogin("identifier", { required: "Vui lòng nhập Số điện thoại hoặc Email." })}
            />
            {loginErrors.identifier && (
              <p className="flex items-center mt-1 text-xs text-red-500">
                <MdErrorOutline className="w-4 h-4 mr-1" />
                {loginErrors.identifier.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label htmlFor="loginPassword" className="sr-only">Mật khẩu</label>
            <div className="relative"> 
              <input
                type={showLoginPassword ? 'text' : 'password'}
                id="loginPassword"
                className={`w-full p-3 border ${loginErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white pr-10`}
                placeholder="Mật khẩu"
                {...registerLogin("password", { required: "Vui lòng nhập Mật khẩu." })}
              />
              <span
                className="absolute right-0 flex items-center pr-3 text-gray-200 transition -translate-y-1/2 cursor-pointer top-1/2 hover:text-gray-400"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
              >
                {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {loginErrors.password && (
              <p className="flex items-center mt-1 text-xs text-red-500">
                <MdErrorOutline className="w-4 h-4 mr-1" />
                {loginErrors.password.message}
              </p>
            )}

          </div>
          {/* General Error Message (for API failures) */}
          {loginGeneralErrorMessage && (
            <div className="relative px-4 py-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded" role="alert">
              <span className="block sm:inline">{loginGeneralErrorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {loginSuccessMessage && (
            <div className="relative px-4 py-3 mb-4 text-sm text-green-700 bg-green-100 border border-green-400 rounded" role="alert">
              <span className="block sm:inline">{loginSuccessMessage}</span>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 text-lg font-semibold text-black transition duration-300 bg-gray-200 rounded-md hover:bg-gray-400"
          >
            Đăng nhập
          </button>
        </form>
      )}
      

      {/* Register Form (now a separate component) */}
      {activeTab === 'register' && (
        <RegisterForm />
      )}

      {/* Forgot Password Link and Terms/Privacy (always visible) */}
      {activeTab === 'login' && ( 
        <div className="mt-4 text-center">
          <Link href="/auth/forgot-password" className="text-sm text-gray-200 hover:underline">
            Bạn quên mật khẩu?
          </Link>
        </div>
      )}

      <div className="mt-8 text-xs text-center text-gray-400">
        <p>Qua việc đăng nhập hoặc tạo tài khoản, bạn đồng ý với các <Link href="/terms" className="text-white hover:underline">quy định sử dụng</Link> cũng như <Link href="/privacy" className="text-white hover:underline">chính sách bảo mật</Link> của chúng tôi</p>
      </div>
    </div>
  );
}
