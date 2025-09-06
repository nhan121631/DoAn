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
        invoiceName: `Invoice for ${contractToExport.monthlyRent} - ${contractToExport.tenantName}`,
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
        label="Invoice Name"
        name="invoiceName"
        rules={[{ required: true, message: "Please enter invoice name!" }]}
      >
        <Input placeholder="e.g., Invoice for Contract No. 001" />
      </Form.Item>

      {contractToExport && (
        <>
          <Form.Item label="Contract Name">
            <Input value={contractToExport.contractName} disabled />
          </Form.Item>
          <Form.Item label="Room">
            <Input value={contractToExport.roomTitle} disabled />
          </Form.Item>
          <Form.Item label="Room Price">
            <Input value={contractToExport.monthlyRent.toLocaleString("en-US") + " VND/month"} disabled />
          </Form.Item>
          <Form.Item label="Lease Start Date">
            <Input value={contractToExport.startDate} disabled />
          </Form.Item>
          <Form.Item label="Duration">
            <Input value={`${contractToExport.startDate} - ${contractToExport.endDate}`} disabled />
          </Form.Item>
          <Form.Item label="Tenant Name">
            <Input value={contractToExport.tenantName} disabled />
          </Form.Item>
        </>
      )}

      <Form.Item
        label="Installation Cost (Optional)"
        name="installationCost"
        rules={[{ pattern: /^\d+(\.\d{1,2})?$/, message: 'Please enter a valid number!' }]}
      >
        <Input type="number" placeholder="e.g., 500000" />
      </Form.Item>

      <Form.Item>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Export Invoice
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
      title="Export Checkout Invoice"
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
