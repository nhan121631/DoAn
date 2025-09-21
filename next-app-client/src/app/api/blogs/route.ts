import { API_URL } from "@/services/Constant";

// GET /api/blogs - List blogs with pagination and filters (public endpoint)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '10';
    const status = searchParams.get('status');
    const category = searchParams.get('category');
 // Will be added if backend supports it
    
    // Build backend API URL
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    
    if (status) {
      params.append('status', status);
    }
    
    if (category) {
      params.append('category', category);
    }

    
    const url = `${API_URL}/blogs?${params.toString()}`;
    
    // Call backend API (no auth required for public blogs)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText || "Failed to fetch blogs", { status: response.status });
    }
    
    const data = await response.json();
    return new Response(JSON.stringify(data), { 
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      },
    });
    
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}