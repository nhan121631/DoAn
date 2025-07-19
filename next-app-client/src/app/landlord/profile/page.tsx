import Image from "next/image";
import React from "react";
import { FaMapMarkerAlt, FaUser } from "react-icons/fa";
import { IoIosPhonePortrait } from "react-icons/io";
import { MdOutlineMail } from "react-icons/md";
import ButtonEditProfile from "../components/ButtonEditProfile";

export default function ProfileInfo() {
  return (
    <div className="flex flex-col flex-1 min-h-screen w-full bg-white dark:bg-[#001529] text-gray-900 dark:text-white p-8 transition-colors duration-300">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Thông tin cá nhân</h1>
        <ButtonEditProfile />
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Bên trái: Avatar + Số dư */}
        <div className="flex flex-col items-center bg-gray-100 dark:bg-[#17223b] rounded-lg p-8 min-w-[300px] max-w-[350px] w-full mx-auto md:mx-0">
          <Image
            src="https://antimatter.vn/wp-content/uploads/2022/11/hinh-anh-avatar-nam.jpg"
            alt="Avatar"
            width={128}
            height={128}
            className="rounded-full border-4 border-blue-500 mb-4"
          />
          <span className="mt-2 font-semibold text-lg">Luân Trần</span>
          <div className="flex flex-col items-center mt-32 bg-gray-200 dark:bg-[#22304a] rounded-lg px-4 py-2 w-full">
            <span className="text-gray-500 dark:text-gray-300 text-base mb-1">
              Số dư tài khoản
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              5.000.000₫
            </span>
          </div>
        </div>
        {/* Bên phải: Thông tin cá nhân */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex bg-gray-100 dark:bg-[#17223b] rounded-lg p-6 items-center gap-4">
            <span className="text-2xl text-sky-600 dark:!text-sky-300">
              <FaUser />
            </span>
            <div>
              <div className="font-semibold text-lg">Name</div>
              <div>Luân Trần</div>
            </div>
          </div>
          <div className="flex bg-gray-100 dark:bg-[#17223b] rounded-lg p-6 items-center gap-4">
            <span className="text-2xl text-sky-600 dark:!text-sky-300">
              <IoIosPhonePortrait />
            </span>
            <div>
              <div className="font-semibold text-lg">Số điện thoại</div>
              <div>0899804328</div>
            </div>
          </div>
          <div className="flex bg-gray-100 dark:bg-[#17223b] rounded-lg p-6 items-center gap-4">
            <span className="text-2xl text-sky-600 dark:!text-sky-300">
              <MdOutlineMail />
            </span>
            <div>
              <div className="font-semibold text-lg">Email</div>
              <div>ttluan113@gmail.com</div>
            </div>
          </div>
          <div className="flex bg-gray-100 dark:bg-[#17223b] rounded-lg p-6 items-center gap-4">
            <span className="text-2xl text-sky-600 dark:!text-sky-300">
              <FaMapMarkerAlt />
            </span>
            <div>
              <div className="font-semibold text-lg">Địa chỉ</div>
              <div>
                Đại học Bách Khoa Hà Nội, 1 Đại Cồ Việt, Quận Hai Bà Trưng,
                Thành phố Hà Nội
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
