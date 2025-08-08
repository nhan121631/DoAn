/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdErrorOutline } from "react-icons/md";
import { useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { RegisterService } from "@/services/RegisterService";
import { message } from "antd";

export interface IRegisterInputs {
  fullName: string;
  email: string;
  username: string;
  password: string;
  accountType: string;
}

const schema = yup
  .object({
    fullName: yup.string().required("Please enter your Full Name."),
    email: yup
      .string()
      .email("Invalid email.")
      .required("Please enter your email."),
    username: yup
      .string()
      .required("Please enter your user name.")
      .matches(/^[a-zA-Z0-9]{3,30}$/, "Invalid user name."),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters.")
      .required("Please enter your password."),
    repeatPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords must match.")
      .required("Please repeat your password."),
    accountType: yup
      .string()
      .oneOf(["0", "1"], "Please select an account type.")
      .required("Please select an account type."),
  })
  .required();
export default function RegisterForm() {
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // const [registerGeneralErrorMessage, setRegisterGeneralErrorMessage] =
  //   useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      username: "",
      password: "",
      repeatPassword: "",
    },
  });

  const onRegisterSubmit = async (values: IRegisterInputs) => {
    // ...existing code...
    try {
      await RegisterService(values);
      messageApi.success({
        content: "Registration successful!",
        duration: 2,
      });
      reset();
    } catch (error: any) {
      // Lấy lỗi chi tiết từ error.message
      messageApi.error({
        content: error.message,
        duration: 2,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onRegisterSubmit)}>
      {contextHolder}
      <div className="mb-4">
        <label htmlFor="registerFullName" className="sr-only">
          Full Name
        </label>
        <input
          type="text"
          id="registerFullName"
          className={`w-full p-3 border ${
            errors.fullName ? "border-red-500" : "border-gray-300"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white`}
          placeholder="Full Name"
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
        <label htmlFor="registerEmail" className="sr-only">
          Email
        </label>
        <input
          type="email"
          id="registerEmail"
          className={`w-full p-3 border ${
            errors.email ? "border-red-500" : "border-gray-300"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white`}
          placeholder="Email"
          {...register("email")}
        />
        {errors.email && (
          <p className="flex items-center mt-1 text-xs text-red-500">
            <MdErrorOutline className="w-4 h-4 mr-1" />
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="registerUserName" className="sr-only">
          UserName
        </label>
        <input
          type="text"
          id="registerUserName"
          className={`w-full p-3 border ${
            errors.username ? "border-red-500" : "border-gray-300"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white`}
          placeholder="User Name"
          {...register("username")}
        />
        {errors.username && (
          <p className="flex items-center mt-1 text-xs text-red-500">
            <MdErrorOutline className="w-4 h-4 mr-1" />
            {errors.username.message}
          </p>
        )}
      </div>

      {/* Password Input (for Register) */}

      <div className="mb-4">
        <label htmlFor="registerPassword" className="sr-only">
          Password
        </label>
        <div className="relative">
          <input
            type={showRegisterPassword ? "text" : "password"}
            id="registerPassword"
            className={`w-full p-3 border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white pr-10`}
            placeholder="Password"
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

      {/* Repeat Password Input */}
      <div className="mb-4">
        <label htmlFor="repeatPassword" className="sr-only">
          Repeat Password
        </label>
        <input
          type={showRegisterPassword ? "text" : "password"}
          id="repeatPassword"
          className={`w-full p-3 border ${
            errors.repeatPassword ? "border-red-500" : "border-gray-300"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white`}
          placeholder="Repeat Password"
          {...register("repeatPassword")}
        />
        {errors.repeatPassword && (
          <p className="flex items-center mt-1 text-xs text-red-500">
            <MdErrorOutline className="w-4 h-4 mr-1" />
            {errors.repeatPassword.message}
          </p>
        )}
      </div>

      {/* Account Type Radio Buttons */}
      <div className="mb-6">
        <p className="mb-2 text-sm text-gray-200">Account Type</p>
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

      {/* Register Button */}
      <button
        type="submit"
        className="w-full py-3 text-lg font-semibold text-black transition duration-300 bg-white rounded-md hover:bg-gray-200"
      >
        Create Account
      </button>
    </form>
  );
}
