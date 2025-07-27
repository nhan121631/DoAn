import React from "react";
import { Modal, Popconfirm, Button } from "antd";
import Image from "next/image";

interface ModalPaymentProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLoading?: boolean;
}

const ModalPayment: React.FC<ModalPaymentProps> = ({
  open,
  onCancel,
  onConfirm,
  confirmLoading,
}) => {

const stk = "970422-0967522025";
const amount = 5000;
const addInfo = "Dat phong";
  return (
    <Modal open={open} onCancel={onCancel} footer={null} centered>
      <div className="flex flex-col items-center justify-center gap-5 p-6 bg-gradient-to-b from-white to-blue-50 rounded-xl">
        <div className="flex flex-col items-center gap-2">
          <Image
            src={`https://img.vietqr.io/image/${stk}-qr_only.png?amount=${amount}&addInfo=${addInfo}`}
            alt="Deposit"
            width={160}
            height={160}
            className="object-cover w-40 h-40 border-2 border-blue-300 shadow-lg rounded-xl bg-white"
          />
          <span className="text-base text-gray-700 mt-2">Quét mã QR để thanh toán</span>
        </div>
        <div className="w-full text-center bg-white rounded-lg p-3 shadow">
          <div className="text-lg font-bold text-red-600 mb-1">
            {amount.toLocaleString("en-US")}đ
          </div>
          <div className="text-gray-700 text-sm">
            Tên người nhận: <span className="font-semibold text-blue-700">DoAn</span>
          </div>
          <div className="text-gray-700 text-sm">
            Số tài khoản: <span className="font-semibold text-blue-700">{stk}</span>
          </div>
        </div>
        <Popconfirm
          title="Xác nhận chấp nhận và chuyển sang trạng thái chờ đặt cọc?"
          onConfirm={onConfirm}
          okText="Xác nhận"
          cancelText="Hủy"
          okButtonProps={{ loading: confirmLoading }}
        >
          <Button
            type="primary"
            block
            size="large"
            loading={confirmLoading}
            className="!bg-blue-600 !hover:bg-blue-700 !rounded-lg !font-semibold !text-base mt-2"
          >
            Xác nhận
          </Button>
        </Popconfirm>
      </div>
    </Modal>
  );
};

export default ModalPayment;
