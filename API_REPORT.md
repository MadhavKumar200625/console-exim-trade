# Project API Report

**Project:** Console Exim Trade web application  
**Framework:** Next.js App Router  
**Scope:** API routes and integrations found in the repository source on 22 October 2026.

This report covers the first-party `/api` routes, their browser/server callers, the upstream trade-data service, and database/email integrations. Payload shapes below reflect fields explicitly constructed or consumed by this code. The upstream service's full schema is not present in this repository, so proxy routes pass through caller payloads without validation or transformation.

## 1. API inventory

All first-party routes are same-origin JSON endpoints. Unless stated otherwise, requests and responses use `application/json`. Protected routes require the `console_session` cookie; the proxy rejects unauthenticated API requests with `401 { "message": "Authentication required." }`.

| Method | Local endpoint | Purpose | Authentication |
|---|---|---|---|
| POST | `/api/auth/login` | Verify password and start OTP login | Public |
| POST | `/api/auth/verify-otp` | Verify OTP and create session | Public |
| POST | `/api/auth/logout` | Clear session cookies | Public |
| GET | `/api/user/me` | Current profile and usage | Required |
| POST | `/api/user/change-password` | Change password | Required |
| GET | `/api/user/dashboard` | Dashboard usage, downloads, favorites | Required |
| GET, POST | `/api/user/downloads` | List downloads / record a download | Required |
| GET | `/api/user/subscriptions` | Active data subscriptions | Required |
| GET, POST | `/api/user/workspace` | List / save favorite search tables | Required |
| GET | `/api/user/table-logs` | Available database table log metadata | Required |
| POST | `/api/trades/search` | Search trade records; logs search | Required |
| POST | `/api/trades/filters` | Retrieve facet/filter values | Required |
| POST | `/api/trades/summary` | Trade summary | Required |
| POST | `/api/trades/report` | Grouped report | Required |
| POST | `/api/trades/trends/monthly` | Monthly trend report | Required |
| POST | `/api/trades/aggregations/importers` | Importer aggregation | Required |
| POST | `/api/trades/aggregations/suppliers` | Supplier aggregation | Required |

`/api/trades/aggregations/[type]` accepts only `importers` and `suppliers`; other values return 404.

## 2. Authentication APIs

### `POST /api/auth/login`

**Caller:** `app/login/page.js`  
**Request:**

```json
{ "email": "user@example.com", "password": "string" }
```

Email is trimmed and lowercased before looking up an active user. On success, a six-digit OTP is stored as a hash in a short-lived pending-login cookie and sent by email when SMTP is configured.

**Success (200):**

```json
{
  "message": "OTP sent to your email.",
  "otpRequired": true,
  "emailConfigured": true
}
```

When SMTP is unavailable, response includes `devOtp` and reports that the OTP was generated. Errors: 400 for missing credentials, 401 for invalid login.

### `POST /api/auth/verify-otp`

**Caller:** `app/login/page.js`  
**Request:** `{ "otp": "123456" }`  
**Success (200):** `{ "user": { "masterId": number, "userId": number, "email": string, "name": string, "companyName": string } }`

Errors: 401 when pending OTP is expired/missing or does not match. Success creates the session cookie and removes the pending cookie.

### `POST /api/auth/logout`

**Caller:** `components/Header.js`  
**Request:** no body. **Success:** `{ "ok": true }`. Clears both session and pending-login cookies.

## 3. User and workspace APIs

All user endpoints below use the session's master/user IDs to scope database queries; clients do not send those IDs.

### `GET /api/user/me`

**Callers:** `components/Header.js`, `app/user-profile/page.js`  
**Response:** `{ "user": { "masterId", "userId", "name", "mobile", "companyName", "countryName", "email" }, "usage": { "configured", "search": { "used", "total", "dailyLimit" }, "downloads": { "used", "total" } }, "session": { ... } }`.

When SQL is not configured, profile and usage fallback objects are returned with `configured: false`.

### `POST /api/user/change-password`

**Caller:** `app/user-profile/page.js`  
**Request:** `{ "oldPassword": "string", "newPassword": "minimum 8 chars" }`  
**Success:** `{ "changed": true }`. Returns 400 for missing/short values and 503 if SQL is not configured. Password values are converted to the app's legacy SHA-256-derived representation before an update query.

### `GET /api/user/dashboard`

**Caller:** `app/page.js`  
**Response:** `{ "usage": Usage, "downloads": Download[], "favorites": WorkspaceItem[] }`. Returns up to four recent downloads and four workspace entries.

### `GET /api/user/downloads`

