package com.farmer.tracking.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Enforces data ownership on every farmer-scoped endpoint
 * ({@code /api/v1/farmers/{farmerId}/...}).
 * <p>
 * The {@code farmerId} in the URL must be the id of the authenticated farmer,
 * otherwise the request is rejected with 403 before it reaches a controller.
 * Administrators may access any farmer's data.
 * <p>
 * Runs after {@link JwtAuthenticationFilter}; unauthenticated requests are left
 * to the regular authorization rules (which answer 401).
 */
public class FarmerOwnershipFilter extends OncePerRequestFilter {

    private static final Pattern FARMER_SCOPED_PATH = Pattern.compile("^/api/v1/farmers/(\\d+)(?:/.*)?$");

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI().substring(request.getContextPath().length());
        Matcher matcher = FARMER_SCOPED_PATH.matcher(path);

        if (matcher.matches() && !isAllowed(Long.valueOf(matcher.group(1)))) {
            writeForbidden(request, response, path);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAllowed(Long requestedFarmerId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            // Not authenticated: the authorization rules downstream will reject it.
            return true;
        }
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        return isAdmin || requestedFarmerId.equals(principal.getId());
    }

    private void writeForbidden(HttpServletRequest request, HttpServletResponse response, String path) throws IOException {
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(String.format(
                "{\"timestamp\":\"%s\",\"status\":403,\"error\":\"Forbidden\","
                        + "\"message\":\"Access denied: you can only access your own data.\",\"path\":\"%s\"}",
                LocalDateTime.now(), path.replace("\"", "")));
    }
}
