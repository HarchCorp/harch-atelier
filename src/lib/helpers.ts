// ═══════════════════════════════════════════════════════════════
//  ADDITIONAL HELPERS — Utility functions and type guards
// ═══════════════════════════════════════════════════════════════

import type {
  Company,
  Article,
  Alert,
  Notification,
  SentimentScore,
  RiskAssessment,
  ReputationScore,
  AIVisibility,
  Entity,
  AssetPrice,
  Report,
  Briefing,
  Dossier,
  Portfolio,
  ApiKey,
  Webhook,
  Influencer,
  User,
  Tenant,
  Asset,
} from "@/lib/types/platform";

// ─── TYPE GUARDS ───────────────────────────────────────────────

export function isCompany(obj: unknown): obj is Company {
  return typeof obj === "object" && obj !== null && "slug" in obj && "name" in obj && "sector" in obj;
}

export function isArticle(obj: unknown): obj is Article {
  return typeof obj === "object" && obj !== null && "title" in obj && "url" in obj && "urlHash" in obj;
}

export function isAlert(obj: unknown): obj is Alert {
  return typeof obj === "object" && obj !== null && "type" in obj && "severity" in obj && "title" in obj;
}

export function isNotification(obj: unknown): obj is Notification {
  return typeof obj === "object" && obj !== null && "userId" in obj && "type" in obj && "title" in obj;
}

export function isSentimentScore(obj: unknown): obj is SentimentScore {
  return typeof obj === "object" && obj !== null && "companyId" in obj && "score" in obj;
}

export function isRiskAssessment(obj: unknown): obj is RiskAssessment {
  return typeof obj === "object" && obj !== null && "companyId" in obj && "riskLevel" in obj;
}

export function isReputationScore(obj: unknown): obj is ReputationScore {
  return typeof obj === "object" && obj !== null && "companyId" in obj && "overall" in obj;
}

export function isAIVisibility(obj: unknown): obj is AIVisibility {
  return typeof obj === "object" && obj !== null && "companyId" in obj && "platform" in obj;
}

export function isEntity(obj: unknown): obj is Entity {
  return typeof obj === "object" && obj !== null && "entityType" in obj && "name" in obj;
}

export function isAssetPrice(obj: unknown): obj is AssetPrice {
  return typeof obj === "object" && obj !== null && "assetId" in obj && "price" in obj;
}

export function isReport(obj: unknown): obj is Report {
  return typeof obj === "object" && obj !== null && "userId" in obj && "title" in obj && "period" in obj;
}

export function isBriefing(obj: unknown): obj is Briefing {
  return typeof obj === "object" && obj !== null && "userId" in obj && "date" in obj;
}

export function isDossier(obj: unknown): obj is Dossier {
  return typeof obj === "object" && obj !== null && "userId" in obj && "companyName" in obj;
}

export function isPortfolio(obj: unknown): obj is Portfolio {
  return typeof obj === "object" && obj !== null && "userId" in obj && "name" in obj;
}

export function isApiKey(obj: unknown): obj is ApiKey {
  return typeof obj === "object" && obj !== null && "userId" in obj && "keyHash" in obj;
}

export function isWebhook(obj: unknown): obj is Webhook {
  return typeof obj === "object" && obj !== null && "userId" in obj && "url" in obj;
}

export function isInfluencer(obj: unknown): obj is Influencer {
  return typeof obj === "object" && obj !== null && "name" in obj && "platform" in obj;
}

export function isUser(obj: unknown): obj is User {
  return typeof obj === "object" && obj !== null && "email" in obj && "role" in obj;
}

export function isTenant(obj: unknown): obj is Tenant {
  return typeof obj === "object" && obj !== null && "name" in obj && "plan" in obj;
}

export function isAsset(obj: unknown): obj is Asset {
  return typeof obj === "object" && obj !== null && "ticker" in obj && "name" in obj;
}

// ─── ARRAY UTILITIES ───────────────────────────────────────────

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function groupBy<T, K extends string | number>(array: T[], keyFn: (item: T) => K): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

