"use client";

import React from 'react';
import { Typography, Card, Space } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface BlogHeaderProps {
  title?: string;
  description?: string;
}

export default function BlogHeader({ 
  title = "Blog & News",
  description = "Khám phá những bài viết hữu ích về cho thuê phòng trọ, hướng dẫn và tin tức mới nhất từ cộng đồng Ants"
}: BlogHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <Title level={1} className="!mb-4">
            <FileTextOutlined className="mr-3 text-blue-600" />
            {title}
          </Title>
          <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
            {description}
          </Paragraph>
        </div>
      </div>
    </div>
  );
}