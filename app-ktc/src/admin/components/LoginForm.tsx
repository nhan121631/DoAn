"use client";

import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdErrorOutline } from "react-icons/md";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "../stores/useAuthorStore";

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

export default function LoginForm() {
  const [loginGeneralErrorMessage, setLoginGeneralErrorMessage] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const navigate = useNavigate();
  const { login, loggedInUser } = useAuthStore((state) => state);

  useEffect(() => {
    if (loggedInUser) {
      navigate("/admin");
    }
  }, [loggedInUser, navigate]);

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
    setLoginGeneralErrorMessage("");
    try {
      await login({
        username: data.username,
        password: data.password,
        navigate,
      });
      // Luôn lấy error mới nhất từ store sau khi login
      const latestError = useAuthStore.getState().error;
      if (latestError) {
        setLoginGeneralErrorMessage(
          typeof latestError === "string"
            ? latestError
            : latestError?.response?.data?.errors ||
                "You do not have permission to access admin area."
        );
      } else {
        setLoginGeneralErrorMessage("");
        reset();
      }
    } catch (err) {
      setLoginGeneralErrorMessage(
        typeof err === "string"
          ? err
          : "You do not have permission to access admin area."
      );
    }
  };
  return (
    <div className="relative w-full max-w-md p-8 shadow-xl bg-white/20 backdrop-blur-md rounded-xl">
      <form onSubmit={handleSubmit(onLoginSubmit)}>
        {/* Identifier Input (Phone Number or Email) */}
        <div className="mb-4">
          <label htmlFor="loginIdentifier" className="sr-only">
            User Name
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
              autoComplete="new-password" // Thêm dòng này
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
            <span className="block sm:inline">{loginGeneralErrorMessage}</span>
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

      {/* Forgot Password Link and Terms/Privacy */}
      <div className="mt-4 text-center">
        <Link
          to="/auth/forgot-password"
          className="text-sm text-gray-200 hover:underline"
        >
          Forgot your password?
        </Link>
      </div>
      <div className="mt-8 text-xs text-center text-gray-400">
        <p>
          By logging in, you agree to our{" "}
          <Link to="/terms" className="text-white hover:underline">
            terms of service
          </Link>{" "}
          as well as{" "}
          <Link to="/privacy" className="text-white hover:underline">
            privacy policy
          </Link>{" "}
          of ours
        </p>
      </div>
    </div>
  );
}