export function countBy<T, K extends string | number>(array: T[], keyFn: (item: T) => K): Record<K, number> {
  return array.reduce((counts, item) => {
    const key = keyFn(item);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {} as Record<K, number>);
}

export function indexBy<T, K extends string | number>(array: T[], keyFn: (item: T) => K): Record<K, T> {
  return array.reduce((indexed, item) => {
    indexed[keyFn(item)] = item;
    return indexed;
  }, {} as Record<K, T>);
}

export function partition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];
  for (const item of array) {
    if (predicate(item)) truthy.push(item);
    else falsy.push(item);
  }
  return [truthy, falsy];
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function flatten<T>(array: T[][]): T[] {
  return array.flat();
}

export function flattenDeep<T>(array: unknown[]): T[] {
  return array.reduce<T[]>((acc, val) => {
    if (Array.isArray(val)) {
      return acc.concat(flattenDeep<T>(val));
    }
    return acc.concat(val as T);
  }, []);
}

export function compact<T>(array: (T | null | undefined | false | 0 | "")[]): T[] {
  return array.filter(Boolean) as T[];
}

export function take<T>(array: T[], n: number): T[] {
  return array.slice(0, n);
}

export function takeRight<T>(array: T[], n: number): T[] {
  return array.slice(Math.max(0, array.length - n));
}

export function drop<T>(array: T[], n: number): T[] {
  return array.slice(n);
}

export function dropRight<T>(array: T[], n: number): T[] {
  return array.slice(0, Math.max(0, array.length - n));
}

export function zip<A, B>(arrayA: A[], arrayB: B[]): Array<[A, B]> {
  const length = Math.min(arrayA.length, arrayB.length);
  const result: Array<[A, B]> = [];
  for (let i = 0; i < length; i++) {
    result.push([arrayA[i], arrayB[i]]);
  }
  return result;
}

export function unzip<A, B>(array: Array<[A, B]>): [A[], B[]] {
  const a: A[] = [];
  const b: B[] = [];
  for (const [x, y] of array) {
    a.push(x);
    b.push(y);
  }
  return [a, b];
}

export function intersection<T>(arrayA: T[], arrayB: T[]): T[] {
  const setB = new Set(arrayB);
  return arrayA.filter(item => setB.has(item));
}

export function difference<T>(arrayA: T[], arrayB: T[]): T[] {
  const setB = new Set(arrayB);
  return arrayA.filter(item => !setB.has(item));
}

export function union<T>(arrayA: T[], arrayB: T[]): T[] {
  return unique([...arrayA, ...arrayB]);
}

export function symmetricDifference<T>(arrayA: T[], arrayB: T[]): T[] {
  return unique([...difference(arrayA, arrayB), ...difference(arrayB, arrayA)]);
}

export function sample<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

export function sampleSize<T>(array: T[], n: number): T[] {
  const shuffled = shuffle(array);
  return shuffled.slice(0, n);
}

export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function sortBy<T>(array: T[], keyFns: Array<(item: T) => string | number>): T[] {
  return [...array].sort((a, b) => {
    for (const keyFn of keyFns) {
      const aVal = keyFn(a);
      const bVal = keyFn(b);
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
    }
    return 0;
  });
}

export function orderBy<T>(array: T[], keyFns: Array<(item: T) => string | number>, directions: Array<"asc" | "desc">): T[] {
  return [...array].sort((a, b) => {
    for (let i = 0; i < keyFns.length; i++) {
      const keyFn = keyFns[i];
      const direction = directions[i] || "asc";
      const aVal = keyFn(a);
      const bVal = keyFn(b);
      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
    }
    return 0;
  });
}

export function keyBy<T, K extends string | number>(array: T[], keyFn: (item: T) => K): Record<K, T> {
  return indexBy(array, keyFn);
}

export function maxBy<T>(array: T[], keyFn: (item: T) => number): T | undefined {
  if (array.length === 0) return undefined;
  let maxItem = array[0];
  let maxVal = keyFn(array[0]);
  for (const item of array) {
    const val = keyFn(item);
    if (val > maxVal) {
      maxVal = val;
      maxItem = item;
    }
  }
  return maxItem;
}

