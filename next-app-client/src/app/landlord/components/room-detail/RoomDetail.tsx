import { Slide } from "./Slide";
import Convenient from "./convenient";
import MapSection from "./map";

export default function RoomDetail() {
  const images = [
    { id: 1, url: "/images/anh1.jpg" },
    { id: 2, url: "/images/anh2.jpg" },
    { id: 3, url: "/images/anh3.jpg" },
    { id: 4, url: "/images/anh4.jpg" },
    { id: 5, url: "/images/anh5.jpg" },
  ];

  return (
    <div className="max-w-[900px] mx-auto my-8 bg-white dark:bg-[#181f2b] rounded-xl shadow-lg p-6 dark:text-white">
      {/* Image slider */}
      <div className="p-4 bg-white dark:bg-[#232b3b] rounded-lg">
        <Slide images={images} />
      </div>

      {/* Room Info Card */}
      <div className="mt-6 p-5 rounded-lg bg-[#f9f9f9] dark:bg-[#232b3b] shadow-sm flex flex-col gap-4">
        <div className="flex items-center mb-2">
          <span className="text-[#e53935] font-bold text-xl mr-2 dark:text-[#ff6b6b]">
            Newly built, clean, airy room for rent, only 3.6M/month
          </span>
        </div>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-green-700 dark:text-green-400 font-bold text-lg">
            3.8 million/month
          </span>
          <span className="text-gray-500 dark:text-gray-300 text-base">
            · 20 m²
          </span>
        </div>
        <div className="text-gray-700 dark:text-gray-200 text-[15px] mb-1 flex justify-start">
          <span className="w-1/5">Ward</span>
          <a
            href="#"
            className="text-blue-600 dark:text-blue-400 underline ml-1 w-4/5"
          >
            Go Vap District
          </a>
        </div>
        <div className="text-gray-700 dark:text-gray-200 text-[15px] mb-1 flex justify-start">
          <span className="w-1/5">City/Province:</span>
          <a
            href="#"
            className="text-blue-600 dark:text-blue-400 underline ml-1 w-4/5"
          >
            Ho Chi Minh City
          </a>
        </div>
        <div className="text-gray-700 dark:text-gray-200 text-[15px] mb-1 flex justify-start">
          <span className="w-1/5">Address:</span>
          <span className="ml-1 w-4/5">
            171/14/18 Duong Nguyen Tu Gian, Ward 12, Go Vap District
          </span>
        </div>
        <div className="text-gray-700 dark:text-gray-200 text-[15px] mb-1 flex justify-start">
          <span className="w-1/5">Ngày đăng:</span>
          <span className="ml-1">Sunday, 13:42 20/07/2025</span>
        </div>
        <div className="text-gray-700 dark:text-gray-200 text-[15px] mb-1 flex justify-start">
          <span className="w-1/5">Hết hạn:</span>
          <span className="ml-1">Wednesday, 13:42 30/07/2025</span>
        </div>
        <div className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          Updated: 1 hour ago
        </div>

        <hr className="my-5 text-gray-300 dark:text-gray-600" />

        <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">
          Description
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-200 text-[15px]">
          <li>
            Brand new, clean room with full furniture, balcony, and window.
          </li>
          <li>Only 3.5M/room (2-3 people).</li>
          <li>
            Electricity: 3,800 VND/kWh, Water: 100,000 VND/person/month, Service
            fee: 200,000 VND/room (3rd person +50,000 VND).
          </li>
          <li>
            Great location near Emart, market, all amenities, wide alley for
            trucks, absolutely secure area.
          </li>
          <li>
            Fully furnished: balcony, window, mezzanine, fan, air conditioner,
            fridge, sofa, desk, shoe rack, bookshelf, wardrobe, shared washing
            machine, drying yard, kitchen, parking.
          </li>
          <li>Clean, airy space – free cleaning service included.</li>
          <li>
            24/7 camera, fingerprint lock, flexible hours, no landlord living on
            site, absolute security.
          </li>
          <li>Address: 171/14/18 Nguyen Tu Gian, Ward 12, Go Vap</li>
          <li>Contact: 0906.646.585 (Thao)</li>
        </ul>

        <Convenient />
        <hr className="my-5 text-gray-300" />
        <MapSection />
      </div>
    </div>
  );
}
