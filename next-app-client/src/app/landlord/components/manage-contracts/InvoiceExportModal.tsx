"use client";

import React, { useEffect } from "react";
import { Modal, Button, Input, Form } from "antd";
import { ContractData, InvoiceFormValues } from "@/types/types";

interface InvoiceExportModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: InvoiceFormValues) => void;
  contractToExport: ContractData | null; // Hợp đồng cần xuất hóa đơn
}

const InvoiceExportFormContent: React.FC<{
  onSubmit: (values: InvoiceFormValues) => void;
  contractToExport: ContractData | null;
  onCancel: () => void;
}> = ({ onSubmit, contractToExport, onCancel }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (contractToExport) {
      form.setFieldsValue({
        invoiceName: `Hóa đơn cho ${contractToExport.monthlyRent} - ${contractToExport.tenantName}`,
      });
    } else {
      form.resetFields();
    }
  }, [contractToExport, form]);

  const handleFinish = (values: InvoiceFormValues) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{ installationCost: 0 }} // Mặc định chi phí lắp đặt là 0
    >
      <Form.Item
        label="Tên hóa đơn"
        name="invoiceName"
        rules={[{ required: true, message: "Vui lòng nhập tên hóa đơn!" }]}
      >
        <Input placeholder="ví dụ: Hóa đơn cho hợp đồng số 001" />
      </Form.Item>

      {contractToExport && (
        <>
          <Form.Item label="Tên hợp đồng">
            <Input value={contractToExport.contractName} disabled />
          </Form.Item>
          <Form.Item label="Phòng">
            <Input value={contractToExport.roomTitle} disabled />
          </Form.Item>
          <Form.Item label="Giá phòng">
            <Input
              value={
                contractToExport.monthlyRent.toLocaleString("en-US") +
                " VND/tháng"
              }
              disabled
            />
          </Form.Item>
          <Form.Item label="Ngày bắt đầu thuê">
            <Input value={contractToExport.startDate} disabled />
          </Form.Item>
          <Form.Item label="Thời hạn hợp đồng">
            <Input
              value={`${contractToExport.startDate} - ${contractToExport.endDate}`}
              disabled
            />
          </Form.Item>
          <Form.Item label="Tên người thuê">
            <Input value={contractToExport.tenantName} disabled />
          </Form.Item>
        </>
      )}

      <Form.Item
        label="Chi phí lắp đặt (Tùy chọn)"
        name="installationCost"
        rules={[
          { pattern: /^\d+(\.\d{1,2})?$/, message: "Vui lòng nhập số hợp lệ!" },
        ]}
      >
        <Input type="number" placeholder="ví dụ: 500000" />
      </Form.Item>

      <Form.Item>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            Xuất hóa đơn
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

const InvoiceExportModal: React.FC<InvoiceExportModalProps> = ({
  open,
  onCancel,
  onSubmit,
  contractToExport,
}) => {
  return (
    <Modal
      title="Xuất hóa đơn thanh toán"
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden={true}
      width={500}
    >
      <InvoiceExportFormContent
        onSubmit={onSubmit}
        contractToExport={contractToExport}
        onCancel={onCancel}
      />
    </Modal>
  );
};

export default InvoiceExportModal;
