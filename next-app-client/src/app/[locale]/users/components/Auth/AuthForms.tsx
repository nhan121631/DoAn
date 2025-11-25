/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdErrorOutline } from "react-icons/md";
import { useForm, SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import RegisterForm from "./RegisterForm";
import { message } from "antd";

interface ILoginInputs {
  username: string;
  password: string;
}

const schema = yup
  .object({
    username: yup.string().required("Please enter phone number or email"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters.")
      .required("Please enter your password."),
  })
  .required();

export default function AuthForms({ csrfToken }: { csrfToken?: string }) {
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [messageState, setMessageState] = useState<{
    type: "success" | "error";
    content: string;
  } | null>(null);
  useEffect(() => {
    if (messageState) {
      if (messageState.type === "success") {
        messageApi.success({ content: messageState.content, duration: 2 });
      } else {
        messageApi.error({ content: messageState.content, duration: 3 });
      }
      setMessageState(null);
    }
  }, [messageState, messageApi]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginInputs>({
    resolver: yupResolver(schema),
  });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl");
  const { data: session, status } = useSession();

  // Hàm xác định route dựa trên role
  const getRouteByRole = (roles: string[]) => {
    if (roles.includes("Landlords")) {
      return "/landlord";
    } else if (roles.includes("Users")) {
      return "/users";
    }
    return "/users"; // default
  };

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.roles) {
      const roles = session.user.roles;
      console.log(
        "AuthForms - User roles:",
        roles,
        "CallbackUrl:",
        callbackUrl
      );

      let targetRoute = getRouteByRole(roles);

      // Nếu có callbackUrl, kiểm tra xem user có quyền truy cập không
      if (callbackUrl) {
        const isAuthorizedForCallback =
          (callbackUrl.startsWith("/user-dashboard") &&
            roles.includes("Users")) ||
          (callbackUrl.startsWith("/landlord") && roles.includes("Landlords"));

        if (isAuthorizedForCallback) {
          targetRoute = callbackUrl;
        }
        // Nếu không có quyền, sẽ redirect đến route phù hợp với role
      }

      console.log("Redirecting to:", targetRoute);
      router.replace(targetRoute);
    }
  }, [session, status, router, callbackUrl]);

  const onLoginSubmit: SubmitHandler<ILoginInputs> = async (data) => {
    try {
      const res = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (!res?.error) {
        setMessageState({ type: "success", content: "Login successful!" });
        // useEffect sẽ xử lý redirect khi session được cập nhật
      } else {
        setMessageState({ type: "error", content: res.error });
      }
    } catch (error: any) {
      setMessageState({
        type: "error",
        content: error?.message || "Login failed. Please try again.",
      });
    }
  };

  const handleSuccess = async (credentialResponse: any) => {
    try {
      const { credential } = credentialResponse;

      const res = await signIn("credentials", {
        credential: credential,
        redirect: false,
      });

      if (!res?.error) {
        setMessageState({
          type: "success",
          content: "Google login successful!",
        });
        // useEffect sẽ xử lý redirect
      } else {
        setMessageState({ type: "error", content: res.error });
      }
    } catch (error: any) {
      setMessageState({
        type: "error",
        content: error?.message || "Google login failed. Please try again.",
      });
    }
  };

  const handleError = () => {
    console.log("Login Failed");
  };

  const isLoginPage = pathname === "/auth/login";
  const isRegisterPage = pathname === "/auth/register";

  return (
    <div className="relative w-full max-w-md p-8 shadow-xl bg-white/20 backdrop-blur-md rounded-xl">
      {contextHolder}
      {/* Header Tabs */}
      <div className="flex justify-around mb-8 border-b border-gray-200">
        <Link
          href="/auth/login"
          className={`py-3 px-4 font-bold transition ${
            isLoginPage
              ? "text-white border-b-2 border-white"
              : "text-black hover:text-pink-50"
          }`}
        >
          Log in
        </Link>
        <Link
          href="/auth/register"
          className={`py-3 px-4 font-bold transition ${
            isRegisterPage
              ? "text-white border-b-2 border-white"
              : "text-black hover:text-pink-50"
          }`}
        >
          Create a new account
        </Link>
      </div>

      {/* Login Form */}
      {isLoginPage && (
        <form onSubmit={handleSubmit(onLoginSubmit)}>
          <input type="hidden" name="csrfToken" value={csrfToken} />
          {/* Username */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username"
              className={`w-full p-3 border ${
                errors.username ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white`}
              {...register("username")}
            />
            {errors.username && (
              <p className="flex items-center mt-1 text-xs text-red-500">
                <MdErrorOutline className="w-4 h-4 mr-1" />
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <div className="relative">
              <input
                type={showLoginPassword ? "text" : "password"}
                placeholder="Password"
                className={`w-full p-3 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white pr-10`}
                {...register("password")}
              />
              <span
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute text-gray-200 -translate-y-1/2 cursor-pointer right-3 top-1/2"
              >
                {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {errors.password && (
              <p className="flex items-center mt-1 text-xs text-red-500">
                <MdErrorOutline className="w-4 h-4 mr-1" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full py-3 text-lg font-semibold text-black bg-white rounded-md hover:bg-gray-200"
          >
            Log in
          </button>

          {/* Google Login */}
          <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
          >
            <div className="mt-6 ">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                useOneTap
              />
            </div>
          </GoogleOAuthProvider>
        </form>
      )}

      {/* Register Form */}
      {isRegisterPage && <RegisterForm />}

      {/* Forgot password (only login) */}
      {isLoginPage && (
        <div className="mt-4 text-center">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-gray-200 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
      )}

      {/* Terms */}
      <div className="mt-8 text-xs text-center text-gray-400">
        <p>
          By logging in or creating an account, you agree to our{" "}
          <Link href="/terms" className="text-white hover:underline">
            terms of service
          </Link>{" "}
          as well as{" "}
          <Link href="/privacy" className="text-white hover:underline">
            privacy policy
          </Link>{" "}
          of ours
        </p>
      </div>
    </div>
  );
}
