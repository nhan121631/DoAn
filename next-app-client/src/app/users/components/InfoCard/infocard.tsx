"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface Member {
  name: string;
  title: string;
  quote: string;
  avatarSrc: string;
}

export default function InfoCard() {
  const members: Member[] = [
    {
      name: "Vo Huynh Trung",
      title: "Developer",
      quote: "Creativity meets functionality. Our design approach ensures that every screen not only looks stunning but also feels effortless to use.",
      avatarSrc: "/images/trungg.png",
    },
    {
      name: "Nguyen Viet Khoi",
      title: "Developer",
      quote: "Designing a seamless user experience is at the heart of what we do. We focus on clean layouts, intuitive flows, and every pixel with purpose.",
      avatarSrc: "/images/khoi.png",
    },
    {
      name: "Pham Phu Nhan",
      title: "Developer",
      quote: "We believe great design tells a story. From typography to color choices, we craft every detail to deliver both beauty and clarity to our users.",
      avatarSrc: "/images/nhann.png",
    },
  ];

  const [currentMemberIndex, setCurrentMemberIndex] = useState<number>(0);

  const nextMember = () => {
    setCurrentMemberIndex((prevIndex) =>
      (prevIndex + 1) % members.length
    );
  };

  const prevMember = () => {
    setCurrentMemberIndex((prevIndex) =>
      (prevIndex - 1 + members.length) % members.length
    );
  };

  const currentMember = members[currentMemberIndex];

  return (
    <div className="relative bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col space-y-6">
        <h1 className="text-2xl font-bold mb-6">Meet the awesome people behind this project!</h1>
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
      <p className="text-gray-300 leading-relaxed">
        {currentMember.quote}
      </p>
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
