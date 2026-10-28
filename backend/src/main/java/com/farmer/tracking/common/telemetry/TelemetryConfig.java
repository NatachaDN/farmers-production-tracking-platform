package com.farmer.tracking.common.telemetry;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;

@Configuration
public class TelemetryConfig {

    /** Runs before Spring Security so rejected (401/403) requests are counted too. */
    @Bean
    public FilterRegistrationBean<RequestMetricsFilter> requestMetricsFilter(ObjectProvider<TelemetryService> telemetry) {
        FilterRegistrationBean<RequestMetricsFilter> registration =
                new FilterRegistrationBean<>(new RequestMetricsFilter(telemetry));
        registration.addUrlPatterns("/api/*");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 10);
        return registration;
    }
}
