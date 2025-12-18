/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import React, { useState } from "react";
import Link from "next/link";
import { MdErrorOutline } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSession } from "next-auth/react";
import { updatePassword } from "@/services/ResetPassService";
import { message } from "antd";

interface IChangePasswordInputs {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
const schema = yup
  .object({
    oldPassword: yup.string().required("Vui lòng nhập mật khẩu cũ."),
    newPassword: yup
      .string()
      .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự.")
      .required("Vui lòng nhập mật khẩu mới."),
    confirmNewPassword: yup
      .string()
      .oneOf([yup.ref("newPassword")], "Xác nhận mật khẩu không khớp.")
      .required("Vui lòng xác nhận mật khẩu mới."),
  })
  .required();

export default function ChangePasswordForm() {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IChangePasswordInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit: SubmitHandler<IChangePasswordInputs> = async (values) => {
    const payload = {
      userId: session?.user.id,
      password: values.oldPassword,
      newPassword: values.newPassword,
    };
    // console.log("Payload to update password:", payload);

    try {
      const response = await updatePassword(payload);
      if (response) {
        messageApi.success("Đổi mật khẩu thành công");
        reset();
      }
    } catch (error: any) {
      // console.error("Error updating password:", error);
      messageApi.error(error.message || "Đổi mật khẩu thất bại");
    }
  };

  return (
    <div className="p-6 mx-auto bg-white shadow-md w-130 rounded-xl">
      {contextHolder}
      <h2 className="mb-6 text-2xl font-bold text-gray-800">Đổi mật khẩu</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label
            htmlFor="oldPassword"
            className="block mb-2 text-sm font-bold text-gray-700"
          >
            Mật khẩu cũ
          </label>
          <div className="relative">
            <input
              type={showOldPassword ? "text" : "password"}
              id="oldPassword"
              className={`w-full p-3 border ${
                errors.oldPassword ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 pr-10`}
              placeholder="Nhập mật khẩu cũ"
              {...register("oldPassword")}
            />
            <span
              className="absolute right-0 flex items-center pr-3 text-gray-500 transition -translate-y-1/2 cursor-pointer top-1/2 hover:text-gray-700"
              onClick={() => setShowOldPassword(!showOldPassword)}
            >
              {showOldPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errors.oldPassword && (
            <p className="flex items-center mt-1 text-xs text-red-500">
              <MdErrorOutline className="w-4 h-4 mr-1" />
              {errors.oldPassword.message}
            </p>
          )}
          <div className="mt-1 text-right">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="newPassword"
            className="block mb-2 text-sm font-bold text-gray-700"
          >
            Mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              id="newPassword"
              className={`w-full p-3 border ${
                errors.newPassword ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 pr-10`}
              placeholder="Nhập mật khẩu mới"
              {...register("newPassword")}
            />
            <span
              className="absolute right-0 flex items-center pr-3 text-gray-500 transition -translate-y-1/2 cursor-pointer top-1/2 hover:text-gray-700"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errors.newPassword && (
            <p className="flex items-center mt-1 text-xs text-red-500">
              <MdErrorOutline className="w-4 h-4 mr-1" />
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm New Password Input */}
        <div className="mb-6">
          <label
            htmlFor="confirmNewPassword"
            className="block mb-2 text-sm font-bold text-gray-700"
          >
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={showConfirmNewPassword ? "text" : "password"}
              id="confirmNewPassword"
              className={`w-full p-3 border ${
                errors.confirmNewPassword ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 pr-10`}
              placeholder="Nhập lại mật khẩu mới"
              {...register("confirmNewPassword")}
            />
            <span
              className="absolute right-0 flex items-center pr-3 text-gray-500 transition -translate-y-1/2 cursor-pointer top-1/2 hover:text-gray-700"
              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
            >
              {showConfirmNewPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errors.confirmNewPassword && (
            <p className="flex items-center mt-1 text-xs text-red-500">
              <MdErrorOutline className="w-4 h-4 mr-1" />
              {errors.confirmNewPassword.message}
            </p>
          )}
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-3 text-lg font-semibold text-white transition duration-300 bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Lưu
        </button>
      </form>
    </div>
  );
}
