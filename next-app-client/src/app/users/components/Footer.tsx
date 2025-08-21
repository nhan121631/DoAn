"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaYoutube,
  FaTwitter,
  FaTiktok,
  FaInstagram,
  FaCcVisa,
  FaStar,
} from "react-icons/fa";
import { BiLogoFacebookSquare } from "react-icons/bi";
import { MdLocationOn, MdEmail, MdPhone } from "react-icons/md";
import InfoCard from "./InfoCard/infocard";

export default function Footer() {
  return (
    <footer className="relative w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 lg:px-16 overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Top Section - Reviews and Info Card */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-24 items-center">
          {/* Customer Reviews */}
          <div className="flex flex-col space-y-6 md:space-y-8 text-center lg:text-left animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Customer Reviews
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="text-center group cursor-pointer">
                <p className="text-3xl sm:text-4xl font-bold text-yellow-400 transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-300">
                  10m+
                </p>
                <p className="text-gray-300 text-sm sm:text-base transition-colors duration-300 group-hover:text-white">
                  Happy People
                </p>
              </div>
              <div className="text-center group cursor-pointer">
                <p className="text-3xl sm:text-4xl font-bold text-yellow-400 transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-300">
                  4.88
                </p>
                <p className="text-gray-300 text-sm sm:text-base transition-colors duration-300 group-hover:text-white">
                  Overall rating
                </p>
                <div className="flex justify-center text-yellow-400 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className="h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 hover:scale-125 hover:text-yellow-300 animate-pulse"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="w-full animate-fade-in-up animation-delay-200">
            <InfoCard />
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 sm:mt-16 md:mt-20 pt-8 sm:pt-10 md:pt-12 border-t border-gradient-to-r from-transparent via-purple-400 to-transparent">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse"></div>
        </div>

        {/* Bottom Section - Links and Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12 xl:gap-16 mt-8">
          {/* Company Links */}
          <div className="space-y-8 animate-fade-in-up animation-delay-400">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-8">
              {/* About Section */}
              <div className="text-center sm:text-left">
                <p className=" text-base sm:text-lg mb-4 font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ABOUT ANTS.COM
                </p>
                <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
                  {[
                    "About Us",
                    "Operating Regulations",
                    "Terms of Use",
                    "Privacy Policy",
                    "Contact Us",
                  ].map((item, index) => (
                    <li
                      key={item}
                      className="animate-slide-in-left"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <Link
                        href="#"
                        className="hover:text-yellow-400 transition-all duration-300 hover:translate-x-2 hover:drop-shadow-lg relative group"
                      >
                        <span className="absolute inset-0 w-0 bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 group-hover:w-full opacity-20 rounded"></span>
                        <span className="relative">{item}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Customer Section */}
              <div className="text-center sm:text-left">
                <p className="text-base sm:text-lg mb-4 font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  FOR CUSTOMERS
                </p>
                <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
                  {[
                    "FAQ",
                    "Posting Guide",
                    "Service Price List",
                    "Posting Regulations",
                    "Complaint Resolution",
                  ].map((item, index) => (
                    <li
                      key={item}
                      className="animate-slide-in-left"
                      style={{ animationDelay: `${(index + 5) * 0.1}s` }}
                    >
                      <Link
                        href="#"
                        className="hover:text-yellow-400 transition-all duration-300 hover:translate-x-2 hover:drop-shadow-lg relative group"
                      >
                        <span className="absolute inset-0 w-0 bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 group-hover:w-full opacity-20 rounded"></span>
                        <span className="relative">{item}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="text-center md:text-left animate-fade-in-up animation-delay-600">
            <p className="text-base sm:text-lg mb-4 md:mb-6 font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              CONTACT US
            </p>
            <ul className="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base">
              <li className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 group hover:text-white transition-colors duration-300 animate-slide-in-right">
                <MdPhone className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 flex-shrink-0 group-hover:animate-bounce" />
                <span>+84 382 972 543</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 group hover:text-white transition-colors duration-300 animate-slide-in-right animation-delay-100">
                <MdEmail className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 flex-shrink-0 group-hover:animate-bounce" />
                <span>contact@ants123.com</span>
              </li>
              <li className="flex items-start justify-center md:justify-start gap-2 sm:gap-3 group hover:text-white transition-colors duration-300 animate-slide-in-right animation-delay-200">
                <MdLocationOn className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 flex-shrink-0 mt-0.5 group-hover:animate-bounce" />
                <span className="text-center md:text-left">
                  90 Nguyen Thuc Tu Street, Da Nang, Vietnam
                </span>
              </li>
            </ul>
          </div>

          {/* Payment & Social */}
          <div className="space-y-8 md:space-y-10 animate-fade-in-up animation-delay-800">
            {/* Payment Methods */}
            <div className="text-center xl:text-left">
              <p className="text-base sm:text-lg mb-4 md:mb-6 font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                PAYMENT METHODS
              </p>
              <div className="flex justify-center xl:justify-start gap-2 sm:gap-3 md:gap-4 flex-wrap">
                <div className="p-2 bg-gradient-to-br from-blue-700 to-blue-900 rounded-lg shadow-lg flex items-center justify-center w-16 h-10 sm:w-20 sm:h-12 md:w-20 md:h-14 transition-all duration-300 hover:scale-110 hover:shadow-blue-500/25 animate-float">
                  <FaCcVisa className="w-full h-full text-white" />
                </div>
                <div className="p-1 bg-white rounded-lg shadow-lg flex items-center justify-center w-16 h-10 sm:w-20 sm:h-12 md:w-20 md:h-14 transition-all duration-300 hover:scale-110 hover:shadow-purple-500/25 animate-float animation-delay-200">
                  <Image
                    src="https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/c1/8e/51/c18e5125-eef2-931e-8617-ee96a1fa0448/AppIcon-0-0-1x_U007emarketing-0-10-0-85-220.png/1200x600wa.png"
                    alt="VNPAY Logo"
                    width={60}
                    height={30}
                    className="h-6 sm:h-8 md:h-10 w-auto object-contain"
                    unoptimized
                  />
                </div>
                <div className="p-1 bg-white rounded-lg shadow-lg flex items-center justify-center w-16 h-10 sm:w-20 sm:h-12 md:w-20 md:h-14 transition-all duration-300 hover:scale-110 hover:shadow-yellow-500/25 animate-float animation-delay-400">
                  <Image
                    src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-Napas.png"
                    alt="NAPAS Logo"
                    width={60}
                    height={30}
                    className="h-6 sm:h-8 md:h-10 w-auto object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="text-center xl:text-left">
              <p className="text-base sm:text-lg mb-4 md:mb-6 font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                FOLLOW US
              </p>
              <div className="flex justify-center xl:justify-start items-center gap-3 sm:gap-4 flex-wrap">
                <a
                  href="https://www.facebook.com/huynhtrung.173"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-white hover:text-blue-600 transition-all duration-300 transform hover:scale-125 hover:rotate-12 animate-bounce-subtle"
                >
                  <BiLogoFacebookSquare className="h-8 w-8 sm:h-10 sm:w-10 p-1.5 sm:p-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full shadow-lg hover:shadow-blue-500/50" />
                </a>
                <a
                  href="#"
                  aria-label="YouTube"
                  className="text-white hover:text-red-600 transition-all duration-300 transform hover:scale-125 hover:rotate-12 animate-bounce-subtle animation-delay-100"
                >
                  <FaYoutube className="h-8 w-8 sm:h-10 sm:w-10 p-1.5 sm:p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-full shadow-lg hover:shadow-red-500/50" />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="text-white hover:text-pink-400 transition-all duration-300 transform hover:scale-125 hover:rotate-12 animate-bounce-subtle animation-delay-200"
                >
                  <FaInstagram className="h-8 w-8 sm:h-10 sm:w-10 p-1.5 sm:p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full shadow-lg hover:shadow-pink-500/50" />
                </a>
                <a
                  href="#"
                  aria-label="Twitter"
                  className="text-white hover:text-blue-300 transition-all duration-300 transform hover:scale-125 hover:rotate-12 animate-bounce-subtle animation-delay-300"
                >
                  <FaTwitter className="h-8 w-8 sm:h-10 sm:w-10 p-1.5 sm:p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg hover:shadow-blue-400/50" />
                </a>
                <a
                  href="#"
                  aria-label="TikTok"
                  className="text-white hover:text-gray-300 transition-all duration-300 transform hover:scale-125 hover:rotate-12 animate-bounce-subtle animation-delay-400"
                >
                  <FaTiktok className="h-8 w-8 sm:h-10 sm:w-10 p-1.5 sm:p-2 bg-gradient-to-br from-gray-800 to-black rounded-full shadow-lg hover:shadow-gray-500/50" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in-left {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-in-right {
          0% {
            opacity: 0;
            transform: translateX(30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes bounce-subtle {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        .animation-delay-800 {
          animation-delay: 0.8s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </footer>
  );
}
