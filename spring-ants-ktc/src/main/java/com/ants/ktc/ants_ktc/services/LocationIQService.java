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
public class LocationIQService {

    private final String apiKey;

    public LocationIQService() {
        this.apiKey = com.ants.ktc.ants_ktc.config.EnvLoader.get("LOCATIONIQ_API_KEY");
    }

    // Class LatLng tương tự Google
    public static class LatLng {
        public final double lat;
        public final double lng;
        public final String displayName; // địa chỉ đầy đủ (có thể có số nhà)

        public LatLng(double lat, double lng, String displayName) {
            this.lat = lat;
            this.lng = lng;
            this.displayName = displayName;
        }
    }

    // Lấy tọa độ từ địa chỉ
    public LatLng getCoordinates(String address) throws Exception {
        String encodedAddress = URLEncoder.encode(address, StandardCharsets.UTF_8);
        String urlStr = "https://us1.locationiq.com/v1/search.php?key="
                + apiKey + "&q=" + encodedAddress + "&format=json&limit=1&addressdetails=1";

        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("User-Agent", "Mozilla/5.0");

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }

            JSONArray results = new JSONArray(response.toString());
            if (results.length() > 0) {
                JSONObject obj = results.getJSONObject(0);
                double lat = Double.parseDouble(obj.getString("lat"));
                double lon = Double.parseDouble(obj.getString("lon"));
                String displayName = obj.optString("display_name", "");

                return new LatLng(lat, lon, displayName);
            } else {
                throw new Exception("Không tìm thấy tọa độ cho địa chỉ: " + address);
            }
        }
    }

    // Tính khoảng cách 2 địa chỉ
    public long getDistance(String origin, String destination) throws Exception {
        LatLng originCoord = getCoordinates(origin);
        LatLng destCoord = getCoordinates(destination);

        String urlStr = "https://us1.locationiq.com/v1/directions/driving/"
                + originCoord.lng + "," + originCoord.lat
                + ";" + destCoord.lng + "," + destCoord.lat
                + "?key=" + apiKey + "&overview=false";

        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("User-Agent", "Mozilla/5.0");

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }

            JSONObject json = new JSONObject(response.toString());
            JSONArray routes = json.getJSONArray("routes");

            if (routes.length() > 0) {
                JSONObject route = routes.getJSONObject(0);
                return route.getLong("distance"); // distance tính bằng mét
            } else {
                throw new Exception("Không tính được khoảng cách.");
            }
        }
    }
}
