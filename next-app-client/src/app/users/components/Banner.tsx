import SearchBar from "./SearchBar";

export default function Banner() {
  return (
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
      <SearchBar />
    </section>
  );
}
