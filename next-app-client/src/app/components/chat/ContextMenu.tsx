"use client";

import { useEffect, useRef } from "react";
import Portal from "../common/Portal";
import { Popconfirm } from "antd";

interface ContextMenuProps {
  x: number;
  y: number;
  onDelete: () => void;
  onClose: () => void;
  isVisible: boolean;
}

export default function ContextMenu({
  x,
  y,
  onDelete,
  onClose,
  isVisible,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  // Adjust position to ensure menu stays within viewport
  const adjustedX = Math.min(x, window.innerWidth - 150);
  const adjustedY = Math.min(y, window.innerHeight - 80);

  return (
    <Portal>
      <div
        ref={menuRef}
        className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl py-1 min-w-[120px]"
        style={{
          left: Math.max(0, adjustedX),
          top: Math.max(0, adjustedY),
        }}
      >
        <Popconfirm
          title="Bạn có chắc muốn xóa không?"
          description="Hành động này không thể hoàn tác."
          onConfirm={onDelete}
          onCancel={onClose}
          okText="Có"
          cancelText="Không"
        >
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete this message
          </button>
        </Popconfirm>
      </div>
    </Portal>
  );
}
