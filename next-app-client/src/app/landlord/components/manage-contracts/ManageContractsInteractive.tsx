/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";
import React, { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Modal,
  Popconfirm,
  message,
  Space,
  Input,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { MdOutlinePictureAsPdf } from "react-icons/md";
// import ContractFormModal from "./ContractFormModal";
import InvoiceExportModal from "./InvoiceExportModal";
import {
  ContractData,
  ContractFormValues,
  InvoiceFormValues,
} from "@/types/types";
import * as XLSX from "xlsx";
import Image from "next/image";

const availableRooms = [
  { name: "Mr. Nam's Room 1", address: "Ngu Hanh Son, Da Nang" },
  { name: "Mr. Tien's Room 2", address: "Son Tra, Da Nang" },
  { name: "Mr. Duong's Room 3", address: "Lien Chieu, Da Nang" },
  { name: "Ms. Phung's Room 1", address: "Hoa Vang , Da Nang" },
  { name: "Ms. Lan's Room 2", address: "Hoa Xuan , Da Nang" },
];

const initialContractData: ContractData[] = [
  {
    key: "c_001",
    contractName: "Contract No. 001",
    roomName: "Mr. Nam's Room 1",
    tenantName: "John Doe",
    phoneNumber: "0912345678",
    numberOfPeople: 2,
    price: 3000000,
    durationMonths: 6,
    startDate: "01/01/2024",
    endDate: "01/07/2024",
    status: 0, // Rented
    contractImageUrl:
      "https://placehold.co/400x300/E0BBE4/FFFFFF?text=Contract+001",
  },
  {
    key: "c_002",
    contractName: "Contract No. 002",
    roomName: "Mr. Tien's Room 2",
    tenantName: "Jane Smith",
    phoneNumber: "0987654321",
    numberOfPeople: 1,
    price: 1000000,
    durationMonths: 2,
    startDate: "15/05/2024",
    endDate: "15/07/2024",
    status: 1, // Checked Out
    contractImageUrl:
      "https://placehold.co/400x300/957DAD/FFFFFF?text=Contract+002",
  },
  {
    key: "c_003",
    contractName: "Contract No. 003",
    roomName: "Mr. Duong's Room 3",
    tenantName: "Peter Jones",
    phoneNumber: "0901122334",
    numberOfPeople: 3,
    price: 90000000,
    durationMonths: 0,
    startDate: "01/06/2024",
    endDate: "01/06/2024",
    status: 0, // Rented
    contractImageUrl:
      "https://placehold.co/400x300/D291BC/FFFFFF?text=Contract+003",
  },
  {
    key: "c_004",
    contractName: "Contract Truong Duong",
    roomName: "Ms. Phung's Room 1",
    tenantName: "Alice Brown",
    phoneNumber: "0977889900",
    numberOfPeople: 1,
    price: 100000,
    durationMonths: 5,
    startDate: "20/03/2024",
    endDate: "20/08/2024",
    status: 0, // Rented
    contractImageUrl:
      "https://placehold.co/400x300/FFC72C/FFFFFF?text=Contract+004",
  },
];

const ManageContractsInteractive: React.FC = () => {
  const [data, setData] = useState<ContractData[]>(initialContractData);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewContractModalOpen, setIsViewContractModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedContract, setSelectedContract] = useState<ContractData | null>(
    null
  );
  const [editingContract, setEditingContract] = useState<ContractData | null>(
    null
  );
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [contractToExport, setContractToExport] = useState<ContractData | null>(
    null
  );

  const calculateEndDate = (
    startDate: string,
    durationMonths: number
  ): string => {
    const start = new Date(startDate.split("/").reverse().join("-"));
    if (isNaN(start.getTime())) return "Invalid Date";
    start.setMonth(start.getMonth() + durationMonths);
    return start.toLocaleDateString("en-US");
  };

  const handleFormSubmit = (values: ContractFormValues) => {
    const endDate = calculateEndDate(values.startDate, values.durationMonths);

    let imageUrl = values.contractImageUrl;
    if (values.contractImageFile) {
      imageUrl =
        "https://placehold.co/400x300/8ECDA9/FFFFFF?text=Uploaded+Contract";
    } else if (editingContract && !values.contractImageUrl) {
      imageUrl = undefined;
    }

    if (editingContract) {
      const updatedData = data.map((item) =>
        item.key === editingContract.key
          ? ({
              ...item,
              ...values,
              endDate,
              status: values.status !== undefined ? values.status : item.status,
              numberOfPeople: values.numberOfPeople,
              contractImageUrl: imageUrl,
            } as ContractData)
          : item
      );
      setData(updatedData);
      message.success("Contract updated successfully!");
    } else {
      const newKey = `c_${data.length + 1}`;
      const newContract: ContractData = {
        key: newKey,
        contractName: values.contractName,
        roomName: values.roomName,
        tenantName: values.tenantName,
        phoneNumber: values.phoneNumber,
        numberOfPeople: values.numberOfPeople,
        price: values.price,
        durationMonths: values.durationMonths,
        startDate: values.startDate,
        endDate: endDate,
        status: 0, // Default to Rented (0) for new contracts
        contractImageUrl: imageUrl,
      };
      setData([...data, newContract]);
      message.success("Contract added successfully!");
    }
    setIsFormModalOpen(false);
    setEditingContract(null);
  };

  const handleViewContract = (record: ContractData) => {
    setSelectedContract(record);
    setIsViewContractModalOpen(true);
  };

  const handleDeleteContract = (recordKey: string) => {
    const updatedData = data.filter((item) => item.key !== recordKey);
    setData(updatedData);
    message.success("Contract deleted successfully!");
  };

  const handleEditContract = (record: ContractData) => {
    setEditingContract(record);
    setIsFormModalOpen(true);
  };

  const handleExportInvoice = (record: ContractData) => {
    setContractToExport(record);
    setIsInvoiceModalOpen(true);
  };

  const handleInvoiceFormSubmit = (values: InvoiceFormValues) => {
    if (!contractToExport) {
      message.error("No contract selected for invoice export.");
      return;
    }

    const updatedData = data.map((item) =>
      item.key === contractToExport.key
        ? { ...item, status: 1 as 0 | 1 } // Explicitly cast 1 to (0 | 1)
        : item
    );
    setData(updatedData);

    const invoiceData = [
      ["Invoice Name:", values.invoiceName],
      ["Contract Name:", contractToExport.contractName],
      ["Room Name:", contractToExport.roomName],
      ["Tenant Name:", contractToExport.tenantName],
      ["Phone Number:", contractToExport.phoneNumber],
      ["Number of People:", contractToExport.numberOfPeople],
      ["Price (VND):", contractToExport.price],
      ["Duration (Months):", contractToExport.durationMonths],
      ["Start Date:", contractToExport.startDate],
      ["End Date:", contractToExport.endDate],
      ["Installation Cost (VND):", values.installationCost || 0],
      [
        "Total Amount (VND):",
        contractToExport.price + (values.installationCost || 0),
      ],
      ["Status:", getStatusDisplay(1).text],
      [
        "Export Date:",
        new Date().toLocaleDateString("en-US") +
          " " +
          new Date().toLocaleTimeString("en-US"),
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(invoiceData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoice");

    const excelFileName = `${values.invoiceName || "Invoice"}_${
      contractToExport.contractName
    }.xlsx`;
    XLSX.writeFile(wb, excelFileName);

    message.success("Checked out and invoice exported successfully!");

    setIsInvoiceModalOpen(false);
    setContractToExport(null);
  };

  const getStatusDisplay = (status: 0 | 1) => {
    switch (status) {
      case 0:
        return { text: "Rented", color: "green" };
      case 1:
        return { text: "Checked Out", color: "volcano" };
      default:
        return { text: "Unknown", color: "default" };
    }
  };

  const columns: ColumnsType<ContractData> = [
    {
      title: "Contract Name",
      dataIndex: "contractName",
      key: "contractName",
      sorter: (a, b) => a.contractName.localeCompare(b.contractName),
    },
    {
      title: "Room Name",
      dataIndex: "roomName",
      key: "roomName",
      sorter: (a, b) => a.roomName.localeCompare(b.roomName),
    },
    {
      title: "Tenant",
      dataIndex: "tenantName",
      key: "tenantName",
      sorter: (a, b) => a.tenantName.localeCompare(b.tenantName),
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Number of People",
      dataIndex: "numberOfPeople",
      key: "numberOfPeople",
      sorter: (a, b) => a.numberOfPeople - b.numberOfPeople,
    },
    {
      title: "Contract File",
      key: "viewContract",
      render: (_, record) => (
        <Button onClick={() => handleViewContract(record)}>View File</Button>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
      render: (price) => price.toLocaleString("en-US") + " ₫",
    },
    {
      title: "Duration (Months)",
      dataIndex: "durationMonths",
      key: "durationMonths",
      sorter: (a, b) => a.durationMonths - b.durationMonths,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: 0 | 1) => {
        const { text, color } = getStatusDisplay(status);
        return <Tag color={color}>{text}</Tag>;
      },
      sorter: (a, b) => a.status - b.status,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<AiOutlineEdit size={18} />}
            onClick={() => handleEditContract(record)}
            title="Edit Contract"
          />
          <Button
            type="text"
            icon={<MdOutlinePictureAsPdf size={18} />}
            onClick={() => handleExportInvoice(record)}
            title="Export Invoice"
            disabled={record.status === 1}
          />
          <Popconfirm
            title="Are you sure you want to delete this contract?"
            onConfirm={() => handleDeleteContract(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<AiOutlineDelete size={18} />}
              title="Delete Contract"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1">
      <div className="flex justify-between items-center mt-2 mb-2">
        <Button
          type="primary"
          className="mr-4"
          onClick={() => {
            setEditingContract(null);
            setIsFormModalOpen(true);
          }}
        >
          Add Contract
        </Button>
        <Input.Search
          placeholder="Search contracts..."
          style={{ width: 250 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="key"
        pagination={{ pageSize: 7 }}
        className="mt-8 mb-8"
      />

      {/* Add/Edit Contract Modal */}
      {/* <ContractFormModal
        open={isFormModalOpen}
        onCancel={() => {
          setIsFormModalOpen(false);
          setEditingContract(null);
        }}
        onSubmit={handleFormSubmit}
        editingContract={editingContract}
        availableRooms={availableRooms}
      /> */}

      {/* View Contract Details Modal */}
      <Modal
        title="Contract File"
        open={isViewContractModalOpen}
        onCancel={() => setIsViewContractModalOpen(false)}
        footer={null}
        width={700}
      >
        {/* Always show a generic placeholder image */}
        <div className="mt-4 text-center">
          <h4 className="font-semibold mb-2">Contract File:</h4>
          <a
            href="https://cdn.luatminhkhue.vn/lmk/articles/18/91724/quy-dinh-ve-ngon-ngu-hop-dong---91724.jpg"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="https://cdn.luatminhkhue.vn/lmk/articles/18/91724/quy-dinh-ve-ngon-ngu-hop-dong---91724.jpg"
              alt="Quy định về ngôn ngữ hợp đồng"
              width={600}
              height={400}
              className="rounded-md shadow-md mx-auto"
            />
          </a>
        </div>
      </Modal>

      {/* Invoice Export Modal */}
      <InvoiceExportModal
        open={isInvoiceModalOpen}
        onCancel={() => {
          setIsInvoiceModalOpen(false);
          setContractToExport(null);
        }}
        onSubmit={handleInvoiceFormSubmit}
        contractToExport={contractToExport}
      />
    </div>
  );
};

export default ManageContractsInteractive;
