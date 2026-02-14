export const getInitials = (value: string) => {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (!parts.length) return "HD";
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
};

export const isExternalHttpHref = (href: string): boolean => {
  if (!/^https?:\/\//i.test(href)) return false;
  try {
    const target = new URL(href);
    if (typeof window === "undefined") return true;
    return target.origin !== window.location.origin;
  } catch {
    return false;
  }
};

export const getSafeImageSrc = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const next = value.trim();
  if (!next) return null;

  // Keep avatar sources strict to avoid unsafe protocols.
  if (/^data:image\//i.test(next)) return next;

  try {
    const baseOrigin =
      typeof window === "undefined" ? "http://localhost" : window.location.origin;
    const resolved = new URL(next, baseOrigin);
    if (resolved.protocol === "http:" || resolved.protocol === "https:") {
      return resolved.toString();
    }
  } catch {
    return null;
  }

  return null;
};
