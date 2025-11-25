"use client";
import React, { useState, useEffect } from "react";
import LandlordCard from "./LandlordCard";
import { landlordService } from "@/services/LandlordService"; 
import { PageResponse } from "@/types/types";
import { LandLordInfo } from "@/app/landlord/types";

export default function LandlordListCard() {
  const [landlords, setLandlords] = useState<LandLordInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<PageResponse<LandLordInfo> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);  
  const pageSize = 6;

  useEffect(() => {
    fetchLandlords(currentPage);
  }, [currentPage]);

  const fetchLandlords = async (page: number) => {  
    try {
      setLoading(true);
      const response = await landlordService.getAllLandlords(page, pageSize);
      setLandlords(response.content);
      setPageData(response);
    } catch (err) {
      setError('Failed to load landlords');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousPage = () => {
    if (pageData?.hasPrevious) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (pageData?.hasNext) {
      setCurrentPage(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-white">
        <div className="relative px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading landlords...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-white">
        <div className="relative px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => fetchLandlords(currentPage)}
              className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="landlords"
      className="relative overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-white"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-100/30 blur-3xl translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 rounded-full w-80 h-80 bg-purple-100/20 blur-3xl -translate-x-1/3 translate-y-1/3"></div>

      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <div className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
            👥 Our Partners
          </div>

          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Trusted
            <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
              {" "}
              Landlords
            </span>
          </h2>

          <p className="text-lg leading-relaxed text-gray-600">
            Connect with verified property owners who provide quality
            accommodations and exceptional service across Vietnam
          </p>
        </div>

        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={goToPreviousPage}
            disabled={!pageData?.hasPrevious}
            className={`absolute left-0 top-1/2 z-10 -translate-x-20 -translate-y-1/2 rounded-full p-3 shadow-lg transition-all duration-300 ${
              pageData?.hasPrevious
                ? 'bg-white hover:bg-blue-50 hover:shadow-xl text-gray-700 hover:text-blue-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={goToNextPage}
            disabled={!pageData?.hasNext}
            className={`absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-20 rounded-full p-3 shadow-lg transition-all duration-300 ${
              pageData?.hasNext
                ? 'bg-white hover:bg-blue-50 hover:shadow-xl text-gray-700 hover:text-blue-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Landlords Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {landlords.map((landlord, index) => (
              <div
                key={landlord.id}
                className="transition-all duration-500 transform hover:-translate-y-2"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <LandlordCard landlord={landlord} />
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Info */}
        <div className="flex justify-center mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-full shadow-sm">
            <span>
              Page {(pageData?.page || 0) + 1} of {pageData?.totalPages || 1}
            </span>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span>
              {pageData?.totalElements || 0} landlords total
            </span>
          </div>
        </div>

        {/* Bottom Stats Section  */}
        <div className="pt-12 mt-20 border-t border-gray-200/50">
          <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">
                {pageData?.totalElements || 0}+
              </div>
              <div className="text-sm font-medium text-gray-600">
                Verified Landlords
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-600">10K+</div>
              <div className="text-sm font-medium text-gray-600">
                Available Properties
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-600">98%</div>
              <div className="text-sm font-medium text-gray-600">
                Customer Satisfaction
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section  */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 text-sm text-gray-500 border rounded-full shadow-sm bg-white/70 backdrop-blur-sm border-gray-200/50">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            All landlords are verified and background-checked
          </div>
        </div>
      </div>
    </section>
  );
}