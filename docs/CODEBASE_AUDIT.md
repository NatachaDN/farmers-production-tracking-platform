# Acrea Platform — Codebase Audit & Implementation Baseline

**Audit Date:** 10 November 2026  
**Auditor:** Senior Software Architect & Technical Auditor  
**Repository:** `farmers-production-tracking-platform`  
**Target Milestone:** Full Backlog Implementation Baseline (43 User Stories)

---

## 1. Executive Summary

This technical audit establishes the definitive baseline of the **Acrea Farmers Production Tracking Platform**, evaluating the state of the codebase against its 43 user stories, agricultural domain requirements, and production readiness standards.

### Key Audit Conclusions:
1. **Crop Farming Engine is Robust and Functionally Operational:** Core crop operations—farm configuration, plot allocation, cycle scheduling, field activities, incident tracking, input usage deduction, and harvest yield recording—are fully implemented end-to-end with high test coverage (188 backend automated tests passing, 0 failures).
2. **Real Database Integration Verified:** All mock and synthetic data fixtures have been eliminated. Both the frontend UI and backend services interact directly with a cloud-hosted Aiven Managed MySQL instance (`defaultdb`).
3. **Animal & Livestock Production is Unimplemented:** Despite being a primary pillar of the Acrea agricultural specification and highlighted in the dashboard UI designs, the **Livestock / Animal Farming module** is 0% implemented (no database entities, no repositories, no REST endpoints, and only placeholder screens in the frontend).
4. **Reports & Cross-Seasonal Analytics are Unimplemented:** While the live Farmer Dashboard and Admin Overview provide real-time aggregation, the dedicated Reports / Export module remains a placeholder.
5. **Clean Monolithic Modular Architecture:** The backend follows strict package separation (`controller` → `service` → `repository` → `entity`), while the frontend employs feature-sliced architecture adhering to the tactile Acrea design system.

---

## 2. Technology & Architecture Overview

### 2.1 Repository & Monorepo Structure
The repository is structured as a unified monorepo containing decoupled client and server workspaces:
```
farmers-production-tracking-platform/
├── backend/                  # Spring Boot 3.3.5 / Java 17/21 Web Application
├── frontend/                 # React 18 / Vite 5 SPA
├── docs/                     # Specifications, API contracts, and architecture guides
└── .agents/skills/           # Acrea UI/UX design tokens and screen specifications
```

### 2.2 Backend Architecture
* **Framework:** Spring Boot 3.3.5 on Java 17 / 21 (`jbr-21`).
* **Modular Domain Isolation:** Domain features (`auth`, `farm`, `plot`, `crop`, `input`, `dashboard`, `admin`) are organized into discrete modules. Cross-module calls utilize public `api/` interfaces and DTOs rather than direct entity/repository coupling.
* **Security & Auth:** Spring Security 6 stateless filter chain with JWT Bearer authentication (`io.jsonwebtoken:jjwt`), BCrypt password hashing, and Google OAuth 2.0 PKCE authentication flow.
* **Persistence:** Spring Data JPA over Hibernate 6.5.3 ORM.
* **Database Driver & Pooling:** MySQL Connector/J (`com.mysql.cj.jdbc.Driver`) managed by HikariCP (connection pool configured for SSL keep-alive on cloud MySQL).
* **API Documentation:** Springdoc OpenAPI 3.0 (`/swagger-ui.html` and `/v3/api-docs`).

### 2.3 Frontend Architecture
* **Core:** React 18 SPA built with Vite 5.4.21.
* **Routing:** Dynamic route state matching screen archetypes (`/login`, `/register`, `/forgot-password`, `/dashboard`, `/farms`, `/crops`, `/activities`, `/production`, `/inputs`, `/cycle-inputs`, `/incidents`, `/admin-*`, `/settings`).
* **Styling & Design System:** Custom tactile agricultural design tokens (`#164230` evergreen, `#F9F6F0` warm parchment, `#3E7B52` moss green) implemented via CSS custom properties without bulky third-party UI component libraries.
* **HTTP Client:** Fetch API client abstraction (`apiClient.js`) featuring automatic Bearer token injection, session expiration handling, and structured error propagation.

