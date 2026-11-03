package com.farmer.tracking.common.telemetry;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerMapping;

import java.io.IOException;

/**
 * Measures every API call (method, matched route, status, duration) for the admin telemetry page.
 * Routes are recorded by pattern ({@code /api/v1/farms/{id}}), never by raw URL, so ids and
 * scanner noise cannot grow the metrics map without bound.
 */
public class RequestMetricsFilter extends OncePerRequestFilter {

    private final ObjectProvider<TelemetryService> telemetry;

    public RequestMetricsFilter(ObjectProvider<TelemetryService> telemetry) {
        this.telemetry = telemetry;
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String uri = request.getRequestURI();
        return "OPTIONS".equalsIgnoreCase(request.getMethod())
                || !uri.startsWith("/api/")
                || uri.startsWith("/api/v1/admin");
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain) throws ServletException, IOException {
        long start = System.nanoTime();
        int status = 500;
        try {
            chain.doFilter(request, response);
            status = response.getStatus();
        } finally {
            TelemetryService service = telemetry.getIfAvailable();
            if (service != null) {
                Object pattern = request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
                long durationMs = (System.nanoTime() - start) / 1_000_000;
                service.record(request.getMethod(), pattern != null ? pattern.toString() : "(unmatched)", status, durationMs);
            }
        }
    }
}
