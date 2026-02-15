/**
 * Vero - Visual Logger
 * Public API entry point
 */

// Main exports
export { Vero, logger } from "./core/logger.ts";

// Types
export type { LoggerConfig } from "./types/index.ts";

// Constants (user-facing)
export { ICONS } from "./constants/icons.ts";

// Colors (user-facing for custom themes)
export { vero, http } from "./formatting/colors.ts";
