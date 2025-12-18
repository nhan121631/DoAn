// import Convenient from "../landlord/components/room-detail/convenient";
import MapSection from "../landlord/components/room-detail/map";
// import { Slide } from "../landlord/components/room-detail/Slide";

export default function DetailPage() {
  // const images = [
  //   { id: 1, url: "/images/anh1.jpg" },
  //   { id: 2, url: "/images/anh2.jpg" },
  //   { id: 3, url: "/images/anh3.jpg" },
  //   { id: 4, url: "/images/anh4.jpg" },
  //   { id: 5, url: "/images/anh5.jpg" },
  // ];

  return (
    <div className="max-w-[900px] mx-auto my-8 bg-white rounded-xl shadow-lg p-6">
      {/* Image slider */}
      {/* <div className="p-4 bg-white rounded-lg">
        <Slide images={images} />
      </div> */}

      {/* Room Info Card */}
      <div className="mt-6 p-5 rounded-lg bg-[#f9f9f9] shadow-sm flex flex-col gap-4">
        <div className="flex items-center mb-2">
          <span className="text-[#e53935] font-bold text-xl mr-2">
            Phòng mới xây, sạch sẽ, thoáng mát cho thuê, chỉ 3.6 triệu/tháng
          </span>
        </div>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-lg font-bold text-green-700">
            3.8 triệu/tháng
          </span>
          <span className="text-base text-gray-500">· 20 m²</span>
        </div>
        <div className="text-gray-700 text-[15px] mb-1 flex justify-start">
          <span className="w-1/5">Phường</span>
          <a href="#" className="w-4/5 ml-1 text-blue-600 underline">
            Quận Gò Vấp
          </a>
        </div>
        <div className="text-gray-700 text-[15px] mb-1 flex justify-start">
          <span className="w-1/5">Tỉnh/Thành phố:</span>
          <a href="#" className="w-4/5 ml-1 text-blue-600 underline">
            TP. Hồ Chí Minh
          </a>
        </div>
        <div className="text-gray-700 text-[15px] mb-1 flex justify-start">
          <span className="w-1/5">Địa chỉ:</span>
          <span className="w-4/5 ml-1">
            171/14/18 Đường Nguyễn Tư Giản, Phường 12, Quận Gò Vấp
          </span>
        </div>
        <div className="text-gray-700 text-[15px] mb-1 flex justify-start">
          <span className="w-1/5">Ngày đăng:</span>
          <span className="ml-1">Chủ nhật, 13:42 20/07/2025</span>
        </div>
        <div className="text-gray-700 text-[15px] mb-1 flex justify-start">
          <span className="w-1/5">Hết hạn:</span>
          <span className="ml-1">Thứ tư, 13:42 30/07/2025</span>
        </div>
        <div className="mt-2 text-sm text-gray-500">Cập nhật: 1 giờ trước</div>

        <hr className="my-5 text-gray-300" />

        <h2 className="mb-2 text-lg font-bold text-gray-800">Mô tả</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-700 text-[15px]">
          <li>Phòng mới xây, sạch sẽ, đầy đủ nội thất, có ban công, cửa sổ.</li>
          <li>Chỉ 3.5 triệu/phòng (2-3 người).</li>
          <li>
            Điện: 3.800đ/kWh, Nước: 100.000đ/người/tháng, Phí dịch vụ:
            200.000đ/phòng (người thứ 3 +50.000đ).
          </li>
          <li>
            Vị trí thuận tiện gần Emart, chợ, đầy đủ tiện ích, hẻm xe tải, khu
            vực an ninh tuyệt đối.
          </li>
          <li>
            Đầy đủ nội thất: ban công, cửa sổ, gác lửng, quạt, máy lạnh, tủ
            lạnh, sofa, bàn làm việc, kệ giày, kệ sách, tủ quần áo, máy giặt
            chung, sân phơi, bếp, chỗ để xe.
          </li>
          <li>Không gian sạch sẽ, thoáng mát – miễn phí dọn vệ sinh.</li>
          <li>
            Camera 24/7, khóa vân tay, giờ giấc tự do, không chung chủ, an ninh
            tuyệt đối.
          </li>
          <li>Địa chỉ: 171/14/18 Nguyễn Tư Giản, Phường 12, Gò Vấp</li>
          <li>Liên hệ: 0906.646.585 (Thảo)</li>
        </ul>

        {/* <Convenient /> */}
        <hr className="my-5 text-gray-300" />
        <MapSection address="90 Nguyen Thuc Tu, Hoa Hai, Ngu Hanh Son, Da Nang" />
      </div>
    </div>
  );
}
