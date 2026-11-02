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
  "createdAt": "2026-10-06T12:00:00"
}
```

---

## 3. Sign in with Google

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
