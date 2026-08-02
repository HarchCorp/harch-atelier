// ═══════════════════════════════════════════════════════════════
//  COMPREHENSIVE VALIDATION LIBRARY
//
//  Schema-based validation for all API inputs, form data, and
//  database operations. Supports nested objects, arrays, custom
//  validators, async validation, and conditional rules.
// ═══════════════════════════════════════════════════════════════

// ─── TYPES ─────────────────────────────────────────────────────

export type FieldType = "string" | "number" | "boolean" | "date" | "email" | "url" | "uuid" | "phone" | "array" | "object" | "enum" | "regex";

export interface FieldSchema {
  name: string;
  type: FieldType;
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: string[];
  default?: unknown;
  label?: string;
  description?: string;
  custom?: (value: unknown) => string | null;
  sanitize?: (value: unknown) => unknown;
}

export interface ObjectSchema {
  fields: FieldSchema[];
  additionalProperties?: boolean;
}

export interface ValidationRule {
  field: string;
  rule: string;
  value?: unknown;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  sanitized?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

// ─── BUILT-IN VALIDATORS ───────────────────────────────────────

export const Validators = {
  isString: (v: unknown): boolean => typeof v === "string",
  isNumber: (v: unknown): boolean => typeof v === "number" && !isNaN(v),
  isBoolean: (v: unknown): boolean => typeof v === "boolean",
  isDate: (v: unknown): boolean => {
    if (v instanceof Date) return !isNaN(v.getTime());
    if (typeof v === "string") return !isNaN(Date.parse(v));
    return false;
  },
  isEmail: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  },
  isUrl: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    try {
      new URL(v);
      return true;
    } catch {
      return false;
    }
  },
  isUuid: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
  },
  isCuid: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    return /^c[a-z0-9]{24}$/i.test(v);
  },
  isPhone: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    return /^\+?[1-9]\d{1,14}$/.test(v);
  },
  isE164: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    return /^\+[1-9]\d{1,14}$/.test(v);
  },
  isISIN: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    return /^[A-Z]{2}[A-Z0-9]{9}\d$/.test(v);
  },
  isTicker: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    return /^[A-Z]{2,5}$/.test(v);
  },
  isHexColor: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
  },
  isSlug: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
  },
  isAlphanumeric: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    return /^[a-zA-Z0-9]+$/.test(v);
  },
  isNumeric: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    return /^\d+$/.test(v);
  },
  isAlpha: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    return /^[a-zA-Z]+$/.test(v);
  },
  isJSON: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    try {
      JSON.parse(v);
      return true;
    } catch {
      return false;
    }
  },
  isBase64: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    return /^[A-Za-z0-9+/]*={0,2}$/.test(v);
  },
  isIPAddress: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(v) || /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(v);
  },
  isMACAddress: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    return /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(v);
  },
  isMIMEType: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    return /^[a-zA-Z]+\/[a-zA-Z0-9.+-]+$/.test(v);
  },
  isISODate: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(v);
  },
  isTimezone: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    try {
      Intl.DateTimeFormat("en-US", { timeZone: v });
      return true;
    } catch {
      return false;
    }
  },
  isCurrency: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    return /^(USD|EUR|GBP|JPY|CHF|CAD|AUD|MAD|AED|SAR|ZAR|NGN|EGP|KES|GHS|XOF|XAF)$/.test(v);
  },
  isLocale: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    return /^[a-z]{2}-[A-Z]{2}$/.test(v);
  },
  isSemver: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    return /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/.test(v);
  },
  isJWT: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    const parts = v.split(".");
    return parts.length === 3 && parts.every(p => p.length > 0);
  },
  isHex: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    return /^[0-9a-fA-F]+$/.test(v);
  },
  isSha256: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    return /^[0-9a-fA-F]{64}$/.test(v);
  },
  isMd5: (v: unknown): boolean => {
    if (typeof v !== "string") return false;
    return /^[0-9a-fA-F]{32}$/.test(v);
  },
  isLatitude: (v: unknown): boolean => {
    if (typeof v !== "number") return false;
    return v >= -90 && v <= 90;
  },
  isLongitude: (v: unknown): boolean => {
    if (typeof v !== "number") return false;
    return v >= -180 && v <= 180;
  },
  isPositive: (v: unknown): boolean => typeof v === "number" && v > 0,
  isNegative: (v: unknown): boolean => typeof v === "number" && v < 0,
  isNonNegative: (v: unknown): boolean => typeof v === "number" && v >= 0,
  isNonPositive: (v: unknown): boolean => typeof v === "number" && v <= 0,
  isInteger: (v: unknown): boolean => typeof v === "number" && Number.isInteger(v),
  isFloat: (v: unknown): boolean => typeof v === "number" && !Number.isInteger(v),
  isFinite: (v: unknown): boolean => typeof v === "number" && Number.isFinite(v),
  isInRange: (v: unknown, min: number, max: number): boolean =>
    typeof v === "number" && v >= min && v <= max,
  isLength: (v: unknown, len: number): boolean =>
    typeof v === "string" && v.length === len,
  isMinLength: (v: unknown, min: number): boolean =>
    typeof v === "string" && v.length >= min,
  isMaxLength: (v: unknown, max: number): boolean =>
    typeof v === "string" && v.length <= max,
  isInEnum: (v: unknown, values: string[]): boolean =>
    typeof v === "string" && values.includes(v),
  matchesPattern: (v: unknown, pattern: string): boolean => {
    if (typeof v !== "string") return false;
    return new RegExp(pattern).test(v);
  },
  isArrayOf: (v: unknown, itemValidator: (item: unknown) => boolean): boolean => {
    if (!Array.isArray(v)) return false;
    return v.every(itemValidator);
  },
  isObjectWithKeys: (v: unknown, keys: string[]): boolean => {
    if (typeof v !== "object" || v === null) return false;
    return keys.every(k => k in v);
  },
  isNonEmpty: (v: unknown): boolean => {
    if (typeof v === "string") return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "object" && v !== null) return Object.keys(v).length > 0;
    return false;
  },
  isNullOrUndefined: (v: unknown): boolean => v === null || v === undefined,
  isDefined: (v: unknown): boolean => v !== undefined,
  isNotNull: (v: unknown): boolean => v !== null,
};

