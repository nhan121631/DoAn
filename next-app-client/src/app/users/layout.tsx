import Banner from "./components/Banner";
import Footer from "./components/Footer";
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
      <Footer />
    </div>
  );
}
