/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Form, message } from "antd";
// import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ModalProfile from "./ModalProfile";
import { UploadChangeParam, UploadFile } from "antd/es/upload";
import { URL_IMAGE } from "@/services/Constant";

export default function ButtonEditProfile({
  userProfile,
}: {
  userProfile: any;
}) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  // Nhận userProfile qua props
  // const props = arguments[0] || {};
  // const userProfile = props.userProfile;

  useEffect(() => {
    if (!userProfile?.avatar) {
      setAvatarUrl("/images/default/avatar.jpg");
      return;
    }
    const image = userProfile.avatar.startsWith("http")
      ? userProfile.avatar
      : `${URL_IMAGE}${userProfile.avatar}`;
    if (image) {
      setAvatarUrl(image);
    }
  }, [userProfile]);
  const handleAvatarChange = (info: UploadChangeParam<UploadFile<any>>) => {
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
      id: userProfile?.id,
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
    setLoading(true);
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
        const msg =
          data?.message?.[0] ||
          data?.errors?.[0] ||
          data?.error ||
          "Upload failed";
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
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {contextHolder}
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 !text-white font-semibold px-6 py-2 rounded transition-colors duration-200 dark:bg-blue-800 dark:hover:bg-blue-900"
      >
        Edit Profile
      </button>
      <ModalProfile
        open={open}
        onCancel={() => setOpen(false)}
        onSave={handleSave}
        avatarUrl={avatarUrl}
        onAvatarChange={handleAvatarChange}
        form={form}
        userProfile={userProfile}
        loading={loading}
      />
    </>
  );
}
