package com.Omkar.SpringEcom.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
        // 1. Allow React (Vercel) to talk to Spring Boot
        http.cors(cors -> cors.configurationSource(request -> {
            CorsConfiguration config = new CorsConfiguration();
            // ADD YOUR VERCEL URL HERE (Keep localhost if you still want to test locally)
            config.setAllowedOrigins(List.of("http://localhost:5173", "https://order-stack-platform-brown.vercel.app/"));
            config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
            config.setAllowedHeaders(List.of("*"));
            config.setAllowCredentials(true);
            return config;
        }));

        http.csrf(csrf -> csrf.disable());

        // 2. Secure your routes
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/register", "/api/login", "/api/auth/**", "/error", "/api/products/**", "/api/product/**", "/api/users", "/api/users/**", "/api/orders/**").permitAll()
                .anyRequest().authenticated()
        );

        // 3. The Magic OAuth2 Config
        http.oauth2Login(oauth2 -> oauth2
                .defaultSuccessUrl("https://order-stack-platform-brown.vercel.app/", true)
        );

        return http.build();
    }
}