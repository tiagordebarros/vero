/**
 * Unicode box-drawing characters for visual layouts.
 *
 * Provides character sets for rendering bordered boxes, cards, and tables.
 * Uses rounded corners for modern, clean aesthetics.
 *
 * @module
 */

import type { BoxChars } from "../types/index.ts";

/**
 * Card border characters (rounded corners).
 *
 * Used for rendering log cards on small screens (< 60 columns).
 * Features rounded corners for a softer, more modern appearance.
 *
 * @example
 * ```ts
 * // ╭─────────────╮
 * // │ Card content│
 * // ╰─────────────╯
 * ```
 */
export const CARD_CHARS: BoxChars = {
  top: { left: "╭", right: "╮", h: "─" },
  bottom: { left: "╰", right: "╯", h: "─" },
  vertical: "│",
};

/**
 * Table border characters (rounded corners with dividers).
 *
 * Used for rendering tabular data with headers and column separators.
 * Includes middle dividers for horizontal rules between header and body.
 *
 * @example
 * ```ts
 * // ╭──────┬──────╮
 * // │ Name │ Age  │
 * // ├──────┼──────┤
 * // │ Alice│ 25   │
 * // ╰──────┴──────╯
 * ```
 */
export const TABLE_CHARS: BoxChars = {
  top: { left: "╭", mid: "┬", right: "╮", h: "─" },
  middle: { left: "├", mid: "┼", right: "┤", h: "─" },
  bottom: { left: "╰", mid: "┴", right: "╯", h: "─" },
  vertical: "│",
};
