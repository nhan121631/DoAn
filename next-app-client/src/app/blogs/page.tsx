"use client";

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Pagination, 
  Spin,
  Empty,
  Button,
  Input,
  Select,
  Typography,
  Space,
  Tag,
  Avatar,
  Divider
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  CalendarOutlined, 
  UserOutlined, 
  EyeOutlined,
  FileTextOutlined,
  HomeOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import dayjs from 'dayjs';
import { BlogService } from '@/services/BlogService';
import { BlogCategory, BlogStatus, BlogResponse } from '@/types/types';

const { Search } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(9);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | undefined>();
  const [selectedStatus] = useState<BlogStatus>(BlogStatus.PUBLISHED);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await BlogService.getBlogs({
        page: currentPage - 1,
        size: pageSize,
        status: selectedStatus,
        category: selectedCategory,
        search: searchTerm
      });
      
      setBlogs(response.content);
      setTotal(response.totalElements);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, selectedCategory, selectedStatus, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: BlogCategory | undefined) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper functions
  const getCategoryColor = (category: BlogCategory) => {
    switch (category) {
      case BlogCategory.ANNOUNCEMENT:
        return 'red';
      case BlogCategory.GUIDE:
        return 'blue';
      case BlogCategory.NEWS:
        return 'green';
      default:
        return 'default';
    }
  };

  const getCategoryIcon = (category: BlogCategory) => {
    switch (category) {
      case BlogCategory.ANNOUNCEMENT:
        return '📢';
      case BlogCategory.GUIDE:
        return '📖';
      case BlogCategory.NEWS:
        return '📰';
      default:
        return '📄';
    }
  };

  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    const plainText = stripHtmlTags(content);
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };

  const extractFirstImage = (content: string) => {
    const imgRegex = /<img[^>]+src="([^">]+)"/;
    const match = content.match(imgRegex);
    return match ? match[1] : null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Background Image */}
      <div 
        className="relative h-96 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/images/banner3.jpg")'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <Title level={1} className="!text-white !mb-4 text-4xl md:text-5xl font-bold">
              <FileTextOutlined className="mr-4" />
              Blog & News
            </Title>
            <Paragraph className="!text-white/90 text-lg md:text-xl max-w-3xl mx-auto px-4">
              Discover helpful articles about room rentals, guides and latest news from Ants community
            </Paragraph>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200">
            <HomeOutlined className="mr-2 text-base" />
            <Text className="text-base font-medium">Home</Text>
          </Link>
        </div>

        {/* Search & Filter Section */}
        <Card className="mb-8 shadow-lg rounded-2xl border-0">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={24} md={12} lg={10}>
              <Search
                placeholder="Search articles..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={searchTerm}
                onSearch={handleSearch}
                onChange={(e) => {
                  if (e.target.value === '') {
                    handleSearch('');
                  }
                }}
                className="w-full"
              />
            </Col>
            
            <Col xs={24} sm={12} md={6} lg={6}>
              <Select
                placeholder="Select category"
                allowClear
                size="large"
                className="w-full"
                value={selectedCategory}
                onChange={handleCategoryChange}
                suffixIcon={<FilterOutlined />}
              >
                <Option value={BlogCategory.ANNOUNCEMENT}>
                  📢 Announcement
                </Option>
                <Option value={BlogCategory.GUIDE}>
                  📖 Guide
                </Option>
                <Option value={BlogCategory.NEWS}>
                  📰 News
                </Option>
              </Select>
            </Col>
            
            <Col xs={24} sm={12} md={6} lg={8}>
              <div className="flex justify-end">
                <Space>
                  <Text type="secondary" className="text-lg">
                    Total: <Text strong className="text-blue-600">{total}</Text> articles
                  </Text>
                </Space>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Blog Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : blogs.length === 0 ? (
          <Empty
            description="No articles found"
            className="py-20"
          >
            <Button type="primary" size="large" onClick={() => {
              setSearchTerm('');
              setSelectedCategory(undefined);
              setCurrentPage(1);
            }}>
              Clear filters
            </Button>
          </Empty>
        ) : (
          <Row gutter={[32, 32]}>
            {blogs.map((blog) => {
              const firstImage = blog.thumbnailUrl || extractFirstImage(blog.content);
              
              return (
                <Col xs={24} sm={12} lg={8} key={blog.id}>
                  <Card
                    hoverable
                    className="h-full shadow-lg hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl overflow-hidden group"
                    cover={
                      firstImage && (
                        <div className="relative overflow-hidden h-56">
                          <img
                            alt={blog.title}
                            src={firstImage}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <div className="absolute top-4 left-4">
                            <Tag 
                              color={getCategoryColor(blog.category)} 
                              className="font-semibold text-sm px-3 py-1 rounded-full border-0"
                            >
                              {getCategoryIcon(blog.category)} {blog.category}
                            </Tag>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      )
                    }
                  >
                    <div className="p-2">
                      <Link href={`/blogs/${blog.slug}`}>
                        <Title 
                          level={4} 
                          className="!mb-3 hover:text-blue-600 transition-colors line-clamp-2 group-hover:text-blue-600"
                        >
                          {blog.title}
                        </Title>
                      </Link>
                      
                      <Paragraph 
                        className="text-gray-600 !mb-4 line-clamp-3 leading-relaxed"
                      >
                        {truncateContent(blog.content)}
                      </Paragraph>
                      
                      <Divider className="!my-4" />
                      
                      <div className="flex items-center justify-between">
                        <Space className="text-sm text-gray-500">
                          <Avatar size="small" icon={<UserOutlined />} className="bg-blue-500" />
                          <Text type="secondary" className="font-medium">
                            {blog.author?.name || 'Admin'}
                          </Text>
                        </Space>
                        <Space className="text-sm text-gray-500">
                          <CalendarOutlined className="text-blue-500" />
                          <Text type="secondary">
                            {dayjs(blog.createdAt).format('DD/MM/YYYY')}
                          </Text>
                        </Space>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <Link href={`/blogs/${blog.slug}`}>
                          <Button 
                            type="primary" 
                            ghost 
                            className="w-full border-2 font-semibold hover:bg-blue-50"
                            icon={<EyeOutlined />}
                          >
                            Read more
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        {/* Pagination */}
        { (
          <div className="flex justify-center mt-16">
            <Pagination
              current={currentPage}
              total={total}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} articles`
              }
              className="text-center"
            />
          </div>
        )}
      </div>
      
      {/* Custom CSS for line-clamp */}
      <style jsx global>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
