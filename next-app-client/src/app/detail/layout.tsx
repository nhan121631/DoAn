import Footer from "../users/components/Footer";
// import RightSidebar from "../users/components/RightSidebar";
import HeaderDetail from "./Header-detail";

interface DetailLayoutProps {
  children: React.ReactNode;
}

export default async function DetailLayout({ children }: DetailLayoutProps) {
  return (
    <>
      <HeaderDetail />

      <div className="px-4 mx-auto mb-4 max-w-7xl lg:px-0">
        <div className="flex flex-col lg:flex-row lg:gap-4">{children}</div>
      </div>
      <Footer />
    </>
  );
}
