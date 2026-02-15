/**
 * Performance profiling utilities.
 *
 * Visual timers and counters for user-facing performance measurement.
 * NOT related to Deno.bench (test framework) - this is for runtime profiling.
 *
 * Features:
 * - High-precision timing using `performance.now()`
 * - Visual progress bars with logarithmic scaling
 * - Color-coded performance thresholds (green/yellow/red)
 * - Counter utilities for tracking iterations
 *
 * @module
 */

import * as ansi from "../formatting/ansi.ts";
import { vero } from "../formatting/colors.ts";

const timers = new Map<string, number>();
const counters = new Map<string, number>();

const BAR_WIDTH = 20;
const CHAR_FILL = "■";
const CHAR_EMPTY = "·";

/**
 * Starts a performance timer with the specified label.
 *
 * Records the current high-precision timestamp using `performance.now()`.
 * Multiple timers can run simultaneously with different labels.
 *
 * @param {string} label - Unique identifier for the timer.
 *
 * @example
 * ```ts
 * startTimer("database-query");
 * await fetchData();
 * const result = endTimer("database-query");
 * console.log(result); // "database-query  ■■■■·····  42.3ms"
 * ```
 *
 * @see {@link endTimer} to stop the timer and get results.
 * @see {@link logTimer} to check elapsed time without stopping.
 */
export function startTimer(label: string) {
  timers.set(label, performance.now());
}

/**
 * Stops a timer and returns a formatted visualization string.
 *
 * Calculates elapsed time, removes the timer from memory, and generates
 * a visual bar representation with color-coded performance indicators:
 * - **Green** (&lt;50ms): Fast
 * - **Yellow** (50-200ms): Medium
 * - **Red** (&gt;200ms): Slow
 *
 * @param {string} label - Timer label to stop.
 * @param {number} [maxWidth] - Optional maximum width for bar (used in card view).
 * @returns {string | null} Formatted visualization string, or `null` if timer not found.
 *
 * @example
 * ```ts
 * startTimer("operation");
 * performTask();
 * const visualization = endTimer("operation");
 * console.log(visualization);
 * // "operation       ■■■■■■········  125.4ms"
 * ```
 */
export function endTimer(label: string, maxWidth?: number): string | null {
  const startTime = timers.get(label);
  if (startTime === undefined) return null;

  const endTime = performance.now();
  const duration = endTime - startTime;
  timers.delete(label);

  return renderBar(label, duration, maxWidth);
}

/**
 * Logs the current elapsed time without stopping the timer.
 *
 * Useful for intermediate checkpoints or progress tracking.
 * The timer continues running and can be checked again later.
 *
 * @param {string} label - Timer label to check.
 * @param {number} [maxWidth] - Optional maximum width for bar (used in card view).
 * @returns {string | null} Formatted visualization string, or `null` if timer not found.
 *
 * @example
 * ```ts
 * startTimer("long-operation");
 * await step1();
 * console.log(logTimer("long-operation")); // "long-operation  ■■····  89.2ms"
 * await step2();
 * console.log(endTimer("long-operation")); // "long-operation  ■■■■■·  203.5ms"
 * ```
 */
export function logTimer(label: string, maxWidth?: number): string | null {
  const startTime = timers.get(label);
  if (startTime === undefined) return null;

  const currentTime = performance.now();
  const duration = currentTime - startTime;

  return renderBar(label, duration, maxWidth);
}

/**
 * Increments a counter and returns the new value.
 *
 * Counters are stored in memory and persist until reset.
 * Useful for tracking iterations, events, or occurrences.
 *
 * @param {string} label - Counter identifier.
 * @returns {number} New counter value after increment.
 *
 * @example
 * ```ts
 * console.log(incrementCounter("api-calls")); // 1
 * console.log(incrementCounter("api-calls")); // 2
 * console.log(incrementCounter("api-calls")); // 3
 * ```
 */
export function incrementCounter(label: string): number {
  const current = counters.get(label) || 0;
  const next = current + 1;
  counters.set(label, next);
  return next;
}

/**
 * Resets a counter to zero.
 *
 * Removes the counter from memory. Next increment will start at 1.
 *
 * @param {string} label - Counter identifier to reset.
 *
 * @example
 * ```ts
 * incrementCounter("requests"); // 1
 * incrementCounter("requests"); // 2
 * resetCounter("requests");
 * incrementCounter("requests"); // 1
 * ```
 */
export function resetCounter(label: string): void {
  counters.delete(label);
}

/**
 * Renders a performance bar visualization.
 *
 * Creates a visual progress bar based on a 500ms performance budget.
 * Uses logarithmic scaling to fit most operations within the bar width.
 *
 * Color coding:
 * - **Green**: &lt;50ms (fast)
 * - **Yellow**: 50-200ms (medium)
 * - **Red**: &gt;200ms (slow)
 *
 * @param {string} label - Operation label.
 * @param {number} ms - Duration in milliseconds.
 * @param {number} [maxWidth] - Optional maximum width constraint for card view.
 * @returns {string} Formatted bar visualization with label and timing.
 *
 * @example
 * ```ts
 * const bar = renderBar("fetch", 42.5);
 * console.log(bar);
 * // "fetch           ■■■■······  42.5ms" (green)
 * ```
 */
function renderBar(label: string, ms: number, maxWidth?: number): string {
  let colorFn = vero.success;
  if (ms > 50) colorFn = vero.warn;
  if (ms > 200) colorFn = vero.error;

  const timeStr = ms < 10 ? ms.toFixed(3) : ms.toFixed(1);
  const timeLabel = colorFn(timeStr + "ms");

  let barWidth = BAR_WIDTH;
  const labelPadded = label.padEnd(15);

  if (maxWidth !== undefined) {
    const baseLabelLength = 15;
    const timeLabelLength = timeStr.length + 2;
    const spacesCount = 2;
    const availableForBar = maxWidth - baseLabelLength - timeLabelLength -
      spacesCount;

    if (availableForBar < 10) {
      return `${ansi.bold(ansi.white(labelPadded))} ${timeLabel}`;
    }

    barWidth = Math.min(Math.floor(availableForBar / 2), BAR_WIDTH);
  }

  const maxBudget = 500;
  const percent = Math.min(ms / maxBudget, 1);
  const fillCount = Math.ceil(percent * barWidth);
  const emptyCount = barWidth - fillCount;

  const filled = colorFn(CHAR_FILL.repeat(fillCount));
  const empty = ansi.dim(ansi.gray(CHAR_EMPTY.repeat(emptyCount)));

  return `${ansi.bold(ansi.white(labelPadded))} ${filled}${empty} ${timeLabel}`;
}
