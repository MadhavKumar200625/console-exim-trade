# External API Report: Trade Data Service

**Configuration:** `TRADES_API_BASE_URL` (server-side environment variable; do not expose it as `NEXT_PUBLIC_*`)
**Base path appended by the application:** `/api/v1/trades`
**Protocol:** JSON over HTTP(S), `POST` requests
**Scope:** This report documents only the external trade-data API calls made using the configured trade service base URL. It excludes this project's local `/api` routes, SQL Server, SMTP, and browser navigations.

The service base URL is read from environment configuration. Its configured value is intentionally not copied into this report. Examples below show representative request bodies formed by the application; values depend on the selected search and report state. The upstream service schema is not defined in this repository, and the application forwards these JSON bodies without schema transformation.

## Endpoint inventory

| HTTP method | External endpoint | Use |
|---|---|---|
| POST | `{TRADES_API_BASE_URL}/api/v1/trades/search` | Trade search results and server-rendered suggestions |
| POST | `{TRADES_API_BASE_URL}/api/v1/trades/filters` | Facet values, counts, and table/country discovery |
| POST | `{TRADES_API_BASE_URL}/api/v1/trades/summary` | Summary totals for the current search/company scope |
| POST | `{TRADES_API_BASE_URL}/api/v1/trades/report` | Grouped dimensions and metrics |
| POST | `{TRADES_API_BASE_URL}/api/v1/trades/trends/monthly` | Monthly grouped metrics and visual trend reports |
| POST | `{TRADES_API_BASE_URL}/api/v1/trades/aggregations/importers` | Importer aggregation results |
| POST | `{TRADES_API_BASE_URL}/api/v1/trades/aggregations/suppliers` | Supplier aggregation results |

All requests use `Content-Type: application/json`. Requests made by local route handlers disable caching (`cache: "no-store"`). The server-side suggestion provider also uses `no-store`.

## Shared payload vocabulary

The search UI constructs these common fields:

| Field | Meaning / observed values |
|---|---|
| `date_range` | `{ "from": "YYYY-MM-DD", "to": "YYYY-MM-DD" }` |
| `Table_Name` | Country and direction, e.g. `India_Import` or `India_Export` |
| `global` | `true` when no country table is selected; used instead of `Table_Name` |
| `filters` | Optional field-value conditions, match modes, and numeric bounds |
| `columns` | Requested data fields, present in search and suggestion requests |
| `sort` | `{ "field": "Date", "order": "desc" }` in search requests |
| `pagination` | `{ "limit": number, "offset": number }` in search requests |
| `facets` | Field names for which distinct values/counts are requested |
| `include_counts` | Boolean used with facets |
| `group_by` | Report dimension, e.g. `HS_Code`, `Month`, `Export_Country`, `Importer_Name` |
| `metric` | Aggregated value, observed as `Total_Value_in_USD` or `shipment_count` |
| `limit`, `offset` | Flat pagination fields used by report/aggregation callers |

Observed filter fields include `Import_Country`, `Export_Country`, `HS_Code`, `HS_CODE_Description`, `Product_Description`, `Importer_Name`, `Importer_ID`, `Exporter_ID`, `Exporter_Name`, `Loading_Port`, `Unloading_Port`, `Transport_Mode`, and `Unit_Name`. Text filters can have a companion `<field>_mode` with `exact`, `prefix`, `contains`, or `suffix`. Numeric ranges use `<field>_min` and `<field>_max`. Multi-select filter values are arrays.

## 1. Trade search

**Endpoint:** `POST {TRADES_API_BASE_URL}/api/v1/trades/search`
**Call paths:** `/api/trades/search` local proxy and `app/search/TradeSearchSuggestionProvider.js` (direct server-side suggestion request).

### Main search example

```json
{
  "date_range": {
    "from": "2010-01-01",
    "to": "2026-12-31"
  },
  "columns": [
    "Date",
    "HS_Code",
    "Product_Description",
    "Exporter_Name",
    "Export_Country",
    "Importer_Name",
    "Import_Country",
    "Quantity",
    "Unit_Name",
    "Unit_Value_in_USD",
    "Currency_Name",
    "Loading_Port",
    "Unloading_Port",
    "Transport_Mode",
    "Total_Value_in_USD"
  ],
  "filters": {
    "HS_Code": "12345678",
    "HS_Code_mode": "exact",
    "Importer_Name": "Example Buyer",
    "Importer_Name_mode": "contains",
    "Quantity_min": 10,
    "Quantity_max": 100
  },
  "sort": {
    "field": "Date",
    "order": "desc"
  },
  "pagination": {
    "limit": 25,
    "offset": 0
  },
  "Table_Name": "India_Import"
}
```

`filters` is omitted if there are no active filters. For global data, the request uses `"global": true` instead of `Table_Name`. UI-generated text search filters use `Product_Description` with `contains`, or `HS_Code` with `prefix` for shorter numeric queries and `exact` for codes of at least eight digits. Advanced filters can add values for any configured search field; selected column filters send arrays with an `exact` mode. Numeric column filters send `_min` and/or `_max` values.

### Suggestion search example

Suggestions call the same external endpoint, using a narrower field list and fixed 20-row pagination:

```json
{
  "date_range": {
    "from": "2010-01-01",
    "to": "2026-12-31"
  },
  "columns": [
    "HS_Code",
    "Product_Description",
    "HS_CODE_Description",
    "Importer_Name",
    "Exporter_Name"
  ],
  "filters": {
    "Product_Description": "steel",
    "Product_Description_mode": "contains"
  },
  "sort": {
    "field": "Date",
    "order": "desc"
  },
  "pagination": {
    "limit": 20,
    "offset": 0
  },
  "global": true
}
```