**Caller:** `app/mydownloads/page.js`  
**Response:** `{ "usage": Usage, "downloads": Download[] }`. Returns up to 100 rows.

### `POST /api/user/downloads`

**Caller:** `app/search/SearchConsole.js` before generating the CSV in the browser. The API records the download; the file itself is generated client-side and is not uploaded.

**Request:** The trade search payload (see [Trade search payload](#trade-search-payload)) plus:

```json
{
  "category": "Data",
  "fileName": "India-import-search",
  "count": 25
}
```

`count` falls back to `rows.length`, then `pagination.limit`, then zero. `data_id` / `dataId` are optionally accepted; otherwise the server chooses an active subscription's data ID.

**Response:** `{ "configured": boolean, "downloaded": boolean }`.

### `GET /api/user/subscriptions`

**Caller:** `app/subscription/page.js`  
**Response:** `{ "configured": boolean, "subscriptions": [{ "country", "isoCode", "direction", "dataType", "dataRef", "coverage", "pointsPerRecord", "fromDate", "toDate" }] }`.

### `GET /api/user/workspace`

**Caller:** `app/workspace/page.js`  
**Response:** `{ "configured": boolean, "workspaces": [{ "id", "name", "fields", "startDate", "endDate", "comment" }] }`.

### `POST /api/user/workspace`

**Caller:** `app/search/SearchConsole.js`  
**Request:** Trade search payload plus `name` (optional). Name fallback order is `name`, `query`, product description filter, HS code filter, then `Saved table`. Server stores selected `columns`, `date_range`, and `filters` into favorite metadata.

**Response:** `{ "configured": boolean, "saved": boolean }`.

### `GET /api/user/table-logs`

**Caller:** No direct browser fetch found in the source scan.  
**Response:** `{ "tables": userDbTableLog }`, a static list imported from `lib/tableLog.js`.

## 4. Trade API payloads and endpoints

Every local trade endpoint requires a session and forwards JSON with `POST` to the configured trade service base URL. The server appends `/api/v1/trades/...`, sends `Content-Type: application/json`, disables caching, and returns the upstream JSON/status. Configuration is read only from the server-side `TRADES_API_BASE_URL` environment variable.

Common error behavior: the upstream HTTP status is preserved; network/JSON errors generally become 502. Missing service configuration returns a local message (typically 200 with null demo data for search/filters/report/summary, but 503 for trends and aggregations).

### Trade search payload

Built by `SearchConsole.buildSearchPayload` for `/api/trades/search` and reused by save/download requests:

```json
{
  "date_range": { "from": "2010-01-01", "to": "2026-12-31" },
  "columns": ["Date", "HS_Code", "Product_Description"],
  "filters": {
    "HS_Code": "12345678",
    "HS_Code_mode": "exact",
    "Importer_Name": "Example Buyer",
    "Importer_Name_mode": "contains",
    "Quantity_min": 10,
    "Quantity_max": 100
  },
  "sort": { "field": "Date", "order": "desc" },
  "pagination": { "limit": 25, "offset": 0 },
  "Table_Name": "India_Import"
}
```

`filters` is omitted when empty. For global queries, `Table_Name` is replaced with `"global": true`. Available search fields include `Import_Country`, `Export_Country`, `HS_Code`, `HS_CODE_Description`, `Product_Description`, `Importer_Name`, `Importer_ID`, `Exporter_ID`, `Exporter_Name`, `Loading_Port`, `Unloading_Port`, `Transport_Mode`, and `Unit_Name`. Filter values can be strings, arrays for multi-value selections, or numeric range companions (`<field>_min`, `<field>_max`). Match modes used by the UI: `exact`, `prefix`, `contains`, `suffix`. Numeric HS queries use `prefix` until length eight, then `exact`; text searches use `contains`.

**Upstream:** `POST {TRADES_API_BASE_URL}/api/v1/trades/search`  
**Response:** upstream JSON pass-through. UI reads row arrays under a top-level array or common keys `data`, `results`, `rows`, `items`, or `records`; total count is read from supported total metadata.

### Search suggestions (server-side call)

`app/search/TradeSearchSuggestionProvider.js` calls the same upstream search endpoint directly during page rendering; it is not a local `/api` route and does not require a session in this function. Query params are `suggestQuery` (at least two chars), optional `suggestCountry`, `suggestTradeType` (`import`/`export`), `suggestType` (`hscode`/`industry`), `suggestFrom`, and `suggestTo`.

Payload:

```json
{
  "date_range": { "from": "2010-01-01", "to": "2026-12-31" },
  "columns": ["HS_Code", "Product_Description", "HS_CODE_Description", "Importer_Name", "Exporter_Name"],
  "filters": { "Product_Description": "steel", "Product_Description_mode": "contains" },
  "sort": { "field": "Date", "order": "desc" },
  "pagination": { "limit": 20, "offset": 0 },
  "global": true
}
```

Country scope replaces `global` with `Table_Name` (for example `India_Export`). Numeric query sets `HS_Code` with `prefix` or `exact`; `suggestType=hscode` affects result label selection.

### Trade filters

**Local/upstream:** `POST /api/trades/filters` → `/api/v1/trades/filters`. Payload variants:

```json
{
  "date_range": { "from": "2010-01-01", "to": "2026-12-31" },
  "facets": ["Exporter_Name"],
  "include_counts": true,
  "filters": { "HS_Code": "1234", "HS_Code_mode": "prefix" },
  "Table_Name": "India_Import"
}
```

Facet columns are requested on demand using the selected field. Company country resolution sends `{ "global": true, "date_range": ..., "facets": ["Table_Name"], "filters": { "Importer_Name": "...", "Importer_Name_mode": "exact" }, "include_counts": true }` (or exporter field by role).

### Trade summary

**Local/upstream:** `POST /api/trades/summary` → `/api/v1/trades/summary`. Search page submits the same base search payload, including dates, filters, and scope; the request builder may include the search columns/sort/pagination. Company profile submits a scoped object with `Table_Name` or `global` and an exact importer/exporter filter. Upstream response is passed through; consumers look for summary in `data.summary`, `summary`, or `data`.

### Trade report

**Local/upstream:** `POST /api/trades/report` → `/api/v1/trades/report`. Report body extends the shared date/filter/scope base with:

```json
{ "group_by": "Export_Country", "metric": "Total_Value_in_USD", "limit": 100, "offset": 0 }
```

Other observed dimensions include `HS_Code`, `Month`, `Importer_Name`, `Exporter_Name`, `Import_Country`, `Loading_Port`, and `Unloading_Port`; observed metrics include `Total_Value_in_USD` and `shipment_count`. Company profile uses `shipment_count` and limits 1, 10, 20, or 100. Comparison tree adds exact partner name in `filters`.

### Monthly trends

**Local/upstream:** `POST /api/trades/trends/monthly` → `/api/v1/trades/trends/monthly`. Payload is the date/filter/scope base plus `group_by` and `metric`; some callers also set `limit: 100`, `offset: 0`. Visual reports use `Total_Value_in_USD` with groupings `HS_Code`, `Month`, `Country`, and trade counterpart name. The report-by view uses a selected grouping and metric.

### Importer/supplier aggregations

**Local/upstream:** `POST /api/trades/aggregations/importers` or `/suppliers` → matching `/api/v1/trades/aggregations/{type}`. Body:

```json
{
  "date_range": { "from": "2010-01-01", "to": "2026-12-31" },
  "filters": { "Product_Description": "steel", "Product_Description_mode": "contains" },
  "limit": 50,
  "offset": 0,
  "Table_Name": "India_Import"
}
```

Global requests use `global: true` in place of `Table_Name`; empty `filters` is omitted.

## 5. Data and messaging integrations

### Microsoft SQL Server

The API routes access SQL Server through `mssql` in `lib/db.js`, `lib/userDb.js`, and `app/api/user/change-password/route.js`. Connection settings live in `lib/sqlConnection.js`; this report intentionally omits credentials. Database operations support password lookup/update, profile, search/download usage, download history, workspace favorites, subscriptions, search logging, and download logging. A number of user routes return `configured: false` with empty/fallback results when configuration is absent.

### SMTP email

`lib/email.js` uses Nodemailer SMTP for OTP delivery. Host, port, TLS mode, username/password, and sender are configured in `lib/emailConfig.js`. The message contains the six-digit OTP and states a ten-minute expiry. If SMTP settings are incomplete, login still returns a development OTP in its JSON response.

## 6. Other outbound URLs

- `SearchConsole.js` creates a Google search URL (`https://www.google.com/search?q=...`) for company-name navigation. This is a browser navigation, not an application API integration.
- A static account-card image is referenced from `https://console.eximtradedata.com/images/account-card.svg`.

## 7. Implementation notes

- Trade proxy requests use `cache: "no-store"` and JSON pass-through. There is no common request schema validator evident in these routes.
- Trade request payloads are not written to application logs or the search usage counter. The usage counter stores an empty query value only.
- The upstream service base URL is server-only and is not returned in response headers.
- SQL and SMTP credentials are configuration concerns, and should be managed outside source control (environment/secret management) rather than embedded in tracked source files.

