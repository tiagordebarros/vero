/**
 * Color theme palettes
 *
 * Applies Vero's brand identity and HTTP status code semantics using the ANSI RGB engine.
 * These color palettes are **hardcoded by design** and NOT user-configurable.
 *
 * @module
 */

import { rgb } from "./ansi.ts";
import { HTTP_THEME, VERO_THEME } from "../constants/themes.ts";

/**
 * Vero brand color palette (pastel theme).
 *
 * These RGB values are carefully chosen for visual hierarchy and aesthetics.
 * They are **NOT user-configurable** to maintain consistent brand identity.
 *
 * Available colors:
 * - `error`: Soft pink (255, 175, 215) - for errors without harshness
 * - `success`: Mint green (135, 255, 175) - for successful operations and strings
 * - `info`: Pale sky blue (135, 215, 255) - for informational messages and properties
 * - `warn`: Peach orange (255, 215, 135) - for warnings and numbers
 * - `type`: Lavender purple (175, 135, 255) - for types and objects
 * - `border`: Stone gray (108, 108, 108) - for borders and punctuation
 *
 * @example
 * ```ts
 * import { vero } from "@tiagordebarros/vero";
 *
 * console.log(vero.error("Soft error message"));
 * console.log(vero.success("Operation completed"));
 * console.log(vero.warn("Warning: check this"));
 * ```
 */
export const vero: Record<string, (text: string) => string> = {
  error: rgb(VERO_THEME.error.r, VERO_THEME.error.g, VERO_THEME.error.b),
  success: rgb(
    VERO_THEME.success.r,
    VERO_THEME.success.g,
    VERO_THEME.success.b,
  ),
  info: rgb(VERO_THEME.info.r, VERO_THEME.info.g, VERO_THEME.info.b),
  warn: rgb(VERO_THEME.warn.r, VERO_THEME.warn.g, VERO_THEME.warn.b),
  type: rgb(VERO_THEME.type.r, VERO_THEME.type.g, VERO_THEME.type.b),
  border: rgb(VERO_THEME.border.r, VERO_THEME.border.g, VERO_THEME.border.b),
};

/**
 * HTTP-specific color palette for web development.
 *
 * Automatically colorizes HTTP verbs and status codes based on semantic meaning:
 *
 * **HTTP Verbs:**
 * - `safe`: Mint green - for GET, HEAD, OPTIONS (read-only operations)
 * - `mutation`: Peach orange - for POST, PUT, PATCH (data modification)
 * - `delete`: Soft pink - for DELETE (destructive operations)
 *
 * **HTTP Status Codes:**
 * - `info`: Lavender purple - for 1xx (informational/processing)
 * - `success`: Mint green - for 2xx (successful operations)
 * - `redirect`: Sky blue - for 3xx (redirections)
 * - `clientError`: Peach orange - for 4xx (client errors)
 * - `serverError`: Soft pink - for 5xx (server errors)
 *
 * @example
 * ```ts
 * import { http } from "@tiagordebarros/vero";
 *
 * console.log(http.safe("GET"));
 * console.log(http.mutation("POST"));
 * console.log(http.success("200"));
 * console.log(http.clientError("404"));
 * ```
 */
export const http: Record<string, (text: string) => string> = {
  safe: rgb(HTTP_THEME.safe.r, HTTP_THEME.safe.g, HTTP_THEME.safe.b),
  mutation: rgb(
    HTTP_THEME.mutation.r,
    HTTP_THEME.mutation.g,
    HTTP_THEME.mutation.b,
  ),
  delete: rgb(HTTP_THEME.delete.r, HTTP_THEME.delete.g, HTTP_THEME.delete.b),
  info: rgb(HTTP_THEME.info.r, HTTP_THEME.info.g, HTTP_THEME.info.b),
  success: rgb(
    HTTP_THEME.success.r,
    HTTP_THEME.success.g,
    HTTP_THEME.success.b,
  ),
  redirect: rgb(
    HTTP_THEME.redirect.r,
    HTTP_THEME.redirect.g,
    HTTP_THEME.redirect.b,
  ),
  clientError: rgb(
    HTTP_THEME.clientError.r,
    HTTP_THEME.clientError.g,
    HTTP_THEME.clientError.b,
  ),
  serverError: rgb(
    HTTP_THEME.serverError.r,
    HTTP_THEME.serverError.g,
    HTTP_THEME.serverError.b,
  ),
};
