package com.ants.ktc.ants_ktc.controllers;

import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

    // ===== Helper =====

    public static String hmacSHA512(String key, String data) throws Exception {
        Mac hmac512 = Mac.getInstance("HmacSHA512");
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
        hmac512.init(secretKey);
        byte[] bytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(bytes);
    }

    // public static boolean verifySignature(Map<String, String> vnpParams, String
    // secret) {
    // try {
    // String vnpSecureHash = vnpParams.get("vnp_SecureHash");
    // if (vnpSecureHash == null)
    // return false;

    // Map<String, String> data = new HashMap<>(vnpParams);
    // data.remove("vnp_SecureHash");
    // data.remove("vnp_SecureHashType");

    // String hashData = data.entrySet().stream()
    // .sorted(Map.Entry.comparingByKey())
    // .map(entry -> entry.getKey() + "=" + entry.getValue())
    // .collect(Collectors.joining("&"));

    // String calcHash = hmacSHA512(secret, hashData);
    // return vnpSecureHash.equalsIgnoreCase(calcHash);
    // } catch (Exception e) {
    // return false;
    // }
    // }
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

}
