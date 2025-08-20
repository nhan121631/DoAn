package com.ants.ktc.ants_ktc.services;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

@Service
public class MapboxService {

    private final String accessToken;

    public MapboxService() {
        this.accessToken = com.ants.ktc.ants_ktc.config.EnvLoader.get("MAPBOX_ACCESS_TOKEN");
    }

    public static class LatLng {
        public final double lat;
        public final double lng;
        public final String placeName;

        public LatLng(double lat, double lng, String placeName) {
            this.lat = lat;
            this.lng = lng;
            this.placeName = placeName;
        }
    }

    // 🔎 Lấy tọa độ từ địa chỉ (Geocoding API) có fallback
    public LatLng getCoordinates(String address) throws Exception {
        String encodedAddress = URLEncoder.encode(address, StandardCharsets.UTF_8).replace("+", "%20");

        String urlStr = "https://api.mapbox.com/geocoding/v5/mapbox.places/"
                + encodedAddress + ".json?access_token=" + accessToken
                + "&limit=5&language=vi&types=address&autocomplete=true";

        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("User-Agent", "Mozilla/5.0");

        int status = conn.getResponseCode();
        if (status != 200) {
            throw new RuntimeException("Mapbox API error (geocoding): HTTP " + status);
        }

        StringBuilder response = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
        }

        JSONObject json = new JSONObject(response.toString());
        JSONArray features = json.getJSONArray("features");

        if (features.length() == 0) {
            throw new Exception("Không tìm thấy tọa độ cho địa chỉ: " + address);
        }

        // Ưu tiên chọn feature có số nhà (address field)
        JSONObject chosen = null;
        for (int i = 0; i < features.length(); i++) {
            JSONObject f = features.getJSONObject(i);
            JSONArray types = f.getJSONArray("place_type");

            // Log để debug
            System.out.println("Candidate " + i + ": " + f.getString("place_name")
                    + " (type=" + types.getString(0)
                    + (f.has("address") ? ", address=" + f.getString("address") : "") + ")");

            if (types.getString(0).equals("address") && f.has("address")) {
                chosen = f; // đúng số nhà
                break;
            }
        }

        // Nếu không có số nhà thì fallback: street/place
        if (chosen == null) {
            for (int i = 0; i < features.length(); i++) {
                JSONObject f = features.getJSONObject(i);
                String type = f.getJSONArray("place_type").getString(0);
                if ("street".equals(type) || "place".equals(type)) {
                    chosen = f;
                    break;
                }
            }
        }

        // Nếu vẫn không có thì lấy cái đầu tiên
        if (chosen == null) {
            chosen = features.getJSONObject(0);
        }

        JSONArray coords = chosen.getJSONObject("geometry").getJSONArray("coordinates");
        double lng = coords.getDouble(0);
        double lat = coords.getDouble(1);
        String placeName = chosen.getString("place_name");

        return new LatLng(lat, lng, placeName);
    }

    // 📏 Tính khoảng cách 2 địa chỉ bằng Mapbox Directions API
    public double getDistance(String origin, String destination) throws Exception {
        LatLng originCoord = getCoordinates(origin);
        LatLng destCoord = getCoordinates(destination);

        String urlStr = "https://api.mapbox.com/directions/v5/mapbox/driving/"
                + originCoord.lng + "," + originCoord.lat
                + ";" + destCoord.lng + "," + destCoord.lat
                + "?access_token=" + accessToken + "&overview=false";

        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("User-Agent", "Mozilla/5.0");

        int status = conn.getResponseCode();
        if (status != 200) {
            throw new RuntimeException("Mapbox API error (directions): HTTP " + status);
        }

        StringBuilder response = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
        }

        JSONObject json = new JSONObject(response.toString());
        JSONArray routes = json.getJSONArray("routes");

        if (routes.length() > 0) {
            JSONObject route = routes.getJSONObject(0);
            return route.getDouble("distance"); // mét
        } else {
            throw new Exception("Không tính được khoảng cách.");
        }
    }
}
