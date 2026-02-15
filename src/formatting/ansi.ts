/**
 * Vero ANSI Engine
 * Lightweight colorization engine focused on performance and aesthetics
 */

import { isColorDisabled } from "../utils/env.ts";

const ESC = "\x1b[";
const RESET = `${ESC}0m`;

/**
 * Global state for color enablement
 */
export const state = {
  enabled: !isColorDisabled(),
};

/**
 * Helper function to create ANSI sequences
 */
function code(open: number | string, close: number): (text: string) => string {
  return (text: string) => {
    return state.enabled ? `${ESC}${open}m${text}${ESC}${close}m` : text;
  };
}

/**
 * TrueColor (RGB) function - Key to pastel tones
 */
export function rgb(r: number, g: number, b: number): (text: string) => string {
  return (text: string) => {
    return state.enabled ? `${ESC}38;2;${r};${g};${b}m${text}${RESET}` : text;
  };
}

// --- Text Modifiers ---
export const bold = code(1, 22);
export const dim = code(2, 22);
export const italic = code(3, 23);
export const underline = code(4, 24);
export const inverse = code(7, 27);

// --- Basic Colors (Fallback) ---
export const red = code(31, 39);
export const green = code(32, 39);
export const yellow = code(33, 39);
export const blue = code(34, 39);
export const magenta = code(35, 39);
export const cyan = code(36, 39);
export const white = code(37, 39);
export const gray = code(90, 39);

/**
 * Utility to convert Hex to RGB (for dynamic color addition)
 */
export function hex(hexCode: string): (text: string) => string {
  const cleanHex = hexCode.replace("#", "");
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return rgb(r, g, b);
}
