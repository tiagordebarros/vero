/**
 * Vero Logger - Main orchestrator class
 * Slim class that delegates to formatters and helpers
 */

// Formatting
import * as ansi from "../formatting/ansi.ts";
import { vero } from "../formatting/colors.ts";
import { format } from "../formatting/object-formatter.ts";
import { createLogCard, createTable } from "../formatting/layout.ts";

// Performance
import {
  endTimer,
  incrementCounter,
  logTimer,
  resetCounter,
  startTimer,
} from "../performance/bench.ts";

// Utils
import { getTerminalWidth } from "../utils/terminal.ts";
import { getTimestamp } from "../utils/time.ts";

// Constants
import { ICONS } from "../constants/icons.ts";
import { SMALL_SCREEN_THRESHOLD } from "../constants/defaults.ts";

// Types
import type { LoggerConfig } from "../types/index.ts";

// Config
import { mergeConfig } from "./config.ts";

/**
 * Module-scoped group indentation level
 */
let groupIndentLevel = 0;

/**
 * Vero Logger Class
 */
export class Vero {
  private config: LoggerConfig;

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

  // Public logging methods
  log(...args: unknown[]) {
    const coloredArgs = args.map((arg) =>
      typeof arg === "string" ? ansi.white(arg) : arg
    );
    this.print("log", ansi.white, coloredArgs);
  }

  info(...args: unknown[]) {
    const icon = this.config.useIcons ? ICONS.info : "INFO";
    const coloredArgs = args.map((arg) =>
      typeof arg === "string" ? vero.info(arg) : arg
    );
    this.print(icon, vero.info, coloredArgs);
  }

  success(...args: unknown[]) {
    const icon = this.config.useIcons ? ICONS.success : "SUCCESS";
    const coloredArgs = args.map((arg) =>
      typeof arg === "string" ? vero.success(arg) : arg
    );
    this.print(icon, vero.success, coloredArgs);
  }

  warn(...args: unknown[]) {
    const icon = this.config.useIcons ? ICONS.warn : "WARN";
    const coloredArgs = args.map((arg) =>
      typeof arg === "string" ? vero.warn(arg) : arg
    );
    this.print(icon, vero.warn, coloredArgs);
  }

  error(...args: unknown[]) {
    const icon = this.config.useIcons ? ICONS.error : "ERROR";
    const coloredArgs = args.map((arg) =>
      typeof arg === "string" ? vero.error(arg) : arg
    );
    this.print(icon, vero.error, coloredArgs, "stderr");
  }

  debug(...args: unknown[]) {
    const icon = this.config.useIcons ? ICONS.debug : "DEBUG";
    const coloredArgs = args.map((arg) =>
      typeof arg === "string" ? ansi.dim(arg) : arg
    );
    this.print(icon, ansi.dim, coloredArgs);
  }

  clear() {
    console.clear();
  }

  br() {
    console.log("");
  }

  hr() {
    const terminalWidth = getTerminalWidth();
    console.log(ansi.dim(ansi.gray("─".repeat(terminalWidth))));
  }

  table(data: unknown[]) {
    if (!Array.isArray(data)) {
      this.warn("table() espera um array. Usando log padrão:");
      this.log(data);
      return;
    }

    console.log(createTable(data));
  }

  time(label: string) {
    startTimer(label);
  }

  timeEnd(label: string) {
    const terminalWidth = getTerminalWidth();
    const useCardView = this.config.showTimestamp &&
      terminalWidth < SMALL_SCREEN_THRESHOLD;

    // Calcular largura máxima para a barra em card view
    const cardWidth = Math.min(terminalWidth - 4, 60);
    const innerWidth = cardWidth - 1;
    const iconAndSpacing = 4; // " ◷  "
    const maxBarWidth = useCardView ? innerWidth - iconAndSpacing : undefined;

    const result = endTimer(label, maxBarWidth);
    if (result) {
      const icon = this.config.useIcons ? ICONS.time : "TIME";
      this.print(icon, vero.type, [result]);
    }
  }

