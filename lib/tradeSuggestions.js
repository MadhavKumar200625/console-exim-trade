export function buildSuggestionPayload({ query, type, companyField = "Importer_Name", country, tradeType, from, to }) {
  const filters = {};
  const trimmedQuery = query.trim();

  if (type === "industry") {
    const field = companyField === "Exporter_Name" ? "Exporter_Name" : "Importer_Name";
    filters[field] = trimmedQuery;
    filters[`${field}_mode`] = "contains";
  } else if (/^[0-9]+$/.test(trimmedQuery)) {
    filters.HS_Code = trimmedQuery;
    filters.HS_Code_mode = trimmedQuery.length >= 8 ? "exact" : "prefix";
  } else {
    filters.Product_Description = trimmedQuery;
    filters.Product_Description_mode = "contains";
  }

  const payload = {
    date_range: { from, to },
    columns: [
      "HS_Code",
      "Product_Description",
      "HS_CODE_Description",
      "Importer_Name",
      "Exporter_Name",
    ],
    filters,
    sort: { field: "Date", order: "desc" },
    pagination: { limit: 20, offset: 0 },
  };

  if (country) {
    payload.Table_Name = `${country}_${tradeType === "import" ? "Import" : "Export"}`;
  } else {
    payload.global = true;
  }

  return payload;
}

function getRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  for (const key of ["data", "results", "rows", "items", "records"]) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  if (payload.data && typeof payload.data === "object") return getRows(payload.data);
  return [];
}

export function getTradeSuggestions(payload, query, type, companyField = "Importer_Name") {
  const loweredQuery = query.trim().toLowerCase();
  const values = [];

  for (const row of getRows(payload)) {
    const hsCode = row.HS_Code || row.HS_CODE || row.hs_code;
    const product = row.Product_Description || row.HS_CODE_Description || row.product_description;
    const importer = row.Importer_Name || row.importer_name;
    const exporter = row.Exporter_Name || row.exporter_name;

    if (type === "hscode" && hsCode) {
      values.push(product ? `${hsCode} - ${product}` : String(hsCode));
    }

    const candidateValues = type === "industry"
      ? [companyField === "Exporter_Name" ? exporter : importer]
      : [product, importer, exporter, hsCode];
    for (const value of candidateValues) {
      if (value && String(value).toLowerCase().includes(loweredQuery)) values.push(String(value));
    }
  }

  return [...new Set(values)].slice(0, 10);
}
