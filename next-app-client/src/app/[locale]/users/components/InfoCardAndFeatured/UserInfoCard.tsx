/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdPhone, MdEmail, MdVerified, MdLocationOn } from "react-icons/md";
import { FaTimes, FaStar, FaUserCheck, FaCrown } from "react-icons/fa";
import {
  IoShareSocialOutline,
  IoWarningOutline,
  IoChatbubbleEllipsesOutline,
} from "react-icons/io5";
import { BiShield } from "react-icons/bi";
import { getLandlordByRoomId } from "@/services/RoomService";
import { LandlordDetailByRoom } from "@/types/types";
import { API_URL, URL_IMAGE } from "@/services/Constant";
import ChatClient from "@/app/components/chat/ChatClient";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { addFavorite, removeFavorite } from "@/services/FavoriteService";
import { useFavoriteStore } from "@/stores/FavoriteStore";
import { Input, Radio, message } from "antd";
import type { RadioChangeEvent } from "antd";

// Mask functions for privacy protection
function maskPhone(phone: string) {
  if (!phone) return "";
  if (phone.length < 4) return phone;
  return phone.slice(0, 2) + "******" + phone.slice(-2);
}

function maskEmail(email: string) {
  if (!email) return "";
  const [name, domain] = email.split("@");
  if (name.length <= 2) {
    return name[0] + "****@" + domain;
  }
  return name[0] + "****" + name.slice(-1) + "@" + domain;
}

