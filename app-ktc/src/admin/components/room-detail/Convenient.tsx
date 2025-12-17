import { BsCheckCircleFill } from "react-icons/bs";

const convenients = [
  { key: "furnished", label: "Đầy đủ nội thất", enabled: false },
  { key: "washing_machine", label: "Máy giặt", enabled: false },
  { key: "no_curfew", label: "Không giới nghiêm", enabled: false },
  { key: "mezzanine", label: "Gác lửng", enabled: false },
  { key: "fridge", label: "Tủ lạnh", enabled: false },
  { key: "kitchen_shelf", label: "Kệ bếp", enabled: false },
  { key: "aircon", label: "Điều hòa", enabled: false },
  { key: "private_entry", label: "Lối vào riêng", enabled: false },
  { key: "elevator", label: "Thang máy", enabled: false },
  { key: "security_24h", label: "An ninh 24/7", enabled: false },
  { key: "garage", label: "Gara", enabled: false },
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
    enabled: featureMap.has(feature.key),
  }));
  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-gray-800 mb-3 dark:!text-white">
        Tiện nghi nổi bật
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
              {feature.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
