// import { withAuth } from "next-auth/middleware";
// import { NextResponse } from "next/server";

// export default withAuth(
//   function middleware(req) {
//     const { token } = req.nextauth;
//     const { pathname, search } = req.nextUrl;

//     // Nếu user đã đăng nhập
//     if (token) {
//       const roles = token.roles as string[] || [];
//       console.log("Middleware - User roles:", roles, "Path:", pathname);

//       // Xác định route đích dựa trên role
//       const getCorrectRoute = (userRoles: string[]) => {
//         if (userRoles.includes('Landlords')) return '/landlord';
//         if (userRoles.includes('Users')) return '/user-dashboard';
//         return '/user-dashboard'; // default
//       };

//       const correctRoute = getCorrectRoute(roles);

//       // Nếu user truy cập sai route theo role
//       if (pathname.startsWith('/user-dashboard') && !roles.includes('Users')) {
//         console.log("Redirecting Users route to:", correctRoute);
//         return NextResponse.redirect(new URL(correctRoute + search, req.url));
//       }
      
//       if (pathname.startsWith('/landlord') && !roles.includes('Landlords')) {
//         console.log("Redirecting Landlords route to:", correctRoute);
//         return NextResponse.redirect(new URL(correctRoute + search, req.url));
//       }

//       // Cho phép truy cập đúng route
//       return NextResponse.next();
//     }

//     // Nếu chưa đăng nhập, redirect về login với callbackUrl
//     const loginUrl = new URL('/auth/login', req.url);
//     loginUrl.searchParams.set('callbackUrl', pathname + search);
//     return NextResponse.redirect(loginUrl);
//   },
//   {
//     callbacks: {
//       authorized: ({ token }) => !!token,
//     },
//   }
// );

// export const config = {
//   matcher: [
//     '/user-dashboard/:path*',
//     '/landlord/:path*'
//   ],
// };
export { default } from "next-auth/middleware";


export const config = {
  matcher: [
    '/user-dashboard/:path*',
    '/landlord/:path*'
  ],
};
