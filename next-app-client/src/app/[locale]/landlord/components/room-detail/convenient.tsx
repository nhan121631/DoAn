import React from "react";
import { BsCheckCircleFill, BsXCircleFill } from "react-icons/bs";

const convenients = [
  { label: "furnished", displayName: "Fully Furnished", enabled: false },
  { label: "washing_machine", displayName: "Washing Machine", enabled: false },
  { label: "no_curfew", displayName: "No Curfew", enabled: false },
  { label: "mezzanine", displayName: "Mezzanine/Loft", enabled: false },
  { label: "fridge", displayName: "Refrigerator", enabled: false },
  { label: "kitchen_shelf", displayName: "Kitchen Cabinet", enabled: false },
  { label: "aircon", displayName: "Air Conditioning", enabled: false },
  { label: "private_entry", displayName: "Private Entrance", enabled: false },
  { label: "elevator", displayName: "Elevator", enabled: false },
  { label: "security_24h", displayName: "24/7 Security", enabled: false },
  { label: "garage", displayName: "Parking/Garage", enabled: false },
];

interface Feature {
  id: string;
  name: string;
}

interface ConvenientProps {
  features: Feature[];
}

export default function Convenient({ features }: ConvenientProps) {
  const featureMap = new Map(features.map((f) => [f.name, f]));
  const convenientFeatures = convenients.map((feature) => ({
    label: feature.label,
    displayName: feature.displayName,
    enabled: featureMap.has(feature.label),
  }));

  return (
    <div className="mb-8">
      <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-800 dark:text-white">
        <BsCheckCircleFill className="w-5 h-5 text-blue-600" />
        Conveniences
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {convenientFeatures.map((feature) => (
          <div
            key={feature.label}
            className={`flex items-center gap-2.5 p-3.5 rounded-lg border transition-all duration-200 ${
              feature.enabled
                ? "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800 shadow-sm"
                : "bg-gray-50 border-gray-200 dark:bg-gray-800/30 dark:border-gray-700 opacity-40"
            }`}
          >
            <span
              className={`flex-shrink-0 ${
                feature.enabled
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-400 dark:text-gray-600"
              }`}
            >
              {feature.enabled ? (
                <BsCheckCircleFill className="w-4 h-4" />
              ) : (
                <BsXCircleFill className="w-4 h-4" />
              )}
            </span>
            <span
              className={`text-sm font-medium ${
                feature.enabled
                  ? "text-gray-800 dark:text-gray-200"
                  : "text-gray-500 dark:text-gray-600"
              }`}
            >
              {feature.displayName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
