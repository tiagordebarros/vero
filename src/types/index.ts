/**
 * Shared type definitions for Vero logger.
 *
 * @module
 */

/**
 * Logger configuration interface.
 *
 * Controls the visual presentation and behavior of log output.
 *
 * @property {boolean} showTimestamp - When `true`, prepends timestamps to log messages.
 * @property {boolean} useIcons - When `true`, uses Unicode icons instead of text labels.
 */
export interface LoggerConfig {
  showTimestamp: boolean;
  useIcons: boolean;
}

/**
 * Supported log levels.
 *
 * Each level has distinct styling and semantic meaning:
 * - `log`: General output (white)
 * - `info`: Informational messages (blue)
 * - `success`: Successful operations (green)
 * - `warn`: Warnings (orange)
 * - `error`: Errors (pink, uses stderr)
 * - `debug`: Debug information (dimmed)
 */
export type LogLevel = "info" | "success" | "warn" | "error" | "debug" | "log";

/**
 * Options for formatting values and objects.
 *
 * Controls recursion depth, circular reference detection, and rendering style.
 *
 * @property {number} depth - Current recursion depth (internal tracking).
 * @property {number} maxDepth - Maximum allowed recursion depth (prevents infinite loops).
 * @property {WeakSet<object>} seen - Tracks visited objects for circular reference detection.
 * @property {boolean} [compact] - When `true`, uses simplified formatting for tables (no quotes on strings).
 */
export interface FormatOptions {
  depth: number;
  maxDepth: number;
  seen: WeakSet<object>;
  compact?: boolean;
}

/**
 * Unicode box-drawing character set.
 *
 * Defines characters for rendering bordered boxes, cards, and tables.
 *
 * @property {object} top - Characters for top border.
 * @property {string} top.left - Top-left corner.
 * @property {string} top.right - Top-right corner.
 * @property {string} top.h - Horizontal line character.
 * @property {string} [top.mid] - Optional T-junction for column separators.
 * @property {object} bottom - Characters for bottom border.
 * @property {string} bottom.left - Bottom-left corner.
 * @property {string} bottom.right - Bottom-right corner.
 * @property {string} bottom.h - Horizontal line character.
 * @property {string} [bottom.mid] - Optional T-junction for column separators.
 * @property {object} [middle] - Optional middle divider (for table headers).
 * @property {string} middle.left - Middle left T-junction.
 * @property {string} middle.right - Middle right T-junction.
 * @property {string} middle.h - Horizontal divider.
 * @property {string} middle.mid - Cross junction.
 * @property {string} vertical - Vertical border character.
 */
export interface BoxChars {
  top: { left: string; right: string; h: string; mid?: string };
  bottom: { left: string; right: string; h: string; mid?: string };
  middle?: { left: string; right: string; h: string; mid: string };
  vertical: string;
}
