import { getSession, signOut } from "next-auth/react";
import { isJwtValid } from "@/utils/jwtUtils";

/**
 * Wrapper cho fetch API với tự động logout khi JWT hết hạn
 * Kiểm tra JWT validity trước khi gửi request
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  try {
    // Lấy session từ NextAuth
    const session = await getSession();
    
    // Kiểm tra JWT còn hiệu lực không
    if (session?.user?.accessToken) {
      if (!isJwtValid(session.user.accessToken)) {
        console.log("JWT đã hết hạn, đang logout...");
        await signOut({ callbackUrl: "/auth/login", redirect: true });
        throw new Error("JWT expired - redirecting to login");
      }
    }
    
    // Tạo headers với Authorization nếu có token
    const headers = new Headers(init?.headers);
    if (session?.user?.accessToken) {
      headers.set("Authorization", `Bearer ${session.user.accessToken}`);
    }
    
    // Gọi API với token
    const response = await fetch(input, {
      ...init,
      headers,
    });

    // Kiểm tra nếu JWT hết hạn (401/403) - fallback
    if (response.status === 401 || response.status === 403) {
      console.log("API trả 401/403 - JWT có thể hết hạn, đang logout...");
      
      try {
        await signOut({ 
          callbackUrl: "/auth/login",
          redirect: true 
        });
      } catch (signOutError) {
        console.error("Lỗi khi logout:", signOutError);
        // Fallback: chuyển trang thủ công
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }
      
      throw new Error("JWT expired - redirecting to login");
    }

    return response;
  } catch (error) {
    // Nếu lỗi không phải 401/403, throw lại
    throw error;
  }
}

/**
 * Wrapper cho fetch API với JSON response và auto logout
 */
export async function fetchJsonWithAuth<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const response = await fetchWithAuth(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Helper để tạo API client với base URL
 */
export function createApiClient(baseURL: string = "") {
  const fullBaseURL = baseURL || process.env.NEXT_PUBLIC_API_URL || "";
  
  return {
    get: <T = any>(endpoint: string, init?: RequestInit) =>
      fetchJsonWithAuth<T>(`${fullBaseURL}${endpoint}`, { 
        method: "GET", 
        ...init 
      }),
      
    post: <T = any>(endpoint: string, data?: any, init?: RequestInit) =>
      fetchJsonWithAuth<T>(`${fullBaseURL}${endpoint}`, {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
        ...init,
      }),
      
    put: <T = any>(endpoint: string, data?: any, init?: RequestInit) =>
      fetchJsonWithAuth<T>(`${fullBaseURL}${endpoint}`, {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
        ...init,
      }),
      
    delete: <T = any>(endpoint: string, init?: RequestInit) =>
      fetchJsonWithAuth<T>(`${fullBaseURL}${endpoint}`, { 
        method: "DELETE", 
        ...init 
      }),
  };
}

// Export default API client
export const apiClient = createApiClient();