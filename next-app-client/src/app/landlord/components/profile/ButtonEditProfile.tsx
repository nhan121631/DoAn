/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Form, message } from "antd";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ModalProfile from "./ModalProfile";

export default function ButtonEditProfile() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  useEffect(() => {
    if (!session?.user?.userProfile?.avatar) {
      setAvatarUrl("/images/default/avatar.jpg");
      return;
    }
    const image = "http://localhost:3333" + session?.user?.userProfile?.avatar;
    console.log("Avatar URL:", image);
    if (image) {
      setAvatarUrl(image);
    }
  }, [session]);
  const handleAvatarChange = (
    info: import("antd/es/upload").UploadChangeParam<
      import("antd/es/upload/interface").UploadFile<any>
    >
  ) => {
    const file = info.file.originFileObj;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setAvatarUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (
    values: {
      name: string;
      phone: string;
      email: string;
      address: string;
      ward: string;
      bank: string;
      binCode: string;
      accountNumber: string;
      accountHolder: string;
    } & { avatar?: File[] | null }
  ) => {
    // Lấy file từ input upload (nếu dùng AntD Upload)
    const file = form.getFieldValue("avatar")?.[0]?.originFileObj;
    console.log("File lấy từ form:", file);

    // Tạo object profile đúng chuẩn API
    const profile = {
      id: session?.user?.userProfile?.id,
      fullName: values.name,
      email: values.email,
      phoneNumber: values.phone,
      bankName: values.bank,
      binCode: values.binCode,
      bankNumber: values.accountNumber,
      accoutHolderName: values.accountHolder,
      address: {
        street: values.address,
        wardId: values.ward,
      },
    };
    console.log("Profile data prepared:", profile);

    const formData = new FormData();
    formData.append("profile", JSON.stringify(profile));
    if (file) {
      formData.append("avatar", file);
    }
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        messageApi.success({
          content: "Profile updated successfully",
          duration: 1.5,
        });
        form.resetFields();
        setOpen(false);
      } else {
        // Hiển thị lỗi chi tiết từ API
        const msg = data?.message?.[0] || data?.error || "Upload failed";
        messageApi.error({
          content: msg,
          duration: 2,
        });
      }
    } catch (err) {
      messageApi.error({
        content: "Error: " + (err as any)?.message,
        duration: 2,
      });
    }
  };
  return (
    <>
      {contextHolder}
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 !text-white font-semibold px-6 py-2 rounded transition-colors duration-200 dark:bg-blue-800 dark:hover:bg-blue-900"
      >
        Chỉnh sửa thông tin
      </button>
      {errorMsg && <div style={{ color: "red", marginTop: 8 }}>{errorMsg}</div>}
      <ModalProfile
        open={open}
        onCancel={() => setOpen(false)}
        onSave={handleSave}
        avatarUrl={avatarUrl}
        onAvatarChange={handleAvatarChange}
        form={form}
        userProfile={session?.user?.userProfile}
      />
    </>
  );
}
