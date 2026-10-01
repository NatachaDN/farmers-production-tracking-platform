package com.farmer.tracking.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Farmer Production Tracking Platform API")
                        .description("Comprehensive REST API for tracking farmers' crop cycles, harvests, yield calculations, " +
                                "and livestock/animal batch outputs (milk, eggs, meat, etc.) with Neon PostgreSQL integration.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Agritech Platform Engineering Team")
                                .email("support@farmer-tracking.com")
                                .url("https://github.com/NatachaDN/farmers-production-tracking-platform"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development Server"),
                        new Server().url("https://api.farmer-tracking.com").description("Production Server")
                ))
                .tags(List.of(
                        new Tag().name("Dashboard & Analytics").description("High-level farm production statistics and yield summaries"),
                        new Tag().name("Farmers & Farms").description("Operations for farmers and registered farm plots"),
                        new Tag().name("Crop Production").description("Management of crop planting cycles, growth status, and harvest yields"),
                        new Tag().name("Animal Production").description("Management of livestock batches, populations, and daily output logs")
                ));
    }
}