---

## 3. Functional Implementation Matrix (43 User Stories)

Below is the verified mapping of all 43 user stories in the product backlog across the platform's functional modules:

| ID | User Story Description | Module | Backend Status | Frontend Status | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **US-01** | Farmer Self-Registration (Email/Phone, Farm Type) | `auth` | Implemented | Implemented | **VERIFIED** |
| **US-02** | Farmer Authentication & JWT Token Issuance | `auth` | Implemented | Implemented | **VERIFIED** |
| **US-03** | Google OAuth2 Sign-In with PKCE & Account Linking | `auth` | Implemented | Implemented | **VERIFIED** |
| **US-04** | Forgot Password Code Request & Email Dispatch | `auth` | Implemented | Implemented | **VERIFIED** |
| **US-05** | Reset Password with Time-Limited Verification Code | `auth` | Implemented | Implemented | **VERIFIED** |
| **US-06** | Profile Management & Farm Info Update | `auth` / `farmer` | Implemented | Implemented | **VERIFIED** |
| **US-07** | Custom Profile Picture / Avatar Upload & Serving | `auth` | Implemented | Implemented | **VERIFIED** |
| **US-08** | Register & Manage Multiple Farms | `farm` | Implemented | Implemented | **VERIFIED** |
| **US-09** | Update Farm Details (Location, Total Area) | `farm` | Implemented | Implemented | **VERIFIED** |
| **US-10** | Delete Farm with Cascading Integrity Checks | `farm` | Implemented | Implemented | **VERIFIED** |
| **US-11** | Register Plot on Farm (Area, Soil Type, Stage) | `plot` | Implemented | Implemented | **VERIFIED** |
| **US-12** | Update Plot Details & Stage Status | `plot` | Implemented | Implemented | **VERIFIED** |
| **US-13** | Delete Plot with Active Cycle Protection | `plot` | Implemented | Implemented | **VERIFIED** |
| **US-14** | Crop Variety Catalog & Predefined Library | `crop` | Implemented | Implemented | **VERIFIED** |
| **US-15** | Add Custom Crop Varieties per Farmer | `crop` | Implemented | Implemented | **VERIFIED** |
| **US-16** | Initiate Crop Production Cycle on Plot | `crop` | Implemented | Implemented | **VERIFIED** |
| **US-17** | Plot Scheduling Conflict Detection on Cycle Start | `crop` | Implemented | Implemented | **VERIFIED** |
| **US-18** | Track Cycle Progress, Dates & Growth Stage | `crop` | Implemented | Implemented | **VERIFIED** |
| **US-19** | Complete or Cancel Crop Cycle | `crop` | Implemented | Implemented | **VERIFIED** |
| **US-20** | Delete Production Cycle with Historical Safeguards | `crop` | Implemented | Implemented | **VERIFIED** |
| **US-21** | Record Field Activities (Watering, Spraying, Weeding) | `crop` | Implemented | Implemented | **VERIFIED** |
| **US-22** | Filter & Inspect Chronological Activity Timeline | `crop` | Implemented | Implemented | **VERIFIED** |
| **US-23** | Record Harvest Event & Yield Quantity (Kg/Tons) | `crop` | Implemented | Implemented | **VERIFIED** |
| **US-24** | Automated Yield Per Hectare Calculation | `crop` | Implemented | Implemented | **VERIFIED** |
| **US-25** | Register Purchased Farm Inputs into Inventory | `input` | Implemented | Implemented | **VERIFIED** |
| **US-26** | Track Input Stock Balances & Unit Costs | `input` | Implemented | Implemented | **VERIFIED** |
| **US-27** | Record Input Application on Active Cycle | `crop` | Implemented | Implemented | **VERIFIED** |
| **US-28** | Auto-Deduct Inventory Stock upon Cycle Consumption | `crop` / `input` | Implemented | Implemented | **VERIFIED** |
| **US-29** | Aggregate Cycle Input Costs & Operational Expenditure | `crop` | Implemented | Implemented | **VERIFIED** |
| **US-30** | Record Incidents (Pests, Diseases, Frost/Flood Damage) | `crop` | Implemented | Implemented | **VERIFIED** |
| **US-31** | Monitor Incident History & Treatment Actions | `crop` | Implemented | Implemented | **VERIFIED** |
| **US-32** | Farmer Live Dashboard Key Metric Cards | `dashboard` | Implemented | Implemented | **VERIFIED** |
| **US-33** | 12-Month Production History Visual Chart | `dashboard` | Implemented | Implemented | **VERIFIED** |
| **US-34** | Upcoming & Recent Activities Feed on Dashboard | `dashboard` | Implemented | Implemented | **VERIFIED** |
| **US-35** | Register Livestock Batch / Animal Group | `animal` | **Missing** | **Missing** | **UNIMPLEMENTED** |
| **US-36** | Track Animal Population Changes (Births, Deaths, Sales)| `animal` | **Missing** | **Missing** | **UNIMPLEMENTED** |
| **US-37** | Log Daily Animal Production (Milk, Eggs, Wool, Meat) | `animal` | **Missing** | **Missing** | **UNIMPLEMENTED** |
| **US-38** | Log Animal Feed Consumption & Stock Usage | `animal` | **Missing** | **Missing** | **UNIMPLEMENTED** |
| **US-39** | Log Veterinary Care, Vaccinations & Treatments | `animal` | **Missing** | **Missing** | **UNIMPLEMENTED** |
| **US-40** | Cross-Seasonal Production Comparison Reports | `reports` | **Missing** | **Missing** | **UNIMPLEMENTED** |
| **US-41** | CSV / PDF Export of Farm Records & Audit Sheets | `reports` | **Missing** | **Missing** | **UNIMPLEMENTED** |
| **US-42** | Platform Administration Console (Tenant Inspection) | `admin` | Implemented | Implemented | **VERIFIED** |
| **US-43** | System Telemetry, JVM Health & Audit Event Trail | `admin` | Implemented | Implemented | **VERIFIED** |

