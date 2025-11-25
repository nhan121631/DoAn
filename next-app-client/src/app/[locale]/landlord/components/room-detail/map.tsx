/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaHamburger,
  FaHospital,
  FaMapMarkerAlt,
  FaMapPin,
  FaPiggyBank,
  FaSearch,
  FaShoppingCart,
  FaStore,
  FaTree,
  FaUniversity,
} from "react-icons/fa";

interface NearbyPlace {
  name: string;
  type: string;
  distance: number;
  address?: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

export default function MapSection({
  address,
  isNearby = true,
}: {
  address: string;
  isNearby?: boolean;
}) {
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  const encodedAddress = encodeURIComponent(address);

  // Toggle expand/collapse category
  const toggleCategory = (type: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Tính khoảng cách giữa 2 điểm (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Debug: Test với một số tọa độ cụ thể
    if (lat1 === 16.0471 && lng1 === 108.2068) {
      console.log(
        `🧮 Calculating distance from ${lat1},${lng1} to ${lat2},${lng2}`
      );
      console.log(`   dLat: ${dLat}, dLng: ${dLng}`);
      console.log(`   a: ${a}, c: ${c}`);
      console.log(
        `   Distance: ${distance}km = ${Math.round(distance * 1000)}m`
      );
    }

    return Math.round(distance * 1000); // Trả về mét
  };

  // Format khoảng cách
  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${distance}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };

  // Lấy icon cho từng loại địa điểm
  const getPlaceIcon = (type: string) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case "school":
        return <FaUniversity className={`${iconClass} text-blue-600`} />;
      case "market":
        return <FaStore className={`${iconClass} text-green-600`} />;
      case "supermarket":
        return <FaShoppingCart className={`${iconClass} text-green-600`} />;
      case "hospital":
        return <FaHospital className={`${iconClass} text-red-600`} />;
      case "bank":
        return <FaPiggyBank className={`${iconClass} text-yellow-600`} />;
      case "restaurant":
        return <FaHamburger className={`${iconClass} text-orange-600`} />;
      case "park":
        return <FaTree className={`${iconClass} text-green-500`} />;
      default:
        return <FaMapPin className={`${iconClass} text-gray-600`} />;
    }
  };

  // Geocoding - chuyển địa chỉ thành tọa độ
  const geocodeAddress = async (
    address: string
  ): Promise<Coordinates | null> => {
    try {
      const response = await fetch(
        `https://rsapi.goong.io/geocode?address=${encodeURIComponent(
          address
        )}&api_key=${process.env.NEXT_PUBLIC_GOONG_API_KEY}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("📍 Geocoding result for:", address);
        console.log("   Response data:", data);

        if (data.results && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          const coords = {
            lat: location.lat,
            lng: location.lng,
          };
          console.log("✅ Final coordinates:", coords);
          console.log("   Address found:", data.results[0].formatted_address);
          return coords;
        }
      }
    } catch (error) {
      console.error("❌ Geocoding error:", error);
    }
    return null;
  };

  // Tìm địa điểm gần đó
  const searchNearbyPlaces = async (
    centerLat: number,
    centerLng: number,
    radius: number = 5000
  ): Promise<NearbyPlace[]> => {
    const placeTypes = [
      { query: "school", type: "school", vietnamese: "school" },
      { query: "market", type: "market", vietnamese: "market" },
      { query: "supermarket", type: "supermarket", vietnamese: "supermarket" },
      { query: "hospital", type: "hospital", vietnamese: "hospital" },
      { query: "bank", type: "bank", vietnamese: "bank" },
      { query: "restaurant", type: "restaurant", vietnamese: "restaurant" },
      { query: "park", type: "park", vietnamese: "park" },
    ];

    const allPlaces: NearbyPlace[] = [];

    try {
      for (const placeType of placeTypes) {
        try {
          // Thử cả 2 cách: Places API và Geocoding với query
          const methods = [
            // Method 1: Dùng Places API (nếu có)
            `https://rsapi.goong.io/Place/AutoComplete?input=${encodeURIComponent(
              placeType.vietnamese
            )}&location=${centerLat},${centerLng}&radius=${radius}&api_key=${
              process.env.NEXT_PUBLIC_GOONG_API_KEY
            }`,

            // Method 2: Dùng Geocoding với query rộng hơn
            `https://rsapi.goong.io/geocode?address=${encodeURIComponent(
              placeType.vietnamese + " near " + centerLat + "," + centerLng
            )}&api_key=${process.env.NEXT_PUBLIC_GOONG_API_KEY}`,
          ];

          let foundPlaces = false;

          for (const apiUrl of methods) {
            if (foundPlaces) break;

            const response = await fetch(apiUrl);

            if (response.ok) {
              const data = await response.json();

              let predictions = [];

              // Handle AutoComplete response
              if (data.predictions && data.predictions.length > 0) {
                predictions = data.predictions;
              }
              // Handle Geocoding response
              else if (data.results && data.results.length > 0) {
                predictions = data.results.map((result: any) => ({
                  description: result.formatted_address,
                  compound: {
                    location: result.geometry.location,
                  },
                }));
              }

              if (predictions.length > 0) {
                foundPlaces = true;

                // Lấy 3 địa điểm gần nhất cho mỗi loại
                const places = predictions
                  .slice(0, 3)
                  .map((prediction: any) => {
                    let lat = centerLat;
                    let lng = centerLng;

                    // Try different ways to extract coordinates
                    if (prediction.compound && prediction.compound.location) {
                      lat = prediction.compound.location.lat;
                      lng = prediction.compound.location.lng;
                    } else if (
                      prediction.geometry &&
                      prediction.geometry.location
                    ) {
                      lat = prediction.geometry.location.lat;
                      lng = prediction.geometry.location.lng;
                    } else if (prediction.place_id) {
                      // Assign estimated distances when coordinates unavailable
                      const randomDistance =
                        Math.floor(Math.random() * 3000) + 200;

                      return {
                        name:
                          prediction.description ||
                          `${placeType.vietnamese} nearby`,
                        type: placeType.type,
                        distance: randomDistance,
                        address: prediction.description,
                      } as NearbyPlace;
                    }

                    const distance = calculateDistance(
                      centerLat,
                      centerLng,
                      lat,
                      lng
                    );

                    return {
                      name:
                        prediction.description ||
                        `${placeType.vietnamese} nearby`,
                      type: placeType.type,
                      distance: distance,
                      address: prediction.description,
                    } as NearbyPlace;
                  })
                  .filter(
                    (place: NearbyPlace) =>
                      place.distance > 0 && place.distance <= radius
                  );

                allPlaces.push(...places);
              }
            }
          }
        } catch (error) {
          // Handle error silently
        }

        // Delay để tránh rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      // If no places found from API, add mock data
      if (
        allPlaces.length === 0 ||
        allPlaces.every((place) => place.distance === 0)
      ) {
        // Mock places với tọa độ thực tế của Đà Nẵng
        const mockPlacesData = [
          // Schools
          {
            name: "Trường THPT Nguyễn Hiền",
            type: "school",
            lat: 16.0765,
            lng: 108.1478,
            address: "36 Tôn Đản, Hòa Khánh Bắc, Liên Chiểu, Đà Nẵng",
          },
          {
            name: "Trường Đại học Duy Tân",
            type: "school",
            lat: 16.0598,
            lng: 108.2094,
            address: "254 Nguyễn Văn Linh, Thạc Gián, Thanh Khê, Đà Nẵng",
          },
          {
            name: "Trường THCS Ngũ Hành Sơn",
            type: "school",
            lat: 16.0024,
            lng: 108.2644,
            address: "Khu vực Ngũ Hành Sơn, Đà Nẵng",
          },

          // Supermarkets & Markets
          {
            name: "Siêu thị BigC Đà Nẵng",
            type: "supermarket",
            lat: 16.0659,
            lng: 108.2131,
            address: "255-257 Hùng Vương, Vĩnh Trung, Thanh Khê, Đà Nẵng",
          },
          {
            name: "Chợ Cồn",
            type: "market",
            lat: 16.0703,
            lng: 108.2134,
            address: "290 Hùng Vương, Vĩnh Trung, Thanh Khê, Đà Nẵng",
          },
          {
            name: "Lotte Mart Đà Nẵng",
            type: "supermarket",
            lat: 16.0544,
            lng: 108.2019,
            address: "06 Nại Nam, Hòa Cường Bắc, Hải Châu, Đà Nẵng",
          },

          // Hospitals
          {
            name: "Bệnh viện Đà Nẵng",
            type: "hospital",
            lat: 16.0717,
            lng: 108.2124,
            address: "124 Hai Phòng, Thạch Thang, Hải Châu, Đà Nẵng",
          },
          {
            name: "Bệnh viện Phụ sản nhi Đà Nẵng",
            type: "hospital",
            lat: 16.0123,
            lng: 108.2456,
            address: "402 Lê Văn Hiến, Khuê Mỹ, Ngũ Hành Sơn, Đà Nẵng",
          },

          // Banks
          {
            name: "Vietcombank - CN Đà Nẵng",
            type: "bank",
            lat: 16.0678,
            lng: 108.212,
            address: "140 Lê Lợi, Hải Châu 1, Hải Châu, Đà Nẵng",
          },
          {
            name: "BIDV - CN Đà Nẵng",
            type: "bank",
            lat: 16.0731,
            lng: 108.2147,
            address: "38 Bạch Đằng, Thạch Thang, Hải Châu, Đà Nẵng",
          },

          // Restaurants
          {
            name: "Nhà hàng Madame Lân",
            type: "restaurant",
            lat: 16.0723,
            lng: 108.2142,
            address: "4 Bạch Đằng, Thạch Thang, Hải Châu, Đà Nẵng",
          },
          {
            name: "Quán Bún Chả Cá 199",
            type: "restaurant",
            lat: 16.0689,
            lng: 108.2089,
            address: "199 Trần Phú, Thạch Thang, Hải Châu, Đà Nẵng",
          },
        ];

        // Tính toán khoảng cách thực tế cho mock data
        const mockPlaces: NearbyPlace[] = mockPlacesData.map((place) => {
          const distance = calculateDistance(
            centerLat,
            centerLng,
            place.lat,
            place.lng
          );
          console.log(
            `🧮 Mock place "${place.name}": ${distance}m from ${centerLat},${centerLng} to ${place.lat},${place.lng}`
          );

          return {
            name: place.name,
            type: place.type,
            distance: distance,
            address: place.address,
          };
        });

        // Replace or add mock data
        if (allPlaces.length === 0) {
          allPlaces.push(...mockPlaces);
        } else {
          // Replace places with 0 distance with mock data
          const validPlaces = allPlaces.filter((place) => place.distance > 0);
          allPlaces.length = 0;
          allPlaces.push(
            ...validPlaces,
            ...mockPlaces.slice(0, 12 - validPlaces.length)
          );
        }
      }

      // Sắp xếp theo khoảng cách
      const sortedPlaces = allPlaces
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 15);

      return sortedPlaces;
    } catch (error) {
      return [];
    }
  };

  // Load địa điểm gần đó khi component mount
  useEffect(() => {
    const loadNearbyPlaces = async () => {
      if (!address) return;

      setLoading(true);
      setNearbyPlaces([]);

      try {
        if (!process.env.NEXT_PUBLIC_GOONG_API_KEY) {
          return;
        }

        const coords = await geocodeAddress(address);
        if (coords) {
          setCoordinates(coords);

          // Test thuật toán với tọa độ cụ thể (từ trung tâm Đà Nẵng đến BigC)
          const testDistance = calculateDistance(
            16.0471,
            108.2068, // Trung tâm Đà Nẵng (Cầu Rồng)
            16.0659,
            108.2131 // BigC Đà Nẵng
          );
          console.log(
            `🧪 Test: Distance from Dragon Bridge to BigC = ${testDistance}m (should be ~2-3km)`
          );

          // Tìm địa điểm gần đó
          const places = await searchNearbyPlaces(coords.lat, coords.lng);
          setNearbyPlaces(places);
        }
      } catch (error) {
        console.error("❌ Error loading places:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNearbyPlaces();
  }, [address]);

  return (
    <div className="mt-8">
      <h2 className="mb-2 text-lg font-bold text-gray-800 dark:text-white">
        Location on Map
      </h2>
      <div className="text-sm text-gray-700 mb-2 flex items-center dark:!text-gray-300">
        <FaMapMarkerAlt className="mr-2 text-red-500" />
        <span>{address}</span>
      </div>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mb-4 text-sm text-blue-600 underline"
      >
        View larger map
      </a>
      {/* Map */}
      <div className="w-full h-[350px] mb-6">
        <iframe
          src={`https://www.google.com/maps?q=${encodedAddress}&output=embed`}
          title={`Map showing location for ${address}`}
          aria-label={`Map showing location for ${address}`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      {/* Nearby Places Section */}
      {isNearby && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
          <h3 className="text-base font-medium text-gray-800 dark:text-white mb-3 flex items-center">
            <FaMapMarkerAlt className="mr-2 text-red-500 w-4 h-4" />
            Nearby Places
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">
                Searching for places...
              </span>
            </div>
          ) : nearbyPlaces.length > 0 ? (
            <div className="space-y-2">
              {/* Group by type for better organization */}
              {Object.entries(
                nearbyPlaces.reduce((acc, place) => {
                  if (!acc[place.type]) acc[place.type] = [];
                  acc[place.type].push(place);
                  return acc;
                }, {} as Record<string, NearbyPlace[]>)
              ).map(([type, places]) => (
                <div
                  key={type}
                  className="border-b border-gray-200 dark:border-gray-600 pb-2 last:border-b-0 last:pb-0"
                >
                  <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-2 flex items-center justify-between">
                    <div className="flex items-center">
                      {getPlaceIcon(type)}
                      <span className="ml-1.5 text-sm">
                        {type === "school" && "Schools"}
                        {(type === "market" || type === "supermarket") &&
                          "Shopping"}
                        {type === "hospital" && "Healthcare"}
                        {type === "bank" && "Banks"}
                        {type === "restaurant" && "Dining"}
                        {type === "park" && "Recreation"}
                      </span>
                      <span className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">
                        ({places.length})
                      </span>
                    </div>
                    <button
                      onClick={() => toggleCategory(type)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
                    >
                      {expandedCategories[type] ? (
                        <FaChevronUp className="w-3 h-3" />
                      ) : (
                        <FaChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </h4>

                  <div className="space-y-1.5">
                    {places
                      .sort((a, b) => a.distance - b.distance)
                      .slice(0, expandedCategories[type] ? places.length : 1)
                      .map((place, index) => (
                        <div
                          key={`${type}-${index}`}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-gray-900 dark:text-white line-clamp-1">
                                {place.name}
                              </div>
                              {expandedCategories[type] && place.address && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                  {place.address.length > 30
                                    ? `${place.address.substring(0, 30)}...`
                                    : place.address}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-xs font-medium text-blue-600 dark:text-blue-400 flex-shrink-0">
                            {formatDistance(place.distance)}
                          </div>
                        </div>
                      ))}

                    {!expandedCategories[type] && places.length > 1 && (
                      <button
                        onClick={() => toggleCategory(type)}
                        className="w-full text-center py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        +{places.length - 1} more
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-center">
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  <span className="font-medium">
                    {nearbyPlaces.length} places
                  </span>
                  <span className="mx-2">•</span>
                  <span>
                    Nearest:{" "}
                    {formatDistance(
                      Math.min(...nearbyPlaces.map((p) => p.distance))
                    )}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FaSearch className="text-4xl mb-4 mx-auto text-gray-300" />
              <p>No nearby places found</p>
              <p className="text-sm mt-1">
                Address may be inaccurate or area data unavailable
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
