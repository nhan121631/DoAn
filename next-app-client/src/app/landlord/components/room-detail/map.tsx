import { FaMapMarkerAlt } from "react-icons/fa";

export default function MapSection() {
  const address = "90 Nguyễn Thức Tự Hòa Hải Ngũ Hành Sơn Đà Nẵng";
  const encodedAddress = encodeURIComponent(address);

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-gray-800 mb-2 dark:text-white">Vị trí & bản đồ</h2>
      <div className="text-sm text-gray-700 mb-2 flex items-center dark:!text-gray-300">
        <FaMapMarkerAlt className="text-red-500 mr-2" />
        <span >{address}</span>
      </div>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 text-sm underline mb-4 inline-block"
      >
        Xem bản đồ lớn
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
