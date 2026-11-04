import { sql, runQuery, isSqlConfigured } from "./db";
import { legacyPasswordHash } from "./session";

function emptyResult(data) {
  return { configured: isSqlConfigured(), ...data };
}

function truncateValue(value, maxLength) {
  const text = String(value || "");
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function compactPayloadForLegacyColumn(payload) {
  const filters = payload.filters || {};
  const importantFilter =
    filters.HS_Code ||
    filters.Product_Description ||
    filters.Importer_Name ||
    filters.Exporter_Name ||
    payload.name ||
    payload.fileName ||
    "search";
  const table = payload.Table_Name || (payload.global ? "global" : "");
  const dateRange = payload.date_range
    ? `${payload.date_range.from || ""}-${payload.date_range.to || ""}`
    : "";

  return truncateValue(
    JSON.stringify({
      table,
      dateRange,
      filter: importantFilter,
      type: payload.category || "Data",
      limit: payload.pagination?.limit || payload.count || "",
    }),
    95,
  );
}

export async function findActiveUserByEmail(email) {
  if (!isSqlConfigured()) {
    return { user: null, debug: { configured: false, found: false } };
  }

  const result = await runQuery((request) =>
    request
      .input("email", sql.NVarChar(320), email)
      .query(`
        SELECT TOP 1
          A.master_id,
          A.account_type,
          A.status AS sub_user_status,
          A.name,
          A.pwd,
          B.pwd AS master_password_hash,
          A.id AS user_id,
          A.email_id,
          A.mobile,
          B.company_name,
          B.status AS master_status,
          B.account_type AS master_account_type,
          B.valid_from,
          B.valid_till,
          CASE WHEN B.id IS NULL THEN 0 ELSE 1 END AS master_exists,
          CASE WHEN B.valid_from <= CONVERT(date, GETDATE()) THEN 1 ELSE 0 END AS valid_from_ok,
          CASE WHEN B.valid_till >= CONVERT(date, GETDATE()) THEN 1 ELSE 0 END AS valid_till_ok
        FROM sub_user A
        LEFT JOIN master_user B ON A.master_id = B.id
        WHERE LOWER(LTRIM(RTRIM(A.email_id))) = @email
        ORDER BY A.id DESC
      `),
  );

  const row = result.recordset?.[0];
  if (!row) {
    return {
      user: null,
      debug: { configured: true, found: false },
    };
  }

  const eligibility = {
    masterExists: Boolean(row.master_exists),
    subUserActive: Number(row.sub_user_status) === 1,
    masterActive: Number(row.master_status) === 1,
    expectedAccountType: String(row.master_account_type || "").trim() === "EX",
    withinValidityDates: Boolean(row.valid_from_ok) && Boolean(row.valid_till_ok),
  };
  const debug = {
    configured: true,
    found: true,
    validFrom: row.valid_from,
    validTill: row.valid_till,
    ...eligibility,
    hasSubUserPassword: Boolean(row.pwd),
    subUserPasswordLength: typeof row.pwd === "string" ? row.pwd.length : null,
    hasMasterPassword: Boolean(row.master_password_hash),
    masterPasswordLength:
      typeof row.master_password_hash === "string" ? row.master_password_hash.length : null,
  };

  if (Object.values(eligibility).some((eligible) => !eligible)) {
    return { user: null, debug };
  }

  return {
    user: {
      masterId: Number(row.master_id),
      userId: Number(row.user_id),
      email: row.email_id,
      name: row.name,
      mobile: row.mobile,
      companyName: row.company_name,
      passwordHash: row.pwd,
      masterPasswordHash: row.master_password_hash,
    },
    debug,
  };
}

export async function verifyUserPassword(email, password) {
  const { user, debug } = await findActiveUserByEmail(email);
  if (!user) return { user: null, debug: { ...debug, eligible: false } };

  const suppliedHash = legacyPasswordHash(password);
  const matches = [user.passwordHash, user.masterPasswordHash].some(
    (storedHash) =>
      typeof storedHash === "string" &&
      storedHash.trim().toUpperCase() === suppliedHash,
  );

  if (!matches) return { user: null, debug: { ...debug, eligible: true, passwordMatched: false } };

  const { passwordHash, masterPasswordHash, ...safeUser } = user;
  return { user: safeUser, debug: { ...debug, eligible: true, passwordMatched: true } };
}

export async function getUserDetails(masterId, userId) {
  if (!isSqlConfigured()) {
    return emptyResult({
      user: {
        masterId,
        userId,
        name: "Console User",
        mobile: "",
        companyName: "",
        countryName: "",
        email: "",
      },
    });
  }

  const result = await runQuery((request) =>
    request
      .input("masterId", sql.Int, masterId)
      .input("userId", sql.Int, userId)
      .query(`
        SELECT TOP 1
          su.name,
          su.mobile,
          mu.company_name,
          mtc.country_name,
          su.email_id
        FROM sub_user su
        INNER JOIN master_user mu ON su.master_id = mu.id
        LEFT JOIN mastertradecountry mtc ON mu.country_code = mtc.id
        WHERE su.master_id = @masterId AND su.id = @userId
      `),
  );

  const row = result.recordset?.[0] || {};
  return emptyResult({
    user: {
      masterId,
      userId,
      name: row.name || "",
      mobile: row.mobile || "",
      companyName: row.company_name || "",
      countryName: row.country_name || "",
      email: row.email_id || "",
    },
  });
}

export async function getUsage(masterId) {
  if (!isSqlConfigured()) {
    return emptyResult({
      search: { used: 0, total: 0, dailyLimit: 0 },
      downloads: { used: 0, total: 0 },
    });
  }

  const [searchResult, downloadResult] = await Promise.all([
    runQuery((request) =>
      request.input("masterId", sql.Int, masterId).query(`
        SELECT TOP 1
          daily_search_limit,
          total_search_limit,
          (SELECT COALESCE(COUNT(search_type), 0) FROM search_log WHERE master_id = @masterId) AS total_search
        FROM users_data_limitation
        WHERE master_id = @masterId
      `),
    ),
    runQuery((request) =>
      request.input("masterId", sql.Int, masterId).query(`
        SELECT
          COALESCE(SUM(a.no_of_records * b.ex_download_point), 0) AS used_points,
          (SELECT COALESCE(SUM(total_download_points), 0)
           FROM users_download_points
           WHERE master_id = @masterId) AS total_points
        FROM my_downloads a
        LEFT JOIN data_availability b ON a.data_id = b.id
        WHERE a.master_id = @masterId
      `),
    ),
  ]);

  const search = searchResult.recordset?.[0] || {};
  const downloads = downloadResult.recordset?.[0] || {};

  return emptyResult({
    search: {
      used: Number(search.total_search || 0),
      total: Number(search.total_search_limit || 0),
      dailyLimit: Number(search.daily_search_limit || 0),
    },
    downloads: {
      used: Number(downloads.used_points || 0),
      total: Number(downloads.total_points || 0),
    },
  });
}

export async function getRecentDownloads(masterId, userId, limit = 20) {
  if (!isSqlConfigured()) return emptyResult({ downloads: [] });

  const result = await runQuery((request) =>
    request
      .input("masterId", sql.Int, masterId)
      .input("userId", sql.Int, userId)
      .input("limit", sql.Int, limit)
      .query(`
        SELECT TOP (@limit)
          a.id,
          CONCAT(c.country_name, ' ', b.direction, ' ', b.data_type, ' ', b.data_reference, ' Data') AS dataType,
          FORMAT(a.download_date, 'yyyy-MM-dd') AS downloadDate,
          a.category,
          a.no_of_records AS records,
          COALESCE(a.no_of_records * b.ex_download_point, 0) AS usedPoints,
          a.query
        FROM my_downloads a
        LEFT JOIN data_availability b ON a.data_id = b.id
        LEFT JOIN mastertradecountry c ON b.country = c.id
        WHERE a.master_id = @masterId AND a.user_id = @userId
        ORDER BY a.id DESC
      `),
  );

  return emptyResult({ downloads: result.recordset || [] });
}

export async function getWorkspaceItems(masterId, userId) {
  if (!isSqlConfigured()) return emptyResult({ workspaces: [] });

  const result = await runQuery((request) =>
    request
      .input("masterId", sql.Int, masterId)
      .input("userId", sql.Int, userId)
      .query(`
        SELECT
          id,
          fav_name AS name,
          str_fl AS fields,
          FORMAT(from_date, 'yyyy-MM-dd') AS startDate,
          FORMAT(to_date, 'yyyy-MM-dd') AS endDate,
          comment
        FROM my_favourite
        WHERE master_id = @masterId AND user_id = @userId AND is_deleted = '0'
        ORDER BY id DESC
      `),
  );

  return emptyResult({ workspaces: result.recordset || [] });
}

export async function getSubscriptions(masterId) {
  if (!isSqlConfigured()) return emptyResult({ subscriptions: [] });

  const result = await runQuery((request) =>
    request.input("masterId", sql.Int, masterId).query(`
      SELECT DISTINCT
        c.country_name AS country,
        c.iso_code_alpha2 AS isoCode,
        b.direction,
        b.data_type AS dataType,
        b.data_reference AS dataRef,
        b.data_coverage AS coverage,
        b.ex_download_point AS pointsPerRecord,
        FORMAT(a.from_date, 'yyyy-MM-dd') AS fromDate,
        FORMAT(a.to_date, 'yyyy-MM-dd') AS toDate
      FROM user_data_availability a
      INNER JOIN data_availability b ON a.Data_Id = b.id
      INNER JOIN mastertradecountry c ON b.country = c.id
      WHERE a.Master_Id = @masterId AND a.Status = 1 AND a.Is_Delete = 0
      ORDER BY c.country_name
    `),
  );

  return emptyResult({ subscriptions: result.recordset || [] });
}

export async function logSearch(masterId, userId, payload, dbName = "") {
  if (!isSqlConfigured()) return;

  await runQuery((request) =>
    request
      .input("masterId", sql.Int, masterId)
      .input("userId", sql.Int, userId)
      .input("dbName", sql.NVarChar(128), dbName)
      .input("searchType", sql.NVarChar(50), "SearchType")
      .input("searchQuery", sql.NVarChar(sql.MAX), JSON.stringify(payload))
      .query(`
        INSERT INTO search_log (master_id, db_name, search_type, search_query, search_date, user_id)
        VALUES (@masterId, @dbName, @searchType, @searchQuery, GETDATE(), @userId)
      `),
  );
}

async function getFallbackDataId(masterId) {
  const result = await runQuery((request) =>
    request.input("masterId", sql.Int, masterId).query(`
      SELECT TOP 1 Data_Id
      FROM user_data_availability
      WHERE Master_Id = @masterId AND Status = 1 AND Is_Delete = 0
      ORDER BY id DESC
    `),
  );

  return Number(result.recordset?.[0]?.Data_Id || 0);
}

export async function saveSearch(masterId, userId, payload) {
  if (!isSqlConfigured()) return emptyResult({ saved: false });

  const name =
    payload.name ||
    payload.query ||
    payload.filters?.Product_Description ||
    payload.filters?.HS_Code ||
    "Saved table";

  await runQuery((request) =>
    request
      .input("masterId", sql.Int, masterId)
      .input("userId", sql.Int, userId)
      .input("name", sql.NVarChar(250), String(name).slice(0, 250))
      .input("fields", sql.NVarChar(sql.MAX), JSON.stringify(payload.columns || []))
      .input("fromDate", sql.Date, payload.date_range?.from || null)
      .input("toDate", sql.Date, payload.date_range?.to || null)
      .input("comment", sql.NVarChar(sql.MAX), JSON.stringify(payload.filters || {}))
      .query(`
        INSERT INTO my_favourite
          (master_id, user_id, fav_name, str_fl, from_date, to_date, comment, cr_date, is_deleted)
        VALUES
          (@masterId, @userId, @name, @fields, @fromDate, @toDate, @comment, GETDATE(), '0')
      `),
  );

  return emptyResult({ saved: true });
}

export async function deleteWorkspaceItem(masterId, userId, workspaceId) {
  if (!isSqlConfigured()) return emptyResult({ deleted: false });

  const result = await runQuery((request) =>
    request
      .input("masterId", sql.Int, masterId)
      .input("userId", sql.Int, userId)
      .input("workspaceId", sql.Int, workspaceId)
      .query(`
        UPDATE my_favourite
        SET is_deleted = '1'
        WHERE id = @workspaceId AND master_id = @masterId AND user_id = @userId AND is_deleted = '0'
      `),
  );

  return emptyResult({ deleted: Boolean(result.rowsAffected?.[0]) });
}

export async function logDownload(masterId, userId, payload, count) {
  if (!isSqlConfigured()) return emptyResult({ downloaded: false });

  const dataId = Number(payload.data_id || payload.dataId || 0) || await getFallbackDataId(masterId);
  const query = compactPayloadForLegacyColumn(payload);

  await runQuery((request) =>
    request
      .input("masterId", sql.Int, masterId)
      .input("userId", sql.Int, userId)
      .input("category", sql.NVarChar(100), truncateValue(payload.category || "Data", 100))
      .input("fileName", sql.NVarChar(250), truncateValue(payload.fileName || "console-search", 250))
      .input("count", sql.Int, count)
      .input("query", sql.NVarChar(100), query)
      .input("dataId", sql.Int, dataId || null)
      .query(`
        INSERT INTO my_downloads
          (master_id, user_id, search_n_download, category, file_name, no_of_records, download_date, query, data_id)
        VALUES
          (@masterId, @userId, 'download', @category, @fileName, @count, GETDATE(), @query, @dataId)

        INSERT INTO user_wise_download_n_search
          (master_id, user_id, search_n_download, no_of_count, cr_date, data_id)
        VALUES
          (@masterId, @userId, 'download', @count, GETDATE(), @dataId)
      `),
  );

  return emptyResult({ downloaded: true });
}