// ─── SANITIZERS ────────────────────────────────────────────────

export const Sanitizers = {
  toString: (v: unknown): string => String(v),
  toInteger: (v: unknown): number => parseInt(String(v), 10) || 0,
  toFloat: (v: unknown): number => parseFloat(String(v)) || 0,
  toBoolean: (v: unknown): boolean => {
    if (typeof v === "boolean") return v;
    if (typeof v === "string") return v === "true" || v === "1" || v === "yes";
    if (typeof v === "number") return v !== 0;
    return false;
  },
  toDate: (v: unknown): Date | null => {
    if (v instanceof Date) return v;
    if (typeof v === "string") {
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof v === "number") {
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  },
  trim: (v: unknown): string => typeof v === "string" ? v.trim() : String(v).trim(),
  toLowerCase: (v: unknown): string => typeof v === "string" ? v.toLowerCase() : String(v).toLowerCase(),
  toUpperCase: (v: unknown): string => typeof v === "string" ? v.toUpperCase() : String(v).toUpperCase(),
  toSlug: (v: unknown): string => {
    const s = typeof v === "string" ? v : String(v);
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  },
  removeHtmlTags: (v: unknown): string => {
    const s = typeof v === "string" ? v : String(v);
    return s.replace(/<[^>]*>/g, "");
  },
  escapeHtml: (v: unknown): string => {
    const s = typeof v === "string" ? v : String(v);
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },
  stripWhitespace: (v: unknown): string => {
    const s = typeof v === "string" ? v : String(v);
    return s.replace(/\s+/g, "");
  },
  collapseWhitespace: (v: unknown): string => {
    const s = typeof v === "string" ? v : String(v);
    return s.replace(/\s+/g, " ").trim();
  },
  truncate: (v: unknown, length: number): string => {
    const s = typeof v === "string" ? v : String(v);
    return s.length > length ? s.slice(0, length - 1) + "…" : s;
  },
  padStart: (v: unknown, length: number, char: string): string => {
    const s = typeof v === "string" ? v : String(v);
    return s.padStart(length, char);
  },
  padEnd: (v: unknown, length: number, char: string): string => {
    const s = typeof v === "string" ? v : String(v);
    return s.padEnd(length, char);
  },
  toCamelCase: (v: unknown): string => {
    const s = typeof v === "string" ? v : String(v);
    return s.replace(/[-_](.)/g, (_, c) => c.toUpperCase());
  },
  toKebabCase: (v: unknown): string => {
    const s = typeof v === "string" ? v : String(v);
    return s.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  },
  toSnakeCase: (v: unknown): string => {
    const s = typeof v === "string" ? v : String(v);
    return s.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
  },
  toPascalCase: (v: unknown): string => {
    const s = typeof v === "string" ? v : String(v);
    return s.replace(/(^|[-_])(.)/g, (_, __, c) => c.toUpperCase());
  },
  removeSpecialChars: (v: unknown): string => {
    const s = typeof v === "string" ? v : String(v);
    return s.replace(/[^a-zA-Z0-9\s]/g, "");
  },
  removeNumbers: (v: unknown): string => {
    const s = typeof v === "string" ? v : String(v);
    return s.replace(/\d/g, "");
  },
  removeEmojis: (v: unknown): string => {
    const s = typeof v === "string" ? v : String(v);
    return s.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "");
  },
  normalizeUrl: (v: unknown): string => {
    const s = typeof v === "string" ? v : String(v);
    if (!s) return s;
    if (!/^https?:\/\//.test(s)) return `https://${s}`;
    return s;
  },
  normalizeEmail: (v: unknown): string => {
    const s = typeof v === "string" ? v : String(v);
    return s.trim().toLowerCase();
  },
  normalizePhone: (v: unknown): string => {
    const s = typeof v === "string" ? v : String(v);
    let cleaned = s.replace(/[\s\-\(\)\.]/g, "");
    if (!cleaned.startsWith("+") && cleaned.startsWith("0")) {
      cleaned = "+212" + cleaned.slice(1);
    }
    if (!cleaned.startsWith("+")) {
      cleaned = "+" + cleaned;
    }
    return cleaned;
  },
  roundTo: (v: unknown, decimals: number): number => {
    const n = typeof v === "number" ? v : parseFloat(String(v));
    const factor = Math.pow(10, decimals);
    return Math.round(n * factor) / factor;
  },
  clamp: (v: unknown, min: number, max: number): number => {
    const n = typeof v === "number" ? v : parseFloat(String(v));
    return Math.max(min, Math.min(max, n));
  },
  toArray: (v: unknown): unknown[] => {
    if (Array.isArray(v)) return v;
    if (v === null || v === undefined) return [];
    return [v];
  },
  toObject: (v: unknown): Record<string, unknown> => {
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      return v as Record<string, unknown>;
    }
    if (typeof v === "string") {
      try {
        return JSON.parse(v);
      } catch {
        return {};
      }
    }
    return {};
  },
};

