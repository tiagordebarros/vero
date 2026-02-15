/**
 * Timestamp formatting utilities.
 *
 * Pure functions for time formatting in HH:MM:ss.ms format (pt-BR locale).
 * Uses Web Standards API (Date, Intl) for maximum compatibility.
 *
 * @module
 */

/**
 * Gets the current timestamp in `HH:MM:ss.ms` format.
 *
 * Uses pt-BR locale for 24-hour time format without AM/PM.
 * Milliseconds are zero-padded to 3 digits.
 *
 * @returns {string} Timestamp string without ANSI formatting (e.g., "14:32:18.042").
 *
 * @example
 * ```ts
 * const timestamp = getTimestamp();
 * console.log(timestamp); // "14:32:18.042"
 * ```
 *
 * @example
 * ```ts
 * // Used internally by Vero logger
 * const formattedLog = `[${getTimestamp()}] Application started`;
 * ```
 */
export function getTimestamp(): string {
  const d = new Date();
  const time = d.toLocaleTimeString("pt-BR", { hour12: false });
  const ms = d.getMilliseconds().toString().padStart(3, "0");
  return `${time}.${ms}`;
}
