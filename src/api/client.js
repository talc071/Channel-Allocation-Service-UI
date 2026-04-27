/**
 * Thin fetch wrapper that:
 *   - prefixes every path with VITE_API_BASE_URL (empty string in dev so the
 *     Vite proxy handles the call)
 *   - serializes JSON bodies and parses JSON responses
 *   - normalizes FastAPI error shapes into a single ApiError class
 *
 * Keeping this isolated means components never touch fetch directly and we
 * have one place to add things like auth headers, retries, or telemetry.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export class ApiError extends Error {
  constructor({ status, message, code, details, fieldErrors }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    // Stable machine-readable error code from the backend envelope (e.g.
    // "cancel_window_expired"). Components branch on this instead of
    // substring matching the message.
    this.code = code ?? null;
    // Optional structured context the backend attaches (channel, timestamps,
    // etc.). Useful for richer UI messages.
    this.details = details ?? null;
    // FastAPI 422 returns detail = [{ loc, msg, type }, ...]; we flatten
    // those to a { fieldName: message } map for easy form binding.
    this.fieldErrors = fieldErrors ?? {};
  }
}

/**
 * Normalizes both error shapes we see from the backend:
 *   1) Custom envelope: { error_code, message, details }
 *   2) FastAPI default: { detail: string | [{ loc, msg, type }, ...] }
 */
function normalizeErrorPayload(payload) {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    if (payload.error_code || payload.message) {
      return {
        message: payload.message ?? 'Request failed',
        code: payload.error_code ?? null,
        details: payload.details ?? null,
        fieldErrors: {},
      };
    }
    if ('detail' in payload) {
      return parseFastApiDetail(payload.detail);
    }
  }
  return parseFastApiDetail(payload);
}

function parseFastApiDetail(detail) {
  if (typeof detail === 'string') {
    return { message: detail, code: null, details: null, fieldErrors: {} };
  }
  if (Array.isArray(detail)) {
    const fieldErrors = {};
    for (const item of detail) {
      // loc looks like ["body", "platform"]; the field is the last segment.
      const field = Array.isArray(item?.loc) ? item.loc[item.loc.length - 1] : null;
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = item.msg ?? 'Invalid value';
      }
    }
    const message = detail[0]?.msg ?? 'Validation failed';
    return { message, code: null, details: null, fieldErrors };
  }
  return { message: 'Request failed', code: null, details: null, fieldErrors: {} };
}

async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function request(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (cause) {
    // Network failure (server down, DNS, CORS preflight blocked, etc.)
    throw new ApiError({
      status: 0,
      message: 'Could not reach the server. Is the API running?',
    });
  }

  const payload = await safeJson(response);

  if (!response.ok) {
    const { message, code, details, fieldErrors } = normalizeErrorPayload(payload);
    throw new ApiError({
      status: response.status,
      message: message || `Request failed with status ${response.status}`,
      code,
      details,
      fieldErrors,
    });
  }

  return payload;
}
