/**
 * Vero Logger - Main orchestrator class.
 *
 * Slim class that delegates to formatters and helpers while providing a rich logging API.
 * Designed as a safe wrapper around native `console` - never overrides global console.
 *
 * @module
 */

import * as ansi from "../formatting/ansi.ts";
import { vero } from "../formatting/colors.ts";
import { format } from "../formatting/object-formatter.ts";
import { createLogCard, createTable } from "../formatting/layout.ts";
import {
  endTimer,
  incrementCounter,
  logTimer,
  resetCounter,
  startTimer,
} from "../performance/bench.ts";
import { getTerminalWidth } from "../utils/terminal.ts";
import { getTimestamp } from "../utils/time.ts";
import { ICONS } from "../constants/icons.ts";
import { SMALL_SCREEN_THRESHOLD } from "../constants/defaults.ts";
import type { LoggerConfig } from "../types/index.ts";
import { mergeConfig } from "./config.ts";

let groupIndentLevel = 0;

/**
 * Vero Logger Class.
 *
 * A zero-dependency visual logger with rich formatting, performance timing,
 * and responsive layout capabilities. Works identically across Deno, Node.js,
 * Bun, and Browsers.
 *
 * **Key Features:**
 * - **Console-safe wrapper**: Never overrides global `console`
 * - **Responsive layouts**: Auto-switches between table/card views
 * - **Rich formatting**: Objects, arrays, dates, errors with color coding
 * - **Performance timing**: Built-in high-precision timers
 * - **HTTP-aware**: Auto-colorizes status codes and verbs
 * - **Grouping & assertions**: Full console API parity
 *
 * @example
 * ```ts
 * import { logger } from "@tiagordebarros/vero";
 *
 * logger.info("Application started");
 * logger.success("Database connected");
 * logger.warn("API rate limit approaching");
 * logger.error("Authentication failed");
 * ```
 *
 * @example
 * ```ts
 * // Custom instance
 * import { Vero } from "@tiagordebarros/vero";
 *
 * const customLogger = new Vero({
 *   showTimestamp: false,
 *   useIcons: true
 * });
 * ```
 *
 * @example
 * ```ts
 * // Performance measurement
 * logger.time("database");
 * await queryDatabase();
 * logger.timeEnd("database");
 * // "database       ■■■■······  42.3ms"
 * ```
 */
export class Vero {
  private config: LoggerConfig;

