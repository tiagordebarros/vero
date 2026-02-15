/**
 * Color theme palettes for Vero
 * These are the brand colors extracted from the ANSI module
 */

/**
 * Vero brand color palette (Pastel colors)
 * These RGB values are hardcoded by design and NOT user-configurable
 */
export const VERO_THEME = {
  // Soft Pink (Errors)
  error: { r: 255, g: 175, b: 215 },
  // Mint Green (Success/Strings)
  success: { r: 135, g: 255, b: 175 },
  // Pale Sky Blue (Info/Properties)
  info: { r: 135, g: 215, b: 255 },
  // Peach Orange (Warnings/Numbers)
  warn: { r: 255, g: 215, b: 135 },
  // Lavender Purple (Objects/Types)
  type: { r: 175, g: 135, b: 255 },
  // Stone Gray (Punctuation/Table borders)
  border: { r: 108, g: 108, b: 108 },
} as const;

/**
 * HTTP status code color palette (for web development)
 */
export const HTTP_THEME = {
  // Safe HTTP verbs (GET, HEAD, OPTIONS)
  safe: { r: 135, g: 255, b: 175 }, // Mint green - read-only
  // Mutation HTTP verbs (POST, PUT, PATCH)
  mutation: { r: 255, g: 215, b: 135 }, // Peach orange - modifies data
  // Deletion HTTP verbs (DELETE)
  delete: { r: 255, g: 175, b: 215 }, // Soft pink - destructive operation
  // Status 1xx (Informational)
  info: { r: 175, g: 135, b: 255 }, // Lavender purple - processing
  // Status 2xx (Success)
  success: { r: 135, g: 255, b: 175 }, // Mint green
  // Status 3xx (Redirection)
  redirect: { r: 135, g: 215, b: 255 }, // Sky blue
  // Status 4xx (Client error)
  clientError: { r: 255, g: 215, b: 135 }, // Peach orange
  // Status 5xx (Server error)
  serverError: { r: 255, g: 175, b: 215 }, // Soft pink
} as const;
