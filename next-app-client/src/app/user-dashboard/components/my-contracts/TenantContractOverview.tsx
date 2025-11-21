import React, { useState, useEffect } from "react";
import { Descriptions, Tag, Image } from "antd";
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
            <div className="flex items-center gap-2">
              {isDocument ? (
                // Render a small document preview (PDF/raw) with a single Download File action
                <div className="flex items-center gap-3">
                  <div className="w-[150px] h-[100px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
                    {/* Always show PDF/document icon for raw files (avoid confusion with images) */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#e53935"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <path d="M14 2v6h6"></path>
                      <text
                        x="6"
                        y="17"
                        fill="#e53935"
                        fontSize="8"
                        fontWeight="700"
                      >
                        PDF
                      </text>
                    </svg>
                  </div>

                  <div className="flex flex-col">
                    <div className="text-sm text-gray-800 dark:text-gray-200 mb-2">
                      {fileUrl
                        ? decodeURIComponent(
                            new URL(fileUrl).pathname.split("/").pop() ||
                              "file.pdf"
                          )
                        : "file.pdf"}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Only one action: Download File - this avoids confusing users */}
                      <a
                        href={fileUrl || "#"}
                        download
                        className="inline-block bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Download File
                      </a>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      This is a document file. Use Download to get the file.
                    </div>
                  </div>
                </div>
              ) : (
                // Existing image rendering for non-PDF files
                <div className="flex items-center gap-2">
                  <Image
                    src={
                      formatCloudinaryThumbnail(
                        resolvedUrl || contract.contractImage,
                        150,
                        100
                      ) || undefined
                    }
                    alt="Contract File"
                    width={150}
                    height={100}
                    style={{ objectFit: "cover", borderRadius: "4px" }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dm3jaMgAAAABwSURBVHhe7cHBDQAACAwCoNGPAnOwQBE8tATFHIAAAABwSURBVHhe7cHBDQAACAwCoNGPAnOwQBE8tATFHIAAAABwSURBVHhe7cHBDQAACAwCoNGPAnOwQBE8tATFHI="
                  />
                  <a
                    href={fileUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    View Full Image
                  </a>
                </div>
              )}
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
