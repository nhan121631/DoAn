// src/app/users/components/Auth/ForgotPassword.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { MdErrorOutline } from 'react-icons/md'; 
import { useForm, SubmitHandler } from 'react-hook-form'; 
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup'; 

interface IForgotPasswordInputs {
  email: string;
}

const schema = yup.object({
  email: yup
    .string()
    .trim() 
    .email("Invalid email.") // Translated
    .required("Please enter your email.") // Translated
    .lowercase(),
}).required(); 

export default function ForgotPasswordForm() {
  const [successMessage, setSuccessMessage] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<IForgotPasswordInputs>({
    resolver: yupResolver(schema), 
    defaultValues: { 
      email: '',
    },
  });

  // Handle form submission
  const onSubmit: SubmitHandler<IForgotPasswordInputs> = async (values) => {
    setSuccessMessage(''); // Reset success message

    console.log('Sending password reset request for email:', values.email); // Translated

    // Simulate successful submission locally
    setSuccessMessage('Password reset request sent. Please check your email!'); // Translated
    reset(); 

    
  };

  return (
    <div className="relative w-full max-w-md p-8 shadow-xl bg-white/20 backdrop-blur-md rounded-xl">
      <h2 className="mb-4 text-3xl font-bold text-white">Recover Password</h2> {/* Translated */}
      <p className="mb-6 text-gray-200">Enter your email to receive a password reset link</p> {/* Translated */}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-6">
          <label htmlFor="email" className="sr-only">Email</label>
          <input
            type="email" 
            id="email"
            className={`w-full p-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white`}
            placeholder="Your email" // Translated
            {...register("email")} 
          />
          {errors.email && ( 
            <p className="flex items-center mt-1 text-xs text-red-500">
              <MdErrorOutline className="w-4 h-4 mr-1" />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="relative px-4 py-3 mb-4 text-sm text-green-700 bg-green-100 border border-green-400 rounded" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="flex items-center justify-center w-full gap-2 py-3 text-lg font-semibold text-black transition duration-300 bg-gray-200 rounded-md hover:bg-gray-400"
        >
          Send Password Reset Link <span className="text-xl">&rarr;</span> {/* Translated */}
        </button>
      </form>

      {/* Contact Info */}
      <div className="mt-8 text-sm text-center text-gray-300">
        <p>If you need support, please contact Phone/Zalo: <span className="font-bold text-gray-200">0347 002 025</span>.</p> {/* Translated */}
      </div>

      {/* Back to Login Link */}
      <div className="mt-6 text-center"> 
        <Link href="/auth/login" className="text-sm text-gray-200 hover:underline">
          Back to Login
        </Link> {/* Translated */}
      </div>
    </div>
  );
}
