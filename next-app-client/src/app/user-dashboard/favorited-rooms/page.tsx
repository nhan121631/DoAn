import FavoriteRoomList from "../components/favorited-rooms/FavoriteRoomList";

export default function FavoritedRoomsPage() {
  return (
    <div className="flex flex-col items-center justify-start pt-6 min-h-[calc(100vh-80px)] bg-gray-100">
      {/* <h1 className="mb-8 text-3xl font-bold text-gray-800">Favorite Rooms</h1> */}
      
      <div className="w-250">
        <FavoriteRoomList />
      </div>
    </div>
  );
}
