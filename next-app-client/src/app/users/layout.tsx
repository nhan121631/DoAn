import Header from "./components/Header";

export default function LandlordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <Header />
      {/* Banner/Slider */}
      <section
        className="relative w-full flex-shrink-0 h-[600px] flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-300"
        style={{
          backgroundImage: "url('/images/banner1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute left-8 top-1/2 -translate-y-1/2 cursor-pointer text-2xl">
          &#60;
        </div>
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-gray-500 mb-2">5 Beds · 2 Baths · 180 sqft</div>
          <h1 className="text-4xl font-bold mb-4">Office Space at Northwest</h1>
          <div className="text-2xl font-semibold mb-2">$250/month</div>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-full font-semibold shadow">
            View Details
          </button>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 cursor-pointer text-2xl">
          &#62;
        </div>
        {/* Filter/Search Bar */}
        <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-white rounded-xl shadow-lg flex items-center px-6 py-4 gap-4">
          <input
            className="flex-1 border rounded px-4 py-2"
            placeholder="Enter Keyword"
          />
          <select className="border rounded px-4 py-2">
            <option>All Status</option>
          </select>
          <select className="border rounded px-4 py-2">
            <option>All Type</option>
          </select>
          <button className="border px-4 py-2 rounded font-semibold">
            Filter
          </button>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded font-semibold">
            Search
          </button>
        </div>
      </section>
      <main className="flex-1 mt-36">{children}</main>{" "}
      <footer className="bg-gray-900 text-white text-center py-6 mt-8">
        Footer
      </footer>
    </div>
  );
}