export default function UserInfoCard({ id }: { id: string }) {
  const [isSaved, setIsSaved] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  // antd message API
  const [messageApi, contextHolder] = message.useMessage();
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  // predefined reasons list
  const REPORT_REASONS = [
    "Information has expired/no longer valid",
    "Duplicate content",
    "Unable to contact the listing owner",
    "Information in the listing is inaccurate (price, area, images...)",
    "Other reasons",
  ];
  // v3 flow: we'll set verified flag after server verification
  const [isVerifiedHuman, setIsVerifiedHuman] = useState(false);
  const [lastRecaptchaToken, setLastRecaptchaToken] = useState<string | null>(
    null
  );
  const [lastRecaptchaVerifiedAt, setLastRecaptchaVerifiedAt] = useState<
    number | null
  >(null);
  // UI/debug states for report submission and reCAPTCHA verification
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportStatus, setReportStatus] = useState<string | null>(null);
  const [lastRecaptchaScore, setLastRecaptchaScore] = useState<number | null>(
    null
  );
  const [verifySubmitting, setVerifySubmitting] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [landlord, setLandlord] = useState<LandlordDetailByRoom | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { data: session } = useSession();
  // reCAPTCHA site key (v3). Ensure NEXT_PUBLIC_RECAPTCHA_SITE_KEY or NEXT_PUBLIC_SITE_KEY is set in .env
  const SITE_KEY =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
    process.env.NEXT_PUBLIC_SITE_KEY ||
    "";

  const [favoriteCount, setFavoriteCount] = useState(0);
  const { favoriteRoomIds } = useFavoriteStore();
  const isFavorited = favoriteRoomIds.has(id);

  const currentPostUrl = `http://localhost:3000/detail/${id}`;
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`${API_URL}/online-users`);
        const data = await res.json();
        setOnlineUsers(data);
      } catch (e) {
        console.error("Error fetching online users:", e);
        setOnlineUsers([]);
      }
    }
    fetchUsers();
    const interval = setInterval(fetchUsers, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll handler for sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const threshold = 200; // Sticky after scrolling 200px

      const viewportHeight = window.innerHeight;
      const cardElement = document.querySelector(
        "[data-user-info-card]"
      ) as HTMLElement | null;
      if (!cardElement) return;
      const cardRect = cardElement.getBoundingClientRect();
      const cardHeight = cardRect.height || 0;

      // Only make sticky if there's enough viewport space
      const hasEnoughSpace = viewportHeight > cardHeight + 100; // 100px buffer

      // By default decide sticky based on scroll and available space
      let shouldStick = scrollPosition > threshold && hasEnoughSpace;

      // If there's a featured listings card, ensure sticky placement won't overlap it.
      const featured = document.querySelector(
        "[data-featured-listings]"
      ) as HTMLElement | null;
      if (featured && shouldStick) {
        const featuredRect = featured.getBoundingClientRect();
        // When sticky, the card will be positioned at top:10 (top-10). Compute its bottom in viewport coords.
        const stickyTop = 10; // matches 'top-10' class
        const stickyBottom = stickyTop + cardHeight;
        // If the sticky card's bottom would be below the featured card's top, disable sticky to avoid overlap
        if (stickyBottom + 8 > featuredRect.top) {
          shouldStick = false;
        }
      }

      setIsSticky(shouldStick);

      // Adjust featured card spacing when sticky, otherwise reset
      if (featured && cardElement) {
        if (shouldStick) {
          featured.style.marginTop = cardHeight + 16 + "px";
        } else {
          featured.style.marginTop = "";
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll); // Also check on resize

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      const data = await getLandlordByRoomId(id);
      setLandlord(data as LandlordDetailByRoom);
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    async function fetchFavoriteCount() {
      if (id) {
        const countRes = await fetch(`/api/favorites/rooms/${id}/count`);
        const count = await countRes.json();
        setFavoriteCount(count);
      }
    }
    fetchFavoriteCount();
  }, [id]);

  const handleFavorite = async () => {
    if (!session?.user?.id) {
      redirect("/auth/login");
      return;
    }

    try {
      if (isFavorited) {
        await removeFavorite(id);
      } else {
        await addFavorite(id);
      }

      // Refresh favorite count
      const countRes = await fetch(`/api/favorites/rooms/${id}/count`);
      const newCount = await countRes.json();
      setFavoriteCount(newCount);
    } catch (error) {
      console.error("Failed to update favorite status:", error);
    }
  };

  // Load grecaptcha script if not already present
  const loadGrecaptcha = (): Promise<void> => {
    if (!SITE_KEY)
      return Promise.reject(new Error("Missing reCAPTCHA site key"));
    if (typeof window === "undefined")
      return Promise.reject(new Error("No window object"));
    const w = window as any;
    // If grecaptcha is already initialized and ready, we're done
    if (w.grecaptcha && typeof w.grecaptcha.ready === "function")
      return Promise.resolve();

    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(
        `script[src*="recaptcha/api.js"]`
      );
      if (existingScript) {
        // wait for grecaptcha.ready to become available
        const start = Date.now();
        const waitForReady = () => {
          if (w.grecaptcha && typeof w.grecaptcha.ready === "function") {
            w.grecaptcha.ready(() => resolve());
            return;
          }
          if (Date.now() - start > 10000) {
            reject(new Error("grecaptcha.ready not available after waiting"));
            return;
          }
          setTimeout(waitForReady, 50);
        };
        waitForReady();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // wait for grecaptcha.ready to be available or time out
        const start = Date.now();
        const wait = () => {
          if (w.grecaptcha && typeof w.grecaptcha.ready === "function") {
            w.grecaptcha.ready(() => resolve());
          } else if (Date.now() - start > 10000) {
            reject(new Error("grecaptcha.ready not available after load"));
          } else {
            setTimeout(wait, 50);
          }
        };
        wait();
      };
      script.onerror = () =>
        reject(new Error("Failed to load grecaptcha script"));
      document.head.appendChild(script);
    });
  };

  // Helper to mask the public site key so we don't expose the full value in the UI
  const maskSiteKey = (key: string) => {
    if (!key) return "NOT CONFIGURED";
    try {
      if (key.length <= 6)
        return key.slice(0, Math.max(1, key.length - 1)) + "...";
      return `${key.slice(0, 6)}...`;
    } catch (e) {
      return "configured";
    }
  };

  const handleSubmitReport = async () => {
    // Validate required fields
    if (!reportReason) {
      messageApi.error("Please select a reason for reporting.");
      return;
    }

    const nameTrim = contactName.trim();
    if (!nameTrim) {
      messageApi.error("Please enter your full name.");
      return;
    }

    // Name validation: no special characters and under 100 characters
    if (nameTrim.length >= 100) {
      messageApi.error("Name must be under 100 characters.");
      return;
    }
    // Check for special characters in name (allow only letters, numbers, and spaces)
    const nameRegex = /^[a-zA-ZÀ-ỹ0-9\s]+$/;
    if (!nameRegex.test(nameTrim)) {
      messageApi.error("Name cannot contain special characters.");
      return;
    }

    const phoneTrim = contactPhone.trim();
    if (!phoneTrim) {
      messageApi.error("Please enter your phone number.");
      return;
    }

    // Phone validation: must be exactly 10 digits, no special characters
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneTrim)) {
      messageApi.error(
        "Phone number must be exactly 10 digits and contain no special characters."
      );
      return;
    }

    // Validate description if "Other reasons" is selected
    if (reportReason === "Other reasons") {
      const descriptionTrim = reportDescription.trim();
      if (!descriptionTrim) {
        messageApi.error(
          "Please provide details when selecting 'Other reasons'."
        );
        return;
      }
    }

    setReportSubmitting(true);
    setReportStatus("Submitting report...");
    try {
      // Prepare payload
      const payload: any = {
        reason: reportReason,
        contactName: nameTrim,
        contactPhone: phoneTrim,
        postUrl: currentPostUrl,
      };

      // Add description if "Other reasons" is selected (already validated as required)
      if (reportReason === "Other reasons") {
        payload.description = reportDescription.trim();
      }

      console.log("[UserInfoCard] 📤 Sending report payload:", payload);

      // Submit the report to our Next.js API route which forwards to Spring Boot
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("[UserInfoCard] 📥 Response status:", response.status);
      console.log(
        "[UserInfoCard] 📥 Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      const data = await response.json();
      console.log("[UserInfoCard] 📥 Response data:", data);

      if (data.success) {
        messageApi.success("Report submitted successfully!");
        setReportStatus("Report submitted. Thank you!");

        // Reset form
        setReportReason("");
        setReportDescription(""); // Always reset, no harm
        setContactName("");
        setContactPhone("");
        setIsVerifiedHuman(false); // Reset reCAPTCHA verification
        setLastRecaptchaToken(null);
        setLastRecaptchaVerifiedAt(null);

        // Close modal after delay
        setTimeout(() => {
          setShowReportModal(false);
          setReportStatus(null);
        }, 1500);
      } else {
        messageApi.error(
          data.message || "An error occurred while submitting the report."
        );
        setReportStatus(
          "Error submitting report: " + (data.message || "Please try again.")
        );
      }
    } catch (err) {
      console.error("[UserInfoCard] ❌ Error submitting report:", err);
      console.error("[UserInfoCard] ❌ Error details:", {
        message: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : undefined,
        type: typeof err,
        error: err,
      });
      messageApi.error("Connection error. Please try again later.");
      setReportStatus("Error submitting report. Please try again.");
    } finally {
      setReportSubmitting(false);
    }
  };

  // Explicit verification action invoked by user before submitting report
  const handleVerifyRecaptcha = async (): Promise<boolean> => {
    if (!SITE_KEY) {
      setReportStatus("reCAPTCHA not configured.");
      return false;
    }

    setVerifySubmitting(true);
    // setReportStatus("Đang xác thực reCAPTCHA...");
    setLastRecaptchaScore(null);
    try {
      await loadGrecaptcha();
      const w = window as any;
      if (!w.grecaptcha) throw new Error("grecaptcha not available after load");

      // Ensure grecaptcha is ready before calling execute to avoid 'execute is not a function'
      if (typeof w.grecaptcha.ready === "function") {
        await new Promise<void>((res) => w.grecaptcha.ready(res));
      } else {
        // small delay fallback
        await new Promise((r) => setTimeout(r, 200));
      }

      if (typeof w.grecaptcha.execute !== "function") {
        console.error(
          "grecaptcha.execute is not a function at call time",
          w.grecaptcha
        );
        setReportStatus(
          "reCAPTCHA error: unable to perform verification. Please try again later."
        );
        setIsVerifiedHuman(false);
        setVerifySubmitting(false);
        return false;
      }

      const token: string = await w.grecaptcha.execute(SITE_KEY, {
        action: "report",
      });
      console.debug(
        "reCAPTCHA token received (truncated):",
        token?.slice ? token.slice(0, 10) + "..." : token
      );

      const verifyRes = await fetch("/api/recaptcha/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action: "report" }),
      });

      if (!verifyRes.ok) {
        const text = await verifyRes.text();
        console.error("reCAPTCHA verify endpoint returned error", text);
        setReportStatus("Error verifying reCAPTCHA: server returned error.");
        setIsVerifiedHuman(false);
        setVerifySubmitting(false);
        return false;
      }

      const verifyData = await verifyRes.json();
      const score = verifyData?.score ?? 0;
      const success = verifyData?.success ?? false;
      setLastRecaptchaScore(score);
      // setReportStatus(`reCAPTCHA score: ${score}`);
      console.debug("reCAPTCHA verify response:", verifyData);

      if (!success || score < 0.5) {
        setReportStatus("Verification failed — please try again.");
        setIsVerifiedHuman(false);
        setVerifySubmitting(false);
        return false;
      }

      // verification succeeded — store token + timestamp and mark verified
      setIsVerifiedHuman(true);
      setLastRecaptchaToken(token);
      setLastRecaptchaVerifiedAt(Date.now());
      // setReportStatus("Xác thực thành công. Bạn có thể gửi phản ánh.");
      return true;
    } catch (err) {
      console.error("Error during reCAPTCHA verification", err);
      setReportStatus("Error verifying reCAPTCHA. Please try again.");
      setIsVerifiedHuman(false);
      return false;
    } finally {
      setVerifySubmitting(false);
    }
  };

  // Restore overlay click handler so clicking backdrop closes modals
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowShareModal(false);
      setShowReportModal(false);
    }
  };

  if (!landlord) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-gray-200 shadow-lg rounded-2xl min-h-96 animate-pulse">
        <div className="w-24 h-24 mb-4 bg-gray-200 rounded-full"></div>
        <div className="w-32 h-4 mb-2 bg-gray-200 rounded"></div>
        <div className="w-24 h-3 mb-4 bg-gray-200 rounded"></div>
        <div className="w-full space-y-3">
          <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
          <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const handleSavePost = () => {
    setIsSaved(!isSaved);
    if (!isSaved) {
      console.log("Tin đã lưu thành công!");
    } else {
      console.log("Tin đã được hủy lưu!");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(currentPostUrl)
      .then(() => {
        console.log("Đã sao chép URL vào clipboard!");
      })
      .catch((err) => {
        console.error("Không thể sao chép URL: ", err);
      });
  };

  const isOnline = onlineUsers.includes(landlord.id);

  return (
    <div
      data-user-info-card
      className={`space-y-4 transition-all duration-300 
        ${isSticky ? "sticky top-10 z-10" : ""}`}
    >
      {/* Main Profile Card */}
      <div className="overflow-hidden transition-all duration-500 bg-white border border-gray-100 shadow-xl rounded-2xl hover:shadow-2xl">
        {/* Header with gradient background */}
        <div className="relative p-6 text-white bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
          <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-white/10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 -mb-12 -ml-12 rounded-full bg-white/10"></div>

          <div className="relative flex flex-col items-center">
            <div className="relative mb-4">
              <div className="relative">
                <Image
                  src={
                    landlord.avatar
                      ? URL_IMAGE + landlord.avatar
                      : "/images/default/avatar.jpg"
                  }
                  alt="User Avatar"
                  width={90}
                  height={90}
                  className="object-cover border-4 shadow-xl rounded-2xl border-white/30 backdrop-blur-sm"
                  priority
                />
                {/* Online status indicator */}
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-lg">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      isOnline
                        ? "bg-gradient-to-r from-green-400 to-emerald-500"
                        : "bg-gradient-to-r from-gray-400 to-gray-500"
                    }`}
                  >
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white">
                  {landlord.fullName}
                </h3>
                <FaCrown className="w-4 h-4 text-yellow-300" />
              </div>

              <div
                className={`flex items-center gap-2 justify-center px-3 py-1 rounded-full backdrop-blur-sm ${
                  isOnline
                    ? "bg-green-400/20 border border-green-300/30"
                    : "bg-white/10 border border-white/20"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? "bg-green-300 animate-pulse" : "bg-gray-300"
                  }`}
                ></div>
                <p
                  className={`text-xs font-medium ${
                    isOnline ? "text-green-100" : "text-white/80"
                  }`}
                >
                  {isOnline ? "Online now" : "Offline"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-6">
          {/* Stats Section */}
          <div className="p-4 border border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <FaStar className="w-3 h-3 text-yellow-500" />
                  <p className="text-lg font-bold text-gray-800">
                    {landlord.amountPost}
                  </p>
                </div>
                <p className="text-xs font-medium text-gray-600">Listings</p>
              </div>

              <div className="w-px h-8 bg-gray-200"></div>

              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <FaUserCheck className="w-3 h-3 text-blue-500" />
                  <p className="text-sm font-bold text-gray-800">Member</p>
                </div>
                <p className="text-xs font-medium text-gray-600">
                  Since {landlord.createDate}
                </p>
              </div>
            </div>
          </div>

          {/* Verification Badges */}
          <div className="flex flex-wrap justify-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1 text-green-700 border border-green-200 rounded-full bg-green-50">
              <MdVerified className="w-3 h-3" />
              <span className="text-xs font-medium">Verified</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 text-blue-700 border border-blue-200 rounded-full bg-blue-50">
              <BiShield className="w-3 h-3" />
              <span className="text-xs font-medium">Trusted</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Contact Button */}
            <Link
              href={
                landlord.phone
                  ? `tel:${landlord.phone}`
                  : `mailto:${landlord.email}`
              }
              className="group relative w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-green-600 to-emerald-700 group-hover:opacity-100"></div>
              <div className="relative flex items-center gap-3">
                {landlord.phone ? (
                  <MdPhone className="w-5 h-5" />
                ) : (
                  <MdEmail className="w-5 h-5" />
                )}
                <span className="font-semibold">
                  {session?.user?.id
                    ? landlord.phone
                      ? maskPhone(landlord.phone)
                      : maskEmail(landlord.email || "")
                    : landlord.phone || landlord.email}
                </span>
              </div>
            </Link>

            {/* Chat Button */}
            <button
              onClick={() => {
                if (!session?.user?.id) {
                  redirect("/auth/login");
                }
                setShowChat(true);
              }}
              className="group relative w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-blue-600 to-indigo-700 group-hover:opacity-100"></div>
              <div className="relative flex items-center gap-3">
                <IoChatbubbleEllipsesOutline className="w-5 h-5" />
                <span className="font-semibold">Start Conversation</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="p-4 bg-white border border-gray-100 shadow-lg rounded-2xl">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleFavorite}
            className={`group flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 ${
              isFavorited
                ? "bg-gradient-to-br from-red-50 to-pink-50 text-red-700 shadow-md border border-red-200/50"
                : "text-slate-600 hover:text-red-700 hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 hover:shadow-md hover:border hover:border-red-200/50"
            }`}
          >
            <div
              className={`p-2 rounded-lg transition-colors ${
                isFavorited
                  ? "bg-red-100"
                  : "bg-gray-100 group-hover:bg-red-100"
              }`}
            >
              {isFavorited ? (
                <AiFillHeart className="w-4 h-4" />
              ) : (
                <AiOutlineHeart className="w-4 h-4" />
              )}
            </div>

            {/* Like và số gộp chung */}
            <span className="text-xs font-semibold">
              {isFavorited ? "Favorites" : "Favorite"} {favoriteCount}
            </span>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="flex flex-col items-center gap-2 p-4 transition-all duration-300 group rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 hover:shadow-md hover:border hover:border-emerald-200/50"
          >
            <div className="p-2 transition-colors bg-gray-100 rounded-lg group-hover:bg-emerald-100">
              <IoShareSocialOutline className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Share</span>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="flex flex-col items-center gap-2 p-4 transition-all duration-300 group rounded-xl text-slate-600 hover:text-red-700 hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 hover:shadow-md hover:border hover:border-red-200/50"
          >
            <div className="p-2 transition-colors bg-gray-100 rounded-lg group-hover:bg-red-100">
              <IoWarningOutline className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Report</span>
          </button>
        </div>
      </div>

      {/* Trust & Safety Card */}
      <div className="p-4 border border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BiShield className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="mb-1 text-sm font-semibold text-gray-800">
              Safety First
            </h4>
            <p className="text-xs leading-relaxed text-gray-600">
              Always meet in public places and verify property details before
              making any payments.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && (
        <div
          className="fixed z-50 flex items-end bottom-6 right-6"
          style={{ pointerEvents: "none" }}
        >
          <div
            className="rounded-2xl shadow-2xl p-0 max-w-sm w-[600px] relative bg-white"
            style={{ pointerEvents: "auto" }}
          >
            <button
              className="absolute z-50 flex items-center justify-center w-8 h-8 text-xl text-gray-400 transition-colors rounded-full top-4 right-6 hover:text-gray-600 hover:bg-gray-100"
              onClick={() => setShowChat(false)}
            >
              &times;
            </button>
            <ChatClient
              senderId={session?.user?.id ? String(session.user.id) : ""}
              recipientId={landlord.id ? String(landlord.id) : ""}
              defaultToUserName={landlord.fullName}
            />
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onMouseDown={handleOverlayClick}
        >
          <div
            className="relative w-full max-w-md p-8 bg-white border shadow-2xl rounded-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute flex items-center justify-center w-8 h-8 text-gray-400 transition-colors rounded-full top-4 right-4 hover:text-gray-600 hover:bg-gray-100"
            >
              <FaTimes className="w-4 h-4" />
            </button>
            <div className="mb-6 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
                <IoShareSocialOutline className="w-8 h-8 text-white" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-800">
                Share this listing
              </h2>
              <p className="text-gray-600">
                Copy the link to share with others
              </p>
            </div>
            <div className="flex items-center overflow-hidden transition-colors border-2 border-gray-200 shadow-sm rounded-xl hover:border-blue-300">
              <input
                type="text"
                readOnly
                value={currentPostUrl}
                className="flex-grow p-4 text-sm text-gray-700 outline-none bg-gray-50"
              />
              <button
                onClick={handleCopyLink}
                className="px-6 py-4 font-semibold text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div
          className="fixed mt-[5%] inset-0 z-55 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onMouseDown={handleOverlayClick}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-lg max-h-[85vh] relative overflow-y-auto z-[10000]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* antd message context holder */}
            {contextHolder}
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute z-10 flex items-center justify-center w-8 h-8 text-gray-400 transition-colors rounded-full top-4 right-4 hover:text-gray-600 hover:bg-gray-100"
            >
              <FaTimes className="w-4 h-4" />
            </button>

            <div className="pr-8 mb-6 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-500 to-pink-600">
                <IoWarningOutline className="w-8 h-8 text-white" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-800">
                Report this listing
              </h2>
              <p className="text-gray-600">
                Help us keep the platform safe and reliable
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-800">
                  Contact Information <span className="text-red-500">*</span>
                </h3>
                <div className="space-y-3 flex flex-col gap-3">
                  <Input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Your full name"
                    maxLength={100}
                    aria-required
                  />
                  <Input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Your phone number"
                    maxLength={20}
                    aria-required
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-800">
                  Reason for reporting <span className="text-red-500">*</span>
                </h3>
                <div className="space-y-2">
                  <Radio.Group
                    onChange={(e: RadioChangeEvent) =>
                      setReportReason(e.target.value)
                    }
                    value={reportReason}
                  >
                    {REPORT_REASONS.map((reason) => (
                      <div key={reason} className="p-2">
                        <Radio value={reason}>{reason}</Radio>
                      </div>
                    ))}
                  </Radio.Group>
                </div>
              </div>

              {/* Additional details only visible when 'Other reasons' is selected */}
              {reportReason === "Other reasons" && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-800">
                    Additional details <span className="text-red-500">*</span>
                  </h3>
                  <Input.TextArea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    rows={4}
                    placeholder="Provide more details about the issue..."
                  />
                </div>
              )}

              {/* reCAPTCHA verification checkbox */}
              {SITE_KEY && (
                <div className="mb-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="recaptcha-checkbox"
                        checked={isVerifiedHuman}
                        onChange={async (e) => {
                          if (e.target.checked && !isVerifiedHuman) {
                            await handleVerifyRecaptcha();
                          } else if (!e.target.checked) {
                            setIsVerifiedHuman(false);
                            setLastRecaptchaToken(null);
                            setLastRecaptchaVerifiedAt(null);
                            setReportStatus(null);
                          }
                        }}
                        disabled={verifySubmitting}
                        className="w-6 h-6 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      {verifySubmitting && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor="recaptcha-checkbox"
                      className={`text-sm font-medium cursor-pointer ${
                        verifySubmitting ? "text-gray-500" : "text-gray-700"
                      }`}
                    >
                      I&#39;m not a robot
                    </label>
                    <div className="ml-auto">
                      <div className="text-xs text-gray-500 flex flex-col items-end">
                        <span>reCAPTCHA</span>
                        <div className="flex gap-1 text-xs">
                          <a
                            href="https://policies.google.com/privacy"
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            Privacy
                          </a>
                          <span>-</span>
                          <a
                            href="https://policies.google.com/terms"
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            Terms
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* {lastRecaptchaScore !== null && (
                    <div className="mt-2 text-xs text-gray-600">
                      Score: {lastRecaptchaScore}
                    </div>
                  )} */}
                </div>
              )}

              {reportStatus && (
                <div className="mb-3 text-sm text-gray-700">{reportStatus}</div>
              )}

              <button
                onClick={handleSubmitReport}
                disabled={reportSubmitting || !isVerifiedHuman}
                className={`w-full ${
                  reportSubmitting || !isVerifiedHuman
                    ? "opacity-60 pointer-events-none"
                    : ""
                } cursor-pointer bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl`}
              >
                {reportSubmitting ? "Processing..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
