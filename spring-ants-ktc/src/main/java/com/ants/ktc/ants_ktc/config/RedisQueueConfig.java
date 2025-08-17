package com.ants.ktc.ants_ktc.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.ants.ktc.ants_ktc.models.ImageUploadMessage;

@Configuration
@EnableAsync
@EnableScheduling
public class RedisQueueConfig {

    @Bean("imageRedisTemplate")
    public RedisTemplate<String, ImageUploadMessage> imageRedisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, ImageUploadMessage> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Serializer cho key
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        // Serializer cho value (JSON)
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());

        template.afterPropertiesSet();
        return template;
    }
}

