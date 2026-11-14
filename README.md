# Farmer Production Tracking Platform

A modular web application designed to track agricultural production for crop farming (cycles, varieties, acreage, harvests, yields) and animal farming (livestock batches, headcount, daily outputs like milk, eggs, meat).

## Tech Stack Overview

* **Backend:** Spring Boot 3 (Java 17/21) with Modular Architecture
* **Frontend:** React + Vite
* **Database:** Aiven Online Managed MySQL (`mysql://...`)
* **API Documentation:** Swagger / OpenAPI 3 (`/swagger-ui.html`)

## Architecture Overview

* **Modular monolith, deployed as one backend application.** The code is organized by business domain (`farmer`, `crop`, `animal`, `analytics`), and each module has its own internal layers.
* **Layers inside each module:** `controller` (HTTP only) → `service` (business rules) → `repository` (database only), plus `entity` (tables) and `api` (the public part other modules may use).
* **Module rule:** a module never uses another module's repository or entity. It calls the other module's `api/` package.
* **REST API + separate React client.** The frontend talks to the backend only through the API described in `docs/api-contract.md`.
* **Monorepo:** `backend/` and `frontend/` live in the same repository, separated by folders (not by branches).

## Project Structure

```
farmers-production-tracking-platform/
│
├── .env.example                          # Environment variables template (names only, never real values) for Aiven MySQL & server
├── .gitignore                            # Files Git must ignore: target/, node_modules/, .env, IDE files
├── README.md                             # Project setup, architecture and Git workflow
│
├── docs/                                 # Everything that is not code
│   ├── api-contract.md                   # Endpoints, request/response shapes, error formats (agreed by each front/back pair BEFORE coding)
│   └── architecture.md                   # Why we chose a modular monolith, REST API...
│
├── backend/                              # Spring Boot Application (all server-side code)
│   ├── pom.xml                           # Maven dependencies (Web, JPA, MySQL Connector/J, Springdoc). Shared file: warn the team before editing
│   └── src/
│       ├── main/
│       │   ├── java/com/farmer/tracking/
│       │   │   ├── FarmerProductionTrackingApplication.java # Spring Boot entrypoint
│       │   │   │
│       │   │   ├── common/               # Small shared code with NO business logic
│       │   │   │   ├── exception/        # Global error handler, custom exceptions, standard error response
│       │   │   │   └── util/             # Generic helpers (date formatting, etc.)
│       │   │   │
│       │   │   └── modules/              # Domain-Driven Modular Structure (one folder per business domain)
│       │   │       ├── farmer/           # Farmer & farm management
│       │   │       │   ├── api/          # PUBLIC part: interface + DTOs that OTHER modules may use
│       │   │       │   ├── controller/   # REST endpoints: receive requests, validate input, return responses. No business logic
│       │   │       │   ├── service/      # Business rules of this module
│       │   │       │   ├── repository/   # Database access only (Spring Data JPA)
│       │   │       │   └── entity/       # Classes mapped to database tables
│       │   │       ├── crop/             # Crop planting, cycles, harvest tracking (same internal layers as farmer)
│       │   │       ├── animal/           # Livestock batches & production outputs (same internal layers)
│       │   │       └── analytics/        # Yield calculations & dashboard summaries. Reads other modules ONLY through their api/ folder
│       │   │
│       │   └── resources/
│       │       └── application.properties # Aiven MySQL connection & Swagger settings (values come from environment variables)
│       │
│       └── test/java/com/farmer/tracking/ # Automated tests, same package structure as main
│
└── frontend/                             # React Application (Vite) (all client-side code)
    ├── package.json                      # Dependencies and scripts. Shared file: warn the team before editing
    ├── vite.config.js                    # Vite configuration with proxy to Spring Boot
    ├── index.html                        # HTML entry point
    └── src/
        ├── main.jsx                      # React mounting entry point
        ├── App.jsx                       # Root component. Keep it to routing only (everyone edits it, conflict risk)
        ├── index.css                     # Global base styling only. Feature styles live inside their feature
        │
        ├── features/                     # One folder per business feature, mirroring backend/modules
        │   ├── farmer/                   # Everything about farmers on the UI side
        │   │   ├── pages/                # Full screens (list page, form page)
        │   │   ├── components/           # UI pieces used only by this feature
        │   │   └── services/             # API calls to the farmer endpoints
        │   ├── crop/                     # Same internal structure as farmer
        │   ├── animal/                   # Same internal structure
        │   └── analytics/                # Dashboards and charts, same internal structure
        │
        └── shared/                       # Only code used by 2+ features
            ├── components/               # Reusable UI components (Button, Modal, Table, Navbar)
            ├── services/                 # API client setup (base URL, headers, error handling)
            └── assets/                   # Static assets
```

