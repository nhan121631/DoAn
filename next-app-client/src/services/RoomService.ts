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

export async function getRoomVipUser(
  page: number,
  size: number,
  userId?: string
) {
  try {
    let url = `${API_URL}/rooms/allroom-vip?page=${page}&size=${size}`;
    if (userId) {
      url += `&userId=${userId}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to fetch VIP rooms");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching VIP rooms:", error);
    return null;
  }
}
export async function getRoomNormalUser(
  page: number,
  size: number,
  userId?: string
) {
  try {
    let url = `${API_URL}/rooms/allroom-normal?page=${page}&size=${size}`;
    if (userId) {
      url += `&userId=${userId}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to fetch normal rooms");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching normal rooms:", error);
    return null;
  }
}

// New functions - get rooms with location coordinates (for users not logged in)
export async function getRoomVipWithLocation(
  page: number,
  size: number,
  latitude?: number,
  longitude?: number
) {
  try {
    let url = `${API_URL}/rooms/allroom-vip-location?page=${page}&size=${size}`;
    if (latitude !== undefined && longitude !== undefined) {
      url += `&lat=${latitude}&lng=${longitude}`;
    }

    console.log("🌍 VIP API Call:", url);
    const response = await fetch(url);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(
        data.message || "Failed to fetch VIP rooms with location"
      );
    }
    const result = await response.json();
    console.log("🏠 VIP API Response:", result);
    return result;
  } catch (error) {
    console.error("Error fetching VIP rooms with location:", error);
    return null;
  }
}

export async function getRoomNormalWithLocation(
  page: number,
  size: number,
  latitude?: number,
  longitude?: number
) {
  try {
    let url = `${API_URL}/rooms/allroom-normal-location?page=${page}&size=${size}`;
    if (latitude !== undefined && longitude !== undefined) {
      url += `&lat=${latitude}&lng=${longitude}`;
    }

    console.log("🌍 Normal API Call:", url);
    const response = await fetch(url);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(
        data.message || "Failed to fetch normal rooms with location"
      );
    }
    const result = await response.json();
    console.log("🏠 Normal API Response:", result);
    return result;
  } catch (error) {
    console.error("Error fetching normal rooms with location:", error);
    return null;
  }
}

// Smart function - automatically chooses the right API based on user session and location
export async function getRoomsSmartLocation(
  page: number,
  size: number,
  roomType: "VIP" | "NORMAL" = "VIP",
  userId?: string,
  latitude?: number,
  longitude?: number
) {
  try {
    // If user is logged in, use userId-based API
    if (userId) {
      return roomType === "VIP"
        ? await getRoomVipUser(page, size, userId)
        : await getRoomNormalUser(page, size, userId);
    }

    // If user not logged in but has location, use location-based API
    if (latitude !== undefined && longitude !== undefined) {
      return roomType === "VIP"
        ? await getRoomVipWithLocation(page, size, latitude, longitude)
        : await getRoomNormalWithLocation(page, size, latitude, longitude);
    }

    // Fallback to basic API without any location sorting
    return roomType === "VIP"
      ? await getRoomVipUser(page, size)
      : await getRoomNormalUser(page, size);
  } catch (error) {
    console.error("Error in smart room fetching:", error);
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
  } catch (error: any) {
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
//------ landlord detail by room id ------//
export async function getLandlordByRoomId(roomId: string) {
  try {
    const response = await fetch(`${API_URL}/rooms/landlord-room/${roomId}`);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to fetch landlord details");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching landlord details:", error);
    return null;
  }
}

//------ room in map response ------//
export async function getRoomsInMap(lat: number, lng: number, radius: number) {
  try {
    const response = await fetch(
      `${API_URL}/rooms/rooms-in-map?lat=${lat}&lng=${lng}&radius=${radius}`
    );
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to fetch rooms in map");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching rooms in map:", error);
    return null;
  }
}
