import AuthHeader from "@/app/users/components/Auth/AuthHeader";
import ForgotPasswordForm from "@/app/users/components/Auth/ForgotPasswordForm";
import Image from "next/image";

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex items-center justify-center w-full min-h-screen overflow-hidden">
      <Image
        src="/images/banner3.jpg"
        alt="Forgot Password Background"
        fill
        style={{ objectFit: "cover" }}
        className="absolute inset-0 z-0"
        priority
      />
      {/* Lớp phủ mờ */}
      {/* <div className="absolute inset-0 z-10 bg-black opacity-30"></div> */}
      <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
        <AuthHeader />
      </div>
      {/* Container cho ForgotPasswordForm, căn giữa màn hình */}
      <div className="relative z-20 mt-20">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
