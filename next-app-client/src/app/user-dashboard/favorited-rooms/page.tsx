import FavoriteRoomList from "../components/favorited-rooms/FavoriteRoomList";

export default function FavoritedRoomsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="mb-4 text-2xl font-bold">Favorited Rooms</h1>
      
      <FavoriteRoomList />
    </div>
  );
}



