/* eslint-disable @typescript-eslint/no-explicit-any */
// Utility functions for Cloudinary URL handling

/**
 * Cloudinary configuration
 */
export const CLOUDINARY_CONFIG = {
  baseUrl: 'https://res.cloudinary.com',
  // You can add more config here if needed
};

/**
 * Converts a relative Cloudinary path to a full URL
 * @param path - The relative path from Cloudinary (e.g., "/dmvvs0ags/image/upload/v1758249189/xs2hxaoh0hsqatadw60g.jpg")
 * @returns Full Cloudinary URL
 */
export const getFullCloudinaryUrl = (path: string): string => {
  if (!path) {
    console.warn('⚠️ Empty path provided to getFullCloudinaryUrl');
    return '';
  }

  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // If it starts with /, it's a relative path
  if (path.startsWith('/')) {
    const fullUrl = `${CLOUDINARY_CONFIG.baseUrl}${path}`;
    console.log('🔗 Converted relative path to full URL:', {
      originalPath: path,
      fullUrl: fullUrl
    });
    return fullUrl;
  }

  // If it doesn't start with /, assume it's missing the leading slash
  const fullUrl = `${CLOUDINARY_CONFIG.baseUrl}/${path}`;
  console.log('🔗 Added base URL to path:', {
    originalPath: path,
    fullUrl: fullUrl
  });
  return fullUrl;
};

/**
 * Validates if a URL is a valid Cloudinary URL
 * @param url - URL to validate
 * @returns boolean
 */
export const isCloudinaryUrl = (url: string): boolean => {
  return url.includes('res.cloudinary.com') || url.includes('cloudinary.com');
};

/**
 * Extracts the Cloudinary path from a full URL
 * @param url - Full Cloudinary URL
 * @returns Relative path
 */
export const getCloudinaryPath = (url: string): string => {
  if (!url) return '';
  
  const cloudinaryBasePattern = /https?:\/\/res\.cloudinary\.com/;
  if (cloudinaryBasePattern.test(url)) {
    return url.replace(cloudinaryBasePattern, '');
  }
  
  return url;
};

/**
 * Formats image URLs for TinyMCE editor
 * @param response - Response from upload API (can be string or object)
 * @returns Formatted URL ready for TinyMCE
 */
export const formatTinyMCEImageUrl = (response: any): string => {
  console.log('🔍 Formatting TinyMCE image URL from response:', response);
  
  let rawUrl = '';
  
  // Handle different response formats
  if (typeof response === 'string') {
    rawUrl = response;
  } else if (response && typeof response === 'object') {
    rawUrl = response.location || response.url || response.publicUrl || response.src || '';
  }
  
  console.log('📍 Extracted raw URL:', rawUrl);
  
  if (!rawUrl) {
    console.error('❌ No URL found in upload response:', response);
    throw new Error(`Invalid upload response: no URL found. Response: ${JSON.stringify(response)}`);
  }
  
  const fullUrl = getFullCloudinaryUrl(rawUrl);
  
  console.log('🎨 Formatted image URL for TinyMCE:', {
    originalResponse: response,
    extractedUrl: rawUrl,
    formattedUrl: fullUrl
  });
  
  return fullUrl;
};