import UserInfoCard from "./InfoCardAndFeatured/UserInfoCard";
import FeaturedListingsCard from "./InfoCardAndFeatured/FeaturedListingsCard";

export default function RightSidebar({ id }: { id: string }) {
  return (
    <div className="w-full lg:w-[350px] flex flex-col mt-15">
      <UserInfoCard id={id} />
      <FeaturedListingsCard />
    </div>
  );
}