export function minBy<T>(array: T[], keyFn: (item: T) => number): T | undefined {
  if (array.length === 0) return undefined;
  let minItem = array[0];
  let minVal = keyFn(array[0]);
  for (const item of array) {
    const val = keyFn(item);
    if (val < minVal) {
      minVal = val;
      minItem = item;
    }
  }
  return minItem;
}

export function sumBy<T>(array: T[], keyFn: (item: T) => number): number {
  return array.reduce((sum, item) => sum + keyFn(item), 0);
}

export function meanBy<T>(array: T[], keyFn: (item: T) => number): number {
  if (array.length === 0) return 0;
  return sumBy(array, keyFn) / array.length;
}

export function countByFn<T>(array: T[], predicate: (item: T) => boolean): number {
  return array.filter(predicate).length;
}

export function findLast<T>(array: T[], predicate: (item: T) => boolean): T | undefined {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) return array[i];
  }
  return undefined;
}

export function findIndex<T>(array: T[], predicate: (item: T) => boolean): number {
  return array.findIndex(predicate);
}

export function findLastIndex<T>(array: T[], predicate: (item: T) => boolean): number {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) return i;
  }
  return -1;
}

export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  if (step > 0) {
    for (let i = start; i < end; i += step) result.push(i);
  } else {
    for (let i = start; i > end; i += step) result.push(i);
  }
  return result;
}

export function repeat<T>(value: T, n: number): T[] {
  return Array.from({ length: n }, () => value);
}

export function rangeRight(start: number, end: number, step: number = 1): number[] {
  return range(start, end, step).reverse();
}

// ─── OBJECT UTILITIES ──────────────────────────────────────────

export function mapValues<T, R>(obj: Record<string, T>, fn: (value: T, key: string) => R): Record<string, R> {
  const result: Record<string, R> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = fn(value, key);
  }
  return result;
}

export function mapKeys<T>(obj: Record<string, T>, fn: (key: string, value: T) => string): Record<string, T> {
  const result: Record<string, T> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[fn(key, value)] = value;
  }
  return result;
}

export function filterKeys<T>(obj: Record<string, T>, predicate: (key: string, value: T) => boolean): Record<string, T> {
  const result: Record<string, T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (predicate(key, value)) {
      result[key] = value;
    }
  }
  return result;
}

export function invert(obj: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[value] = key;
  }
  return result;
}

export function merge<T extends Record<string, unknown>>(...objects: Partial<T>[]): T {
  const result = {} as T;
  for (const obj of objects) {
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        (result as Record<string, unknown>)[key] = value;
      }
    }
  }
  return result;
}

export function deepMerge<T extends Record<string, unknown>>(target: T, ...sources: Partial<T>[]): T {
  if (sources.length === 0) return target;
  const source = sources[0];
  if (typeof target !== "object" || target === null || typeof source !== "object" || source === null) {
    return (source ?? target) as T;
  }
  const result = { ...target } as Record<string, unknown>;
  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined) {
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        result[key] = deepMerge(result[key] as Record<string, unknown>, value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }
  }
  return result as T;
}

export function omitBy<T>(obj: Record<string, T>, predicate: (value: T, key: string) => boolean): Record<string, T> {
  const result: Record<string, T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (!predicate(value, key)) {
      result[key] = value;
    }
  }
  return result;
}

export function pickBy<T>(obj: Record<string, T>, predicate: (value: T, key: string) => boolean): Record<string, T> {
  const result: Record<string, T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (predicate(value, key)) {
      result[key] = value;
    }
  }
  return result;
}

export function fromPairs(pairs: Array<[string, unknown]>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of pairs) {
    result[key] = value;
  }
  return result;
}

export function toPairs(obj: Record<string, unknown>): Array<[string, unknown]> {
  return Object.entries(obj);
}

export function getNestedValue(obj: unknown, path: string, defaultValue?: unknown): unknown {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return defaultValue;
    current = (current as Record<string, unknown>)[key];
  }
  return current === undefined ? defaultValue : current;
}

export function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] === undefined || current[key] === null) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}

export function hasNestedKey(obj: unknown, path: string): boolean {
  return getNestedValue(obj, path) !== undefined;
}

export function deleteNestedKey(obj: Record<string, unknown>, path: string): boolean {
  const keys = path.split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] === undefined || current[key] === null) return false;
    current = current[key] as Record<string, unknown>;
  }
  const lastKey = keys[keys.length - 1];
  if (lastKey in current) {
    delete current[lastKey];
    return true;
  }
  return false;
}

