/**
 * Terminal size detection utilities
 * Isomorphic implementation for Browser and Server environments
 */

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
      const approxWidth = Math.floor(globalThis.window.innerWidth / 9);
      return Math.max(40, Math.min(approxWidth, 200)); // Clamp between 40-200
    }

    // Node.js/Bun environment - PRIORITY 1 (updates with SIGWINCH)
    if (typeof (globalThis as any).process !== "undefined") {
      const process = (globalThis as any).process;
      if (process.stdout && typeof process.stdout.columns === "number" && process.stdout.columns > 0) {
        return process.stdout.columns;
      }
    }

    // Deno environment - PRIORITY 2 
    if (typeof (globalThis as any).Deno !== "undefined") {
      const deno = (globalThis as any).Deno;
      if (deno.consoleSize) {
        const size = deno.consoleSize();
        if (size && typeof size.columns === "number" && size.columns > 0) {
          return size.columns;
        }
      }
    }

    // COLUMNS environment variable - PRIORITY 3 (manual override)
    if (typeof (globalThis as any).Deno !== "undefined") {
      const deno = (globalThis as any).Deno;
      const columns = deno.env.get("COLUMNS");
      if (columns) {
        const width = parseInt(columns, 10);
        if (!isNaN(width) && width > 0) {
          return width;
        }
      }
    } else if (typeof (globalThis as any).process !== "undefined") {
      const process = (globalThis as any).process;
      const columns = process.env.COLUMNS;
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
      const approxHeight = Math.floor(globalThis.window.innerHeight / 16);
      return Math.max(10, Math.min(approxHeight, 100));
    }

    // Deno environment
    if (typeof (globalThis as any).Deno !== "undefined") {
      const deno = (globalThis as any).Deno;
      if (deno.consoleSize) {
        return deno.consoleSize().rows || DEFAULT_HEIGHT;
      }
    }

    // Node.js/Bun environment
    if (typeof (globalThis as any).process !== "undefined") {
      const process = (globalThis as any).process;
      if (process.stdout && process.stdout.rows) {
        return process.stdout.rows;
      }
    }
  } catch (_error) {
    // Silently fall back
  }

  return DEFAULT_HEIGHT;
}
