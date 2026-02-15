/**
 * Timestamp formatting utilities
 * Pure functions for time formatting (HH:MM:ss.ms format)
 */

/**
 * Gets the current timestamp in HH:MM:ss.ms format (pt-BR locale)
 * @returns Timestamp string without ANSI formatting
 */
export function getTimestamp(): string {
  const d = new Date();
  const time = d.toLocaleTimeString("pt-BR", { hour12: false });
  const ms = d.getMilliseconds().toString().padStart(3, "0");
  return `${time}.${ms}`;
}