## Git Workflow

### Principles

* **Folders say which part of the system** the code belongs to (`backend/`, `frontend/`). **Branches say what stage** the code is in (being worked on, integrated, stable).
* We do **not** use long-lived `frontend` or `backend` branches. They drift apart and delay integration.
* Only `main` and `develop` are permanent. Every other branch is temporary and deleted after its Pull Request is merged.
* A feature is only done when it works end to end (backend + frontend + integration).

### Branch structure

```
repository/
│
├── main                                  # Stable, demo-ready (protected, tagged v0.1, v0.2...)
│
└── develop                               # Integration of finished work (protected)
    │
    ├── feature/farmers                   # Shared branch of a pair (Back + Front)
    │   ├── feature/farmers-api           # Back developer (backend/ only)
    │   └── feature/farmers-ui            # Front developer (frontend/ only)
    │
    ├── feature/crop                      # Shared branch of another pair
    │   ├── feature/crop-api
    │   └── feature/crop-ui
    │
    ├── fix/login-redirect                # Small bug fix, one person
    ├── docs/api-contract                 # Documentation task
    └── chore/setup-ci                    # Tooling or configuration task
```

### Merge direction

```
feature/farmers-api ─┐
                     ├─► feature/farmers ──► develop ──► main
feature/farmers-ui ──┘                    (PR + review)  (end of sprint + tag)
```

* `main`: only tested, demonstrable versions. Updated from `develop` at the end of each sprint, then tagged (`v0.1`, `v0.2`...).
* `develop`: where all finished features come together and are tested as a whole. It must always work. If a PR breaks it, fixing that comes first.
* `feature/<name>` (shared branch): workspace of one front+back pair for one feature. Created from `develop`, merged back into `develop` with one PR when the feature works end to end.
* `feature/<name>-api` and `feature/<name>-ui`: short sub-branches (1 to 3 days) created from the shared branch and merged back into it through quick PRs.

### Branch naming

```
<type>/<short-description>

feature/   new functionality
fix/       bug fix
docs/      documentation
chore/     setup, config, tooling
```

* Name branches after the **task**, never after a person (Git already records who made each commit).
* Add `-api` or `-ui` to sub-branches to show which side of the project they touch.

### Commit messages

Use one of these prefixes, one logical change per commit:

```
feat:      new feature             feat: add farmer registration endpoint
fix:       bug fix                 fix: correct total yield calculation
docs:      documentation           docs: update API contract
refactor:  code restructuring      refactor: extract harvest calculation
test:      tests                   test: add FarmerService tests
chore:     setup / tooling         chore: add MySQL dependency
```

### Working as a front + back pair (step by step)

