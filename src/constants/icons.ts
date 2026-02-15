/**
 * Monochrome glyph dictionary for log levels.
 *
 * Provides Unicode symbols for better visual hierarchy and accessibility.
 * Icons improve scannability and reduce visual noise compared to text labels.
 *
 * @module
 */

/**
 * Icon dictionary mapping log levels to Unicode symbols.
 *
 * Each symbol is carefully chosen for semantic clarity and terminal compatibility.
 * Used when `LoggerConfig.useIcons` is `true` (default).
 *
 * @example
 * ```ts
 * import { ICONS } from "@tiagordebarros/vero";
 *
 * console.log(ICONS.success); // "✔"
 * console.log(ICONS.error);   // "✖"
 * ```
 */
export const ICONS = {
  log: "•",
  info: "ℹ",
  warn: "⚠",
  error: "✖",
  success: "✔",
  debug: "◆",
  time: "◷",
  trace: "≡",
  count: "№",
  dir: "☷",
  dirxml: "⌗",
  assert: "✖",
  groupCollapsed: "▶",
  groupExpanded: "▼",
} as const;

/**
 * Type for icon keys.
 *
 * Ensures type-safe access to icon dictionary properties.
 */
export type IconKey = keyof typeof ICONS;
