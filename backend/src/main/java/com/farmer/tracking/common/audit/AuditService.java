package com.farmer.tracking.common.audit;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Records authentication events. Auditing must never break a sign-in, so failures are only logged.
 */
@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditEventRepository repository;

    public AuditService(AuditEventRepository repository) {
        this.repository = repository;
    }

    public void record(AuditEventType type, Long actorId, String actorLabel, String detail, HttpServletRequest request) {
        try {
            repository.save(new AuditEvent(
                    type,
                    actorId,
                    truncate(actorLabel, 160),
                    truncate(detail, 255),
                    truncate(clientIp(request), 64)));
        } catch (RuntimeException ex) {
            log.warn("Could not record audit event {}: {}", type, ex.getMessage());
        }
    }

    /** First hop of X-Forwarded-For when behind a proxy, otherwise the socket address. Informational only. */
    static String clientIp(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return null;
        }
        return value.length() <= max ? value : value.substring(0, max);
    }
}
