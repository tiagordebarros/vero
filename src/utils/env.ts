/**
 * Environment detection utilities
 * Pure functions to detect runtime environment (Deno/Node/Bun/Browser)
 */

// Type declarations for runtime globals
interface DenoNamespace {
  noColor: boolean;
  consoleSize?: () => { columns: number; rows: number };
  env: { get(key: string): string | undefined };
}

interface ProcessNamespace {
  stdout?: { columns?: number; rows?: number };
  env: Record<string, string | undefined>;
}

interface BrowserWindow {
  innerWidth: number;
  innerHeight: number;
}

declare const Deno: DenoNamespace;
declare const process: ProcessNamespace;

/**
 * Checks if running in Deno environment
 */
export function isDeno(): boolean {
  return typeof globalThis.Deno !== "undefined";
}

/**
 * Checks if running in Node.js/Bun environment
 */
export function isNode(): boolean {
  return typeof globalThis.process !== "undefined" &&
    typeof (globalThis.process as ProcessNamespace).env !== "undefined";
}

/**
 * Checks if running in Browser environment
 */
export function isBrowser(): boolean {
  return typeof globalThis.window !== "undefined";
}

/**
 * Checks if NO_COLOR environment variable is set
 * @returns true if colors should be disabled
 */
export function isColorDisabled(): boolean {
  if (isDeno()) {
    const deno = globalThis.Deno as DenoNamespace;
    return deno.noColor;
  }

  if (isNode()) {
    const proc = globalThis.process as ProcessNamespace;
    return !!proc.env.NO_COLOR;
  }

  return false;
}

/**
 * Checks if running in CI environment
 */
export function isCI(): boolean {
  if (isDeno()) {
    const deno = globalThis.Deno as DenoNamespace;
    return !!deno.env.get("CI");
  }

  if (isNode()) {
    const proc = globalThis.process as ProcessNamespace;
    return !!proc.env.CI;
  }

  return false;
}

/**
 * Gets Deno namespace if available
 */
export function getDenoNamespace(): DenoNamespace | null {
  return isDeno() ? (globalThis.Deno as DenoNamespace) : null;
}

/**
 * Gets Process namespace if available
 */
export function getProcessNamespace(): ProcessNamespace | null {
  return isNode() ? (globalThis.process as ProcessNamespace) : null;
}

/**
 * Gets Browser Window if available
 */
export function getBrowserWindow(): BrowserWindow | null {
  return isBrowser()
    ? (globalThis.window as unknown as BrowserWindow)
    : null;
}
