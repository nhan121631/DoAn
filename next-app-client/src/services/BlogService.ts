import { BlogResponse, BlogPageResponse, BlogCategory, BlogStatus } from '@/types/types';

const API_BASE = '/api/blogs';

export interface BlogListParams {
  page?: number;
  size?: number;
  status?: BlogStatus;
  category?: BlogCategory;
  search?: string;
}

export class BlogService {
  /**
   * Get list of blogs with pagination and filters
   */
  static async getBlogs(params: BlogListParams = {}): Promise<BlogPageResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      // Set pagination parameters
      if (params.page !== undefined) {
        searchParams.append('page', params.page.toString());
      }
      if (params.size !== undefined) {
        searchParams.append('size', params.size.toString());
      }
      
      // Add filters if provided
      if (params.status) {
        searchParams.append('status', params.status);
      }
      if (params.category) {
        searchParams.append('category', params.category);
      }
      if (params.search) {
        searchParams.append('search', params.search);
      }
      
      const url = `${API_BASE}?${searchParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
  }
  
  /**
   * Get published blogs only (for public display)
   */
  static async getPublishedBlogs(params: Omit<BlogListParams, 'status'> = {}): Promise<BlogPageResponse> {
    return this.getBlogs({
      ...params,
      status: BlogStatus.PUBLISHED,
    });
  }
  
  /**
   * Get blog by slug
   */
  static async getBlogBySlug(slug: string): Promise<BlogResponse> {
    try {
      if (!slug) {
        throw new Error('Slug is required');
      }
      
      const url = `${API_BASE}/${encodeURIComponent(slug)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Blog not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching blog by slug:', error);
      throw error;
    }
  }
  
  /**
   * Get blogs by category
   */
  static async getBlogsByCategory(
    category: BlogCategory,
    params: Omit<BlogListParams, 'category'> = {}
  ): Promise<BlogPageResponse> {
    return this.getPublishedBlogs({
      ...params,
      category,
    });
  }
  
  /**
   * Get latest blogs (first page of published blogs)
   */
  static async getLatestBlogs(size: number = 5): Promise<BlogPageResponse> {
    return this.getPublishedBlogs({
      page: 0,
      size,
    });
  }
}