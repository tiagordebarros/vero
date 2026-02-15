/**
 * Text manipulation utilities.
 *
 * Pure functions for ANSI-aware text processing, including stripping ANSI codes,
 * finding active color codes, and slicing text while preserving formatting.
 *
 * @module
 */

/**
 * Regular expression pattern for detecting ANSI escape sequences.
 *
 * Note: Intentionally uses control characters for ANSI detection.
 * The lint warning is suppressed as this is the correct implementation.
 */
// deno-lint-ignore no-control-regex
const ANSI_PATTERN = /\x1b\[[0-9;]*m/g;

/**
 * Removes all ANSI escape codes from a string.
 *
 * Useful for calculating visual length or extracting plain text content.
 * Removes color codes, text modifiers (bold, italic), and reset sequences.
 *
 * @param {string} text - Text containing ANSI codes.
 * @returns {string} Clean text without ANSI formatting.
 *
 * @example
 * ```ts
 * const colored = "\x1b[31mRed text\x1b[0m";
 * const plain = stripAnsi(colored);
 * console.log(plain); // "Red text"
 * ```
 *
 * @example
 * ```ts
 * // Calculate visual length
 * const formatted = ansi.bold("Hello");
 * const visualLength = stripAnsi(formatted).length;
 * console.log(visualLength); // 5
 * ```
 */
export function stripAnsi(text: string): string {
  return text.replace(ANSI_PATTERN, "");
}

/**
 * Finds the active ANSI color code at a specific visual position.
 *
 * Returns the last ANSI code found before the specified visual position,
 * excluding ANSI codes from the character count. Reset codes (`\x1b[0m`)
 * clear the active color.
 *
 * @param {string} text - Text with ANSI codes.
 * @param {number} visualPosition - Visual character position (ignoring ANSI codes).
 * @returns {string} Active ANSI code at that position (empty string if none).
 *
 * @example
 * ```ts
 * const text = "\x1b[31mRed\x1b[0m Normal";
 * const colorAtPos5 = getActiveAnsiAt(text, 5);
 * console.log(colorAtPos5); // "" (after reset)
 * ```
 *
 * @example
 * ```ts
 * // Used for wrapping text while preserving colors
 * const activeColor = getActiveAnsiAt(text, 10);
 * const wrappedLine = activeColor + "continuation...";
 * ```
 */
export function getActiveAnsiAt(text: string, visualPosition: number): string {
  let lastAnsi = "";
  let visualIndex = 0;
  let i = 0;

  while (i < text.length && visualIndex <= visualPosition) {
    // deno-lint-ignore no-control-regex
    if (text.substring(i).match(/^\x1b\[[0-9;]*m/)) {
      // deno-lint-ignore no-control-regex
      const ansiMatch = text.substring(i).match(/^\x1b\[[0-9;]*m/)!;
      const code = ansiMatch[0];

      if (code === "\x1b[0m") {
        lastAnsi = "";
      } else {
        lastAnsi = code;
      }

      i += code.length;
      continue;
    }

    visualIndex++;
    i++;
  }

  return lastAnsi;
}

/**
 * Extracts a substring from ANSI-formatted text, preserving color codes.
 *
 * Slices text based on visual position (excluding ANSI codes from count),
 * while keeping all ANSI formatting intact within the extracted substring.
 *
 * @param {string} text - Text with ANSI codes.
 * @param {number} start - Start position (visual, ignoring ANSI codes).
 * @param {number} [end] - End position (optional, defaults to end of string).
 * @returns {string} Substring with ANSI codes preserved.
 *
 * @example
 * ```ts
 * const text = "\x1b[31mHello World\x1b[0m";
 * const slice = sliceWithAnsi(text, 0, 5);
 * console.log(slice); // "\x1b[31mHello\x1b[0m" (colored "Hello")
 * ```
 *
 * @example
 * ```ts
 * // Extract middle portion while keeping formatting
 * const formatted = ansi.bold("The quick brown fox");
 * const middle = sliceWithAnsi(formatted, 4, 9);
 * console.log(middle); // bold "quick"
 * ```
 */
export function sliceWithAnsi(
  text: string,
  start: number,
  end?: number,
): string {
  const clean = stripAnsi(text);
  const targetStart = start;
  const targetEnd = end ?? clean.length;

  let result = "";
  let visualIndex = 0;
  let i = 0;

  while (i < text.length) {
    // deno-lint-ignore no-control-regex
    if (text.substring(i).match(/^\x1b\[[0-9;]*m/)) {
      // deno-lint-ignore no-control-regex
      const ansiMatch = text.substring(i).match(/^\x1b\[[0-9;]*m/)!;
      if (visualIndex >= targetStart) {
        result += ansiMatch[0];
      }
      i += ansiMatch[0].length;
      continue;
    }

    if (visualIndex >= targetStart && visualIndex < targetEnd) {
      result += text[i];
    }
    visualIndex++;
    i++;

    if (visualIndex >= targetEnd) break;
  }

  return result;
}
