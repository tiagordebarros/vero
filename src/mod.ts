/**
 * Vero - Visual Logger
 *
 * A zero-dependency, isomorphic visual logger for Deno, Node.js, Bun, and Browsers.
 * Built with TrueColor ANSI support and focused on developer experience.
 *
 * @module
 *
 * @example
 * ```ts
 * import { logger } from "@tiagordebarros/vero";
 *
 * logger.info("Application started");
 * logger.success("Operation completed");
 * logger.error("Something went wrong");
 * ```
 *
 * @example
 * ```ts
 * // Custom logger instance
 * import { Vero } from "@tiagordebarros/vero";
 *
 * const customLogger = new Vero({
 *   showTimestamp: false,
 *   useIcons: true
 * });
 *
 * customLogger.log("Custom configuration");
 * ```
 */

export { logger, Vero } from "./core/logger.ts";
export type { LoggerConfig } from "./types/index.ts";
export { ICONS } from "./constants/icons.ts";
export { http, vero } from "./formatting/colors.ts";
