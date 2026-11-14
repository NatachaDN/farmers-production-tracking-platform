package com.farmer.tracking.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.farmer.tracking.common.audit.AuditEvent;
import com.farmer.tracking.common.audit.AuditEventType;
import com.farmer.tracking.modules.auth.model.Farmer.AccessStatus;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.crop.entity.CycleInputUsage;
import com.farmer.tracking.modules.crop.repository.CycleInputUsageRepository;
import com.farmer.tracking.modules.crop.repository.CycleRepository;
import com.farmer.tracking.modules.input.entity.FarmInput;
import com.farmer.tracking.modules.input.entity.InputType;
import com.farmer.tracking.modules.input.repository.FarmInputRepository;
import org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy;
import org.hibernate.cfg.Configuration;
import org.hibernate.cfg.JdbcSettings;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import javax.sql.DataSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

/** Real HTTP requests, security filters, services, transactions and row locks; no mocked repositories. */
@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.datasource.url=jdbc:h2:mem:integrity;DB_CLOSE_DELAY=-1;LOCK_TIMEOUT=10000",
        "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect", "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.mail.host=localhost", "spring.mail.username=", "app.admin.bootstrap-email=", "app.admin.bootstrap-password=",
        "spring.config.import=optional:classpath:/no-test-env.properties", "spring.dotenv.enabled=false",
        "APP_CORS_ALLOWED_ORIGINS=https://acrea.example.test"
})
class IntegritySecurityIntegrationTest {
    @DynamicPropertySource
    static void optionalLocalMysql(DynamicPropertyRegistry properties) {
        String url = System.getenv("ACREA_TEST_MYSQL_URL");
        if (url == null || url.isBlank()) return;
        // This suite creates/drops tables. Never accept a production/shared database target.
        if (!url.matches("jdbc:mysql://(?:127\\.0\\.0\\.1|localhost):[0-9]+/acrea_test_[A-Za-z0-9_]+(?:\\?[^#]*)?")) {
            throw new IllegalArgumentException("MySQL tests require a loopback database named acrea_test_*.");
        }
        String username = Objects.requireNonNull(System.getenv("ACREA_TEST_MYSQL_USER"), "ACREA_TEST_MYSQL_USER is required");
        String password = Objects.requireNonNull(System.getenv("ACREA_TEST_MYSQL_PASSWORD"), "ACREA_TEST_MYSQL_PASSWORD is required");
        properties.add("spring.datasource.url", () -> url);
        properties.add("spring.datasource.username", () -> username);
        properties.add("spring.datasource.password", () -> password);
        properties.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
        properties.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.MySQLDialect");
        properties.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.dialect.MySQLDialect");
    }
    @Autowired TestRestTemplate http;
    @Autowired FarmInputRepository inputs;
    @Autowired CycleRepository cycles;
    @Autowired CycleInputUsageRepository usages;
    @Autowired FarmerRepository farmers;
    @Autowired PasswordEncoder encoder;
    @Autowired DataSource dataSource;
    @Autowired JdbcTemplate jdbc;
    @Autowired com.farmer.tracking.modules.auth.service.AuthServiceImpl auth;

    record Fixture(String email, String token, long farmer, long farm, long plot, long cycle) {
        String root() { return "/api/v1/farmers/" + farmer; }
        String cyclePath() { return root() + "/cycles/" + cycle; }
    }

    private ResponseEntity<JsonNode> request(HttpMethod method, String path, Object body, String token) {
        HttpHeaders headers = new HttpHeaders(); headers.setContentType(MediaType.APPLICATION_JSON);
        if (token != null) headers.setBearerAuth(token);
        return http.exchange(path, method, new HttpEntity<>(body, headers), JsonNode.class);
    }

    private JsonNode created(String path, Object body, String token) {
        var response = request(HttpMethod.POST, path, body, token);
        assertThat(response.getStatusCode()).as(response.toString()).isEqualTo(HttpStatus.CREATED);
        return response.getBody();
    }

    private Map<String, Object> farmBody(double size) {
        return Map.of("name", "Regression Farm", "type", "CROP", "size", size, "sizeUnit", "HECTARES",
                "status", "ACTIVE", "country", "Cameroon", "region", "West", "district", "Test");
    }

    private Map<String, Object> plotBody(long farm, double area) {
        return Map.of("name", "Regression Plot", "area", area, "location", "Test", "farmId", farm);
    }

