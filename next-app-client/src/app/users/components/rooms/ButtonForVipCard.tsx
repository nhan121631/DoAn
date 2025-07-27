import React from "react";
import { FaHeart } from "react-icons/fa6";

interface ButtonFavoriteProps {
  onClick?: () => void;
  isFavorite?: boolean;
}

export function ButtonForVipCard({ onClick, isFavorite }: ButtonFavoriteProps) {
  return (
    <button
      aria-label="Favorite"
      className={`transition-colors ${
        isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500"
      }`}
      onClick={onClick}
      type="button"
    >
      <FaHeart size={22} />
    </button>
  );
};

