import "server-only";
import SearchConsole from "./SearchConsole";

function readParam(params, key, fallback = "") {
  const value = params?.[key];
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

function getRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  for (const key of ["data", "results", "rows", "items", "records"]) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  if (payload.data && typeof payload.data === "object") {
    return getRows(payload.data);
  }

  return [];
}

function uniqueSuggestions(rows, query, type) {
  const loweredQuery = query.toLowerCase();
  const values = [];

  rows.forEach((row) => {
    const hsCode = row.HS_Code || row.HS_CODE || row.hs_code;
    const product =
      row.Product_Description ||
      row.HS_CODE_Description ||
      row.product_description;
    const importer = row.Importer_Name || row.importer_name;
    const exporter = row.Exporter_Name || row.exporter_name;

    if (type === "hscode" && hsCode) {
      values.push(product ? `${hsCode} - ${product}` : String(hsCode));
    }

    [product, importer, exporter, hsCode].forEach((value) => {
      if (!value) return;
      const label = String(value);
      if (label.toLowerCase().includes(loweredQuery)) {
        values.push(label);
      }
    });
  });

  return [...new Set(values)].slice(0, 10);
}

async function fetchSuggestions(params) {
  const query = readParam(params, "suggestQuery").trim();
  if (query.length < 2) return [];

  const country = readParam(params, "suggestCountry", "");
  const tradeType = readParam(params, "suggestTradeType", "export");
  const type = readParam(params, "suggestType", "hscode");
  const from = readParam(params, "suggestFrom", "2010-01-01");
  const to = readParam(params, "suggestTo", "2026-12-31");
  const baseUrl = process.env.TRADES_API_BASE_URL;

  if (!baseUrl) return [];
  const endpoint = `${baseUrl.replace(/\/$/, "")}/api/v1/trades/search`;

  const filters = {};

  if (type === "industry") {
    const companyField = readParam(params, "suggestCompanyField") === "Exporter_Name" ? "Exporter_Name" : "Importer_Name";
    filters[companyField] = query;
    filters[`${companyField}_mode`] = "contains";
  } else if (/^[0-9]+$/.test(query)) {
    filters.HS_Code = query;
    filters.HS_Code_mode = query.length >= 8 ? "exact" : "prefix";
  } else {
    filters.Product_Description = query;
    filters.Product_Description_mode = "contains";
  }

  const payload = {
    date_range: {
      from,
      to,
    },
    columns: [
      "HS_Code",
      "Product_Description",
      "HS_CODE_Description",
      "Importer_Name",
      "Exporter_Name",
    ],
    filters,
    sort: {
      field: "Date",
      order: "desc",
    },
    pagination: {
      limit: 20,
      offset: 0,
    },
  };

  if (country) {
    payload.Table_Name = `${country}_${tradeType === "import" ? "Import" : "Export"}`;
  } else {
    payload.global = true;
  }

  try {
    const response = await fetch(
      endpoint,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
    );

    if (!response.ok) return [];

    const data = await response.json();
    return uniqueSuggestions(getRows(data), query, type);
  } catch {
    return [];
  }
}

export default async function TradeSearchSuggestionProvider({ searchParams }) {
  const suggestions = await fetchSuggestions(searchParams);

  // trades/report is intentionally disabled for now because it slows page SSR.
  // Re-enable by fetching the report here and passing it into SearchConsole.

  return (
    <SearchConsole
      initialSuggestions={suggestions}
      initialSuggestionQuery={readParam(searchParams, "suggestQuery")}
    />
  );
}
