"use client";
import React from 'react';
import { Modal, Descriptions, Tag } from 'antd';
import { Requirement } from '@/types/types';
import Image from 'next/image';

interface RequestDetailModalProps {
  open: boolean;
  onCancel: () => void;
  request: Requirement | null;
}

const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  open,
  onCancel,
  request,
}) => {
  if (!request) return null;

  // Debug log
  console.log('Request imageUrl:', request.imageUrl);

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return <Tag color="blue">Not processed</Tag>;
      case 1:
        return <Tag color="green">Completed</Tag>;
      case 2:
        return <Tag color="red">Rejected</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const getImageUrl = (imageUrl?: string): string => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `https://res.cloudinary.com${imageUrl}`;
  };

  const extendedRequest = request as Requirement & {
    roomTitle?: string;
    userName?: string;
    email?: string;
    createdDate?: string;
    imageUrl?: string;
  };

  return (
    <Modal
      title="Request Details"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      centered
    >
      <div className="space-y-4">
        <Descriptions
          bordered
          column={1}
          size="middle"
          items={[
            {
              key: 'roomName',
              label: 'Room Name',
              children: <span className="font-medium">{extendedRequest.roomTitle || 'N/A'}</span>,
            },
            {
              key: 'customerName',
              label: 'Customer Name',
              children: extendedRequest.userName || 'N/A',
            },
            {
              key: 'email',
              label: 'Email',
              children: extendedRequest.email || 'N/A',
            },
            {
              key: 'createdDate',
              label: 'Created Date',
              children: extendedRequest.createdDate ? 
                new Date(extendedRequest.createdDate).toLocaleString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }) : 'N/A',
            },
            {
              key: 'status',
              label: 'Status',
              children: getStatusTag(request.status),
            },
            {
              key: 'description',
              label: 'Request Description',
              children: (
                <div className="overflow-y-auto whitespace-pre-wrap max-h-32">
                  {request.description}
                </div>
              ),
            },
          ]}
        />

        {/* Image Section */}
        {extendedRequest.imageUrl ? (
          <div className="mt-4">
            <h4 className="mb-2 text-lg font-medium">Attached Image:</h4>
            <div className="flex justify-center">
              <div className="relative" style={{ maxHeight: '400px', maxWidth: '100%' }}>
                <Image
                  src={getImageUrl(extendedRequest.imageUrl)}
                  alt="Request image"
                  width={400}
                  height={300}
                  style={{ maxHeight: '400px', maxWidth: '100%', objectFit: 'contain' }}
                  onLoad={() => console.log('Image loaded successfully')}
                  onError={(e) => {
                    console.error('Image failed to load:', e);
                    console.log('Attempted URL:', getImageUrl(extendedRequest.imageUrl));
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 text-center text-gray-500">
            <div className="flex items-center justify-center h-40 bg-gray-100 border-2 border-gray-300 border-dashed">
              <p>No image attached to this request</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RequestDetailModal;