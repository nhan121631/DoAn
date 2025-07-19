// // src/app/landlord/ManageMaintain/page.tsx (or your ManageMaintain.tsx file)

// "use client";
// import React, { useContext, useState, useEffect } from "react";
// import { Table, Tag, Button, Modal, Popconfirm, message, Space, Input, Select } from "antd";
// import { Form } from "antd";
// import type { ColumnsType } from "antd/es/table";
// import { AiOutlineDelete, AiOutlineEye, AiOutlineEdit } from "react-icons/ai";
// import { ThemeContext } from "@/app/context/ThemeContext";

// const { Option } = Select; // Destructure Option from Select

// type MaintainData = {
//   key: string;
//   roomName: string;
//   address: string;
//   issue: string;
//   cost: number;
//   date: string;
//   status: "Pending" | "Completed" | "In Progress";
// };

// const initialMaintainData: MaintainData[] = [
//   {
//     key: "1",
//     roomName: "Mr. Nam's Room 2",
//     address: "Dong Da, Hanoi",
//     issue: "Leaky faucet repair",
//     cost: 200000,
//     date: "07/08/2023",
//     status: "Completed",
//   },
//   {
//     key: "2",
//     roomName: "Mr. Nam's Room 1",
//     address: "Thanh Xuan, Hanoi",
//     issue: "Air conditioner maintenance",
//     cost: 9000000,
//     date: "10/08/2023",
//     status: "Pending",
//   },
//   {
//     key: "3",
//     roomName: "Room 506",
//     address: "Cau Giay, Hanoi",
//     issue: "Broken light bulb replacement",
//     cost: 100000,
//     date: "15/08/2023",
//     status: "In Progress",
//   },
// ];

// const ManageMaintain: React.FC = () => {
//   const [data, setData] = useState<MaintainData[]>(initialMaintainData);
//   const [isFormModalOpen, setIsFormModalOpen] = useState(false); // Used for both add and edit
//   const [isViewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
//   const [selectedMaintain, setSelectedMaintain] = useState<MaintainData | null>(null); // Used for viewing details
//   const [editingMaintain, setEditingMaintain] = useState<MaintainData | null>(null); // Used for editing
//   const { isDark } = useContext(ThemeContext);
//   const [form] = Form.useForm();

//   // useEffect to set form values when editingMaintain changes (edit mode)
//   useEffect(() => {
//     if (editingMaintain) {
//       form.setFieldsValue(editingMaintain);
//     } else {
//       form.resetFields();
//     }
//   }, [editingMaintain, form]);

//   // Handle adding or updating a maintenance request
//   const handleFormSubmit = (values: any) => {
//     if (editingMaintain) {
//       // Update logic
//       const updatedData = data.map((item) =>
//         item.key === editingMaintain.key
//           ? { ...item, ...values } // Update fields from form
//           : item
//       );
//       setData(updatedData);
//       message.success("Maintenance request updated successfully!");
//     } else {
//       // Add new logic
//       const newKey = (data.length + 1).toString();
//       const newMaintain: MaintainData = {
//         key: newKey,
//         roomName: values.roomName,
//         address: values.address,
//         issue: values.issue,
//         cost: values.cost ? parseFloat(values.cost) : 0,
//         date: new Date().toLocaleDateString('en-US'), // Get current date, formatted for English
//         status: "Pending", // Default to Pending when adding new
//       };
//       setData([...data, newMaintain]);
//       message.success("Maintenance request added successfully!");
//     }
//     setIsFormModalOpen(false);
//     setEditingMaintain(null); // Reset edit state
//     form.resetFields();
//   };

//   // Handle viewing maintenance request details
//   const handleViewDetails = (record: MaintainData) => {
//     setSelectedMaintain(record);
//     setViewDetailsModalOpen(true);
//   };

//   // Handle deleting a maintenance request
//   const handleDeleteMaintain = (recordKey: string) => {
//     const updatedData = data.filter(item => item.key !== recordKey);
//     setData(updatedData);
//     message.success("Maintenance request deleted successfully!");
//   };

