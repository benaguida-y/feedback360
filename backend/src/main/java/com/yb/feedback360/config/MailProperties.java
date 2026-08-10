package com.yb.feedback360.config;


import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "feedback360.mail")
public record MailProperties(String from) {
}
