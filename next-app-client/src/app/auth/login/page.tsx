import AuthHeader from "@/app/users/components/Auth/AuthHeader";
import AuthForms from "../../users/components/Auth/AuthForms";
import Image from "next/image";

export default function LoginPage() {
  return (
    // Container chính cho toàn bộ trang
    <div className="relative flex items-center justify-center w-full min-h-screen overflow-hidden">
      <Image
        src="/images/banner3.jpg"
        alt="Login Background"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 z-0"
        priority
      />

      <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
        <AuthHeader />
      </div>
      {/* Container cho AuthForms, căn giữa màn hình */}
      <div className="relative z-20 mt-20">
        <AuthForms />
      </div>
    </div>
  );
}
