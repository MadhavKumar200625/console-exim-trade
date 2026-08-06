export const DEFAULT_COUNTRY = "India";
export const DEFAULT_DATA_TYPE = "Import";
export const DEFAULT_FROM_DATE = "2010-01-01";
export const DEFAULT_TO_DATE = "2026-12-31";

export const COUNTRIES = [
  "India",
  "USA",
  "China",
  "Germany",
  "Vietnam",
  "Indonesia",
  "Thailand",
  "UAE",
];

export const DATA_TYPES = ["Import", "Export"];
export const MATCH_MODES = ["exact", "prefix", "contains", "suffix"];
export const OPERATORS = ["AND", "OR"];

export const SEARCH_FIELDS = [
  "Import_Country",
  "Export_Country",
  "HS_Code",
  "HS_CODE_Description",
  "Product_Description",
  "Importer_Name",
  "Importer_ID",
  "Exporter_ID",
  "Exporter_Name",
  "Loading_Port",
  "Unloading_Port",
  "Transport_Mode",
  "Unit_Name",
];

export const DEFAULT_COLUMNS = [
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
  "Total_Value_in_USD",
];

export const SORT_FIELDS = [
  "Date",
  "Total_Value_in_USD",
  "Total_Value_in_INR",
  "Total_Value_in_VND",
  "Quantity",
  "HS_Code",
  "Table_Name",
  "Gross_Weight_in_KG",
];

export function labelForField(field) {
  return field
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
