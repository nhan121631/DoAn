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
        this.apiKey = com.ants.ktc.ants_ktc.config.EnvLoader.get("HERE_API_KEY");
    }

    public static class LatLng {
        public final double lat;
        public final double lng;
        public final String address;

        public LatLng(double lat, double lng, String address) {
            this.lat = lat;
            this.lng = lng;
            this.address = address;
        }
    }

    public LatLng getCoordinates(String address) throws Exception {
        String encodedAddress = URLEncoder.encode(address, StandardCharsets.UTF_8);
        String urlStr = "https://geocode.search.hereapi.com/v1/geocode?q=" + encodedAddress
                + "&apiKey=" + apiKey;

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
            JSONArray items = json.optJSONArray("items");

            if (items != null && items.length() > 0) {
                JSONObject firstItem = items.getJSONObject(0);
                JSONObject position = firstItem.getJSONObject("position");
                double lat = position.getDouble("lat");
                double lng = position.getDouble("lng");
                String label = firstItem.optString("title", address);

                return new LatLng(lat, lng, label);
            } else {
                throw new Exception("Không tìm thấy tọa độ cho địa chỉ: " + address);
            }
        }
    }

    // Tính khoảng cách giữa 2 địa chỉ bằng Here Routing API (driving)
    public long getDistance(String origin, String destination) throws Exception {
        LatLng originCoord = getCoordinates(origin);
        LatLng destCoord = getCoordinates(destination);

        String urlStr = "https://router.hereapi.com/v8/routes?transportMode=car"
                + "&origin=" + originCoord.lat + "," + originCoord.lng
                + "&destination=" + destCoord.lat + "," + destCoord.lng
                + "&return=summary"
                + "&apikey=" + apiKey;

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
                JSONObject firstRoute = routes.getJSONObject(0);
                JSONObject summary = firstRoute.getJSONObject("sections")
                        .getJSONArray("sections")
                        .getJSONObject(0)
                        .getJSONObject("summary");

                long distanceMeters = summary.getLong("length"); // tính bằng mét
                return distanceMeters;
            } else {
                throw new Exception("Không tính được khoảng cách.");
            }
        }
    }
}
