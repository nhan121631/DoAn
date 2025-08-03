import { NextRequest, NextResponse } from "next/server";

export default function middleware(request: NextRequest) {
  // Lấy token từ cookie (NextAuth mặc định: 'next-auth.session-token' hoặc 'next-auth.session-token.legacy')
  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("next-auth.session-token.legacy")?.value;

  const protectedRoutes = ["/landlord"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !sessionToken) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth).*)"],
};
