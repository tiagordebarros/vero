/**
 * Terminal size detection utilities
 * Isomorphic implementation for Browser and Server environments
 */

// Type declarations for runtime globals
interface DenoNamespace {
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
 * Gets the current terminal/viewport width using the most reliable method available
 * Priority order:
 * 1. process.stdout.columns (Node/Bun - most accurate, updates with SIGWINCH)
 * 2. Deno.consoleSize() (Deno - static but reliable)
 * 3. COLUMNS environment variable (manual override)
 * 4. window.innerWidth (Browser)
 * 5. Fallback to 80
 *
 * @returns Terminal width in characters (default: 80)
 */
export function getTerminalWidth(): number {
  // Default fallback
  const DEFAULT_WIDTH = 80;

  try {
    // Browser environment - approximate character width
    if (typeof globalThis.window !== "undefined") {
      // Approximate: 1 character ≈ 8-9px in monospace fonts
      const approxWidth = Math.floor((globalThis.window as unknown as BrowserWindow).innerWidth / 9);
      return Math.max(40, Math.min(approxWidth, 200)); // Clamp between 40-200
    }

    // Node.js/Bun environment - PRIORITY 1 (updates with SIGWINCH)
    if (typeof globalThis.process !== "undefined") {
      const proc = globalThis.process as ProcessNamespace;
      if (
        proc.stdout && typeof proc.stdout.columns === "number" &&
        proc.stdout.columns > 0
      ) {
        return proc.stdout.columns;
      }
    }

    // Deno environment - PRIORITY 2
    if (typeof globalThis.Deno !== "undefined") {
      const deno = globalThis.Deno as DenoNamespace;
      if (deno.consoleSize) {
        const size = deno.consoleSize();
        if (size && typeof size.columns === "number" && size.columns > 0) {
          return size.columns;
        }
      }
    }

    // COLUMNS environment variable - PRIORITY 3 (manual override)
    if (typeof globalThis.Deno !== "undefined") {
      const deno = globalThis.Deno as DenoNamespace;
      const columns = deno.env.get("COLUMNS");
      if (columns) {
        const width = parseInt(columns, 10);
        if (!isNaN(width) && width > 0) {
          return width;
        }
      }
    } else if (typeof globalThis.process !== "undefined") {
      const proc = globalThis.process as ProcessNamespace;
      const columns = proc.env.COLUMNS;
      if (columns) {
        const width = parseInt(columns, 10);
        if (!isNaN(width) && width > 0) {
          return width;
        }
      }
    }
  } catch (_error) {
    // Silently fall back to default if detection fails
  }

  return DEFAULT_WIDTH;
}

/**
 * Gets the current terminal/viewport height
 * @returns Terminal height in lines (default: 24)
 */
export function getTerminalHeight(): number {
  const DEFAULT_HEIGHT = 24;

  try {
    // Browser environment
    if (typeof globalThis.window !== "undefined") {
      const approxHeight = Math.floor((globalThis.window as unknown as BrowserWindow).innerHeight / 16);
      return Math.max(10, Math.min(approxHeight, 100));
    }

    // Deno environment
    if (typeof globalThis.Deno !== "undefined") {
      const deno = globalThis.Deno as DenoNamespace;
      if (deno.consoleSize) {
        return deno.consoleSize().rows || DEFAULT_HEIGHT;
      }
    }

    // Node.js/Bun environment
    if (typeof globalThis.process !== "undefined") {
      const proc = globalThis.process as ProcessNamespace;
      if (proc.stdout && proc.stdout.rows) {
        return proc.stdout.rows;
      }
    }
  } catch (_error) {
    // Silently fall back
  }

  return DEFAULT_HEIGHT;
}
