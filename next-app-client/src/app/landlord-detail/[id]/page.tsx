"use client";
import { useState, useEffect } from 'react';
// import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { LandlordDetail, RoomListing } from '@/app/landlord/types';
import { landlordService } from '@/services/LandlordService';
import { MdVerified, MdPhone, MdEmail } from 'react-icons/md';
import { BiShield } from 'react-icons/bi';
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import ChatClient from '@/app/components/chat/ChatClient';
import { useParams, useRouter } from 'next/navigation';

const getAvatarSrc = (avatar?: string) => {
  if (!avatar || avatar.trim() === '' || avatar === 'null') {
    return "/images/default/avatar.jpg";
  }
  if (avatar.startsWith('/dmvvs0ags/')) {
    return `https://res.cloudinary.com${avatar}`;
  }
  if (avatar.startsWith('http')) {
    return avatar;
  }
  return "/images/default/avatar.jpg";
};

export default function LandlordDetailPage() {
  const params = useParams();
  const landlordId = params?.id as string;
    // const router = useRouter();
  
  const [landlord, setLandlord] = useState<LandlordDetail | null>(null);
  const [rooms, setRooms] = useState<RoomListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const { data: session } = useSession();

  // const handleViewRoom = (roomId: string) => {
  //   router.push(`/detail/${roomId}`);
  // };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [landlordData, roomsData] = await Promise.all([
          landlordService.getLandlordById(landlordId),
          landlordService.getLandlordRooms(landlordId)
        ]);
        
        setLandlord(landlordData);
        setRooms(roomsData.content);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    if (landlordId) {
      fetchData();
    }
  }, [landlordId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-32 h-32 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!landlord) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Landlord không tồn tại</h1>
          <Link href="/users" className="inline-block mt-4 text-blue-600 hover:underline">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/users" className="inline-block mb-4 text-blue-600 hover:underline">
            ← Quay lại trang chính
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Left Sidebar - Landlord Info Card */}
          <div className="lg:col-span-1">
            <div className="sticky overflow-hidden transition-all duration-500 bg-white border border-gray-100 shadow-xl rounded-2xl top-8">
              {/* Header with gradient background */}
              <div className="relative p-6 text-white bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
                {/* Background decorations */}
                <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-white/10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 -mb-12 -ml-12 rounded-full bg-white/10"></div>

                <div className="relative flex flex-col items-center">
                  {/* Avatar */}
                  <div className="relative mb-4">
                    <div className="relative">
                      <Image
                        src={getAvatarSrc(landlord.avatar)}
                        alt={`${landlord.fullName}'s avatar`}
                        width={96}
                        height={96}
                        className="object-cover border-4 shadow-xl rounded-2xl border-white/30 backdrop-blur-sm"
                        priority
                      />
                      {/* Online status indicator */}
                      <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-lg">
                        <div className="flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <h2 className="text-xl font-bold text-white">
                        {landlord.fullName}
                      </h2>
                      <span className="text-yellow-300">👑</span>
                    </div>

                    {/* Email - directly below name, no box */}
                    {landlord.email && (
                      <p className="text-sm text-white/80 mb-3 truncate max-w-[200px]">
                        {landlord.email}
                      </p>
                    )}

                    {/* Online Status */}
                    <div className="flex items-center justify-center gap-2 px-3 py-1 border rounded-full backdrop-blur-sm bg-green-400/20 border-green-300/30">
                      <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                      <p className="text-xs font-medium text-green-100">
                        Online now
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
                        <span className="text-yellow-500">⭐</span>
                        <p className="text-lg font-bold text-gray-800">
                          {landlord.totalListings}
                        </p>
                      </div>
                      <p className="text-xs font-medium text-gray-600">Listings</p>
                    </div>

                    <div className="w-px h-8 bg-gray-200"></div>

                    <div className="flex-1 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <span className="text-blue-500">👤</span>
                        <p className="text-sm font-bold text-gray-800">Member</p>
                      </div>
                      <p className="text-xs font-medium text-gray-600">
                        Since {new Date(landlord.memberSince).getFullYear()}
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

                {/* Action Buttons - like UserInfoCard */}
                <div className="space-y-3">
                  {/* Contact Button */}
                  
                  {landlord.phoneNumber && (
    <Link
      href={`tel:${landlord.phoneNumber}`}
      className="group relative w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3 overflow-hidden"
    >
      <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-green-600 to-emerald-700 group-hover:opacity-100"></div>
      <div className="relative flex items-center gap-3">
        <MdPhone className="w-5 h-5" />
        <span className="font-semibold">
          {landlord.phoneNumber}
        </span>
      </div>
    </Link>
  )}

                  {/* Chat Button */}
                  <button
                    onClick={() => {
                      if (!session?.user?.id) {
                        redirect("/auth/login");
                        return;
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
          </div>

          {/* Right Content - Room Listings */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Tất cả bài đăng ({rooms.length})
              </h2>
              <div className="flex space-x-2">
                {/* <button className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg">
                  Tin bán (0)
                </button> */}
                <button className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg">
                  Tin đăng ({rooms.length})
                </button>
              </div>
            </div>

            {/* Room Grid */}
            {rooms.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {rooms.map((room) => (
                  <div key={room.id} className="overflow-hidden transition-all duration-300 bg-white shadow-lg cursor-pointer rounded-2xl hover:shadow-xl group">
                    <div className="relative h-48">
                      {room.imageUrl ? (
                        <Image
                          src={`https://res.cloudinary.com${room.imageUrl}`}
                          alt={room.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-200 to-gray-300">
                          <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      
                      {/* <div className="absolute px-2 py-1 text-xs font-medium rounded-lg top-3 right-3 bg-white/90 backdrop-blur-sm">
                        📷 {room.imageUrl ? '1+' : '0'}
                      </div> */}
                    </div>

                    <div className="p-5">
                      <h3 className="mb-2 font-bold text-gray-900 transition-colors line-clamp-2 group-hover:text-blue-600">
                        {room.title}
                      </h3>
                      
                      <div className="mb-2 text-lg font-bold text-red-600">
                        {room.price.toLocaleString('vi-VN')}đ/tháng
                        <span className="ml-2 text-sm font-normal text-gray-500">• {room.area}m²</span>
                      </div>

                      <div className="flex items-center mb-3 text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="line-clamp-1">{room.address}</span>
                      </div>
                      {/* <div className="flex gap-2">
              <button
                onClick={() => handleViewRoom(room.id)} 
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 shadow-orange-500/25"
              >
                View room
              </button>
            </div> */}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Chưa có tin đăng</h3>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Modal - like UserInfoCard */}
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
    </div>
  );
}




