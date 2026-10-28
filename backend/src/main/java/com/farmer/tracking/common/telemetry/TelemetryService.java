package com.farmer.tracking.common.telemetry;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.LongAdder;

/**
 * In-memory API traffic telemetry. Counters reset when the application restarts.
 * Requests to the admin console itself are not recorded (see {@link RequestMetricsFilter}).
 */
@Service
public class TelemetryService {

    private static final int RECENT_LIMIT = 200;
    private static final int MINUTES_WINDOW = 30;

    private final Instant startedAt = Instant.now();
    private final LongAdder total = new LongAdder();
    private final LongAdder clientErrors = new LongAdder();
    private final LongAdder serverErrors = new LongAdder();
    private final LongAdder totalDurationMs = new LongAdder();
    private final Map<String, EndpointStats> endpoints = new ConcurrentHashMap<>();
    private final Map<Long, LongAdder> perMinute = new ConcurrentHashMap<>();
    private final ConcurrentLinkedDeque<RequestSample> recent = new ConcurrentLinkedDeque<>();
    private final AtomicInteger recentSize = new AtomicInteger();

    public void record(String method, String pattern, int status, long durationMs) {
        Instant now = Instant.now();
        total.increment();
        totalDurationMs.add(durationMs);
        if (status >= 500) {
            serverErrors.increment();
        } else if (status >= 400) {
            clientErrors.increment();
        }

        endpoints.computeIfAbsent(method + " " + pattern, k -> new EndpointStats(method, pattern))
                .add(status, durationMs, now);

        long minute = now.truncatedTo(ChronoUnit.MINUTES).getEpochSecond();
        perMinute.computeIfAbsent(minute, k -> new LongAdder()).increment();
        long cutoff = now.minus(MINUTES_WINDOW + 5, ChronoUnit.MINUTES).getEpochSecond();
        perMinute.keySet().removeIf(k -> k < cutoff);

        recent.addFirst(new RequestSample(now, method, pattern, status, durationMs));
        if (recentSize.incrementAndGet() > RECENT_LIMIT) {
            recent.pollLast();
            recentSize.decrementAndGet();
        }
    }

    public TrafficSnapshot snapshot() {
        long count = total.sum();
        long errors = clientErrors.sum() + serverErrors.sum();

        List<RequestSample> samples = new ArrayList<>();
        for (Iterator<RequestSample> it = recent.iterator(); it.hasNext() && samples.size() < RECENT_LIMIT; ) {
            samples.add(it.next());
        }
        List<Long> durations = samples.stream().map(RequestSample::durationMs).sorted().toList();
        long p95 = durations.isEmpty() ? 0 : durations.get((int) Math.min(durations.size() - 1, Math.floor(durations.size() * 0.95)));

        Instant nowMinute = Instant.now().truncatedTo(ChronoUnit.MINUTES);
        List<MinuteBucket> buckets = new ArrayList<>();
        for (int i = MINUTES_WINDOW - 1; i >= 0; i--) {
            Instant minute = nowMinute.minus(i, ChronoUnit.MINUTES);
            LongAdder adder = perMinute.get(minute.getEpochSecond());
            buckets.add(new MinuteBucket(minute, adder == null ? 0 : adder.sum()));
        }

        List<EndpointSnapshot> endpointSnapshots = endpoints.values().stream()
                .map(EndpointStats::snapshot)
                .sorted(Comparator.comparingLong(EndpointSnapshot::requests).reversed())
                .limit(20)
                .toList();

        return new TrafficSnapshot(
                startedAt,
                count,
                clientErrors.sum(),
                serverErrors.sum(),
                count == 0 ? 0 : (double) errors / count,
                count == 0 ? 0 : (double) totalDurationMs.sum() / count,
                p95,
                buckets,
                endpointSnapshots,
                samples.stream().limit(25).toList());
    }

    // ----- Snapshot types (serialised as JSON by the admin API) -----

    public record RequestSample(Instant at, String method, String path, int status, long durationMs) {}

    public record MinuteBucket(Instant minute, long requests) {}

    public record EndpointSnapshot(String method, String path, long requests, long errors,
                                   double avgMs, long maxMs, Instant lastAt) {}

    public record TrafficSnapshot(Instant countingSince, long totalRequests, long clientErrors, long serverErrors,
                                  double errorRate, double avgLatencyMs, long p95LatencyMs,
                                  List<MinuteBucket> requestsPerMinute,
                                  List<EndpointSnapshot> endpoints,
                                  List<RequestSample> recentRequests) {}

    private static final class EndpointStats {
        private final String method;
        private final String path;
        private long requests;
        private long errors;
        private long totalMs;
        private long maxMs;
        private Instant lastAt;

        EndpointStats(String method, String path) {
            this.method = method;
            this.path = path;
        }

        synchronized void add(int status, long durationMs, Instant at) {
            requests++;
            if (status >= 400) {
                errors++;
            }
            totalMs += durationMs;
            maxMs = Math.max(maxMs, durationMs);
            lastAt = at;
        }

        synchronized EndpointSnapshot snapshot() {
            return new EndpointSnapshot(method, path, requests, errors,
                    requests == 0 ? 0 : (double) totalMs / requests, maxMs, lastAt);
        }
    }
}
