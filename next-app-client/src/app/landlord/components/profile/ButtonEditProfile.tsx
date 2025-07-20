/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import ModalProfile from "./ModalProfile";
import { Form } from "antd";

export default function ButtonEditProfile() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState(
    "https://antimatter.vn/wp-content/uploads/2022/11/hinh-anh-avatar-nam.jpg"
  );

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

  const handleSave = async (values: {
    name: string;
    phone: string;
    email: string;
    address: string;
  }) => {
    // Lấy file từ input upload (nếu dùng AntD Upload)
    const file = form.getFieldValue("avatar")?.[0]?.originFileObj;
    console.log("File lấy từ form:", file);

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("phone", values.phone);
    formData.append("email", values.email);
    formData.append("address", values.address);
    if (file) {
      formData.append("avatar", file);
    }

    try {
      const res = await fetch("http://localhost:3333/add", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        // Thành công
        console.log("Profile updated successfully");
        // setOpen(false);
      } else {
        // Xử lý lỗi
        alert("Upload failed");
      }
    } catch (err) {
      alert("Error: " + err);
    }
  };
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 !text-white font-semibold px-6 py-2 rounded transition-colors duration-200 dark:bg-blue-800 dark:hover:bg-blue-900"
      >
        Chỉnh sửa thông tin
      </button>
      <ModalProfile
        open={open}
        onCancel={() => setOpen(false)}
        onSave={handleSave}
        avatarUrl={avatarUrl}
        onAvatarChange={handleAvatarChange}
        form={form}
      />
    </>
  );
}
