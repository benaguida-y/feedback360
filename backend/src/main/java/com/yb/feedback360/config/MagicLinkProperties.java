package com.yb.feedback360.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "feedback360.magic-link")
public record MagicLinkProperties(String baseUrl, long ttlDays) {
}
