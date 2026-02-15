/**
 * Text manipulation utilities
 * Pure functions for ANSI-aware text processing
 */

/**
 * ANSI escape code pattern (control characters)
 * Note: This regex intentionally uses control characters for ANSI detection
 */
// deno-lint-ignore no-control-regex
const ANSI_PATTERN = /\x1b\[[0-9;]*m/g;

/**
 * Removes ANSI escape codes from a string
 * @param text - Text containing ANSI codes
 * @returns Clean text without ANSI codes
 */
export function stripAnsi(text: string): string {
  return text.replace(ANSI_PATTERN, "");
}

/**
 * Finds the active ANSI color code at a specific visual position
 * Returns the last ANSI code found before that position
 * @param text - Text with ANSI codes
 * @param visualPosition - Visual character position (ignoring ANSI codes)
 * @returns Active ANSI code at that position
 */
export function getActiveAnsiAt(text: string, visualPosition: number): string {
  let lastAnsi = "";
  let visualIndex = 0;
  let i = 0;

  while (i < text.length && visualIndex <= visualPosition) {
    // Detect ANSI code
    // deno-lint-ignore no-control-regex
    if (text.substring(i).match(/^\x1b\[[0-9;]*m/)) {
      // deno-lint-ignore no-control-regex
      const ansiMatch = text.substring(i).match(/^\x1b\[[0-9;]*m/)!;
      const code = ansiMatch[0];

      // Reset code clears active color
      if (code === "\x1b[0m") {
        lastAnsi = "";
      } else {
        // Store last color/style code
        lastAnsi = code;
      }

      i += code.length;
      continue;
    }

    // Normal character
    visualIndex++;
    i++;
  }

  return lastAnsi;
}

/**
 * Extracts substring from text with ANSI codes, preserving color codes
 * @param text - Text with ANSI codes
 * @param start - Start position (visual, ignoring ANSI)
 * @param end - End position (optional)
 * @returns Substring with ANSI codes preserved
 */
export function sliceWithAnsi(text: string, start: number, end?: number): string {
  const clean = stripAnsi(text);
  const targetStart = start;
  const targetEnd = end ?? clean.length;

  let result = "";
  let visualIndex = 0;
  let i = 0;

  while (i < text.length) {
    // Detect ANSI code
    // deno-lint-ignore no-control-regex
    if (text.substring(i).match(/^\x1b\[[0-9;]*m/)) {
      // deno-lint-ignore no-control-regex
      const ansiMatch = text.substring(i).match(/^\x1b\[[0-9;]*m/)!;
      // Always include ANSI if we've started copying
      if (visualIndex >= targetStart) {
        result += ansiMatch[0];
      }
      i += ansiMatch[0].length;
      continue;
    }

    // Normal character
    if (visualIndex >= targetStart && visualIndex < targetEnd) {
      result += text[i];
    }
    visualIndex++;
    i++;

    if (visualIndex >= targetEnd) break;
  }

  return result;
}
