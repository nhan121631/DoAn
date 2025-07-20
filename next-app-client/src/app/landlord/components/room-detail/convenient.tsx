import React from "react";
import { BsCheckCircleFill } from "react-icons/bs";

const features = [
  { label: "Đầy đủ nội thất", enabled: true },
  { label: "Có máy giặt", enabled: true },
  { label: "Giờ giấc tự do", enabled: true },
  { label: "Có gác", enabled: true },
  { label: "Có tủ lạnh", enabled: true },
  { label: "Có kệ bếp", enabled: true },
  { label: "Có máy lạnh", enabled: true },
  { label: "Không chung chủ", enabled: true },
  { label: "Có thang máy", enabled: false },
  { label: "Có bảo vệ 24/24", enabled: false },
  { label: "Có hầm để xe", enabled: false },
];

export default function Convenient() {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-gray-800 mb-3 dark:text-white">Nổi bật</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-6 text-[15px]">
        {features.map((feature) => (
          <div key={feature.label} className="flex items-center space-x-2">
            <span
              className={feature.enabled ? "text-green-600" : "text-gray-300"}
            >
              <BsCheckCircleFill />
            </span>
            <span className={feature.enabled ? "text-black dark:!text-white" : "text-gray-400 "}>
              {feature.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