    @Test
    void uploadedFarmMapPersistsAndRequiresOwnership() {
        var owner = fixture();
        var stranger = fixture();
        byte[] png = Base64.getDecoder().decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lZkAAAAASUVORK5CYII=");
        var parts = new org.springframework.util.LinkedMultiValueMap<String, Object>();
        HttpHeaders json = new HttpHeaders();
        json.setContentType(MediaType.APPLICATION_JSON);
        parts.add("farm", new HttpEntity<>(farmBody(4), json));
        parts.add("map", new org.springframework.core.io.ByteArrayResource(png) {
            @Override public String getFilename() { return "farm.png"; }
        });
        HttpHeaders upload = new HttpHeaders();
        upload.setContentType(MediaType.MULTIPART_FORM_DATA);
        upload.setBearerAuth(owner.token());
        var createdMap = http.exchange("/api/v1/farms/with-map", HttpMethod.POST, new HttpEntity<>(parts, upload), JsonNode.class);
        assertThat(createdMap.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        long id = createdMap.getBody().path("id").asLong();
        String map = "/farms/" + id + "/map";
        assertThat(request(HttpMethod.GET, "/api/v1/farms/" + id, null, owner.token()).getBody().path("mapImageUrl").asText())
                .isEqualTo(map);
        HttpHeaders access = new HttpHeaders();
        access.setBearerAuth(owner.token());
        var stored = http.exchange("/api/v1" + map, HttpMethod.GET, new HttpEntity<>(access), byte[].class);
        assertThat(stored.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(stored.getHeaders().getContentType()).isEqualTo(MediaType.IMAGE_PNG);
        assertThat(stored.getBody()).isEqualTo(png);
        assertThat(request(HttpMethod.GET, "/api/v1" + map, null, stranger.token()).getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void configuredFrontendCanPreflightAuthenticatedApiRequests() throws Exception {
        // The default TestRestTemplate transport silently drops CORS request headers.
        var client = HttpClient.newHttpClient();
        var preflight = HttpRequest.newBuilder(URI.create(http.getRootUri() + "/api/v1/farmers/1/cycles/1/harvest"))
                .method("OPTIONS", HttpRequest.BodyPublishers.noBody())
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "DELETE")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, HttpHeaders.AUTHORIZATION);
        var allowed = client.send(preflight.setHeader(HttpHeaders.ORIGIN, "https://acrea.example.test").build(),
                HttpResponse.BodyHandlers.discarding());
        assertThat(allowed.statusCode()).isEqualTo(200);
        assertThat(allowed.headers().firstValue(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN)).contains("https://acrea.example.test");
        assertThat(allowed.headers().firstValue(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS).orElse("")).contains("DELETE");

        var denied = client.send(preflight.setHeader(HttpHeaders.ORIGIN, "https://other.example.test").build(),
                HttpResponse.BodyHandlers.discarding());
        assertThat(denied.statusCode()).isEqualTo(403);
    }

    private Map<String, Object> cycleBody(long plot, double area) {
        return new HashMap<>(Map.of("plotId", plot, "cropName", "Maize", "acreage", area,
                "plantingDate", LocalDate.now().minusDays(30).toString(),
                "plannedHarvestDate", LocalDate.now().plusDays(30).toString(), "allowConflict", true));
    }

    private Fixture fixture() {
        String email = "regression-" + UUID.randomUUID() + "@example.test";
        JsonNode account = created("/api/v1/auth/register", Map.of("fullName", "Regression Farmer", "emailOrPhone", email,
                "password", "Regression2026!", "farmType", "CROP", "agreedToTerms", true), null);
        String token = account.path("token").asText(); long farmer = account.path("farmer").path("id").asLong();
        long farm = created("/api/v1/farms", farmBody(10), token).path("id").asLong();
        String root = "/api/v1/farmers/" + farmer;
        long plot = created(root + "/plots", plotBody(farm, 2), token).path("id").asLong();
        long cycle = created(root + "/cycles", cycleBody(plot, 1), token).path("id").asLong();
        return new Fixture(email, token, farmer, farm, plot, cycle);
    }

    private Map<String, Object> purchase(String name, double quantity, String unit, double price) {
        return Map.of("name", name, "type", "FERTILIZER", "quantity", quantity, "unit", unit,
                "purchaseDate", LocalDate.now().toString(), "purchasePrice", price);
    }

    @Test
    void adminApprovalCommitsWithAuditAfterUpgradingLegacyMysqlEnum() {
        assumeTrue(System.getenv("ACREA_TEST_MYSQL_URL") != null && !System.getenv("ACREA_TEST_MYSQL_URL").isBlank());
        var admin = fixture();
        var applicant = fixture();
        var administrator = farmers.findById(admin.farmer()).orElseThrow();
        administrator.setRole("ROLE_ADMIN");
        farmers.save(administrator);
        var pending = farmers.findById(applicant.farmer()).orElseThrow();
        pending.setAccessStatus(AccessStatus.PENDING);
        farmers.save(pending);

        jdbc.execute("ALTER TABLE audit_events MODIFY event_type ENUM("
                + "'REGISTER','LOGIN','LOGIN_FAILED','GOOGLE_REGISTER','GOOGLE_LOGIN','GOOGLE_LOGIN_FAILED',"
                + "'PASSWORD_RESET_REQUESTED','PASSWORD_RESET_COMPLETED','PASSWORD_RESET','FARMER_STATUS_UPDATED') NOT NULL");
        jdbc.update("INSERT INTO audit_events (actor_id, event_type, detail, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
                admin.farmer(), "FARMER_STATUS_UPDATED", "Legacy access change");
        String path = "/api/v1/admin/farmers/" + applicant.farmer() + "/access";
        long pendingTokenVersion = pending.getTokenVersion();
        assertThat(request(HttpMethod.PUT, path, Map.of("status", "ACTIVE"), admin.token()).getStatusCode())
                .isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        var unchanged = farmers.findById(applicant.farmer()).orElseThrow();
        assertThat(unchanged.getAccessStatus()).isEqualTo(AccessStatus.PENDING);
        assertThat(unchanged.getTokenVersion()).isEqualTo(pendingTokenVersion);

        var schema = new Configuration()
                .addAnnotatedClass(AuditEvent.class)
                .setProperty("hibernate.hbm2ddl.auto", "update")
                .setProperty("hibernate.hbm2ddl.halt_on_error", "true")
                .setProperty("hibernate.dialect", "org.hibernate.dialect.MySQLDialect")
                .setPhysicalNamingStrategy(new CamelCaseToUnderscoresNamingStrategy());
        schema.getProperties().put(JdbcSettings.JAKARTA_NON_JTA_DATASOURCE, dataSource);
        try (var ignored = schema.buildSessionFactory()) {
            // Apply the production schema update against an existing audit table.
        }
        assertThat(jdbc.queryForObject("SELECT DATA_TYPE FROM information_schema.COLUMNS "
                        + "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'audit_events' AND COLUMN_NAME = 'event_type'",
                String.class)).isEqualTo("varchar");

        var approval = request(HttpMethod.PUT, path, Map.of("status", "ACTIVE"), admin.token());
        assertThat(approval.getStatusCode()).as(approval.toString()).isEqualTo(HttpStatus.OK);
        assertThat(farmers.findById(applicant.farmer()).orElseThrow().getAccessStatus()).isEqualTo(AccessStatus.ACTIVE);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM audit_events WHERE event_type = ? AND actor_id = ?",
                Integer.class, AuditEventType.ACCOUNT_ACCESS_CHANGED.name(), admin.farmer())).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM audit_events WHERE event_type = 'REGISTER' AND actor_id = ?",
                Integer.class, applicant.farmer())).isEqualTo(1);
        var audit = request(HttpMethod.GET, "/api/v1/admin/audit", null, admin.token());
        assertThat(audit.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(audit.getBody()).anySatisfy(event -> {
            assertThat(event.path("type").asText()).isEqualTo("FARMER_STATUS_UPDATED");
            assertThat(event.path("detail").asText()).isEqualTo("Legacy access change");
        });
        assertThat(request(HttpMethod.POST, "/api/v1/auth/login",
                Map.of("emailOrPhone", applicant.email(), "password", "Regression2026!"), null)
                .getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void managerCanReviewAssignedRegistrationsAndDisabledAccountsLoseAccess() {
        var manager = fixture();
        var administrator = fixture();
        var outsider = fixture();
        var managerAccount = farmers.findById(manager.farmer()).orElseThrow();
        managerAccount.setRole("ROLE_MANAGER");
        farmers.save(managerAccount);
        var adminAccount = farmers.findById(administrator.farmer()).orElseThrow();
        adminAccount.setRole("ROLE_ADMIN");
        farmers.save(adminAccount);
        String email = "pending-" + UUID.randomUUID() + "@example.test";
        var credentials = Map.of("emailOrPhone", email, "password", "Regression2026!");
        JsonNode signup;
        Object service = org.springframework.test.util.AopTestUtils.getUltimateTargetObject(auth);
        org.springframework.test.util.ReflectionTestUtils.setField(service, "reviewRequired", true);
        try {
            signup = created("/api/v1/auth/register", Map.of("fullName", "Pending Farmer", "emailOrPhone", email,
                    "password", "Regression2026!", "farmType", "CROP", "agreedToTerms", true), null);
        } finally {
            org.springframework.test.util.ReflectionTestUtils.setField(service, "reviewRequired", false);
        }
        assertThat(signup.path("token").isNull()).isTrue();
        Long id = signup.path("farmer").path("id").asLong();
        var resource = "/api/v1/admin/farmers/" + id;
        var managerResource = "/api/v1/manager/farmers/" + id;
        assertThat(request(HttpMethod.GET, resource, null, manager.token()).getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(request(HttpMethod.GET, "/api/v1/manager/overview", null, outsider.token()).getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(request(HttpMethod.POST, "/api/v1/auth/login", credentials, null).getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(request(HttpMethod.GET, managerResource, null, manager.token()).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(request(HttpMethod.PUT, resource + "/access", Map.of("status", "PENDING", "role", "ROLE_FARMER",
                "managerId", manager.farmer()), administrator.token()).getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(request(HttpMethod.GET, managerResource, null, manager.token()).getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(request(HttpMethod.GET, "/api/v1/manager/farmers/" + outsider.farmer(), null, manager.token()).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(request(HttpMethod.GET, "/api/v1/admin/audit", null, manager.token()).getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(request(HttpMethod.PUT, managerResource + "/access", Map.of("status", "ACTIVE", "role", "ROLE_MANAGER"), manager.token()).getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(request(HttpMethod.PUT, managerResource + "/access", Map.of("status", "REJECTED"), manager.token()).getStatusCode()).isEqualTo(HttpStatus.OK);
        var denied = request(HttpMethod.POST, "/api/v1/auth/login", credentials, null);
        assertThat(denied.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(denied.getBody().path("message").asText()).contains("declined");
        assertThat(request(HttpMethod.PUT, resource + "/access", Map.of("status", "ACTIVE"), administrator.token()).getStatusCode()).isEqualTo(HttpStatus.OK);
        var login = request(HttpMethod.POST, "/api/v1/auth/login", credentials, null);
        assertThat(login.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(request(HttpMethod.PUT, resource + "/access", Map.of("status", "DISABLED"), administrator.token()).getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(request(HttpMethod.GET, "/api/v1/auth/me", null, login.getBody().path("token").asText()).getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(request(HttpMethod.POST, "/api/v1/auth/login", credentials, null).getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void cropCatalogUpdatesFarmerChoicesAndRestrictsWrites() {
        var farmer = fixture();
        var admin = fixture();
        var account = farmers.findById(admin.farmer()).orElseThrow();
        account.setRole("ROLE_ADMIN");
        farmers.save(account);
        var path = "/api/v1/admin/reference-crops";
        var entry = Map.of("name", "Fonio", "enabled", true);
        assertThat(request(HttpMethod.POST, path, entry, farmer.token()).getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        long id = created(path, entry, admin.token()).path("id").asLong();
        assertThat(request(HttpMethod.POST, path, Map.of("name", "fonio", "enabled", true), admin.token()).getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(request(HttpMethod.GET, "/api/v1/reference-crops", null, farmer.token()).getBody().get(0).path("name").asText()).isEqualTo("Fonio");
        assertThat(request(HttpMethod.PUT, path + "/" + id, Map.of("name", "White fonio", "enabled", false), admin.token()).getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(request(HttpMethod.GET, "/api/v1/reference-crops", null, farmer.token()).getBody().isEmpty()).isTrue();
    }

    @Test
    void financeLedgerUsesHarvestSalesLinkedExpensesAndVerifiedInputCosts() {
        var farmer = fixture();
        var today = LocalDate.now().toString();
        var ledger = farmer.root() + "/finances";
        var sale = Map.of("kind", "SALE", "category", "Maize sale", "cycleId", farmer.cycle(), "date", today, "amount", 900);
        assertThat(request(HttpMethod.POST, ledger, sale, farmer.token()).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        long input = created(farmer.root() + "/inputs", purchase("Fertilizer", 10, "kg", 100), farmer.token()).path("id").asLong();
        created(farmer.cyclePath() + "/inputs", Map.of("inputId", input, "quantityUsed", 3, "usageDate", today), farmer.token());
        created(ledger, Map.of("kind", "EXPENSE", "category", "Transport", "cycleId", farmer.cycle(), "date", today, "amount", 50), farmer.token());
        created(farmer.cyclePath() + "/harvest", Map.of("quantity", 20, "unit", "KG", "harvestDate", today), farmer.token());
        created(ledger, sale, farmer.token());
        var margin = request(HttpMethod.GET, ledger, null, farmer.token()).getBody().path("margins").get(0);
        assertThat(margin.path("inputCosts").asDouble()).isEqualTo(30);
        assertThat(margin.path("margin").asDouble()).isEqualTo(820);
    }

    @Test
    void agendaAndRemindersUseScheduledDateAndCompletion() {
        var farmer = fixture();
        var today = LocalDate.now();
        var tasks = farmer.root() + "/tasks";
        var due = created(tasks, Map.of("title", "Inspect maize", "date", today.toString()), farmer.token());
        created(tasks, Map.of("title", "Later task", "date", today.plusDays(2).toString()), farmer.token());
        var month = java.time.YearMonth.from(today);
        var agenda = request(HttpMethod.GET, tasks + "?month=" + month, null, farmer.token()).getBody();
        assertThat(agenda.get(0).path("title").asText()).isEqualTo("Inspect maize");
        var reminders = tasks + "/reminders";
        var initial = request(HttpMethod.GET, reminders, null, farmer.token()).getBody().path("tasks");
        assertThat(initial.size()).isEqualTo(1);
        assertThat(initial.get(0).path("id").asLong()).isEqualTo(due.path("id").asLong());
        var completion = request(HttpMethod.PUT, tasks + "/" + due.path("id").asLong() + "/complete", Map.of(), farmer.token());
        assertThat(completion.getBody().path("completed").asBoolean()).isTrue();
        assertThat(request(HttpMethod.GET, reminders, null, farmer.token()).getBody().path("tasks").isEmpty()).isTrue();
    }

    @Test
    void equipmentStatusIsSavedAndListingIsFarmerScoped() {
        var farmer = fixture();
        var other = fixture();
        var path = farmer.root() + "/equipment";
        long id = created(path, Map.of("name", "Water pump", "status", "AVAILABLE"), farmer.token()).path("id").asLong();
        var change = request(HttpMethod.PUT, path + "/" + id + "/status", Map.of("status", "MAINTENANCE"), farmer.token());
        assertThat(change.getStatusCode()).isEqualTo(HttpStatus.OK);
        var list = request(HttpMethod.GET, path, null, farmer.token()).getBody();
        assertThat(list.get(0).path("status").asText()).isEqualTo("MAINTENANCE");
        assertThat(request(HttpMethod.GET, path, null, other.token()).getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(request(HttpMethod.GET, other.root() + "/equipment", null, other.token()).getBody().isEmpty()).isTrue();
    }

    @Test
    void inputThresholdCanBeSetAndClearedWithoutChangingStock() {
        var farmer = fixture();
        long input = created(farmer.root() + "/inputs", purchase("Seed stock", 10, "kg", 100), farmer.token())
                .path("id").asLong();
        var path = farmer.root() + "/inputs/" + input + "/low-stock-threshold";
        var saved = request(HttpMethod.PUT, path, Map.of("threshold", 15), farmer.token());
        assertThat(saved.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(saved.getBody().path("lowStockThreshold").asDouble()).isEqualTo(15);
        assertThat(saved.getBody().path("quantity").asDouble()).isEqualTo(10);
        assertThat(request(HttpMethod.PUT, path, Map.of("threshold", -1), farmer.token()).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        var clear = new HashMap<String, Object>();
        clear.put("threshold", null);
        assertThat(request(HttpMethod.PUT, path, clear, farmer.token()).getBody().path("lowStockThreshold").isNull()).isTrue();
    }

    @Test
    void livestockRecordsPersistInDateOrderAndProtectGroupHistory() {
        var farmer = fixture();
        var other = fixture();
        var today = LocalDate.now();
        var groupPath = "/api/v1/animals/groups";
        var livestock = new HashMap<>(farmBody(4));
        livestock.put("type", "LIVESTOCK");
        long livestockFarm = created("/api/v1/farms", livestock, farmer.token()).path("id").asLong();
        assertThat(request(HttpMethod.POST, farmer.root() + "/plots", plotBody(livestockFarm, 1), farmer.token()).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
        var groupDraft = Map.of("farmId", farmer.farm(), "name", "Flock", "animalType", "POULTRY",
                "purpose", "Eggs", "initialPopulation", 24, "startDate", today.toString());
        assertThat(request(HttpMethod.POST, groupPath, groupDraft, farmer.token()).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        long group = created(groupPath, Map.of("farmId", livestockFarm, "name", "Laying flock", "animalType", "POULTRY",
                "purpose", "Eggs", "initialPopulation", 24, "startDate", today.minusDays(3).toString()), farmer.token())
                .path("id").asLong();
        String groupUrl = groupPath + "/" + group;
        String recordsUrl = groupUrl + "/records";
        var feeding = Map.of("kind", "FEEDING", "name", "Grain", "quantity", 2.5, "unit", "kg", "date", today.toString());
        var output = Map.of("kind", "PRODUCTION", "name", "Eggs", "quantity", 10, "unit", "eggs",
                "date", today.minusDays(1).toString());
        created(recordsUrl, feeding, farmer.token());
        created(recordsUrl, output, farmer.token());
        var invalid = new HashMap<String, Object>(output);
        invalid.put("quantity", 0);
        assertThat(request(HttpMethod.POST, recordsUrl, invalid, farmer.token()).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(request(HttpMethod.GET, recordsUrl, null, other.token()).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(request(HttpMethod.POST, recordsUrl, feeding, other.token()).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        var rows = request(HttpMethod.GET, recordsUrl, null, farmer.token()).getBody();
        assertThat(rows.size()).isEqualTo(2);
        assertThat(rows.get(0).path("kind").asText()).isEqualTo("FEEDING");
        assertThat(rows.get(1).path("kind").asText()).isEqualTo("PRODUCTION");
        var recentUrl = "/api/v1/animals/recent-production";
        var recent = request(HttpMethod.GET, recentUrl, null, farmer.token()).getBody();
        assertThat(request(HttpMethod.GET, recentUrl + "?farmId=" + livestockFarm, null, farmer.token()).getBody().size()).isEqualTo(1);
        String report = "/production-report?from=" + today.minusDays(3) + "&to=" + today;
        assertThat(request(HttpMethod.GET, "/api/v1/animals" + report, null, farmer.token()).getBody().size()).isEqualTo(1);
        assertThat(request(HttpMethod.GET, "/api/v1/animals" + report, null, other.token()).getBody().isEmpty()).isTrue();
        assertThat(recent.get(0).path("groupName").asText()).isEqualTo("Laying flock");
        assertThat(recent.get(0).path("record").path("name").asText()).isEqualTo("Eggs");
        assertThat(request(HttpMethod.GET, recentUrl, null, other.token()).getBody().isEmpty()).isTrue();
        var birth = Map.of("kind", "BIRTH", "name", "Birth", "quantity", 3, "unit", "animals", "date", today.toString());
        assertThat(created(recordsUrl, birth, farmer.token()).path("currentPopulation").asInt()).isEqualTo(27);
        var removal = new HashMap<String, Object>(birth);
        removal.put("kind", "REMOVAL");
        removal.put("quantity", 28);
        assertThat(request(HttpMethod.POST, recordsUrl, removal, farmer.token()).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        removal.put("quantity", 2);
        assertThat(created(recordsUrl, removal, farmer.token()).path("currentPopulation").asInt()).isEqualTo(25);
        assertThat(request(HttpMethod.GET, groupUrl, null, farmer.token()).getBody().path("currentPopulation").asInt()).isEqualTo(25);
        assertThat(request(HttpMethod.DELETE, groupUrl, null, farmer.token()).getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void productionReportIncludesPeriodBoundariesAndIsFarmerScoped() {
        var farmer = fixture();
        var other = fixture();
        var today = LocalDate.now();
        var yesterday = today.minusDays(1);
        created(farmer.cyclePath() + "/activities", Map.of("activityType", "WATERING",
                "activityDate", yesterday.toString(), "notes", "Within the report period"), farmer.token());
        created(other.cyclePath() + "/activities", Map.of("activityType", "WATERING",
                "activityDate", yesterday.toString(), "notes", "Private to another farmer"), other.token());
        created(farmer.cyclePath() + "/harvest", Map.of("quantity", 12, "unit", "BAGS",
                "harvestDate", today.toString()), farmer.token());

        var endpoint = farmer.root() + "/summary/production-report";
        var range = "?from=" + yesterday + "&to=" + today;
        var response = request(HttpMethod.GET, endpoint + range, null, farmer.token());
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        var body = response.getBody();
        assertThat(body.path("activities").size()).isEqualTo(1);
        assertThat(body.path("activities").get(0).path("date").asText()).isEqualTo(yesterday.toString());
        assertThat(body.path("harvests").size()).isEqualTo(1);
        assertThat(body.path("harvests").get(0).path("unit").asText()).isEqualTo("BAGS");
        assertThat(body.path("harvests").get(0).path("plotId").asLong()).isEqualTo(farmer.plot());
        assertThat(body.path("harvests").get(0).path("crop").asText()).isEqualTo("Maize");
        assertThat(body.path("cycles").size()).isEqualTo(1);
        assertThat(request(HttpMethod.GET, endpoint + range, null, other.token()).getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        var empty = request(HttpMethod.GET, endpoint + "?from=" + today.minusYears(1) + "&to=" + today.minusYears(1), null, farmer.token());
        assertThat(empty.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(empty.getBody().path("cycles").isEmpty()).isTrue();
        assertThat(empty.getBody().path("activities").isEmpty()).isTrue();
        assertThat(empty.getBody().path("harvests").isEmpty()).isTrue();
        assertThat(request(HttpMethod.GET, endpoint + "?from=" + today + "&to=" + yesterday, null, farmer.token())
                .getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    private ResponseEntity<JsonNode> consume(Fixture f, long cycle, long input, double quantity) {
        return request(HttpMethod.POST, f.root() + "/cycles/" + cycle + "/inputs",
                Map.of("inputId", input, "quantityUsed", quantity, "usageDate", LocalDate.now().toString()), f.token());
    }

    private List<Integer> concurrent(Callable<Integer> a, Callable<Integer> b) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(2);
        CountDownLatch ready = new CountDownLatch(2), start = new CountDownLatch(1);
        try {
            List<Future<Integer>> futures = new ArrayList<>();
            for (Callable<Integer> work : List.of(a, b)) futures.add(pool.submit(() -> {
                ready.countDown(); if (!start.await(10, TimeUnit.SECONDS)) throw new TimeoutException(); return work.call();
            }));
            assertThat(ready.await(10, TimeUnit.SECONDS)).isTrue(); start.countDown();
            return List.of(futures.get(0).get(20, TimeUnit.SECONDS), futures.get(1).get(20, TimeUnit.SECONDS));
        } finally { pool.shutdownNow(); }
    }

    @Test void simultaneousConsumptionAcrossTwoCyclesCannotOverspendStock() throws Exception {
        Fixture f = fixture();
        long other = created(f.root() + "/cycles", cycleBody(f.plot(), 1), f.token()).path("id").asLong();
        long input = created(f.root() + "/inputs", purchase("NPK", 10, "kg", 10000), f.token()).path("id").asLong();
        assertThat(concurrent(() -> consume(f, f.cycle(), input, 7).getStatusCode().value(),
                () -> consume(f, other, input, 7).getStatusCode().value())).containsExactlyInAnyOrder(201, 400);
        assertThat(inputs.findById(input).orElseThrow().getQuantity()).isEqualTo(3);
        assertThat(usages.findByFarmerIdOrderByUsageDateDesc(f.farmer())).hasSize(1);
    }

    @Test void simultaneousFirstPurchasesCreateOneInventoryItem() throws Exception {
        Fixture f = fixture();
        Callable<Integer> restock = () -> request(HttpMethod.POST, f.root() + "/inputs", purchase("NPK", 10, "kg", 10000), f.token()).getStatusCode().value();
        assertThat(concurrent(restock, restock)).containsExactly(201, 201);
        var stock = inputs.findByFarmerId(f.farmer()); assertThat(stock).hasSize(1);
        assertThat(stock.get(0).getQuantity()).isEqualTo(20);
        assertThat(stock.get(0).getCumulativeCost()).isEqualTo(20000);
    }

    @Test void simultaneousUndoCannotRestoreTheSameUsageTwice() throws Exception {
        Fixture f = fixture();
        long input = created(f.root() + "/inputs", purchase("NPK", 10, "kg", 10000), f.token()).path("id").asLong();
        long usage = consume(f, f.cycle(), input, 7).getBody().path("id").asLong();
        Callable<Integer> undo = () -> request(HttpMethod.DELETE, f.cyclePath() + "/inputs/" + usage, null, f.token()).getStatusCode().value();
        assertThat(concurrent(undo, undo)).containsExactlyInAnyOrder(204, 404);
        assertThat(inputs.findById(input).orElseThrow().getQuantity()).isEqualTo(10);
    }

    @Test void legacyStockAndHistoricalCostsMustBeConfirmedIndependently() {
        Fixture f = fixture();
        FarmInput input = new FarmInput(f.farmer(), "Old NPK", InputType.FERTILIZER, 40.0, "kg", LocalDate.now().minusDays(20), 25000.0, 25000.0);
        input.setUnitCost(null); input = inputs.saveAndFlush(input);
        CycleInputUsage old = new CycleInputUsage(f.farmer(), cycles.findById(f.cycle()).orElseThrow(), input,
                input.getName(), input.getType(), 10.0, "kg", 25000.0, 250000.0, LocalDate.now(), null);
        old.setCostBasisVersion(null); old = usages.saveAndFlush(old);
        var stock = request(HttpMethod.GET, f.root() + "/inputs/" + input.getId(), null, f.token()).getBody();
        assertThat(stock.path("unitCost").isNull()).isTrue(); assertThat(stock.path("valuationRequired").asBoolean()).isTrue();
        assertThat(consume(f, f.cycle(), input.getId(), 10).getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(request(HttpMethod.PUT, f.root() + "/inputs/" + input.getId() + "/unit-cost", Map.of("unitCost", 500), f.token()).getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(consume(f, f.cycle(), input.getId(), 10).getBody().path("totalCost").asDouble()).isEqualTo(5000);
        assertThat(request(HttpMethod.GET, f.cyclePath() + "/inputs/summary", null, f.token()).getBody().path("totalInputCost").isNull()).isTrue();
        assertThat(request(HttpMethod.DELETE, f.cyclePath() + "/inputs/" + old.getId(), null, f.token()).getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(request(HttpMethod.PUT, f.cyclePath() + "/inputs/" + old.getId() + "/unit-cost", Map.of("unitCost", 500), f.token()).getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(request(HttpMethod.GET, f.cyclePath() + "/inputs/summary", null, f.token()).getBody().path("totalInputCost").asDouble()).isEqualTo(10000);
        assertThat(request(HttpMethod.DELETE, f.cyclePath() + "/inputs/" + old.getId(), null, f.token()).getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(inputs.findById(input.getId()).orElseThrow().getQuantity()).isEqualTo(40);
    }

    @Test void restockingCannotMixUnitsOrTypes() {
        Fixture f = fixture();
        long input = created(f.root() + "/inputs", purchase("NPK", 50, "kg", 25000), f.token()).path("id").asLong();
        assertThat(request(HttpMethod.POST, f.root() + "/inputs", purchase("NPK", 5, "bags", 10000), f.token()).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(inputs.findById(input).orElseThrow().getQuantity()).isEqualTo(50);
        var wrongType = new HashMap<>(purchase("NPK", 5, "kg", 10000)); wrongType.put("type", "SEEDS");
        assertThat(request(HttpMethod.POST, f.root() + "/inputs", wrongType, f.token()).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test void resetRevokesOldTokensAndNewLoginWorks() {
        Fixture f = fixture(); var farmer = farmers.findById(f.farmer()).orElseThrow();
        farmer.setPasswordResetToken(encoder.encode("123456")); farmer.setPasswordResetExpiresAt(LocalDateTime.now().plusMinutes(10)); farmers.saveAndFlush(farmer);
        var reset = Map.of("emailOrPhone", f.email(), "resetCode", "123456", "newPassword", "ChangedRegression2026!", "confirmPassword", "ChangedRegression2026!");
        assertThat(request(HttpMethod.POST, "/api/v1/auth/reset-password", reset, null).getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(request(HttpMethod.GET, "/api/v1/auth/me", null, f.token()).getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        var login = request(HttpMethod.POST, "/api/v1/auth/login", Map.of("emailOrPhone", f.email(), "password", "ChangedRegression2026!"), null);
        assertThat(login.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(request(HttpMethod.GET, "/api/v1/auth/me", null, login.getBody().path("token").asText()).getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test void invalidAreasDatesAndParentAssignmentsAreRejectedWithoutChangingRecords() {
        Fixture f = fixture();
        for (double area : new double[]{-3, 0, 1000}) assertThat(request(HttpMethod.POST, f.root() + "/cycles", cycleBody(f.plot(), area), f.token()).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        var reversed = cycleBody(f.plot(), 1); reversed.put("plannedHarvestDate", LocalDate.now().minusDays(40).toString());
        assertThat(request(HttpMethod.POST, f.root() + "/cycles", reversed, f.token()).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(request(HttpMethod.POST, f.root() + "/plots", plotBody(f.farm(), 9), f.token()).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(request(HttpMethod.PUT, "/api/v1/farms/" + f.farm(), farmBody(1), f.token()).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(request(HttpMethod.PUT, f.root() + "/plots/" + f.plot(), plotBody(999999, 2), f.token()).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(request(HttpMethod.GET, f.root() + "/plots/" + f.plot(), null, f.token()).getBody().path("farmId").asLong()).isEqualTo(f.farm());
        assertThat(request(HttpMethod.POST, f.root() + "/plots", Map.of("name", "bad", "area", "abc", "location", "test"), f.token()).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        String before = LocalDate.now().minusDays(40).toString();
        assertThat(request(HttpMethod.POST, f.cyclePath() + "/activities", Map.of("activityType", "WATERING", "activityDate", before), f.token()).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(request(HttpMethod.POST, f.cyclePath() + "/incidents", Map.of("incidentType", "PEST", "incidentDate", before, "description", "bad date"), f.token()).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(request(HttpMethod.POST, f.cyclePath() + "/harvest", Map.of("quantity", 800, "unit", "KG", "harvestDate", before), f.token()).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test void recordedHistoryPreventsCycleDeletionAndHarvestCompletesProgress() {
        Fixture f = fixture();
        created(f.cyclePath() + "/activities", Map.of("activityType", "WATERING", "activityDate", LocalDate.now().toString()), f.token());
        assertThat(request(HttpMethod.DELETE, f.cyclePath(), null, f.token()).getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        created(f.cyclePath() + "/harvest", Map.of("quantity", 800, "unit", "KG", "harvestDate", LocalDate.now().toString()), f.token());
        var cycle = request(HttpMethod.GET, f.cyclePath(), null, f.token()).getBody();
        assertThat(cycle.path("status").asText()).isEqualTo("COMPLETED"); assertThat(cycle.path("progress").asInt()).isEqualTo(100);
        assertThat(cycle.path("plannedHarvestDate").asText()).isEqualTo(LocalDate.now().plusDays(30).toString());
    }

    @Test void registrationRejectsInvalidIdentifiersAndNumericOnlyPasswords() {
        for (var body : List.of(Map.of("fullName", "Test Farmer", "emailOrPhone", "not-an-email", "password", "Regression2026!"),
                Map.of("fullName", "Test Farmer", "emailOrPhone", "weak-" + UUID.randomUUID() + "@example.test", "password", "12345678"))) {
            assertThat(request(HttpMethod.POST, "/api/v1/auth/register", body, null).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        }
    }

    @Test void summaryMatchesSavedRecordsSeparatesUnitsAndScopesFarms() {
        Fixture f = fixture();
        long otherFarm = created("/api/v1/farms", farmBody(4), f.token()).path("id").asLong();
        long input = created(f.root() + "/inputs", purchase("NPK", 10, "kg", 10000), f.token()).path("id").asLong();
        assertThat(consume(f, f.cycle(), input, 2).getStatusCode()).isEqualTo(HttpStatus.CREATED);
        created(f.cyclePath() + "/activities", Map.of("activityType", "WATERING", "activityDate", LocalDate.now().toString()), f.token());
        created(f.cyclePath() + "/harvest", Map.of("quantity", 500, "unit", "KG", "harvestDate", LocalDate.now().toString()), f.token());
        long tons = created(f.root() + "/cycles", cycleBody(f.plot(), 1), f.token()).path("id").asLong();
        created(f.root() + "/cycles/" + tons + "/harvest", Map.of("quantity", 2, "unit", "TONS", "harvestDate", LocalDate.now().toString()), f.token());
        long bags = created(f.root() + "/cycles", cycleBody(f.plot(), 1), f.token()).path("id").asLong();
        created(f.root() + "/cycles/" + bags + "/harvest", Map.of("quantity", 7, "unit", "BAGS", "harvestDate", LocalDate.now().toString()), f.token());
        created(f.root() + "/cycles", cycleBody(f.plot(), 1), f.token());
        var summary = request(HttpMethod.GET, f.root() + "/summary", null, f.token()).getBody();
        assertThat(summary.path("farmCount").asInt()).isEqualTo(2);
        assertThat(summary.path("plotCount").asInt()).isEqualTo(1);
        assertThat(summary.path("plotAreaHa").asDouble()).isEqualTo(2);
        assertThat(summary.path("activeCycles").asInt()).isEqualTo(1);
        assertThat(summary.path("harvestedKg").asDouble()).isEqualTo(2500);
        assertThat(summary.path("harvestedBags").asDouble()).isEqualTo(7);
        assertThat(summary.path("totalInputCost").asDouble()).isEqualTo(2000);
        assertThat(summary.path("monthlyHarvests").get(11).path("kg").asDouble()).isEqualTo(2500);
        assertThat(summary.path("recentActivities").size()).isEqualTo(1);
        assertThat(summary.path("upcomingHarvests").size()).isEqualTo(1);
        var emptyFarm = request(HttpMethod.GET, f.root() + "/summary?farmId=" + otherFarm, null, f.token()).getBody();
        assertThat(emptyFarm.path("harvestCount").asInt()).isZero();
        assertThat(emptyFarm.path("plotCount").asInt()).isZero();
        assertThat(emptyFarm.path("totalInputCost").asDouble()).isZero();
        Fixture stranger = fixture();
        assertThat(request(HttpMethod.GET, f.root() + "/summary", null, stranger.token()).getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(request(HttpMethod.GET, f.root() + "/summary?farmId=" + stranger.farm(), null, f.token()).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(request(HttpMethod.GET, f.root() + "/summary", null, null).getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test void completedCycleActivitiesCanBeCorrectedWithoutReopeningTheCycle() {
        Fixture f = fixture();
        long activity = created(f.cyclePath() + "/activities", Map.of("activityType", "WATERING", "activityDate", LocalDate.now().toString(), "notes", "Original activity"), f.token()).path("id").asLong();
        created(f.cyclePath() + "/harvest", Map.of("quantity", 800, "unit", "KG", "harvestDate", LocalDate.now().toString()), f.token());
        var updated = request(HttpMethod.PUT, f.cyclePath() + "/activities/" + activity,
                Map.of("activityType", "WEEDING", "activityDate", LocalDate.now().toString(), "notes", "Corrected completed-cycle activity"), f.token());
        assertThat(updated.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(updated.getBody().path("notes").asText()).isEqualTo("Corrected completed-cycle activity");
        assertThat(request(HttpMethod.GET, f.cyclePath(), null, f.token()).getBody().path("status").asText()).isEqualTo("COMPLETED");
        assertThat(request(HttpMethod.GET, f.root() + "/summary", null, f.token()).getBody().path("recentActivities").get(0).path("type").asText()).isEqualTo("WEEDING");
    }

    private Map<String, Object> correction(double quantity, long revision, String reason) {
        return Map.of("quantity", quantity, "unit", "KG", "harvestDate", LocalDate.now().toString(),
                "notes", "Updated harvest notes", "expectedRevision", revision, "reason", reason);
    }

    @Test void harvestCorrectionsPreserveHistoryValidateOwnershipAndUpdateSummaries() {
        Fixture f = fixture();
        var original = created(f.cyclePath() + "/harvest", Map.of("quantity", 800, "unit", "KG", "harvestDate", LocalDate.now().toString(), "notes", "Original notes"), f.token());
        assertThat(request(HttpMethod.PUT, f.cyclePath() + "/harvest", correction(900, 0, " "), f.token()).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(request(HttpMethod.PUT, f.cyclePath() + "/harvest", correction(0, 0, "Invalid quantity"), f.token()).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        var badDate = new HashMap<>(correction(900, 0, "Invalid date")); badDate.put("harvestDate", LocalDate.now().minusDays(40).toString());
        assertThat(request(HttpMethod.PUT, f.cyclePath() + "/harvest", badDate, f.token()).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        Fixture other = fixture();
        assertThat(request(HttpMethod.PUT, f.cyclePath() + "/harvest", correction(900, 0, "Not the owner"), other.token()).getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(request(HttpMethod.GET, f.cyclePath() + "/harvest/corrections", null, other.token()).getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        String reason = "Verified weighbridge slip: " + "a".repeat(400);
        var update = request(HttpMethod.PUT, f.cyclePath() + "/harvest", correction(900, 0, reason), f.token());
        assertThat(update.getStatusCode()).as(update.toString()).isEqualTo(HttpStatus.OK);
        assertThat(update.getBody().path("id")).isEqualTo(original.path("id"));
        assertThat(update.getBody().path("revision").asLong()).isEqualTo(1);
        assertThat(update.getBody().path("calculatedYield").asDouble()).isEqualTo(900);
        assertThat(request(HttpMethod.PUT, f.cyclePath() + "/harvest", correction(1000, 0, "Stale edit"), f.token()).getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        var history = request(HttpMethod.GET, f.cyclePath() + "/harvest/corrections", null, f.token()).getBody();
        assertThat(history.size()).isEqualTo(1);
        assertThat(history.get(0).path("beforeValues").path("quantity").asDouble()).isEqualTo(800);
        assertThat(history.get(0).path("beforeValues").path("notes").asText()).isEqualTo("Original notes");
        assertThat(history.get(0).path("afterValues").path("quantity").asDouble()).isEqualTo(900);
        assertThat(history.get(0).path("reason").asText()).isEqualTo(reason);
        assertThat(history.get(0).path("actorId").asLong()).isEqualTo(f.farmer());
        var cycle = request(HttpMethod.GET, f.cyclePath(), null, f.token()).getBody();
        assertThat(cycle.path("status").asText()).isEqualTo("COMPLETED");
        assertThat(cycle.path("plannedHarvestDate").asText()).isEqualTo(LocalDate.now().plusDays(30).toString());
        assertThat(request(HttpMethod.GET, f.root() + "/summary", null, f.token()).getBody().path("harvestedKg").asDouble()).isEqualTo(900);
        assertThat(request(HttpMethod.GET, f.root() + "/summary?farmId=" + f.farm(), null, f.token()).getBody().path("harvestedKg").asDouble()).isEqualTo(900);
        assertThat(request(HttpMethod.GET, f.cyclePath() + "/harvest", null, f.token()).getBody().path("quantity").asDouble()).isEqualTo(900);
    }

    @Test void harvestDeletionReopensCycleAndAllowsAReplacement() {
        Fixture f = fixture();
        var before = request(HttpMethod.GET, f.cyclePath(), null, f.token()).getBody();
        String path = f.cyclePath() + "/harvest";
        var harvest = Map.of("quantity", 800, "unit", "KG", "harvestDate", LocalDate.now().toString());
        created(path, harvest, f.token());
        assertThat(request(HttpMethod.PUT, path, correction(900, 0, "Verified weight"), f.token())
                .getStatusCode()).isEqualTo(HttpStatus.OK);

        assertThat(request(HttpMethod.DELETE, path, null, fixture().token()).getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(request(HttpMethod.DELETE, path, null, f.token()).getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(request(HttpMethod.GET, path, null, f.token()).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        var reopened = request(HttpMethod.GET, f.cyclePath(), null, f.token()).getBody();
        assertThat(reopened.path("status").asText()).isEqualTo("ACTIVE");
        assertThat(reopened.path("progress")).isEqualTo(before.path("progress"));
        assertThat(reopened.path("subStatus")).isEqualTo(before.path("subStatus"));
        created(path, harvest, f.token());
        assertThat(request(HttpMethod.GET, path + "/corrections", null, f.token()).getBody().isEmpty()).isTrue();
    }

    @Test void competingHarvestCorrectionsCannotOverwriteEachOther() throws Exception {
        Fixture f = fixture();
        created(f.cyclePath() + "/harvest", Map.of("quantity", 800, "unit", "KG", "harvestDate", LocalDate.now().toString()), f.token());
        assertThat(concurrent(
                () -> request(HttpMethod.PUT, f.cyclePath() + "/harvest", correction(900, 0, "First weighbridge reading"), f.token()).getStatusCode().value(),
                () -> request(HttpMethod.PUT, f.cyclePath() + "/harvest", correction(1000, 0, "Second weighbridge reading"), f.token()).getStatusCode().value()))
                .containsExactlyInAnyOrder(200, 409);
        var history = request(HttpMethod.GET, f.cyclePath() + "/harvest/corrections", null, f.token()).getBody();
        assertThat(history.size()).isEqualTo(1);
        assertThat(request(HttpMethod.PUT, f.cyclePath() + "/harvest", correction(800, 1, "Restore original reading after checking source"), f.token()).getStatusCode()).isEqualTo(HttpStatus.OK);
        var restored = request(HttpMethod.GET, f.cyclePath() + "/harvest/corrections", null, f.token()).getBody();
        assertThat(restored.size()).isEqualTo(2);
        assertThat(restored.get(1).path("id")).isEqualTo(history.get(0).path("id"));
        assertThat(restored.get(0).path("afterValues").path("quantity").asDouble()).isEqualTo(800);
    }

    @Test void summaryWithholdsLegacyCostsUntilTheyAreReviewed() {
        Fixture f = fixture();
        long inputId = created(f.root() + "/inputs", purchase("Legacy input", 10, "kg", 10000), f.token()).path("id").asLong();
        var old = new CycleInputUsage(f.farmer(), cycles.findById(f.cycle()).orElseThrow(), inputs.findById(inputId).orElseThrow(),
                "Legacy input", InputType.FERTILIZER, 2.0, "kg", 25000.0, 50000.0, LocalDate.now(), null);
        old.setCostBasisVersion(null); old = usages.saveAndFlush(old);
        var before = request(HttpMethod.GET, f.root() + "/summary", null, f.token()).getBody();
        assertThat(before.path("costVerified").asBoolean()).isFalse();
        assertThat(before.path("totalInputCost").isNull()).isTrue();
        assertThat(before.path("unverifiedInputCount").asInt()).isEqualTo(1);
        assertThat(request(HttpMethod.PUT, f.cyclePath() + "/inputs/" + old.getId() + "/unit-cost", Map.of("unitCost", 500), f.token()).getStatusCode()).isEqualTo(HttpStatus.OK);
        var after = request(HttpMethod.GET, f.root() + "/summary", null, f.token()).getBody();
        assertThat(after.path("costVerified").asBoolean()).isTrue();
        assertThat(after.path("totalInputCost").asDouble()).isEqualTo(1000);
    }
}
