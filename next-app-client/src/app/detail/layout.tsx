import Footer from "../users/components/Footer";
import RightSidebar from "../users/components/RightSidebar";
import HeaderDetail from "./Header-detail";

interface DetailLayoutProps {
  children: React.ReactNode;
  // params: {
  //   userId: string;
  // };
}

export default function DetailLayout({ children }: DetailLayoutProps) {
  // const { userId } = params; // Lấy userId từ params

  return (
    <>
      <HeaderDetail />

      <div className="px-4 mx-auto my-8 max-w-7xl lg:px-0">
        <div className="flex flex-col lg:flex-row lg:gap-4">
          <div className="w-full p-6 mb-6 bg-white lg:w-2/3 rounded-xl lg:mb-0">
            {children}
          </div>

          <div className="w-full lg:w-1/3">
            <RightSidebar /> {/*userId={userId}*/}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
