import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // Nếu user đã đăng nhập
    if (token) {
      const roles = token.roles as string[] || [];

      // Điều hướng dựa trên role
      if (pathname.startsWith('/user-dashboard') && !roles.includes('Users')) {
        if (roles.includes('Landlords')) {
          return NextResponse.redirect(new URL('/landlord', req.url));
        }
      }
      
      if (pathname.startsWith('/landlord') && !roles.includes('Landlords')) {
        if (roles.includes('Users')) {
          return NextResponse.redirect(new URL('/user-dashboard', req.url));
        }
      }

      // Nếu truy cập root path của role area, điều hướng đúng
      if (pathname === '/user-dashboard' && roles.includes('Users')) {
        return NextResponse.next();
      }
      
      if (pathname === '/landlord' && roles.includes('Landlords')) {
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/user-dashboard/:path*',
    '/landlord/:path*'
  ],
};