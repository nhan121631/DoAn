import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Cấu hình phân quyền theo route
const rolePermissions = {
  "/user-dashboard": ["Users"], // Chỉ user
  "/landlord": ["Landlords"], // Chỉ landlord
};

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Lấy roles của user từ token
    const userRoles = token?.roles || [];
    
    // Kiểm tra phân quyền cho từng route
    for (const [route, allowedRoles] of Object.entries(rolePermissions)) {
      if (pathname.startsWith(route)) {
        // Kiểm tra user có role được phép không
        const hasPermission = allowedRoles.some(role => userRoles.includes(role));
        
        if (!hasPermission) {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
        break;
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: [
    "/user-dashboard/:path*",
    "/landlord/:path*", 
  ],
};