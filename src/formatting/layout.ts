/**
 * Layout rendering utilities.
 *
 * Domain-specific helpers for visual formatting including cards, tables, and text wrapping.
 * Handles responsive layout switching based on terminal width.
 *
 * @module
 */

import * as ansi from "./ansi.ts";
import { format } from "./object-formatter.ts";
import { getTerminalWidth } from "../utils/terminal.ts";
import { getActiveAnsiAt, sliceWithAnsi, stripAnsi } from "../utils/text.ts";
import { getTimestamp } from "../utils/time.ts";
import { CARD_CHARS, TABLE_CHARS } from "../constants/box-chars.ts";
import { SMALL_SCREEN_THRESHOLD } from "../constants/defaults.ts";

/**
 * Wraps text into multiple lines respecting maximum width.
 *
 * Preserves existing line breaks (e.g., in formatted objects) and indents
 * subsequent lines to align with the start of the text. Uses domain knowledge
 * of Vero's standard indentation (4 spaces, aligning after " ℹ  ").
 *
 * Critical for line wrapping in cards and multi-line logs.
 *
 * @param {string} text - Text to wrap (may contain ANSI codes and line breaks).
 * @param {number} maxWidth - Maximum visual width per line (excluding ANSI codes).
 * @returns {string[]} Array of wrapped lines.
 *
 * @example
 * ```ts
 * const lines = wrapText("A very long message that needs wrapping", 20);
 * // ["A very long message", "    that needs", "    wrapping"]
 * ```
 */
export function wrapText(text: string, maxWidth: number): string[] {
  const existingLines = text.split("\n");
  const result: string[] = [];
  const INDENT = "    ";

  const isObjectContent = existingLines.some((line) => {
    const clean = stripAnsi(line);
    return clean.startsWith("  ");
  });

  for (let i = 0; i < existingLines.length; i++) {
    const line = existingLines[i];
    const cleanLine = stripAnsi(line);

    if (cleanLine.length <= maxWidth) {
      if (i === 0) {
        result.push(line);
      } else if (isObjectContent) {
        result.push(line);
      } else {
        result.push(INDENT + line);
      }
    } else {
      let offset = 0;
      let isFirstPart = true;

      while (offset < cleanLine.length) {
        let prefix = "";
        let width = maxWidth;

        if (i === 0) {
          if (!isFirstPart) {
            prefix = INDENT;
            width = maxWidth - INDENT.length;
          }
        } else if (!isObjectContent) {
          prefix = INDENT;
          width = maxWidth - INDENT.length;
        } else {
          const originalIndent = cleanLine.match(/^ */)?.[0] || "";
          if (isFirstPart) {
            prefix = "";
          } else {
            prefix = originalIndent;
            width = maxWidth - originalIndent.length;
          }
        }

        const remaining = cleanLine.length - offset;
        if (remaining <= width) {
          let chunk = sliceWithAnsi(line, offset);

          if (!isFirstPart && i === 0) {
            const cleanChunk = stripAnsi(chunk);
            const isStackTrace = cleanChunk.trimStart().startsWith("at ");

            if (!isStackTrace) {
              const activeColor = getActiveAnsiAt(line, offset);
              if (activeColor) {
                chunk = activeColor + chunk;
              }
            }
          }

          result.push(prefix + chunk);
          break;
        }

        let breakPoint = offset + width;
        const lastSpace = cleanLine.lastIndexOf(" ", breakPoint);
        if (lastSpace > offset && lastSpace >= offset + width * 0.6) {
          breakPoint = lastSpace;
        }

        let chunk = sliceWithAnsi(line, offset, breakPoint);

        if (!isFirstPart && i === 0) {
          const cleanChunk = stripAnsi(chunk);
          const isStackTrace = cleanChunk.trimStart().startsWith("at ");

          if (!isStackTrace) {
            const activeColor = getActiveAnsiAt(line, offset);
            if (activeColor) {
              chunk = activeColor + chunk;
            }
          }
        }

        result.push(prefix + chunk);

        while (breakPoint < cleanLine.length && cleanLine[breakPoint] === " ") {
          breakPoint++;
        }

        offset = breakPoint;
        isFirstPart = false;
      }
    }
  }

  return result;
}

