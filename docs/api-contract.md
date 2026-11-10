# Acrea API Contract — Authentication Module

## Base URL
`http://localhost:8080/api/v1`

---

## 1. Register Farmer Account

- **Endpoint:** `POST /api/v1/auth/register`
- **Auth required:** None (Public)
- **Request Body:**
```json
{
  "fullName": "Joyce Muthoni",
  "emailOrPhone": "joyce@example.com",
  "location": "Nakuru County, Kenya",
  "farmType": "MIXED",
  "password": "SecurePassword123",
  "agreedToTerms": true
}
```
- **Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "farmer": {
    "id": 1,
    "fullName": "Joyce Muthoni",
    "emailOrPhone": "joyce@example.com",
    "location": "Nakuru County, Kenya",
    "farmType": "MIXED",
    "role": "ROLE_FARMER",
    "createdAt": "2026-10-06T12:00:00"
  },
  "message": "Farmer account registered successfully."
}
```
- **Error Response (409 Conflict):**
```json
{
  "timestamp": "2026-10-06T12:00:00",
  "status": 409,
  "error": "Conflict",
  "message": "A farmer account already exists with this email or phone number.",
  "path": "/api/v1/auth/register"
}
```

---

## 2. Login

- **Endpoint:** `POST /api/v1/auth/login`
- **Auth required:** None (Public)
- **Request Body:**
```json
{
  "emailOrPhone": "joyce@example.com",
  "password": "SecurePassword123"
}
```
- **Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "farmer": {
    "id": 1,
    "fullName": "Joyce Muthoni",
    "emailOrPhone": "joyce@example.com",
    "location": "Nakuru County, Kenya",
    "farmType": "MIXED",
    "role": "ROLE_FARMER",
    "createdAt": "2026-10-06T12:00:00"
  },
  "message": "Login successful."
}
```
- **Error Response (401 Unauthorized):**
```json
{
  "timestamp": "2026-10-06T12:00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid email/phone or password.",
  "path": "/api/v1/auth/login"
}
```

---

## 3. Get Current Authenticated Profile

- **Endpoint:** `GET /api/v1/auth/me`
- **Auth required:** Bearer JWT Token (`Authorization: Bearer <token>`)
- **Response (200 OK):**
```json
{
  "id": 1,
  "fullName": "Joyce Muthoni",
  "emailOrPhone": "joyce@example.com",
  "location": "Nakuru County, Kenya",
  "farmType": "MIXED",
  "role": "ROLE_FARMER",
  "farmName": "Green Acres Farm",
  "cropsGrown": "Maize, Tomatoes, Beans, Cassava",
  "totalArea": 8.7,
  "avatarUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80",
  "createdAt": "2026-10-06T12:00:00"
}
```

---

## 4. Update Current Authenticated Profile

- **Endpoint:** `PUT /api/v1/auth/me` (alias: `PUT /api/v1/auth/profile`)
- **Auth required:** Bearer JWT Token (`Authorization: Bearer <token>`)
- **Request Body:**
```json
{
  "fullName": "Joyce Muthoni",
  "farmName": "Green Acres Farm",
  "cropsGrown": "Maize, Tomatoes, Beans, Cassava",
  "totalArea": 8.7,
  "avatarUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80",
  "location": "Nakuru County, Kenya",
  "farmType": "MIXED"
}
```
- **Response (200 OK):**
```json
{
  "id": 1,
  "fullName": "Joyce Muthoni",
  "emailOrPhone": "joyce@example.com",
  "location": "Nakuru County, Kenya",
  "farmType": "MIXED",
  "role": "ROLE_FARMER",
  "farmName": "Green Acres Farm",
  "cropsGrown": "Maize, Tomatoes, Beans, Cassava",
  "totalArea": 8.7,
  "avatarUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80",
  "createdAt": "2026-10-06T12:00:00"
}
```
- **Error Response (400 Bad Request — e.g. Negative Area):**
```json
{
  "status": 400,
  "error": "Validation Failed",
  "message": "Input payload contains invalid fields",
  "path": "/api/v1/auth/me",
  "validationErrors": {
    "totalArea": "Total area cannot be negative"
  }
}
```
- **Error Response (401 Unauthorized):**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required.",
  "path": "/api/v1/auth/me"
}
```

---

## 5. Sign in with Google

Google OAuth 2.0 authorization-code flow (with PKCE). The browser redirects to Google, Google redirects back to
`{frontend}/auth/google/callback?code=...&state=...`, and the frontend sends the code to the backend, which exchanges it
(using the client secret) and returns the platform's own JWT.

### 3.1 `GET /api/v1/auth/google/config` (public)
```json
{ "enabled": true, "clientId": "xxxx.apps.googleusercontent.com" }
```
`enabled` is `false` (and `clientId` null) until `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set.

### 3.2 `POST /api/v1/auth/google` (public)
```json
{ "code": "4/0Aea...", "redirectUri": "http://localhost:5173/auth/google/callback", "codeVerifier": "pkce-verifier" }
```
Response `200`: same shape as login (`token`, `tokenType`, `farmer`, `message`); `farmer` also carries `avatarUrl` and
`authProvider` (`LOCAL` or `GOOGLE`). Errors: `400` not configured, `401` Google rejected the code or the token failed
validation (audience, issuer, expiry, unverified email), `502` Google unreachable.

