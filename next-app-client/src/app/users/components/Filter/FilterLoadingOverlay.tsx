"use client";

interface FilterLoadingOverlayProps {
  isVisible: boolean;
  children: React.ReactNode;
}

export default function FilterLoadingOverlay({
  isVisible,
  children,
}: FilterLoadingOverlayProps) {
  return (
    <div className="relative">
      {children}

      {isVisible && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10 transition-all duration-300">
          <div className="flex flex-col items-center gap-3">
            {/* Animated loading rings */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-gray-200/60"></div>
              <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent absolute top-0 left-0 animate-spin"></div>
              <div
                className="w-8 h-8 rounded-full border-2 border-orange-400 border-r-transparent absolute top-2 left-2 animate-spin animate-reverse"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "1.5s",
                }}
              ></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full animate-pulse"></div>
            </div>

            {/* Text with gradient */}
            <div className="text-center">
              <h3 className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                Filtering Results...
              </h3>
              <p className="text-xs text-gray-500 mt-1 animate-pulse">
                Please wait a moment
              </p>
            </div>

            {/* Animated dots */}
            <div className="flex gap-1">
              <div
                className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