/**
 * Creates a visual card for log output (used on small screens).
 *
 * Renders a bordered card with:
 * - Header: Timestamp
 * - Body: Log badge (icon/label) + message with automatic wrapping
 * - Footer: Bottom border
 *
 * Automatically used when terminal width < 60 characters and timestamps are enabled.
 *
 * @param {string} _level - Log level (unused, kept for future enhancements).
 * @param {string} badge - Formatted badge text (e.g., colored icon).
 * @param {string} message - Log message content.
 * @returns {string} Formatted card as multi-line string.
 *
 * @example
 * ```ts
 * const card = createLogCard("info", "ℹ", "Application started");
 * // ╭ 14:32:18.042 ────╮
 * // │ ℹ  Application   │
 * // │    started       │
 * // ╰──────────────────╯
 * ```
 */
export function createLogCard(
  _level: string,
  badge: string,
  message: string,
): string {
  const lines: string[] = [];
  const terminalWidth = getTerminalWidth();
  const cardWidth = Math.min(terminalWidth - 4, 60);

  const timestamp = getTimestamp();
  const headerContent = ` ${timestamp} `;
  const headerLineWidth = cardWidth - headerContent.length;
  lines.push(
    ansi.gray(
      `${CARD_CHARS.top.left}${headerContent}${
        CARD_CHARS.top.h.repeat(Math.max(0, headerLineWidth))
      }${CARD_CHARS.top.right}`,
    ),
  );

  const fullContent = ` ${badge}  ${message}`;
  const rightPadding = 1;
  const innerWidth = cardWidth - rightPadding;
  const contentLines = wrapText(fullContent, innerWidth);

  contentLines.forEach((line) => {
    const cleanLine = stripAnsi(line);
    const padding = " ".repeat(Math.max(0, innerWidth - cleanLine.length));
    lines.push(
      `${ansi.gray(CARD_CHARS.vertical)}${line}${padding}${
        " ".repeat(rightPadding)
      }${ansi.gray(CARD_CHARS.vertical)}`,
    );
  });

  lines.push(
    ansi.gray(
      `${CARD_CHARS.bottom.left}${
        CARD_CHARS.bottom.h.repeat(cardWidth)
      }${CARD_CHARS.bottom.right}`,
    ),
  );

  return lines.join("\n");
}

/**
 * Renders a vertical card for a single table row (internal helper).
 *
 * Used when table data doesn't fit in traditional table layout.
 * Creates a bordered card showing each property as a key-value pair.
 *
 * @param {Record<string, unknown>} row - Row data (key-value pairs).
 * @param {number} index - Row index (for card title).
 * @param {number} terminalWidth - Current terminal width.
 * @returns {string} Formatted card as multi-line string.
 */
function createCard(
  row: Record<string, unknown>,
  index: number,
  terminalWidth: number,
): string {
  const lines: string[] = [];
  const cardWidth = Math.min(terminalWidth - 4, 60);
  const contentWidth = cardWidth - 2;

  const title = ` Record #${index + 1} `;
  const titleLine = "─".repeat(Math.max(0, cardWidth - title.length));
  lines.push(
    ansi.gray(
      `${TABLE_CHARS.top.left}${title}${titleLine}${TABLE_CHARS.top.right}`,
    ),
  );

  const entries = Object.entries(row);
  entries.forEach(([key, val]) => {
    const formattedValue = format(val, {
      depth: 0,
      maxDepth: 1,
      compact: true,
    });

    let valueStr: string;
    if (typeof val === "object" && val !== null) {
      valueStr = "[Obj]";
    } else if (val === undefined) {
      valueStr = "-";
    } else {
      valueStr = String(val);
    }

    const keyPart = ansi.bold(ansi.white(key));
    const separator = ansi.dim(": ");
    const display = `${keyPart}${separator}${formattedValue}`;

    const cleanLength = key.length + 2 + valueStr.length;
    const padding = " ".repeat(Math.max(0, contentWidth - cleanLength));

    lines.push(
      `${ansi.gray(TABLE_CHARS.vertical)} ${display}${padding} ${
        ansi.gray(TABLE_CHARS.vertical)
      }`,
    );
  });

  lines.push(
    ansi.gray(
      `${TABLE_CHARS.bottom.left}${
        "─".repeat(cardWidth)
      }${TABLE_CHARS.bottom.right}`,
    ),
  );

  return lines.join("\n");
}

