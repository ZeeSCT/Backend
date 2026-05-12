import { Transform } from "class-transformer";

interface SanitizeStringOptions {
  uppercase?: boolean;
  lowercase?: boolean;
  stripHtml?: boolean;
  collapseWhitespace?: boolean;
}

function sanitizeStringValue(
  value: unknown,
  options: SanitizeStringOptions = {},
) {
  if (typeof value !== "string") {
    return value;
  }

  let sanitized = value
    .normalize("NFKC")
    .replace(/\0/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();

  if (options.stripHtml !== false) {
    sanitized = sanitized.replace(/<\/?[^>]+(>|$)/g, "");
  }

  if (options.collapseWhitespace !== false) {
    sanitized = sanitized.replace(/\s+/g, " ");
  }

  if (options.uppercase) {
    sanitized = sanitized.toUpperCase();
  }

  if (options.lowercase) {
    sanitized = sanitized.toLowerCase();
  }

  return sanitized;
}

export function SanitizeString(options?: SanitizeStringOptions) {
  return Transform(({ value }) => sanitizeStringValue(value, options), {
    toClassOnly: true,
  });
}