export function cloneDeep<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => cloneDeep(item)) as T;
  if (typeof obj === "object") {
    const cloned = {} as Record<string, unknown>;
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      cloned[key] = cloneDeep(value);
    }
    return cloned as T;
  }
  return obj;
}

export function freezeDeep<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;
  Object.freeze(obj);
  if (Array.isArray(obj)) {
    obj.forEach(freezeDeep);
  } else {
    for (const value of Object.values(obj as Record<string, unknown>)) {
      freezeDeep(value);
    }
  }
  return obj;
}

export function isFrozen(obj: unknown): boolean {
  return Object.isFrozen(obj);
}

export function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return a === b;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => isEqual(item, b[index]));
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(key => isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
}

// ─── FUNCTION UTILITIES ────────────────────────────────────────

export function noop(): void {}

export function identity<T>(value: T): T {
  return value;
}

export function constant<T>(value: T): () => T {
  return () => value;
}

export function negate<T extends (...args: any[]) => boolean>(fn: T): T {
  return ((...args: Parameters<T>) => !fn(...args)) as T;
}

export function compose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg);
}

export function pipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg);
}

export function flow<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return pipe(...fns);
}

export function curry<T extends (...args: any[]) => any>(fn: T): (...args: Partial<Parameters<T>>) => any {
  return function curried(...args: any[]): any {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return (...next: any[]) => curried(...args, ...next);
  };
}

export function partial<T extends (...args: any[]) => any>(fn: T, ...partialArgs: any[]): (...args: any[]) => ReturnType<T> {
  return (...args: any[]) => fn(...partialArgs, ...args);
}

export function partialRight<T extends (...args: any[]) => any>(fn: T, ...partialArgs: any[]): (...args: any[]) => ReturnType<T> {
  return (...args: any[]) => fn(...args, ...partialArgs);
}

export function flip<T extends (...args: any[]) => any>(fn: T): (...args: any[]) => ReturnType<T> {
  return (...args: any[]) => fn(...args.reverse());
}

export function once<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => ReturnType<T> {
  let called = false;
  let result: ReturnType<T>;
  return (...args: Parameters<T>) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}

export function after<T extends (...args: any[]) => any>(n: number, fn: T): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let count = 0;
  return (...args: Parameters<T>) => {
    count++;
    if (count >= n) return fn(...args);
    return undefined;
  };
}

export function before<T extends (...args: any[]) => any>(n: number, fn: T): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let count = 0;
  return (...args: Parameters<T>) => {
    count++;
    if (count < n) return fn(...args);
    return undefined;
  };
}

export function memoizeFn<T extends (...args: any[]) => any>(fn: T, resolver?: (...args: Parameters<T>) => string): T {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

export function debounceFn<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttleFn<T extends (...args: any[]) => any>(fn: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

export function delayFn(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function timeoutFn<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)),
  ]);
}

export function retryFn<T>(fn: () => Promise<T>, maxRetries: number, delay: number = 1000): Promise<T> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const attempt = async () => {
      try {
        resolve(await fn());
      } catch (err) {
        attempts++;
        if (attempts >= maxRetries) {
          reject(err);
        } else {
          setTimeout(attempt, delay * attempts);
        }
      }
    };
    attempt();
  });
}

export function withTimeout<T>(fn: () => T, ms: number): T {
  const start = Date.now();
  const result = fn();
  const elapsed = Date.now() - start;
  if (elapsed > ms) {
    console.warn(`Function took ${elapsed}ms (timeout: ${ms}ms)`);
  }
  return result;
}

// ─── STRING UTILITIES ──────────────────────────────────────────

export function camelCase(str: string): string {
  return str.replace(/([-_\s][a-z])/g, group => group.toUpperCase().replace(/[-_\s]/, ""));
}

export function pascalCase(str: string): string {
  const camel = camelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

export function kebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase();
}

export function snakeCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[\s-]+/g, "_").toLowerCase();
}

