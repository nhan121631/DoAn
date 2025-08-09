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
// import { jwtDecode } from "jwt-decode";

import {
  GoogleLogin,
  GoogleOAuthProvider,
  // useGoogleLogin,
} from "@react-oauth/google";

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
  // const [loginGeneralErrorMessage, setLoginGeneralErrorMessage] = useState("");

  const [messageApi, contextHolder] = message.useMessage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginInputs>({
    resolver: yupResolver(schema),
  });

  const router = useRouter();
  const pathname = usePathname(); // lấy URL hiện tại
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/user-dashboard";
  const { data: session } = useSession();
  useEffect(() => {
    if (session) {
      const roles = session.user.roles || [];
      console.log("User roles:", roles);
      // Điều hướng theo role
      if (roles.includes("Users")) {
        router.push("/users");
      } else if (roles.includes("Landlords")) {
        router.push("/landlord");
      } else {
        router.push("/users");
      }
    }
  }, [session, router]);

  const onLoginSubmit: SubmitHandler<ILoginInputs> = async (data) => {
    try {
      const res = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
        callbackUrl,
      });

      if (!res?.error) {
        // Đăng nhập thành công, điều hướng đến callbackUrl
        messageApi.success({
          content: "Login successful!",
          duration: 2,
        });
        router.push(callbackUrl);
      } else {
        messageApi.error({
          content: res.error,
          duration: 3,
        });
      }
    } catch (error: any) {
      messageApi.error({
        content: error?.message || "Login failed. Please try again.",
        duration: 3,
      });
    }
  };

  const handleSuccess = async (credentialResponse: any) => {
    try {
      const { credential } = credentialResponse;

      // console.log("Credential token:", credential);
      // const decoded = jwtDecode(credential);
      // console.log("User Info:", decoded);

      const res = await signIn("credentials", {
        credential: credential,
        redirect: false,
        callbackUrl,
      });
      if (!res?.error) {
        messageApi.success({
          content: "Google login successful!",
          duration: 2,
        });
        router.push(callbackUrl);
      } else {
        messageApi.error({
          content: res.error,
          duration: 3,
        });
      }
    } catch (error: any) {
      messageApi.error({
        content: error?.message || "Google login failed. Please try again.",
        duration: 3,
      });
    }

    // save the token to localStorage or state management
    // localStorage.setItem("google_user", JSON.stringify(decoded));
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

          {/* API Error */}
          {/* {loginGeneralErrorMessage && (
            <div className="px-4 py-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
              {loginGeneralErrorMessage}
            </div>
          )} */}

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

              {/* <div>
            <GoogleLoginButton />
          </div> */}
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
