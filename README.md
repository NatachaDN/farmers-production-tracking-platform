# Farmer Production Tracking Platform

A modular web application designed to track agricultural production for **crop farming** (cycles, varieties, acreage, harvests, yields) and **animal farming** (livestock batches, headcount, daily outputs like milk, eggs, meat).

---

## Tech Stack Overview

- **Backend:** Spring Boot 3 (Java 17/21) with Modular Architecture
- **Frontend:** React + Vite
- **Database:** Neon Online Serverless PostgreSQL (`postgresql://...`)
- **API Documentation:** Swagger / OpenAPI 3 (`/swagger-ui.html`)

---

## Project Structure

```text
farmers-production-tracking-platform/
│
├── .env.example                          # Environment variables template for Neon DB & server
├── README.md                             # Project setup and architecture documentation
│
├── backend/                              # Spring Boot Application
│   ├── pom.xml                           # Maven dependencies (Web, JPA, Postgres, Springdoc)
│   └── src/
│       └── main/
│           ├── java/com/farmer/tracking/
│           │   ├── FarmerProductionTrackingApplication.java # Spring Boot entrypoint
│           │   ├── config/
│           │   │   ├── OpenApiConfig.java# Swagger / OpenAPI 3 configuration
│           │   │   └── CorsConfig.java   # Cross-Origin configuration for React
│           │   ├── modules/              # Domain-Driven Modular Structure
│           │   │   ├── farmer/           # Farmer & farm management
│           │   │   ├── crop/             # Crop planting, cycles, harvest tracking
│           │   │   ├── animal/           # Livestock batches & production outputs
│           │   │   └── analytics/        # Yield calculations & dashboard summaries
│           │   └── common/               # Shared exceptions, utilities, middleware
│           └── resources/
│               └── application.properties # Neon PostgreSQL connection & Swagger settings
│
└── frontend/                             # React Application (Vite)
    ├── package.json                      # Dependencies and scripts
    ├── vite.config.js                    # Vite configuration with proxy to Spring Boot
    ├── index.html                        # HTML entry point
    └── src/
        ├── main.jsx                      # React mounting entry point
        ├── App.jsx                       # Root initial component
        ├── index.css                     # Base styling
        ├── components/                   # Reusable UI components
        ├── pages/                        # Feature view pages
        ├── services/                     # API client services
        └── assets/                       # Static assets
```

---

## 1. Database Configuration (Neon PostgreSQL)

1. Create a project at [Neon Console](https://console.neon.tech).
2. Copy your connection details or connection string from the Neon dashboard.
3. Configure your credentials via environment variables or in `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://<neon-hostname>:5432/<dbname>?sslmode=require
spring.datasource.username=<neon-username>
spring.datasource.password=<neon-password>
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
