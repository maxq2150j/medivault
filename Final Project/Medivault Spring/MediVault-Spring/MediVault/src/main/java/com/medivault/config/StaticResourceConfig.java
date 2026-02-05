package com.medivault.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve consultation PDFs from the uploads/consultations directory
        registry.addResourceHandler("/uploads/consultations/**")
                .addResourceLocations("file:uploads/consultations/");

		// Serve patient files (lab reports, scans, etc.) from uploads/patient-files
		registry.addResourceHandler("/uploads/patient-files/**")
				.addResourceLocations("file:uploads/patient-files/");
    }
}
