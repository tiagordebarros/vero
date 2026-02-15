/**
 * Default configuration values for Vero
 */

import type { LoggerConfig } from "../types/index.ts";

/**
 * Default logger configuration
 */
export const DEFAULT_CONFIG: LoggerConfig = {
  showTimestamp: true,
  useIcons: true,
};

/**
 * Default terminal width (fallback)
 */
export const DEFAULT_TERMINAL_WIDTH = 80;

/**
 * Default terminal height (fallback)
 */
export const DEFAULT_TERMINAL_HEIGHT = 24;

/**
 * Small screen threshold for card view
 */
export const SMALL_SCREEN_THRESHOLD = 60;

/**
 * Default indentation (2 spaces - modern standard)
 */
export const DEFAULT_INDENT = "  ";
