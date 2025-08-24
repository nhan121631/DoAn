"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import {
  Send,
  User,
  Mail,
  MessageSquare,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

// Yup validation schema
const validationSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email address"),
  message: yup
    .string()
    .required("Message is required")
    .min(10, "Message must be at least 10 characters"),
});

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ContactFormData>({
    resolver: yupResolver(validationSchema),
  });

  // Watch form values for enhanced UX
  const watchedFields = watch();

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Form submitted:", data);

      // Show success state
      setIsSuccess(true);

      // Reset form after delay
      setTimeout(() => {
        reset();
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Unable to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 animate-bounce">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          Message sent successfully!
        </h3>
        <p className="text-slate-600">
          Thank you for contacting us. We will respond as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* Name Field */}
      <div className="group">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User
              className={`w-5 h-5 transition-colors duration-200 ${
                errors.name
                  ? "text-red-400"
                  : watchedFields.name
                  ? "text-indigo-500"
                  : "text-slate-400"
              }`}
            />
          </div>
          <input
            type="text"
            placeholder="Enter your full name"
            {...register("name")}
            className={`w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 ${
              errors.name
                ? "ring-2 ring-red-500 bg-red-50"
                : "focus:ring-indigo-500 hover:bg-slate-100"
            }`}
          />
        </div>
        {errors.name && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </span>
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="group">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail
              className={`w-5 h-5 transition-colors duration-200 ${
                errors.email
                  ? "text-red-400"
                  : watchedFields.email
                  ? "text-indigo-500"
                  : "text-slate-400"
              }`}
            />
          </div>
          <input
            type="email"
            placeholder="your@email.com"
            {...register("email")}
            className={`w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 ${
              errors.email
                ? "ring-2 ring-red-500 bg-red-50"
                : "focus:ring-indigo-500 hover:bg-slate-100"
            }`}
          />
        </div>
        {errors.email && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </span>
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Message Field */}
      <div className="group">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Message <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none">
            <MessageSquare
              className={`w-5 h-5 transition-colors duration-200 ${
                errors.message
                  ? "text-red-400"
                  : watchedFields.message
                  ? "text-indigo-500"
                  : "text-slate-400"
              }`}
            />
          </div>
          <textarea
            rows={5}
            placeholder="Let us know what you need..."
            {...register("message")}
            className={`w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl resize-none focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 ${
              errors.message
                ? "ring-2 ring-red-500 bg-red-50"
                : "focus:ring-indigo-500 hover:bg-slate-100"
            }`}
          />
        </div>
        {errors.message && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </span>
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`group relative w-full overflow-hidden rounded-xl px-6 py-4 font-semibold text-white transition-all duration-300 ${
          isSubmitting
            ? "bg-slate-400 cursor-not-allowed"
            : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5"
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              <span>Send Message</span>
            </>
          )}
        </div>

        {/* Button shine effect */}
        {!isSubmitting && (
          <div className="absolute inset-0 -top-40 -bottom-40 left-0 w-6 bg-gradient-to-b from-transparent via-white/20 to-transparent rotate-12 group-hover:left-full transition-all duration-700"></div>
        )}
      </button>

      {/* Form Footer */}
      <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span>
          100% privacy guaranteed. We do not share your personal data.
        </span>
      </div>
    </form>
  );
}
