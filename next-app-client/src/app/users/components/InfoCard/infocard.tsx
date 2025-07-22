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
      title: "Customer",
      quote: "Searches for multiplexes, property comparisons, and the loan estimator. Works great. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dores.",
      avatarSrc: "/images/trungg.png",
    },
    {
      name: "Nguyen Viet Khoi",
      title: "Customer",
      quote: "This platform is truly revolutionary! Finding the perfect rental room has never been easier. The features are intuitive and the support is top-notch. Highly recommend for anyone in the market!",
      avatarSrc: "/images/khoi.png",
    },
    {
      name: "Pham Phu Nhan",
      title: "Customer",
      quote: "As someone always on the move, a reliable rental service is crucial. JustHome delivered beyond expectations. Quick, efficient, and secure. A must-have for modern living.",
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
        "{currentMember.quote}"
      </p>
      <div className="flex space-x-4 mt-4">
        <button
          onClick={prevMember}
          className="p-3 rounded-full border border-gray-600 hover:bg-gray-700 transition"
        >
          <FaChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextMember}
          className="p-3 rounded-full border border-gray-600 hover:bg-gray-700 transition"
        >
          <FaChevronRight className="h-6 w-6 text-white" />
        </button>
      </div>
    </div>
  );
}
