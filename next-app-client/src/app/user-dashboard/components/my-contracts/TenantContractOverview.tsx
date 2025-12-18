import React, { useState, useEffect } from "react";
import { Descriptions, Tag, Image } from "antd";
import { FileOutlined } from "@ant-design/icons";
import { ContractData } from "@/types/types";
import {
  formatCloudinaryUrl,
  formatCloudinaryThumbnail,
  resolveCloudinaryUrl,
} from "@/utils/cloudinaryUtils";

interface TenantContractOverviewProps {
  contract: ContractData;
  onContractUpdate?: (contract: ContractData) => void;
}

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: "Đang hiệu lực", color: "green" },
  1: { text: "Đã chấm dứt", color: "red" },
  2: { text: "Hết hạn", color: "orange" },
  3: { text: "Chờ duyệt", color: "blue" },
};

export default function TenantContractOverview({
  contract,
}: TenantContractOverviewProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [isPdfResolved, setIsPdfResolved] = useState<boolean>(false);

  // Resolve cloudinary URL (raw vs image) so links/thumbnails work when backend stores raw PDF paths
  useEffect(() => {
    let mounted = true;
    const doResolve = async () => {
      if (!contract.contractImage) {
        if (mounted) {
          setResolvedUrl(null);
          setIsPdfResolved(false);
        }
        return;
      }
      try {
        const url = await resolveCloudinaryUrl(contract.contractImage);
        if (!mounted) return;
        setResolvedUrl(url);
        setIsPdfResolved(!!url && /\.pdf($|\?)/i.test(url));
      } catch (e) {
        if (!mounted) return;
        // fallback to formatted URL
        const url = formatCloudinaryUrl(contract.contractImage);
        setResolvedUrl(url);
        setIsPdfResolved(!!url && /\.pdf($|\?)/i.test(url));
      }
    };
    void doResolve();
    return () => {
      mounted = false;
    };
  }, [contract.contractImage]);

  // Use resolvedUrl/isPdfResolved in UI
  const fileUrl =
    resolvedUrl ||
    (contract.contractImage
      ? formatCloudinaryUrl(contract.contractImage)
      : null);
  // Also check the original stored path/public id for .pdf since backend may store raw paths
  const rawPath = contract.contractImage || "";
  const isPdf =
    isPdfResolved ||
    (!!fileUrl && /\.pdf($|\?)/i.test(fileUrl)) ||
    /\.pdf($|\?)/i.test(rawPath);
  const isRaw =
    rawPath.includes("/raw/upload/") ||
    (!!resolvedUrl && resolvedUrl?.includes("/raw/upload/"));
  const isDocument = isPdf || isRaw;
  return (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Thông tin hợp đồng</h3>
        <p className="text-gray-600 text-sm">
          Xem chi tiết hợp đồng của bạn bên dưới
        </p>
      </div>

      <Descriptions bordered column={2} size="middle">
        <Descriptions.Item label="Tên hợp đồng">
          {contract.contractName}
        </Descriptions.Item>
        <Descriptions.Item label="Phòng">
          {contract.roomTitle}
        </Descriptions.Item>
        <Descriptions.Item label="Người thuê">
          {contract.tenantName}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          {contract.tenantPhone || "Chưa cung cấp"}
        </Descriptions.Item>
        <Descriptions.Item label="Chủ trọ">
          {contract.landlordName}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày bắt đầu">
          {new Date(contract.startDate).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày kết thúc">
          {new Date(contract.endDate).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="Tiền cọc">
          {contract.depositAmount?.toLocaleString("vi-VN")} đ
        </Descriptions.Item>
        <Descriptions.Item label="Tiền thuê hàng tháng">
          {contract.monthlyRent?.toLocaleString("vi-VN")} đ / tháng
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={statusMap[contract.status]?.color}>
            {statusMap[contract.status]?.text}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="File hợp đồng" span={2}>
          {contract.contractImage ? (
            <div className="flex flex-col gap-3">
              {/* File info - click to open in Google Docs Viewer */}
              <div className="flex items-center gap-3">
                <a
                  href={`https://docs.google.com/viewer?url=${encodeURIComponent(
                    fileUrl || ""
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[60px] h-[60px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  title="Nhấn để xem file"
                >
                  <FileOutlined
                    style={{ fontSize: "32px", color: "#2563eb" }}
                  />
                </a>

                <div className="flex-1">
                  <a
                    href={`https://docs.google.com/viewer?url=${encodeURIComponent(
                      fileUrl || ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    {(() => {
                      if (!fileUrl) return "file-hop-dong";
                      try {
                        const urlPath = new URL(fileUrl).pathname;
                        // const filename = decodeURIComponent(
                        //   urlPath.split("/").pop() || "file-hop-dong"
                        // );
                        const filename = "Hợp đồng thuê phòng";
                        return filename;
                      } catch {
                        return "file-hop-dong";
                      }
                    })()}
                  </a>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Nhấn để xem file ở tab mới
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <span className="text-gray-500">Không có file hợp đồng</span>
          )}
        </Descriptions.Item>
      </Descriptions>

      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
        <h4 className="font-semibold text-blue-800 mb-2">
          Thông tin quan trọng
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Vui lòng cập nhật thông tin hợp đồng khi có thay đổi</li>
          <li>• Liên hệ chủ trọ nếu cần chỉnh sửa hợp đồng</li>
          <li>• Thanh toán hóa đơn đúng hạn để duy trì hợp đồng</li>
          <li>• Báo ngay cho chủ trọ nếu có vấn đề về phòng</li>
        </ul>
      </div>
    </div>
  );
}
