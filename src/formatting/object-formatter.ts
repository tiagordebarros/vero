/**
 * Object and value formatter.
 *
 * Recursively formats any JavaScript value into colorized ANSI strings.
 * Supports primitives, objects, arrays, dates, errors, and more with
 * intelligent type detection and semantic colorization.
 *
 * Features:
 * - **Circular reference protection** using WeakSet
 * - **Depth limiting** to prevent infinite recursion
 * - **HTTP-aware colorization** for status codes and verbs
 * - **Smart single/multi-line rendering** for arrays and objects
 *
 * @module
 */

import * as ansi from "./ansi.ts";
import { http } from "./colors.ts";
import { vero } from "./colors.ts";
import type { FormatOptions } from "../types/index.ts";
import { DEFAULT_INDENT } from "../constants/defaults.ts";

/**
 * Formats any JavaScript value into a colorized ANSI string.
 *
 * Recursively traverses objects and arrays while protecting against circular references.
 * Applies semantic colors based on type and content (e.g., HTTP status codes, verbs).
 *
 * **Type-specific behaviors:**
 * - **Primitives**: Color-coded (strings=green, numbers=amber, booleans=yellow/red)
 * - **HTTP Status Codes**: Auto-detected and colored by range (1xx-5xx)
 * - **HTTP Verbs**: Auto-detected and colored by safety (GET=green, DELETE=red)
 * - **Arrays**: Single-line if short (&lt;60 chars), multi-line otherwise
 * - **Objects**: Nested indentation with property highlighting
 * - **Dates**: ISO 8601 format in magenta
 * - **Errors**: Name, message, and first stack frame
 *
 * @param {unknown} value - The value to format (any type).
 * @param {Partial<FormatOptions>} [options] - Formatting options.
 * @returns {string} ANSI-formatted string representation.
 *
 * @example
 * ```ts
 * // Primitive values
 * format(42);        // Amber "42"
 * format("hello");   // Green "hello"
 * format(true);      // Yellow "true"
 * format(null);      // Gray bold "null"
 * ```
 *
 * @example
 * ```ts
 * // HTTP-aware formatting
 * format(200);       // Green "200" (success)
 * format(404);       // Orange "404" (client error)
 * format("GET");     // Green "GET" (safe verb)
 * format("DELETE");  // Pink "DELETE" (destructive)
 * ```
 *
 * @example
 * ```ts
 * // Complex objects
 * format({ name: "Alice", age: 30 });
 * // {
 * //   name: "Alice",
 * //   age: 30
 * // }
 * ```
 *
 * @example
 * ```ts
 * // Circular reference protection
 * const obj: any = { name: "Test" };
 * obj.self = obj;
 * format(obj);
 * // {
 * //   name: "Test",
 * //   self: [Circular]
 * // }
 * ```
 */
export function format(
  value: unknown,
  options: Partial<FormatOptions> = {},
): string {
  const opts: FormatOptions = {
    depth: options.depth || 0,
    maxDepth: options.maxDepth || 10,
    seen: options.seen || new WeakSet(),
    compact: options.compact || false,
  };

  if (value === null) return ansi.bold(ansi.gray("null"));
  if (value === undefined) {
    return opts.compact ? "-" : ansi.dim(ansi.gray("undefined"));
  }

  if (typeof value === "boolean") {
    return value ? ansi.yellow("true") : ansi.red("false");
  }

  if (typeof value === "number") {
    if (Number.isInteger(value) && value >= 100 && value < 600) {
      const code = value;
      if (code >= 100 && code < 200) {
        return http.info(String(code));
      } else if (code >= 200 && code < 300) {
        return http.success(String(code));
      } else if (code >= 300 && code < 400) {
        return http.redirect(String(code));
      } else if (code >= 400 && code < 500) {
        return http.clientError(String(code));
      } else if (code >= 500 && code < 600) {
        return http.serverError(String(code));
      }
    }

    return ansi.hex("#f59e0b")(String(value));
  }

  if (typeof value === "string") {
    const httpVerbs = /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/;
    if (httpVerbs.test(value)) {
      const verb = value.toUpperCase();
      if (verb === "GET" || verb === "HEAD" || verb === "OPTIONS") {
        return http.safe(verb);
      } else if (verb === "DELETE") {
        return http.delete(verb);
      } else {
        return http.mutation(verb);
      }
    }

    if (opts.compact) {
      return ansi.green(value);
    }

    return ansi.green(`"${value}"`);
  }

  if (typeof value === "symbol") {
    return vero.type(value.toString());
  }

  if (typeof value === "function") {
    return vero.info(`[Function: ${value.name || "anonymous"}]`);
  }

  if (opts.depth >= opts.maxDepth) {
    return ansi.dim(ansi.cyan("[Object]"));
  }

  if (typeof value === "object") {
    if (opts.seen.has(value)) {
      return vero.error("[Circular]");
    }
    opts.seen.add(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";

    const items = value.map((item) => {
      return format(item, { ...opts, depth: opts.depth + 1 });
    });

    const singleLine = `[ ${items.join(", ")} ]`;
    if (singleLine.length < 60) return singleLine;

    const indentStr = DEFAULT_INDENT.repeat(opts.depth);
    const nestedIndent = DEFAULT_INDENT.repeat(opts.depth + 1);
    return `[\n${
      items.map((i) => `${nestedIndent}${i}`).join(",\n")
    }\n${indentStr}]`;
  }

  if (value instanceof Date) {
    return ansi.magenta(value.toISOString());
  }

  if (value instanceof Error) {
    const stack = value.stack?.split("\n")[1]?.trim() || "";
    return `${vero.error(`${value.name}: ${value.message}`)}\n${
      ansi.dim(stack)
    }`;
  }

  const keys = Object.keys(value as object);
  if (keys.length === 0) return "{}";

  const indentStr = DEFAULT_INDENT.repeat(opts.depth);
  const nestedIndent = DEFAULT_INDENT.repeat(opts.depth + 1);

  const lines = keys.map((key) => {
    const val = (value as Record<string, unknown>)[key];
    const formattedVal = format(val, { ...opts, depth: opts.depth + 1 });

    const keyDisplay = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
      ? key
      : `"${key}"`;

    return `${nestedIndent}${ansi.white(keyDisplay)}: ${formattedVal}`;
  });

  return `{\n${lines.join(",\n")}\n${indentStr}}`;
}
