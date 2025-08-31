/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getDistricts,
  getProvinces,
  getWards,
} from "@/services/AddressService";
import { getConvenients } from "@/services/Convenients";
import { isHaveBankAccount } from "@/services/ProfileService";
import { createRoom } from "@/services/RoomService";
import { getPostTypes } from "@/services/TypePostService";
import { Convenient, District, Province, TypePost, Ward } from "@/types/types";
import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Upload,
  AutoComplete,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import { RoomData } from "../../types";
import API from "@/services/UploadChunk";

type ProvinceOption = {
  label: string;
  value: string;
};
const initialDistricts: ProvinceOption[] = [];
const initialWards: ProvinceOption[] = [];

// Types and interfaces
interface ChunkInfo {
  index: number;
  blob: Blob;
  start: number;
  end: number;
}

interface SliceResult {
  chunks: ChunkInfo[];
  totalChunks: number;
}

interface UploadProgress {
  uploadedBytes: number;
  totalBytes: number;
  percent: number;
}

interface HashProgress {
  isCalculating: boolean;
  currentStep: string;
  fileHash?: string;
  chunksHashed: number;
  totalChunks: number;
  expectedHash?: string;
  hashMatch?: boolean;
}

interface AbortRef {
  aborted: boolean;
}

interface InitResponse {
  uploadId: string;
  chunkSize?: number;
}

interface StatusResponse {
  chunks?: number[];
}

// chunkSize: ví dụ 5 * 1024 * 1024 (5MB)
function sliceIntoChunks(file: File, chunkSize: number): SliceResult {
  const totalChunks = Math.ceil(file.size / chunkSize);
  const chunks: ChunkInfo[] = [];
  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const blob = file.slice(start, end);
    chunks.push({ index: i, blob, start, end });
  }
  return { chunks, totalChunks };
}

async function sha256OfBlob(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Calculate hash for individual chunks with progress
async function calculateChunksHash(
  chunks: ChunkInfo[],
  onProgress: (progress: {
    current: number;
    total: number;
    step: string;
  }) => void
): Promise<Map<number, string>> {
  const chunkHashes = new Map<number, string>();

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    onProgress({
      current: i + 1,
      total: chunks.length,
      step: `Hashing chunk ${i + 1}/${chunks.length}`,
    });

    const hash = await sha256OfBlob(chunk.blob);
    chunkHashes.set(chunk.index, hash);
    console.log(
      `Chunk ${i + 1}/${chunks.length} hash: ${hash.substring(0, 16)}...`
    );
  }

  return chunkHashes;
}

