import UserInfoCard from "./InfoCardAndFeatured/UserInfoCard";
import FeaturedListingsCard from "./InfoCardAndFeatured/FeaturedListingsCard";

export default function RightSidebar({
  id,
  postType,
}: {
  id: string;
  postType: string;
}) {
  return (
    <div className="w-full lg:w-[350px] relative">
      <UserInfoCard id={id} />
      {/* Spacer div to prevent overlap when UserInfoCard becomes sticky */}
      <div className="h-4 lg:h-6"></div>
      <div className="relative z-0">
        {postType === "Post Normal" && <FeaturedListingsCard />}
      </div>
    </div>
  );
}
