/**
 * Color theme application
 * Applies Vero brand colors and HTTP status colors using ANSI engine
 */

import { rgb } from "./ansi.ts";
import { HTTP_THEME, VERO_THEME } from "../constants/themes.ts";

/**
 * Vero brand color palette (Pastel colors)
 * These RGB values are hardcoded by design and NOT user-configurable
 */
export const vero: Record<string, (text: string) => string> = {
  // Soft Pink (Errors)
  error: rgb(VERO_THEME.error.r, VERO_THEME.error.g, VERO_THEME.error.b),
  // Mint Green (Success/Strings)
  success: rgb(VERO_THEME.success.r, VERO_THEME.success.g, VERO_THEME.success.b),
  // Pale Sky Blue (Info/Properties)
  info: rgb(VERO_THEME.info.r, VERO_THEME.info.g, VERO_THEME.info.b),
  // Peach Orange (Warnings/Numbers)
  warn: rgb(VERO_THEME.warn.r, VERO_THEME.warn.g, VERO_THEME.warn.b),
  // Lavender Purple (Objects/Types)
  type: rgb(VERO_THEME.type.r, VERO_THEME.type.g, VERO_THEME.type.b),
  // Stone Gray (Punctuation/Table borders)
  border: rgb(VERO_THEME.border.r, VERO_THEME.border.g, VERO_THEME.border.b),
};

/**
 * HTTP status code color palette (for web development)
 */
export const http: Record<string, (text: string) => string> = {
  // Safe HTTP verbs (GET, HEAD, OPTIONS)
  safe: rgb(HTTP_THEME.safe.r, HTTP_THEME.safe.g, HTTP_THEME.safe.b),
  // Mutation HTTP verbs (POST, PUT, PATCH)
  mutation: rgb(HTTP_THEME.mutation.r, HTTP_THEME.mutation.g, HTTP_THEME.mutation.b),
  // Deletion HTTP verbs (DELETE)
  delete: rgb(HTTP_THEME.delete.r, HTTP_THEME.delete.g, HTTP_THEME.delete.b),
  // Status 1xx (Informational)
  info: rgb(HTTP_THEME.info.r, HTTP_THEME.info.g, HTTP_THEME.info.b),
  // Status 2xx (Success)
  success: rgb(HTTP_THEME.success.r, HTTP_THEME.success.g, HTTP_THEME.success.b),
  // Status 3xx (Redirection)
  redirect: rgb(HTTP_THEME.redirect.r, HTTP_THEME.redirect.g, HTTP_THEME.redirect.b),
  // Status 4xx (Client error)
  clientError: rgb(HTTP_THEME.clientError.r, HTTP_THEME.clientError.g, HTTP_THEME.clientError.b),
  // Status 5xx (Server error)
  serverError: rgb(HTTP_THEME.serverError.r, HTTP_THEME.serverError.g, HTTP_THEME.serverError.b),
};