**Summary Baseline:**  
* **Fully Implemented & Verified:** 36 Stories (83.7%)  
* **Unimplemented:** 7 Stories (16.3%) — Comprising all 5 Livestock stories and 2 Advanced Reporting/Export stories.

---

## 4. Existing and Missing CRUD Operations

| Entity | Create (C) | Read (R) | Update (U) | Delete (D) | Implementation Notes |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Farmer (User)** | Yes | Yes | Yes | No | Account creation, auth, profile edit; self-deletion not implemented. |
| **Password Reset** | Yes | Yes | Yes | Yes | Token generated, verified, consumed, and purged. |
| **Farm** | Yes | Yes | Yes | Yes | Full CRUD with default farm flags. |
| **Plot** | Yes | Yes | Yes | Yes | Full CRUD with active cycle collision prevention. |
| **Crop Catalog** | Yes | Yes | No | No | Read catalog + create custom variety; edit/delete not implemented. |
| **Production Cycle** | Yes | Yes | Yes | Yes | Full CRUD with active stage transitions and status validation. |
| **Cycle Activity** | Yes | Yes | Yes | Yes | Full CRUD across activity types (Watering, Spraying, Weeding, etc.). |
| **Harvest** | Yes | Yes | Yes | Yes | Full CRUD with yield calculation and cycle status updates. |
| **Farm Input** | Yes | Yes | Yes | Yes | Full inventory CRUD with stock level updates. |
| **Cycle Input Usage**| Yes | Yes | No | Yes | Usage logs linked to cycles with automated stock deduction. |
| **Cycle Incident** | Yes | Yes | Yes | Yes | Full incident logging with severity levels and action notes. |
| **Livestock Batch** | **NO** | **NO** | **NO** | **NO** | **Missing Entity & Endpoints.** |
| **Animal Yield Log** | **NO** | **NO** | **NO** | **NO** | **Missing Entity & Endpoints.** |
| **Animal Health/Feed**| **NO** | **NO** | **NO** | **NO** | **Missing Entity & Endpoints.** |
| **Reports / Exports**| **NO** | **NO** | **NO** | **NO** | **Missing Service & Endpoints.** |

