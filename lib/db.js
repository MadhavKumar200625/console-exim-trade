import sql from "mssql";
import sqlConfig from "./sqlConnection";

let poolPromise;

export function isSqlConfigured() {
  return Boolean(sqlConfig.user && sqlConfig.password && sqlConfig.server && sqlConfig.database);
}

export async function getSqlPool() {
  if (!isSqlConfigured()) {
    throw new Error("SQL connection is not configured. Fill lib/sqlConnection.js first.");
  }

  if (!poolPromise) {
    poolPromise = sql.connect(sqlConfig);
  }

  return poolPromise;
}

export { sql };

export async function runQuery(buildRequest) {
  const pool = await getSqlPool();
  const request = pool.request();
  return buildRequest(request);
}
