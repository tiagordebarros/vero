/**
 * Unicode box-drawing characters for visual layouts
 */

import type { BoxChars } from "../types/index.ts";

/**
 * Card border characters (rounded corners)
 * Used for log cards in small screens
 */
export const CARD_CHARS: BoxChars = {
  top: { left: "╭", right: "╮", h: "─" },
  bottom: { left: "╰", right: "╯", h: "─" },
  vertical: "│",
};

/**
 * Table border characters (rounded corners with dividers)
 * Used for tabular data rendering
 */
export const TABLE_CHARS: BoxChars = {
  top: { left: "╭", mid: "┬", right: "╮", h: "─" },
  middle: { left: "├", mid: "┼", right: "┤", h: "─" },
  bottom: { left: "╰", mid: "┴", right: "╯", h: "─" },
  vertical: "│",
};