// ─── SCHEMA VALIDATION ─────────────────────────────────────────

export function validateField(value: unknown, schema: FieldSchema): ValidationError | null {
  const { name, type, required, min, max, minLength, maxLength, pattern, enum: enumValues, custom } = schema;

  // Check required
  if (value === undefined || value === null || value === "") {
    if (required) {
      return { field: name, message: `${schema.label || name} is required`, code: "REQUIRED", value };
    }
    return null;
  }

  // Type validation
  switch (type) {
    case "string":
      if (typeof value !== "string") {
        return { field: name, message: `${schema.label || name} must be a string`, code: "TYPE_ERROR", value };
      }
      if (minLength !== undefined && value.length < minLength) {
        return { field: name, message: `${schema.label || name} must be at least ${minLength} characters`, code: "MIN_LENGTH", value };
      }
      if (maxLength !== undefined && value.length > maxLength) {
        return { field: name, message: `${schema.label || name} must be at most ${maxLength} characters`, code: "MAX_LENGTH", value };
      }
      if (pattern && !new RegExp(pattern).test(value)) {
        return { field: name, message: `${schema.label || name} format is invalid`, code: "PATTERN", value };
      }
      break;

    case "number":
      if (typeof value !== "number" || isNaN(value)) {
        return { field: name, message: `${schema.label || name} must be a number`, code: "TYPE_ERROR", value };
      }
      if (min !== undefined && value < min) {
        return { field: name, message: `${schema.label || name} must be at least ${min}`, code: "MIN", value };
      }
      if (max !== undefined && value > max) {
        return { field: name, message: `${schema.label || name} must be at most ${max}`, code: "MAX", value };
      }
      break;

    case "boolean":
      if (typeof value !== "boolean") {
        return { field: name, message: `${schema.label || name} must be a boolean`, code: "TYPE_ERROR", value };
      }
      break;

    case "date":
      if (!Validators.isDate(value)) {
        return { field: name, message: `${schema.label || name} must be a valid date`, code: "TYPE_ERROR", value };
      }
      break;

    case "email":
      if (!Validators.isEmail(value)) {
        return { field: name, message: `${schema.label || name} must be a valid email`, code: "EMAIL", value };
      }
      break;

    case "url":
      if (!Validators.isUrl(value)) {
        return { field: name, message: `${schema.label || name} must be a valid URL`, code: "URL", value };
      }
      break;

    case "uuid":
      if (!Validators.isUuid(value) && !Validators.isCuid(value)) {
        return { field: name, message: `${schema.label || name} must be a valid UUID`, code: "UUID", value };
      }
      break;

    case "phone":
      if (!Validators.isPhone(value)) {
        return { field: name, message: `${schema.label || name} must be a valid phone number`, code: "PHONE", value };
      }
      break;

    case "enum":
      if (!enumValues || !enumValues.includes(String(value))) {
        return { field: name, message: `${schema.label || name} must be one of: ${enumValues?.join(", ")}`, code: "ENUM", value };
      }
      break;

    case "regex":
      if (typeof value !== "string" || (pattern && !new RegExp(pattern).test(value))) {
        return { field: name, message: `${schema.label || name} format is invalid`, code: "REGEX", value };
      }
      break;

    case "array":
      if (!Array.isArray(value)) {
        return { field: name, message: `${schema.label || name} must be an array`, code: "TYPE_ERROR", value };
      }
      if (min !== undefined && value.length < min) {
        return { field: name, message: `${schema.label || name} must have at least ${min} items`, code: "MIN_ITEMS", value };
      }
      if (max !== undefined && value.length > max) {
        return { field: name, message: `${schema.label || name} must have at most ${max} items`, code: "MAX_ITEMS", value };
      }
      break;

    case "object":
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return { field: name, message: `${schema.label || name} must be an object`, code: "TYPE_ERROR", value };
      }
      break;
  }

  // Custom validator
  if (custom) {
    const customError = custom(value);
    if (customError) {
      return { field: name, message: customError, code: "CUSTOM", value };
    }
  }

  return null;
}

