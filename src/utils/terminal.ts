/**
 * Terminal size detection utilities.
 *
 * Isomorphic implementation for detecting viewport/terminal dimensions
 * across Browser and Server (Deno/Node/Bun) environments.
 *
 * @module
 */

import {
  getBrowserWindow,
  getDenoNamespace,
  getProcessNamespace,
  isBrowser,
} from "./env.ts";
import {
  DEFAULT_TERMINAL_HEIGHT,
  DEFAULT_TERMINAL_WIDTH,
} from "../constants/defaults.ts";

/**
 * Gets the current terminal or viewport width in characters.
 *
 * Uses a priority-based detection strategy:
 * 1. **Node/Bun**: `process.stdout.columns` (most accurate, updates with SIGWINCH)
 * 2. **Deno**: `Deno.consoleSize().columns` (static but reliable)
 * 3. **Environment Variable**: `COLUMNS` (manual override)
 * 4. **Browser**: `window.innerWidth / 9` (approximate character width)
 * 5. **Fallback**: 80 characters (standard terminal width)
 *
 * @returns {number} Terminal width in characters (default: 80).
 *
 * @example
 * ```ts
 * const width = getTerminalWidth();
 * console.log(width); // 120
 * ```
 *
 * @example
 * ```ts
 * // Responsive table rendering
 * if (getTerminalWidth() < 60) {
 *   renderCardView();
 * } else {
 *   renderTableView();
 * }
 * ```
 */
export function getTerminalWidth(): number {
  try {
    if (isBrowser()) {
      const win = getBrowserWindow();
      if (win) {
        const approxWidth = Math.floor(win.innerWidth / 9);
        return Math.max(40, Math.min(approxWidth, 200));
      }
    }

    const proc = getProcessNamespace();
    if (
      proc && proc.stdout && typeof proc.stdout.columns === "number" &&
      proc.stdout.columns > 0
    ) {
      return proc.stdout.columns;
    }

    const deno = getDenoNamespace();
    if (deno && deno.consoleSize) {
      const size = deno.consoleSize();
      if (size && typeof size.columns === "number" && size.columns > 0) {
        return size.columns;
      }
    }

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
    // Silent fallback
  }

  return DEFAULT_TERMINAL_WIDTH;
}

/**
 * Gets the current terminal or viewport height in lines.
 *
 * Uses a priority-based detection strategy:
 * 1. **Browser**: `window.innerHeight / 16` (approximate line height)
 * 2. **Deno**: `Deno.consoleSize().rows`
 * 3. **Node/Bun**: `process.stdout.rows`
 * 4. **Fallback**: 24 lines (standard terminal height)
 *
 * @returns {number} Terminal height in lines (default: 24).
 *
 * @example
 * ```ts
 * const height = getTerminalHeight();
 * console.log(height); // 40
 * ```
 */
export function getTerminalHeight(): number {
  try {
    if (isBrowser()) {
      const win = getBrowserWindow();
      if (win) {
        const approxHeight = Math.floor(win.innerHeight / 16);
        return Math.max(10, Math.min(approxHeight, 100));
      }
    }

    const deno = getDenoNamespace();
    if (deno && deno.consoleSize) {
      return deno.consoleSize().rows || DEFAULT_TERMINAL_HEIGHT;
    }

    const proc = getProcessNamespace();
    if (proc && proc.stdout && proc.stdout.rows) {
      return proc.stdout.rows;
    }
  } catch (_error) {
    // Silent fallback
  }

  return DEFAULT_TERMINAL_HEIGHT;
}
