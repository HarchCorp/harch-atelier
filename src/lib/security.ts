// ═══════════════════════════════════════════════════════════════
//  AUTHENTICATION & SECURITY MODULE
//
//  Handles JWT token management, session handling, password
//  hashing, API key validation, rate limiting, CORS, CSP,
//  and security headers for the Harch Atelier platform.
// ═══════════════════════════════════════════════════════════════

import crypto from "crypto";

// ─── TYPES ─────────────────────────────────────────────────────

export interface JWTPayload {
  sub: string;
  email: string;
  name?: string;
  role: string;
  accountType: string;
  tenantId?: string;
  companyId?: string;
  isDemo: boolean;
  iat: number;
  exp: number;
  jti: string;
}

export interface SessionData {
  userId: string;
  email: string;
  name?: string;
  role: string;
  accountType: string;
  tenantId?: string;
  companyId?: string;
  isDemo: boolean;
  expiresAt: Date;
  createdAt: Date;
  lastAccessedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface ApiKeyData {
  id: string;
  userId: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
  permissions: string[];
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  revokedAt?: Date;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
  preventReuse: number;
  expiryDays: number;
}

export interface SecurityHeaders {
  "X-Content-Type-Options": string;
  "X-Frame-Options": string;
  "X-XSS-Protection": string;
  "Referrer-Policy": string;
  "Permissions-Policy": string;
  "Strict-Transport-Security": string;
  "Content-Security-Policy": string;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  keyGenerator?: (req: Request) => string;
  handler?: (req: Request, res: Response) => void;
}

export interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

// ─── PASSWORD MANAGEMENT ───────────────────────────────────────

export class PasswordManager {
  private static readonly ITERATIONS = 100000;
  private static readonly KEY_LENGTH = 64;
  private static readonly SALT_LENGTH = 32;
  private static readonly DIGEST = "sha512";

