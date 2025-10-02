import { URL_IMAGE } from "../services/Constant";

// Utility function để format Cloudinary URL
export const formatCloudinaryUrl = (
  path: string | null | undefined
): string | null => {
  if (!path) return null;

  // Nếu đã có domain đầy đủ, return luôn
  if (path.startsWith("http")) return path;

  // Normalize leading slash
  let p = path;
  if (p.startsWith("/")) {
    p = p.slice(1);
  }

  // Nếu file là PDF, prefer trả về đường dẫn raw/upload để trình duyệt nhận đúng content-type
  if (/\.pdf($|\?)/i.test(p)) {
    if (p.includes("/image/upload/")) {
      return `${URL_IMAGE}/${p.replace(
        "/image/upload/",
        "/raw/upload/"
      )}`;
    }
    if (p.includes("/raw/upload/")) {
      return `https://${p}`;
    }
    // Fallback: thêm domain prefix (nhiều project lưu dạng "<cloud_name>/...")
    return `${URL_IMAGE}/${p}`;
  }

  // Nếu là path từ Cloudinary cho ảnh, thêm domain
  if (p.startsWith("res.cloudinary.com")) {
    // path already contains cloud name and upload segments without leading protocol
    return `https://${p}`;
  }

  // Fallback cho các trường hợp khác
  return `${URL_IMAGE}/${p}`;
};

// Format cho hiển thị thumbnail
export const formatCloudinaryThumbnail = (
  path: string | null | undefined,
  width = 200,
  height = 150
): string | null => {
  const fullUrl = formatCloudinaryUrl(path);
  if (!fullUrl) return null;

  // Nếu nguồn là PDF, dùng image transformation để render trang đầu dưới dạng ảnh
  if (/\.pdf($|\?)/i.test(fullUrl)) {
    // If original URL uses raw/upload, switch to image/upload with transform to generate thumbnail
    if (fullUrl.includes("/raw/upload/")) {
      return fullUrl.replace(
        "/raw/upload/",
        `/image/upload/w_${width},h_${height},c_fill/`
      );
    }
    if (fullUrl.includes("/image/upload/")) {
      return fullUrl.replace(
        "/image/upload/",
        `/image/upload/w_${width},h_${height},c_fill/`
      );
    }
    // Fallback: just return original URL
    return fullUrl;
  }

  // Chèn transformation parameters vào URL Cloudinary cho ảnh bình thường
  if (fullUrl.includes("/image/upload/")) {
    return fullUrl.replace(
      "/image/upload/",
      `/image/upload/w_${width},h_${height},c_fill/`
    );
  }
  if (fullUrl.includes("/raw/upload/")) {
    // rare: a raw URL for non-pdf - fall back to replacing with image/upload transform
    return fullUrl.replace(
      "/raw/upload/",
      `/image/upload/w_${width},h_${height},c_fill/`
    );
  }

  return fullUrl;
};

// Try to resolve a working Cloudinary URL by probing raw and image endpoints.
// Returns the first URL that responds successfully to a HEAD request, or a sensible fallback.
export const resolveCloudinaryUrl = async (
  path: string | null | undefined
): Promise<string | null> => {
  if (!path) return null;

  // If absolute URL, return as-is (no probe)
  if (path.startsWith("http")) return path;

  // Normalize
  let p = path.startsWith("/") ? path.slice(1) : path;

  // Build candidates
  const candidates: string[] = [];

  if (/\.pdf($|\?)/i.test(p)) {
    // ensure public id ends with .pdf
    if (p.includes("/image/upload/")) {
      candidates.push(`${URL_IMAGE}/${p.replace("/image/upload/", "raw/upload/")}`);
      candidates.push(`${URL_IMAGE}/${p}`);
      candidates.push(
        `${URL_IMAGE}/${p.replace("/image/upload/", "image/upload/")}`
      );
    } else if (p.includes("/raw/upload/")) {
      candidates.push(`${URL_IMAGE}/${p}`);
      candidates.push(`${URL_IMAGE}/${p.replace("/raw/upload/", "image/upload/")}`);
    } else {
      // generic
      candidates.push(`${URL_IMAGE}/${p}`);
      candidates.push(`${URL_IMAGE}/image/upload/${p}`);
      candidates.push(`${URL_IMAGE}/raw/upload/${p}`);
    }
  } else {
    // non-pdf: prefer image upload
    if (p.includes("/image/upload/") || p.includes("/raw/upload/")) {
      candidates.push(`${URL_IMAGE}/${p}`);
      candidates.push(`${URL_IMAGE}/${p.replace("/raw/upload/", "image/upload/")}`);
      candidates.push(`${URL_IMAGE}/${p.replace("/image/upload/", "raw/upload/")}`);
    } else {
      candidates.push(`${URL_IMAGE}/image/upload/${p}`);
      candidates.push(`${URL_IMAGE}/raw/upload/${p}`);
      candidates.push(`${URL_IMAGE}/${p}`);
    }
  }

  const tryHead = async (url: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, {
        method: "HEAD",
        mode: "cors",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return res.ok;
    } catch (e) {
      return false;
    }
  };

  for (const c of candidates) {
    // quick sanity skip if same as previous
    // Try HEAD — may fail due to CORS; in that case continue
    // eslint-disable-next-line no-await-in-loop
    if (await tryHead(c)) return c;
  }

  // If none succeeded, return first candidate as fallback
  return candidates[0] || null;
};
