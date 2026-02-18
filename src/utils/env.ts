/**
 * Environment detection utilities.
 *
 * Pure functions to detect runtime environment (Deno/Node/Bun/Browser).
 * Used for isomorphic feature detection and environment-specific APIs.
 *
 * @module
 */

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

/**
 * Checks if running in Deno environment.
 *
 * @returns {boolean} `true` if running in Deno, `false` otherwise.
 *
 * @example
 * ```ts
 * if (isDeno()) {
 *   console.log("Running in Deno");
 * }
 * ```
 */
export function isDeno(): boolean {
  return typeof globalThis.Deno !== "undefined";
}

/**
 * Checks if running in Node.js or Bun environment.
 *
 * @returns {boolean} `true` if running in Node/Bun, `false` otherwise.
 *
 * @example
 * ```ts
 * if (isNode()) {
 *   console.log("Running in Node.js or Bun");
 * }
 * ```
 */
export function isNode(): boolean {
  return typeof (globalThis as Record<string, unknown>).process !==
      "undefined" &&
    typeof ((globalThis as Record<string, unknown>).process as ProcessNamespace)
        .env !== "undefined";
}

/**
 * Checks if running in Browser environment.
 *
 * @returns {boolean} `true` if running in a browser, `false` otherwise.
 *
 * @example
 * ```ts
 * if (isBrowser()) {
 *   console.log("Running in browser");
 * }
 * ```
 */
export function isBrowser(): boolean {
  return typeof globalThis.window !== "undefined";
}

/**
 * Checks if NO_COLOR environment variable is set or Deno.noColor is true.
 *
 * Respects the NO_COLOR standard (https://no-color.org/) for disabling
 * ANSI color output. Also checks Deno's built-in `noColor` flag.
 *
 * @returns {boolean} `true` if colors should be disabled, `false` otherwise.
 *
 * @example
 * ```ts
 * if (isColorDisabled()) {
 *   console.log("Colors are disabled");
 * }
 * ```
 */
export function isColorDisabled(): boolean {
  if (isDeno()) {
    const deno = globalThis.Deno as DenoNamespace;
    return deno.noColor;
  }

  if (isNode()) {
    const proc = (globalThis as Record<string, unknown>)
      .process as ProcessNamespace;
    return !!proc.env.NO_COLOR;
  }

  return false;
}

/**
 * Checks if running in CI (Continuous Integration) environment.
 *
 * Detects CI by checking the `CI` environment variable, which is set
 * by most CI/CD platforms (GitHub Actions, GitLab CI, CircleCI, etc.).
 *
 * @returns {boolean} `true` if running in CI, `false` otherwise.
 *
 * @example
 * ```ts
 * if (isCI()) {
 *   console.log("Running in CI environment");
 * }
 * ```
 */
export function isCI(): boolean {
  if (isDeno()) {
    const deno = globalThis.Deno as DenoNamespace;
    return !!deno.env.get("CI");
  }

  if (isNode()) {
    const proc = (globalThis as Record<string, unknown>)
      .process as ProcessNamespace;
    return !!proc.env.CI;
  }

  return false;
}

/**
 * Gets Deno namespace if available.
 *
 * @returns {DenoNamespace | null} Deno namespace if in Deno environment, `null` otherwise.
 *
 * @example
 * ```ts
 * const deno = getDenoNamespace();
 * if (deno) {
 *   console.log(deno.consoleSize());
 * }
 * ```
 */
export function getDenoNamespace(): DenoNamespace | null {
  return isDeno() ? (globalThis.Deno as DenoNamespace) : null;
}

/**
 * Gets Process namespace if available.
 *
 * @returns {ProcessNamespace | null} Process namespace if in Node/Bun environment, `null` otherwise.
 *
 * @example
 * ```ts
 * const proc = getProcessNamespace();
 * if (proc && proc.stdout) {
 *   console.log(proc.stdout.columns);
 * }
 * ```
 */
export function getProcessNamespace(): ProcessNamespace | null {
  return isNode()
    ? ((globalThis as Record<string, unknown>).process as ProcessNamespace)
    : null;
}

/**
 * Gets Browser Window object if available.
 *
 * @returns {BrowserWindow | null} Window object if in browser environment, `null` otherwise.
 *
 * @example
 * ```ts
 * const win = getBrowserWindow();
 * if (win) {
 *   console.log(win.innerWidth);
 * }
 * ```
 */
export function getBrowserWindow(): BrowserWindow | null {
  return isBrowser() ? (globalThis.window as unknown as BrowserWindow) : null;
}
