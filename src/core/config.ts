/**
 * Configuration management for Vero
 *
 * @module
 */

import type { LoggerConfig } from "../types/index.ts";
import { DEFAULT_CONFIG } from "../constants/defaults.ts";

/**
 * Merges user-provided configuration with default settings.
 *
 * Performs a shallow merge where user values override defaults.
 * Missing properties are filled with defaults from `DEFAULT_CONFIG`.
 *
 * @param {Partial<LoggerConfig>} userConfig - User-provided configuration options (optional).
 * @returns {LoggerConfig} Complete logger configuration with all required properties.
 *
 * @example
 * ```ts
 * const config = mergeConfig({ showTimestamp: false });
 * // Result: { showTimestamp: false, useIcons: true }
 * ```
 */
export function mergeConfig(
  userConfig: Partial<LoggerConfig> = {},
): LoggerConfig {
  return { ...DEFAULT_CONFIG, ...userConfig };
}

/**
 * Validates a logger configuration object.
 *
 * Ensures all required properties exist and have the correct types.
 * Currently validates `showTimestamp` and `useIcons` as booleans.
 *
 * @param {LoggerConfig} config - Configuration object to validate.
 * @returns {boolean} `true` if configuration is valid, `false` otherwise.
 *
 * @example
 * ```ts
 * const isValid = validateConfig({ showTimestamp: true, useIcons: false });
 * console.log(isValid); // true
 * ```
 */
export function validateConfig(config: LoggerConfig): boolean {
  return (
    typeof config.showTimestamp === "boolean" &&
    typeof config.useIcons === "boolean"
  );
}
