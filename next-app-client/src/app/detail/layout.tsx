
import RightSidebar from '../landlord/components/room-detail/RightSidebar'; 

interface DetailLayoutProps {
  children: React.ReactNode; 
  params: {
    userId: string; 
  };
}

export default function DetailLayout({ children, params }: DetailLayoutProps) {
  const { userId } = params; // Lấy userId từ params

  return (
    <div className="max-w-7xl mx-auto my-8 px-4 lg:px-0">
      {/* Bố cục 2 cột trên màn hình lớn */}
      <div className="flex flex-col lg:flex-row lg:gap-8">
      
        <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-lg p-6 mb-6 lg:mb-0">
          {children}
        </div>

        {/* Cột phải: Sidebar chứa thông tin người dùng và tin đăng nổi bật */}
        <div className="w-full lg:w-1/3">
          {/* Truyền userId xuống RightSidebar để nó có thể fetch dữ liệu động */}
          <RightSidebar  /> {/*userId={userId}*/}
        </div>
      </div>
    </div>
  );
}
