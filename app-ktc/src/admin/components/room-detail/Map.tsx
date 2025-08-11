import { FaMapMarkerAlt } from "react-icons/fa";

export default function MapSection({ address }: { address: string }) {
  const encodedAddress = encodeURIComponent(address);

  return (
    <div className="mt-8">
      <h2 className="mb-2 text-lg font-bold text-gray-800 dark:!text-white">
        Location on Map
      </h2>
      <div className="text-sm text-gray-700 mb-2 flex items-center dark:!text-gray-300">
        <FaMapMarkerAlt className="mr-2 text-red-500" />
        <span>{address}</span>
      </div>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mb-4 text-sm text-blue-600 underline"
      >
        View larger map
      </a>
      <div className="w-full h-[350px]">
        <iframe
          src={`https://www.google.com/maps?q=${encodedAddress}&output=embed`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
}
