import Banner from "./components/Banner";
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
      <Banner />
      <main className="flex-1 mt-36">{children}</main>{" "}
      <footer className="bg-gray-900 text-white text-center py-6 mt-8">
        Footer
      </footer>
    </div>
  );
}
