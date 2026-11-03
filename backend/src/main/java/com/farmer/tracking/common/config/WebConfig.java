package com.farmer.tracking.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Serves uploaded avatar images as public static resources at {@code /uploads/**}.
 * The physical directory is configured via {@code app.uploads.dir} in application.properties.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.uploads.dir:./uploads/avatars}")
    private String uploadsDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Resolve the uploads root (one level above /avatars)
        Path avatarsPath = Paths.get(uploadsDir).toAbsolutePath().normalize();
        Path uploadsRoot = avatarsPath.getParent(); // ./uploads

        String resourceLocation = "file:" + uploadsRoot.toString().replace("\\", "/") + "/";

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(resourceLocation)
                .setCachePeriod(3600); // 1-hour browser cache
    }
}