export function validateObject(data: Record<string, unknown>, schema: ObjectSchema): ValidationResult {
  const errors: ValidationError[] = [];
  const sanitized: Record<string, unknown> = {};

  for (const fieldSchema of schema.fields) {
    const value = data[fieldSchema.name];
    const error = validateField(value, fieldSchema);

    if (error) {
      errors.push(error);
    } else {
      // Apply default if value is undefined
      if (value === undefined && fieldSchema.default !== undefined) {
        sanitized[fieldSchema.name] = fieldSchema.default;
      } else if (value !== undefined && value !== null) {
        // Apply sanitizer if defined
        if (fieldSchema.sanitize) {
          sanitized[fieldSchema.name] = fieldSchema.sanitize(value);
        } else {
          sanitized[fieldSchema.name] = value;
        }
      }
    }
  }

  // Check for unexpected properties
  if (!schema.additionalProperties) {
    const allowedFields = schema.fields.map(f => f.name);
    for (const key of Object.keys(data)) {
      if (!allowedFields.includes(key)) {
        errors.push({ field: key, message: `Unexpected property: ${key}`, code: "UNEXPECTED", value: data[key] });
      }
    }
  }

  return { valid: errors.length === 0, errors, sanitized };
}

// ─── PREDEFINED SCHEMAS ────────────────────────────────────────

