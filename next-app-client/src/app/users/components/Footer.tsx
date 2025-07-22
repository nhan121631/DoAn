import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight, FaYoutube, FaTwitter, FaTiktok, FaInstagram, FaCcVisa } from 'react-icons/fa';
import { BiLogoFacebookSquare } from 'react-icons/bi';
import { MdLocationOn, MdEmail, MdPhone } from 'react-icons/md'; // Import icons cho địa chỉ, email, điện thoại

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        <div className="flex flex-col space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            What our customers are saying us?
          </h2>
          <div className="flex items-center space-x-8">
            <div>
              <p className="text-4xl font-bold text-yellow-400">10m+</p>
              <p className="text-gray-400">Happy People</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-yellow-400">4.88</p>
              <p className="text-gray-400">Overall rating</p>
              <div className="flex text-yellow-400">
                {/* Đánh giá sao */}
                <span>&#9733;</span>
                <span>&#9733;</span>
                <span>&#9733;</span>
                <span>&#9733;</span>
                <span>&#9733;</span>
              </div>
            </div>
          </div>
        </div>

        {/* Phần lời chứng thực */}
        <div className="relative bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col space-y-6">
          <div className="flex items-center space-x-4">
            <Image
              src="/images/useravt.png"
              alt="Cameron Williamson"
              width={60}
              height={60}
              className="rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-lg">Cameron Williamson</p>
              <p className="text-gray-400 text-sm">Designer</p>
            </div>
          </div>
          <p className="text-gray-300 leading-relaxed">
            "Searches for multiplexes, property comparisons, and the loan
            estimator. Works great. Lorem ipsum dolor sit amet, consectetur
            adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dores."
          </p>
          <div className="flex space-x-4 mt-4">
            <button className="p-3 rounded-full border border-gray-600 hover:bg-gray-700 transition">
              <FaChevronLeft className="h-6 w-6 text-white" />
            </button>
            <button className="p-3 rounded-full border border-gray-600 hover:bg-gray-700 transition">
              <FaChevronRight className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Phần thông tin công ty, khách hàng, liên hệ, phương thức thanh toán và mạng xã hội */}
      <div className="mt-20 pt-12 border-t border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 items-start">
        {/* Phần Chi tiết - About and For Customers */}
        <div className="col-span-1 text-center md:text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8"> {/* Nested grid cho 2 cột trên màn hình nhỏ */}
                {/* VỀ PHONGTRO123.COM */}
                <div>
                    <p className="text-gray-400 text-lg mb-4 font-bold">
                        ABOUT ANT.COM
                    </p>
                    <ul className="space-y-2 text-gray-300">
                        <li><Link href="#" className="hover:text-yellow-400 transition">About Us</Link></li>
                        <li><Link href="#" className="hover:text-yellow-400 transition">Operating Regulations</Link></li>
                        <li><Link href="#" className="hover:text-yellow-400 transition">Terms of Use</Link></li>
                        <li><Link href="#" className="hover:text-yellow-400 transition">Privacy Policy</Link></li>
                        <li><Link href="#" className="hover:text-yellow-400 transition">Contact Us</Link></li>
                    </ul>
                </div>
                {/* DÀNH CHO KHÁCH HÀNG */}
                <div>
                    <p className="text-gray-400 text-lg mb-4 font-bold">
                        FOR CUSTOMERS
                    </p>
                    <ul className="space-y-2 text-gray-300">
                        <li><Link href="#" className="hover:text-yellow-400 transition">FAQ</Link></li>
                        <li><Link href="#" className="hover:text-yellow-400 transition">Posting Guide</Link></li>
                        <li><Link href="#" className="hover:text-yellow-400 transition">Service Price List</Link></li>
                        <li><Link href="#" className="hover:text-yellow-400 transition">Posting Regulations</Link></li>
                        <li><Link href="#" className="hover:text-yellow-400 transition">Complaint Resolution</Link></li>
                    </ul>
                </div>
            </div>
        </div>

        
        <div className="col-span-2 flex flex-col md:flex-row justify-between items-start md:items-start gap-8 md:gap-37">
            <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-auto">
                <p className="text-gray-400 text-lg mb-4 font-bold">
                    CONTACT US
                </p>
                <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center justify-center md:justify-start gap-2">
                        <MdPhone className="h-5 w-5 text-yellow-400" />
                        <span>+84 123 456 789</span>
                    </li>
                    <li className="flex items-center justify-center md:justify-start gap-2">
                        <MdEmail className="h-5 w-5 text-yellow-400" />
                        <span>contact@phongtro123.com</span>
                    </li>
                    <li className="flex items-center justify-center md:justify-start gap-2">
                        <MdLocationOn className="h-5 w-5 text-yellow-400" />
                        <span>123 Main Street, Da Nang, Vietnam</span>
                    </li>
                </ul>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-start w-full gap-8 md:gap-16">
                <div className="text-center md:text-left flex-1"> 
                  <p className="text-gray-400 text-lg mb-4">
                    PAYMENT METHODS
                  </p>
                  <div className="flex justify-center md:justify-start gap-4">
                    <div className="p-2 bg-white rounded-md shadow-md flex items-center justify-center">
                        <FaCcVisa className="h-10 w-16 text-blue-800 m-0" />
                    </div>
                    <div className="p-2 bg-white rounded-md shadow-md flex items-center justify-center">
                        <img
                            src="https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/c1/8e/51/c18e5125-eef2-931e-8617-ee96a1fa0448/AppIcon-0-0-1x_U007emarketing-0-10-0-85-220.png/1200x600wa.png"
                            alt="VNPAY Logo"
                            className="h-10 w-auto object-contain"
                        />
                    </div>
                  </div>
                </div>

                {/* Phần theo dõi mạng xã hội */}
                <div className="text-center md:text-right flex flex-col items-center md:items-start flex-1"> {/* flex-1 để chiếm không gian còn lại */}
                  <p className="text-gray-400 text-lg mb-4 md:mb-8">
                    FOLLOW ANT.COM
                  </p>
                  <div className="flex justify-center md:justify-end items-center gap-4">
                    <a href="https://www.facebook.com/huynhtrung.173" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-600 transition-colors duration-300">
                      <BiLogoFacebookSquare className="h-10 w-10 p-2 bg-blue-700 rounded-full" />
                    </a>
                    <a href="#" className="text-white hover:text-red-600 transition-colors duration-300">
                      <FaYoutube className="h-10 w-10 p-2 bg-red-700 rounded-full" />
                    </a>
                    <a href="#" className="text-white hover:text-blue-400 transition-colors duration-300">
                      <FaInstagram className="h-10 w-10 p-2 bg-pink-500 rounded-full" />
                    </a>
                    <a href="#" className="text-white hover:text-blue-300 transition-colors duration-300">
                      <FaTwitter className="h-10 w-10 p-2 bg-blue-400 rounded-full" />
                    </a>
                    <a href="#" className="text-white hover:text-gray-300 transition-colors duration-300">
                      <FaTiktok className="h-10 w-10 p-2 bg-black rounded-full" />
                    </a>
                  </div>
                </div>
            </div>
        </div>
      </div>
    </footer>
  );
}
