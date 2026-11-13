# Priority 2: mobile crop workflow and corrections

Branch: `codex/priority-two-crop-usability`, based on priority 1 commit `1fd9204` (PR #54). This work is separate from that PR. Review/integrate the priority 1 dependency first.

## Changes

- At 900px and below, replace the desktop sidebar with a labelled navigation button and native modal drawer. The drawer traps focus, closes with Escape or navigation/backdrop, restores focus, prevents background scrolling, and closes if resized to desktop. Existing desktop navigation remains available above the breakpoint.
- Responsive grids/toolbars cover farm/plot/cycle forms and crop records. Phone headers hide the desktop search/name text while retaining account access. Wide record tables scroll within their container; document overflow is fixed at the source rather than hidden globally. Farm-detail tabs and cycle-input controls now wrap.
- Existing activities on completed cycles can open their edit form. New activity creation remains restricted to active cycles. Opening an edit focuses the form; dates cannot precede planting. Saving and reloading preserves changes without reopening the cycle.
- Harvest corrections require a reason. The original harvest row is updated, yield recalculated, and immutable before/after snapshots stored with the authenticated actor ID, timestamp and incrementing revision. The cycle remains completed; the planned date and stock quantities are unaffected.
- A stale harvest correction receives HTTP 409. The form preserves the user's entries and offers an explicit reload. Correction history is readable to the owner/authorized admin and has no edit/delete endpoint. Cancelling a correction does not save changes.

## Additive API/schema

Existing GET/POST harvest routes remain. GET/POST responses add `revision`, initially 0 (legacy null also reads as 0).

`PUT /api/v1/farmers/{farmerId}/cycles/{cycleId}/harvest` accepts the existing quantity/unit/harvestDate/notes fields plus required `expectedRevision` and `reason`. It only corrects an existing harvest on a completed cycle. Ownership, finite positive quantities and planting-to-today date validation apply.

`GET /api/v1/farmers/{farmerId}/cycles/{cycleId}/harvest/corrections` returns history newest first, including `beforeValues`, `afterValues`, `reason`, `revision`, `actorId` and `correctedAt`. The first correction captures the previous harvest, including old notes and calculated yield.

The schema adds nullable `harvests.revision` (BIGINT) and a new `harvest_corrections` table, with a foreign key to harvests, two value snapshots and a unique harvest/revision pair. Existing Hibernate schema update creates these additions; installations with managed migrations should apply equivalent DDL on staging before deploying with schema validation. No old harvest quantities or dates are backfilled or rewritten automatically.

Deploy backend before frontend, after a verified backup. Retain correction history during rollback; do not drop it to roll back the UI. Test the upgrade on the deployment's MySQL engine using the existing disposable CI setup, and verify staging backup/restore. Latest tests here use local H2; priority 1's earlier MySQL CI success does not validate these new changes.

## Validation

- Full backend suite: **223 passed**, zero failures/errors, including three new HTTP/database regressions for completed-cycle activity edits, correction validation/ownership/history/summary consistency, and competing edits (one succeeds, one returns 409). A later correction restores an original reading while retaining both history entries.
- Frontend production build passes; the existing bundle-size advisory remains.
- Phone browser journey at 390px: create farm → add crop/plot → plan cycle → record activity → purchase inventory → consume 4 kg from 20 kg (16 kg remain, XAF 2,000 consumed) → harvest 800 kg → cancel an unsaved correction → correct to 900 kg with reason/history → edit activity on the completed cycle → reload and verify dashboard totals/history.
- Record tables use their own horizontal scroll containers. This is intentional; page-level sideways scrolling is not.
- Final width checks cover 320px and 390px phones, 768px tablet, the 901px desktop breakpoint and desktop. Mobile drawer Escape/focus return and automatic closing on desktop resize were verified. Measured final document widths fit the viewport on the tested crop screens; initial farm-tab and cycle-input overflows were repaired and rechecked. Generated evidence is kept outside the source commit in `qa-audit-2026-11-04/`.

## Follow-up scope

This does not complete every priority 2 backlog item. Expected-versus-actual yield comparisons, deep links/real routing, multi-farm plot selection, broader validation/accessibility improvements and the remaining unavailable modules still need their own acceptance checks. MySQL/staging checks and team review remain release gates. No PR was approved or merged by this implementation.