  /**
   * Creates a new Vero logger instance.
   *
   * @param {Partial<LoggerConfig>} config - Optional configuration overrides.
   *
   * @example
   * ```ts
   * const logger = new Vero({ showTimestamp: false });
   * ```
   */
  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = mergeConfig(config);
  }

  /**
   * Internal rendering engine
   */
  private print(
    level: string,
    colorFn: (t: string) => string,
    args: unknown[],
    stream: "stdout" | "stderr" = "stdout",
  ) {
    const terminalWidth = getTerminalWidth();

    // Card view for small screens
    const useCardView = this.config.showTimestamp &&
      terminalWidth < SMALL_SCREEN_THRESHOLD;

    if (useCardView) {
      const badge = this.config.useIcons
        ? ICONS[level as keyof typeof ICONS] || level
        : level;
      const message = args.map((arg) =>
        typeof arg === "string" ? arg : format(arg)
      ).join(" ");

      const output = createLogCard(level, ansi.bold(colorFn(badge)), message);

      if (stream === "stderr") {
        console.error(output);
      } else {
        console.log(output);
      }
      return;
    }

    // Normal mode
    const parts: string[] = [];

    if (this.config.showTimestamp) {
      parts.push(ansi.dim(ansi.gray(getTimestamp())));
    }

    const icon = this.config.useIcons
      ? ICONS[level as keyof typeof ICONS] || level
      : level;
    const badge = ansi.bold(colorFn(icon));
    parts.push(badge);

    const indent = "  ".repeat(groupIndentLevel);
    const message = args.map((arg) =>
      typeof arg === "string" ? arg : format(arg)
    ).join(" ");

    parts.push(indent + message);

    const finalLog = parts.join("  ");

    if (stream === "stderr") {
      console.error(finalLog);
    } else {
      console.log(finalLog);
    }
  }

  /**
   * Logs a general message with white color.
   *
   * Uses the global `console.log()` for output. Accepts multiple arguments.
   *
   * @param {...unknown[]} args - Values to log.
   *
   * @example
   * ```ts
   * logger.log("Simple message");
   * logger.log("User:", user, "logged in");
   * ```
   */
  log(...args: unknown[]) {
    const coloredArgs = args.map((arg) =>
      typeof arg === "string" ? ansi.white(arg) : arg
    );
    this.print("log", ansi.white, coloredArgs);
  }

  /**
   * Logs an informational message in sky blue.
   *
   * @param {...unknown[]} args - Values to log.
   *
   * @example
   * ```ts
   * logger.info("Application started");
   * logger.info("Server listening on port", 3000);
   * ```
   */
  info(...args: unknown[]) {
    const icon = this.config.useIcons ? ICONS.info : "INFO";
    const coloredArgs = args.map((arg) =>
      typeof arg === "string" ? vero.info(arg) : arg
    );
    this.print(icon, vero.info, coloredArgs);
  }

  /**
   * Logs a success message in mint green.
   *
   * @param {...unknown[]} args - Values to log.
   *
   * @example
   * ```ts
   * logger.success("Database connection established");
   * logger.success("File saved:", filename);
   * ```
   */
  success(...args: unknown[]) {
    const icon = this.config.useIcons ? ICONS.success : "SUCCESS";
    const coloredArgs = args.map((arg) =>
      typeof arg === "string" ? vero.success(arg) : arg
    );
    this.print(icon, vero.success, coloredArgs);
  }

  /**
   * Logs a warning message in peach orange.
   *
   * @param {...unknown[]} args - Values to log.
   *
   * @example
   * ```ts
   * logger.warn("API rate limit approaching");
   * logger.warn("Deprecated method called:", methodName);
   * ```
   */
  warn(...args: unknown[]) {
    const icon = this.config.useIcons ? ICONS.warn : "WARN";
    const coloredArgs = args.map((arg) =>
      typeof arg === "string" ? vero.warn(arg) : arg
    );
    this.print(icon, vero.warn, coloredArgs);
  }

  /**
   * Logs an error message in soft pink using stderr.
   *
   * Uses `console.error()` instead of `console.log()` so CI/CD tools
   * can detect failures via stderr stream.
   *
   * @param {...unknown[]} args - Values to log.
   *
   * @example
   * ```ts
   * logger.error("Authentication failed");
   * logger.error("Database connection error:", err);
   * ```
   */
  error(...args: unknown[]) {
    const icon = this.config.useIcons ? ICONS.error : "ERROR";
    const coloredArgs = args.map((arg) =>
      typeof arg === "string" ? vero.error(arg) : arg
    );
    this.print(icon, vero.error, coloredArgs, "stderr");
  }

  /**
   * Logs a debug message in dimmed gray.
   *
   * @param {...unknown[]} args - Values to log.
   *
   * @example
   * ```ts
   * logger.debug("Cache miss for key:", cacheKey);
   * logger.debug("Processing step 3 of 5");
   * ```
   */
  debug(...args: unknown[]) {
    const icon = this.config.useIcons ? ICONS.debug : "DEBUG";
    const coloredArgs = args.map((arg) =>
      typeof arg === "string" ? ansi.dim(arg) : arg
    );
    this.print(icon, ansi.dim, coloredArgs);
  }

  /**
   * Clears the terminal screen.
   *
   * Delegates to native `console.clear()`.
   *
   * @example
   * ```ts
   * logger.clear();
   * ```
   */
  clear() {
    console.clear();
  }

  /**
   * Prints a blank line.
   *
   * @example
   * ```ts
   * logger.log("First line");
   * logger.br();
   * logger.log("Second line with space above");
   * ```
   */
  br() {
    console.log("");
  }

  /**
   * Prints a horizontal rule (full-width line).
   *
   * Adapts to terminal width automatically.
   *
   * @example
   * ```ts
   * logger.hr();
   * // ────────────────────────────────────
   * ```
   */
  hr() {
    const terminalWidth = getTerminalWidth();
    console.log(ansi.dim(ansi.gray("─".repeat(terminalWidth))));
  }

  /**
   * Renders an array of objects as an ASCII table.
   *
   * Automatically switches between table mode and card view based on:
   * - Number of columns (>6 = cards)
   * - Terminal width (won't fit = cards)
   * - Content readability
   *
   * @param {unknown[]} data - Array of objects (or primitive values).
   *
   * @example
   * ```ts
   * const users = [
   *   { id: 1, name: "Alice", age: 30 },
   *   { id: 2, name: "Bob", age: 25 }
   * ];
   * logger.table(users);
   * ```
   *
   * @example
   * ```ts
   * // Primitive values are auto-wrapped
   * logger.table([1, 2, 3]);
   * ```
   */
  table(data: unknown[]) {
    if (!Array.isArray(data)) {
      this.warn("table() expects an array. Using standard log:");
      this.log(data);
      return;
    }

    console.log(createTable(data));
  }

  /**
   * Starts a performance timer with the specified label.
   *
   * Records high-precision timestamp using `performance.now()`.
   * Use `timeEnd()` to stop and display results.
   *
   * @param {string} label - Unique timer identifier.
   *
   * @example
   * ```ts
   * logger.time("api-request");
   * await fetch("/api/data");
   * logger.timeEnd("api-request");
   * // "api-request     ■■■■······  123.4ms"
   * ```
   */
  time(label: string) {
    startTimer(label);
  }

  /**
   * Stops a timer and displays a visual performance bar.
   *
   * Bar is color-coded:
   * - Green: &lt;50ms (fast)
   * - Yellow: 50-200ms (medium)
   * - Red: &gt;200ms (slow)
   *
   * @param {string} label - Timer label to stop.
   *
   * @example
   * ```ts
   * logger.time("database");
   * await queryDB();
   * logger.timeEnd("database");
   * ```
   */
  timeEnd(label: string) {
    const terminalWidth = getTerminalWidth();
    const useCardView = this.config.showTimestamp &&
      terminalWidth < SMALL_SCREEN_THRESHOLD;

    const cardWidth = Math.min(terminalWidth - 4, 60);
    const innerWidth = cardWidth - 1;
    const iconAndSpacing = 4;
    const maxBarWidth = useCardView ? innerWidth - iconAndSpacing : undefined;

    const result = endTimer(label, maxBarWidth);
    if (result) {
      const icon = this.config.useIcons ? ICONS.time : "TIME";
      this.print(icon, vero.type, [result]);
    }
  }

  /**
   * Logs elapsed time without stopping the timer.
   *
   * Useful for intermediate checkpoints or progress tracking.
   * Accepts optional additional arguments to log with the timing.
   *
   * @param {string} label - Timer label to check.
   * @param {...unknown[]} args - Optional additional values to log.
   *
   * @example
   * ```ts
   * logger.time("long-task");
   * await step1();
   * logger.timeLog("long-task", "Step 1 complete");
   * await step2();
   * logger.timeEnd("long-task");
   * ```
   */
  timeLog(label: string, ...args: unknown[]) {
    const terminalWidth = getTerminalWidth();
    const useCardView = this.config.showTimestamp &&
      terminalWidth < SMALL_SCREEN_THRESHOLD;

    const cardWidth = Math.min(terminalWidth - 4, 60);
    const innerWidth = cardWidth - 1;
    const iconAndSpacing = 4;
    const maxBarWidth = useCardView ? innerWidth - iconAndSpacing : undefined;

    const visualization = logTimer(label, maxBarWidth);
    if (!visualization) {
      this.warn(`Timer '${label}' not found.`);
      return;
    }

    const icon = this.config.useIcons ? ICONS.time : "TIME";
    const extraMessage = args.length > 0
      ? " " + args.map((arg) => (typeof arg === "string" ? arg : format(arg)))
        .join(" ")
      : "";

    const fullMessage = `${visualization}${extraMessage}`;
    this.print(icon, vero.type, [fullMessage]);
  }

  /**
   * Measures execution time of a function (sync or async).
   *
   * Automatically starts timer, executes function, stops timer, and returns result.
   * Convenient wrapper for timing operations without manual timer management.
   *
   * @template T - Return type of the measured function.
   * @param {string} label - Timer label for display.
   * @param {() => Promise<T> | T} fn - Function to measure (sync or async).
   * @returns {Promise<T>} Promise resolving to function's return value.
   *
   * @example
   * ```ts
   * const data = await logger.measure("fetch-users", async () => {
   *   return await fetchUsers();
   * });
   * // "fetch-users     ■■■■······  456.7ms"
   * ```
   */
  async measure<T>(label: string, fn: () => Promise<T> | T): Promise<T> {
    this.time(label);
    const result = await fn();
    this.timeEnd(label);
    return result;
  }

  /**
   * Starts a log group with optional title.
   *
   * Subsequent logs are indented until `groupEnd()` is called.
   * Groups can be nested.
   *
   * @param {string} [title] - Optional group title.
   *
   * @example
   * ```ts
   * logger.group("User Actions");
   * logger.log("Login successful");
   * logger.log("Profile loaded");
   * logger.groupEnd();
   * ```
   */
  group(title?: string) {
    if (title) this.log(ansi.bold(title));
    groupIndentLevel++;
  }

  /**
   * Ends the current log group.
   *
   * Decreases indentation level for subsequent logs.
   *
   * @example
   * ```ts
   * logger.group("Processing");
   * logger.log("Step 1");
   * logger.groupEnd();
   * ```
   */
  groupEnd() {
    if (groupIndentLevel > 0) groupIndentLevel--;
  }

  /**
   * Creates a collapsed group (visually distinct).
   *
   * Similar to `group()` but with a collapsed icon indicator.
   * Useful for optional/verbose information.
   *
   * @param {...unknown[]} args - Group label and/or content.
   *
   * @example
   * ```ts
   * logger.groupCollapsed("Debug Info");
   * logger.log("Detailed state:", state);
   * logger.groupEnd();
   * ```
   */
  groupCollapsed(...args: unknown[]) {
    const icon = this.config.useIcons ? ICONS.groupCollapsed : "GROUP";
    const message = args.length > 0 ? args : ["Group"];
    this.print(icon, ansi.dim, message.map((m) => ansi.gray(String(m))));
    groupIndentLevel++;
  }

  /**
   * Increments and returns a counter value.
   *
   * Internal counter tracking. Use `count()` for display, or `counter()`
   * for programmatic access to the count value.
   *
   * @param {string} label - Counter identifier.
   * @returns {number} New counter value.
   *
   * @example
   * ```ts
   * const count = logger.counter("api-calls");
   * console.log(count); // 1
   * ```
   */
  counter(label: string): number {
    return incrementCounter(label);
  }

  /**
   * Resets a counter to zero.
   *
   * @param {string} label - Counter identifier to reset.
   *
   * @example
   * ```ts
   * logger.resetCounter("iterations");
   * ```
   */
  resetCounter(label: string) {
    resetCounter(label);
  }

  /**
   * Counts and displays the number of times this line was called.
   *
   * Compatible with `console.count()` API.
   * Displays as: `label: count`
   *
   * @param {string} [label="default"] - Counter label.
   *
   * @example
   * ```ts
   * logger.count("loop");
   * logger.count("loop");
   * logger.count("loop");
   * // Output: "loop: 1", "loop: 2", "loop: 3"
   * ```
   */
  count(label: string = "default"): void {
    const currentCount = incrementCounter(label);
    const icon = this.config.useIcons ? ICONS.count : "COUNT";
    this.print(icon, ansi.cyan, [`${label}: ${currentCount}`]);
  }

  /**
   * Resets the counter for the given label.
   *
   * Compatible with `console.countReset()` API.
   *
   * @param {string} [label="default"] - Counter label to reset.
   *
   * @example
   * ```ts
   * logger.count("requests"); // requests: 1
   * logger.countReset("requests");
   * logger.count("requests"); // requests: 1
   * ```
   */
  countReset(label: string = "default"): void {
    resetCounter(label);
  }

  /**
   * Displays GitHub Copilot CLI Challenge 2026 branding.
   *
   * Special method for the challenge submission. Shows branded header
   * with GitHub and Copilot colors.
   *
   * @example
   * ```ts
   * logger.copilot();
   * // ────────────────────────────────────
   * //   GitHub Copilot CLI Challenge 2026
   * //   Generated with AI assistance,
   * //   refined by human craft.
   * // ────────────────────────────────────
   * ```
   */
  copilot() {
    const ghColor = ansi.hex("#ffffff");
    const copilotColor = ansi.hex("#6f90ff");

    this.hr();
    console.log(
      "  " +
        ghColor("GitHub") +
        " " +
        ansi.bold(copilotColor("Copilot")) +
        ansi.dim(ansi.gray(" CLI Challenge 2026")),
    );

    console.log(
      "  " +
        ansi.italic(
          ansi.gray("Generated with AI assistance,\n  refined by human craft."),
        ),
    );

    this.hr();
  }

  /**
   * Heading Level 1 - The Box (maximum emphasis).
   *
   * Renders text in a double-bordered box with Amethyst (#8b5cf6) color.
   * Adapts to terminal width (full-width on mobile, centered otherwise).
   *
   * @param {string} text - Heading text.
   *
   * @example
   * ```ts
   * logger.h1("Application Name");
   * // ╔══════════════════╗
   * // ║  Application Name ║
   * // ╚══════════════════╝
   * ```
   */
  h1(text: string) {
    const width = getTerminalWidth();
    const MOBILE_THRESHOLD = 60;
    const isMobile = width < MOBILE_THRESHOLD;
    const color = ansi.hex("#8b5cf6");

    if (isMobile) {
      const boxWidth = width - 1;
      const topBorder = color("╔" + "═".repeat(boxWidth - 2) + "╗");
      const textLine = color("║") + " " + text.padEnd(boxWidth - 4) + " " +
        color("║");
      const bottomBorder = color("╚" + "═".repeat(boxWidth - 2) + "╝");
      console.log("\n" + topBorder);
      console.log(textLine);
      console.log(bottomBorder + "\n");
    } else {
      const padding = 4;
      const boxWidth = text.length + padding * 2;
      const topBorder = color("╔" + "═".repeat(boxWidth) + "╗");
      const textLine = color("║") + " ".repeat(padding) + text +
        " ".repeat(padding) + color("║");
      const bottomBorder = color("╚" + "═".repeat(boxWidth) + "╝");
      console.log("\n" + topBorder);
      console.log(textLine);
      console.log(bottomBorder + "\n");
    }
  }

  /**
   * Heading Level 2 - The Divider (strong section break).
   *
   * Renders uppercase text followed by a horizontal line.
   * Uses cyan color for prominence.
   *
   * @param {string} text - Heading text (auto-converted to uppercase).
   *
   * @example
   * ```ts
   * logger.h2("Configuration");
   * // CONFIGURATION ━━━━━━━━━━━━━━
   * ```
   */
  h2(text: string) {
    const width = getTerminalWidth();
    const textUpper = text.toUpperCase();
    const title = ansi.bold(ansi.cyan(textUpper));
    const remainingSpace = Math.max(0, width - textUpper.length - 1);
    const divider = ansi.cyan("━".repeat(remainingSpace));
    console.log(`\n${title} ${divider}`);
  }

  /**
   * Heading Level 3 - The Block (section heading).
   *
   * Renders text prefixed with a green vertical bar.
   *
   * @param {string} text - Heading text.
   *
   * @example
   * ```ts
   * logger.h3("Database Setup");
   * // ▍ Database Setup
   * ```
   */
  h3(text: string) {
    const prefix = ansi.hex("#10b981")("▍");
    const title = ansi.bold(text);
    console.log(`${prefix} ${title}`);
  }

  /**
   * Heading Level 4 - The Underline (subsection).
   *
   * Renders text with an underline on the next line.
   *
   * @param {string} text - Heading text.
   *
   * @example
   * ```ts
   * logger.h4("API Endpoints");
   * // API Endpoints
   * // ─────────────
   * ```
   */
  h4(text: string) {
    const underline = ansi.dim("─".repeat(text.length));
    console.log(text);
    console.log(underline);
  }

  /**
   * Heading Level 5 - The Label (minor heading).
   *
   * Renders dimmed uppercase text with trailing `>`.
   *
   * @param {string} text - Heading text (auto-converted to uppercase).
   *
   * @example
   * ```ts
   * logger.h5("Details");
   * // DETAILS >
   * ```
   */
  h5(text: string) {
    const textUpper = text.toUpperCase();
    const title = ansi.dim(textUpper + " >");
    console.log(title);
  }

  /**
   * Heading Level 6 - The Item (list item style).
   *
   * Renders dimmed italic text with `›` prefix.
   *
   * @param {string} text - Heading text.
   *
   * @example
   * ```ts
   * logger.h6("Note");
   * // › Note
   * ```
   */
  h6(text: string) {
    const prefix = "› ";
    const title = ansi.dim(ansi.italic(text));
    console.log(`${prefix}${title}`);
  }

  /**
   * Assertion logging - only logs if condition is false.
   *
   * Compatible with `console.assert()` API. Logs error with stack trace
   * when the condition evaluates to `false`.
   *
   * @param {boolean} condition - Condition to test.
   * @param {...unknown[]} args - Values to log if assertion fails.
   *
   * @example
   * ```ts
   * logger.assert(user !== null, "User must be defined");
   * // Only logs if user is null
   * ```
   *
   * @example
   * ```ts
   * const result = calculate();
   * logger.assert(result > 0, "Result must be positive", result);
   * ```
   */
  assert(condition: boolean, ...args: unknown[]) {
    if (!condition) {
      const icon = this.config.useIcons ? ICONS.assert : "ASSERT";
      const message = args.length > 0 ? args : ["Assertion failed"];

      const stack = new Error().stack;
      let stackLines: string[] = [];
      if (stack) {
        stackLines = stack.split("\n").slice(2).map((line) => line.trim());
      }

      const terminalWidth = getTerminalWidth();
      const useCardView = this.config.showTimestamp &&
        terminalWidth < SMALL_SCREEN_THRESHOLD;

      if (useCardView && stackLines.length > 0) {
        const allArgs = [
          ...message,
          "\n" + ansi.dim(ansi.gray(stackLines.join("\n"))),
        ];
        const coloredArgs = allArgs.map((arg) =>
          typeof arg === "string" ? vero.error(arg) : arg
        );
        this.print(icon, vero.error, coloredArgs, "stderr");
      } else {
        const coloredArgs = message.map((arg) =>
          typeof arg === "string" ? vero.error(arg) : arg
        );
        this.print(icon, vero.error, coloredArgs, "stderr");

        if (stackLines.length > 0) {
          console.error(ansi.dim(ansi.gray(stackLines.join("\n"))));
        }
      }
    }
  }

  /**
   * Displays an object with detailed inspection.
   *
   * Compatible with `console.dir()` API. Uses the object formatter
   * with configurable depth for detailed property inspection.
   *
   * @param {unknown} obj - Object to inspect.
   * @param {object} [options] - Formatting options.
   * @param {number} [options.depth=10] - Maximum recursion depth.
   * @param {boolean} [options.colors] - Ignored (colors always enabled in Vero).
   *
   * @example
   * ```ts
   * logger.dir(complexObject, { depth: 3 });
   * ```
   */
  dir(obj: unknown, options?: { depth?: number; colors?: boolean }) {
    const icon = this.config.useIcons ? ICONS.dir : "DIR";
    const depth = options?.depth ?? 10;
    const formatted = format(obj, { maxDepth: depth });
    this.print(icon, vero.type, [formatted]);
  }

  /**
   * Displays an XML/HTML element representation.
   *
   * Compatible with `console.dirxml()` API. Currently uses the same
   * formatter as `dir()` - future versions may add XML-specific formatting.
   *
   * @param {unknown} obj - Object to display.
   *
   * @example
   * ```ts
   * logger.dirxml(domElement);
   * ```
   */
  dirxml(obj: unknown) {
    const icon = this.config.useIcons ? ICONS.dirxml : "XML";
    const formatted = format(obj);
    this.print(icon, vero.type, [formatted]);
  }

  /**
   * Outputs a stack trace to the console.
   *
   * Compatible with `console.trace()` API. Shows the call stack
   * from the point where this method was invoked.
   *
   * @param {...unknown[]} args - Optional label/message to display with trace.
   *
   * @example
   * ```ts
   * function deeplyNested() {
   *   logger.trace("Execution path");
   * }
   * ```
   */
  trace(...args: unknown[]) {
    const icon = this.config.useIcons ? ICONS.trace : "TRACE";
    const stack = new Error().stack;
    const stackLines = stack ? stack.split("\n").slice(2) : [];

    const terminalWidth = getTerminalWidth();
    const useCardView = this.config.showTimestamp &&
      terminalWidth < SMALL_SCREEN_THRESHOLD;

    if (useCardView && stackLines.length > 0) {
      const message = args.length > 0 ? args : ["console.trace"];
      const allArgs = [
        ...message,
        "\n" + ansi.dim(ansi.gray(stackLines.join("\n"))),
      ];
      const coloredArgs = allArgs.map((arg) =>
        typeof arg === "string" ? ansi.dim(arg) : arg
      );
      this.print(icon, ansi.dim, coloredArgs);
    } else {
      if (args.length > 0) {
        const coloredArgs = args.map((arg) =>
          typeof arg === "string" ? ansi.dim(arg) : arg
        );
        this.print(icon, ansi.dim, coloredArgs);
      }

      if (stackLines.length > 0) {
        console.log(ansi.dim(ansi.gray(stackLines.join("\n"))));
      }
    }
  }
}

/**
 * Default logger instance with standard configuration.
 *
 * Pre-configured Vero logger ready to use. Equivalent to `new Vero()`.
 *
 * @example
 * ```ts
 * import { logger } from "@tiagordebarros/vero";
 *
 * logger.info("Application started");
 * logger.table(data);
 * ```
 */
export const logger: Vero = new Vero();
