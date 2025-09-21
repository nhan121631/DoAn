import { API_URL } from "@/services/Constant";

// GET /api/blogs/[slug] - Get blog by slug (public endpoint)
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  if (!slug) {
    return new Response("Slug is missing", { status: 400 });
  }
  
  try {
    const url = `${API_URL}/blogs/slug/${encodeURIComponent(slug)}`;
    
    // Call backend API (no auth required for public blogs)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return new Response("Blog not found", { status: 404 });
      }
      const errorText = await response.text();
      return new Response(errorText || "Failed to fetch blog", { status: response.status });
    }
    
    const data = await response.json();
    return new Response(JSON.stringify(data), { 
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
    
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}