package com.ants.ktc.ants_ktc.config;

import static org.springframework.security.config.Customizer.withDefaults;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.ants.ktc.ants_ktc.exceptions.CustomAccessDeniedHandler;
import com.ants.ktc.ants_ktc.exceptions.CustomAuthenticationEntryPoint;
import com.ants.ktc.ants_ktc.filters.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity()
@RequiredArgsConstructor
public class SecurityConfig {
        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final CustomAccessDeniedHandler customAccessDeniedHandler;
        private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http.cors(withDefaults())
                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .exceptionHandling(exception -> exception
                                                .authenticationEntryPoint(this.customAuthenticationEntryPoint)
                                                .accessDeniedHandler(this.customAccessDeniedHandler))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/api/auth/change-password").authenticated()
                                                .requestMatchers("/api/auth/**").permitAll()
                                                // .requestMatchers("/api/approval-queue/**").hasRole("Administrators")
                                                // Cho phép GET /api/post-types/** cho cả Landlords và Administrators
                                                // admin
                                                .requestMatchers("/api/admin/**").hasRole("Administrators")
                                                .requestMatchers(HttpMethod.GET, "/api/post-types/**")
                                                .hasAnyRole("Landlords", "Administrators")
                                                .requestMatchers("/api/post-types/**").hasAnyRole("Administrators")
                                                .requestMatchers("/api/wallets/**")
                                                .hasAnyRole("Landlords", "Administrators")
                                                .requestMatchers("/api/payments/**")
                                                .hasAnyRole("Landlords", "Administrators")
                                                .requestMatchers("/api/transactions/**")
                                                .hasAnyRole("Landlords", "Administrators")
                                                .requestMatchers("/api/admin/accounts/**").hasAnyRole("Administrators")
                                                .requestMatchers("/api/transactions/**")
                                                .hasAnyRole("Landlords", "Administrators")
                                                .requestMatchers("/api/requirements/**").authenticated()
                                                .requestMatchers("/api/requirements/landlord/**")
                                                .hasAnyRole("Landlords", "Administrators")
                                                // statistics landlord
                                                .requestMatchers("/api/landlord/statistics/**")
                                                .hasAnyRole("Landlords", "Administrators")
                                                // feedback
                                                .requestMatchers(HttpMethod.GET, "/api/rooms/*/feedbacks").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/rooms/*/feedbacks")
                                                .hasRole("Users") // viết feedback
                                                .requestMatchers(HttpMethod.POST, "/api/rooms/feedbacks/*/reply")
                                                .hasRole("Landlords") // reply feedback
                                                // .requestMatchers(HttpMethod.GET,
                                                // "/api/rooms/*/feedback-access").authenticated() // check quyền

                                                // contract
                                                .requestMatchers("/api/contracts/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/rooms/landlords/*/feedbacks")
                                                .hasRole("Landlords") // landlord xem feedback
                                                .requestMatchers(HttpMethod.DELETE, "/api/rooms/feedbacks/*")
                                                .hasAnyRole("Users", "Landlords", "Administrators")
                                                .anyRequest().permitAll())
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(List.of("*"));
                configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
                configuration.setAllowedHeaders(List.of("*"));
                configuration.setAllowCredentials(false); // Không cho gửi cookie/token
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}