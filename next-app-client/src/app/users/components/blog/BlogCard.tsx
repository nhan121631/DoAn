"use client";

import React from "react";
import {
  Card,
  Tag,
  Typography,
  Space,
  Avatar,
  Divider
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  EyeOutlined
} from "@ant-design/icons";
import Link from "next/link";
import dayjs from "dayjs";
import { BlogResponse, BlogCategory } from "@/types/types";

const { Title, Text, Paragraph } = Typography;

interface BlogCardProps {
  blog: BlogResponse;
  showReadMore?: boolean;
}

export default function BlogCard({
  blog,
  showReadMore = true
}: BlogCardProps) {
  const getCategoryColor = (category: BlogCategory) => {
    switch (category) {
      case BlogCategory.ANNOUNCEMENT:
        return "red";
      case BlogCategory.GUIDE:
        return "blue";
      case BlogCategory.NEWS:
        return "green";
      default:
        return "default";
    }
  };

  const getCategoryIcon = (category: BlogCategory) => {
    switch (category) {
      case BlogCategory.ANNOUNCEMENT:
        return "📢";
      case BlogCategory.GUIDE:
        return "📖";
      case BlogCategory.NEWS:
        return "📰";
      default:
        return "📄";
    }
  };

  return (
    <Card
      hoverable
      className="h-full shadow-sm hover:shadow-lg transition-all duration-300 border-0 flex flex-col"
      cover={
        blog.thumbnailUrl && (
          <div className="relative overflow-hidden h-48">
            <img
              alt={blog.title}
              src={blog.thumbnailUrl}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-4 left-4">
              <Tag
                color={getCategoryColor(blog.category)}
                className="font-medium"
              >
                {getCategoryIcon(blog.category)} {blog.category}
              </Tag>
            </div>
          </div>
        )
      }
    >
      <div className="flex flex-col h-full">
        {/* Nội dung chính */}
        <div className="flex-grow">
          <Link href={`/blogs/${blog.slug}`}>
            <Title
              level={4}
              className="!mb-2 hover:text-blue-600 transition-colors line-clamp-2"
            >
              {blog.title}
            </Title>
          </Link>

          <Paragraph className="text-gray-600 !mb-0 line-clamp-3">
            {blog.content.replace(/<[^>]+>/g, "")}
          </Paragraph>
        </div>

        {/* Divider + Info + Button */}
        <div className="mt-auto">
          <Divider className="!my-3" />
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <Space>
              <Avatar size="small" icon={<UserOutlined />} />
              <Text type="secondary">
                {blog.author?.name || "Admin"}
              </Text>
            </Space>
            <Space>
              <CalendarOutlined />
              <Text type="secondary">
                {dayjs(blog.createdAt).format("DD/MM/YYYY")}
              </Text>
            </Space>
          </div>

          {showReadMore && (
            <Link href={`/blogs/${blog.slug}`} key="view">
              <div className="flex items-center justify-center gap-2 py-2 text-blue-600 hover:text-blue-800 transition-colors border rounded-md">
                <EyeOutlined />
                <span>Đọc tiếp</span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
