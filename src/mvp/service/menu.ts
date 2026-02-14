import type { HeaderMenuGroupInput } from "../view/header.config";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeEndpoint = (value: string): string | null => {
  try {
    const resolved = new URL(value, window.location.origin);
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") return null;
    return resolved.toString();
  } catch {
    return null;
  }
};

const parseMenuResponse = (value: unknown): HeaderMenuGroupInput[] | null => {
  if (Array.isArray(value)) {
    return value as HeaderMenuGroupInput[];
  }
  if (!isRecord(value)) return null;
  if (!Array.isArray(value.menu)) return null;
  return value.menu as HeaderMenuGroupInput[];
};

export const fetchHeaderMenuFromApi = async (
  endpoint: string,
  timeoutMs = 3500
): Promise<HeaderMenuGroupInput[] | null> => {
  const url = normalizeEndpoint(endpoint);
  if (!url) return null;

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeoutId =
    controller !== null
      ? window.setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "same-origin",
      signal: controller?.signal,
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as unknown;
    return parseMenuResponse(payload);
  } catch {
    return null;
  } finally {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
  }
};
