"use client"; 

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function FeaturedListingsCard() {
  const featuredListings = [
    {
      id: 1,
      title: "CHO THUÊ PHÒNG TRỌ CÓ BAN CÔNG, MÁY LẠNH, THANG MÁY GIÁ 2 PHÒNG TRỌ CAO CẤP KHU HOÀNG HOA THÁM - TÂN BÌNH, THANG MÁY, ...", 
      price: "2.5 triệu/tháng",
      time: "1 tuần trước",
      imageUrl: "/images/anh1.jpg",
      isHot: false,
    },
    {
      id: 2,
      title: "CHO THUÊ PHÒNG CAO CẤP, ĐẦY ĐỦ TIỆN NGHI, PHÒNG TRỐNG GIAO NHANH CHÓNG VÀ TIỆN LỢI", 
      price: "4 triệu/tháng",
      time: "3 ngày trước",
      imageUrl: "/images/anh2.jpg", 
      isHot: true, // Đánh dấu là tin HOT
    },
    {
      id: 3,
      title: "PHÒNG TRỌ CAO CẤP KHU HOÀNG HOA THÁM - TÂN BÌNH, THANG MÁY, GIÁ RẺ BẤT NGỜ", 
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
    <div className="p-6 mt-6 border shadow-lg bg-sky-50 rounded-xl border-sky-400">
      <h3 className="mb-4 text-xl font-bold text-gray-800">Tin mới nhất</h3>
      <div className="flex flex-col gap-3"> 
        {featuredListings.map((listing, index) => ( 
          <React.Fragment key={listing.id}> 
            <Link href={`/tin-dang/${listing.id}`} className="flex w-full gap-2 p-2 transition duration-200 rounded-lg hover:bg-sky-100">
              <div className="relative flex-shrink-0 w-24 h-24 overflow-hidden rounded-md">
                <Image
                  src={listing.imageUrl}
                  alt={listing.title}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes='(max-width: 640px) 100vw, 300px'
                  className="rounded-md"
                  priority
                />
                {listing.isHot && (
                  <span className="absolute left-0 z-10 w-20 px-2 py-0 text-xs text-center text-white bg-red-600 shadow-md rounded-xs top-2">
                  CHO THUÊ NHANH
                </span>
                )}
              </div>
              <div className="flex flex-col justify-center flex-grow">
                <p className="text-sm font-semibold text-gray-800 md:text-base line-clamp-2">{listing.title}</p>
                <p className="mt-1 text-sm font-bold text-green-700 md:text-base">{listing.price}</p>
                <p className="text-xs text-gray-500">{listing.time}</p>
              </div>
            </Link>
            {index < featuredListings.length - 1 && (
              <hr className="border-t border-gray-300" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}


