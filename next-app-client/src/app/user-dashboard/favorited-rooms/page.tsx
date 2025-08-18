// import FavoriteRoomList from "../components/favorited-rooms/FavoriteRoomList";

// export default function FavoritedRoomsPage() {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
//       <h1 className="mb-4 text-2xl font-bold">Favorited Rooms</h1>
      
//       <FavoriteRoomList />
//     </div>
//   );
// }




import FavoriteRoomList from "../components/favorited-rooms/FavoriteRoomList";

export default function FavoritedRoomsPage() {
  return (
    <div className="flex flex-col items-center justify-start pt-6 min-h-[calc(100vh-80px)] bg-gray-100">
      <h1 className="mb-8 text-3xl font-bold text-gray-800">Favorited Rooms</h1>
      
      <div className="w-full max-w-[1200px] px-4">
        <FavoriteRoomList />
      </div>
    </div>
  );
}