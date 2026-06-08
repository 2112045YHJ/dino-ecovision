package com.ecovision.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class EcoVisionApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcoVisionApplication.class, args);
    }
}
