package com.yb.feedback360.config;

import com.yb.feedback360.constant.ApiPaths;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${feedback360.webhook.api-key}")
    private String webhookApiKey;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(ApiPaths.ERROR).permitAll()
                        .requestMatchers(ApiPaths.AUTHENTICATION_PATTERN).permitAll()
                        .requestMatchers(ApiPaths.INTEGRATIONS_PATTERN).hasRole("WEBHOOK")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(new ApiKeyFilter(webhookApiKey),
                        UsernamePasswordAuthenticationFilter.class)
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
        return http.build();
    }
}
