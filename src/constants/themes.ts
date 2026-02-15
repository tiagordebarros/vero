/**
 * Color theme palettes for Vero.
 *
 * Defines RGB color values for the brand identity and HTTP status semantics.
 * These values are **hardcoded by design** to maintain consistent aesthetics.
 *
 * @module
 */

/**
 * Vero brand color palette (pastel colors).
 *
 * These RGB values are carefully calibrated for terminal readability
 * and visual hierarchy. They are NOT user-configurable to preserve
 * consistent brand identity across all environments.
 *
 * Color meanings:
 * - **error** (Soft Pink): Errors without harsh red
 * - **success** (Mint Green): Successful operations and strings
 * - **info** (Pale Sky Blue): Informational messages and properties
 * - **warn** (Peach Orange): Warnings and numbers
 * - **type** (Lavender Purple): Types, objects, and metadata
 * - **border** (Stone Gray): Borders, punctuation, and structure
 */
export const VERO_THEME = {
  error: { r: 255, g: 175, b: 215 },
  success: { r: 135, g: 255, b: 175 },
  info: { r: 135, g: 215, b: 255 },
  warn: { r: 255, g: 215, b: 135 },
  type: { r: 175, g: 135, b: 255 },
  border: { r: 108, g: 108, b: 108 },
} as const;

/**
 * HTTP status code color palette for web development.
 *
 * Provides semantic colorization for HTTP verbs and status codes.
 * Used automatically by the object formatter when detecting HTTP-related values.
 *
 * **HTTP Verbs:**
 * - **safe**: Mint green - GET, HEAD, OPTIONS (read-only)
 * - **mutation**: Peach orange - POST, PUT, PATCH (modifies data)
 * - **delete**: Soft pink - DELETE (destructive)
 *
 * **HTTP Status Codes:**
 * - **info** (1xx): Lavender purple - informational/processing
 * - **success** (2xx): Mint green - successful
 * - **redirect** (3xx): Sky blue - redirection
 * - **clientError** (4xx): Peach orange - client-side errors
 * - **serverError** (5xx): Soft pink - server-side errors
 */
export const HTTP_THEME = {
  safe: { r: 135, g: 255, b: 175 },
  mutation: { r: 255, g: 215, b: 135 },
  delete: { r: 255, g: 175, b: 215 },
  info: { r: 175, g: 135, b: 255 },
  success: { r: 135, g: 255, b: 175 },
  redirect: { r: 135, g: 215, b: 255 },
  clientError: { r: 255, g: 215, b: 135 },
  serverError: { r: 255, g: 175, b: 215 },
} as const;
