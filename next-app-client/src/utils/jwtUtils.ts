/* eslint-disable @typescript-eslint/no-explicit-any */
export function decodeJwtPayload(token: string): any {
  try {
    // JWT có 3 phần: header.payload.signature
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

// Helper function để lấy thời gian hết hạn từ JWT
export function getJwtExpiration(token: string): number | null {
  const payload = decodeJwtPayload(token);
  return payload?.exp ? payload.exp * 1000 : null; // Convert từ seconds sang milliseconds
}

// Helper function để kiểm tra JWT còn hiệu lực không
export function isJwtValid(token: string): boolean {
  const expTime = getJwtExpiration(token);
  if (!expTime) return false;
  return Date.now() < expTime;
}