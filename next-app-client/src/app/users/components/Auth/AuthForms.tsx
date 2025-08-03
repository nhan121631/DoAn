"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdErrorOutline } from "react-icons/md";
import { useForm, SubmitHandler } from "react-hook-form";
import * as yup from "yup";


import RegisterForm from "./RegisterForm";
import { yupResolver } from "@hookform/resolvers/yup";

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

export default function AuthForms() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const [loginGeneralErrorMessage, setLoginGeneralErrorMessage] = useState("");
  const [loginSuccessMessage, setLoginSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ILoginInputs>({
    resolver: yupResolver(schema),
  });

  // Handle Login form submission
  const onLoginSubmit: SubmitHandler<ILoginInputs> = async (data) => {
    console.log("Login data:", data);
    if (data.username === "user" && data.password === "123456") {
      setLoginSuccessMessage("Login successful!");
      reset(); // Reset form after successful submission
      setLoginGeneralErrorMessage("");
      // Redirect to home or dashboard
      console.log("Redirecting to home...");
    } else {
      setLoginGeneralErrorMessage(
        "Username or password is incorrect."
      );
      setLoginSuccessMessage("");
    }
  };

  const [showLoginPassword, setShowLoginPassword] = useState(false);

  return (
    <div className="relative w-full max-w-md p-8 shadow-xl bg-white/20 backdrop-blur-md rounded-xl">
      {/* Header Tabs */}
      <div className="flex justify-around mb-8 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("login")}
          className={`py-3 px-4 font-bold transition ${
            activeTab === "login"
              ? "text-white border-b-2 border-white"
              : "text-black hover:text-pink-50"
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("register")}
          className={`py-3 px-4 font-bold transition ${
            activeTab === "register"
              ? "text-white border-b-2 border-white"
              : "text-black hover:text-pink-50"
          }`}
        >
          Create a new account
        </button>
      </div>

      {/* Login Form */}
      {activeTab === "login" && (
        <form onSubmit={handleSubmit(onLoginSubmit)}>
          {/* Identifier Input (Phone Number or Email) */}
          <div className="mb-4">
            <label htmlFor="loginIdentifier" className="sr-only">
              Phone number or Email
            </label>
            <input
              type="text"
              id="loginIdentifier"
              className={`w-full p-3 border ${
                errors.username ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white`}
              placeholder="Phone number or Email"
              {...register("username")}
            />
            {errors.username && (
              <p className="flex items-center mt-1 text-xs text-red-500">
                <MdErrorOutline className="w-4 h-4 mr-1" />
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label htmlFor="loginPassword" className="sr-only">
              Password
            </label>
            <div className="relative">
              <input
                type={showLoginPassword ? "text" : "password"}
                id="loginPassword"
                className={`w-full p-3 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white pr-10`}
                placeholder="Password"
                {...register("password")}
              />
              <span
                className="absolute right-0 flex items-center pr-3 text-gray-200 transition -translate-y-1/2 cursor-pointer top-1/2 hover:text-gray-400"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
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
          {/* General Error Message (for API failures) */}
          {loginGeneralErrorMessage && (
            <div
              className="relative px-4 py-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded"
              role="alert"
            >
              <span className="block sm:inline">
                {loginGeneralErrorMessage}
              </span>
            </div>
          )}

          {/* Success Message */}
          {loginSuccessMessage && (
            <div
              className="relative px-4 py-3 mb-4 text-sm text-green-700 bg-green-100 border border-green-400 rounded"
              role="alert"
            >
              <span className="block sm:inline">{loginSuccessMessage}</span>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 text-lg font-semibold text-black transition duration-300 bg-gray-200 rounded-md hover:bg-gray-400"
          >
            Log in
          </button>
        </form>
      )}

      {/* Register Form (now a separate component) */}
      {activeTab === "register" && <RegisterForm />}

      {/* Forgot Password Link and Terms/Privacy (always visible) */}
      {activeTab === "login" && (
        <div className="mt-4 text-center">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-gray-200 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
      )}
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
