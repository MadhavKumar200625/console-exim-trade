"use client";

const LOGGER_FLAG = "__consoleApiRequestLoggerInstalled";
const SENSITIVE_FIELD = /password|passwd|otp|token|secret|authorization|cookie|api[_-]?key/i;

function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_FIELD.test(key) ? "[REDACTED]" : redact(item),
    ]),
  );
}

function safeUrl(input) {
  try {
    const url = new URL(typeof input === "string" ? input : input.url, window.location.href);
    if (url.username || url.password) {
      url.username = "[REDACTED]";
      url.password = "[REDACTED]";
    }
    for (const key of url.searchParams.keys()) {
      if (SENSITIVE_FIELD.test(key)) url.searchParams.set(key, "[REDACTED]");
    }
    return url.toString();
  } catch {
    return String(input);
  }
}

async function requestPayload(input, init) {
  let body = init?.body;
  if (body == null && typeof Request !== "undefined" && input instanceof Request) {
    try {
      body = await input.clone().text();
    } catch {
      return "[unavailable]";
    }
  }
  if (body == null) return undefined;
  if (typeof body !== "string") return `[${body.constructor?.name || "non-text body"}]`;

  try {
    return redact(JSON.parse(body));
  } catch {
    if (body.includes("=") && !body.trim().startsWith("<")) {
      const params = new URLSearchParams(body);
      if ([...params.keys()].length) {
        for (const key of params.keys()) {
          if (SENSITIVE_FIELD.test(key)) params.set(key, "[REDACTED]");
        }
        return params.toString();
      }
    }
    return "[non-JSON payload omitted]";
  }
}

if (typeof window !== "undefined" && !window[LOGGER_FLAG]) {
  window[LOGGER_FLAG] = true;
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    const method = (init.method || (input instanceof Request && input.method) || "GET").toUpperCase();
    const url = safeUrl(input);
    const payload = await requestPayload(input, init);
    try {
      const response = await originalFetch(input, init);
      const upstreamEndpoint = response.headers.get("x-upstream-endpoint");
      console.log(
        `${upstreamEndpoint ? "[UPSTREAM API]" : "[API]"} ${method} ${upstreamEndpoint || url}`,
        "Request payload:",
        payload ?? "[none]",
        "Response:",
        response.status,
      );
      return response;
    } catch (error) {
      console.error(`[API] ${method} ${url} Request failed:`, error, "Request payload:", payload ?? "[none]");
      throw error;
    }
  };
}

export default function ApiRequestLogger() {
  return null;
}
