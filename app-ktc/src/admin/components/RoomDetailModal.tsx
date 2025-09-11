import { useQuery } from "@tanstack/react-query";
import { Modal, Spin } from "antd";
import React from "react";
import Convenient from "./room-detail/Convenient";
import MapSection from "./room-detail/Map";
import { Slide } from "./room-detail/Slide";
import { getRoomByIdQueryOptions } from "../service/ReactQueryRoom";

interface RoomDetailModalProps {
  roomId?: string;
  open: boolean;
  onCancel: () => void;
}

const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  roomId,
  open,
  onCancel,
}) => {
  // const [room, setRoom] = useState<any | null>(null);
  // const [loading, setLoading] = useState(false);
  // useEffect(() => {
  //   if (open && roomId) {
  //     setLoading(true);
  //     getRoomById(roomId)
  //       .then((data) => setRoom(data))
  //       .catch(() => setRoom(null))
  //       .finally(() => setLoading(false));
  //   } else {
  //     setRoom(null);
  //   }
  // }, [roomId, open]);

  // const { data, isLoading } = useQuery(
  //   roomId
  //     ? getRoomByIdQueryOptions(roomId)
  //     : { queryKey: ["getRoomById", ""], enabled: false }
  // );

  const queryOptions = getRoomByIdQueryOptions(roomId || "");
  // Only add enabled if roomId exists, otherwise don't run query
  if (roomId) {
    queryOptions.enabled = true;
  } else {
    queryOptions.enabled = false;
  }
  const { data, isLoading } = useQuery(queryOptions);

  return (
    <Modal
      title={<span>Room Details</span>}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Spin />
        </div>
      ) : data ? (
        <div className="max-w-[900px] mx-auto my-2 bg-white dark:!bg-[#181f2b] rounded-xl shadow-lg p-2 dark:!text-white">
          {/* Images */}
          {data.images && data.images.length > 0 && (
            <div className="mb-2">
              <Slide
                images={data.images}
                address={[
                  data.address?.street,
                  data.address?.ward?.name,
                  data.address?.ward?.district?.name,
                  data.address?.ward?.district?.province?.name,
                ]
                  .filter(Boolean)
                  .join(", ")}
              />
            </div>
          )}
          <div className="mt-6 p-5 rounded-lg bg-[#f9f9f9] dark:!bg-[#232b3b] shadow-sm flex flex-col gap-4">
            <div className="flex items-center mb-2">
              <span className="text-white font-bold text-xl mr-2 bg-red-500 px-2 rounded">
                {data.typepost
                  ? data.typepost.charAt(0).toUpperCase() +
                    data.typepost.slice(1)
                  : ""}
              </span>
              <span className="text-[#e53935] font-semibold text-xl mr-2 dark:!text-[#ff6b6b]">
                {data.title || "Room for rent"}
              </span>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-lg font-bold text-green-700 dark:!text-green-400">
                {data.priceMonth
                  ? `${data.priceMonth.toLocaleString("vi-VN")} VND/month`
                  : ""}
              </span>
              <span className="text-base text-gray-500 dark:!text-gray-300">
                · {data.area ? `${data.area} m²` : ""}
              </span>
            </div>
            <div className="text-gray-700 dark:!text-gray-200 text-[15px] mb-1 flex justify-start">
              <span className="w-1/5">Ward</span>
              <span className="w-4/5 ml-1">
                {data.address?.ward?.name || ""}
              </span>
            </div>
            <div className="text-gray-700 dark:!text-gray-200 text-[15px] mb-1 flex justify-start">
              <span className="w-1/5">District:</span>
              <span className="w-4/5 ml-1">
                {data.address?.ward?.district?.name || ""}
              </span>
            </div>
            <div className="text-gray-700 dark:!text-gray-200 text-[15px] mb-1 flex justify-start">
              <span className="w-1/5">City/Province:</span>
              <span className="w-4/5 ml-1">
                {data.address?.ward?.district?.province?.name || ""}
              </span>
            </div>
            <div className="text-gray-700 dark:!text-gray-200 text-[15px] mb-1 flex justify-start">
              <span className="w-1/5">Address:</span>
              <span className="w-4/5 ml-1">{data.address?.street || ""}</span>
            </div>
            <div className="text-gray-700 dark:!text-gray-200 text-[15px] mb-1 flex justify-start">
              <span className="w-1/5">Post Start Date:</span>
              <span className="ml-1">
                {data.postStartDate
                  ? new Date(data.postStartDate).toLocaleString()
                  : ""}
              </span>
            </div>
            <div className="text-gray-700 dark:!text-gray-200 text-[15px] mb-1 flex justify-start">
              <span className="w-1/5">Post End Date:</span>
              <span className="ml-1">
                {data.postEndDate
                  ? new Date(data.postEndDate).toLocaleString()
                  : ""}
              </span>
            </div>
            <hr className="my-5 text-gray-300 dark:!text-gray-600" />
            <h2 className="mb-2 text-lg font-bold text-gray-800 dark:!text-white">
              Description
            </h2>
            <div className="list-disc pl-5 space-y-1 text-gray-700 dark:!text-gray-200 text-[15px]">
              {data.description ? (
                data.description
                  .split("\n")
                  .map((line: string, idx: number) => <p key={idx}>{line}</p>)
              ) : (
                <p>No description</p>
              )}
            </div>
            <div>
              <span className="font-semibold">Convenients:</span>
              <div className="flex gap-2 flex-wrap mt-1">
                {data.convenients && data.convenients.length > 0 ? (
                  <Convenient
                    features={data.convenients.map((c) => ({
                      id: String(c.id),
                      name: c.name,
                    }))}
                  />
                ) : (
                  "None"
                )}
              </div>
            </div>
            {/* Map Section */}
            {data.address && (
              <div className="mt-4">
                <MapSection
                  address={[
                    data.address?.street,
                    data.address?.ward?.name,
                    data.address?.ward?.district?.name,
                    data.address?.ward?.district?.province?.name,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>No data found.</div>
      )}
    </Modal>
  );
};

export default RoomDetailModal;
