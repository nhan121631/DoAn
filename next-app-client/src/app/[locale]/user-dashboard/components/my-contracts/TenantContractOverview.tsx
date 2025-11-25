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
  0: { text: "Active", color: "green" },
  1: { text: "Terminated", color: "red" },
  2: { text: "Expired", color: "orange" },
  3: { text: "Pending", color: "blue" },
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
        <h3 className="text-lg font-semibold">Contract Information</h3>
        <p className="text-gray-600 text-sm">
          View your contract details below
        </p>
      </div>

      <Descriptions bordered column={2} size="middle">
        <Descriptions.Item label="Contract Name">
          {contract.contractName}
        </Descriptions.Item>
        <Descriptions.Item label="Room">{contract.roomTitle}</Descriptions.Item>
        <Descriptions.Item label="Tenant">
          {contract.tenantName}
        </Descriptions.Item>
        <Descriptions.Item label="Phone">
          {contract.tenantPhone || "Not provided"}
        </Descriptions.Item>
        <Descriptions.Item label="Landlord">
          {contract.landlordName}
        </Descriptions.Item>
        <Descriptions.Item label="Start Date">
          {new Date(contract.startDate).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="End Date">
          {new Date(contract.endDate).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="Deposit">
          {contract.depositAmount?.toLocaleString("vi-VN")} đ
        </Descriptions.Item>
        <Descriptions.Item label="Monthly Rent">
          {contract.monthlyRent?.toLocaleString("vi-VN")} đ / month
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={statusMap[contract.status]?.color}>
            {statusMap[contract.status]?.text}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Contract File" span={2}>
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
                  title="Click to view file"
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
                      if (!fileUrl) return "contract-file";
                      try {
                        const urlPath = new URL(fileUrl).pathname;
                        let filename = decodeURIComponent(
                          urlPath.split("/").pop() || "contract-file"
                        );
                        return filename;
                      } catch {
                        return "contract-file";
                      }
                    })()}
                  </a>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Click to view file in new tab
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <span className="text-gray-500">No contract file available</span>
          )}
        </Descriptions.Item>
      </Descriptions>

      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
        <h4 className="font-semibold text-blue-800 mb-2">
          Important Information
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Please keep your contract information updated</li>
          <li>• Contact your landlord for any changes needed</li>
          <li>• Pay your bills on time to maintain good standing</li>
          <li>• Report any issues with the property promptly</li>
        </ul>
      </div>
    </div>
  );
}
