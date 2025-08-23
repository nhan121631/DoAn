/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { RoomMap } from "../page";
import { getRoomsInMap } from "@/services/RoomService";
import { URL_IMAGE } from "@/services/Constant";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getUserPreferences } from "@/services/ProfileService";

const GOONG_API_KEY_MAP = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const GOONG_API_KEY = process.env.NEXT_PUBLIC_GOONG_API_KEY;

type Props = {
  onRoomClick: (room: RoomMap[]) => void;
};

const MapRoom: React.FC<Props> = ({ onRoomClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [goongjs, setGoongjs] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [center, setCenter] = useState<[number, number]>([10.7769, 106.7009]);
  const [zoom, setZoom] = useState(13);
  const [rooms, setRooms] = useState<RoomMap[]>([]);
  const { data: session } = useSession();
  // Load Goong Maps library
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadGoongMaps = async () => {
      try {
        const goongModule = await import("@goongmaps/goong-js");
        // Load CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href =
          "https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css";
        document.head.appendChild(link);

        setGoongjs(goongModule.default);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load Goong Maps:", error);
        setIsLoading(false);
      }
    };

    loadGoongMaps();
  }, []);

  // Geocoding function to convert address to coordinates using Goong API
  const geocodeAddress = async (
    address: string
  ): Promise<[number, number] | null> => {
    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://rsapi.goong.io/geocode?address=${encodedAddress}&api_key=${GOONG_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return [location.lat, location.lng];
      }

      console.warn("No geocoding results found for address:", address);
      return null;
    } catch (error) {
      console.error("Error geocoding address:", error);
      return null;
    }
  };

  useEffect(() => {
    const loadUserPreferences = async () => {
      if (session) {
        try {
          const preferences = await getUserPreferences();
          if (preferences?.searchAddress) {
            // Geocode address to coordinates using Goong API
            const coordinates = await geocodeAddress(preferences.searchAddress);
            if (coordinates) {
              const [lat, lng] = coordinates;
              setCenter([lat, lng]);

              // Update map center if map is already initialized
              if (mapRef.current) {
                mapRef.current.setCenter([lng, lat]);
                mapRef.current.setZoom(14); // Zoom in when address is set
              }

              // Load rooms for the geocoded location
              try {
                const fetchedRooms = await getRoomsInMap(lat, lng, 10);
                setRooms(fetchedRooms);
                onRoomClick(fetchedRooms);
              } catch (roomError) {
                console.error(
                  "Error fetching rooms for geocoded location:",
                  roomError
                );
              }
            }
          }
        } catch (error) {
          console.error("Error loading user preferences:", error);
        }
      }
    };

    loadUserPreferences();
  }, [session]);
  // Group rooms by location
  function groupRoomsByLocation(rooms: RoomMap[]) {
    const groups = new Map<string, RoomMap[]>();
    for (const room of rooms) {
      const key = `${room.lat.toFixed(6)}_${room.lng.toFixed(6)}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)?.push(room);
    }
    return Array.from(groups.entries()).map(([_, group]) => ({
      lat: group[0].lat,
      lng: group[0].lng,
      rooms: group,
    }));
  }

  // Load initial location & rooms
  // useEffect(() => {
  //   if (typeof window === "undefined") return;
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       async (pos) => {
  //         const lat = pos.coords.latitude;
  //         const lng = pos.coords.longitude;
  //         setCenter([lat, lng]);
  //         if (mapRef.current) mapRef.current.setCenter([lng, lat]);

  //         const fetchedRooms = await getRoomsInMap(lat, lng, 10);
  //         setRooms(fetchedRooms);
  //         onRoomClick(fetchedRooms);
  //       },
  //       () => {
  //         setCenter([10.7769, 106.7009]);
  //       }
  //     );
  //   }
  // }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current || !goongjs) return;

    mapRef.current = new goongjs.Map({
      container: mapContainer.current,
      style: "https://tiles.goong.io/assets/goong_map_web.json",
      center: [center[1], center[0]],
      zoom,
      accessToken: GOONG_API_KEY_MAP,
    });

    // Handle click
    mapRef.current.on("click", async (e: any) => {
      const lat = e.lngLat.lat;
      const lng = e.lngLat.lng;
      setCenter([lat, lng]);
      const newRooms = await getRoomsInMap(lat, lng, 10);
      setRooms(newRooms);
      onRoomClick(newRooms);
    });

    // Zoom tracking
    mapRef.current.on("zoomend", () => {
      setZoom(mapRef.current.getZoom());
    });
  }, [mapContainer, goongjs]);

  // Render markers
  useEffect(() => {
    if (!mapRef.current || !goongjs) return;

    if (mapRef.current._markers) {
      mapRef.current._markers.forEach((m: any) => m.remove());
    }
    mapRef.current._markers = [];

    groupRoomsByLocation(rooms).forEach((group) => {
      const isVIP = group.rooms.some((r) => r.postType === "Post VIP");
      const isSingle = group.rooms.length === 1;

      // Small dot marker
      if (!isVIP && isSingle && zoom < 15) {
        const dot = document.createElement("div");
        dot.style.width = "12px";
        dot.style.height = "12px";
        dot.style.background = "#00bdb7";
        dot.style.border = "2px solid white";
        dot.style.borderRadius = "50%";

        const marker = new goongjs.Marker({ element: dot })
          .setLngLat([group.lng, group.lat])
          .addTo(mapRef.current);
        mapRef.current._markers.push(marker);
        return;
      }

      // Label marker
      const label =
        group.rooms.length > 1
          ? `${group.rooms.length} phòng`
          : group.rooms[0].priceMonth.toLocaleString("vi-VN") + " đ";

      const el = document.createElement("div");
      el.style.cssText = `
        display:inline-flex;align-items:center;
        background:#222;color:white;padding:4px 8px;
        border-radius:6px;font-size:13px;font-weight:bold;
        white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.3);
        cursor:pointer;
      `;
      el.innerHTML =
        `<span>${label}</span>` +
        (isVIP
          ? `<span style="background:#00bdb7;color:white;padding:0 6px;margin-left:6px;border-radius:4px;font-size:11px;">VIP</span>`
          : "");

      // On marker click: show popup
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        document
          .querySelectorAll(".goong-popup-custom")
          .forEach((p) => p.remove());

        const popup = document.createElement("div");
        popup.className = "goong-popup-custom";
        popup.style.cssText = `
          max-height:250px;overflow-y:auto;max-width:280px;
          background:white;color:#222;border-radius:8px;
          box-shadow:0 2px 8px rgba(0,0,0,0.2);padding:10px;
          position:absolute;left:0;top:40px;z-index:1000;
        `;

        popup.innerHTML = group.rooms
          .map((room) => {
            const imageSrc = room.imageUrl?.startsWith("http")
              ? room.imageUrl
              : URL_IMAGE + room.imageUrl;

            return `
              <div style="display:flex;margin-bottom:10px;border-bottom:1px solid #eee;padding-bottom:6px;">
                <div style="position:relative;margin-right:8px;width:70px;height:70px;flex-shrink:0;">
                  <img src="${imageSrc}" alt="${room.title}"
                       style="width:100%;height:100%;object-fit:cover;border-radius:4px;" />
                  ${
                    room.postType === "Post VIP"
                      ? `<div style="position:absolute;top:4px;left:4px;background:#00bdb7;color:white;padding:2px 6px;font-size:11px;border-radius:4px;font-weight:bold;">VIP</div>`
                      : ""
                  }
                </div>
                <div style="flex:1;">
                  <a href="/detail/${
                    room.id
                  }" style="font-size:13px;font-weight:600;line-height:1.3;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;color:#007bff;text-decoration:none;">
                    ${room.title}
                  </a>
                  <div style="color:#e53935;font-weight:600;margin:4px 0;font-size:13px;">
                    ${room.priceMonth.toLocaleString("vi-VN")} M/month
                  </div>
                  <div style="font-size:12px;color:#555;">
                    📐 ${room.area} m²
                  </div>
                </div>
              </div>
            `;
          })
          .join("");

        el.appendChild(popup);

        const closePopup = (ev: any) => {
          if (!popup.contains(ev.target)) {
            popup.remove();
            document.removeEventListener("mousedown", closePopup);
          }
        };
        document.addEventListener("mousedown", closePopup);
      });

      const marker = new goongjs.Marker({ element: el })
        .setLngLat([group.lng, group.lat])
        .addTo(mapRef.current);
      mapRef.current._markers.push(marker);
    });
  }, [rooms, zoom, goongjs]);

  return (
    <div className="relative w-full h-full">
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Close Map Button */}
      <div className="absolute top-4 right-4 z-10">
        <Link
          href="/users"
          className="h-12 px-6 text-white font-semibold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.25)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)";
            e.currentTarget.style.boxShadow =
              "0 15px 35px -5px rgba(59, 130, 246, 0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)";
            e.currentTarget.style.boxShadow =
              "0 10px 25px -5px rgba(59, 130, 246, 0.25)";
          }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span>Close Map</span>
        </Link>
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default MapRoom;
