/**
 * Vero ANSI Engine
 *
 * Lightweight colorization engine for terminal output using ANSI escape codes.
 * Supports TrueColor (24-bit RGB), basic 8-color palette, and text modifiers.
 * Respects NO_COLOR environment variable and Deno.noColor.
 *
 * @module
 */

import { isColorDisabled } from "../utils/env.ts";

const ESC = "\x1b[";
const RESET = `${ESC}0m`;

/**
 * Global state object for color enablement.
 *
 * This object can be mutated at runtime to enable/disable colors.
 * Initial state is determined by environment (NO_COLOR, Deno.noColor).
 *
 * @property {boolean} enabled - When `false`, all color functions return plain text.
 */
export const state = {
  enabled: !isColorDisabled(),
};

/**
 * Creates an ANSI color function with specified open/close codes.
 *
 * Internal helper that generates a function to wrap text in ANSI sequences.
 * The returned function respects the global `state.enabled` flag.
 *
 * @param {number | string} open - Opening ANSI code (e.g., 1 for bold, 31 for red).
 * @param {number} close - Closing ANSI code (e.g., 22 for bold off, 39 for color reset).
 * @returns {(text: string) => string} Function that applies ANSI formatting to text.
 *
 * @example
 * ```ts
 * const red = code(31, 39);
 * console.log(red("Error message"));
 * ```
 */
function code(open: number | string, close: number): (text: string) => string {
  return (text: string) => {
    return state.enabled ? `${ESC}${open}m${text}${ESC}${close}m` : text;
  };
}

/**
 * Creates a TrueColor (24-bit RGB) ANSI color function.
 *
 * Enables precise color control using RGB values (0-255 per channel).
 * Essential for Vero's pastel color palette.
 *
 * @param {number} r - Red channel (0-255).
 * @param {number} g - Green channel (0-255).
 * @param {number} b - Blue channel (0-255).
 * @returns {(text: string) => string} Function that applies RGB color to text.
 *
 * @example
 * ```ts
 * const pastelPink = rgb(255, 175, 215);
 * console.log(pastelPink("Soft error message"));
 * ```
 */
export function rgb(r: number, g: number, b: number): (text: string) => string {
  return (text: string) => {
    return state.enabled ? `${ESC}38;2;${r};${g};${b}m${text}${RESET}` : text;
  };
}

/**
 * Makes text bold.
 *
 * @param {string} text - Text to format.
 * @returns {string} Text with bold ANSI formatting.
 *
 * @example
 * ```ts
 * console.log(bold("Important message"));
 * ```
 */
export const bold = code(1, 22);

/**
 * Dims text (reduces brightness).
 *
 * @param {string} text - Text to format.
 * @returns {string} Text with dim ANSI formatting.
 *
 * @example
 * ```ts
 * console.log(dim("Subtle hint"));
 * ```
 */
export const dim = code(2, 22);

/**
 * Makes text italic.
 *
 * @param {string} text - Text to format.
 * @returns {string} Text with italic ANSI formatting.
 *
 * @example
 * ```ts
 * console.log(italic("Emphasis"));
 * ```
 */
export const italic = code(3, 23);

/**
 * Underlines text.
 *
 * @param {string} text - Text to format.
 * @returns {string} Text with underline ANSI formatting.
 */
export const underline = code(4, 24);

/**
 * Inverts foreground and background colors.
 *
 * @param {string} text - Text to format.
 * @returns {string} Text with inverted ANSI formatting.
 */
export const inverse = code(7, 27);

/**
 * Applies basic red color (8-color fallback).
 *
 * @param {string} text - Text to colorize.
 * @returns {string} Red-colored text.
 */
export const red = code(31, 39);

/**
 * Applies basic green color (8-color fallback).
 *
 * @param {string} text - Text to colorize.
 * @returns {string} Green-colored text.
 */
export const green = code(32, 39);

/**
 * Applies basic yellow color (8-color fallback).
 *
 * @param {string} text - Text to colorize.
 * @returns {string} Yellow-colored text.
 */
export const yellow = code(33, 39);

/**
 * Applies basic blue color (8-color fallback).
 *
 * @param {string} text - Text to colorize.
 * @returns {string} Blue-colored text.
 */
export const blue = code(34, 39);

/**
 * Applies basic magenta color (8-color fallback).
 *
 * @param {string} text - Text to colorize.
 * @returns {string} Magenta-colored text.
 */
export const magenta = code(35, 39);

/**
 * Applies basic cyan color (8-color fallback).
 *
 * @param {string} text - Text to colorize.
 * @returns {string} Cyan-colored text.
 */
export const cyan = code(36, 39);

/**
 * Applies basic white color (8-color fallback).
 *
 * @param {string} text - Text to colorize.
 * @returns {string} White-colored text.
 */
export const white = code(37, 39);

/**
 * Applies basic gray color (8-color fallback, bright black).
 *
 * @param {string} text - Text to colorize.
 * @returns {string} Gray-colored text.
 */
export const gray = code(90, 39);

/**
 * Converts a hexadecimal color code to an RGB ANSI function.
 *
 * Uses bitwise operations to extract RGB components from hex.
 * Supports both `#RRGGBB` and `RRGGBB` formats.
 *
 * @param {string} hexCode - Hexadecimal color code (with or without `#`).
 * @returns {(text: string) => string} Function that applies the hex color to text.
 *
 * @example
 * ```ts
 * const amethyst = hex("#8b5cf6");
 * console.log(amethyst("Vero brand color"));
 * ```
 *
 * @example
 * ```ts
 * const customColor = hex("ff5733");
 * console.log(customColor("Custom colored text"));
 * ```
 */
export function hex(hexCode: string): (text: string) => string {
  const cleanHex = hexCode.replace("#", "");
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return rgb(r, g, b);
}