/**
 * Creates a responsive ASCII table with automatic layout switching.
 *
 * Intelligently chooses between two rendering modes:
 * - **Table Mode** (≤6 columns, fits terminal): Traditional ASCII table with borders
 * - **Card View** (>6 columns or won't fit): Vertical cards for better readability
 *
 * Features:
 * - Auto-detection of object keys as headers
 * - Column width calculation and truncation
 * - Responsive scaling based on terminal width
 * - Colorized cells using the object formatter
 * - Small screen optimization (card expansion)
 *
 * @param {unknown[]} data - Array of objects to render (or primitive values).
 * @returns {string} Formatted table or card view as multi-line string.
 *
 * @example
 * ```ts
 * const users = [
 *   { id: 1, name: "Alice", age: 30 },
 *   { id: 2, name: "Bob", age: 25 }
 * ];
 * console.log(createTable(users));
 * // ╭────┬───────┬─────╮
 * // │ id │ name  │ age │
 * // ├────┼───────┼─────┤
 * // │ 1  │ Alice │ 30  │
 * // │ 2  │ Bob   │ 25  │
 * // ╰────┴───────┴─────╯
 * ```
 *
 * @example
 * ```ts
 * // Empty table
 * createTable([]);
 * // " (Empty Table) "
 * ```
 *
 * @example
 * ```ts
 * // Primitive values are wrapped
 * createTable([42, "hello", true]);
 * // ╭───────╮
 * // │ value │
 * // ├───────┤
 * // │ 42    │
 * // │ hello │
 * // │ true  │
 * // ╰───────╯
 * ```
 */
