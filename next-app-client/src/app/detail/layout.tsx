
import RightSidebar from '../users/components/RightSidebar'; 

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
      <div className="flex flex-col lg:flex-row lg:gap-4">
      
        <div className="w-full lg:w-2/3 bg-white rounded-xl p-6 mb-6 lg:mb-0">
          {children}
        </div>

        <div className="w-full lg:w-1/3">
          <RightSidebar  /> {/*userId={userId}*/}
        </div>
      </div>
    </div>
  );
}
