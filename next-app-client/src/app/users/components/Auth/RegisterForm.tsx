"use client";

import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdErrorOutline } from "react-icons/md";
import { set, useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface IRegisterInputs {
  fullName: string;
  phoneNumber: string;
  password: string;
  accountType: string; // Change to required string
}

const schema = yup
  .object({
    fullName: yup.string().required("Vui lòng nhập Họ tên."),
    phoneNumber: yup
      .string()
      .required("Vui lòng nhập Số điện thoại.")
      .matches(/^[0-9]{10}$/, "Số điện thoại không hợp lệ."),
    password: yup
      .string()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự.")
      .required("Vui lòng nhập Mật khẩu."),
    accountType: yup
      .string()
      .oneOf(["0", "1"], "Vui lòng chọn loại tài khoản.")
      .required("Vui lòng chọn loại tài khoản."),
  })
  .required();
export default function RegisterForm() {
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // const [registerGeneralErrorMessage, setRegisterGeneralErrorMessage] =
  //   useState("");
  const [registerSuccessMessage, setRegisterSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      password: "",
      // Removed accountType default value
    },
  });

  const onRegisterSubmit = async (values: IRegisterInputs) => {
    setRegisterSuccessMessage("Đăng ký thành công!");
    reset(); // Reset form after successful submission
    console.log("Register data:", values);
  };

  return (
    <form onSubmit={handleSubmit(onRegisterSubmit)}>
      <div className="mb-4">
        <label htmlFor="registerFullName" className="sr-only">
          Họ tên
        </label>
        <input
          type="text"
          id="registerFullName"
          className={`w-full p-3 border ${
            errors.fullName ? "border-red-500" : "border-gray-300"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white`}
          placeholder="Họ tên"
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className="flex items-center mt-1 text-xs text-red-500">
            <MdErrorOutline className="w-4 h-4 mr-1" />
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="registerPhoneNumber" className="sr-only">
          Số điện thoại
        </label>
        <input
          type="tel"
          id="registerPhoneNumber"
          className={`w-full p-3 border ${
            errors.phoneNumber ? "border-red-500" : "border-gray-300"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white`}
          placeholder="Số điện thoại"
          {...register("phoneNumber")}
        />
        {errors.phoneNumber && (
          <p className="flex items-center mt-1 text-xs text-red-500">
            <MdErrorOutline className="w-4 h-4 mr-1" />
            {errors.phoneNumber.message}
          </p>
        )}
      </div>

      {/* Password Input (for Register) */}

      <div className="mb-4">
        <label htmlFor="registerPassword" className="sr-only">
          Mật khẩu
        </label>
        <div className="relative">
          <input
            type={showRegisterPassword ? "text" : "password"}
            id="registerPassword"
            className={`w-full p-3 border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white pr-10`}
            placeholder="Mật khẩu"
            {...register("password")}
          />
          <span
            className="absolute right-0 flex items-center pr-3 text-gray-200 transition -translate-y-1/2 cursor-pointer top-1/2 hover:text-gray-400"
            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
          >
            {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {errors.password && (
          <p className="flex items-center mt-1 text-xs text-red-500">
            <MdErrorOutline className="w-4 h-4 mr-1" />
            {errors.password.message}
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
              value={0}
              {...register("accountType")}
              className="w-4 h-4 text-orange-500 form-radio"
            />
            <span className="ml-2">User</span>
          </label>
          <label className="inline-flex items-center text-gray-200">
            <input
              type="radio"
              value={1}
              {...register("accountType")}
              className="w-4 h-4 text-orange-500 form-radio"
            />
            <span className="ml-2">Landlord</span>
          </label>
        </div>
        {errors.accountType && (
          <p className="flex items-center mt-1 text-xs text-red-500">
            <MdErrorOutline className="w-4 h-4 mr-1" />
            {errors.accountType.message}
          </p>
        )}
      </div>

      {/* General Error Message (for API failures) */}
      {/* {registerGeneralErrorMessage && (
        <div
          className="relative px-4 py-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded"
          role="alert"
        >
          <span className="block sm:inline">{registerGeneralErrorMessage}</span>
        </div>
      )} */}

      {/* Success Message */}
      {registerSuccessMessage && (
        <div
          className="relative px-4 py-3 mb-4 text-sm text-green-700 bg-green-100 border border-green-400 rounded"
          role="alert"
        >
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
