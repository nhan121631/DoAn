import Link from "next/link";

export default function NotFound() {
 

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 bg-gray-50">
      <div className="text-7xl mb-4 text-blue-500">😕</div>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-gray-500 mb-6 text-center max-w-md">
        Oops! The page you are looking for does not exist or has been moved.
        <br />
        Please check the URL or return to the homepage.
      </p>
      <Link
        href="/"
        className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold shadow hover:bg-blue-700 transition"
      >
        Go to Homepage
      </Link>
    </div>
  );
}
