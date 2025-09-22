"use client";

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Tag, 
  Button, 
  Space, 
  Avatar, 
  Divider,
  Spin,
  Result,
  Breadcrumb,
  Row,
  Col,
  FloatButton
} from 'antd';
import { 
  CalendarOutlined, 
  UserOutlined, 
  ArrowLeftOutlined,
  HomeOutlined,
  FileTextOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { BlogService } from '@/services/BlogService';
import { BlogCategory, BlogResponse } from '@/types/types';

const { Title, Text } = Typography;

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const [blog, setBlog] = useState<BlogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogResponse[]>([]);
  const router = useRouter();
  
  // Unwrap params using React.use()
  const { slug } = React.use(params);

  const fetchBlog = async () => {
    setLoading(true);
    setError(null);
    try {
      const blogData = await BlogService.getBlogBySlug(slug);
      setBlog(blogData);
      
      // Fetch related blogs from same category
      if (blogData.category) {
        try {
          const related = await BlogService.getBlogsByCategory(blogData.category);
          const filteredRelated = related.content.filter((b: BlogResponse) => b.id !== blogData.id).slice(0, 3);
          setRelatedBlogs(filteredRelated);
        } catch (relatedError) {
          console.error('Error fetching related blogs:', relatedError);
        }
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError('Không tìm thấy bài viết này');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

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

  // Function to clean HTML content and fix Vietnamese characters
  const cleanHtmlContent = (html: string) => {
    return html
      .replace(/&iacute;/g, 'í')
      .replace(/&aacute;/g, 'á')
      .replace(/&eacute;/g, 'é')
      .replace(/&oacute;/g, 'ó')
      .replace(/&uacute;/g, 'ú')
      .replace(/&yacute;/g, 'ý')
      .replace(/&agrave;/g, 'à')
      .replace(/&egrave;/g, 'è')
      .replace(/&igrave;/g, 'ì')
      .replace(/&ograve;/g, 'ò')
      .replace(/&ugrave;/g, 'ù')
      .replace(/&atilde;/g, 'ã')
      .replace(/&etilde;/g, 'ẽ')
      .replace(/&itilde;/g, 'ĩ')
      .replace(/&otilde;/g, 'õ')
      .replace(/&utilde;/g, 'ũ')
      .replace(/&acirc;/g, 'â')
      .replace(/&ecirc;/g, 'ê')
      .replace(/&icirc;/g, 'î')
      .replace(/&ocirc;/g, 'ô')
      .replace(/&ucirc;/g, 'û')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/Báº¡/g, 'ạ')
      .replace(/Báº£/g, 'ả')
      .replace(/Báº¥/g, 'ấ')
      .replace(/Báº§/g, 'ầ')
      .replace(/Báº©/g, 'ẩ')
      .replace(/Báº«/g, 'ẫ')
      .replace(/Báº­/g, 'ậ')
      .replace(/Báº¯/g, 'ắ')
      .replace(/Báº±/g, 'ằ')
      .replace(/Báº³/g, 'ẳ')
      .replace(/Báº·/g, 'ặ')
      .replace(/Ä/g, 'Đ')
      .replace(/Ä'/g, 'đ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Result
            status="404"
            title="404"
            subTitle={error || "Xin lỗi, không tìm thấy bài viết bạn đang tìm kiếm."}
            extra={
              <Space>
                <Button type="primary" onClick={() => router.back()}>
                  <ArrowLeftOutlined /> Quay lại
                </Button>
                <Link href="/blogs">
                  <Button>Xem tất cả bài viết</Button>
                </Link>
              </Space>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Clean Hero Section với background image only */}
        <div className="relative bg-cover bg-center bg-no-repeat h-64" 
             style={{
               backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/images/banner3.jpg")'
             }}>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <Row gutter={[32, 32]}>
            {/* Main Content */}
            <Col xs={24} lg={16}>
              <Card className="shadow-2xl rounded-3xl border-0 overflow-hidden bg-white">
                {/* Featured Image */}
                {blog.thumbnailUrl && (
                  <div className="relative overflow-hidden">
                    <img
                      src={blog.thumbnailUrl}
                      alt={blog.title}
                      className="w-full h-64 md:h-96 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                )}

                <div className="p-8 md:p-12">
                  {/* Blog Header Info */}
                  <div className="mb-8">
                    {/* Breadcrumb */}
                    <Breadcrumb
                      className="mb-6"
                      items={[
                        {
                          title: (
                            <Link href="/" className="flex items-center text-gray-600 hover:text-blue-600">
                              <HomeOutlined className="mr-1" />
                              Home
                            </Link>
                          ),
                        },
                        {
                          title: (
                            <Link href="/blogs" className="flex items-center text-gray-600 hover:text-blue-600">
                              <FileTextOutlined className="mr-1" />
                              Blogs
                            </Link>
                          ),
                        },
                        {
                          title: <span className="text-gray-800 font-medium">{blog.title.length > 50 ? `${blog.title.substring(0, 50)}...` : blog.title}</span>,
                        },
                      ]}
                    />

                    {/* Category Tag */}
                    <div className="mb-6">
                      <Tag color={getCategoryColor(blog.category)} className="text-lg font-semibold px-4 py-2 rounded-full">
                        {getCategoryIcon(blog.category)} {blog.category}
                      </Tag>
                    </div>
                    
                    {/* Blog Title */}
                    <Title level={1} className="!mb-6 !text-3xl md:!text-4xl lg:!text-5xl leading-tight !text-gray-900">
                      {blog.title}
                    </Title>
                    
                    {/* Blog Meta Info */}
                    <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
                      <Space size={16}>
                        <Avatar size={48} icon={<UserOutlined />} className="bg-blue-600" />
                        <div>
                          <Text className="block font-medium text-gray-800 text-lg">{blog.author?.name || 'Admin'}</Text>
                          <Text className="text-gray-500 text-sm">Tác giả</Text>
                        </div>
                      </Space>
                      
                      <Divider type="vertical" className="h-12" />
                      
                      <Space direction="vertical" size="small">
                        <Space>
                          <CalendarOutlined className="text-blue-500" />
                          <Text className="font-medium text-gray-700">{dayjs(blog.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                        </Space>
                        {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
                          <Space>
                            <ClockCircleOutlined className="text-green-500" />
                            <Text className="text-gray-600 text-sm">
                              Cập nhật: {dayjs(blog.updatedAt).format('DD/MM/YYYY HH:mm')}
                            </Text>
                          </Space>
                        )}
                      </Space>
                    </div>

                    <Divider />
                  </div>
                  {/* Blog Content */}
                  <div className="prose prose-xl max-w-none">
                    <div 
                      className="text-gray-800 leading-relaxed blog-content"
                      dangerouslySetInnerHTML={{ __html: cleanHtmlContent(blog.content) }}
                    />
                  </div>

                  {/* Navigation */}
                  <div className="mt-16 pt-8 border-t border-gray-200">
                    <Row gutter={16}>
                      <Col>
                        <Button 
                          size="large"
                          onClick={() => router.back()} 
                          icon={<ArrowLeftOutlined />}
                          className="hover:bg-gray-50 h-12 px-6 rounded-xl"
                        >
                          Quay lại
                        </Button>
                      </Col>
                      <Col>
                        <Link href="/blogs">
                          <Button type="primary" size="large" className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-xl">
                            Xem tất cả bài viết
                          </Button>
                        </Link>
                      </Col>
                    </Row>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Sidebar */}
            <Col xs={24} lg={8}>
              <div className="space-y-8">
                {/* Related Posts */}
                {relatedBlogs.length > 0 && (
                  <Card 
                    title={
                      <div className="flex items-center gap-3">
                        <FileTextOutlined className="text-blue-600 text-xl" />
                        <span className="text-xl font-bold">Bài viết liên quan</span>
                      </div>
                    } 
                    className="shadow-xl rounded-3xl border-0"
                  >
                    <div className="space-y-4">
                      {relatedBlogs.map((relatedBlog) => {
                        // Extract first image from content if no thumbnail
                        const extractFirstImage = (content: string) => {
                          const imgRegex = /<img[^>]+src="([^">]+)"/;
                          const match = content.match(imgRegex);
                          return match ? match[1] : null;
                        };
                        
                        const blogImage = relatedBlog.thumbnailUrl || extractFirstImage(relatedBlog.content);
                        
                        return (
                          <div key={relatedBlog.id} className="group">
                            <Link href={`/blogs/${relatedBlog.slug}`}>
                              <div className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 cursor-pointer hover:shadow-lg border border-transparent hover:border-blue-100">
                                {/* Blog Image */}
                                <div className="flex-shrink-0">
                                  {blogImage ? (
                                    <img
                                      src={blogImage}
                                      alt={relatedBlog.title}
                                      className="w-20 h-20 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/images/default-blog.jpg'; // Fallback image
                                      }}
                                    />
                                  ) : (
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                                      <FileTextOutlined className="text-2xl text-blue-600" />
                                    </div>
                                  )}
                                </div>
                                
                                {/* Blog Content */}
                                <div className="flex-1 min-w-0">
                                  <Title 
                                    level={5} 
                                    className="!mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 !text-base !font-semibold leading-tight"
                                  >
                                    {relatedBlog.title}
                                  </Title>
                                  
                                  {/* Category Tag */}
                                  <div className="mb-2">
                                    <Tag 
                                      color={
                                        relatedBlog.category === 'NEWS' ? 'green' :
                                        relatedBlog.category === 'GUIDE' ? 'blue' :
                                        relatedBlog.category === 'ANNOUNCEMENT' ? 'red' : 'default'
                                      } 
                                      className="text-xs px-2 py-0.5 rounded-full"
                                    >
                                      {relatedBlog.category === 'NEWS' ? '📰' :
                                       relatedBlog.category === 'GUIDE' ? '📖' :
                                       relatedBlog.category === 'ANNOUNCEMENT' ? '📢' : '📄'} 
                                      {relatedBlog.category}
                                    </Tag>
                                  </div>
                                  
                                  {/* Date */}
                                  <div className="flex items-center text-xs text-gray-500">
                                    <CalendarOutlined className="mr-1 text-blue-500" />
                                    {dayjs(relatedBlog.createdAt).format('DD/MM/YYYY')}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}
                <div className="p-1"></div>

                {/* Latest Posts */}
                <Card 
                  title={
                    <div className="flex items-center gap-3">
                      <ClockCircleOutlined className="text-green-600 text-xl" />
                      <span className="text-xl font-bold">Bài viết mới nhất</span>
                    </div>
                  } 
                  className="shadow-xl rounded-3xl border-0"
                >
                  <LatestBlogsList currentBlogId={blog.id} />
                </Card>
              </div>
            </Col>
          </Row>
        </div>

        <FloatButton.BackTop 
          style={{ 
            right: 32, 
            bottom: 32 
          }} 
        />
      </div>

      {/* Custom CSS */}
      <style jsx global>{`
        .blog-content {
          line-height: 1.9;
          font-size: 1.1rem;
        }
        
        .blog-content h1, .blog-content h2, .blog-content h3, .blog-content h4, .blog-content h5, .blog-content h6 {
          margin-top: 2.5rem;
          margin-bottom: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }
        
        .blog-content h1 { font-size: 2.5rem; }
        .blog-content h2 { font-size: 2rem; }
        .blog-content h3 { font-size: 1.75rem; }
        .blog-content h4 { font-size: 1.5rem; }
        .blog-content h5 { font-size: 1.25rem; }
        .blog-content h6 { font-size: 1.125rem; }
        
        .blog-content p {
          margin-bottom: 1.8rem;
          color: #374151;
          text-align: justify;
        }
        
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 1rem;
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
          margin: 2rem auto;
          display: block;
        }
        
        .blog-content ul, .blog-content ol {
          margin: 2rem 0;
          padding-left: 2rem;
        }
        
        .blog-content li {
          margin-bottom: 0.75rem;
          color: #374151;
        }
        
        .blog-content blockquote {
          border-left: 5px solid #3b82f6;
          padding: 1.5rem 1.5rem 1.5rem 2.5rem;
          margin: 2rem 0;
          font-style: italic;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 0 1rem 1rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .blog-content code {
          background-color: #f1f5f9;
          padding: 0.375rem 0.75rem;
          border-radius: 0.5rem;
          font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
          font-size: 0.9rem;
          color: #1e293b;
        }
        
        .blog-content pre {
          background-color: #1e293b;
          color: #f1f5f9;
          padding: 2rem;
          border-radius: 1rem;
          overflow-x: auto;
          margin: 2rem 0;
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
        }
        
        .blog-content pre code {
          background: transparent;
          padding: 0;
          color: inherit;
          border-radius: 0;
        }
        
        .blog-content a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        
        .blog-content a:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }
        
        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-radius: 1rem;
          overflow: hidden;
        }
        
        .blog-content th,
        .blog-content td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .blog-content th {
          background-color: #f9fafb;
          font-weight: 600;
          color: #374151;
        }
        
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
    </>
  );
}

// Component for latest blogs in sidebar
function LatestBlogsList({ currentBlogId }: { currentBlogId: string }) {
  const [latestBlogs, setLatestBlogs] = useState<BlogResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestBlogs = async () => {
      try {
        const blogsResponse = await BlogService.getLatestBlogs(5);
        const filtered = blogsResponse.content.filter((blog: BlogResponse) => blog.id !== currentBlogId);
        setLatestBlogs(filtered);
      } catch (error) {
        console.error('Error fetching latest blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestBlogs();
  }, [currentBlogId]);

  if (loading) {
    return <div className="text-center py-4"><Spin size="small" /></div>;
  }

  // Extract first image from content if no thumbnail
  const extractFirstImage = (content: string) => {
    const imgRegex = /<img[^>]+src="([^">]+)"/;
    const match = content.match(imgRegex);
    return match ? match[1] : null;
  };

  return (
    <div className="space-y-4">
      {latestBlogs.map((blog) => {
        const blogImage = blog.thumbnailUrl || extractFirstImage(blog.content);
        
        return (
          <div key={blog.id} className="group">
            <Link href={`/blogs/${blog.slug}`}>
              <div className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 cursor-pointer hover:shadow-lg border border-transparent hover:border-green-100">
                {/* Blog Image */}
                <div className="flex-shrink-0">
                  {blogImage ? (
                    <img
                      src={blogImage}
                      alt={blog.title}
                      className="w-20 h-20 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/default-blog.jpg'; // Fallback image
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                      <ClockCircleOutlined className="text-2xl text-green-600" />
                    </div>
                  )}
                </div>
                
                {/* Blog Content */}
                <div className="flex-1 min-w-0">
                  <Title 
                    level={5} 
                    className="!mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 !text-base !font-semibold leading-tight"
                  >
                    {blog.title}
                  </Title>
                  
                  {/* Category Tag */}
                  <div className="mb-2">
                    <Tag 
                      color={
                        blog.category === 'NEWS' ? 'green' :
                        blog.category === 'GUIDE' ? 'blue' :
                        blog.category === 'ANNOUNCEMENT' ? 'red' : 'default'
                      } 
                      className="text-xs px-2 py-0.5 rounded-full"
                    >
                      {blog.category === 'NEWS' ? '📰' :
                       blog.category === 'GUIDE' ? '📖' :
                       blog.category === 'ANNOUNCEMENT' ? '📢' : '📄'} 
                      {blog.category}
                    </Tag>
                  </div>
                  
                  {/* Date */}
                  <div className="flex items-center text-xs text-gray-500">
                    <CalendarOutlined className="mr-1 text-green-500" />
                    {dayjs(blog.createdAt).format('DD/MM/YYYY')}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}