---

## 5. Frontend / Backend Integration Assessment

### 5.1 Adherence to API Contract
- The frontend services (`authService.js`, `farmService.js`, `plotService.js`, `cropCycleService.js`, `cropService.js`, `cycleActivityService.js`, `harvestService.js`, `inputService.js`, `cycleInputUsageService.js`, `cycleIncidentService.js`, `dashboardService.js`, `adminService.js`) adhere strictly to the JSON contracts defined in `docs/api-contract.md`.
- Endpoints follow RESTful naming conventions rooted at `/api/v1/...`.

### 5.2 Error Propagation & Validation
- Spring Boot returns structured errors through `GlobalExceptionHandler`:
  ```json
  {
    "timestamp": "2026-11-10T11:00:00",
    "status": 400,
    "error": "Bad Request",
    "message": "Validation failed",
    "path": "/api/v1/..."
  }
  ```
- The frontend `apiClient.js` correctly parses error responses and surfaces user-friendly alert messages across all modals and form submissions.

### 5.3 Removal of Mock Data
- Audit verifies that previous mock arrays and static dummy numbers have been eliminated from all active views.
- Metric calculation on the Farmer Dashboard uses dynamic aggregation from real MySQL records via `FarmerDashboardService`.

---

## 6. Database Assessment

### 6.1 Database Engine & Topology
- **Host:** Managed MySQL 8.0 on Aiven Cloud (`farmerproject-karagigi918-ca33.g.aivencloud.com:15852/defaultdb`).
- **SSL Enforcement:** SSL required (`sslMode=REQUIRED`), validated via TLS connection over port 15852.
- **Connection Pool:** HikariCP with pool size of 10, idle timeout of 45s, and validation timeout of 3s to prevent cloud proxy disconnects.

### 6.2 Schema Generation Strategy
- **Current Mode:** Hibernate `spring.jpa.hibernate.ddl-auto=update`.
- **Finding / Risk:** While functional for prototyping and rapid iteration, `ddl-auto=update` carries risks for production deployments (e.g., cannot rename columns cleanly, does not drop obsolete indexes).
- **Flyway Assessment:** An orphaned Flyway migration file exists at `backend/src/main/resources/db/migration/V3__create_cycle_activities.sql`. However, Flyway is not declared in `pom.xml`, meaning versioned migrations are currently inert. Furthermore, `V3` uses PostgreSQL syntax (`BIGSERIAL`, `TIMESTAMP WITHOUT TIME ZONE`) which would fail on MySQL if Flyway were enabled without migration dialect adjustments.

### 6.3 Relational Model & Indexes
- Foreign key constraints are enforced across `farms`, `plots`, `cycles`, `cycle_activities`, `harvests`, `farm_inputs`, `cycle_input_usages`, and `cycle_incidents`.
- Composite indexes and foreign key lookups are present on `farmer_id` across all tenant-scoped tables to optimize multi-tenant query isolation.

---

## 7. Authentication, Authorization & Multi-Tenancy

### 7.1 Authentication Mechanisms
1. **Local Authentication:** Password-based authentication using email or phone number as identifier, with BCrypt password hashing.
2. **Google OAuth 2.0 PKCE:** Google OAuth 2.0 authorization code flow with server-side validation against Google API endpoints.
3. **Password Recovery:** Email-based 6-digit one-time verification code with an expiration window and audit tracking.

