"use client"; 

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function FeaturedListingsCard() {
  const featuredListings = [
    {
      id: 1,
      title: "CHO THUÊ PHÒNG TRỌ CÓ BAN CÔNG, MÁY LẠNH, THANG MÁY GIÁ 2 PHÒNG TRỌ CAO CẤP KHU HOÀNG HOA THÁM - TÂN BÌNH, THANG MÁY, ...", // Đã làm dài hơn để test
      price: "2.5 triệu/tháng",
      time: "1 tuần trước",
      imageUrl: "/images/anh1.jpg",
      isHot: false,
    },
    {
      id: 2,
      title: "CHO THUÊ PHÒNG CAO CẤP, ĐẦY ĐỦ TIỆN NGHI, PHÒNG TRỐNG GIAO NHANH CHÓNG VÀ TIỆN LỢI", // Đã làm dài hơn để test
      price: "4 triệu/tháng",
      time: "3 ngày trước",
      imageUrl: "/images/anh2.jpg", 
      isHot: true, // Đánh dấu là tin HOT
    },
    {
      id: 3,
      title: "PHÒNG TRỌ CAO CẤP KHU HOÀNG HOA THÁM - TÂN BÌNH, THANG MÁY, GIÁ RẺ BẤT NGỜ", // Đã làm dài hơn để test
      price: "3.5 triệu/tháng",
      time: "2 ngày trước",
      imageUrl: "/images/anh3.jpg", 
      isHot: false,
    },
    {
      id: 4,
      title: "PHÒNG TRỌ MỚI XÂY ĐẸP, GIÁ TỐT, GẦN CHỢ, TIỆN ĐI LẠI Q.GÒ VẤP, ĐẦY ĐỦ TIỆN NGHI",
      price: "3.2 triệu/tháng",
      time: "4 ngày trước",
      imageUrl: "/images/anh4.jpg",
      isHot: false,
    },
    {
      id: 5,
      title: "CĂN HỘ MINI CAO CẤP, FULL NỘI THẤT, CÓ BAN CÔNG, Q.TÂN BÌNH, THOÁNG MÁT",
      price: "5.0 triệu/tháng",
      time: "5 ngày trước",
      imageUrl: "/images/anh5.jpg",
      isHot: true,
    },
    {
      id: 6,
      title: "PHÒNG TRỌ RỘNG RÃI, THOÁNG MÁT, CÓ GÁC LỬNG, GIÁ RẺ Q.PHÚ NHUẬN, GẦN CHỢ",
      price: "2.8 triệu/tháng",
      time: "6 ngày trước",
      imageUrl: "/images/anh1.jpg",
      isHot: false,
    },
    {
      id: 7,
      title: "CHO THUÊ PHÒNG TRỌ CAO CẤP, MỚI XÂY, GẦN TRƯỜNG ĐH BÁCH KHOA, CÓ BAN CÔNG",
      price: "3.0 triệu/tháng",
      time: "1 tuần trước",
      imageUrl: "/images/anh2.jpg",
      isHot: true,
    },
    {
      id: 8,
      title: "PHÒNG TRỌ CAO CẤP, ĐẦY ĐỦ TIỆN NGHI, GẦN TRƯỜNG ĐH QUỐC GIA, GIÁ HỢP LÝ",
      price: "4.5 triệu/tháng",
      time: "2 tuần trước",
      imageUrl: "/images/anh3.jpg",
      isHot: false,
    }
  ];

  return (
    <div className="bg-sky-50 rounded-xl shadow-lg p-6 mt-6 border border-sky-400">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Tin đăng nổi bật</h3>
      <div className="flex flex-col gap-3"> 
        {featuredListings.map((listing, index) => ( 
          <React.Fragment key={listing.id}> 
            <Link href={`/tin-dang/${listing.id}`} className=" flex gap-2 p-2 rounded-lg hover:bg-sky-100 transition duration-200 w-full">
              <div className="relative w-32 h-32 flex-shrink-0 rounded-md overflow-hidden">
                <Image
                  src={listing.imageUrl}
                  alt={listing.title}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
                {listing.isHot && (
                  <span className="absolute top-2 left-0 bg-red-600 text-white text-xs px-2 py-0 shadow-md z-10 w-20 text-center">
                  CHO THUÊ NHANH
                </span>
                )}
              </div>
              <div className="flex flex-col justify-center flex-grow">
                <p className="text-gray-800 font-semibold text-sm md:text-base line-clamp-2">{listing.title}</p>
                <p className="text-green-700 font-bold text-sm md:text-base mt-1">{listing.price}</p>
                <p className="text-gray-500 text-xs">{listing.time}</p>
              </div>
            </Link>
            {index < featuredListings.length - 1 && (
              <hr className="border-1 border-gray-300" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}


