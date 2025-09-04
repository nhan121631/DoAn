/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { URL_IMAGE } from "@/services/Constant";
import { getUserPreferences } from "@/services/ProfileService";
import { getRoomsInMap } from "@/services/RoomService";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { RoomMap } from "../page";
import { useLocationContext } from "@/context/LocationContext";

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
  const [isInitialized, setIsInitialized] = useState(false);
  const [locationOverride, setLocationOverride] = useState(false); // Track if location is actively being used
  const { data: session } = useSession();
  const { location } = useLocationContext();

  // Debug location changes
  useEffect(() => {
    console.log("🌍 Location context value changed:", location);
  }, [location]);

  // Test function to manually trigger location change
  const testLocationChange = () => {
    console.log("🧪 Testing manual location change");
    const testLocation = {
      lat: 10.762622,
      lng: 106.660172,
      address: "District 1, Ho Chi Minh City",
    };

    setCenter([testLocation.lat, testLocation.lng]);
    if (mapRef.current) {
      mapRef.current.setCenter([testLocation.lng, testLocation.lat]);
      mapRef.current.setZoom(14);
    }

    // Fetch rooms for test location
    const fetchTestRooms = async () => {
      try {
        const rooms = await getRoomsInMap(
          testLocation.lat,
          testLocation.lng,
          10
        );
        setRooms(rooms);
        stableOnRoomClick(rooms);
        console.log("✅ Test location change successful");
      } catch (error) {
        console.error("❌ Test location change failed:", error);
      }
    };
    fetchTestRooms();
  };

  // Memoize onRoomClick to prevent useEffect re-runs
  const stableOnRoomClick = useCallback((rooms: RoomMap[]) => {
    onRoomClick(rooms);
  }, []); // Empty deps to keep it stable
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

  // Initial load: Priority order - Session > Default location
  useEffect(() => {
    const initializeMap = async () => {
      if (isInitialized) return; // Prevent multiple initialization

      console.log(
        "Initializing map... Session status:",
        session ? "Available" : "Not available"
      );

      // Try to load user preferences first if session exists
      if (session?.user?.userProfile?.id) {
        try {
          console.log("Loading user preferences from session...");
          const preferences = await getUserPreferences();

          if (preferences?.searchAddress) {
            console.log("Found saved address:", preferences.searchAddress);
            const coordinates = await geocodeAddress(preferences.searchAddress);

            if (coordinates) {
              const [lat, lng] = coordinates;
              setCenter([lat, lng]);

              // Load rooms for saved location
              try {
                const fetchedRooms = await getRoomsInMap(lat, lng, 10);
                setRooms(fetchedRooms);
                stableOnRoomClick(fetchedRooms);
                setIsInitialized(true);
                console.log("✅ Map initialized with user preferences");
                return; // Exit early - successful initialization
              } catch (roomError) {
                console.error(
                  "Error fetching rooms for saved address:",
                  roomError
                );
              }
            }
          } else {
            console.log("No saved address found in user preferences");
          }
        } catch (error) {
          console.error("Error loading user preferences:", error);
        }
      }

      // Fallback to default location (Ho Chi Minh City) if session failed or not available
      console.log("🏠 Initializing with default location (HCM City)...");
      try {
        const defaultRooms = await getRoomsInMap(10.7769, 106.7009, 10);
        setRooms(defaultRooms);
        stableOnRoomClick(defaultRooms);
        setCenter([10.7769, 106.7009]); // Set default center
        setIsInitialized(true);
        console.log("✅ Map initialized with default location");
      } catch (error) {
        console.error("Error loading default rooms:", error);
        setRooms([]);
        stableOnRoomClick([]);
        setIsInitialized(true);
      }
    };

    // Wait for session to be determined (not undefined) before initializing
    if (session !== undefined && !isInitialized) {
      console.log("🚀 Starting map initialization...");
      initializeMap();
    }
  }, [session, isInitialized]); // Depend on both session and isInitialized

  // Monitor session changes and re-initialize if needed
  // TEMPORARILY DISABLED TO TEST LOCATION CONTEXT
  useEffect(() => {
    console.log(
      "👤 Session status changed:",
      session?.user?.userProfile?.id ? "Logged in" : "Not logged in",
      "locationOverride:",
      locationOverride
    );

    console.log(
      "🚫 Session monitoring is DISABLED for testing location context"
    );

    // Completely disable session-based preference loading
    // This allows location context to work properly
  }, [session?.user?.userProfile?.id]); // Remove locationOverride to prevent loops

  // Handle location context changes (higher priority than initial load)
  useEffect(() => {
    console.log("🔍 Location useEffect triggered:", {
      location: location ? { lat: location.lat, lng: location.lng } : null,
      isInitialized,
      hasMapRef: !!mapRef.current,
      locationOverride,
    });

    if (location) {
      console.log("📍 Location context changed, updating map:", location);
      setCenter([location.lat, location.lng]);
      setLocationOverride(true); // Mark location as actively being used

      if (mapRef.current) {
        console.log("🗺️ Updating map center and zoom");
        mapRef.current.setCenter([location.lng, location.lat]);
        mapRef.current.setZoom(14);
      } else {
        console.log("⚠️ Map not ready yet, will update when map initializes");
      }

      // Fetch rooms for new location
      const fetchRooms = async () => {
        try {
          console.log(
            "🏠 Fetching rooms for location:",
            location.lat,
            location.lng
          );
          const fetchedRooms = await getRoomsInMap(
            location.lat,
            location.lng,
            10
          );
          console.log(`✅ Found ${fetchedRooms.length} rooms for location`);
          setRooms(fetchedRooms);
          stableOnRoomClick(fetchedRooms);
        } catch (error) {
          console.error("❌ Error fetching rooms for location:", error);
          setRooms([]);
          stableOnRoomClick([]);
        }
      };
      fetchRooms();
    } else if (locationOverride) {
      // Location context was cleared, reset override
      console.log("🔄 Location context cleared, resetting override");
      setLocationOverride(false);
    }
  }, [location]); // Remove isInitialized dependency to allow immediate updates

  // Sync map center when center state changes (after map is initialized)
  useEffect(() => {
    if (mapRef.current) {
      console.log("🎯 Syncing map center with state:", center);
      mapRef.current.setCenter([center[1], center[0]]);
    }
  }, [center]);

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
  useEffect(() => {
    if (!mapContainer.current || mapRef.current || !goongjs) return;

    console.log("🗺️ Initializing Goong Map with center:", center);
    mapRef.current = new goongjs.Map({
      container: mapContainer.current,
      style: "https://tiles.goong.io/assets/goong_map_web.json",
      center: [center[1], center[0]], // Use current center state
      zoom,
      accessToken: GOONG_API_KEY_MAP,
    });

    console.log("✅ Map initialized successfully");

    // Handle click
    mapRef.current.on("click", async (e: any) => {
      const lat = e.lngLat.lat;
      const lng = e.lngLat.lng;
      console.log("🖱️ Map clicked at:", lat, lng);
      setCenter([lat, lng]);
      try {
        const newRooms = await getRoomsInMap(lat, lng, 10);
        setRooms(newRooms);
        stableOnRoomClick(newRooms);
      } catch (error) {
        console.error("Error fetching rooms on map click:", error);
        setRooms([]);
        stableOnRoomClick([]);
      }
    });

    // Zoom tracking
    mapRef.current.on("zoomend", () => {
      setZoom(mapRef.current.getZoom());
    });
  }, [mapContainer, goongjs]); // Remove center from dependencies to prevent re-initialization

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

      // Small icon marker
      if (!isVIP && isSingle && zoom < 15) {
        const icon = document.createElement("img");
        icon.src = "/images/icon/red_position_ants.png"; // Đường dẫn icon, chỉnh lại nếu cần
        icon.style.width = "56px";
        icon.style.height = "56px";
        icon.style.objectFit = "contain";
        icon.style.display = "block";
        icon.style.borderRadius = "50%";

        const marker = new goongjs.Marker({ element: icon })
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

      {/* Test Button - Remove this after testing */}
      {/* <div className="absolute top-4 left-4 z-10">
        <button
          onClick={testLocationChange}
          className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600"
        >
          🧪 Test Location Change
        </button>
      </div> */}

      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default MapRoom;
