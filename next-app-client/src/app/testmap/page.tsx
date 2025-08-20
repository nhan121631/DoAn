"use client";

import React, { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

type Room = {
  id: number;
  lat: number;
  lng: number;
  price: string;
  vip: boolean;
};

// Dữ liệu mẫu có vị trí trùng nhau
const rooms: Room[] = [
  { id: 1, lat: 10.7769, lng: 106.7009, price: "3 triệu", vip: true },
  { id: 2, lat: 10.7626, lng: 106.6602, price: "4.5 triệu", vip: false },
  { id: 3, lat: 10.754, lng: 106.6533, price: "7 triệu", vip: true },
  { id: 4, lat: 15.98042, lng: 108.24966, price: "2 triệu", vip: false },
  { id: 5, lat: 15.98042, lng: 108.24966, price: "5 triệu", vip: true },
  { id: 6, lat: 15.98042, lng: 108.24966, price: "6 triệu", vip: true },
];

export default function Page() {
  const [zoom, setZoom] = useState(13);
  const [isClient, setIsClient] = useState(false);
  const [center, setCenter] = useState<[number, number]>([10.7769, 106.7009]);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCenter([pos.coords.latitude, pos.coords.longitude]);
          console.log("Vị trí hiện tại:", pos.coords);
        },
        () => {
          // Không lấy được vị trí: giữ mặc định
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

  // Lắng nghe zoom để thay đổi icon
  function ZoomListener({ setZoom }: { setZoom: (z: number) => void }) {
    useMapEvents({
      zoomend: (e: any) => setZoom(e.target.getZoom()),
      load: (e: any) => setZoom(e.target.getZoom()),
    });
    return null;
  }

  // Icon chấm nhỏ khi zoom thấp
  const dotIcon = new Icon({
    iconUrl:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><circle cx='8' cy='8' r='6' fill='%2300bdb7' stroke='white' stroke-width='2'/></svg>",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  // Icon hiển thị giá & VIP
  const createCustomIcon = (price: string, vip?: boolean) => {
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
          <span>${price}</span>
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

  // ✅ Chỉ set center 1 lần duy nhất khi khởi tạo
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

  // ✅ Dàn trải các marker bị trùng
  function spreadMarkers(rooms: Room[]) {
    const seen = new Map<string, number>();
    const offset = 0.00008;

    return rooms.map((room) => {
      const key = `${room.lat.toFixed(6)}_${room.lng.toFixed(6)}`;
      const count = seen.get(key) || 0;
      seen.set(key, count + 1);

      const angle = (count * 45 * Math.PI) / 180;
      const latOffset = Math.cos(angle) * offset;
      const lngOffset = Math.sin(angle) * offset;

      return {
        ...room,
        lat: room.lat + latOffset,
        lng: room.lng + lngOffset,
      };
    });
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "600px", width: "100%" }}
    >
      <MoveMapToCenterOnce center={center} />
      <ZoomListener setZoom={setZoom} />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
      />

      {spreadMarkers(rooms).map((room) => (
        <Marker
          key={room.id}
          position={[room.lat, room.lng]}
          icon={
            room.vip
              ? createCustomIcon(room.price, true)
              : zoom >= 15
              ? createCustomIcon(room.price)
              : dotIcon
          }
        >
          <Popup>
            <strong>{room.price}</strong>
            <br />
            {room.vip ? "Phòng VIP" : "Phòng thường"}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
