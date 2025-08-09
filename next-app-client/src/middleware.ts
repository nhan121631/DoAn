// import { withAuth } from "next-auth/middleware";
// import { NextResponse } from "next/server";
// export default withAuth(
//   function middleware(req) {
//     const { pathname } = req.nextUrl;
//     const userRole = req.nextauth.token?.roles || [];
//     console.log("User roles:", userRole);
//     // Bảo vệ route /user-dashboard
//     if (pathname.startsWith("/user-dashboard") && !userRole.includes("Users")) {
//       return NextResponse.redirect(new URL("/auth/signin", req.url));
//     }
//     // Bảo vệ route /landlord
//     if (pathname.startsWith("/landlord") && !userRole.includes("Landlords")) {
//       return NextResponse.redirect(new URL("/auth/signin", req.url));
//     }
//     return NextResponse.next();
//   },
//   {
//     callbacks: {
//       authorized: ({ token }) => !!token, // Yêu cầu đăng nhập cho các route được bảo vệ
//     },
//   }

// import withAuth from "next-auth/middleware";

// // );

// export default withAuth(
//   function middleware(req) {
//     console.log("Middleware token:", req.nextauth.token);
//     // ...existing code...
//   },
//   // ...existing code...
// );
export { default } from "next-auth/middleware";

export const config = {
  matcher: ['/user-dashboard','/user-dashboard/:path*','/landlord','/landlord/:path*'],
}