### 7.2 Role-Based Access Control (RBAC)
- Two distinct roles are defined: `ROLE_FARMER` and `ROLE_ADMIN`.
- Admin endpoints under `/api/v1/admin/**` are secured using Spring Security method security and `@PreAuthorize("hasRole('ADMIN')")`. Non-admin access results in HTTP 403 Forbidden.
- The React client enforces role guarding in `AppLayout` and hides administrative navigation for standard farmers.

### 7.3 Multi-Tenant Isolation
- Data isolation is enforced at the service and query layers. All user data queries take the authenticated `farmerId` as an explicit scope.
- In both `PlotService`, `CropCycleService`, and `FarmInputService`, entity retrieval checks verify that the entity belongs to the requesting `farmerId`, throwing `ResourceNotFoundException` or `ForbiddenException` on mismatch.

---

## 8. Technical Debt & Issues Identified

| Issue ID | Severity | Location | Description & Impact |
| :--- | :--- | :--- | :--- |
| **TECH-01** | **High** | Backend (`modules/animal`) | **Complete absence of Livestock module**: The domain requires animal farming capabilities (5 user stories), but zero backend artifacts exist. |
| **TECH-02** | **Medium** | Backend (`pom.xml`, `resources/`) | **Missing Versioned Database Migrations**: `Flyway` is absent from dependencies and schema evolution relies on Hibernate `ddl-auto=update`. |
| **TECH-03** | **Medium** | Backend (`test/`) | **Absence of H2 offline test profile**: Unit and integration tests connect to the remote Aiven MySQL instance. If network or credentials are unavailable, tests cannot execute offline in local CI. |
| **TECH-04** | **Low** | Backend (`admin`, `dashboard`) | **Missing Controller Integration Tests**: While `auth`, `crop`, `farm`, `input`, and `plot` have comprehensive slice tests, `FarmerDashboardController` and `AdminController` currently lack dedicated WebMvc tests. |
| **TECH-05** | **Low** | Frontend (`App.jsx`) | **Route Fallback for Unimplemented Views**: `livestock` and `reports` display placeholder text rather than guided empty states or disabled feature toggles. |

---

## 9. Build and Test Results

### 9.1 Backend Build & Test Suite
- **Command:** `mvn clean test` (using Java 21 / IntelliJ JBR)
- **Execution Date:** 10 November 2026
- **Results:**
  ```
  [INFO] Tests run: 188, Failures: 0, Errors: 0, Skipped: 0
  [INFO] ------------------------------------------------------------------------
  [INFO] BUILD SUCCESS
  [INFO] Total time:  22.214 s
  ```
- **Test Breakdown:**
  - `AdminAccessServiceTest`: RBAC authorization rules
  - `AuthControllerTest` & `AuthServiceTest`: Registration, login, validation
  - `GoogleIdTokenVerifierServiceTest`: OAuth token verification
  - `FarmControllerTest` & `FarmServiceTest`: Farm CRUD and ownership
  - `PlotControllerTest` & `PlotServiceTest`: Plot creation, conflict detection
  - `CropControllerTest` & `CropServiceTest`: Crop varieties
  - `CycleControllerTest` & `CycleServiceTest`: Cycle transitions
  - `CycleActivityControllerTest` & `CycleActivityServiceTest`: Activity logging
  - `HarvestControllerTest` & `HarvestServiceTest`: Harvests and yield math
  - `FarmInputControllerTest` & `FarmInputServiceTest`: Inventory and stock deduction

### 9.2 Frontend Production Build
- **Command:** `npm run build`
- **Execution Date:** 10 November 2026
- **Results:**
  ```
  vite v5.4.21 building for production...
  ✓ 118 modules transformed.
  dist/index.html                   1.87 kB │ gzip:   0.77 kB
  dist/assets/index-BnEKRv5M.css   52.15 kB │ gzip:   9.75 kB
  dist/assets/index-AHhhS8rT.js   489.14 kB │ gzip: 117.25 kB
  ✓ built in 11.23s
  ```
