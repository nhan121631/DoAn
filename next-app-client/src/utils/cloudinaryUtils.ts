// Utility function để format Cloudinary URL
export const formatCloudinaryUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  
  // Nếu đã có domain đầy đủ, return luôn
  if (path.startsWith('http')) return path;
  
  // Nếu là path từ Cloudinary, thêm domain
  if (path.startsWith('/')) {
    return `https://res.cloudinary.com${path}`;
  }
  
  // Fallback cho các trường hợp khác
  return `https://res.cloudinary.com/${path}`;
};

// Format cho hiển thị thumbnail
export const formatCloudinaryThumbnail = (path: string | null | undefined, width = 200, height = 150): string | null => {
  const fullUrl = formatCloudinaryUrl(path);
  if (!fullUrl) return null;
  
  // Chèn transformation parameters vào URL Cloudinary
  return fullUrl.replace('/image/upload/', `/image/upload/w_${width},h_${height},c_fill/`);
};