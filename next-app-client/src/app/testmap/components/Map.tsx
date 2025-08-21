import { URL_IMAGE } from "@/services/Constant";
import { getRoomsInMap } from "@/services/RoomService";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RoomMap } from "../page";

type Props = {
  onRoomClick: (room: RoomMap[]) => void;
};
const MapRoom: React.FC<Props> = ({ onRoomClick }) => {
  const [zoom, setZoom] = useState(13);
  const [isClient, setIsClient] = useState(false);
  const [center, setCenter] = useState<[number, number]>([10.7769, 106.7009]);
  const [rooms, setRooms] = useState<RoomMap[]>([]);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setCenter([pos.coords.latitude, pos.coords.longitude]);
          const rooms = await getRoomsInMap(
            pos.coords.latitude,
            pos.coords.longitude,
            10
          );
          setRooms(rooms);
          onRoomClick(rooms);
        },
        () => {
          setCenter([10.7769, 106.7009]);
        }
      );
    }
  }, []);

  if (!isClient) return <div>Đang tải bản đồ...</div>;

  const { divIcon, Icon } = require("leaflet");
  const {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMapEvents,
    useMap,
  } = require("react-leaflet");

  function ZoomListener({ setZoom }: { setZoom: (z: number) => void }) {
    useMapEvents({
      zoomend: (e: any) => setZoom(e.target.getZoom()),
      load: (e: any) => setZoom(e.target.getZoom()),
    });
    return null;
  }

  const dotIcon = new Icon({
    iconUrl:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><circle cx='8' cy='8' r='6' fill='%2300bdb7' stroke='white' stroke-width='2'/></svg>",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  const createCustomIcon = (label: string, vip?: boolean) => {
    return divIcon({
      className: "",
      html: `
        <div style="
          display: inline-flex;
          align-items: center;
          background: #222;
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: bold;
          white-space: nowrap;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        ">
          <span>${label}</span>
          ${
            vip
              ? `<span style="
                  background-color: #00bdb7;
                  color: white;
                  padding: 0 6px;
                  margin-left: 6px;
                  border-radius: 4px;
                  font-size: 11px;
                ">VIP</span>`
              : ""
          }
        </div>
      `,
      iconAnchor: [20, 40],
    });
  };

  function MoveMapToCenterOnce({ center }: { center: [number, number] }) {
    const map = useMap();
    const hasSetView = useRef(false);

    useEffect(() => {
      if (!hasSetView.current) {
        map.setView(center);
        hasSetView.current = true;
      }
    }, [center, map]);

    return null;
  }

  function groupRoomsByLocation(rooms: RoomMap[]) {
    const groups = new Map<string, RoomMap[]>();

    for (const room of rooms) {
      const key = `${room.lat.toFixed(6)}_${room.lng.toFixed(6)}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)?.push(room);
    }

    return Array.from(groups.entries()).map(([key, group]) => ({
      lat: group[0].lat,
      lng: group[0].lng,
      rooms: group,
    }));
  }

  // Component lắng nghe sự kiện click trên bản đồ
  function MapClickHandler() {
    useMapEvents({
      click: async (e: any) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        setCenter([lat, lng]);
        const rooms = await getRoomsInMap(lat, lng, 10);
        onRoomClick(rooms);
        setRooms(rooms);
      },
    });
    return null;
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "600px", width: "100%" }}
    >
      <MoveMapToCenterOnce center={center} />
      <ZoomListener setZoom={setZoom} />
      <MapClickHandler />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
      />

      {groupRoomsByLocation(rooms).map((group, index) => {
        const isVIP = group.rooms.some((r) => r.postType === "Post VIP");
        const label =
          group.rooms.length > 1
            ? `${group.rooms.length} phòng`
            : group.rooms[0].priceMonth.toLocaleString("vi-VN") + " đ";

        return (
          <Marker
            key={index}
            position={[group.lat, group.lng]}
            icon={
              zoom >= 15 || group.rooms.length > 1 || isVIP
                ? createCustomIcon(label, isVIP)
                : dotIcon
            }
          >
            <Popup maxWidth={300}>
              <div
                style={{
                  maxHeight: "250px",
                  overflowY: "auto",
                  maxWidth: "280px",
                }}
              >
                {group.rooms.map((room) => (
                  <div
                    key={room.id}
                    style={{
                      display: "flex",
                      marginBottom: "10px",
                      borderBottom: "1px solid #eee",
                      paddingBottom: "6px",
                    }}
                  >
                    <div style={{ position: "relative", marginRight: "8px" }}>
                      <img
                        src={URL_IMAGE + room.imageUrl}
                        alt={room.title}
                        style={{
                          width: "70px",
                          height: "70px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                      {room.postType === "Post VIP" && (
                        <div
                          style={{
                            position: "absolute",
                            top: "4px",
                            left: "4px",
                            backgroundColor: "#00bdb7",
                            color: "white",
                            padding: "2px 6px",
                            fontSize: "11px",
                            borderRadius: "4px",
                            fontWeight: "bold",
                          }}
                        >
                          VIP
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Link
                        href={`/detail/${room.id}`}
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          lineHeight: "1.3",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          color: "#007bff",
                          textDecoration: "none",
                        }}
                      >
                        {room.title}
                      </Link>
                      <div
                        style={{
                          color: "#e53935",
                          fontWeight: 600,
                          margin: "4px 0",
                          fontSize: "13px",
                        }}
                      >
                        {room.priceMonth.toLocaleString("vi-VN")} M/month
                      </div>
                      <div style={{ fontSize: "12px", color: "#555" }}>
                        📐 {room.area} m²
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapRoom;
