"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdErrorOutline } from "react-icons/md";
import RegisterForm from "./RegisterForm";
import { signIn } from "next-auth/react";

export default function AuthForms() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // State cho login form
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginGeneralErrorMessage, setLoginGeneralErrorMessage] = useState("");
  const [loginSuccessMessage, setLoginSuccessMessage] = useState("");
  const [loginErrors, setLoginErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  // Xử lý submit login
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginGeneralErrorMessage("");
    setLoginSuccessMessage("");
    setLoginErrors({});
    setIsLoading(true);

    // Validate đơn giản
    const errors: { username?: string; password?: string } = {};
    if (!credentials.username.trim()) {
      errors.username = "Please enter phone number or email";
    }
    if (!credentials.password) {
      errors.password = "Please enter your password.";
    } else if (credentials.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        username: credentials.username,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        setLoginGeneralErrorMessage("Invalid credentials");
        setLoginSuccessMessage("");
      } else {
        setLoginSuccessMessage("Login successful!");
        setLoginGeneralErrorMessage("");
        setCredentials({ username: "", password: "" });
        window.location.href = "/";
      }
    } catch (error) {
      setLoginGeneralErrorMessage("Sign in failed");
      setLoginSuccessMessage("");
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        <form onSubmit={handleCredentialsSubmit}>
          {/* Identifier Input (Phone Number or Email) */}
          <div className="mb-4">
            <label htmlFor="loginIdentifier" className="sr-only">
              Phone number or Email
            </label>
            <input
              type="text"
              id="loginIdentifier"
              className={`w-full p-3 border ${
                loginErrors.username ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white`}
              placeholder="Phone number or Email"
              value={credentials.username}
              onChange={(e) =>
                setCredentials((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
            />
            {loginErrors.username && (
              <p className="flex items-center mt-1 text-xs text-red-500">
                <MdErrorOutline className="w-4 h-4 mr-1" />
                {loginErrors.username}
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
                  loginErrors.password ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white pr-10`}
                placeholder="Password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
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
                {loginErrors.password}
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
            disabled={isLoading}
            className={`w-full py-3 text-lg font-semibold text-black transition duration-300 rounded-md ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-400"
            }`}
          >
            {isLoading ? "Signing in..." : "Log in"}
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
      {/* Test Credentials Info */}
      <div className="mt-4 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Test Credentials:</strong>
          <br />
          Username:{" "}
          <code className="bg-blue-100 px-1 rounded">tungnt@softech.vn</code>
          <br />
          Password: <code className="bg-blue-100 px-1 rounded">123456789</code>
        </p>
      </div>
    </div>
  );
}