export const CompanySchema: ObjectSchema = {
  fields: [
    { name: "slug", type: "string", required: true, minLength: 2, maxLength: 100, pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$", label: "Slug" },
    { name: "name", type: "string", required: true, minLength: 2, maxLength: 200, label: "Company name" },
    { name: "aliases", type: "array", required: false, max: 20, label: "Aliases" },
    { name: "sector", type: "string", required: true, minLength: 2, maxLength: 100, label: "Sector" },
    { name: "industry", type: "string", required: false, maxLength: 100, label: "Industry" },
    { name: "ticker", type: "string", required: false, maxLength: 10, pattern: "^[A-Z]{2,5}$", label: "Ticker" },
    { name: "isin", type: "string", required: false, pattern: "^[A-Z]{2}[A-Z0-9]{9}\\d$", label: "ISIN" },
    { name: "headquarters", type: "string", required: false, maxLength: 100, label: "Headquarters" },
    { name: "website", type: "url", required: false, label: "Website" },
    { name: "description", type: "string", required: false, maxLength: 2000, label: "Description" },
    { name: "foundedYear", type: "number", required: false, min: 1800, max: 2030, label: "Founded year" },
  ],
};

export const ArticleSchema: ObjectSchema = {
  fields: [
    { name: "title", type: "string", required: true, minLength: 5, maxLength: 500, label: "Title" },
    { name: "url", type: "url", required: true, label: "URL" },
    { name: "source", type: "string", required: true, minLength: 2, maxLength: 100, label: "Source" },
    { name: "sourceType", type: "enum", required: false, enum: ["media", "regulatory", "market", "financial", "social", "ai"], label: "Source type" },
    { name: "publishedAt", type: "date", required: false, label: "Published date" },
    { name: "language", type: "enum", required: false, enum: ["fr", "ar", "en", "darija", "es", "de", "it", "pt", "zh", "ja"], label: "Language" },
    { name: "sentimentLabel", type: "enum", required: false, enum: ["positive", "neutral", "negative"], label: "Sentiment" },
    { name: "sentimentScore", type: "number", required: false, min: -1, max: 1, label: "Sentiment score" },
    { name: "relevanceScore", type: "number", required: false, min: 0, max: 1, label: "Relevance score" },
    { name: "content", type: "string", required: false, maxLength: 100000, label: "Content" },
  ],
};

export const UserSchema: ObjectSchema = {
  fields: [
    { name: "email", type: "email", required: true, label: "Email" },
    { name: "name", type: "string", required: false, minLength: 2, maxLength: 100, label: "Name" },
    { name: "role", type: "enum", required: false, enum: ["user", "admin", "company-admin"], label: "Role" },
    { name: "accountType", type: "enum", required: true, enum: ["brand-monitor", "market-competitor", "investment-bank", "harch-alpha"], label: "Account type" },
    { name: "jobTitle", type: "string", required: false, maxLength: 100, label: "Job title" },
    { name: "whatsappNumber", type: "phone", required: false, label: "WhatsApp number" },
  ],
};

export const AlertSchema: ObjectSchema = {
  fields: [
    { name: "type", type: "enum", required: true, enum: ["sentiment_drop", "risk_breach", "volume_spike", "ai_visibility", "regulatory", "price_threshold", "sanctions_match", "entity_mention", "trend_detection", "anomaly"], label: "Alert type" },
    { name: "severity", type: "enum", required: true, enum: ["info", "low", "medium", "high", "critical"], label: "Severity" },
    { name: "title", type: "string", required: true, minLength: 3, maxLength: 200, label: "Title" },
    { name: "body", type: "string", required: true, minLength: 3, maxLength: 5000, label: "Body" },
    { name: "companyId", type: "uuid", required: false, label: "Company ID" },
    { name: "articleId", type: "uuid", required: false, label: "Article ID" },
  ],
};

export const ApiKeySchema: ObjectSchema = {
  fields: [
    { name: "name", type: "string", required: true, minLength: 3, maxLength: 50, label: "API key name" },
    { name: "permissions", type: "array", required: false, max: 20, label: "Permissions" },
    { name: "expiresAt", type: "date", required: false, label: "Expiry date" },
  ],
};

export const WebhookSchema: ObjectSchema = {
  fields: [
    { name: "url", type: "url", required: true, label: "Webhook URL" },
    { name: "events", type: "array", required: true, min: 1, max: 50, label: "Events" },
  ],
};

export const DossierSchema: ObjectSchema = {
  fields: [
    { name: "companyName", type: "string", required: true, minLength: 2, maxLength: 200, label: "Company name" },
    { name: "status", type: "enum", required: false, enum: ["draft", "generating", "ready", "failed"], label: "Status" },
  ],
};

export const PortfolioSchema: ObjectSchema = {
  fields: [
    { name: "name", type: "string", required: true, minLength: 2, maxLength: 100, label: "Portfolio name" },
  ],
};

export const ScreeningSchema: ObjectSchema = {
  fields: [
    { name: "entity", type: "string", required: true, minLength: 2, maxLength: 500, label: "Entity name" },
    { name: "lists", type: "array", required: false, max: 3, label: "Sanctions lists" },
    { name: "fuzzy", type: "boolean", required: false, label: "Fuzzy matching" },
    { name: "threshold", type: "number", required: false, min: 0, max: 1, label: "Match threshold" },
  ],
};

export const ReportSchema: ObjectSchema = {
  fields: [
    { name: "title", type: "string", required: true, minLength: 5, maxLength: 200, label: "Report title" },
    { name: "period", type: "string", required: true, pattern: "^\\d{4}-\\d{2}$", label: "Report period" },
    { name: "summary", type: "string", required: true, minLength: 10, maxLength: 5000, label: "Summary" },
    { name: "companyId", type: "uuid", required: false, label: "Company ID" },
  ],
};

export const BriefingSchema: ObjectSchema = {
  fields: [
    { name: "userId", type: "uuid", required: true, label: "User ID" },
    { name: "date", type: "date", required: true, label: "Date" },
    { name: "deliveryChannel", type: "enum", required: false, enum: ["dashboard", "email", "whatsapp", "push", "webhook", "slack", "teams"], label: "Delivery channel" },
  ],
};

// ─── QUERY PARAM VALIDATION ────────────────────────────────────

export function validatePaginationParams(query: URLSearchParams): {
  page: number;
  limit: number;
  sort?: string;
  order?: "asc" | "desc";
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];
  let page = 1;
  let limit = 20;
  let sort: string | undefined;
  let order: "asc" | "desc" | undefined;

  const pageStr = query.get("page");
  if (pageStr) {
    page = parseInt(pageStr, 10);
    if (isNaN(page) || page < 1) {
      errors.push({ field: "page", message: "Page must be a positive integer", code: "INVALID_PAGE" });
      page = 1;
    }
  }

  const limitStr = query.get("limit");
  if (limitStr) {
    limit = parseInt(limitStr, 10);
    if (isNaN(limit) || limit < 1) {
      errors.push({ field: "limit", message: "Limit must be a positive integer", code: "INVALID_LIMIT" });
      limit = 20;
    }
    if (limit > 100) {
      errors.push({ field: "limit", message: "Limit must be at most 100", code: "MAX_LIMIT" });
      limit = 100;
    }
  }

  const sortStr = query.get("sort");
  if (sortStr) {
    sort = sortStr;
  }

  const orderStr = query.get("order");
  if (orderStr) {
    if (orderStr !== "asc" && orderStr !== "desc") {
      errors.push({ field: "order", message: "Order must be 'asc' or 'desc'", code: "INVALID_ORDER" });
    } else {
      order = orderStr;
    }
  }

  return { page, limit, sort, order, errors };
}

