package com.ants.ktc.ants_ktc.config;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

@EnableCaching
@Configuration
public class CacheConfig {
        @Bean
        public RedisCacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {
                RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofMinutes(60))
                                .serializeValuesWith(
                                                RedisSerializationContext.SerializationPair.fromSerializer(
                                                                new GenericJackson2JsonRedisSerializer()));

                // Cấu hình TTL cho từng cache cụ thể
                Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();
                cacheConfigs.put("typeposts", config.entryTtl(Duration.ofMinutes(24 * 60))); // TTL 24 giờ
                cacheConfigs.put("manage-accounts", config.entryTtl(Duration.ofMinutes(24 * 60))); // TTL 24 giờ

                return RedisCacheManager.builder(redisConnectionFactory)
                                .cacheDefaults(config)
                                .withInitialCacheConfigurations(cacheConfigs)
                                .build();
        }

}