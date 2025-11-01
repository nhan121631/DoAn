package com.ants.ktc.ants_ktc.services.auth;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.entities.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JwtService {

    private SecretKey getSigningKey() {
        String secretKey = "NBZzu/XN0IgTPw/EfJgOkYD+tK5JdLLhQdNkUsPl2AU=";
        byte[] keyBytes = io.jsonwebtoken.io.Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private String createToken(Map<String, Object> claims, String subject, long expiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    public String generateAccessToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("type", "access_token"); // Token type identifier

        // Add user roles to access token
        /*
         * Trường hợp KHÔNG nên đưa roles vào JWT:
         * Bảo mật cao: Roles có thể thay đổi thường xuyên, nếu để trong JWT thì phải
         * chờ token hết hạn mới cập nhật được.
         * Roles phức tạp: Nếu roles có nhiều thông tin chi tiết, JWT sẽ trở nên lớn.
         * Quản lý tập trung: Muốn kiểm soát quyền truy cập real-time từ database.
         * Trường hợp NÊN đưa roles vào JWT:
         * Performance: Tránh query database mỗi request để lấy roles.
         * Stateless: Hoàn toàn không phụ thuộc vào database cho việc xác thực.
         * Microservices: Các service khác có thể đọc roles từ JWT mà không cần gọi user
         * service.
         */
        // List<Map<String, Object>> roles = user.getRoles().stream()
        // .map(role -> {
        // Map<String, Object> roleMap = new HashMap<>();
        // roleMap.put("id", role.getId());
        // roleMap.put("name", role.getName());
        // return roleMap;
        // })
        // .collect(Collectors.toList());

        // claims.put("roles", roles);

        long jwtExpiration = 604800000; // 1 week in milliseconds
        return createToken(claims, user.getUsername(), jwtExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("type", String.class));
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        final String tokenType = extractTokenType(token);
        return (username.equals(userDetails.getUsername()))
                && !isTokenExpired(token)
                && "access_token".equals(tokenType); // Only access tokens for authentication
    }

    public String generateRefreshToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("type", "refresh_token"); // Token type identifier
        long refreshExpiration = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        return createToken(claims, user.getUsername(), refreshExpiration);
    }
}
