"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export default function LoadingSpinner({
  size = "md",
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClasses[size]} relative`}>
        {/* Main spinner */}
        <div
          className={`${sizeClasses[size]} rounded-full border-2 border-gray-200/60`}
        ></div>
        <div
          className={`${sizeClasses[size]} rounded-full border-2 border-blue-500 border-t-transparent absolute top-0 left-0 animate-spin`}
        ></div>

        {/* Inner pulse */}
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-blue-500 rounded-full animate-pulse`}
        ></div>
      </div>

      {text && (
        <span
          className={`${textSizeClasses[size]} text-gray-600 animate-pulse`}
        >
          {text}
        </span>
      )}
    </div>
  );
}
