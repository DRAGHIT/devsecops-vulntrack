# Chapter 06: REST API Standards & HTTP Status Codes

REST (Representational State Transfer) is the architectural style powering the modern web. In this chapter, we explore how VulnTrack designs clean, predictable, and standards-compliant RESTful APIs.

---

## 1. Core Principles of RESTful Design

1. **Resource-Oriented URIs**: Use nouns, not verbs, to name endpoints:
   - ✅ `POST /api/assets` (Correct)
   - ❌ `POST /api/createNewAsset` (Anti-pattern: mixing RPC with REST)
2. **Standard HTTP Verbs**: Let HTTP methods indicate the action:
   - `GET`: Retrieve resource(s) (Safe & Idempotent)
   - `POST`: Create a new resource (Not idempotent)
   - `PUT`: Replace or update an entire resource (Idempotent)
   - `PATCH`: Partially update a resource's attributes (e.g. status)
   - `DELETE`: Remove a resource (Idempotent)
3. **Appropriate HTTP Status Codes**: Never return `200 OK` with an error message in the JSON body. Always use proper status codes so clients and monitoring tools can accurately gauge system health.

---

## 2. VulnTrack REST API Specification

### Asset Endpoints

| Method | Path | Required Role | Request Body | Status Code | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/assets` | `VIEWER`, `ADMIN` | None | `200 OK` | Retrieves list of all assets with vulnerability counts |
| `GET` | `/api/assets/{id}` | `VIEWER`, `ADMIN` | None | `200 OK` / `404 Not Found` | Retrieves a single asset by its primary key |
| `POST` | `/api/assets` | `ADMIN` | `AssetRequestDto` | `201 Created` / `400 Bad Request` | Registers a new software asset |
| `PUT` | `/api/assets/{id}` | `ADMIN` | `AssetRequestDto` | `200 OK` / `404 Not Found` | Updates an asset's attributes |
| `DELETE` | `/api/assets/{id}` | `ADMIN` | None | `204 No Content` / `404 Not Found` | Deletes an asset and cascades to its findings |

### Vulnerability Endpoints

| Method | Path | Required Role | Parameters | Request Body | Status Code | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/vulnerabilities` | `VIEWER`, `ADMIN` | `?assetId=1&severity=CRITICAL&status=OPEN` | None | `200 OK` | Retrieves findings matching optional query filters |
| `GET` | `/api/vulnerabilities/{id}` | `VIEWER`, `ADMIN` | None | None | `200 OK` / `404 Not Found` | Retrieves a single finding |
| `POST` | `/api/vulnerabilities` | `ADMIN` | None | `VulnerabilityRequestDto` | `201 Created` / `400 Bad Request` | Logs a new vulnerability finding |
| `PATCH` | `/api/vulnerabilities/{id}/status` | `ADMIN` | None | `VulnerabilityStatusUpdateDto` | `200 OK` / `400 Bad Request` | Updates lifecycle status (`OPEN` → `IN_PROGRESS` → `FIXED`) |
| `DELETE` | `/api/vulnerabilities/{id}` | `ADMIN` | None | None | `204 No Content` / `404 Not Found` | Removes a finding record |

### Dashboard Endpoint

| Method | Path | Required Role | Response Body | Status Code | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard` | `VIEWER`, `ADMIN` | `DashboardSummaryDto` | `200 OK` | Aggregated security KPIs and recent findings |

---

## 3. Standardized Error Response Contract

In insecure applications, unhandled exceptions return raw stack traces that leak framework versions, database table names, and internal file paths to attackers.

In VulnTrack, `GlobalExceptionHandler` intercepts all exceptions and returns a consistent, sanitized error schema:

```json
{
  "timestamp": "2026-10-10T11:40:55.340Z",
  "status": 400,
  "error": "Validation Failed",
  "message": "Input payload failed validation constraints",
  "path": "/api/assets",
  "validationErrors": {
    "name": "Asset name is required",
    "type": "Asset type is required",
    "environment": "Environment is required"
  }
}
```

This predictable contract allows the React frontend to cleanly render inline validation alerts directly next to form inputs.