export function createTable(data: unknown[]): string {
  if (!data || data.length === 0) {
    return ansi.dim(ansi.gray(" (Empty Table) "));
  }

  const rows = data.map((d) =>
    typeof d === "object" && d !== null ? d : { value: d }
  );

  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));

  const stringMatrix = rows.map((row) => {
    return headers.map((header) => {
      const val = (row as Record<string, unknown>)[header];
      if (typeof val === "object" && val !== null) return "[Obj]";
      if (val === undefined) return "-";
      return String(val);
    });
  });

  const terminalWidth = getTerminalWidth();
  const maxTableWidth = terminalWidth - 2;

  const colWidths = headers.map((header, i) => {
    let max = header.length;
    stringMatrix.forEach((row) => {
      const len = row[i].length;
      if (len > max) max = len;
    });
    return max + 2;
  });

  const totalWidth = colWidths.reduce((sum, w) => sum + w, 0) +
    (headers.length + 1);

  const MIN_READABLE_COL_WIDTH = 10;
  const TOO_MANY_COLUMNS = headers.length > 6;

  const wouldNeedHeavyTruncation = totalWidth > maxTableWidth &&
    colWidths.some((w) => {
      const scaled = Math.floor(w * (maxTableWidth / totalWidth));
      return scaled < MIN_READABLE_COL_WIDTH;
    });

  if (TOO_MANY_COLUMNS || wouldNeedHeavyTruncation) {
    return rows
      .map((row, i) =>
        createCard(row as Record<string, unknown>, i, terminalWidth)
      )
      .join("\n");
  }

  const isSmallScreen = terminalWidth < SMALL_SCREEN_THRESHOLD;
  const bordersWidth = headers.length + 1;

  if (totalWidth > maxTableWidth) {
    const MIN_COL_WIDTH = 8;
    const availableWidth = maxTableWidth - bordersWidth;
    const scaleFactor = availableWidth / colWidths.reduce((s, w) => s + w, 0);

    for (let i = 0; i < colWidths.length; i++) {
      colWidths[i] = Math.max(
        MIN_COL_WIDTH,
        Math.floor(colWidths[i] * scaleFactor),
      );
    }
  } else if (isSmallScreen) {
    const cardWidth = Math.min(terminalWidth - 4, 60);
    const targetInnerWidth = cardWidth;
    const currentContentWidth = colWidths.reduce((s, w) => s + w, 0);
    const currentInnerWidth = currentContentWidth + (headers.length - 1);

    if (currentInnerWidth < targetInnerWidth) {
      const targetContentWidth = targetInnerWidth - (headers.length - 1);
      const expansionFactor = targetContentWidth / currentContentWidth;

      for (let i = 0; i < colWidths.length; i++) {
        colWidths[i] = Math.floor(colWidths[i] * expansionFactor);
      }

      const newTotal = colWidths.reduce((s, w) => s + w, 0);
      const remainder = targetContentWidth - newTotal;

      if (remainder > 0) {
        for (let i = 0; i < remainder && i < colWidths.length; i++) {
          colWidths[i]++;
        }
      }
    }
  }

  const drawLine = (type: "top" | "middle" | "bottom") => {
    const chars = TABLE_CHARS[type]!;
    const segments = colWidths.map((w) => chars.h.repeat(w));
    return `${chars.left}${segments.join(chars.mid!)}${chars.right}`;
  };

  const drawRow = (cells: string[], colorFn?: (s: string) => string) => {
    const content = cells.map((cell, i) => {
      let displayCell = cell;
      const maxCellWidth = colWidths[i] - 2;

      if (cell.length > maxCellWidth) {
        displayCell = cell.substring(0, maxCellWidth - 1) + "…";
      }

      const pad = colWidths[i] - displayCell.length;
      const padding = " ".repeat(pad - 1);
      const cleanCell = ` ${displayCell}${padding}`;
      return colorFn ? colorFn(cleanCell) : cleanCell;
    });
    const separator = ansi.gray(TABLE_CHARS.vertical);
    return `${separator}${content.join(separator)}${separator}`;
  };

  const lines: string[] = [];

  lines.push(ansi.gray(drawLine("top")));
  lines.push(drawRow(headers, (t) => ansi.bold(ansi.white(t))));
  lines.push(ansi.gray(drawLine("middle")));

  stringMatrix.forEach((row, i) => {
    const visualRow = row.map((_cellStr, colIndex) => {
      const originalVal = (rows[i] as Record<string, unknown>)[
        headers[colIndex]
      ];
      return format(originalVal, { depth: 0, maxDepth: 1, compact: true });
    });

    const content = visualRow
      .map((cellColorized, idx) => {
        let cleanLen = stringMatrix[i][idx].length;
        let displayCell = cellColorized;
        const maxCellWidth = colWidths[idx] - 2;

        if (cleanLen > maxCellWidth) {
          const cleanText = stringMatrix[i][idx];
          const truncated = cleanText.substring(0, maxCellWidth - 1) + "…";

          const originalVal = (rows[i] as Record<string, unknown>)[
            headers[idx]
          ];
          displayCell = format(originalVal, {
            depth: 0,
            maxDepth: 1,
            compact: true,
          });

          if (truncated.length < cleanText.length) {
            displayCell = ansi.dim(truncated);
          }

          cleanLen = truncated.length;
        }

        const pad = colWidths[idx] - cleanLen;
        return ` ${displayCell}${" ".repeat(pad - 1)}`;
      })
      .join(ansi.gray(TABLE_CHARS.vertical));

    lines.push(
      `${ansi.gray(TABLE_CHARS.vertical)}${content}${
        ansi.gray(TABLE_CHARS.vertical)
      }`,
    );
  });

  lines.push(ansi.gray(drawLine("bottom")));

  return lines.join("\n");
}
