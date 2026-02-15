/**
 * Monochrome glyph dictionary for log levels
 * Uses Unicode symbols for better visual hierarchy
 */

/**
 * Icon dictionary mapping log levels to Unicode symbols
 */
export const ICONS = {
  log: "•", // Bullet
  info: "ℹ", // Information symbol
  warn: "⚠", // Warning sign
  error: "✖", // Multiplication X
  success: "✔", // Check mark
  debug: "◆", // Gear/Settings
  time: "◷", // Stopwatch
  trace: "≡", // Stack trace
  count: "№", // Number sign
  dir: "☷", // Directory/properties
  dirxml: "⌗", // XML/markup structure
  assert: "✖", // Assertion (same as error)
  groupCollapsed: "▶", // Black Right-Pointing Triangle
  groupExpanded: "▼", // Black Down-Pointing Triangle
} as const;

/**
 * Type for icon keys
 */
export type IconKey = keyof typeof ICONS;
