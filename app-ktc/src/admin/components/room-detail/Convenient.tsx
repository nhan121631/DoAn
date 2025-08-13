import { BsCheckCircleFill } from "react-icons/bs";

const convenients = [
  { label: "furnished", enabled: false },
  { label: "washing_machine", enabled: false },
  { label: "no_curfew", enabled: false },
  { label: "mezzanine", enabled: false },
  { label: "fridge", enabled: false },
  { label: "kitchen_shelf", enabled: false },
  { label: "aircon", enabled: false },
  { label: "private_entry", enabled: false },
  { label: "elevator", enabled: false },
  { label: "security_24h", enabled: false },
  { label: "garage", enabled: false },
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
    enabled: featureMap.has(feature.label),
  }));
  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-gray-800 mb-3 dark:!text-white">
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
              {feature.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
