/* eslint-disable @typescript-eslint/no-explicit-any */

import { API_URL } from "./Constant";

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

  if (!response.ok) {
    // throw new Error("Failed to create room");
    const data = await response.json();
    throw data;
  }
  return response.json();
}

export async function updateRoom(roomId: string, formData: FormData) {
  // Log
  console.log("--- UPDATE ROOM API ---");
  console.log("roomId:", roomId);
  for (const pair of formData.entries()) {
    console.log(pair[0] + ":", pair[1]);
  }
  console.log("-----------------------");

  const response = await fetch(`/api/landlord/room?roomId=${roomId}`, {
    method: "PATCH",
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to update room");
  }
  return response.json();
}

export async function getRoomsByLandlord(page: number, size: number) {
  try {
    const response = await fetch(
      `/api/landlord/room?page=${page}&size=${size}`
    );
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to fetch rooms");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return null;
  }
}

export async function updateRoomPostExtend(
  roomId: string,
  postStartDate: string,
  postEndDate: string,
  typepostId: string
) {
  const response = await fetch("/api/landlord/room/extend", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      roomId,
      postStartDate,
      postEndDate,
      typepostId,
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to update room post");
  }
  return response.json();
}

export async function hideShowRoom(roomId: string, isHidden: number) {
  const response = await fetch(`/api/landlord/room/hide-show`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ roomId, isHidden }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to update room visibility");
  }
  return response.json();
}

export async function getRoomById(id: string) {
  try {
    console.log("Fetching room with ID:", id);
    const response = await fetch(`${API_URL}/rooms/${id}`);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to fetch room");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching room:", error);
    return null;
  }
}

export async function getRoomVipUser(page: number, size: number) {
  try {
    const response = await fetch(
      `${API_URL}/rooms/allroom-vip?page=${page}&size=${size}`
    );
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to fetch room images");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching room images:", error);
    return null;
  }
}
export async function getRoomNormalUser(page: number, size: number) {
  try {
    const response = await fetch(
      `${API_URL}/rooms/allroom-normal?page=${page}&size=${size}`
    );
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to fetch room images");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching room images:", error);
    return null;
  }
}

//------filter rooms------//

export async function filterRooms(
  page: number,
  size: number,
  filters: Record<string, any>
) {
  try {
    const response = await fetch(
      `${API_URL}/rooms/filter-rooms?page=${page}&size=${size}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      }
    );
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to filter rooms");
    }
    return response.json();
  } catch (error:any ) {
    console.error("Error filtering rooms:", error.message);
    return null;
  }
}

//------ rencent room--------//
export async function getRecentRooms() {
  try {
    const response = await fetch(`${API_URL}/rooms/recent-rooms`);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to fetch recent rooms");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching recent rooms:", error);
    return null;
  }
}