export function titleCase(str: string): string {
  return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

export function sentenceCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function padStart(str: string, length: number, char: string = " "): string {
  return str.padStart(length, char);
}

export function padEnd(str: string, length: number, char: string = " "): string {
  return str.padEnd(length, char);
}

export function pad(str: string, length: number, char: string = " "): string {
  const padLen = Math.max(0, length - str.length);
  const padStart = Math.floor(padLen / 2);
  const padEnd = padLen - padStart;
  return char.repeat(padStart) + str + char.repeat(padEnd);
}

export function truncate(str: string, length: number, suffix: string = "…"): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

export function truncateMiddle(str: string, length: number, separator: string = "…"): string {
  if (str.length <= length) return str;
  const sepLen = separator.length;
  const charsToShow = length - sepLen;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return str.slice(0, frontChars) + separator + str.slice(str.length - backChars);
}

export function repeatStr(str: string, n: number): string {
  return str.repeat(n);
}

export function startsWith(str: string, prefix: string): boolean {
  return str.startsWith(prefix);
}

export function endsWith(str: string, suffix: string): boolean {
  return str.endsWith(suffix);
}

export function includes(str: string, substring: string): boolean {
  return str.includes(substring);
}

export function indexOf(str: string, substring: string, fromIndex?: number): number {
  return str.indexOf(substring, fromIndex);
}

export function lastIndexOf(str: string, substring: string, fromIndex?: number): number {
  return str.lastIndexOf(substring, fromIndex);
}

export function split(str: string, separator: string | RegExp, limit?: number): string[] {
  return str.split(separator, limit);
}

export function join(array: string[], separator: string = ","): string {
  return array.join(separator);
}

export function replace(str: string, pattern: string | RegExp, replacement: string): string {
  return str.replace(pattern, replacement);
}

export function replaceAll(str: string, pattern: string | RegExp, replacement: string): string {
  return str.replaceAll(pattern, replacement);
}

export function match(str: string, pattern: string | RegExp): RegExpMatchArray | null {
  return str.match(pattern);
}

export function matchAll(str: string, pattern: RegExp): IterableIterator<RegExpMatchArray> {
  return str.matchAll(pattern);
}

export function test(str: string, pattern: RegExp): boolean {
  return pattern.test(str);
}

export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function template(str: string, data: Record<string, string>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? "");
}

