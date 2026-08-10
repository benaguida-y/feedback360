package com.yb.feedback360;

import com.yb.feedback360.config.MagicLinkProperties;
import com.yb.feedback360.config.MailProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({MagicLinkProperties.class, MailProperties.class})
public class Feedback360Application {

	public static void main(String[] args) {
		SpringApplication.run(Feedback360Application.class, args);
	}

}
