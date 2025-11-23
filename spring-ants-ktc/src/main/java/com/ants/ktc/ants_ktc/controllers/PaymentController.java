package com.ants.ktc.ants_ktc.controllers;

import java.net.URLDecoder;
import java.net.URLEncoder;
// import java.net.http.HttpHeaders; // Sai, không dùng
import org.springframework.http.HttpHeaders;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import com.ants.ktc.ants_ktc.dtos.transaction.CreateTransactionRequestDto;
import com.ants.ktc.ants_ktc.services.TransactionService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Value("${vnpay.tmn-code}")
    private String vnpTmnCode;

    @Value("${vnpay.hash-secret}")
    private String vnpHashSecret;

    @Value("${vnpay.url}")
    private String vnpUrl;

    @Value("${vnpay.return-url}")
    private String vnpReturnUrl;

    @Value("${paypal.client-id}")
    private String paypalClientId;

    @Value("${paypal.secret}")
    private String paypalSecret;

    @Value("${paypal.api}")
    private String paypalApi;

    @Value("${paypal.return-url}")
    private String paypalReturnUrl;

    @Autowired
    private TransactionService transactionService;

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        try {
            long amount = Long.parseLong(body.get("amount").toString());
            String description = body.get("description") != null ? body.get("description").toString() : "";
            UUID userId = UUID.fromString(body.get("userId").toString());

            String transactionId = String.valueOf(System.currentTimeMillis());

            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", "2.1.0");
            vnp_Params.put("vnp_Command", "pay");
            vnp_Params.put("vnp_TmnCode", vnpTmnCode);
            vnp_Params.put("vnp_Amount", String.valueOf(amount * 100));
            vnp_Params.put("vnp_CurrCode", "VND");
            if (body.containsKey("bankCode")) {
                vnp_Params.put("vnp_BankCode", body.get("bankCode").toString());
            }
            vnp_Params.put("vnp_TxnRef", transactionId);

            // Encode userId + transactionId để confirm dễ xử lý
            // String orderInfo = Base64.getUrlEncoder().encodeToString(
            // ("WALLET|" + userId + "|" + transactionId).getBytes(StandardCharsets.UTF_8));
            String safeDescription = URLEncoder.encode(description, StandardCharsets.UTF_8);
            String rawInfo = "WALLET|" + userId + "|" + transactionId + "|" + safeDescription;
            String orderInfo = Base64.getUrlEncoder().encodeToString(rawInfo.getBytes(StandardCharsets.UTF_8));

            vnp_Params.put("vnp_OrderInfo", orderInfo);

            vnp_Params.put("vnp_OrderType", "wallet");
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_ReturnUrl", vnpReturnUrl);
            vnp_Params.put("vnp_IpAddr", request.getRemoteAddr());

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            vnp_Params.put("vnp_CreateDate", formatter.format(cld.getTime()));

            cld.add(Calendar.MINUTE, 15);
            vnp_Params.put("vnp_ExpireDate", formatter.format(cld.getTime()));

            // Build query
            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            for (String fieldName : fieldNames) {
                String fieldValue = vnp_Params.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    hashData.append(fieldName).append('=')
                            .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII)).append('&');
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII)).append('=')
                            .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII)).append('&');
                }
            }
            hashData.setLength(hashData.length() - 1);
            query.setLength(query.length() - 1);

            String secureHash = hmacSHA512(vnpHashSecret, hashData.toString());
            String paymentUrl = vnpUrl + "?" + query.toString() + "&vnp_SecureHash=" + secureHash;

            return ResponseEntity.ok(Map.of(
                    "transactionId", transactionId,
                    "paymentUrl", paymentUrl));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/confirm")
    public ResponseEntity<?> confirm(@RequestParam Map<String, String> vnpParams) {
        try {
            // 1) Verify signature
            if (!verifySignature(vnpParams, vnpHashSecret)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Invalid signature"));
            }

            // 2) Check response code
            String responseCode = vnpParams.get("vnp_ResponseCode");
            if (!"00".equals(responseCode)) {
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "Payment failed",
                        "code", responseCode));
            }

            // 3) Parse OrderInfo
            String orderInfoRaw = vnpParams.get("vnp_OrderInfo");
            // String decoded;
            // try {
            // decoded = new String(Base64.getUrlDecoder().decode(orderInfoRaw));
            // } catch (Exception e) {
            // decoded = orderInfoRaw; // fallback nếu không phải Base64
            // }
            String decoded;

            try {
                decoded = new String(Base64.getUrlDecoder().decode(orderInfoRaw), StandardCharsets.UTF_8);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Base64 decode failed",
                        "raw", orderInfoRaw));
            }

            String[] parts = decoded.split("\\|");
            if (parts.length < 3) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Invalid OrderInfo format - need at least 3 parts",
                        "decoded", decoded,
                        "partsCount", parts.length));
            }

            String description = "";
            if (parts.length > 3 && !parts[3].isEmpty()) {
                String rawDesc = parts[3];
                if (rawDesc.contains("%")) {
                    // Contains URL encoded characters, decode it
                    try {
                        description = URLDecoder.decode(rawDesc, StandardCharsets.UTF_8);
                    } catch (Exception e) {
                        description = rawDesc; // fallback if decode fails
                    }
                } else {
                    // No encoding, use as-is
                    description = rawDesc;
                }
            }

            UUID userId;
            try {
                userId = UUID.fromString(parts[1]);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Invalid UUID in OrderInfo",
                        "raw", parts[1]));
            }
            if (transactionService.existsByTransactionCode(vnpParams.get("vnp_TransactionNo"))) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Transaction already processed"));
            }
            // 4) Save to DB
            CreateTransactionRequestDto dto = new CreateTransactionRequestDto();
            dto.setAmount(Double.parseDouble(vnpParams.get("vnp_Amount")) / 100.0);
            dto.setTransactionDate(new java.sql.Date(System.currentTimeMillis()));
            dto.setTransactionType(1);
            dto.setBankTransactionName(vnpParams.get("vnp_BankCode"));
            dto.setTransactionCode(vnpParams.get("vnp_TransactionNo"));
            dto.setStatus(1);
            dto.setDescription(description);

            var saved = transactionService.createTransactionByUserId(userId, dto);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "transaction", saved));

        } catch (Exception e) {
            e.printStackTrace(); // log lỗi cụ thể
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    // == === PayPal Integration ===
    @PostMapping("/paypal/create")
    public ResponseEntity<?> createPaypalOrder(@RequestBody Map<String, Object> body) {
        try {
            // 1️⃣ Lấy amount VND từ frontend
            if (!body.containsKey("amount")) {
                return ResponseEntity.badRequest().body("Missing amount");
            }

            double amountVND;
            try {
                amountVND = Double.parseDouble(body.get("amount").toString());
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body("Invalid amount format");
            }

            String description = body.get("description") != null ? body.get("description").toString() : "";

            // 2️⃣ Convert VND -> USD (try API trước, fallback tỷ giá cố định)
            // double amountUSD;
            // try {
            // RestTemplate restTemplate = new RestTemplate();
            // String url = "https://api.exchangerate.host/convert?from=VND&to=USD&amount="
            // + amountVND;
            // ResponseEntity<Map> rateRes = restTemplate.getForEntity(url, Map.class);
            // Map rateBody = rateRes.getBody();
            // if (rateBody != null && rateBody.get("result") != null) {
            // amountUSD = ((Number) rateBody.get("result")).doubleValue();
            // System.out.println("=============== Exchange rate API used: " +
            // rateBody.get("info").toString());
            // } else {
            // // fallback: tỷ giá cố định 1 USD = 24,000 VND
            // amountUSD = amountVND / 24000.0;
            // }
            // } catch (Exception e) {
            // // fallback: tỷ giá cố định
            // amountUSD = amountVND / 24000.0;
            // }

            // // Round 2 decimal cho PayPal
            // amountUSD = Math.round(amountUSD * 100.0) / 100.0;
            double amountUSD = convertVNDtoUSD(amountVND);

            // 3️⃣ Get PayPal access token
            RestTemplate restTemplate = new RestTemplate();
            String auth = paypalClientId + ":" + paypalSecret;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Basic " + encodedAuth);
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            HttpEntity<String> tokenRequest = new HttpEntity<>("grant_type=client_credentials", headers);
            ResponseEntity<Map> tokenResponse = restTemplate.exchange(
                    paypalApi + "/v1/oauth2/token", HttpMethod.POST, tokenRequest, Map.class);
            String accessToken = tokenResponse.getBody().get("access_token").toString();

            // 4️⃣ Create PayPal order
            headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            // create a transaction id and encode userId + transactionId + amountVND +
            // description into custom_id
            UUID ppUserId = null;
            if (body.containsKey("userId") && body.get("userId") != null) {
                try {
                    ppUserId = UUID.fromString(body.get("userId").toString());
                } catch (Exception ex) {
                    // ignore
                }
            }

            String transactionId = String.valueOf(System.currentTimeMillis());
            String safeDescription = URLEncoder.encode(description, StandardCharsets.UTF_8);
            String rawInfo = "WALLET|" + (ppUserId != null ? ppUserId.toString() : "") + "|" + transactionId + "|"
                    + amountVND + "|" + safeDescription;
            String customId = Base64.getUrlEncoder().encodeToString(rawInfo.getBytes(StandardCharsets.UTF_8));

            Map<String, Object> purchaseUnit = new HashMap<>();
            purchaseUnit.put("amount", Map.of(
                    "currency_code", "USD",
                    "value", String.format(Locale.US, "%.2f", amountUSD)));
            purchaseUnit.put("description", description);
            purchaseUnit.put("custom_id", customId);

            Map<String, Object> orderBody = Map.of(
                    "intent", "CAPTURE",
                    "purchase_units", List.of(purchaseUnit),
                    "application_context", Map.of(
                            "return_url", paypalReturnUrl,
                            "cancel_url", paypalReturnUrl));
            HttpEntity<Map<String, Object>> orderRequest = new HttpEntity<>(orderBody, headers);
            ResponseEntity<Map> orderResponse = restTemplate.postForEntity(
                    paypalApi + "/v2/checkout/orders", orderRequest, Map.class);

            // 5️⃣ Lấy link approve
            List<Map<String, String>> links = (List<Map<String, String>>) orderResponse.getBody().get("links");
            String approveUrl = links.stream()
                    .filter(link -> "approve".equals(link.get("rel")))
                    .findFirst()
                    .map(link -> link.get("href"))
                    .orElse(null);

            // 6️⃣ Log để debug
            System.out.println("PayPal Order created: VND=" + amountVND + ", USD=" + amountUSD);

            // 7️⃣ Trả về FE
            return ResponseEntity.ok(Map.of(
                    "orderId", orderResponse.getBody().get("id"),
                    "approveUrl", approveUrl,
                    "amountVND", amountVND,
                    "amountUSD", amountUSD));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("PayPal error: " + e.getMessage());
        }
    }

    @GetMapping("/paypal/confirm")
    public ResponseEntity<?> capturePaypalOrder(@RequestParam Map<String, String> params) {
        try {
            // PayPal returns `token` (order id) on return URL; support `orderId` as
            // fallback
            String orderId = params.getOrDefault("token", params.get("orderId"));
            if (orderId == null || orderId.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Missing order id (token)"));
            }

            // 1. Get access token
            RestTemplate restTemplate = new RestTemplate();
            String auth = paypalClientId + ":" + paypalSecret;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Basic " + encodedAuth);
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            HttpEntity<String> tokenRequest = new HttpEntity<>("grant_type=client_credentials", headers);
            ResponseEntity<Map> tokenResponse = restTemplate.exchange(
                    paypalApi + "/v1/oauth2/token", HttpMethod.POST, tokenRequest, Map.class);
            String accessToken = tokenResponse.getBody().get("access_token").toString();

            // 2. Get order details first and ensure payer approved the order
            headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<?> orderDetailsReq = new HttpEntity<>(headers);
            ResponseEntity<Map> orderDetailsRes;
            try {
                orderDetailsRes = restTemplate.exchange(
                        paypalApi + "/v2/checkout/orders/" + orderId, HttpMethod.GET, orderDetailsReq, Map.class);
            } catch (HttpClientErrorException httpEx) {
                String body = httpEx.getResponseBodyAsString();
                httpEx.printStackTrace();
                return ResponseEntity.status(httpEx.getStatusCode()).body(Map.of("success", false, "error", body));
            }

            Map orderBody = orderDetailsRes.getBody();
            String status = null;
            String approveUrl = null;
            if (orderBody != null) {
                Object st = orderBody.get("status");
                if (st != null)
                    status = st.toString();
                // find approve link if available
                try {
                    Object linksObj = orderBody.get("links");
                    if (linksObj instanceof List) {
                        List linksRaw = (List) linksObj;
                        for (Object l : linksRaw) {
                            if (l instanceof Map) {
                                Object rel = ((Map) l).get("rel");
                                if ("approve".equals(rel)) {
                                    approveUrl = ((Map) l).get("href").toString();
                                    break;
                                }
                            }
                        }
                    }
                } catch (Exception ignore) {
                }
            }

            if (status == null || !"APPROVED".equalsIgnoreCase(status)) {
                // Not approved yet - return a VNPay-like failure response so frontend can
                // handle/redirect. Use a mutable map to avoid NPE when values are null.
                Map<String, Object> resp = new HashMap<>();
                resp.put("success", false);
                resp.put("message", "Payment not approved");
                if (approveUrl != null)
                    resp.put("approveUrl", approveUrl);
                if (orderBody != null)
                    resp.put("order", orderBody);
                return ResponseEntity.ok(resp);
            }

            // 3. Capture order (since it's APPROVED)
            HttpEntity<?> captureRequest = new HttpEntity<>(headers);
            ResponseEntity<Map> captureResponse;
            try {
                captureResponse = restTemplate.postForEntity(
                        paypalApi + "/v2/checkout/orders/" + orderId + "/capture", captureRequest, Map.class);
            } catch (HttpClientErrorException httpEx) {
                String body = httpEx.getResponseBodyAsString();
                httpEx.printStackTrace();
                return ResponseEntity.status(httpEx.getStatusCode()).body(Map.of("success", false, "error", body));
            }

            String customId = null;
            if (orderBody != null && orderBody.get("purchase_units") instanceof List) {
                List puList = (List) orderBody.get("purchase_units");
                if (!puList.isEmpty() && puList.get(0) instanceof Map) {
                    Object c = ((Map) puList.get(0)).get("custom_id");
                    if (c != null)
                        customId = c.toString();
                }
            }

            // 4. If we have customId, decode and save transaction similar to VNPay
            if (customId != null) {
                try {
                    String decoded = new String(Base64.getUrlDecoder().decode(customId), StandardCharsets.UTF_8);
                    // expected format: WALLET|userId|transactionId|amountVND|description
                    String[] parts = decoded.split("\\|");
                    if (parts.length >= 4) {
                        String uidPart = parts[1];
                        UUID userId = null;
                        if (uidPart != null && !uidPart.isEmpty()) {
                            try {
                                userId = UUID.fromString(uidPart);
                            } catch (Exception ex) {
                                userId = null;
                            }
                        }

                        String transactionCode = parts[2];
                        double amountVndParsed = 0.0;
                        try {
                            amountVndParsed = Double.parseDouble(parts[3]);
                        } catch (Exception ex) {
                            /* ignore */ }
                        String description = "";
                        if (parts.length > 4) {
                            String rawDesc = parts[4];
                            try {
                                description = URLDecoder.decode(rawDesc, StandardCharsets.UTF_8);
                            } catch (Exception ex) {
                                description = rawDesc;
                            }
                        }

                        // Avoid duplicate processing: check by transactionCode or orderId
                        if (transactionService.existsByTransactionCode(transactionCode)
                                || transactionService.existsByTransactionCode(orderId)) {
                            return ResponseEntity
                                    .ok(Map.of("success", true, "message", "Transaction already processed"));
                        }

                        if (userId == null) {
                            // Can't save without userId - return capture result but indicate not saved
                            Map<String, Object> resp = new HashMap<>();
                            resp.put("success", true);
                            resp.put("saved", false);
                            resp.put("message", "No userId in custom_id; capture done");
                            if (captureResponse != null && captureResponse.getBody() != null)
                                resp.put("paypalResponse", captureResponse.getBody());
                            return ResponseEntity.ok(resp);
                        }

                        CreateTransactionRequestDto dto = new CreateTransactionRequestDto();
                        dto.setAmount(amountVndParsed);
                        dto.setTransactionDate(new java.sql.Date(System.currentTimeMillis()));
                        dto.setTransactionType(1);
                        dto.setBankTransactionName("PayPal");
                        dto.setTransactionCode(transactionCode != null ? transactionCode : orderId);
                        dto.setStatus(1);
                        dto.setDescription(description);

                        var saved = transactionService.createTransactionByUserId(userId, dto);

                        Map<String, Object> resp = new HashMap<>();
                        resp.put("success", true);
                        resp.put("transaction", saved);
                        if (captureResponse != null && captureResponse.getBody() != null)
                            resp.put("paypalResponse", captureResponse.getBody());
                        return ResponseEntity.ok(resp);
                    }
                } catch (Exception ex) {
                    // decoding/parsing failed - log and continue to return capture result
                    ex.printStackTrace();
                }
            }

            // fallback: return capture response
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            if (captureResponse != null && captureResponse.getBody() != null)
                resp.put("paypalResponse", captureResponse.getBody());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("PayPal error: " + e.getMessage());
        }
    }
    // ===== Helper =====

    public static String hmacSHA512(String key, String data) throws Exception {
        Mac hmac512 = Mac.getInstance("HmacSHA512");
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
        hmac512.init(secretKey);
        byte[] bytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(bytes);
    }

    public static boolean verifySignature(Map<String, String> vnpParams, String secret) {
        try {
            String vnpSecureHash = vnpParams.get("vnp_SecureHash");
            if (vnpSecureHash == null)
                return false;

            Map<String, String> data = new HashMap<>(vnpParams);
            data.remove("vnp_SecureHash");
            data.remove("vnp_SecureHashType");

            List<String> fieldNames = new ArrayList<>(data.keySet());
            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();
            for (String fieldName : fieldNames) {
                String fieldValue = data.get(fieldName);
                if (fieldValue != null && fieldValue.length() > 0) {
                    hashData.append(fieldName).append("=")
                            .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII))
                            .append("&");
                }
            }
            hashData.setLength(hashData.length() - 1); // remove last &

            String calcHash = hmacSHA512(secret, hashData.toString());

            return vnpSecureHash.equalsIgnoreCase(calcHash);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public static double convertVNDtoUSD(double amountVND) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            // Sử dụng ExchangeRate-API (free, no API key required)
            String url = "https://api.exchangerate-api.com/v4/latest/VND";
            ResponseEntity<Map> rateRes = restTemplate.getForEntity(url, Map.class);
            Map rateBody = rateRes.getBody();

            if (rateBody != null && rateBody.get("rates") != null) {
                Map<String, Object> rates = (Map<String, Object>) rateBody.get("rates");
                double usdRate = ((Number) rates.get("USD")).doubleValue();
                double amountUSD = amountVND * usdRate;
                return Math.round(amountUSD * 100.0) / 100.0;
            }
        } catch (Exception e) {
            // Log error nếu cần
            System.err.println("Exchange rate API error: " + e.getMessage());
        }
        // Fallback rate: 1 USD = 25,000 VND (cập nhật tỷ giá mới hơn)
        return Math.round((amountVND / 25000.0) * 100.0) / 100.0;
    }

}