export function mask(str: string, start: number = 0, end: number = str.length, char: string = "*"): string {
  if (start < 0) start = 0;
  if (end > str.length) end = str.length;
  const masked = char.repeat(end - start);
  return str.slice(0, start) + masked + str.slice(end);
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return mask(email, 0, email.length);
  const maskedUser = user.length <= 2 ? mask(user, 0, user.length) : user[0] + "*".repeat(user.length - 2) + user[user.length - 1];
  return `${maskedUser}@${domain}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return phone;
  return phone.slice(0, -4) + "*".repeat(4);
}

export function maskCard(card: string): string {
  const digits = card.replace(/\D/g, "");
  if (digits.length < 4) return card;
  return "*".repeat(digits.length - 4) + digits.slice(-4);
}

// ─── NUMBER UTILITIES ──────────────────────────────────────────

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export function random(min: number = 0, max: number = 1): number {
  return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(random(min, max + 1));
}

export function round(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function floor(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.floor(value * factor) / factor;
}

export function ceil(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.ceil(value * factor) / factor;
}

export function toFixed(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

export function toPrecision(value: number, precision: number): string {
  return value.toPrecision(precision);
}

export function toExponential(value: number, fractionDigits?: number): string {
  return value.toExponential(fractionDigits);
}

export function parseIntSafe(str: string, radix: number = 10): number {
  const result = parseInt(str, radix);
  return isNaN(result) ? 0 : result;
}

export function parseFloatSafe(str: string): number {
  const result = parseFloat(str);
  return isNaN(result) ? 0 : result;
}

export function isInteger(value: unknown): boolean {
  return typeof value === "number" && Number.isInteger(value);
}

export function isFloat(value: unknown): boolean {
  return typeof value === "number" && !Number.isInteger(value);
}

export function isFinite(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value);
}

export function isPositive(value: unknown): boolean {
  return typeof value === "number" && value > 0;
}

export function isNegative(value: unknown): boolean {
  return typeof value === "number" && value < 0;
}

export function isZero(value: unknown): boolean {
  return typeof value === "number" && value === 0;
}

export function isEven(value: number): boolean {
  return value % 2 === 0;
}

export function isOdd(value: number): boolean {
  return value % 2 !== 0;
}

export function isPrime(value: number): boolean {
  if (value < 2) return false;
  if (value === 2) return true;
  if (value % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(value); i += 2) {
    if (value % i === 0) return false;
  }
  return true;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

export function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

export function fibonacci(n: number): number {
  if (n < 0) return NaN;
  if (n <= 1) return n;
  let a = 0;
  let b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

export function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

export function nextPowerOfTwo(n: number): number {
  if (n <= 0) return 1;
  n--;
  n |= n >> 1;
  n |= n >> 2;
  n |= n >> 4;
  n |= n >> 8;
  n |= n >> 16;
  n++;
  return n;
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function inverseLerp(start: number, end: number, value: number): number {
  if (start === end) return 0;
  return (value - start) / (end - start);
}

export function remap(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  const t = inverseLerp(inMin, inMax, value);
  return lerp(outMin, outMax, t);
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp(inverseLerp(edge0, edge1, x), 0, 1);
  return t * t * (3 - 2 * t);
}

export function smootherstep(edge0: number, edge1: number, x: number): number {
  const t = clamp(inverseLerp(edge0, edge1, x), 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

// ─── BOOLEAN UTILITIES ─────────────────────────────────────────

export function isTruthy(value: unknown): boolean {
  return !!value;
}

export function isFalsy(value: unknown): boolean {
  return !value;
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export function isNotNull(value: unknown): boolean {
  return value !== null;
}

export function isNotUndefined(value: unknown): boolean {
  return value !== undefined;
}

export function isNotNullish<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isFunction(value: unknown): value is (...args: any[]) => any {
  return typeof value === "function";
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

export function isRegExp(value: unknown): value is RegExp {
  return value instanceof RegExp;
}

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function isPromise(value: unknown): value is Promise<unknown> {
  return value instanceof Promise;
}

export function isAsyncFunction(value: unknown): boolean {
  return typeof value === "function" && value.constructor.name === "AsyncFunction";
}

export function isPlainObject(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

export function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

export function isNotEmptyValue(value: unknown): boolean {
  return !isEmptyValue(value);
}

export function coalesce<T>(...values: (T | null | undefined)[]): T | undefined {
  for (const value of values) {
    if (value !== null && value !== undefined) return value;
  }
  return undefined;
}

export function defaultTo<T>(value: T | null | undefined, defaultValue: T): T {
  return value === null || value === undefined ? defaultValue : value;
}

// ─── CONVERSION UTILITIES ──────────────────────────────────────

export function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true" || value === "1" || value === "yes" || value === "on";
  if (typeof value === "number") return value !== 0;
  return false;
}

export function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value) || 0;
  if (typeof value === "boolean") return value ? 1 : 0;
  return 0;
}

export function toString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function toArray<T>(value: T | T[]): T[] {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
}

export function toObject(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return {}; }
  }
  return {};
}

export function toDate(value: unknown): Date | null {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function toISOString(value: unknown): string | null {
  const d = toDate(value);
  return d ? d.toISOString() : null;
}

export function toTimestamp(value: unknown): number | null {
  const d = toDate(value);
  return d ? d.getTime() : null;
}

export function toISODateString(value: unknown): string | null {
  const d = toDate(value);
  return d ? d.toISOString().split("T")[0] : null;
}

// ─── MISC ──────────────────────────────────────────────────────

export function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function generateId(prefix: string = ""): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function generateShortId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function generateNumericId(length: number = 6): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
}

export function generateHexId(length: number = 16): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}

export function hashStringToHex(str: string): string {
  return Math.abs(hashString(str)).toString(16).padStart(8, "0");
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function sleepSync(ms: number): void {
  const start = Date.now();
  while (Date.now() - start < ms) {
    // busy wait
  }
}

export function measureTime<T>(fn: () => T): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  return { result, duration };
}

export async function measureTimeAsync<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { result, duration };
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
}

export function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}m ${sec}s`;
}
