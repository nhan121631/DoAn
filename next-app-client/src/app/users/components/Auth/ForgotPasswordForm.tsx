/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/users/components/Auth/ForgotPassword.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MdErrorOutline } from "react-icons/md";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  changePassword,
  resetPassword,
  verifyResetCode,
} from "@/services/ResetPassService";
import { useRouter } from "next/navigation";
import { message } from "antd";

interface IForgotPasswordInputs {
  email: string;
}

const schema = yup
  .object({
    email: yup
      .string()
      .trim()
      .email("Email không hợp lệ.")
      .required("Hãy nhập email.")
      .lowercase(),
  })
  .required();

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [resetting, setResetting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [resetEmail, setResetEmail] = useState<string>("");
  const [verifying, setVerifying] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IForgotPasswordInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  // Handle password reset form submit
  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (!newPassword || newPassword.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== repeatPassword) {
      setPasswordError("Mật khẩu không khớp.");
      return;
    }
    setResetting(true);
    // Console log the data
    console.log({
      email: resetEmail,
      code,
      password: newPassword,
      repeatPassword,
    });
    // You can call your backend API here
    try {
      await changePassword(resetEmail, newPassword, code);
      messageApi.success({
        content: "Mật khẩu đã được đặt lại thành công!",
        duration: 2,
      });
      setShowPasswordForm(false);
      reset();
      setNewPassword("");
      setRepeatPassword("");
      setCode("");
      setShowCodeInput(false);
      router.push("/auth/login");
    } catch (error) {
      console.error("Error resetting password:", error);
      messageApi.error({
        content:
          error instanceof Error ? error.message : "Đặt lại mật khẩu thất bại.",
        duration: 3,
      });
    } finally {
      setResetting(false);
    }
  };

  // Xử lý xác thực mã code
  const handleVerifyCode = async (code: string) => {
    if (!/^[0-9]{6}$/.test(code)) {
      setCodeError("Hãy nhập mã gồm 6 chữ số hợp lệ.");
      return false;
    }
    setCodeError("");
    setVerifying(true);
    try {
      await verifyResetCode(resetEmail, code);
      messageApi.success({ content: "Mã xác thực hợp lệ!", duration: 2 });
      setShowPasswordForm(true);
    } catch (err: any) {
      messageApi.error({
        content: err?.message || "Mã hoặc email không hợp lệ.",
        duration: 3,
      });
      console.error("Error verifying code:", err);
    } finally {
      setVerifying(false);
    }
    console.log("Verifying code:", code, "for email:", resetEmail);
  };

  // Handle form submission
  const onSubmit: SubmitHandler<IForgotPasswordInputs> = async (values) => {
    setLoading(true);
    try {
      await resetPassword(values.email);
      setResetEmail(values.email); // Lưu email để xác thực code
      messageApi.success({
        content: "Mã đặt lại mật khẩu đã được gửi đến email của bạn.",
        duration: 3,
      });
      reset();
      setShowCodeInput(true);
    } catch (error) {
      console.error("Error resetting password:", error);
      messageApi.error({
        content:
          error instanceof Error ? error.message : "Đặt lại mật khẩu thất bại.",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md p-8 shadow-xl bg-white/20 backdrop-blur-md rounded-xl">
      {contextHolder}
      {!showCodeInput ? (
        <>
          <h2 className="mb-4 text-3xl font-bold text-white">
            Khôi phục mật khẩu
          </h2>
          <p className="mb-6 text-gray-200">
            Nhập email của bạn để nhận mã đặt lại mật khẩu
          </p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6">
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                type="email"
                id="email"
                className={`w-full p-3 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white`}
                placeholder="Email của bạn"
                {...register("email")}
              />
              {errors.email && (
                <p className="flex items-center mt-1 text-xs text-red-500">
                  <MdErrorOutline className="w-4 h-4 mr-1" />
                  {errors.email.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center justify-center w-full gap-2 py-3 text-lg font-semibold text-black transition duration-300 bg-white rounded-md hover:bg-gray-200 ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Đang gửi...
                </span>
              ) : (
                <>
                  Gửi mã đặt lại mật khẩu{" "}
                  <span className="text-xl">&rarr;</span>
                </>
              )}
            </button>
          </form>
        </>
      ) : showPasswordForm ? (
        <>
          <h2 className="mb-4 text-3xl font-bold text-white">Đặt lại mật khẩu</h2>
          <p className="mb-6 text-gray-200">Nhập mật khẩu mới của bạn bên dưới.</p>
          <form onSubmit={handlePasswordResetSubmit}>
            <div className="mb-6">
              <input
                type="password"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-black"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
              />
            </div>
            <div className="mb-6">
              <input
                type="password"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-black"
                placeholder="Repeat new password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                minLength={6}
              />
            </div>
            {passwordError && (
              <p className="flex items-center mt-1 text-xs text-red-500">
                <MdErrorOutline className="w-4 h-4 mr-1" />
                {passwordError}
              </p>
            )}
            <button
              type="submit"
              disabled={resetting}
              className={`w-full py-3 text-lg font-semibold text-black bg-white rounded-md hover:bg-gray-200 ${
                resetting ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {resetting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Đang đặt lại mật khẩu...
                </span>
              ) : (
                "Đặt lại mật khẩu"
              )}
            </button>
          </form>
        </>
      ) : (
        <>
          <h2 className="mb-4 text-3xl font-bold text-white">
            Nhập mã xác thực
          </h2>
          <p className="mb-6 text-gray-200">
            Hãy nhập mã 6 chữ số đã được gửi đến email của bạn.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyCode(code);
            }}
          >
            <div className="flex justify-center gap-2 mb-4">
              {[...Array(6)].map((_, i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="w-10 h-12 text-2xl text-center border-b-2 border-gray-400 bg-transparent focus:border-blue-500 focus:outline-none text-black"
                  value={code[i] || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    // Handle paste: if user pastes a 6-digit code, fill all inputs
                    if (
                      e.nativeEvent instanceof ClipboardEvent ||
                      val.length > 1
                    ) {
                      const paste = e.target.value.replace(/[^0-9]/g, "");
                      if (paste.length === 6) {
                        setCode(paste);
                        // Focus last input
                        const last = document.getElementById(`code-input-5`);
                        if (last) (last as HTMLInputElement).focus();
                        return;
                      }
                    }
                    const newCode = code.split("");
                    newCode[i] = val;
                    setCode(newCode.join(""));
                    // Auto focus next
                    if (val && i < 5) {
                      const next = document.getElementById(
                        `code-input-${i + 1}`
                      );
                      if (next) (next as HTMLInputElement).focus();
                    }
                  }}
                  onPaste={(e) => {
                    const paste = e.clipboardData
                      .getData("text")
                      .replace(/[^0-9]/g, "");
                    if (paste.length === 6) {
                      setCode(paste);
                      // Focus last input
                      const last = document.getElementById(`code-input-5`);
                      if (last) (last as HTMLInputElement).focus();
                      e.preventDefault();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" || e.key === "Delete") {
                      if (!code[i] && i > 0) {
                        const prev = document.getElementById(
                          `code-input-${i - 1}`
                        );
                        if (prev) (prev as HTMLInputElement).focus();
                        const newCode = code.split("");
                        newCode[i - 1] = "";
                        setCode(newCode.join(""));
                        e.preventDefault();
                      } else {
                        const newCode = code.split("");
                        newCode[i] = "";
                        setCode(newCode.join(""));
                      }
                    }
                  }}
                  id={`code-input-${i}`}
                />
              ))}
            </div>
            {codeError && (
              <p className="text-red-500 text-sm mb-2 text-center">
                {codeError}
              </p>
            )}
            <button
              type="submit"
              disabled={verifying}
              className={`w-full py-3 text-lg font-semibold text-black bg-white rounded-md hover:bg-gray-200 ${
                verifying ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {verifying ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Đang xác minh...
                </span>
              ) : (
                "Xác minh mã"
              )}
            </button>
          </form>
        </>
      )}
      <div className="mt-8 text-sm text-center text-gray-300">
        <p>
          Nếu cần hỗ trợ, vui lòng liên hệ qua Điện thoại/Zalo:{" "}
          <span className="font-bold text-gray-200">0347 002 025</span>.
        </p>
      </div>
      <div className="mt-6 text-center">
        <Link
          href="/auth/login"
          className="text-sm text-gray-200 hover:underline"
        >
          Quay lại trang đăng nhập
        </Link>
      </div>
    </div>
  );
}
