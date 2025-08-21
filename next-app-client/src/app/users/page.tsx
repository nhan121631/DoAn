// import { SearchParamsType } from "@/types/types";
import BackToTop from "./components/BackToTop";
import Chatbot from "./components/Chatbot";
import CompareRoom from "./components/CompareRoom";
import RentalRooms, {
  RentalRoomsSearchParams,
} from "./components/rental_rooms";

export default async function UsersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  // Await the searchParams promise
  const params = await searchParams;

  // Normalize the params to match RentalRoomsSearchParams
  const normalizedParams = params
    ? Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, value])
      )
    : undefined;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <RentalRooms searchParams={normalizedParams as RentalRoomsSearchParams} />
      <BackToTop />
      <CompareRoom />
      <Chatbot />
    </div>
  );
}
