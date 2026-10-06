# API Contract — EP-03 (Production Tracking: Cycle Activities)

## Overview
Allows farmers to record, update, view, and delete activities (watering, treatment, fertilizing, weeding) carried out on a crop production cycle.

---

## Base URL
`/api/v1`

---

## Endpoints

### 1. List Cycle Activities
- **Method:** `GET`
- **Path:** `/farmers/{farmerId}/cycles/{cycleId}/activities`
- **Description:** Returns the complete history of interventions carried out on the cycle, ordered by `activityDate` descending.
- **Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "cycleId": 10,
    "activityType": "FERTILIZING",
    "activityDate": "2026-03-15",
    "notes": "Applied NPK 15-15-15 at row roots",
    "createdAt": "2026-03-15T09:30:00",
    "updatedAt": "2026-03-15T09:30:00"
  }
]
```

---

### 2. Get Single Cycle Activity
- **Method:** `GET`
- **Path:** `/farmers/{farmerId}/cycles/{cycleId}/activities/{activityId}`
- **Description:** Returns the details of a single activity intervention.
- **Success Response (200 OK):**
```json
{
  "id": 1,
  "cycleId": 10,
  "activityType": "WATERING",
  "activityDate": "2026-03-10",
  "notes": "Morning drip irrigation 45 mins",
  "createdAt": "2026-03-10T08:00:00",
  "updatedAt": "2026-03-10T08:00:00"
}
```

---

### 3. Record New Cycle Activity
- **Method:** `POST`
- **Path:** `/farmers/{farmerId}/cycles/{cycleId}/activities`
- **Description:** Records a new intervention on an active cycle.
- **Request Body:**
```json
{
  "activityType": "WEEDING",
  "activityDate": "2026-03-12",
  "notes": "Manual weeding performed between rows 1 through 10."
}
```
- **Validation Rules:**
  - `activityType`: Required. Must be one of `WATERING`, `TREATMENT`, `FERTILIZING`, `WEEDING`.
  - `activityDate`: Required. Must not be a future date (`@PastOrPresent`).
  - `notes`: Optional. Max 1000 characters.
- **Success Response (201 Created):**
```json
{
  "id": 2,
  "cycleId": 10,
  "activityType": "WEEDING",
  "activityDate": "2026-03-12",
  "notes": "Manual weeding performed between rows 1 through 10.",
  "createdAt": "2026-03-12T11:20:00",
  "updatedAt": "2026-03-12T11:20:00"
}
```

---

### 4. Update Existing Activity
- **Method:** `PUT`
- **Path:** `/farmers/{farmerId}/cycles/{cycleId}/activities/{activityId}`
- **Description:** Updates the type, date, or notes of an activity.
- **Success Response (200 OK):**
```json
{
  "id": 2,
  "cycleId": 10,
  "activityType": "WEEDING",
  "activityDate": "2026-03-12",
  "notes": "Updated: Manual weeding completed for all rows 1-20.",
  "createdAt": "2026-03-12T11:20:00",
  "updatedAt": "2026-03-12T14:00:00"
}
```

---

### 5. Delete Activity
- **Method:** `DELETE`
- **Path:** `/farmers/{farmerId}/cycles/{cycleId}/activities/{activityId}`
- **Description:** Permanently deletes an intervention record.
- **Success Response (204 No Content)**

---

## Error Response Format

### 400 Bad Request (Validation failure)
```json
{
  "status": 400,
  "message": "Validation failed",
  "timestamp": "2026-03-12T11:20:00",
  "errors": {
    "activityDate": "Activity date cannot be in the future",
    "activityType": "Activity type is required"
  }
}
```

### 404 Not Found
```json
{
  "status": 404,
  "message": "Cycle not found with id: 10 for farmer: 1",
  "timestamp": "2026-03-12T11:20:00",
  "errors": null
}
```