export function validateDateRange(
  from?: string,
  to?: string
): { from?: Date; to?: Date; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  let fromDate: Date | undefined;
  let toDate: Date | undefined;

  if (from) {
    fromDate = new Date(from);
    if (isNaN(fromDate.getTime())) {
      errors.push({ field: "from", message: "Invalid 'from' date", code: "INVALID_DATE" });
      fromDate = undefined;
    }
  }

  if (to) {
    toDate = new Date(to);
    if (isNaN(toDate.getTime())) {
      errors.push({ field: "to", message: "Invalid 'to' date", code: "INVALID_DATE" });
      toDate = undefined;
    }
  }

  if (fromDate && toDate && fromDate > toDate) {
    errors.push({ field: "dateRange", message: "'from' date must be before 'to' date", code: "INVALID_RANGE" });
  }

  return { from: fromDate, to: toDate, errors };
}

// ─── FORM VALIDATION HELPER ────────────────────────────────────

export function createFormValidator<T extends Record<string, unknown>>(
  schema: ObjectSchema
) {
  return (data: T): ValidationResult => {
    return validateObject(data, schema);
  };
}

// ─── BATCH VALIDATION ──────────────────────────────────────────

export function validateBatch(
  items: Record<string, unknown>[],
  schema: ObjectSchema
): Array<{ index: number; result: ValidationResult }> {
  return items.map((item, index) => ({
    index,
    result: validateObject(item, schema),
  }));
}

