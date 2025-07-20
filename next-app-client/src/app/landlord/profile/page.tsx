import Image from "next/image";
import React from "react";
import { FaMapMarkerAlt, FaUser } from "react-icons/fa";
import { IoIosPhonePortrait } from "react-icons/io";
import { MdOutlineMail } from "react-icons/md";
import ButtonEditProfile from "../components/profile/ButtonEditProfile";
import { RiBankCardFill } from "react-icons/ri";

export default function ProfileInfo() {
  return (
    <div className="flex flex-col flex-1 min-h-screen w-full bg-white dark:bg-[#001529] text-gray-900 dark:text-white p-8 transition-colors duration-300">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Profile Information</h1>
        <ButtonEditProfile />
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Avatar + Balance */}
        <div className="flex flex-col items-center bg-gradient-to-br from-purple-200 via-blue-100 to-cyan-100 dark:from-[#232946] dark:via-[#1a1a2e] dark:to-[#0f3460] rounded-2xl shadow-lg p-8 min-w-[300px] max-w-[350px] w-full mx-auto md:mx-0">
          <Image
            src="https://antimatter.vn/wp-content/uploads/2022/11/hinh-anh-avatar-nam.jpg"
            alt="Avatar"
            width={128}
            height={128}
            className="rounded-full border-4 border-blue-500 mb-4"
          />
          <span className="mt-2 font-semibold text-lg">Luan Tran</span>
          <div className="flex flex-col items-center mt-32 bg-blue-50 dark:bg-[#22304a] rounded-xl px-4 py-2 w-full shadow">
            <span className="text-gray-500 dark:text-gray-300 text-base mb-1">
              Account Balance
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              5,000,000₫
            </span>
          </div>
        </div>
        {/* Right: Personal Information */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex bg-gray-100 dark:bg-[#17223b] rounded-lg p-6 items-center gap-4">
            <span className="text-2xl text-sky-600 dark:!text-sky-300">
              <FaUser />
            </span>
            <div>
              <div className="font-semibold text-lg">Name</div>
              <div>Luan Tran</div>
            </div>
          </div>
          <div className="flex bg-gray-100 dark:bg-[#17223b] rounded-lg p-6 items-center gap-4">
            <span className="text-2xl text-sky-600 dark:!text-sky-300">
              <IoIosPhonePortrait />
            </span>
            <div>
              <div className="font-semibold text-lg">Phone Number</div>
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
              <div className="font-semibold text-lg">Address</div>
              <div>
                Hanoi University of Science and Technology, 1 Dai Co Viet, Hai
                Ba Trung District, Hanoi City
              </div>
            </div>
          </div>

          <div className="flex bg-gray-100 dark:bg-[#17223b] rounded-lg p-6 items-center gap-4">
            <span className="text-2xl text-sky-600 dark:!text-sky-300">
              <RiBankCardFill />
            </span>
            <div>
              <div className="font-semibold text-lg">
                {" "}
                NH TMCP Quân Đội (MB Bank){" "}
              </div>
              <div>1234567890 - Luan Tran</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
