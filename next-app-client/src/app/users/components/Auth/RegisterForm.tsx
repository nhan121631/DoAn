"use client";

import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import { MdErrorOutline } from 'react-icons/md'; 
import { useForm, SubmitHandler } from 'react-hook-form'; 

interface IRegisterInputs {
  fullName: string;
  phoneNumber: string;
  password: string;
  accountType: 0 | 1; //  to 0 for User, 1 for Landlord
}

export default function RegisterForm() {
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerAccountType, setRegisterAccountType] = useState<0 | 1>(0);
  
  const [registerGeneralErrorMessage, setRegisterGeneralErrorMessage] = useState('');
  const [registerSuccessMessage, setRegisterSuccessMessage] = useState('');

  const { register: registerRegister, handleSubmit: handleRegisterSubmit, formState: { errors: registerErrors }} = useForm<IRegisterInputs>();

  const onRegisterSubmit: SubmitHandler<IRegisterInputs> = async (values) => {
    setRegisterGeneralErrorMessage('');
    setRegisterSuccessMessage('');

    console.log('Attempting to register with:', values);

    try {
      
      const data = await new Promise((resolve) => setTimeout(() => {
        if (values.phoneNumber === '0901234567' && values.password === 'newpassword') {
          return { success: true, message: 'Đăng ký tài khoản thành công!' };
        } else {
          return { success: false, message: 'Đăng ký tài khoản thất bại. Số điện thoại đã tồn tại hoặc thông tin không hợp lệ.' };
        }
      }, 1500));

      if (data.success) {
        setRegisterSuccessMessage(data.message);
        console.log('Chuyển hướng đến trang đăng nhập hoặc trang chủ...');
      } else {
        setRegisterGeneralErrorMessage(data.message);
      }
    } catch (error) {
      setRegisterGeneralErrorMessage('Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại.');
      console.error('Register error:', error);
    }
  };

  return (
    <form onSubmit={handleRegisterSubmit(onRegisterSubmit)}>
      <div className="mb-4">
        <label htmlFor="registerFullName" className="sr-only">Họ tên</label>
        <input
          type="text"
          id="registerFullName"
          className={`w-full p-3 border ${registerErrors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white`}
          placeholder="Họ tên"
          {...registerRegister("fullName", { required: "Vui lòng nhập Họ tên." })}
        />
        {registerErrors.fullName && (
          <p className="flex items-center mt-1 text-xs text-red-500">
            <MdErrorOutline className="w-4 h-4 mr-1" />
            {registerErrors.fullName.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="registerPhoneNumber" className="sr-only">Số điện thoại</label>
        <input
          type="tel"
          id="registerPhoneNumber"
          className={`w-full p-3 border ${registerErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white`}
          placeholder="Số điện thoại"
          {...registerRegister("phoneNumber", { 
            required: "Vui lòng nhập Số điện thoại.",
            pattern: {
              value: /^[0-9]{10}$/, // Basic phone number regex (10 digits)
              message: "Số điện thoại không hợp lệ."
            }
          })}
        />
        {registerErrors.phoneNumber && (
          <p className="flex items-center mt-1 text-xs text-red-500">
            <MdErrorOutline className="w-4 h-4 mr-1" />
            {registerErrors.phoneNumber.message}
          </p>
        )}
      </div>

      {/* Password Input (for Register) */}
      
      <div className="mb-4">
        <label htmlFor="registerPassword" className="sr-only">Mật khẩu</label>
        <div className="relative">
          <input
            type={showRegisterPassword ? 'text' : 'password'}
            id="registerPassword"
            className={`w-full p-3 border ${registerErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white pr-10`}
            placeholder="Mật khẩu"
            {...registerRegister("password", { 
              required: "Vui lòng nhập Mật khẩu.",
              minLength: {
                value: 6,
                message: "Mật khẩu phải có ít nhất 6 ký tự."
              }
            })}
          />
          <span
            className="absolute right-0 flex items-center pr-3 text-gray-200 transition -translate-y-1/2 cursor-pointer top-1/2 hover:text-gray-400"
            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
          >
            {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {registerErrors.password && (
          <p className="flex items-center mt-1 text-xs text-red-500">
            <MdErrorOutline className="w-4 h-4 mr-1" />
            {registerErrors.password.message}
          </p>
        )}
      </div>

      {/* Account Type Radio Buttons */}
      <div className="mb-6">
        <p className="mb-2 text-sm text-gray-200">Loại tài khoản</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <label className="inline-flex items-center text-gray-200"> 
            <input
              type="radio"
              value={0} // Value for User
              {...registerRegister("accountType", { required: "Vui lòng chọn loại tài khoản." })}
              checked={registerAccountType === 0}
              onChange={() => setRegisterAccountType(0)}
              className="w-4 h-4 text-orange-500 form-radio"
            />
            <span className="ml-2">User</span> 
          </label>
          <label className="inline-flex items-center text-gray-200"> 
            <input
              type="radio"
              value={1} // Value for Landlord
              {...registerRegister("accountType", { required: "Vui lòng chọn loại tài khoản." })}
              checked={registerAccountType === 1}
              onChange={() => setRegisterAccountType(1)}
              className="w-4 h-4 text-orange-500 form-radio"
            />
            <span className="ml-2">Landlord</span> {/* Changed text to Landlord */}
          </label>
        </div>
        {registerErrors.accountType && (
          <p className="flex items-center mt-1 text-xs text-red-500">
            <MdErrorOutline className="w-4 h-4 mr-1" />
            {registerErrors.accountType.message}
          </p>
        )}
      </div>

      {/* General Error Message (for API failures) */}
      {registerGeneralErrorMessage && (
        <div className="relative px-4 py-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded" role="alert">
          <span className="block sm:inline">{registerGeneralErrorMessage}</span>
        </div>
      )}

      {/* Success Message */}
      {registerSuccessMessage && (
        <div className="relative px-4 py-3 mb-4 text-sm text-green-700 bg-green-100 border border-green-400 rounded" role="alert">
          <span className="block sm:inline">{registerSuccessMessage}</span>
        </div>
      )}

      {/* Register Button */}
      <button
        type="submit"
        className="w-full py-3 text-lg font-semibold text-black transition duration-300 bg-gray-200 rounded-md hover:bg-gray-400"
      >
        Tạo tài khoản
      </button>
    </form>
  );
}
