/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getDistricts,
  getProvinces,
  getWards,
} from "@/services/AddressService";
import { getConvenients } from "@/services/Convenients";
import { getRoomById, updateRoom } from "@/services/RoomService";
import { getPostTypes } from "@/services/TypePostService";
import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Upload,
  AutoComplete,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import React, { useEffect, useRef, useState } from "react";
import API from "@/services/UploadChunk";

type ProvinceOption = {
  label: string;
  value: string;
};

interface EditPostModalProps {
  open: boolean;
  onClose: () => void;
  roomId: string | null;
  onSuccess?: () => void;
}

// Types and interfaces for chunk upload
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

// Chunk upload utility functions
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

const EditPostModal: React.FC<EditPostModalProps> = ({
  open,
  onClose,
  roomId,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [roomData, setRoomData] = useState<any>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [formReady, setFormReady] = useState(false);

  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [districts, setDistricts] = useState<ProvinceOption[]>([]);
  const [wards, setWards] = useState<ProvinceOption[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(
    undefined
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>(
    undefined
  );
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [typeposts, setTypeposts] = useState<any[]>([]);
  const [convenients, setConvenients] = useState<any[]>([]);

  // Preset options for length/width (meters) - user can also type free value
  const lengthPresets = [2, 2.5, 3, 3.5, 4, 4.5, 5];
  const widthPresets = [2, 2.5, 3, 3.5, 4, 4.5];

  //===chunk upload state===//
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
    console.log("Starting upload for file:", fileToUpload.name);

    // 1) Cắt chunks
    const { chunks, totalChunks } = sliceIntoChunks(fileToUpload, CHUNK_SIZE);

    console.log(
      `Tổng số chunks: ${totalChunks}, mỗi chunk: ${
        CHUNK_SIZE / 1024 / 1024
      } MB`
    );

    // Use existing file hash if available, otherwise calculate it
    let fileHash = hashProgress.fileHash;
    if (!fileHash) {
      fileHash = await sha256OfBlob(fileToUpload);
      setHashProgress((prev: any) => ({ ...prev, fileHash }));
    }

    // Calculate chunk hashes for validation
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
      return;
    }

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

    setUploadId(null); // Reset upload session after completion
  }
  //==== end chunk ====//

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!open) return;

      try {
        const [provincesData, convenientsData, typepostsData] =
          await Promise.all([getProvinces(), getConvenients(), getPostTypes()]);

        setProvinces(
          provincesData.map((p: any) => ({ label: p.name, value: p.id }))
        );
        setConvenients(convenientsData);
        setTypeposts(typepostsData);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };

    fetchInitialData();
  }, [open]);

  // Fetch room data when modal opens
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomId || !open) return;

      setLoading(true);
      try {
        const data = await getRoomById(roomId);
        setRoomData(data);
        setFileList([]);
        setFormReady(true);
        // Không setFieldsValue ở đây nữa

        // Handle address data (chỉ set state, không setFieldsValue)
        if (data.address?.ward?.district?.province?.id) {
          const provinceId = data.address.ward.district.province.id;
          setSelectedProvince(provinceId);
          const districtsData = await getDistricts(provinceId);
          setDistricts(
            districtsData.map((d: any) => ({ label: d.name, value: d.id }))
          );
          if (data.address.ward.district.id) {
            const districtId = data.address.ward.district.id;
            setSelectedDistrict(districtId);
            const wardsData = await getWards(districtId);
            setWards(
              wardsData.map((w: any) => ({ label: w.name, value: w.id }))
            );
          }
        }
      } catch (error: any) {
        console.error("Error fetching room data:", error);
        messageApi.error({
          content: error.message || "Failed to load room data",
          duration: 3,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId, open, form, messageApi]);

  // Khi form đã render và dữ liệu đã sẵn sàng, mới setFieldsValue
  useEffect(() => {
    if (formReady && roomData) {
      form.setFieldsValue({
        name: roomData.title || "",
        description: roomData.description || "",
        priceMonth: roomData.priceMonth || 0,
        priceDeposit: roomData.priceDeposit || 0,
        // area: roomData.area || 0,
        // new explicit fields replacing area
        roomLength: roomData.roomLength ?? roomData.length ?? 4,
        roomWidth: roomData.roomWidth ?? roomData.width ?? 5,
        elecPrice: roomData.elecPrice ?? 3000,
        waterPrice: roomData.waterPrice ?? 15000,
        maxPeople: roomData.maxPeople ?? 2,
        address: roomData.address?.street || "",
        convenients: roomData.convenients?.map((c: any) => c.id) || [],
        postStartDate: roomData.postStartDate
          ? new Date(roomData.postStartDate).toISOString().split("T")[0]
          : "",
        postEndDate: roomData.postEndDate
          ? new Date(roomData.postEndDate).toISOString().split("T")[0]
          : "",
        province: roomData.address?.ward?.district?.province?.id || undefined,
        district: roomData.address?.ward?.district?.id || undefined,
        ward: roomData.address?.ward?.id || undefined,
      });
      setFormReady(false);
    }
  }, [formReady, roomData, form]);

  // Handle province change
  const handleProvinceChange = async (provinceId: string) => {
    setSelectedProvince(provinceId);
    setSelectedDistrict(undefined);
    form.setFieldsValue({ district: undefined, ward: undefined });
    setDistricts([]);
    setWards([]);
    setLoadingDistricts(true);

    try {
      const data = await getDistricts(provinceId);
      setDistricts(data.map((d: any) => ({ label: d.name, value: d.id })));
    } catch (error) {
      console.error("Failed to fetch districts:", error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Handle district change
  const handleDistrictChange = async (districtId: string) => {
    setSelectedDistrict(districtId);
    form.setFieldsValue({ ward: undefined });
    setWards([]);
    setLoadingWards(true);

    try {
      const data = await getWards(districtId);
      setWards(data.map((w: any) => ({ label: w.name, value: w.id })));
    } catch (error) {
      console.error("Failed to fetch wards:", error);
    } finally {
      setLoadingWards(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Normalize numeric fields to ensure correct types
      const roomLength = Number(values.roomLength ?? 0);
      const roomWidth = Number(values.roomWidth ?? 0);
      const elecPrice = Number(values.elecPrice ?? 0);
      const waterPrice = Number(values.waterPrice ?? 0);
      const maxPeople = Number(values.maxPeople ?? 1);
      // Lấy danh sách URL ảnh gốc từ DB
      const originalImageUrls =
        roomData?.images?.map((img: any) => img.url) || [];
      // Ảnh mới upload (filter out videos)
      const images = fileList
        .map((file) => file.originFileObj)
        .filter((f) => f && f.type && f.type.startsWith("image/")) as File[];

      // Logic existingImages
      let existingImages: string[] | null = null;
      if (fileList && fileList.length > 0) {
        // Nếu có fileList thì existingImages là danh sách URL gốc từ DB
        existingImages = originalImageUrls;
      } else {
        // Nếu không có fileList thì existingImages là null
        existingImages = null;
      }

      const roomPayload = {
        title: values.name,
        description: values.description,
        priceMonth: values.priceMonth,
        priceDeposit: values.priceDeposit,
        roomLength,
        roomWidth,
        elecPrice,
        waterPrice,
        maxPeople,
        address: {
          street: values.address,
          wardId: values.ward,
        },
        convenientIds: values.convenients,
        existingImages,
      };

      // Log dữ liệu gửi lên API
      console.log("--- PAYLOAD UPDATE ROOM ---");
      console.log("roomPayload:", roomPayload);
      console.log("images:", images);
      console.log("existingImages:", existingImages);
      console.log("fileList:", fileList);
      console.log("---------------------------");

      const formData = new FormData();
      if (images.length > 0) {
        images.forEach((file) => {
          formData.append("images", file);
        });
      }
      formData.append("room", JSON.stringify(roomPayload));
      await updateRoom(roomId!, formData);

      // Handle video files upload
      const videoFiles = fileList
        .map((f) => f.originFileObj)
        .filter((f) => f && f.type && f.type.startsWith("video/")) as File[];

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

          console.log("Calling onFileChange with video file:", videoFile.name);
          await onFileChange({ file: videoFile });

          console.log(
            "Calling upload function with roomId:",
            roomId,
            "and videoFile:",
            videoFile.name
          );
          await upload(roomId!, videoFile);
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

      // Show success message and close modal
      if (videoFiles.length > 0) {
        if (allVideoSuccess) {
          messageApi.success({
            content: "Room updated & all videos uploaded successfully!",
            duration: 2,
          });
        } else {
          messageApi.warning({
            content: "Room updated, but some videos failed to upload.",
            duration: 2,
          });
        }
      } else {
        messageApi.success({
          content: "Room updated successfully!",
          duration: 2,
        });
      }

      handleClose();

      // Refresh parent page data
      if (onSuccess) onSuccess();

      // Dispatch custom event to refresh RoomDetail
      if (roomId) {
        window.dispatchEvent(
          new CustomEvent("room-updated", { detail: { roomId } })
        );
      }
    } catch (error: any) {
      messageApi.error({
        content: error.message || "Failed to update room",
        duration: 3,
      });
    }
  };

  const handleClose = () => {
    form.resetFields();
    setFileList([]);
    setSelectedProvince(undefined);
    setSelectedDistrict(undefined);
    setDistricts([]);
    setWards([]);
    setRoomData(null);
    // Reset chunk upload states
    setFile(null);
    setProgress({ uploadedBytes: 0, totalBytes: 0, percent: 0 });
    setHashProgress({
      isCalculating: false,
      currentStep: "",
      chunksHashed: 0,
      totalChunks: 0,
    });
    setUploadId(null);
    abortRef.current.aborted = true;
    onClose();
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={<span style={{ fontSize: 24, fontWeight: 700 }}>Edit Room</span>}
        open={open}
        onCancel={handleClose}
        footer={null}
        width={1200}
        destroyOnHidden={false}
        styles={{
          body: { maxHeight: "70vh", overflowY: "auto" },
        }}
      >
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div>Loading room data...</div>
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            className="w-full h-full bg-white dark:bg-[#232b3b] rounded-none shadow-none p-0"
          >
            <div className="flex flex-col md:flex-row gap-6 w-full h-full">
              {/* Left Column - Room Information */}
              <div className="flex-1 bg-white dark:bg-[#232b3b] rounded-none p-4 shadow-none flex flex-col gap-2">
                <h3 className="font-semibold text-base mb-2">
                  Room Information
                </h3>

                <Form.Item label="Room Images">
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

                <div className="flex gap-2 justify-between">
                  <Form.Item
                    label="Province/City"
                    name="province"
                    rules={[
                      { required: true, message: "Select province/city" },
                    ]}
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

                {/* Length & Width presets + free input (AutoComplete) */}
                <div className="flex gap-2">
                  <Form.Item
                    label="Length (m)"
                    name="roomLength"
                    className="flex-1"
                    rules={[{ required: true, message: "Enter room length" }]}
                  >
                    <AutoComplete
                      options={lengthPresets.map((v) => ({ value: String(v) }))}
                      onSelect={(value) =>
                        form.setFieldsValue({ roomLength: Number(value) })
                      }
                      onChange={(value) =>
                        form.setFieldsValue({ roomLength: value })
                      }
                      filterOption={(input, option) =>
                        (option?.value ?? "")
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      <Input
                        addonAfter="m"
                        placeholder="e.g. 4 or choose preset"
                      />
                    </AutoComplete>
                  </Form.Item>

                  <Form.Item
                    label="Width (m)"
                    name="roomWidth"
                    className="flex-1"
                    rules={[{ required: true, message: "Enter room width" }]}
                  >
                    <AutoComplete
                      options={widthPresets.map((v) => ({ value: String(v) }))}
                      onSelect={(value) =>
                        form.setFieldsValue({ roomWidth: Number(value) })
                      }
                      onChange={(value) =>
                        form.setFieldsValue({ roomWidth: value })
                      }
                      filterOption={(input, option) =>
                        (option?.value ?? "")
                          .toString()
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      <Input
                        addonAfter="m"
                        placeholder="e.g. 5 or choose preset"
                      />
                    </AutoComplete>
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

              {/* Right Column - Convenients & Post Info */}
              <div className="flex-1 bg-white dark:bg-[#232b3b] rounded-none p-4 shadow-none flex flex-col gap-2">
                <h3 className="font-semibold text-base mb-2">
                  Convenient Part
                </h3>
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

                <h3 className="font-semibold text-base mb-2">
                  Post Information (Read Only)
                </h3>

                {/* Post Type Information - Read Only */}
                <Form.Item label="Post Type">
                  <div className="flex items-center p-3 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    <span className="text-white font-bold text-sm mr-2 bg-red-500 px-2 py-1 rounded">
                      {roomData?.typepost
                        ? roomData.typepost.charAt(0).toUpperCase() +
                          roomData.typepost.slice(1)
                        : ""}
                    </span>
                    <span className="text-gray-700 dark:text-gray-200">
                      {roomData?.typepost && typeposts.length > 0
                        ? (() => {
                            const matchingTypepost = typeposts.find(
                              (tp: any) => tp.name === roomData.typepost
                            );
                            return matchingTypepost
                              ? `${
                                  matchingTypepost.name
                                } - ${matchingTypepost.pricePerDay.toLocaleString(
                                  "vi-VN"
                                )}₫/day`
                              : roomData.typepost;
                          })()
                        : "Loading..."}
                    </span>
                  </div>
                </Form.Item>

                {/* Post Dates - Read Only */}
                <div className="flex gap-2">
                  <Form.Item
                    label="Start Date"
                    name="postStartDate"
                    className="flex-1"
                  >
                    <Input type="date" disabled className="w-full" />
                  </Form.Item>
                  <Form.Item
                    label="End Date"
                    name="postEndDate"
                    className="flex-1"
                  >
                    <Input type="date" disabled className="w-full" />
                  </Form.Item>
                </div>

                {/* Status Information */}
                {/* {roomData && (
                  <div className="bg-gray-50 p-3 rounded dark:bg-gray-700">
                    <h4 className="font-medium mb-2">Current Status:</h4>
                    <p>
                      <strong>Status:</strong> {roomData.status || "N/A"}
                    </p>
                    <p>
                      <strong>Approval Status:</strong>{" "}
                      {roomData.approvalStatus || "N/A"}
                    </p>
                    <p>
                      <strong>Hidden:</strong>{" "}
                      {roomData.isHidden ? "Yes" : "No"}
                    </p>
                  </div>
                )} */}

                {/* Additional utilities and max people */}
                <div className="mt-4 bg-white dark:bg-[#232b3b] border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                  <h4 className="font-semibold text-base bg-gray-50 dark:bg-[#1b2636] p-2 rounded-md mb-3">
                    Utilities & Occupancy
                  </h4>
                  <div className="flex gap-2">
                    <Form.Item
                      label="Electricity Price"
                      name="elecPrice"
                      className="flex-1"
                      rules={[{ required: true, type: "number" }]}
                    >
                      <InputNumber
                        min={0}
                        step={100}
                        style={{ width: "100%" }}
                        formatter={(v) =>
                          `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        addonAfter="₫/kWh"
                      />
                    </Form.Item>
                    <Form.Item
                      label="Water Price"
                      name="waterPrice"
                      className="flex-1"
                      rules={[{ required: true, type: "number" }]}
                    >
                      <InputNumber
                        min={0}
                        step={1000}
                        style={{ width: "100%" }}
                        formatter={(v) =>
                          `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        addonAfter="₫"
                      />
                    </Form.Item>
                    <Form.Item
                      label="Max People"
                      name="maxPeople"
                      className="w-40"
                      rules={[{ required: true, message: "Select max people" }]}
                    >
                      <Select placeholder="Max people">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <Select.Option key={n} value={n}>
                            {n}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-white dark:bg-[#232b3b] rounded-none p-4 shadow-none flex flex-col gap-2">
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
                <Input.TextArea rows={4} placeholder="Description (optional)" />
              </Form.Item>

              {/* Footer Buttons */}
              <div className="flex gap-4 justify-end">
                <Button onClick={handleClose} size="large">
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  size="large"
                  style={{ minWidth: "120px" }}
                >
                  Update Room
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Modal>
    </>
  );
};

export default EditPostModal;