1. **Agree on the API contract first** (about 30 minutes together). Write the endpoints, request and response shapes in `docs/api-contract.md`.
2. **Create the shared branch from `develop` and publish it:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/farmers
   git push -u origin feature/farmers
   ```
3. **Each developer creates a sub-branch from the shared branch:**
   ```bash
   git checkout feature/farmers
   git pull origin feature/farmers
   git checkout -b feature/farmers-api      # back developer
   git checkout -b feature/farmers-ui       # front developer
   ```
   You can also name the parent directly: `git checkout -b feature/farmers-api feature/farmers`
4. **Work in parallel.** The back developer works in `backend/` and the front developer in `frontend/`, using mock data that follows the contract.
5. **Commit small and often, then push:**
   ```bash
   git add .
   git commit -m "feat: add POST /api/farmers endpoint"
   git push -u origin feature/farmers-api
   ```
6. **Open a Pull Request into the shared branch.** Set the **base branch to `feature/farmers`** (GitHub suggests `main` by default, change it). A teammate reviews, then merge.
7. **Integrate.** Once both parts are in `feature/farmers`, replace mock data with real API calls and test the full flow.
8. **Open one PR from `feature/farmers` into `develop`** (base: `develop`). After review and merge, delete the branches.
9. **End of sprint:** test `develop` as a whole, then merge it into `main` and tag it:
   ```bash
   git checkout main
   git pull origin main
   git merge --no-ff develop
   git tag v0.1
   git push origin main --tags
   ```

### Daily routine

Sync with the latest work of the team every day, and resolve conflicts on your own branch, never on `develop`:

```bash
git fetch origin
git rebase origin/feature/farmers      # for a sub-branch: sync with its shared branch
git rebase origin/develop              # for a shared branch: sync with develop
# or use "git merge origin/<branch>" instead of rebase
git push --force-with-lease            # only needed after a rebase
```

Before opening a PR, run the app and check that your feature still works with everyone else's changes.

### Branch rules

1. Nobody pushes directly to `main` or `develop`. Everything goes through a Pull Request with at least 1 review.
2. One branch equals one task or feature, created from its parent branch (see the structure above).
3. Keep branches short: 1 to 3 days for a sub-branch, a few days for a shared feature branch. If it takes longer, split the feature.
4. Always `git pull` the parent branch before creating a new branch from it.
5. Always check the base branch on GitHub before clicking "Create pull request".
6. Delete branches after merging:
   ```bash
   git branch -d feature/farmers-api
   git push origin --delete feature/farmers-api
   ```
7. Never commit secrets. Real values stay in your local `.env`, and only `.env.example` is committed.
8. Set your Git identity with the same email as your GitHub account, so your commits are linked to you:
   ```bash
   git config --global user.name "First Last"
   git config --global user.email "email-used-on-github@example.com"
   ```

### Shared files (conflict risk)

These files are edited by everyone. Tell the team on WhatsApp before editing them, keep changes small, and merge them quickly:

* `backend/pom.xml`
* `frontend/package.json` and its lockfile (if it conflicts, take the version from `develop`, run `npm install` again and commit the result)
* `frontend/src/App.jsx` (routes)
* `backend/src/main/resources/application.properties`
* `frontend/src/index.css`

Do not reformat files you are not working on, because it creates conflicts with everybody.

### Resolving a conflict

Git marks the file like this:

```
<<<<<<< HEAD
your version
=======
their version
>>>>>>> origin/develop
```

Open the file, keep the correct combination of both versions (often both), remove the markers, run the app, then `git add` the file and continue the rebase or commit. If unsure, ask the person who wrote the other side.

### Repository setup (one person, once)

In GitHub, go to Settings → Branches and add protection rules on `main` and `develop`:

* Require a Pull Request before merging, with at least 1 approval.
* Require branches to be up to date before merging.
* Require status checks to pass (once CI exists).

Also add every teammate in Settings → Collaborators.

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

* `SPRING_DATASOURCE_URL`
* `SPRING_DATASOURCE_USERNAME`
* `SPRING_DATASOURCE_PASSWORD`

Never commit real credentials. Use environment variables or a local `.env` file, and keep only `.env.example` in the repository.

## 2. Running the Spring Boot Backend

```bash
cd backend
mvn clean spring-boot:run
```

The backend starts at `http://localhost:8080`.

## 3. Swagger / OpenAPI Documentation

Once the backend is running, the interactive Swagger documentation is accessible at:

