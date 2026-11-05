package com.farmer.tracking.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import com.farmer.tracking.modules.crop.entity.CycleInputUsage;
import com.farmer.tracking.modules.crop.repository.CycleInputUsageRepository;
import com.farmer.tracking.modules.crop.repository.CycleRepository;
import com.farmer.tracking.modules.input.entity.FarmInput;
import com.farmer.tracking.modules.input.entity.InputType;
import com.farmer.tracking.modules.input.repository.FarmInputRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.assertThat;

/** Real HTTP requests, security filters, services, transactions and row locks; no mocked repositories. */
@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.datasource.url=jdbc:h2:mem:integrity;DB_CLOSE_DELAY=-1;LOCK_TIMEOUT=10000",
        "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect", "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.mail.host=localhost", "spring.mail.username=", "app.admin.bootstrap-email=", "app.admin.bootstrap-password=",
        "spring.config.import=optional:classpath:/no-test-env.properties", "spring.dotenv.enabled=false"
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
