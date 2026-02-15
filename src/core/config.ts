/**
 * Configuration management for Vero
 */

import type { LoggerConfig } from "../types/index.ts";
import { DEFAULT_CONFIG } from "../constants/defaults.ts";

/**
 * Merges user config with defaults
 */
export function mergeConfig(
  userConfig: Partial<LoggerConfig> = {},
): LoggerConfig {
  return { ...DEFAULT_CONFIG, ...userConfig };
}

/**
 * Validates logger configuration
 */
export function validateConfig(config: LoggerConfig): boolean {
  return (
    typeof config.showTimestamp === "boolean" &&
    typeof config.useIcons === "boolean"
  );
}
