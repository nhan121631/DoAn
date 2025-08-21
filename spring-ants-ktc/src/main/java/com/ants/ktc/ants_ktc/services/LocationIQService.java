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
        this.apiKey = com.ants.ktc.ants_ktc.config.EnvLoader.get("GOONG_API_KEY");
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
        String urlStr = "https://rsapi.goong.io/geocode?address=" + encodedAddress
                + "&api_key=" + apiKey;

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
            JSONArray results = json.optJSONArray("results");

            if (results != null && results.length() > 0) {
                JSONObject first = results.getJSONObject(0);
                JSONObject location = first.getJSONObject("geometry").getJSONObject("location");

                double lat = location.getDouble("lat");
                double lng = location.getDouble("lng");
                String formattedAddress = first.optString("formatted_address", address);

                return new LatLng(lat, lng, formattedAddress);
            } else {
                throw new Exception("Không tìm thấy tọa độ cho địa chỉ: " + address);
            }
        }
    }

    public long getDistance(String origin, String destination) throws Exception {
        LatLng originCoord = getCoordinates(origin);
        LatLng destCoord = getCoordinates(destination);

        String urlStr = "https://rsapi.goong.io/DistanceMatrix"
                + "?origins=" + originCoord.lat + "," + originCoord.lng
                + "&destinations=" + destCoord.lat + "," + destCoord.lng
                + "&vehicle=car"
                + "&api_key=" + apiKey;

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
            JSONArray rows = json.optJSONArray("rows");

            if (rows != null && rows.length() > 0) {
                JSONObject firstRow = rows.getJSONObject(0);
                JSONArray elements = firstRow.getJSONArray("elements");
                JSONObject firstElement = elements.getJSONObject(0);

                JSONObject distanceObj = firstElement.getJSONObject("distance");
                long distanceMeters = distanceObj.getLong("value");

                return distanceMeters;
            } else {
                throw new Exception("Không tính được khoảng cách.");
            }
        }
    }
}
