package com.farmer.tracking.common.telemetry;

import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.lang.management.GarbageCollectorMXBean;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;
import java.lang.management.RuntimeMXBean;
import java.lang.management.ThreadMXBean;
import java.sql.Connection;
import java.sql.Statement;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;

/**
 * Runtime and database health figures for the admin telemetry page.
 * No connection strings, credentials or environment variables are exposed.
 */
@Service
public class SystemInfoService {

    private static final Logger log = LoggerFactory.getLogger(SystemInfoService.class);

    private final DataSource dataSource;
    private final Environment environment;

    public SystemInfoService(DataSource dataSource, Environment environment) {
        this.dataSource = dataSource;
        this.environment = environment;
    }

    public SystemSnapshot snapshot() {
        RuntimeMXBean runtime = ManagementFactory.getRuntimeMXBean();
        MemoryMXBean memory = ManagementFactory.getMemoryMXBean();
        ThreadMXBean threads = ManagementFactory.getThreadMXBean();
        OperatingSystemMXBean os = ManagementFactory.getOperatingSystemMXBean();

        Double processCpu = null;
        if (os instanceof com.sun.management.OperatingSystemMXBean sunOs) {
            double load = sunOs.getProcessCpuLoad();
            processCpu = load >= 0 ? load : null;
        }
        double loadAvg = os.getSystemLoadAverage();

        long gcCount = 0;
        long gcTime = 0;
        for (GarbageCollectorMXBean gc : ManagementFactory.getGarbageCollectorMXBeans()) {
            gcCount += Math.max(0, gc.getCollectionCount());
            gcTime += Math.max(0, gc.getCollectionTime());
        }

        return new SystemSnapshot(
                Instant.ofEpochMilli(runtime.getStartTime()),
                runtime.getUptime() / 1000,
                environment.getProperty("spring.application.name", "application"),
                Arrays.asList(environment.getActiveProfiles()),
                System.getProperty("java.version"),
                System.getProperty("java.vendor"),
                os.getName() + " " + os.getArch(),
                os.getAvailableProcessors(),
                processCpu,
                loadAvg >= 0 ? loadAvg : null,
                memory.getHeapMemoryUsage().getUsed(),
                memory.getHeapMemoryUsage().getMax(),
                memory.getNonHeapMemoryUsage().getUsed(),
                threads.getThreadCount(),
                threads.getPeakThreadCount(),
                gcCount,
                gcTime,
                probeDatabase());
    }

    private DatabaseSnapshot probeDatabase() {
        long start = System.nanoTime();
        try (Connection connection = dataSource.getConnection(); Statement statement = connection.createStatement()) {
            statement.execute("SELECT 1");
            long latencyMs = (System.nanoTime() - start) / 1_000_000;
            String product = connection.getMetaData().getDatabaseProductName();
            String version = connection.getMetaData().getDatabaseProductVersion();

            Integer active = null, idle = null, total = null, waiting = null;
            try {
                if (dataSource.isWrapperFor(HikariDataSource.class)) {
                    HikariPoolMXBean pool = dataSource.unwrap(HikariDataSource.class).getHikariPoolMXBean();
                    if (pool != null) {
                        active = pool.getActiveConnections();
                        idle = pool.getIdleConnections();
                        total = pool.getTotalConnections();
                        waiting = pool.getThreadsAwaitingConnection();
                    }
                }
            } catch (Exception ignored) {
                // pool statistics are optional
            }
            return new DatabaseSnapshot(true, latencyMs, product, version, active, idle, total, waiting, null);
        } catch (Exception ex) {
            log.warn("Database probe failed: {}", ex.getMessage());
            return new DatabaseSnapshot(false, (System.nanoTime() - start) / 1_000_000, null, null, null, null, null, null,
                    "Database is not reachable.");
        }
    }

    public record SystemSnapshot(Instant startedAt, long uptimeSeconds, String applicationName, List<String> profiles,
                                 String javaVersion, String javaVendor, String operatingSystem, int processors,
                                 Double processCpuLoad, Double systemLoadAverage,
                                 long heapUsedBytes, long heapMaxBytes, long nonHeapUsedBytes,
                                 int threadCount, int peakThreadCount, long gcCollections, long gcTimeMs,
                                 DatabaseSnapshot database) {}

    public record DatabaseSnapshot(boolean up, long latencyMs, String product, String version,
                                   Integer poolActive, Integer poolIdle, Integer poolTotal, Integer poolWaiting,
                                   String error) {}
}