//   // Handle editing a maintenance request
//   const handleEditMaintain = (record: MaintainData) => {
//     setEditingMaintain(record); // Set the record being edited
//     setIsFormModalOpen(true); // Open the form modal
//   };

//   // Handle status change directly in the table
//   const handleStatusChange = (value: MaintainData['status'], recordKey: string) => {
//     const updatedData = data.map(item =>
//       item.key === recordKey ? { ...item, status: value } : item
//     );
//     setData(updatedData);
//     message.success(`Status for request ${recordKey} updated to ${value}.`);
//   };

//   // Helper function to get status color class for Select options
//   const getStatusColorClass = (status: MaintainData['status']) => {
//     switch (status) {
//       case "Completed":
//         return "text-green-600"; // Tailwind green color
//       case "In Progress":
//         return "text-blue-600"; // Tailwind blue color
//       case "Pending":
//         return "text-red-600"; // Tailwind red color (for volcano-like color)
//       default:
//         return "";
//     }
//   };

//   const columns: ColumnsType<MaintainData> = [
//     {
//       title: "Room Name",
//       dataIndex: "roomName",
//       key: "roomName",
//       sorter: (a, b) => a.roomName.localeCompare(b.roomName),
//     },
//     {
//       title: "Address",
//       dataIndex: "address",
//       key: "address",
//     },
//     {
//       title: "Maintenance Card",
//       dataIndex: "issue",
//       key: "issue",
//       render: (_, record) => (
//         <Button onClick={() => handleViewDetails(record)}>View</Button>
//       ),
//     },
//     {
//       title: "Cost",
//       dataIndex: "cost",
//       key: "cost",
//       sorter: (a, b) => a.cost - b.cost,
//       render: (cost) => cost.toLocaleString("en-US") + " ₫", // Format for English locale
//     },
//     {
//       title: "Date",
//       dataIndex: "date",
//       key: "date",
//       sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//       key: "status",
//       render: (status, record) => (
//         <Select
//           defaultValue={status}
//           style={{ width: 120 }}
//           onChange={(value: MaintainData['status']) => handleStatusChange(value, record.key)}
//           className={getStatusColorClass(status)} // Apply color to the selected value
//         >
//           <Option value="Pending" className={getStatusColorClass("Pending")}>Pending</Option>
//           <Option value="In Progress" className={getStatusColorClass("In Progress")}>In Progress</Option>
//           <Option value="Completed" className={getStatusColorClass("Completed")}>Completed</Option>
//         </Select>
//       ),
//       sorter: (a, b) => a.status.localeCompare(b.status),
//     },
//     {
//       title: "Actions", // Changed to "Actions"
//       key: "actions",
//       render: (_, record) => (
//         <Space size="middle">
//           {/* Edit button */}
//           <Button
//             type="text"
//             icon={<AiOutlineEdit size={18} />}
//             onClick={() => handleEditMaintain(record)}
//           />
//           {/* Delete button */}
//           <Popconfirm
//             title="Are you sure you want to delete this maintenance request?"
//             onConfirm={() => handleDeleteMaintain(record.key)}
//             okText="Yes"
//             cancelText="No"
//           >
//             <Button type="text" danger icon={<AiOutlineDelete size={18} />} />
//           </Popconfirm>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div className={`
//       bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 m-5
//       ${isDark ? "dark-mode" : ""}
//     `}>
//       <div className="mb-4">
//         <div>
//           <h2 className="text-4xl font-semibold">Manage Maintain</h2>
//           <p className="text-gray-500 text-xl">Room Maintenance Management.</p>
//         </div>
//         <div className="flex justify-between items-center mt-2 mb-2">
//           <Button
//             type="primary"
//             className="mr-4"
//             onClick={() => {
//               setEditingMaintain(null); // Ensure it's add mode
//               setIsFormModalOpen(true);
//             }}
//           >
//             Add Maintenance Voucher
//           </Button>
//           <Input.Search
//             placeholder="Search:" // Translated
//             style={{ width: 200 }}
//           />
//         </div>
//       </div>