const AddRoomForm: React.FC<{ onFinish?: (values: RoomData) => void }> = (
  {
    //   onFinish,
  }
) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);

  const [provinces, setProvinces] = React.useState<ProvinceOption[]>([]);
  const [districts, setDistricts] =
    React.useState<ProvinceOption[]>(initialDistricts);
  const [wards, setWards] = React.useState<ProvinceOption[]>(initialWards);
  const [selectedProvince, setSelectedProvince] = React.useState<
    string | undefined
  >(undefined);
  const [selectedDistrict, setSelectedDistrict] = React.useState<
    string | undefined
  >(undefined);
  const [loadingDistricts, setLoadingDistricts] = React.useState(false);
  const [loadingWards, setLoadingWards] = React.useState(false);
  const [typeposts, setTypeposts] = React.useState<TypePost[]>([]);
  const [selectedTypePostId, setSelectedTypePostId] = React.useState<
    string | undefined
  >(undefined);
  const [startDate, setStartDate] = React.useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = React.useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [totalPrice, setTotalPrice] = React.useState<number>(0);
  const [convenients, setConvenients] = React.useState<Convenient[]>([]);
  const [isHaveBank, setIsHaveBank] = React.useState<boolean>(false);

  //===chunk===//
  const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB
  const CONCURRENCY = 4; // 4 chunk song song
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<UploadProgress>({
    uploadedBytes: 0,
    totalBytes: 0,
    percent: 0,
  });
  const [hashProgress, setHashProgress] = useState<HashProgress>({
    isCalculating: false,
    currentStep: "",
    chunksHashed: 0,
    totalChunks: 0,
  });
  // const [statusText, setStatusText] = useState<string>("");
  // const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const abortRef = useRef<AbortRef>({ aborted: false });

  // Hàm đa năng: nhận event input hoặc object {file, roomId} để upload chunk video
  async function onFileChange(
    eOrObj: React.ChangeEvent<HTMLInputElement> | { file: File }
  ): Promise<void> {
    console.log("=== onFileChange CALLED ===");
    console.log("eOrObj:", eOrObj);

    let f: File | undefined;
    if ("target" in eOrObj) {
      // Trường hợp chọn file từ input
      f = eOrObj.target.files?.[0];
      console.log("Input event detected, file:", f?.name);
    } else {
      // Trường hợp truyền file trực tiếp từ handleSubmit
      f = eOrObj.file;
      console.log("Direct file object detected, file:", f?.name);
    }

    console.log("Setting file state to:", f?.name);
    setFile(f || null);
    setProgress({ uploadedBytes: 0, totalBytes: f ? f.size : 0, percent: 0 });
    // setStatusText("");
    setUploadId(null);
    if (f) {
      calculateFileHash(f);
      console.log(
        `File selected: ${f.name}, Size: ${(f.size / 1024 / 1024).toFixed(
          2
        )} MB`
      );
    } else {
      setHashProgress({
        isCalculating: false,
        currentStep: "",
        chunksHashed: 0,
        totalChunks: 0,
      });
    }
  }

  async function calculateFileHash(selectedFile: File): Promise<void> {
    setHashProgress({
      isCalculating: true,
      currentStep: "Calculating file hash...",
      chunksHashed: 0,
      totalChunks: 0,
    });

    try {
      const hash = await sha256OfBlob(selectedFile);

      setHashProgress({
        isCalculating: false,
        currentStep: "File hash calculated",
        fileHash: hash,
        chunksHashed: 0,
        totalChunks: 0,
      });

      console.log(`File hash calculated: ${hash}`);
    } catch (error) {
      setHashProgress({
        isCalculating: false,
        currentStep: "Error calculating hash",
        chunksHashed: 0,
        totalChunks: 0,
      });
      console.error("Error calculating file hash:", error);
    }
  }

  // function abortUpload(): void {
  //   abortRef.current.aborted = true;
  //   setStatusText("Đã dừng upload.");
  //   setIsUploading(false);
  // }

  // async function copyHashToClipboard(): Promise<void> {
  //   if (hashProgress.fileHash) {
  //     try {
  //       await navigator.clipboard.writeText(hashProgress.fileHash);
  //       setStatusText("Hash copied to clipboard!");
  //       console.log("Hash copied to clipboard:", hashProgress.fileHash);
  //     } catch (error) {
  //       console.error("Failed to copy hash:", error);
  //       setStatusText("Failed to copy hash to clipboard");
  //     }
  //   }
  // }

  async function upload(roomId: string, videoFile?: File): Promise<void> {
    console.log("=== UPLOAD FUNCTION CALLED ===");
    console.log("roomId:", roomId);
    console.log("videoFile parameter:", videoFile?.name);
    console.log("file state:", file);

    const fileToUpload = videoFile || file;
    if (!fileToUpload) {
      console.log("No file to upload, returning early");
      return;
    }

    console.log("Using file:", fileToUpload.name);
    abortRef.current.aborted = false;
    // setIsUploading(true);
    // setStatusText("Khởi tạo phiên upload…");
    console.log("Starting upload for file:", fileToUpload.name);

    // 1) Cắt chunks
    const { chunks, totalChunks } = sliceIntoChunks(fileToUpload, CHUNK_SIZE);

    console.log(
      `Tổng số chunks: ${totalChunks}, mỗi chunk: ${
        CHUNK_SIZE / 1024 / 1024
      } MB`
    );
    console.log(`Chunk details: ${JSON.stringify(chunks, null, 2)}`);

    // Use existing file hash if available, otherwise calculate it
    let fileHash = hashProgress.fileHash;
    if (!fileHash) {
      // setStatusText("Calculating file hash...");
      fileHash = await sha256OfBlob(fileToUpload);
      setHashProgress((prev: any) => ({ ...prev, fileHash }));
    }

    // Calculate chunk hashes for validation
    // setStatusText("Calculating chunk hashes...");
    setHashProgress((prev: any) => ({
      ...prev,
      isCalculating: true,
      totalChunks,
    }));

    const chunkHashes = await calculateChunksHash(chunks, (progress) => {
      setHashProgress((prev: any) => ({
        ...prev,
        chunksHashed: progress.current,
        currentStep: progress.step,
      }));
    });

    setHashProgress((prev: any) => ({ ...prev, isCalculating: false }));

    // 2) Sử dụng upload session hiện có hoặc tạo mới
    let realUploadId = uploadId;
    if (!realUploadId) {
      // setStatusText("Tạo phiên upload mới...");
      const initResp: InitResponse = await API.init(
        fileToUpload.name,
        totalChunks,
        fileToUpload.size,
        fileHash
      );
      realUploadId = initResp.uploadId;
      setUploadId(realUploadId);
      console.log(`Upload session created with ID: ${realUploadId}`);
    } else {
      // setStatusText("Tiếp tục phiên upload hiện có...");
      console.log(`Resuming existing upload session: ${realUploadId}`);
    }

    // 3) Resume: hỏi server có những chunk nào
    const st: StatusResponse = await API.status(realUploadId);
    const have = new Set(st.chunks || []);
    const todo = chunks.filter((c) => !have.has(c.index));

    console.log(`📋 Upload status check:`);
    console.log(`   - Total chunks: ${totalChunks}`);
    console.log(
      `   - Chunks on server: ${have.size} (${Array.from(have)
        .sort((a, b) => a - b)
        .join(", ")})`
    );
    console.log(
      `   - Chunks to upload: ${todo.length} (${todo
        .map((c) => c.index)
        .sort((a, b) => a - b)
        .join(", ")})`
    );

    // if (have.size > 0) {
    //   setStatusText(
    //     `📊 Resume detected: ${have.size}/${totalChunks} chunks already on server`
    //   );
    // }

    // 4) Tính tổng bytes đã có (resume progress)
    let uploadedBytes = 0;
    for (const c of chunks) {
      if (have.has(c.index)) uploadedBytes += c.end - c.start;
    }
    setProgress({
      uploadedBytes,
      totalBytes: fileToUpload.size,
      percent: Math.round((uploadedBytes / fileToUpload.size) * 100),
    });

    // setStatusText(
    //   `Bắt đầu upload ${todo.length}/${chunks.length} chunks… (song song ${CONCURRENCY})`
    // );

    // 5) Hàm queue upload theo concurrency
    let cursor = 0;
    let uploadedChunksCount = 0;
    const workers: Promise<void>[] = [];

    async function worker(): Promise<void> {
      while (cursor < todo.length && !abortRef.current.aborted) {
        const job = todo[cursor++];

        // Get the pre-calculated chunk hash
        const chunkHash = chunkHashes.get(job.index);

        console.log(
          `📤 Uploading chunk ${job.index}/${totalChunks} (${
            uploadedChunksCount + 1
          }/${todo.length} in this session) - Hash: ${chunkHash?.substring(
            0,
            8
          )}...`
        );

        await API.uploadChunk({
          uploadId: realUploadId!,
          chunkIndex: job.index,
          totalChunks,
          filename: fileToUpload!.name,
          blob: job.blob,
          chunkHash,
        });

        uploadedChunksCount++;
        uploadedBytes += job.end - job.start;
        setProgress(() => {
          const percent = Math.round(
            (uploadedBytes / fileToUpload!.size) * 100
          );
          return { uploadedBytes, totalBytes: fileToUpload!.size, percent };
        });

        console.log(
          `✅ Chunk ${job.index} uploaded successfully (${uploadedChunksCount}/${todo.length} chunks in this session)`
        );
      }
    }

    for (let i = 0; i < CONCURRENCY; i++) workers.push(worker());

    try {
      await Promise.all(workers);
    } catch (error) {
      console.error("Upload failed:", error);
      // setStatusText(
      //   `Upload failed: ${
      //     error instanceof Error ? error.message : "Unknown error"
      //   }`
      // );
      // setIsUploading(false);
      return;
    }

    // if (abortRef.current.aborted) {
    //   setIsUploading(false);
    //   return;
    // }

    // setStatusText("Hoàn tất chunks. Gọi /complete…");
    const done = await API.complete(
      realUploadId!,
      fileToUpload!.name,
      fileHash!,
      roomId
    );

    // Verify file hash integrity
    console.log(`🎉 Upload completed successfully!`);
    console.log(`📊 Final statistics:`);
    console.log(`   - File: ${fileToUpload.name}`);
    console.log(
      `   - Size: ${(fileToUpload.size / 1024 / 1024).toFixed(2)} MB`
    );
    console.log(`   - Total chunks: ${totalChunks}`);
    console.log(`   - File hash: ${fileHash}`);
    console.log(`   - Server response:`, done);

    // setStatusText("✅ Upload completed!");
    // setIsUploading(false);
    setUploadId(null); // Reset upload session after completion
  }
  //==== eendchunk ====//

  useEffect(() => {
    const fetchConvenients = async () => {
      try {
        const data = await getConvenients();
        setConvenients(data);
      } catch (error) {
        console.error("Failed to fetch convenients:", error);
      }
    };
    fetchConvenients();
  }, []);

  const { data: session } = useSession();

  useEffect(() => {
    if (!session) return;

    const fetchIsHaveBank = async () => {
      try {
        const data = await isHaveBankAccount();
        setIsHaveBank(data);
      } catch (error) {
        console.error("Failed to check bank account existence:", error);
      }
    };
    fetchIsHaveBank();
  }, [session]);

  // Tính giá khi thay đổi ngày hoặc loại bài đăng
  useEffect(() => {
    if (!selectedTypePostId || !startDate || !endDate) {
      setTotalPrice(0);
      return;
    }
    const typepost = typeposts.find((tp) => tp.id === selectedTypePostId);
    if (!typepost) {
      setTotalPrice(0);
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );
    setTotalPrice(diffDays * typepost.pricePerDay);
  }, [selectedTypePostId, startDate, endDate, typeposts.length]);

  useEffect(() => {
    if (!session) return;

    const fetchTypePosts = async () => {
      try {
        const data = await getPostTypes();
        setTypeposts(data);
      } catch (error) {
        console.error("Failed to fetch type posts:", error);
      }
    };
    fetchTypePosts();
  }, [session]);

  useEffect(() => {
    if (!session) return;

    const fetchProvinces = async () => {
      try {
        const data = await getProvinces();
        const options = data.map((province: Province) => ({
          label: province.name,
          value: province.id,
        }));
        setProvinces(options);
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  if (!session) {
    return <div>Please log in to add a room.</div>;
  }

  console.log("isHaveBank:", isHaveBank);
  // Khi chọn tỉnh, load lại danh sách quận/huyện
  const handleProvinceChange = async (provinceId: string) => {
    setSelectedProvince(provinceId);
    setSelectedDistrict(undefined);
    form.setFieldsValue({ district: undefined, ward: undefined }); // reset district, ward khi đổi tỉnh
    setDistricts([]); // clear districts khi loading
    setWards([]); // clear wards khi loading
    setLoadingDistricts(true);
    try {
      if (typeof window !== "undefined" && provinceId) {
        const data = await getDistricts(provinceId);
        const options = data.map((district: District) => ({
          label: district.name,
          value: district.id,
        }));
        setDistricts(options);
      }
    } catch (error) {
      console.error("Failed to fetch districts:", error);
      setDistricts([]);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Khi chọn quận/huyện, load lại danh sách xã/phường
  const handleDistrictChange = async (districtId: string) => {
    setSelectedDistrict(districtId);
    form.setFieldsValue({ ward: undefined }); // reset ward khi đổi quận/huyện
    setWards([]); // clear wards khi loading
    setLoadingWards(true);
    try {
      if (typeof window !== "undefined" && districtId) {
        const data = await getWards(districtId);
        const options = data.map((ward: Ward) => ({
          label: ward.name,
          value: ward.id,
        }));
        setWards(options);
      }
    } catch (error) {
      console.error("Failed to fetch wards:", error);
      setWards([]);
    } finally {
      setLoadingWards(false);
    }
  };

  //   const handleOnSubmit = (values: RoomData) => {
  //
  //     message.success("Đã gửi thông tin phòng mới!");
  //     if (onFinish) onFinish({ ...values, images: fileList });
  //     form.resetFields();
  //     setFileList([]);
  //   };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Build address object
      const address = {
        street: values.address,
        wardId: values.ward,
      };

      // Build convenientIds array
      const convenientIds = values.convenients;

      // Build final room data
      const roomData = {
        title: values.name,
        description: values.description,
        priceMonth: values.priceMonth,
        priceDeposit: values.priceDeposit,
        // area: values.area,
        roomLength: values.roomLength,
        roomWidth: values.roomWidth,
        elecPrice: values.elecPrice,
        waterPrice: values.waterPrice,
        maxPeople: values.maxPeople,
        postStartDate: new Date().toISOString(), // Sử dụng thời gian hiện tại đầy đủ
        postEndDate: new Date(endDate + "T23:59:59").toISOString(), // Kết thúc vào cuối ngày được chọn
        typepostId: selectedTypePostId,
        // userId: "44256067-6f69-11f0-8622-b42e993f445f", // đã handled trong server action api next
        address,
        convenientIds,
        // images: fileList.map((file) => file.originFileObj as File), // nếu cần gửi ảnh
      };

      const images = fileList
        .map((file) => file.originFileObj)
        .filter((f) => f && f.type && f.type.startsWith("image/")) as File[];

      const result = await createRoom(images, JSON.stringify(roomData));

      // Lọc file video và upload chunk từng file sau khi tạo phòng thành công
      const videoFiles = fileList
        .map((f) => f.originFileObj)
        .filter((f) => f && f.type && f.type.startsWith("video/")) as File[];

      const roomId = result.roomId || result.id || result.data?.id;
      console.log("Room created with ID:", roomId);
      console.log("Full result:", result);

      // Upload video files with progress notifications
      let allVideoSuccess = true;
      for (const videoFile of videoFiles) {
        try {
          console.log(
            "Starting upload for video:",
            videoFile.name,
            "to room:",
            roomId
          );

          messageApi.open({
            type: "loading",
            content: `Uploading video: ${videoFile.name}...`,
            duration: 0,
            key: `uploading_${videoFile.name}`,
          });

          // Reset upload-related state before each upload
          setFile(null);
          setProgress({ uploadedBytes: 0, totalBytes: 0, percent: 0 });
          setHashProgress({
            isCalculating: false,
            currentStep: "",
            chunksHashed: 0,
            totalChunks: 0,
          });
          setUploadId(null);
          abortRef.current.aborted = false;

          console.log("Calling onFileChange with video file:", videoFile.name);
          await onFileChange({ file: videoFile });

          console.log(
            "Calling upload function with roomId:",
            roomId,
            "and videoFile:",
            videoFile.name
          );
          await upload(roomId, videoFile);
          messageApi.open({
            type: "success",
            content: `Video ${videoFile.name} uploaded successfully!`,
            duration: 1.5,
            key: `uploading_${videoFile.name}`,
          });
        } catch (videoError) {
          allVideoSuccess = false;
          messageApi.open({
            type: "error",
            content: `Failed to upload video: ${videoFile.name}`,
            duration: 2,
            key: `uploading_${videoFile.name}`,
          });
          console.error("Video upload failed:", videoError);
        }
      }

      // Show final result message
      if (videoFiles.length > 0) {
        if (allVideoSuccess) {
          messageApi.success({
            content: "Room information & all videos uploaded successfully!",
            duration: 1.5,
          });
        } else {
          messageApi.warning({
            content: "Room created, but some videos failed to upload.",
            duration: 2,
          });
        }
      } else {
        messageApi.success({
          content: "Room information submitted successfully!",
          duration: 1.5,
        });
      }
      console.log("Kết quả:", result);
      console.log("Submitted Room Data:", roomData);

      form.resetFields();
      setFileList([]);
      setStartDate(new Date().toISOString().split("T")[0]);
      setEndDate(new Date().toISOString().split("T")[0]);
      setSelectedTypePostId(undefined);

      // Reset toàn bộ state upload sau khi thêm phòng xong
      setFile(null);
      setProgress({ uploadedBytes: 0, totalBytes: 0, percent: 0 });
      setHashProgress({
        isCalculating: false,
        currentStep: "",
        chunksHashed: 0,
        totalChunks: 0,
      });
      setUploadId(null);
      abortRef.current.aborted = false;
    } catch (error: any) {
      messageApi.error({
        content:
          error.message ||
          "An error occurred while submitting room information",
        duration: 1.5,
      });
      // console.error("Validation failed:", error.message);
    }
  };

  return (
    <>
      {contextHolder}
      {!isHaveBank && (
        <div className="flex-1 flex justify-center items-center bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-white font-semibold text-xl mb-2">
              Bank Account Required
            </div>
            <p className="text-amber-50 text-sm">
              Please link a bank account in <strong>your profile</strong> to add
              your room!!!
            </p>
          </div>
        </div>
      )}

      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#171f2f] dark:text-white p-0 m-0">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            /* area: 20, */
            roomLength: 4,
            roomWidth: 5,
            elecPrice: 3000,
            waterPrice: 15000,
            maxPeople: 2,
            priceMonth: 1000000,
          }}
          className="w-full h-full bg-white dark:bg-[#232b3b] rounded-none shadow-none p-0"
        >
          <div className="flex flex-col md:flex-row gap-6 w-full h-full">
            {/* Left column: group related fields into stacked cards */}
            <div className="flex-1 flex flex-col gap-4 m-2">
              {/* Card: Images & Basic Info */}
              <div className="bg-white dark:bg-[#232b3b] border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                <div className="mb-3">
                  <h4 className="font-semibold text-base bg-gray-50 dark:bg-[#1b2636] p-2 rounded-md">
                    Room Information
                  </h4>
                </div>
                <div className="flex flex-col gap-3">
                  <Form.Item label="Room Images" required>
                    <Upload
                      listType="picture-card"
                      fileList={fileList}
                      onChange={({ fileList: newList }) => {
                        if (newList.length <= 8) {
                          setFileList(newList);
                        }
                      }}
                      beforeUpload={() => false}
                      multiple
                    >
                      {fileList.length >= 8 ? null : (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                      )}
                    </Upload>
                  </Form.Item>

                  <Form.Item
                    label="Room Name"
                    name="name"
                    rules={[
                      { required: true, message: "Please enter room name" },
                    ]}
                  >
                    <Input placeholder="Enter room name" />
                  </Form.Item>
                </div>
              </div>

              {/* Card: Location */}
              <div className="bg-white dark:bg-[#232b3b] border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                <div className="mb-3">
                  <h4 className="font-semibold text-base bg-gray-50 dark:bg-[#1b2636] p-2 rounded-md">
                    Location
                  </h4>
                </div>
                <div className="flex gap-2">
                  <Form.Item
                    label="Province/City"
                    name="province"
                    rules={[
                      { required: true, message: "Select province/city" },
                    ]}
                    className="flex-1"
                  >
                    <Select
                      showSearch
                      placeholder="Select province/city"
                      options={provinces}
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      onChange={handleProvinceChange}
                    />
                  </Form.Item>

                  <Form.Item
                    label="District"
                    name="district"
                    rules={[{ required: true, message: "Select district" }]}
                    className="flex-1"
                  >
                    <Select
                      placeholder="Select district"
                      options={districts}
                      disabled={!selectedProvince}
                      loading={loadingDistricts}
                      showSearch
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      onChange={handleDistrictChange}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Ward"
                    name="ward"
                    rules={[{ required: true, message: "Select ward" }]}
                    className="flex-1"
                  >
                    <Select
                      placeholder="Select ward"
                      options={wards}
                      disabled={!selectedDistrict}
                      loading={loadingWards}
                      showSearch
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  label="Address"
                  name="address"
                  rules={[{ required: true, message: "Enter address" }]}
                >
                  <Input placeholder="Enter address" />
                </Form.Item>
              </div>

              {/* Card: Room Details & Pricing */}
              <div className="bg-white dark:bg-[#232b3b] border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                <div className="mb-3">
                  <h4 className="font-semibold text-base bg-gray-50 dark:bg-[#1b2636] p-2 rounded-md">
                    Room Details & Pricing
                  </h4>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    {/* Commented out old area field as requested (do not delete) */}
                    {/**
                     * <Form.Item
                     *   label="Area (m²)"
                     *   name="area"
                     *   className="flex-1"
                     *   rules={[{ required: true, type: 'number', min: 1, message: 'Enter area' }]}
                     * >
                     *   <InputNumber min={1} max={200} style={{ width: '100%' }} />
                     * </Form.Item>
                     */}

                    <Form.Item
                      label="Room Length (m)"
                      name="roomLength"
                      normalize={(value) => {
                        const n =
                          typeof value === "string" ? parseFloat(value) : value;
                        return Number.isFinite(n) ? n : undefined;
                      }}
                      className="flex-1"
                      rules={[
                        {
                          required: true,
                          type: "number",
                          min: 0.1,
                          message: "Enter room length",
                        },
                      ]}
                    >
                      <AutoComplete
                        options={["2", "2.5", "3", "3.5", "4", "4.5", "5"].map(
                          (v) => ({ value: v })
                        )}
                        placeholder="Type or choose preset"
                        style={{ width: "100%" }}
                        onSelect={(value) => {
                          const n = parseFloat(String(value));
                          if (!isNaN(n)) form.setFieldsValue({ roomLength: n });
                        }}
                        onChange={(value) => {
                          const n = parseFloat(String(value));
                          if (!isNaN(n)) form.setFieldsValue({ roomLength: n });
                          else form.setFieldsValue({ roomLength: undefined });
                        }}
                        filterOption={(inputValue, option) =>
                          String(option?.value ?? "").includes(inputValue)
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      label="Room Width (m)"
                      name="roomWidth"
                      normalize={(value) => {
                        const n =
                          typeof value === "string" ? parseFloat(value) : value;
                        return Number.isFinite(n) ? n : undefined;
                      }}
                      className="flex-1"
                      rules={[
                        {
                          required: true,
                          type: "number",
                          min: 0.1,
                          message: "Enter room width",
                        },
                      ]}
                    >
                      <AutoComplete
                        options={["2", "2.5", "3", "3.5", "4", "4.5", "5"].map(
                          (v) => ({ value: v })
                        )}
                        placeholder="Type or choose preset"
                        style={{ width: "100%" }}
                        onSelect={(value) => {
                          const n = parseFloat(String(value));
                          if (!isNaN(n)) form.setFieldsValue({ roomWidth: n });
                        }}
                        onChange={(value) => {
                          const n = parseFloat(String(value));
                          if (!isNaN(n)) form.setFieldsValue({ roomWidth: n });
                          else form.setFieldsValue({ roomWidth: undefined });
                        }}
                        filterOption={(inputValue, option) =>
                          String(option?.value ?? "").includes(inputValue)
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      label="Max People"
                      name="maxPeople"
                      className="flex-1"
                      rules={[{ required: true, message: "Select max people" }]}
                    >
                      <Select
                        placeholder="Select max people"
                        options={Array.from({ length: 8 }, (_, i) => ({
                          label: `${i + 1}`,
                          value: i + 1,
                        }))}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </div>

                  <div className="flex gap-2">
                    <Form.Item
                      label="Electricity Price (₫/kW)"
                      name="elecPrice"
                      className="flex-1"
                      rules={[
                        {
                          required: true,
                          type: "number",
                          min: 0,
                          message: "Enter electricity price",
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        step={500}
                        style={{ width: "100%" }}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        addonAfter="₫/kW"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Water Price (₫/m³)"
                      name="waterPrice"
                      className="flex-1"
                      rules={[
                        {
                          required: true,
                          type: "number",
                          min: 0,
                          message: "Enter water price",
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        step={500}
                        style={{ width: "100%" }}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        addonAfter="₫/m³"
                      />
                    </Form.Item>
                  </div>

                  <div className="flex gap-2">
                    <Form.Item
                      label="Monthly Price"
                      name="priceMonth"
                      className="flex-1"
                      rules={[
                        {
                          required: true,
                          type: "number",
                          min: 1000,
                          message: "Enter monthly price",
                        },
                      ]}
                    >
                      <InputNumber
                        min={1000}
                        step={100000}
                        style={{ width: "100%" }}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        addonAfter="₫"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Deposit Price"
                      name="priceDeposit"
                      className="flex-1"
                      rules={[
                        {
                          required: true,
                          type: "number",
                          min: 1000,
                          message: "Enter deposit price",
                        },
                      ]}
                    >
                      <InputNumber
                        min={1000}
                        step={10000}
                        style={{ width: "100%" }}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        addonAfter="₫"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Convenients and Post Info as separate cards */}
            <div className="flex-1 flex flex-col gap-4 m-2">
              <div className="bg-white dark:bg-[#232b3b] border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                <div className="mb-3">
                  <h4 className="font-semibold text-base bg-gray-50 dark:bg-[#1b2636] p-2 rounded-md">
                    Convenient Part
                  </h4>
                </div>
                <Form.Item
                  label="Convenients"
                  name="convenients"
                  rules={[{ required: true, message: "Select convenients" }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Select convenients"
                    options={convenients.map((c) => ({
                      label: c.name,
                      value: c.id,
                    }))}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </div>

              <div className="bg-white dark:bg-[#232b3b] border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                <div className="mb-3">
                  <h4 className="font-semibold text-base bg-gray-50 dark:bg-[#1b2636] p-2 rounded-md">
                    Post Price Information
                  </h4>
                </div>

                <Form.Item
                  label="Post Type"
                  name="typepostId"
                  rules={[{ required: true, message: "Select post type" }]}
                >
                  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-100 dark:bg-[#232b3b]">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">
                            Post Type
                          </th>
                          <th className="px-4 py-2 text-left font-semibold">
                            Price/Day (₫)
                          </th>
                          <th className="px-4 py-2 text-left font-semibold">
                            Description
                          </th>
                          <th className="px-4 py-2 text-center font-semibold">
                            Select
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-[#232b3b]">
                        {typeposts.map((typepost) => (
                          <tr
                            key={typepost.id}
                            className="hover:bg-gray-50 dark:hover:bg-[#1a2233] transition"
                          >
                            <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                              {typepost.name}
                            </td>
                            <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                              {typepost.pricePerDay.toLocaleString("vi-VN")}
                            </td>
                            <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                              {typepost.description || "Không có mô tả"}
                            </td>
                            <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-center">
                              <input
                                type="radio"
                                name="typepostId"
                                value={typepost.id}
                                checked={selectedTypePostId === typepost.id}
                                onChange={() =>
                                  setSelectedTypePostId(typepost.id)
                                }
                                className="accent-blue-600 scale-125 cursor-pointer"
                                style={{ margin: 0 }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Form.Item>

                <Form.Item
                  label="Start Date"
                  name="startDate"
                  initialValue={startDate}
                  rules={[]}
                >
                  <Input
                    type="date"
                    value={startDate}
                    disabled
                    className="w-full"
                  />
                </Form.Item>

                <Form.Item
                  label="End Date"
                  name="endDate"
                  rules={[{ required: true, message: "Select end date" }]}
                >
                  <Input
                    type="date"
                    value={endDate}
                    min={(() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      return d.toISOString().split("T")[0];
                    })()}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full"
                  />
                </Form.Item>

                <div className="mb-2">
                  <label className="font-semibold">Total Post Price:</label>
                  <div className="text-lg text-blue-600 font-bold">
                    {totalPrice.toLocaleString("vi-VN")} ₫
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full width: Description + Submit */}
          <div className=" my-4 mx-2 bg-white dark:bg-[#232b3b] border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
            <Form.Item
              label="Description"
              name="description"
              rules={[
                {
                  max: 2000,
                  message: "Description must be at most 2000 characters.",
                },
              ]}
            >
              <Input.TextArea rows={10} placeholder="Description (optional)" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full"
                onClick={() => handleSubmit()}
              >
                Add Room
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
    </>
  );
};

export default AddRoomForm;
