import AuthHeader from "@/app/users/components/Auth/AuthHeader";
import AuthForms from "../../users/components/Auth/AuthForms";
import Image from "next/image";
import { getCsrfToken } from "next-auth/react";
import { Suspense } from "react";

export default async function LoginPage() {
  const csrfToken = await getCsrfToken();
  return (
    // Container chính cho toàn bộ trang
    <div className="relative flex items-center justify-center w-full min-h-screen overflow-hidden">
      <Image
        src="/images/banner3.jpg"
        alt="Login Background"
        fill
        style={{ objectFit: "cover" }}
        className="absolute inset-0 z-0"
        priority
      />

      <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
        <AuthHeader />
      </div>
      {/* Container cho AuthForms, căn giữa màn hình */}
      <div className="relative z-20 mt-20">
        <Suspense fallback={<div>Loading...</div>}>
          <AuthForms csrfToken={csrfToken} />
        </Suspense>
      </div>
    </div>
  );
}