For a numeric suggestion query, `filters` contains `HS_Code` and its `prefix` or `exact` mode. For a country-scoped suggestion, `global` is replaced by a `Table_Name`, such as `India_Export`. Suggestion URL parameters are `suggestQuery`, `suggestCountry`, `suggestTradeType`, `suggestType`, `suggestFrom`, and `suggestTo`; defaults are export, hscode, 2010-01-01, and 2026-12-31. Queries shorter than two characters do not call the API.

## 2. Filter facets

**Endpoint:** `POST {TRADES_API_BASE_URL}/api/v1/trades/filters`

### Load values for a selected column

```json
{
  "date_range": {
    "from": "2010-01-01",
    "to": "2026-12-31"
  },
  "facets": ["Exporter_Name"],
  "include_counts": true,
  "filters": {
    "HS_Code": "1234",
    "HS_Code_mode": "prefix"
  },
  "Table_Name": "India_Import"
}
```

The facet field is the API field corresponding to the selected table column. Empty `filters` is omitted. Global scope uses `global: true` instead of `Table_Name`.

### Resolve a company's country/table from global results

```json
{
  "global": true,
  "date_range": {
    "from": "2010-01-01",
    "to": "2026-12-31"
  },
  "facets": ["Table_Name"],
  "filters": {
    "Importer_Name": "Example Buyer Ltd",
    "Importer_Name_mode": "exact"
  },
  "include_counts": true
}
```

For supplier profiles, the filter field is `Exporter_Name` with the same exact-match mode.

## 3. Trade summary

**Endpoint:** `POST {TRADES_API_BASE_URL}/api/v1/trades/summary`

The search screen submits its current search payload (the same date, columns, filters, sort, pagination, and country/global scope shown in the main search example). A company profile submits a compact scope/filter body, for example:

```json
{
  "Table_Name": "India_Import",
  "filters": {
    "Importer_Name": "Example Buyer Ltd",
    "Importer_Name_mode": "exact"
  }
}
```

For a global company profile, `Table_Name` is replaced by `"global": true`. The summary proxy forwards the submitted body without adding fields.

## 4. Grouped trade report

**Endpoint:** `POST {TRADES_API_BASE_URL}/api/v1/trades/report`

The base is a date/filter/scope object, extended with grouping and metric fields:

```json
{
  "date_range": {
    "from": "2010-01-01",
    "to": "2026-12-31"
  },
  "filters": {
    "Importer_Name": "Example Buyer Ltd",
    "Importer_Name_mode": "exact"
  },
  "Table_Name": "India_Import",
  "group_by": "Exporter_Name",
  "metric": "shipment_count",
  "limit": 100,
  "offset": 0
}
```

Observed dimensions include `HS_Code`, `Month`, `Export_Country`, `Import_Country`, `Importer_Name`, `Exporter_Name`, `Loading_Port`, and `Unloading_Port`. Observed metrics are `shipment_count` and `Total_Value_in_USD`. UI callers use limits of 1, 10, 20, or 100; offset is provided by report-by requests and may be omitted by company/analytics requests.

### Comparison-tree child report variant

```json
{
  "global": true,
  "filters": {
    "Exporter_Name": "Example Supplier",
    "Exporter_Name_mode": "exact"
  },
  "group_by": "Importer_Name",
  "metric": "shipment_count",
  "limit": 10
}
```

The role determines whether the exact partner filter is `Importer_Name` or `Exporter_Name`, and which company field is grouped.

## 5. Monthly trends

**Endpoint:** `POST {TRADES_API_BASE_URL}/api/v1/trades/trends/monthly`

Trend request body adds `group_by` and `metric` to a date/filter/scope base. Some callers also include `limit: 100` and `offset: 0`:

```json
{
  "date_range": {
    "from": "2010-01-01",
    "to": "2026-12-31"
  },
  "filters": {
    "HS_Code": "1234",
    "HS_Code_mode": "prefix"
  },
  "global": true,
  "group_by": "HS_Code",
  "metric": "Total_Value_in_USD",
  "limit": 100,
  "offset": 0
}
```

Visual report callers issue separate requests using `group_by` values `HS_Code`, `Month`, `Country`, and the relevant importer/exporter name, with `metric: "Total_Value_in_USD"`. Report-by UI uses its selected group and metric. Trend scope may use `Table_Name` instead of `global`.

## 6. Importer and supplier aggregations

**Endpoints:**

- `POST {TRADES_API_BASE_URL}/api/v1/trades/aggregations/importers`
- `POST {TRADES_API_BASE_URL}/api/v1/trades/aggregations/suppliers`

Both endpoints use the same observed request shape; `type` selects the endpoint:

```json
{
  "date_range": {
    "from": "2010-01-01",
    "to": "2026-12-31"
  },
  "filters": {
    "Product_Description": "steel",
    "Product_Description_mode": "contains"
  },
  "limit": 50,
  "offset": 0,
  "Table_Name": "India_Import"
}
```

Global scope replaces `Table_Name` with `global: true`; an empty `filters` object is omitted. The UI requests 50 rows per page and sends the current offset.

## Request and response handling

- The local trade proxy obtains the JSON body from its caller and forwards that body to the matching external endpoint. It does not add authentication headers or transform the payload in the source reviewed.
- Successful and upstream error response bodies are passed back as JSON with the upstream status code.
- Missing base URL prevents the call. Proxy handlers return local fallback/error responses in that case.
- No external response schema or formal OpenAPI specification is included in this repository. Response fields beyond the row/facet/summary values consumed by the UI cannot be confirmed from local source alone.
