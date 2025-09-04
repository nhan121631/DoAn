"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { LandlordDetail, RoomListing } from '@/app/landlord/types';
import { landlordService } from '@/services/LandlordService';
import { useSession } from 'next-auth/react';
import ChatClient from '@/app/components/chat/ChatClient';
import LandlordInfoCard from '../components/LandlordInfoCard';
// import RoomGrid from '../components/RoomGrid';
import CardRoom from '@/app/landlord-detail/components/CardRoom';

export default function LandlordDetailPage() {
  const params = useParams();
  const landlordId = params?.id as string;
  
  const [landlord, setLandlord] = useState<LandlordDetail | null>(null);
  const [rooms, setRooms] = useState<RoomListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const { data: session } = useSession();

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
    <div className="min-h-screen py-8 bg-gray-50" >
      <div className="px-4 mx-auto max-w-7xl">
        {/* Header */}
        {/* <div className="mb-8">
          <Link href="/users" className="inline-block mb-4 text-blue-600 hover:underline">
            ← Quay lại trang chính
          </Link>
        </div> */}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Left Sidebar - Landlord Info Card */}
          <div className="lg:col-span-1">
            <LandlordInfoCard 
              landlord={landlord} 
              onStartChat={() => setShowChat(true)} 
            />
          </div>

          {/* Right Content - Room Listings */}
          <div className="lg:col-span-3">
            <CardRoom rooms={rooms} />
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
    </div>
  );
}

