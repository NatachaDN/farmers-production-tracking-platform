# Farmer Production Tracking Platform

A modular web application designed to track agricultural production for **crop farming** (cycles, varieties, acreage, harvests, yields) and **animal farming** (livestock batches, headcount, daily outputs like milk, eggs, meat).

---

## Tech Stack Overview

- **Backend:** Spring Boot 3 (Java 17/21) with Modular Architecture
- **Frontend:** React + Vite
- **Database:** Aiven Online Managed MySQL (`mysql://...`)
- **API Documentation:** Swagger / OpenAPI 3 (`/swagger-ui.html`)

---

## Project Structure

```text
farmers-production-tracking-platform/
│
├── .env.example                          # Environment variables template for Aiven MySQL & server
├── README.md                             # Project setup and architecture documentation
│
├── backend/                              # Spring Boot Application
│   ├── pom.xml                           # Maven dependencies (Web, JPA, MySQL Connector/J, Springdoc)
│   └── src/
│       └── main/
│           ├── java/com/farmer/tracking/
│           │   ├── FarmerProductionTrackingApplication.java # Spring Boot entrypoint
│           │   ├── modules/              # Domain-Driven Modular Scaffolding
│           │   │   ├── farmer/           # Farmer & farm management
│           │   │   ├── crop/             # Crop planting, cycles, harvest tracking
│           │   │   ├── animal/           # Livestock batches & production outputs
│           │   │   └── analytics/        # Yield calculations & dashboard summaries
│           │   └── common/               # Shared exceptions, utilities
│           └── resources/
│               └── application.properties # Aiven MySQL connection & Swagger settings
│
└── frontend/                             # React Application (Vite)
    ├── package.json                      # Dependencies and scripts
    ├── vite.config.js                    # Vite configuration with proxy to Spring Boot
    ├── index.html                        # HTML entry point
    └── src/
        ├── main.jsx                      # React mounting entry point
        ├── App.jsx                       # Root initial component
        ├── index.css                     # Base styling reset
        ├── components/                   # Reusable UI components
        ├── pages/                        # Feature view pages
        ├── services/                     # API client services
        └── assets/                       # Static assets
```

---

## 1. Database Configuration (Aiven MySQL)

1. Create a MySQL service at the [Aiven Console](https://console.aiven.io).
2. Copy your connection URI or host, port, user (`avnadmin`), and password from the Aiven Service Overview.
3. Configure your credentials via environment variables or in `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://<aiven-host>:<port>/defaultdb?sslMode=REQUIRED
spring.datasource.username=avnadmin
spring.datasource.password=<aiven-password>
```

Or set environment variables:
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

---

## 2. Running the Spring Boot Backend

```bash
cd backend
mvn clean spring-boot:run
```

The backend starts at `http://localhost:8080`.

---

## 3. Swagger / OpenAPI Documentation

Once the backend is running, the interactive Swagger documentation is accessible at:
- **Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON:** [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

## 4. Running the React Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173`.
