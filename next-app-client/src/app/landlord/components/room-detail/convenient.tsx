import React from "react";
import { BsCheckCircleFill } from "react-icons/bs";

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
    <div className="mt-6">
      <h2 className="text-lg font-bold text-gray-800 mb-3 dark:text-white">
        Conveniences
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-6 text-[15px]">
        {convenientFeatures.map((feature) => (
          <div key={feature.label} className="flex items-center space-x-2">
            <span
              className={feature.enabled ? "text-green-600" : "text-gray-300"}
            >
              <BsCheckCircleFill />
            </span>
            <span
              className={
                feature.enabled
                  ? "text-black dark:!text-white"
                  : "text-gray-400 "
              }
            >
              {feature.displayName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
