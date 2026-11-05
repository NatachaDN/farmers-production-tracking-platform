# Priority 1: integration and rollout

## Scope and branch

The feature branch is `codex/phase-one-integrity-security`. Its draft PR is stacked on `fix/sprint-1-2-review-fixes` (PR #53) so reviewers see only the priority 1 changes. PR #53 remains a separate review dependency: merge it first, then retarget this draft to `develop` and rerun CI against the new base. The earlier local integration merge is excluded from this feature branch; do not push the local `develop` branch directly to the shared branch.

This batch combines inventory/data/account safeguards with real farmer and farm summaries. Existing mutation API paths are preserved. The new summary endpoint and cost-review endpoints are additive. No new runtime dependencies are required.

## Summary contract

`GET /api/v1/farmers/{farmerId}/summary`, optionally `?farmId={farmId}`, requires authentication and farmer ownership. A foreign farm returns 404; another farmer's URL returns 403. The endpoint is read-only and uses repeatable-read isolation to give a consistent snapshot across its queries.

- Counts, plot hectares, recorded harvests and consumed input costs come from stored records.
- Tons convert to kilograms. Bags remain separate; no bag weight is assumed.
- `totalInputCost` means cycle consumption, not inventory purchase expenditure. It is null whenever any included usage is unverified; `costVerified` and `unverifiedInputCount` explain that state.
- Harvest and cost totals cover all recorded time. The chart covers the current calendar month plus the preceding 11 months. Activity lists are ordered by recorded activity date, then ID, newest first, limited to six. Harvest plans include overdue active cycles, earliest first, limited to six.
- Farm membership follows each cycle's current plot association. Detached historical cycles remain in the farmer's total but are not attributed to a farm. Moving a plot changes its farm attribution; immutable historical farm attribution is future work.
- Crop-area distribution uses registered plot areas and their stored crop labels, not overlapping cycle acreage. Plot hectares remain separate from a farm's declared size/unit and the profile's self-reported area.
- Livestock, revenue, soil-health readings and scheduled tasks are unavailable, rather than represented by sample numbers. Saved map images are displayed without invented boundaries or nonfunctional map controls.

Dashboard and farm overview use the same endpoint/components. Loading and errors do not display successful zero totals. Navigation/remount reloads the summary after edits. The sidebar's invented season/count and dashboard's sample date/farm name are removed. Previous unused dashboard sample widgets are removed.

Local startup demo seeders now require both the `local` profile and explicit `app.demo.seed-enabled=true`. A normal local start creates no sample farmer-ID-1 plots, inputs or cycles. The opt-in flag is only for disposable demo environments. Existing persisted sample records are not automatically deleted or reattributed.

The queries are farmer-scoped, with aggregation in memory within one transaction, appropriate for the current MVP. Large-account pagination and SQL aggregation can be added later without changing the summary contract. This is not a production load-test claim.

## Verification commands

Local result on 5 November 2026: **220 backend tests passed**, zero failures/errors; production frontend build passed; whitespace checks passed. The build retains the existing large-bundle advisory. The complete backend run is recorded in `backend/target/priority-one-final-tests.log` (generated, not committed).

After making local demo seeding opt-in, all 11 database integration tests passed again. Browser checks confirmed a fresh local account starts with zero plots/harvests/activities. After synthetic records were created through the API, the dashboard and farm overview both showed 1 active cycle, 1 registered plot (2 ha), 500 kg harvested and XAF 5,000 in consumed inputs. Screenshots are in the generated audit evidence folder. No claim of MySQL execution or production validation is implied.

From `backend`: `mvn -B test`.

From `frontend`: `npm ci`, then `npm run build`.

The integration suite includes stock races/undo/legacy review/reset revocation and summary checks for mixed units, record totals, empty farms and ownership. `.github/workflows/priority-one.yml` runs the full H2 suite, the integration suite on a disposable MySQL 8.4 service, and the frontend build on pull requests/manual dispatch. The workflow is prepared locally; it has not run on GitHub yet.

For a **disposable local MySQL database only**, configure PowerShell and run from `backend`:

```powershell
$env:ACREA_TEST_MYSQL_URL = 'jdbc:mysql://127.0.0.1:3307/acrea_test_local?allowPublicKeyRetrieval=true&useSSL=false'
$env:ACREA_TEST_MYSQL_USER = 'your_disposable_test_user'
$env:ACREA_TEST_MYSQL_PASSWORD = 'your_disposable_test_password'
mvn -B '-Dtest=IntegritySecurityIntegrationTest' test
Remove-Item Env:ACREA_TEST_MYSQL_URL, Env:ACREA_TEST_MYSQL_USER, Env:ACREA_TEST_MYSQL_PASSWORD
```

**The integration suite creates and drops tables.** It rejects non-loopback URLs and database names outside `acrea_test_*`. Never point it at the shared development or production database. The MySQL service is not installed on the current workstation, so local passing results are H2 results; CI/MySQL remains a release gate.

## Deployment order

1. Review and commit the application changes, tests, CI workflow and this handoff together on a feature branch. Keep temporary `backend/target` files and generated audit logs/screenshots out of the application commit unless intentionally included as review evidence. Have the author review behavior changes (date restrictions, farm/plot area limits, blocked legacy costs and protected record history).
2. On an isolated staging clone, back up and verify restore first. Review existing invalid areas/dates/parent associations; the change rejects new invalid writes but does not rewrite existing rows. Resolve affected records explicitly with their owners.
3. Configure a private Base64 `JWT_SECRET` containing at least 32 random bytes; never use the public local-development default in production. A key rotation signs out existing sessions. Keep the `local` profile out of production.
4. Upgrade the backend during a coordinated release. Existing Hibernate `ddl-auto=update` adds nullable columns `farm_inputs.unit_cost` (if absent), `cycle_input_usages.cost_basis_version` and `farmers.token_version`. For installations with a DBA-managed schema, apply equivalent nullable columns through the team's migration process before switching to schema validation. Do not default/backfill historical cost-basis versions to 1, and do not derive remaining stock value from cumulative expenditure. Existing null token versions are read as 0. New usages get cost-basis version 1.
5. Verify staging upgrade preserves row counts, quantities, purchase totals, reset behavior and unknown costs. Confirm legacy stock and historical usage costs separately from purchase records through the new review UI. No automatic correction can recover missing purchase history reliably.
6. Deploy the frontend after the backend summary/review routes are live. Exercise a fresh empty account and a populated farmer: farm → plot → cycle → activity → inventory consumption → harvest; compare details, cycle cost summary, dashboard and farm overview after reload. Verify another farmer cannot access the records. Check account reset rejects a previously issued token. Have a team member verify completed-history corrections remain available in the existing screens (their UI improvements are priority 2).
7. Release only after CI MySQL checks **and** staging legacy upgrade/restore checks pass. No production data or external GitHub review has been modified by this work.

## Recovery

Keep the previous frontend bundle for a quick frontend rollback. Nullable schema additions can remain; do not drop them or reverse reviewed monetary values automatically. If backend deployment fails, stop writes and use the verified staging/backup recovery procedure. Reverting to the old inventory/security behavior reintroduces the original defects, so backend rollback needs explicit team review. Keep the private signing key configured.

## Outside this priority

The wider mobile shell, cycle/harvest correction experience, routing/deep links, livestock, finance, reports and scheduled tasks remain separate milestones. Passing these checks does not mean the whole product is complete, nor does it automatically approve PR #53.
