package com.yb.feedback360.config;

import org.springframework.boot.context.properties.ConfigurationProperties;


@ConfigurationProperties(prefix = "feedback360.jwt")
public record JwtProperties(String secret) {
}