// ─── CONDITIONAL VALIDATION ────────────────────────────────────

export function validateConditional(
  data: Record<string, unknown>,
  condition: (data: Record<string, unknown>) => boolean,
  schema: ObjectSchema
): ValidationResult {
  if (condition(data)) {
    return validateObject(data, schema);
  }
  return { valid: true, errors: [] };
}

// ─── ASYNC VALIDATION ──────────────────────────────────────────

export async function validateAsync(
  value: unknown,
  asyncValidator: (value: unknown) => Promise<string | null>
): Promise<ValidationError | null> {
  const error = await asyncValidator(value);
  if (error) {
    return { field: "async", message: error, code: "ASYNC", value };
  }
  return null;
}

// ─── ERROR FORMATTING ──────────────────────────────────────────

export function formatErrors(errors: ValidationError[]): Record<string, string> {
  const formatted: Record<string, string> = {};
  for (const error of errors) {
    if (!formatted[error.field]) {
      formatted[error.field] = error.message;
    }
  }
  return formatted;
}

export function errorsToApiErrors(errors: ValidationError[]): Array<{ field: string; message: string }> {
  return errors.map(e => ({ field: e.field, message: e.message }));
}

export function hasError(errors: ValidationError[], field: string): boolean {
  return errors.some(e => e.field === field);
}

export function getError(errors: ValidationError[], field: string): ValidationError | undefined {
  return errors.find(e => e.field === field);
}

export function getErrorsForField(errors: ValidationError[], field: string): ValidationError[] {
  return errors.filter(e => e.field === field);
}

export function countErrors(errors: ValidationError[]): number {
  return errors.length;
}

export function summarizeErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return "No errors";
  if (errors.length === 1) return errors[0].message;
  return `${errors.length} validation errors found`;
}

// ─── VALIDATION MIDDLEWARE HELPER ──────────────────────────────

export function createValidationMiddleware(schema: ObjectSchema) {
  return (data: Record<string, unknown>): { ok: true; data: Record<string, unknown> } | { ok: false; errors: ValidationError[] } => {
    const result = validateObject(data, schema);
    if (result.valid) {
      return { ok: true, data: result.sanitized || {} };
    }
    return { ok: false, errors: result.errors };
  };
}
