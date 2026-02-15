/**
 * Shared type definitions for Vero
 */

/**
 * Logger configuration interface
 */
export interface LoggerConfig {
  showTimestamp: boolean;
  useIcons: boolean;
}

/**
 * Log level types
 */
export type LogLevel = "info" | "success" | "warn" | "error" | "debug" | "log";

/**
 * Format options for object/value formatting
 */
export interface FormatOptions {
  depth: number;
  maxDepth: number;
  seen: WeakSet<object>; // Circular reference protection
  compact?: boolean; // For tables - simplified formatting without quotes
}

/**
 * Box drawing character set
 */
export interface BoxChars {
  top: { left: string; right: string; h: string; mid?: string };
  bottom: { left: string; right: string; h: string; mid?: string };
  middle?: { left: string; right: string; h: string; mid: string };
  vertical: string;
}
