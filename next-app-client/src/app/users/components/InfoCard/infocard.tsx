"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Member {
  name: string;
  title: string;
  quote: string;
  avatarSrc: string;
}

export default function InfoCard() {
  const members: Member[] = [
    // {
    //   name: "Vo Huynh Trung",
    //   title: "Lập trình viên",
    //   quote: "Sự sáng tạo kết hợp với tính thực tiễn. Phong cách thiết kế của chúng tôi đảm bảo mỗi màn hình không chỉ đẹp mắt mà còn dễ sử dụng.",
    //   avatarSrc: "/images/trungg.png",
    // },
    {
      name: "Nguyen Viet Khoi",
      title: "Developer",
      quote:
        "Thiết kế trải nghiệm người dùng liền mạch là trọng tâm của chúng tôi. Chúng tôi chú trọng bố cục rõ ràng, luồng thao tác trực quan và từng chi tiết đều có ý nghĩa.",
      avatarSrc: "/images/khoi.png",
    },
    {
      name: "Pham Phu Nhan",
      title: "Developer",
      quote:
        "Chúng tôi tin rằng thiết kế tuyệt vời sẽ kể một câu chuyện. Từ kiểu chữ đến màu sắc, mọi chi tiết đều được chăm chút để mang lại vẻ đẹp và sự rõ ràng cho người dùng.",
      avatarSrc: "/images/nhann.png",
    },
  ];

  const [currentMemberIndex, setCurrentMemberIndex] = useState<number>(0);

  const nextMember = () => {
    setCurrentMemberIndex((prevIndex) => (prevIndex + 1) % members.length);
  };

  const prevMember = () => {
    setCurrentMemberIndex(
      (prevIndex) => (prevIndex - 1 + members.length) % members.length
    );
  };

  const currentMember = members[currentMemberIndex];

  return (
    <div className="relative bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col space-y-6">
      <h1 className="text-2xl font-bold mb-6">
        Gặp gỡ những người tuyệt vời đứng sau dự án này!
      </h1>
      <div className="flex items-center space-x-4">
        <Image
          src={currentMember.avatarSrc}
          alt={currentMember.name}
          width={60}
          height={60}
          className="rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-lg">{currentMember.name}</p>
          <p className="text-gray-400 text-sm">{currentMember.title}</p>
        </div>
      </div>
      <p className="text-gray-300 leading-relaxed">{currentMember.quote}</p>
      <div className="flex space-x-4 mt-4">
        <button
          onClick={prevMember}
          aria-label="Previous Member"
          className="p-3 rounded-full border border-gray-600 hover:bg-gray-700 transition"
        >
          <FaChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextMember}
          aria-label="Next Member"
          className="p-3 rounded-full border border-gray-600 hover:bg-gray-700 transition"
        >
          <FaChevronRight className="h-6 w-6 text-white" />
        </button>
      </div>
    </div>
  );
}
