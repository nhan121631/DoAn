"use client";

import React from 'react';
import { Row, Col, Input, Select, Space, Typography } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { BlogCategory } from '@/types/types';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

interface BlogFiltersProps {
  searchTerm: string;
  selectedCategory: BlogCategory | undefined;
  total: number;
  onSearch: (value: string) => void;
  onCategoryChange: (category: BlogCategory | undefined) => void;
}

export default function BlogFilters({
  searchTerm,
  selectedCategory,
  total,
  onSearch,
  onCategoryChange
}: BlogFiltersProps) {
  return (
    <Row gutter={[16, 16]} align="middle">
      <Col xs={24} sm={24} md={12} lg={10}>
        <Search
          placeholder="Tìm kiếm bài viết..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          value={searchTerm}
          onSearch={onSearch}
          onChange={(e) => {
            // Allow real-time search as user types
            if (e.target.value === '') {
              onSearch('');
            }
          }}
          className="w-full"
        />
      </Col>
      
      <Col xs={24} sm={12} md={6} lg={6}>
        <Select
          placeholder="Chọn danh mục"
          allowClear
          size="large"
          className="w-full"
          value={selectedCategory}
          onChange={onCategoryChange}
          suffixIcon={<FilterOutlined />}
        >
          <Option value={BlogCategory.ANNOUNCEMENT}>
            📢 Thông báo
          </Option>
          <Option value={BlogCategory.GUIDE}>
            📖 Hướng dẫn
          </Option>
          <Option value={BlogCategory.NEWS}>
            📰 Tin tức
          </Option>
        </Select>
      </Col>
      
      <Col xs={24} sm={12} md={6} lg={8}>
        <div className="flex justify-end">
          <Space>
            <Text type="secondary">
              Tổng cộng: <Text strong>{total}</Text> bài viết
            </Text>
          </Space>
        </div>
      </Col>
    </Row>
  );
}