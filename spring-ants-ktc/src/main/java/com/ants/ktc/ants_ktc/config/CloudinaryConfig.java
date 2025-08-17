package com.ants.ktc.ants_ktc.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", EnvLoader.get("CLOUDINARY_CLOUD_NAME"),
                "api_key", EnvLoader.get("CLOUDINARY_API_KEY"),
                "api_secret", EnvLoader.get("CLOUDINARY_API_SECRET"),
                "secure", true
        ));
    }
}