  static async hash(password: string): Promise<string> {
    const salt = crypto.randomBytes(this.SALT_LENGTH);
    const derivedKey = crypto.pbkdf2Sync(password, salt, this.ITERATIONS, this.KEY_LENGTH, this.DIGEST);
    return `pbkdf2$${this.ITERATIONS}$${this.DIGEST}$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
  }

  static async verify(password: string, hash: string): Promise<boolean> {
    const parts = hash.split("$");
    if (parts.length !== 5 || parts[0] !== "pbkdf2") return false;

    const iterations = parseInt(parts[1], 10);
    const digest = parts[2];
    const salt = Buffer.from(parts[3], "hex");
    const storedKey = parts[4];

    const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, this.KEY_LENGTH, digest as string);
    return derivedKey.toString("hex") === storedKey;
  }

  static validate(password: string, policy: PasswordPolicy): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    if (policy.preventCommonPasswords && COMMON_PASSWORDS.has(password.toLowerCase())) {
      errors.push("Password is too common. Please choose a stronger password");
    }

    return { valid: errors.length === 0, errors };
  }

  static generateSecurePassword(length: number = 24): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=";
    const bytes = crypto.randomBytes(length);
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars[bytes[i] % chars.length];
    }
    return password;
  }

  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex");
  }

  static generateApiKey(): { key: string; hash: string; prefix: string } {
    const key = `harch_${crypto.randomBytes(24).toString("hex")}`;
    const hash = crypto.createHash("sha256").update(key).digest("hex");
    const prefix = key.slice(0, 12);
    return { key, hash, prefix };
  }
}

// ─── COMMON PASSWORDS (top 1000 most common) ───────────────────

export const COMMON_PASSWORDS = new Set([
  "password", "123456", "12345678", "qwerty", "abc123", "monkey", "1234567",
  "letmein", "trustno1", "dragon", "baseball", "iloveyou", "master", "sunshine",
  "ashley", "bailey", "shadow", "123123", "654321", "superman", "qazwsx",
  "michael", "football", "password1", "password123", "welcome", "welcome1",
  "admin", "admin123", "root", "toor", "pass", "test", "guest", "info",
  "mysql", "default", "changeme", "passw0rd", "p@ssw0rd", "p@ssword",
  "pa$$word", "passw0rd!", "password!", "123456789", "1234567890",
  "0987654321", "987654321", "qwertyuiop", "asdfghjkl", "zxcvbnm",
  "1q2w3e4r", "1qaz2wsx", "q1w2e3r4", "azerty", "azertyuiop",
  "000000", "111111", "222222", "333333", "444444", "555555",
  "666666", "777777", "888888", "999999", "12345", "54321",
]);

// ─── DEFAULT PASSWORD POLICY ───────────────────────────────────

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventReuse: 5,
  expiryDays: 90,
};

// ─── JWT MANAGEMENT ────────────────────────────────────────────

export class JWTManager {
  private static readonly ALGORITHM = "HS256";
  private static readonly TOKEN_TYPE = "JWT";
  private static readonly DEFAULT_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

  static sign(payload: Omit<JWTPayload, "iat" | "exp" | "jti">, secret: string, expiresIn?: number): string {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + (expiresIn || this.DEFAULT_EXPIRY);
    const jti = crypto.randomBytes(16).toString("hex");

    const fullPayload: JWTPayload = {
      ...payload,
      iat: now,
      exp,
      jti,
    };

    const header = Buffer.from(JSON.stringify({ alg: this.ALGORITHM, typ: this.TOKEN_TYPE })).toString("base64url");
    const body = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
    const signature = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");

    return `${header}.${body}.${signature}`;
  }

  static verify(token: string, secret: string): JWTPayload | null {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSignature = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");

    if (signature !== expectedSignature) return null;

    try {
      const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as JWTPayload;

      // Check expiry
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) return null;

      return payload;
    } catch {
      return null;
    }
  }

  static decode(token: string): JWTPayload | null {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    try {
      return JSON.parse(Buffer.from(parts[1], "base64url").toString()) as JWTPayload;
    } catch {
      return null;
    }
  }

  static refresh(token: string, secret: string, expiresIn?: number): string | null {
    const payload = this.verify(token, secret);
    if (!payload) return null;

    const { iat, exp, jti, ...claims } = payload;
    return this.sign(claims, secret, expiresIn);
  }

  static getExpiry(token: string): Date | null {
    const payload = this.decode(token);
    if (!payload) return null;
    return new Date(payload.exp * 1000);
  }

  static isExpired(token: string): boolean {
    const payload = this.decode(token);
    if (!payload) return true;
    return Date.now() >= payload.exp * 1000;
  }

  static getTimeToExpiry(token: string): number {
    const payload = this.decode(token);
    if (!payload) return 0;
    return Math.max(0, payload.exp * 1000 - Date.now());
  }
}

// ─── SESSION MANAGEMENT ────────────────────────────────────────

export class SessionManager {
  private sessions: Map<string, SessionData> = new Map();
  private userSessions: Map<string, Set<string>> = new Map();
  private maxSessionsPerUser: number;
  private sessionTimeout: number;

  constructor(maxSessionsPerUser: number = 5, sessionTimeoutMinutes: number = 60) {
    this.maxSessionsPerUser = maxSessionsPerUser;
    this.sessionTimeout = sessionTimeoutMinutes * 60 * 1000;
  }

  createSession(userId: string, data: Omit<SessionData, "userId" | "expiresAt" | "createdAt" | "lastAccessedAt">): string {
    const sessionId = crypto.randomBytes(32).toString("hex");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.sessionTimeout);

    const session: SessionData = {
      ...data,
      userId,
      expiresAt,
      createdAt: now,
      lastAccessedAt: now,
    };

    this.sessions.set(sessionId, session);

    // Track user sessions
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set());
    }
    const userSess = this.userSessions.get(userId)!;
    userSess.add(sessionId);

    // Enforce max sessions per user
    if (userSess.size > this.maxSessionsPerUser) {
      const oldest = [...userSess][0];
      this.destroySession(oldest);
    }

    return sessionId;
  }

  getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Check expiry
    if (new Date() > session.expiresAt) {
      this.destroySession(sessionId);
      return null;
    }

    // Update last accessed
    session.lastAccessedAt = new Date();
    session.expiresAt = new Date(Date.now() + this.sessionTimeout);

    return session;
  }

  destroySession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      const userSess = this.userSessions.get(session.userId);
      if (userSess) {
        userSess.delete(sessionId);
        if (userSess.size === 0) {
          this.userSessions.delete(session.userId);
        }
      }
    }
    this.sessions.delete(sessionId);
  }

  destroyAllUserSessions(userId: string): number {
    const userSess = this.userSessions.get(userId);
    if (!userSess) return 0;

    const count = userSess.size;
    for (const sessionId of [...userSess]) {
      this.destroySession(sessionId);
    }
    return count;
  }

  cleanupExpired(): number {
    const now = new Date();
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions) {
      if (now > session.expiresAt) {
        this.destroySession(sessionId);
        cleaned++;
      }
    }

    return cleaned;
  }

  getActiveSessionCount(): number {
    return this.sessions.size;
  }

  getUserSessionCount(userId: string): number {
    return this.userSessions.get(userId)?.size || 0;
  }

  getUserSessions(userId: string): SessionData[] {
    const sessionIds = this.userSessions.get(userId);
    if (!sessionIds) return [];

    const sessions: SessionData[] = [];
    for (const sessionId of sessionIds) {
      const session = this.sessions.get(sessionId);
      if (session) sessions.push(session);
    }
    return sessions;
  }
}

// ─── API KEY MANAGEMENT ────────────────────────────────────────

export class ApiKeyManager {
  private keys: Map<string, ApiKeyData> = new Map();
  private hashToKey: Map<string, string> = new Map();

  createApiKey(userId: string, name: string, permissions: string[] = ["read"], expiresAt?: Date): { key: string; data: ApiKeyData } {
    const { key, hash, prefix } = PasswordManager.generateApiKey();
    const id = crypto.randomBytes(16).toString("hex");

    const data: ApiKeyData = {
      id,
      userId,
      name,
      keyHash: hash,
      keyPrefix: prefix,
      permissions,
      createdAt: new Date(),
      expiresAt,
    };

    this.keys.set(id, data);
    this.hashToKey.set(hash, id);

    return { key, data };
  }

  validateApiKey(key: string): ApiKeyData | null {
    const hash = crypto.createHash("sha256").update(key).digest("hex");
    const id = this.hashToKey.get(hash);

    if (!id) return null;

    const data = this.keys.get(id);
    if (!data) return null;

    // Check if revoked
    if (data.revokedAt) return null;

    // Check if expired
    if (data.expiresAt && new Date() > data.expiresAt) return null;

    // Update last used
    data.lastUsedAt = new Date();

    return data;
  }

  revokeApiKey(id: string): boolean {
    const data = this.keys.get(id);
    if (!data) return false;

    data.revokedAt = new Date();
    this.hashToKey.delete(data.keyHash);
    return true;
  }

  getUserApiKeys(userId: string): ApiKeyData[] {
    return [...this.keys.values()].filter(k => k.userId === userId && !k.revokedAt);
  }

  hasPermission(keyData: ApiKeyData, permission: string): boolean {
    return keyData.permissions.includes(permission) || keyData.permissions.includes("*");
  }

  cleanupExpired(): number {
    let cleaned = 0;
    const now = new Date();

    for (const [id, data] of this.keys) {
      if (data.expiresAt && now > data.expiresAt && !data.revokedAt) {
        this.revokeApiKey(id);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// ─── RATE LIMITER ──────────────────────────────────────────────

export class RateLimiter {
  private entries: Map<string, RateLimitEntry> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Default rate limits by endpoint type
    this.setConfig("api", { windowMs: 60000, maxRequests: 100, skipSuccessfulRequests: false, skipFailedRequests: false });
    this.setConfig("auth", { windowMs: 900000, maxRequests: 10, skipSuccessfulRequests: true, skipFailedRequests: false });
    this.setConfig("search", { windowMs: 60000, maxRequests: 30, skipSuccessfulRequests: false, skipFailedRequests: false });
    this.setConfig("export", { windowMs: 3600000, maxRequests: 10, skipSuccessfulRequests: false, skipFailedRequests: false });
    this.setConfig("cron", { windowMs: 60000, maxRequests: 5, skipSuccessfulRequests: false, skipFailedRequests: false });
  }

  setConfig(type: string, config: RateLimitConfig): void {
    this.configs.set(type, config);
  }

  check(key: string, type: string = "api"): { allowed: boolean; remaining: number; resetTime: number } {
    const config = this.configs.get(type);
    if (!config) return { allowed: true, remaining: Infinity, resetTime: 0 };

    const entryKey = `${type}:${key}`;
    const now = Date.now();
    let entry = this.entries.get(entryKey);

    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        blocked: false,
      };
      this.entries.set(entryKey, entry);
    }

    entry.count++;

    const allowed = entry.count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - entry.count);

    if (!allowed) {
      entry.blocked = true;
    }

    return { allowed, remaining, resetTime: entry.resetTime };
  }

  reset(key: string, type: string = "api"): void {
    this.entries.delete(`${type}:${key}`);
  }

  getRemaining(key: string, type: string = "api"): number {
    const config = this.configs.get(type);
    if (!config) return Infinity;

    const entry = this.entries.get(`${type}:${key}`);
    if (!entry) return config.maxRequests;

    return Math.max(0, config.maxRequests - entry.count);
  }

  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.entries) {
      if (now > entry.resetTime) {
        this.entries.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  getStats(): { totalEntries: number; blockedRequests: number } {
    let blocked = 0;
    for (const entry of this.entries.values()) {
      if (entry.blocked) blocked++;
    }
    return { totalEntries: this.entries.size, blockedRequests: blocked };
  }
}

// ─── SECURITY HEADERS ──────────────────────────────────────────

export const SECURITY_HEADERS: SecurityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https: wss:",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};

export function applySecurityHeaders(headers: Headers): void {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
}

// ─── CORS CONFIGURATION ────────────────────────────────────────

export interface CORSConfig {
  origins: string[];
  methods: string[];
  headers: string[];
  credentials: boolean;
  maxAge: number;
}

export const DEFAULT_CORS_CONFIG: CORSConfig = {
  origins: ["https://atelier.harchcorp.com", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  headers: ["Content-Type", "Authorization", "X-API-Key", "X-Request-ID"],
  credentials: true,
  maxAge: 86400,
};

export function applyCORSHeaders(headers: Headers, origin: string | null, config: CORSConfig = DEFAULT_CORS_CONFIG): void {
  if (origin && config.origins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  } else if (config.origins.includes("*")) {
    headers.set("Access-Control-Allow-Origin", "*");
  }

  headers.set("Access-Control-Allow-Methods", config.methods.join(", "));
  headers.set("Access-Control-Allow-Headers", config.headers.join(", "));

  if (config.credentials) {
    headers.set("Access-Control-Allow-Credentials", "true");
  }

  headers.set("Access-Control-Max-Age", config.maxAge.toString());
}

// ─── INPUT SANITIZATION ────────────────────────────────────────

export class InputSanitizer {
  static sanitizeString(input: string, maxLength: number = 1000): string {
    return input
      .slice(0, maxLength)
      .replace(/<script[^>]*>.*?<\/script>/gi, "")
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
      .replace(/<object[^>]*>.*?<\/object>/gi, "")
      .replace(/<embed[^>]*>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .trim();
  }

  static sanitizeHTML(input: string): string {
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  static sanitizeSQL(input: string): string {
    const sqlKeywords = ["DROP", "DELETE", "INSERT", "UPDATE", "UNION", "SELECT", "EXEC", "EXECUTE"];
    let sanitized = input;
    for (const keyword of sqlKeywords) {
      const regex = new RegExp(keyword, "gi");
      sanitized = sanitized.replace(regex, "");
    }
    return sanitized;
  }

  static sanitizePath(input: string): string {
    return input
      .replace(/\.\./g, "")
      .replace(/\/\//g, "/")
      .replace(/~/g, "")
      .trim();
  }

  static sanitizeEmail(input: string): string {
    return input.trim().toLowerCase().slice(0, 254);
  }

  static sanitizePhone(input: string): string {
    return input.replace(/[^\d+]/g, "").slice(0, 20);
  }

  static sanitizeURL(input: string): string {
    try {
      const url = new URL(input);
      // Only allow http and https protocols
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return "";
      }
      return url.toString();
    } catch {
      return "";
    }
  }

  static sanitizeFilename(input: string): string {
    return input
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/\.\./g, "")
      .slice(0, 255);
  }

  static sanitizeUUID(input: string): string {
    return input.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 36);
  }
}

// ─── ENCRYPTION HELPERS ────────────────────────────────────────

export class EncryptionHelper {
  private static readonly ALGORITHM = "aes-256-gcm";
  private static readonly IV_LENGTH = 16;
  private static readonly TAG_LENGTH = 16;
  private static readonly SALT_LENGTH = 32;

  static encrypt(text: string, key: string): string {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const salt = crypto.randomBytes(this.SALT_LENGTH);
    const derivedKey = crypto.scryptSync(key, salt, 32);

    const cipher = crypto.createCipheriv(this.ALGORITHM, derivedKey, iv);
    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();

    return Buffer.concat([salt, iv, tag, encrypted]).toString("base64");
  }

  static decrypt(encryptedData: string, key: string): string | null {
    try {
      const data = Buffer.from(encryptedData, "base64");
      const salt = data.slice(0, this.SALT_LENGTH);
      const iv = data.slice(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
      const tag = data.slice(this.SALT_LENGTH + this.IV_LENGTH, this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH);
      const encrypted = data.slice(this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH);

      const derivedKey = crypto.scryptSync(key, salt, 32);
      const decipher = crypto.createDecipheriv(this.ALGORITHM, derivedKey, iv);
      decipher.setAuthTag(tag);

      return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
    } catch {
      return null;
    }
  }

  static hash(data: string, algorithm: string = "sha256"): string {
    return crypto.createHash(algorithm).update(data).digest("hex");
  }

  static hmac(data: string, key: string, algorithm: string = "sha256"): string {
    return crypto.createHmac(algorithm, key).update(data).digest("hex");
  }

  static compareHashes(a: string, b: string): boolean {
    const bufA = Buffer.from(a, "hex");
    const bufB = Buffer.from(b, "hex");
    return crypto.timingSafeEqual(bufA, bufB);
  }

  static generateUUID(): string {
    return crypto.randomUUID();
  }

  static generateRandomString(length: number): string {
    return crypto.randomBytes(length).toString("hex");
  }

  static generateRandomBytes(length: number): Buffer {
    return crypto.randomBytes(length);
  }
}

// ─── AUDIT LOGGING ─────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  success: boolean;
  metadata?: Record<string, unknown>;
}

export class AuditLogger {
  private entries: AuditLogEntry[] = [];
  private maxEntries: number;

  constructor(maxEntries: number = 10000) {
    this.maxEntries = maxEntries;
  }

  log(entry: Omit<AuditLogEntry, "id" | "timestamp">): void {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    this.entries.push(fullEntry);

    // Trim if exceeding max
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
  }

  getEntries(filter?: Partial<AuditLogEntry>): AuditLogEntry[] {
    if (!filter) return [...this.entries];

    return this.entries.filter(entry => {
      for (const [key, value] of Object.entries(filter)) {
        if (entry[key as keyof AuditLogEntry] !== value) return false;
      }
      return true;
    });
  }

  getUserActions(userId: string): AuditLogEntry[] {
    return this.entries.filter(e => e.userId === userId);
  }

  getResourceActions(resource: string, resourceId?: string): AuditLogEntry[] {
    return this.entries.filter(e =>
      e.resource === resource && (!resourceId || e.resourceId === resourceId)
    );
  }

  getFailedActions(): AuditLogEntry[] {
    return this.entries.filter(e => !e.success);
  }

  clear(): void {
    this.entries = [];
  }

  count(): number {
    return this.entries.length;
  }
}

// ─── IP-BASED SECURITY ─────────────────────────────────────────

export class IPSecurity {
  private blockedIPs: Set<string> = new Set();
  private suspiciousIPs: Map<string, number> = new Map(); // IP → strike count
  private maxStrikes: number;
  private blockDuration: number;
  private blockedAt: Map<string, number> = new Map();

  constructor(maxStrikes: number = 5, blockDurationMinutes: number = 30) {
    this.maxStrikes = maxStrikes;
    this.blockDuration = blockDurationMinutes * 60 * 1000;
  }

  isBlocked(ip: string): boolean {
    if (!this.blockedIPs.has(ip)) return false;

    const blockedTime = this.blockedAt.get(ip);
    if (blockedTime && Date.now() - blockedTime > this.blockDuration) {
      // Unblock after duration
      this.blockedIPs.delete(ip);
      this.blockedAt.delete(ip);
      this.suspiciousIPs.delete(ip);
      return false;
    }

    return true;
  }

  addStrike(ip: string): boolean {
    const strikes = (this.suspiciousIPs.get(ip) || 0) + 1;
    this.suspiciousIPs.set(ip, strikes);

    if (strikes >= this.maxStrikes) {
      this.blockIP(ip);
      return true;
    }

    return false;
  }

  blockIP(ip: string): void {
    this.blockedIPs.add(ip);
    this.blockedAt.set(ip, Date.now());
  }

  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
    this.blockedAt.delete(ip);
    this.suspiciousIPs.delete(ip);
  }

  getStrikes(ip: string): number {
    return this.suspiciousIPs.get(ip) || 0;
  }

  getBlockedIPs(): string[] {
    return [...this.blockedIPs];
  }

  clearStrikes(ip: string): void {
    this.suspiciousIPs.delete(ip);
  }

  isPrivateIP(ip: string): boolean {
    const parts = ip.split(".").map(Number);
    if (parts.length !== 4) return false;

    // 10.0.0.0/8
    if (parts[0] === 10) return true;
    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 127.0.0.0/8 (loopback)
    if (parts[0] === 127) return true;
    // 0.0.0.0/8
    if (parts[0] === 0) return true;

    return false;
  }

  isLocalhost(ip: string): boolean {
    return ip === "127.0.0.1" || ip === "::1" || ip === "localhost";
  }
}

// ─── SECURITY MIDDLEWARE HELPERS ───────────────────────────────

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP;

  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  if (cfConnectingIP) return cfConnectingIP;

  return "unknown";
}

export function getUserAgent(request: Request): string {
  return request.headers.get("user-agent") || "unknown";
}

export function getRequestID(request: Request): string {
  return request.headers.get("x-request-id") || crypto.randomUUID();
}

export function isHTTPS(request: Request): boolean {
  const protocol = request.headers.get("x-forwarded-proto");
  return protocol === "https" || request.url.startsWith("https://");
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) return false;
  return EncryptionHelper.compareHashes(token, sessionToken);
}

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
