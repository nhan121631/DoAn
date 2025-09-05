import HeaderUserDashboard from "../user-dashboard/components/HeaderUserDashboard";
import Footer from "../users/components/Footer";
// import RightSidebar from "../users/components/RightSidebar";

interface DetailLayoutProps {
  children: React.ReactNode;
}

export default async function DetailLayout({ children }: DetailLayoutProps) {
  return (
    <>
      <HeaderUserDashboard />

      <div className="px-4 mx-auto mb-4 max-w-7xl lg:px-0 bg-white">
        <div className="flex flex-col lg:flex-row lg:gap-4">{children}</div>
      </div>
      <Footer />
    </>
  );
}
