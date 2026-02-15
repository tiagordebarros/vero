/**
 * Terminal size detection utilities
 * Isomorphic implementation for Browser and Server environments
 */

import { getBrowserWindow, getDenoNamespace, getProcessNamespace, isBrowser } from "./env.ts";
import { DEFAULT_TERMINAL_HEIGHT, DEFAULT_TERMINAL_WIDTH } from "../constants/defaults.ts";

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
  try {
    // Browser environment - approximate character width
    if (isBrowser()) {
      const win = getBrowserWindow();
      if (win) {
        // Approximate: 1 character ≈ 8-9px in monospace fonts
        const approxWidth = Math.floor(win.innerWidth / 9);
        return Math.max(40, Math.min(approxWidth, 200)); // Clamp between 40-200
      }
    }

    // Node.js/Bun environment - PRIORITY 1 (updates with SIGWINCH)
    const proc = getProcessNamespace();
    if (proc && proc.stdout && typeof proc.stdout.columns === "number" && proc.stdout.columns > 0) {
      return proc.stdout.columns;
    }

    // Deno environment - PRIORITY 2
    const deno = getDenoNamespace();
    if (deno && deno.consoleSize) {
      const size = deno.consoleSize();
      if (size && typeof size.columns === "number" && size.columns > 0) {
        return size.columns;
      }
    }

    // COLUMNS environment variable - PRIORITY 3 (manual override)
    if (deno) {
      const columns = deno.env.get("COLUMNS");
      if (columns) {
        const width = parseInt(columns, 10);
        if (!isNaN(width) && width > 0) {
          return width;
        }
      }
    } else if (proc) {
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

  return DEFAULT_TERMINAL_WIDTH;
}

/**
 * Gets the current terminal/viewport height
 * @returns Terminal height in lines (default: 24)
 */
export function getTerminalHeight(): number {
  try {
    // Browser environment
    if (isBrowser()) {
      const win = getBrowserWindow();
      if (win) {
        const approxHeight = Math.floor(win.innerHeight / 16);
        return Math.max(10, Math.min(approxHeight, 100));
      }
    }

    // Deno environment
    const deno = getDenoNamespace();
    if (deno && deno.consoleSize) {
      return deno.consoleSize().rows || DEFAULT_TERMINAL_HEIGHT;
    }

    // Node.js/Bun environment
    const proc = getProcessNamespace();
    if (proc && proc.stdout && proc.stdout.rows) {
      return proc.stdout.rows;
    }
  } catch (_error) {
    // Silently fall back
  }

  return DEFAULT_TERMINAL_HEIGHT;
}
