import React from "react";
import { Pagination } from "antd";

interface PaymentPaginationProps {
  currentPage: number;
  totalRecords: number;
  pageSize: number;
  onChange: (page: number) => void;
}

const PaymentPagination: React.FC<PaymentPaginationProps> = ({
  currentPage,
  totalRecords,
  pageSize,
  onChange,
}) => (
  <div className="flex justify-end mt-4">
    <Pagination
      current={currentPage}
      total={totalRecords}
      pageSize={pageSize}
      onChange={onChange}
      showSizeChanger={false}
      showQuickJumper={false}
    />
  </div>
);

export default PaymentPagination;