"use client";

import React from 'react';
import { Card, Typography, Spin, List } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import Link from 'next/link';
import dayjs from 'dayjs';
import { BlogResponse } from '@/types/types';

const { Title } = Typography;

interface BlogSidebarProps {
  relatedBlogs?: BlogResponse[];
  latestBlogs?: BlogResponse[];
  loading?: boolean;
}

export default function BlogSidebar({ 
  relatedBlogs = [], 
  latestBlogs = [], 
  loading = false 
}: BlogSidebarProps) {
  const renderBlogItem = (blog: BlogResponse) => (
    <div key={blog.id} className="border-b pb-4 last:border-b-0 last:pb-0">
      <Link href={`/blogs/${blog.slug}`}>
        <div className="flex gap-3 group cursor-pointer">
          {blog.thumbnailUrl && (
            <div className="flex-shrink-0">
              <img
                src={blog.thumbnailUrl}
                alt={blog.title}
                className="w-16 h-16 object-cover rounded"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <Title 
              level={5} 
              className="!mb-1 group-hover:text-blue-600 transition-colors line-clamp-2"
            >
              {blog.title}
            </Title>
            <div className="flex items-center text-xs text-gray-500">
              <CalendarOutlined className="mr-1" />
              {dayjs(blog.createdAt).format('DD/MM/YYYY')}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-sm">
          <div className="flex justify-center py-8">
            <Spin size="small" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Related Posts */}
      {relatedBlogs.length > 0 && (
        <Card title="Bài viết liên quan" className="shadow-sm">
          <div className="space-y-4">
            {relatedBlogs.map(renderBlogItem)}
          </div>
        </Card>
      )}

      {/* Latest Posts */}
      {latestBlogs.length > 0 && (
        <Card title="Bài viết mới nhất" className="shadow-sm">
          <div className="space-y-4">
            {latestBlogs.map(renderBlogItem)}
          </div>
        </Card>
      )}
    </div>
  );
}