- Zero compilation errors, missing imports, or broken JSX tags.

---

## 10. Functional Dependency Map

The functional modules exhibit the following direct prerequisite dependencies:

```
[Authentication & Identity] (US-01 to US-07)
       │
       ▼
[Farm Management] (US-08 to US-10)
       │
       ▼
[Plot Management] (US-11 to US-13)  ◄──────────┐
       │                                        │
       ▼                                        │
[Crop Catalog & Varieties] (US-14 to US-15)    │
       │                                        │
       ▼                                        │
[Crop Production Cycles] (US-16 to US-20) ──────┘
       │
       ├──────────────────────┬──────────────────────┐
       ▼                      ▼                      ▼
[Field Activities]      [Cycle Inputs]         [Cycle Incidents]
 (US-21 to US-22)        (US-27 to US-29)       (US-30 to US-31)
       │                      ▲
       │               [Inventory / Inputs]
       │                 (US-25 to US-26)
       ▼
[Harvest & Yield Tracking] (US-23 to US-24)
       │
       ▼
[Farmer Dashboard] (US-32 to US-34) ◄─── (Needs Animal Data to be 100% complete)
       │
       ▼
[Platform Admin Console] (US-42 to US-43)

-------------------------------------------------------------------------
PARALLEL DOMAIN BRANCH:
[Farm Management]
       │
       ▼
[Livestock & Animal Production] (US-35 to US-39)  <-- MISSING (NEXT STEP)
       │
       ▼
[Cross-Seasonal Reports & Export] (US-40 to US-41) <-- BLOCKED BY LIVESTOCK
```

---

## 11. Recommended Implementation Sequence

To achieve 100% completion of the product backlog while respecting architectural dependencies, the remaining work should proceed in the following order:

### Phase 1: Livestock & Animal Production Module (High Priority)
* **Goal:** Implement the missing animal production domain (US-35 through US-39).
* **Rationale:** The dashboard UI spec already accounts for animal metrics ("Animal groups", "1,442 current population", and "Crops vs Animals" production overview). The absence of this module leaves the platform half-complete for mixed-use farmers.
* **Scope:**
  1. **Entities & DTOs:** `AnimalGroup` (type, breed, headcount, housing/location), `AnimalProductionRecord` (daily milk, eggs, wool, meat output), and `AnimalHealthRecord` (vaccinations, treatments).
  2. **Persistence & Services:** `AnimalGroupRepository`, `AnimalProductionRepository`, and corresponding business service classes enforcing farmer multi-tenancy.
  3. **REST Controllers:** `/api/v1/farmers/{farmerId}/animals/**`.
  4. **Frontend Interface:** Replace `/livestock` placeholder with full Acrea-styled management screen (herds/flocks cards, add group modal, daily yield logger).
  5. **Dashboard Feed:** Wire live livestock yields into `FarmerDashboardService` and the Production Overview chart.

### Phase 2: Reports & Analytics Module (Medium Priority)
* **Goal:** Implement US-40 and US-41.
* **Scope:**
  1. Aggregated seasonal comparison reports across both crops and livestock.
  2. CSV/PDF generation endpoints for farm production records.
  3. Replace `/reports` placeholder view with filterable analytics screen and export triggers.

### Phase 3: Infrastructure Hardening & Test Isolation (Technical Debt)
* **Goal:** Production-grade CI/CD readiness.
* **Scope:**
  1. Configure Flyway migrations using proper MySQL DDL syntax.
  2. Provide an `application-test.properties` profile backed by an in-memory H2 database to allow offline test execution without external cloud dependencies.
  3. Add slice integration tests for `FarmerDashboardController` and `AdminController`.

---
*End of Audit Report.*

