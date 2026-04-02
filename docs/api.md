# API Documentation

Base URL: `http://localhost:3000`

All protected endpoints require:
```
Authorization: Bearer <token>
```

All responses follow the shape:
```json
{ "success": true, "message": "...", "data": { ... } }
```

---

## Auth

### POST /api/auth/register
Register a new user.

**Body:**
```json
{ "name": "string", "email": "string", "password": "string (min 8, 1 uppercase, 1 number)", "role": "viewer|analyst|admin" }
```
**Response:** `{ token, user }` — `201`

---

### POST /api/auth/login
Login and receive a JWT.

**Body:**
```json
{ "email": "string", "password": "string" }
```
**Response:** `{ token, user }` — `200`

---

## User Management

> All endpoints require `Authorization: Bearer <token>`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| `GET` | `/api/users/me` | all | Retrieve the current user's profile |
| `GET` | `/api/users` | admin | List all users |
| `PATCH` | `/api/users/:id` | admin | Update a user's role or status |

### PATCH /api/users/:id
Update a user's role or active status.
**Body:**
```json
{ "role": "viewer|analyst|admin", "status": "active|inactive" }
```

---

## Financial Records

> All endpoints require `Authorization: Bearer <token>`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| `GET` | `/api/records` | viewer, analyst, admin | List records (filterable + paginated) |
| `POST` | `/api/records` | admin | Create a record |
| `PATCH` | `/api/records/:id` | admin | Update a record |
| `DELETE` | `/api/records/:id` | admin | Delete a record |

### GET /api/records — Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `type` | `income\|expense` | Filter by type |
| `category` | `string` | Partial match on category |
| `dateFrom` | `ISO date` | Start of date range |
| `dateTo` | `ISO date` | End of date range |
| `search` | `string` | Partial match on notes |
| `page` | `number` | Page number (default: 1) |
| `limit` | `number` | Page size (default: 20, max: 100) |

**Example:**
```
GET /api/records?type=expense&category=Rent&page=1&limit=10
```

### POST /api/records Body
```json
{ "amount": 5000, "type": "income", "category": "Salary", "date": "2026-04-01", "notes": "April salary" }
```

---

## Dashboard Analytics

> Requires `Authorization: Bearer <token>`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| `GET` | `/api/dashboard/summary` | all | Total income, expenses, net balance |
| `GET` | `/api/dashboard/recent-transactions` | all | Most recent records |
| `GET` | `/api/dashboard/category-totals` | analyst, admin | Totals grouped by category |
| `GET` | `/api/dashboard/monthly-trends` | analyst, admin | Monthly income/expense for a year |

### GET /api/dashboard/recent-transactions
`?limit=10` (optional)

### GET /api/dashboard/monthly-trends
`?year=2026` (optional, defaults to current year)

---

## Health Check

```
GET /api/health  →  { "success": true, "message": "Finance Dashboard API is running" }
```

---

## Role Matrix

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| GET /api/users/me | ✅ | ✅ | ✅ |
| GET /api/users | ❌ | ❌ | ✅ |
| PATCH /api/users/:id | ❌ | ❌ | ✅ |
| GET records | ❌ | ✅ | ✅ |
| GET summary | ✅ | ✅ | ✅ |
| GET recent transactions | ✅ | ✅ | ✅ |
| GET category totals | ❌ | ✅ | ✅ |
| GET monthly trends | ❌ | ✅ | ✅ |
| POST records | ❌ | ❌ | ✅ |
| PATCH records | ❌ | ❌ | ✅ |
| DELETE records | ❌ | ❌ | ✅ |

---

## Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error |
| 401 | Missing or invalid token |
| 403 | Forbidden — insufficient role |
| 404 | Resource not found |
| 409 | Conflict — duplicate entry |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