Account rules: a new Google email creates a `ROLE_FARMER` account. If a password account already uses the same verified
email, it is linked to Google and its password is retired. Emails listed in `ADMIN_EMAILS` become `ROLE_ADMIN`.

---

## 4. Forgot Password & Password Recovery

### 4.1 Request Password Reset Code
- **Endpoint:** `POST /api/v1/auth/forgot-password`
- **Auth required:** None (Public)
- **Request Body:**
```json
{
  "emailOrPhone": "joyce@example.com"
}
```
- **Response (200 OK):**
```json
{
  "message": "A password reset code has been sent to your registered email or phone.",
  "resetCode": "482910"
}
```
- **Error Response (404 Not Found):**
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "No farmer account found with this email or phone number.",
  "path": "/api/v1/auth/forgot-password"
}
```

### 4.2 Reset Password
- **Endpoint:** `POST /api/v1/auth/reset-password`
- **Auth required:** None (Public)
- **Request Body:**
```json
{
  "emailOrPhone": "joyce@example.com",
  "resetCode": "482910",
  "newPassword": "NewSecurePassword123",
  "confirmPassword": "NewSecurePassword123"
}
```
- **Response (200 OK):**
```json
{
  "message": "Password has been reset successfully. You can now sign in with your new password."
}
```
- **Error Response (400 Bad Request):**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid or already used reset code.",
  "path": "/api/v1/auth/reset-password"
}
```

---

## 5. Profile Picture Upload & Avatar Serving

### 5.1 Upload Avatar
- **Endpoint:** `POST /api/v1/auth/me/avatar`
- **Auth required:** Authenticated Farmer (`Authorization: Bearer <token>`)
- **Content-Type:** `multipart/form-data` (form field: `file`)
- **Response (200 OK):**
```json
{
  "id": 1,
  "fullName": "Joyce Muthoni",
  "emailOrPhone": "joyce@example.com",
  "location": "Nakuru County",
  "farmType": "MIXED",
  "role": "ROLE_FARMER",
  "createdAt": "2026-10-06T12:00:00",
  "avatarUrl": "/api/v1/auth/avatars/farmer-1-1730582930123.jpg",
  "authProvider": "LOCAL"
}
```

### 5.2 Serve Avatar
- **Endpoint:** `GET /api/v1/auth/avatars/{filename}`
- **Auth required:** None (Public static image serving)
- **Response (200 OK):** Binary image content (`image/jpeg`, `image/png`, etc.)

---

## 6. Administration (requires `ROLE_ADMIN`, read-only)

All endpoints are under `/api/v1/admin` and return `403` for non-admin tokens. Timestamps are ISO-8601 instants.

| Endpoint | Returns |
| :--- | :--- |
| `GET /admin/overview` | totals, highlights, 30-day activity and sign-up series, 12-month harvest, breakdowns, top farmers, cycles needing attention, recent activity and account events |
| `GET /admin/farmers?q=` | every farmer with farm/plot/cycle/activity counts, harvested kg and input spend |
| `GET /admin/farmers/{id}` | one farmer: farms, plots, cycles, recent activities, harvests, inputs, account events (`404` if unknown) |
| `GET /admin/activities?type=&limit=` | field activities newest first (`type`: WATERING, TREATMENT, FERTILIZING, WEEDING; `limit` 1-500) |
| `GET /admin/cycles?status=` | all cycles with progress, health (`on-track`, `idle`, `overdue`) and harvest (`status`: ACTIVE, COMPLETED, CANCELLED) |
| `GET /admin/harvests` | all harvests |
| `GET /admin/inputs` | all purchased inputs |
| `GET /admin/audit?limit=` | sign-ups, sign-ins and failed attempts |
| `GET /admin/telemetry` | JVM and database health, API traffic since the last restart (requests, errors, latency, per-route stats) |

Tons are converted to kg in totals; bags are reported separately because their weight is unknown.

---

## 5. Plots Module (`/api/v1/farmers/{farmerId}/plots`)

All plot endpoints require an authenticated user with a valid Bearer token. Ownership is enforced via `farmerId`.

### 5.1 Register a Plot
- **Endpoint:** `POST /api/v1/farmers/{farmerId}/plots`
- **Request Body:**
```json
{
  "name": "Plot A — Maize",
  "area": 2.5,
  "location": "North Field, Block 1",
  "cropType": "Maize",
  "stage": "Vegetative growth",
  "farmId": 1
}
```
- **Response (201 Created):**
```json
{
  "id": 10,
  "farmerId": 1,
  "name": "Plot A — Maize",
  "area": 2.5,
  "location": "North Field, Block 1",
  "cropType": "Maize",
  "stage": "Vegetative growth",
  "createdAt": "2026-10-26T08:30:00",
  "updatedAt": "2026-10-26T08:30:00"
}
```
- **Error (400 Bad Request):** If `area` <= 0 or missing `name` / `location`.

