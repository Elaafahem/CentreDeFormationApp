package com.zayeni.training;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.zayeni.training.model")
@EnableJpaRepositories(basePackages = "com.zayeni.training.repository")
public class TrainingCenterApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrainingCenterApplication.class, args);
    }

}