//       <Table
//         columns={columns}
//         dataSource={data}
//         rowKey="key"
//         pagination={{ pageSize: 7 }} // Correctly placed inside Table props
//         className="mt-8 mb-8" // Correctly placed inside Table props
//       />

//       {/* Add/Edit Maintenance Voucher Modal */}
//       <Modal
//         title={editingMaintain ? "Edit Maintenance Voucher" : "Add New Maintenance Voucher"} // Translated title
//         open={isFormModalOpen}
//         onCancel={() => {
//           setIsFormModalOpen(false);
//           setEditingMaintain(null); // Reset edit state when closing modal
//           form.resetFields(); // Reset form
//         }}
//         footer={null}
//         className={isDark ? "dark" : ""}
//       >
//         <Form
//           form={form}
//           layout="vertical"
//           onFinish={handleFormSubmit}
//         >
//           <Form.Item
//             label="Room Name"
//             name="roomName"
//             rules={[{ required: true, message: "Please enter room name!" }]} // Translated message
//           >
//             <Input />
//           </Form.Item>
//           <Form.Item
//             label="Address"
//             name="address"
//             rules={[{ required: true, message: "Please enter address!" }]} // Translated message
//           >
//             <Input />
//           </Form.Item>
//           <Form.Item
//             label="Description" // Translated
//             name="issue"
//             rules={[{ required: true, message: "Please describe the issue!" }]} // Translated message
//           >
//             <Input.TextArea rows={3} />
//           </Form.Item>
//           <Form.Item
//             label="Estimated costs (₫)" // Translated
//             name="cost"
//             rules={[{ pattern: /^\d+(\.\d{1,2})?$/, message: 'Please enter a valid number!' }]} // Translated message
//           >
//             <Input type="number" />
//           </Form.Item>
//           {/* Status field only displayed when editing, not when adding new */}
//           {editingMaintain && (
//             <Form.Item
//               label="Status" // Translated
//               name="status"
//               rules={[{ required: true, message: "Please select a status!" }]} // Translated message
//             >
//               <Select>
//                 <Option value="Pending">Pending</Option>
//                 <Option value="In Progress">In Progress</Option>
//                 <Option value="Completed">Completed</Option>
//               </Select>
//             </Form.Item>
//           )}
//           <Form.Item>
//             <Button type="primary" htmlType="submit" className="w-full">
//               {editingMaintain ? "Update" : "Add"} {/* Translated button text */}
//             </Button>
//           </Form.Item>
//         </Form>
//       </Modal>

//       {/* View Maintenance Voucher Details Modal */}
//       <Modal
//         title="Maintenance Voucher Details" // Translated title
//         open={isViewDetailsModalOpen}
//         onCancel={() => setViewDetailsModalOpen(false)}
//         footer={null}
//         width={700}
//         className={isDark ? "dark" : ""}
//       >
//         {selectedMaintain && (
//           <>
//             <p>
//               <b>Room Name:</b> {selectedMaintain.roomName}
//             </p>
//             <p>
//               <b>Address:</b> {selectedMaintain.address}
//             </p>
//             <p>
//               <b>Problem:</b> {selectedMaintain.issue}
//             </p>
//             <p>
//               <b>Cost:</b> {selectedMaintain.cost.toLocaleString("en-US")} ₫
//             </p>
//             <p>
//               <b>Date:</b> {selectedMaintain.date}
//             </p>
//             <p>
//               <b>Status:</b>{" "}
//               <Tag
//                 color={
//                   selectedMaintain.status === "Completed"
//                     ? "green"
//                     : selectedMaintain.status === "In Progress"
//                     ? "blue"
//                     : "volcano"
//                 }
//               >
//                 {selectedMaintain.status}
//               </Tag>
//             </p>
//           </>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default ManageMaintain;




// src/app/landlord/ManageMaintain/page.tsx
// Đây là Server Component, không có "use client";

import ClientWrapper from "../components/ClientWrapper";

export default function ManageMaintainPage() {
  return (
    // Render Client Component
    <ClientWrapper />
  );
}
