

import React from 'react';
import RequestFormModal from '../components/request-status/RequestFormModal';

export type RequestData = {
  key: string;
  roomName: string;
  customerName: string;
  phoneNumber: string;
  requestDescription: string;
  status: 0 | 1;
};

const initialRequestData: RequestData[] = [
  {
    key: "1",
    roomName: "Phòng trọ Mr. Nam",
    customerName: "Nguyễn Văn A",
    phoneNumber: "123456789",
    requestDescription: "Yêu cầu sửa chữa điện nước",
    status: 0, 
  },
  {
    key: "2",
    roomName: "Phòng trọ Ms. Lan",
    customerName: "Trần Thị B",
    phoneNumber: "987654321",
    requestDescription: "Yêu cầu dọn dẹp phòng",
    status: 1, 
  },
  {
    key: "3",
    roomName: "Phòng trọ Mr. Duong",
    customerName: "Phạm Văn C",
    phoneNumber: "0901234567",
    requestDescription: "Yêu cầu kiểm tra điều hòa",
    status: 0,
  },
];

const RequestStatusPage: React.FC = () => {
 
  const requests = initialRequestData;

  return (
    <RequestFormModal initialRequests={requests} />
  );
};

export default RequestStatusPage;
