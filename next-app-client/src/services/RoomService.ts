export async function createRoom(images: File[] | null, room: string) {
  const formData = new FormData();
  if (images && Array.isArray(images)) {
    images.forEach((image) => {
      formData.append("images", image);
    });
  }
  formData.append("room", room);

  const response = await fetch("/api/landlord/room", {
    method: "POST",
    body: formData,
  });

    if (!(response).ok) {
        // throw new Error("Failed to create room");
        const data = await response.json();
        throw data;
    }
    return response.json();

}