### 5.2 Update an Existing Plot
- **Endpoint:** `PUT /api/v1/farmers/{farmerId}/plots/{plotId}`
- **Request Body:** Same shape as `POST` (requires `name`, `area` > 0, `location`).
- **Response (200 OK):** Updated plot object.
- **Error (400 Bad Request):** If `area` is negative or missing required fields.
- **Error (404 Not Found):** If plot does not exist or does not belong to farmer.

### 5.3 Delete a Plot
- **Endpoint:** `DELETE /api/v1/farmers/{farmerId}/plots/{plotId}?force=false`
- **Query Parameter:** `force` (`boolean`, optional, default `false`).
- **Response (204 No Content):** Plot successfully deleted.
- **Error (409 Conflict):** If plot is linked to an active production cycle and `force=false`.
```json
{
  "timestamp": "2026-10-26T08:35:00",
  "status": 409,
  "error": "Conflict",
  "message": "Cannot delete plot 'Plot A' because it is linked to active production cycle 'Maize Season 2026'. Complete or cancel the cycle first, or confirm forced deletion.",
  "path": "/api/v1/farmers/1/plots/10"
}
```
- **Forced Deletion:** When called with `?force=true`, any linked cycles are unlinked from the plot and the plot is deleted.


---

## 6. Animal Group Management Module (Livestock)

Base path: `/api/v1/animals/groups` (also supports `/api/animals/groups`)

### 6.1 Register Animal Group
- **Endpoint:** `POST /api/v1/animals/groups`
- **Auth required:** `ROLE_FARMER` (Bearer JWT token)
- **Request Body:**
```json
{
  "name": "Dairy Herd A",
  "animalType": "CATTLE",
  "breed": "Holstein Friesian",
  "initialPopulation": 30,
  "currentPopulation": 30,
  "location": "Barn 2 — East Pasture",
  "farmId": 1,
  "purpose": "Milk Production",
  "status": "ACTIVE",
  "startDate": "2026-10-15",
  "notes": "Healthy dairy herd with vaccination schedule up to date."
}
```
- **Response (201 Created):**
```json
{
  "id": 1,
  "farmerId": 1,
  "farmId": 1,
  "farmName": "Green Acres Farm",
  "name": "Dairy Herd A",
  "animalType": "CATTLE",
  "animalTypeDisplay": "Cattle",
  "breed": "Holstein Friesian",
  "initialPopulation": 30,
  "currentPopulation": 30,
  "location": "Barn 2 — East Pasture",
  "purpose": "Milk Production",
  "status": "ACTIVE",
  "startDate": "2026-10-15",
  "notes": "Healthy dairy herd with vaccination schedule up to date.",
  "createdAt": "2026-11-10T12:00:00",
  "updatedAt": "2026-11-10T12:00:00"
}
```
- **Error (400 Bad Request):** If `initialPopulation` <= 0, `currentPopulation` < 0, or missing required fields (`name`, `animalType`).

### 6.2 List Farmer's Animal Groups
- **Endpoint:** `GET /api/v1/animals/groups`
- **Auth required:** `ROLE_FARMER` (Bearer JWT token)
- **Response (200 OK):** Array of `AnimalGroupResponse` items owned by the authenticated farmer.

### 6.3 Get Animal Group Details
- **Endpoint:** `GET /api/v1/animals/groups/{id}`
- **Auth required:** `ROLE_FARMER` (Bearer JWT token)
- **Response (200 OK):** `AnimalGroupResponse` object.
- **Error (403 Forbidden):** If the group belongs to another farmer (enforcing multi-tenant isolation).
- **Error (404 Not Found):** If the animal group ID does not exist.

### 6.4 Update Animal Group
- **Endpoint:** `PUT /api/v1/animals/groups/{id}`
- **Auth required:** `ROLE_FARMER` (Bearer JWT token)
- **Request Body:**
```json
{
  "name": "Dairy Herd A — Milking Phase",
  "animalType": "CATTLE",
  "breed": "Holstein Friesian",
  "currentPopulation": 28,
  "initialPopulation": 30,
  "location": "Barn 2 — East Pasture",
  "purpose": "Milk Production",
  "status": "ACTIVE",
  "notes": "Two heads culled for health reasons."
}
```
- **Response (200 OK):** Updated `AnimalGroupResponse` object.
- **Error (400 Bad Request):** If population values are invalid.
- **Error (403 Forbidden):** If the group belongs to another farmer.
- **Error (404 Not Found):** If group ID does not exist.

### 6.5 Delete Animal Group
- **Endpoint:** `DELETE /api/v1/animals/groups/{id}`
- **Auth required:** `ROLE_FARMER` (Bearer JWT token)
- **Response (204 No Content):** Group successfully deleted when no historical dependencies exist.
- **Error (403 Forbidden):** If the group belongs to another farmer.
- **Error (404 Not Found):** If group ID does not exist.
- **Error (409 Conflict):** If the group is protected by historical records or active production logs.
