/**
 * Default configuration values for Vero logger.
 *
 * @module
 */

import type { LoggerConfig } from "../types/index.ts";

/**
 * Default logger configuration.
 *
 * Applied when no user configuration is provided.
 * Can be overridden using the `Vero` class constructor.
 *
 * @example
 * ```ts
 * import { Vero } from "@tiagordebarros/vero";
 * import { DEFAULT_CONFIG } from "@tiagordebarros/vero/constants";
 *
 * console.log(DEFAULT_CONFIG);
 * // { showTimestamp: true, useIcons: true }
 * ```
 */
export const DEFAULT_CONFIG: LoggerConfig = {
  showTimestamp: true,
  useIcons: true,
};

/**
 * Default terminal width (fallback).
 *
 * Used when terminal size detection fails or is unavailable.
 * Standard terminal width for maximum compatibility.
 */
export const DEFAULT_TERMINAL_WIDTH = 80;

/**
 * Default terminal height (fallback).
 *
 * Used when terminal size detection fails or is unavailable.
 * Standard terminal height for maximum compatibility.
 */
export const DEFAULT_TERMINAL_HEIGHT = 24;

/**
 * Small screen threshold for card view (in characters).
 *
 * When terminal width is below this value and timestamps are enabled,
 * Vero automatically switches to vertical card layout for better readability.
 */
export const SMALL_SCREEN_THRESHOLD = 60;

/**
 * Default indentation for nested structures.
 *
 * Uses 2 spaces (modern standard) for object/array formatting.
 */
export const DEFAULT_INDENT = "  ";