  /**
   * Logs the time elapsed since a timer was started, without ending it
   */
  timeLog(label: string, ...args: unknown[]) {
    const terminalWidth = getTerminalWidth();
    const useCardView = this.config.showTimestamp &&
      terminalWidth < SMALL_SCREEN_THRESHOLD;

    const cardWidth = Math.min(terminalWidth - 4, 60);
    const innerWidth = cardWidth - 1;
    const iconAndSpacing = 4; // " ⏱  "
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

  async measure<T>(label: string, fn: () => Promise<T> | T): Promise<T> {
    this.time(label);
    const result = await fn();
    this.timeEnd(label);
    return result;
  }

  group(title?: string) {
    if (title) this.log(ansi.bold(title));
    groupIndentLevel++;
  }

  groupEnd() {
    if (groupIndentLevel > 0) groupIndentLevel--;
  }

  /**
   * Creates a collapsed group (visually distinct with collapsed icon)
   */
  groupCollapsed(...args: unknown[]) {
    const icon = this.config.useIcons ? ICONS.groupCollapsed : "GROUP";
    const message = args.length > 0 ? args : ["Group"];
    this.print(icon, ansi.dim, message.map((m) => ansi.gray(String(m))));
    groupIndentLevel++;
  }

  counter(label: string): number {
    return incrementCounter(label);
  }

  resetCounter(label: string) {
    resetCounter(label);
  }

  /**
   * Counts the number of times this line has been called with the given label
   */
  count(label: string = "default"): void {
    const currentCount = incrementCounter(label);
    const icon = this.config.useIcons ? ICONS.count : "COUNT";
    this.print(icon, ansi.cyan, [`${label}: ${currentCount}`]);
  }

  /**
   * Resets the counter with the given label
   */
  countReset(label: string = "default"): void {
    resetCounter(label);
  }

  /**
   * GitHub Copilot branding
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
        ansi.dim(ansi.gray(" CLI Hackathon 2026")),
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
   * Heading Level 1 - The Box
   * Maximum emphasis with double border
   */
  h1(text: string) {
    const width = getTerminalWidth();
    const MOBILE_THRESHOLD = 60;
    const isMobile = width < MOBILE_THRESHOLD;
    const color = ansi.hex("#8b5cf6"); // Amethyst

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
   * Heading Level 2 - The Divider
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
   * Heading Level 3 - The Block
   */
  h3(text: string) {
    const prefix = ansi.hex("#10b981")("▍");
    const title = ansi.bold(text);
    console.log(`${prefix} ${title}`);
  }

  /**
   * Heading Level 4 - The Underline
   */
  h4(text: string) {
    const underline = ansi.dim("─".repeat(text.length));
    console.log(text);
    console.log(underline);
  }

  /**
   * Heading Level 5 - The Label
   */
  h5(text: string) {
    const textUpper = text.toUpperCase();
    const title = ansi.dim(textUpper + " >");
    console.log(title);
  }

  /**
   * Heading Level 6 - The Item
   */
  h6(text: string) {
    const prefix = "› ";
    const title = ansi.dim(ansi.italic(text));
    console.log(`${prefix}${title}`);
  }

  /**
   * Assertion logging - only logs if condition is false
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
   * Displays an object with detailed inspection
   */
  dir(obj: unknown, options?: { depth?: number; colors?: boolean }) {
    const icon = this.config.useIcons ? ICONS.dir : "DIR";
    const depth = options?.depth ?? 10;
    const formatted = format(obj, { maxDepth: depth });
    this.print(icon, vero.type, [formatted]);
  }

  /**
   * Displays an XML/HTML element representation
   */
  dirxml(obj: unknown) {
    const icon = this.config.useIcons ? ICONS.dirxml : "XML";
    const formatted = format(obj);
    this.print(icon, vero.type, [formatted]);
  }

  /**
   * Outputs a stack trace to the console
   */
  trace(...args: unknown[]) {
    const icon = this.config.useIcons ? ICONS.trace : "TRACE";
    const stack = new Error().stack;
    const stackLines = stack ? stack.split("\n").slice(2) : [];
    
    const terminalWidth = getTerminalWidth();
    const useCardView = this.config.showTimestamp &&
      terminalWidth < SMALL_SCREEN_THRESHOLD;

    if (useCardView && stackLines.length > 0) {
      // Include stack trace in card view
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
      // Normal view - print separately
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
 * Default logger instance
 */
export const logger: Vero = new Vero();
