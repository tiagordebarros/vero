/**
 * Object/Value formatter
 * Formats any JavaScript value into colorized ANSI strings
 */

import * as ansi from "./ansi.ts";
import { http } from "./colors.ts";
import { vero } from "./colors.ts";
import type { FormatOptions } from "../types/index.ts";
import { DEFAULT_INDENT } from "../constants/defaults.ts";

/**
 * Formats any value into a colorized ANSI string
 * Supports primitives, objects, arrays, dates, errors, and more
 */
export function format(
  value: unknown,
  options: Partial<FormatOptions> = {},
): string {
  // Default configuration
  const opts: FormatOptions = {
    depth: options.depth || 0,
    maxDepth: options.maxDepth || 10, // Avoid infinitely deep objects
    seen: options.seen || new WeakSet(),
    compact: options.compact || false,
  };

  // 1. Primitive Types (Base recursion)
  if (value === null) return ansi.bold(ansi.gray("null"));
  if (value === undefined) {
    return opts.compact ? "-" : ansi.dim(ansi.gray("undefined"));
  }

  if (typeof value === "boolean") {
    // Booleans use yellow (true) and red (false) for clear distinction
    return value ? ansi.yellow("true") : ansi.red("false");
  }

  if (typeof value === "number") {
    // Detect HTTP status codes (100-599)
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

    // Numbers use Amber (peach orange) for distinction
    return ansi.hex("#f59e0b")(String(value));
  }

  if (typeof value === "string") {
    // Detect HTTP verbs
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

    // In compact mode (tables), don't add quotes
    if (opts.compact) {
      return ansi.green(value);
    }

    // Strings use basic green (distinct from success mint green)
    return ansi.green(`"${value}"`);
  }

  if (typeof value === "symbol") {
    return vero.type(value.toString());
  }

  if (typeof value === "function") {
    return vero.info(`[Function: ${value.name || "anonymous"}]`);
  }

  // 2. Complex Objects (Arrays, Objects, Maps, Errors)

  // Depth protection
  if (opts.depth >= opts.maxDepth) {
    return ansi.dim(ansi.cyan("[Object]")); // Stop here
  }

  // Circular reference protection
  if (typeof value === "object") {
    if (opts.seen.has(value)) {
      return vero.error("[Circular]");
    }
    opts.seen.add(value);
  }

  // Array handling
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";

    const items = value.map((item) => {
      return format(item, { ...opts, depth: opts.depth + 1 });
    });

    // If short array, keep on single line
    const singleLine = `[ ${items.join(", ")} ]`;
    if (singleLine.length < 60) return singleLine;

    // If long, break into lines
    const indentStr = DEFAULT_INDENT.repeat(opts.depth);
    const nestedIndent = DEFAULT_INDENT.repeat(opts.depth + 1);
    return `[\n${
      items.map((i) => `${nestedIndent}${i}`).join(",\n")
    }\n${indentStr}]`;
  }

  // Date handling
  if (value instanceof Date) {
    return ansi.magenta(value.toISOString());
  }

  // Error handling (simplified stack trace)
  if (value instanceof Error) {
    const stack = value.stack?.split("\n")[1]?.trim() || "";
    return `${vero.error(`${value.name}: ${value.message}`)}\n${
      ansi.dim(stack)
    }`;
  }

  // Generic object handling
  const keys = Object.keys(value as object);
  if (keys.length === 0) return "{}";

  const indentStr = DEFAULT_INDENT.repeat(opts.depth);
  const nestedIndent = DEFAULT_INDENT.repeat(opts.depth + 1);

  const lines = keys.map((key) => {
    const val = (value as Record<string, unknown>)[key];
    const formattedVal = format(val, { ...opts, depth: opts.depth + 1 });

    // Key is subtly colored, value shines
    // If key is valid JS identifier, no quotes
    const keyDisplay = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
      ? key
      : `"${key}"`;

    return `${nestedIndent}${ansi.white(keyDisplay)}: ${formattedVal}`;
  });

  return `{\n${lines.join(",\n")}\n${indentStr}}`;
}
