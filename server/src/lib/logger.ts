type LogLevel = "info" | "warn" | "error";
type LogValue = unknown;
export type LogRecord = Record<string, unknown> & { timestamp: string; level: LogLevel; service: string; environment: string; type: string };

const sensitiveKey = /(authorization|cookie|password|secret|signature|token|key)/i;
const pendingDeliveries = new Set<Promise<void>>();

function redactString(value: string) {
  return value
    .replace(/(mongodb(?:\+srv)?:\/\/[^:\s/]+:)[^@\s/]+@/gi, "$1[REDACTED]@")
    .replace(/(bearer\s+)[a-z0-9._~+/=-]+/gi, "$1[REDACTED]");
}

export function sanitizeLogData(value: LogValue, key = "", seen = new WeakSet<object>()): LogValue {
  if (sensitiveKey.test(key)) return "[REDACTED]";
  if (value instanceof Error) return { name: value.name, message: redactString(value.message), stack: value.stack ? redactString(value.stack) : undefined };
  if (typeof value === "string") return redactString(value);
  if (!value || typeof value !== "object") return value;
  if (seen.has(value)) return "[CIRCULAR]";
  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => sanitizeLogData(item, key, seen));
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([entryKey, entryValue]) => [entryKey, sanitizeLogData(entryValue, entryKey, seen)]));
}

export function buildLogRecord(level: LogLevel, type: string, data: Record<string, unknown> = {}, now = new Date()): LogRecord {
  return { timestamp: now.toISOString(), level, service: process.env.LOG_SERVICE || "cognisprint-api", environment: process.env.LOG_ENVIRONMENT || process.env.NODE_ENV || "development", type, ...(sanitizeLogData(data) as Record<string, unknown>) };
}

export async function deliverLogRecord(record: LogRecord, fetcher: typeof fetch = fetch): Promise<void> {
  const url = process.env.LOG_DRAIN_URL;
  if (!url) return;
  const response = await fetcher(url, { method: "POST", headers: { "content-type": "application/json", ...(process.env.LOG_DRAIN_TOKEN ? { authorization: `Bearer ${process.env.LOG_DRAIN_TOKEN}` } : {}) }, body: JSON.stringify(record), signal: AbortSignal.timeout(2_000) });
  if (!response.ok) throw new Error(`Log drain returned HTTP ${response.status}.`);
}

function write(level: LogLevel, type: string, data?: Record<string, unknown>) {
  const record = buildLogRecord(level, type, data);
  const line = JSON.stringify(record);
  if (level === "error") console.error(line); else if (level === "warn") console.warn(line); else console.info(line);
  if (process.env.LOG_DRAIN_URL) {
    const delivery = deliverLogRecord(record).catch((error) => console.warn(JSON.stringify(buildLogRecord("warn", "log_delivery_failed", { message: error instanceof Error ? error.message : "Unknown log delivery failure." })))).finally(() => pendingDeliveries.delete(delivery));
    pendingDeliveries.add(delivery);
  }
  return record;
}

export const logger = {
  info: (type: string, data?: Record<string, unknown>) => write("info", type, data),
  warn: (type: string, data?: Record<string, unknown>) => write("warn", type, data),
  error: (type: string, data?: Record<string, unknown>) => write("error", type, data),
};

export async function flushLogs(timeoutMs = 3_000) {
  if (!pendingDeliveries.size) return;
  await Promise.race([Promise.allSettled([...pendingDeliveries]), new Promise((resolve) => setTimeout(resolve, timeoutMs))]);
}