* **Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
* **OpenAPI JSON:** [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

## 4. Running the React Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173`.

## Render and Vercel deployment

1. In Render, create a **Web Service** with the **Docker** runtime and Root Directory `backend`. Use the included Dockerfile and leave `PORT` to Render. Set `SPRING_DATASOURCE_URL` (the MySQL JDBC URL), `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, and a stable `JWT_SECRET` (at least 32 random bytes, Base64 encoded). Set `APP_BASE_URL` to the public HTTPS Render origin for backend-generated avatar URLs.
2. In Vercel, import the repo with Root Directory `frontend` and Framework Preset **Vite** (build `npm run build`, output `dist`). Set the Production variable `VITE_API_BASE_URL=https://<render-host>/api/v1` before building. The included rewrite serves the app on direct visits to `/auth/google/callback`.
3. Once the production frontend URL exists, set Render's `APP_CORS_ALLOWED_ORIGINS=https://<vercel-host>` (scheme and host only, no trailing slash), and use that same frontend URL for Google sign-in below.

Test first with a staging MySQL database. Verify the harvest schema upgrade adds the two snapshot columns and allows the `HARVEST_DELETED` audit event. Uploaded farm maps live in `farm_maps` and survive backend redeploys that keep using the same database. Check by uploading a map on staging, redeploying Render, and reopening the farm. Avatar uploads use the filesystem; if you need them to survive a redeploy, use a Render persistent disk and point `UPLOADS_DIR` into its mount path.

## Google sign-in and admin console

### Google sign-in (OAuth 2.0)
1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials) create an **OAuth client ID** of type *Web application*.
2. Add the exact frontend callback to **Authorized redirect URIs**. Use `http://localhost:5173/auth/google/callback` on Vite's default port. If you run the frontend at `http://127.0.0.1:5179`, use `http://127.0.0.1:5179/auth/google/callback`. For production use your HTTPS frontend address followed by `/auth/google/callback`.
3. Put `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the backend environment or the gitignored root `.env`. Set `GOOGLE_REDIRECT_URIS` to the same comma-separated callbacks registered in Google Cloud for that environment.
4. If the Google app is in Testing, add the Google accounts that will sign in as test users. Restart the backend and select **Continue with Google**. With registration review enabled, approve a new test account in Acrea and sign in again to verify access.

In production the host must serve `index.html` for `/auth/google/callback` (single-page-app fallback).

### Password reset email (SMTP)

Set `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME` and `MAIL_PASSWORD` using your SMTP provider's settings. Set `MAIL_FROM` if the authorized sender differs from the SMTP username. Use port 587 with STARTTLS by default. For implicit TLS on port 465, set `MAIL_SMTP_STARTTLS=false` and `MAIL_SMTP_SSL=true`. For Gmail, use an [app password](https://support.google.com/mail/answer/185833) where your account permits one.

Restart the backend and request a code from **Forgot password** using an approved Acrea password account with an email address you control. Enter the code and confirm the new password works. For a local SMTP capture server, set its host and port, an explicit `MAIL_FROM`, and set `MAIL_SMTP_AUTH=false` and `MAIL_SMTP_STARTTLS=false`. Keep authentication and encryption enabled for a hosted SMTP provider.

### Admin console
The management console is available to administrators and managers. Administrators can review registrations, change access, assign farmers to managers, and maintain the shared crop catalog. Managers see their assigned farmers and can approve or decline their pending registrations.
Create an administrator in one of three ways:
* `ADMIN_EMAILS=you@gmail.com` - that Google account becomes admin the next time it signs in with Google.
* `ADMIN_BOOTSTRAP_EMAIL` + `ADMIN_BOOTSTRAP_PASSWORD` - an email/password admin is created (or an existing account promoted) at startup.
* SQL: `UPDATE farmers SET role = 'ROLE_ADMIN' WHERE email_or_phone = 'you@example.com';`

Self-registration never grants admin rights.

### Registration and release checks

New registrations require approval by default. Existing accounts without a stored access status remain active. Create an administrator before onboarding farmers, then use **Farmers → Manage access** to approve a registration or assign it to an active manager. A newly approved farmer can sign in immediately. Disabling an account invalidates its existing sessions.

Use the same-origin `/api/v1` default when a reverse proxy serves the frontend and forwards API requests to Spring Boot. Set `VITE_API_BASE_URL` at build time if the API is hosted separately, and configure the allowed frontend origin on the backend. Set a production JWT secret, configure SMTP for email password resets, and use persistent storage for avatar uploads.

Run `mvn test` in `backend` and `npm ci && npm run build` in `frontend`. The GitHub workflow also tests the integration suite against a disposable MySQL database. Before upgrading a live database, verify backup restoration and the schema upgrade on a staging copy. This update adds nullable `farmers.access_status` and `farmers.manager_id` columns and a `reference_crops` table.

### Farm types and map storage

New farms are either Crop or Livestock. Create separate farms when tracking both. Plots require a crop farm, and animal groups require a livestock farm. Review existing mixed farms and unassigned records before rollout. Existing records are preserved and need an explicit farm assignment when their current association is missing or incompatible.

Farm maps use PNG or JPEG images up to 5 MB. The first upload creates the farm and stores its map bytes in the same database transaction. Include the new `farm_maps` table in the staging schema upgrade and backups. Configure the ingress request-size limit to accommodate the multipart payload and verify a representative upload against staging MySQL.
