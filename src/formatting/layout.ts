/**
 * Layout rendering utilities
 * Domain-specific helpers for visual formatting (cards, tables, text wrapping)
 */

import * as ansi from "./ansi.ts";
import { format } from "./object-formatter.ts";
import { getTerminalWidth } from "../utils/terminal.ts";
import { stripAnsi, getActiveAnsiAt, sliceWithAnsi } from "../utils/text.ts";
import { getTimestamp } from "../utils/time.ts";
import { CARD_CHARS, TABLE_CHARS } from "../constants/box-chars.ts";
import { SMALL_SCREEN_THRESHOLD } from "../constants/defaults.ts";

/**
 * Quebra texto em múltiplas linhas respeitando a largura máxima
 * Preserva quebras de linha existentes (como em objetos formatados)
 * Linhas subsequentes são indentadas para alinhar com o início do texto
 *
 * HELPER DE DOMÍNIO: Esta função conhece a indentação padrão do Vero (4 espaços
 * que alinham com o espaço após " ℹ  "). É crítica para quebra de linhas
 * em cards e logs multi-linha.
 */
export function wrapText(text: string, maxWidth: number): string[] {
  const existingLines = text.split("\n");
  const result: string[] = [];
  const INDENT = "    "; // 4 espaços: alinha com início do texto após " ℹ  "

  // Detectar se é conteúdo de objeto (tem alguma linha com indentação)
  const isObjectContent = existingLines.some((line) => {
    const clean = stripAnsi(line);
    return clean.startsWith("  "); // 2 espaços = indentação de objeto
  });

  for (let i = 0; i < existingLines.length; i++) {
    const line = existingLines[i];
    const cleanLine = stripAnsi(line);

    if (cleanLine.length <= maxWidth) {
      // Linha cabe inteira
      if (i === 0) {
        // Primeira linha: sem indentação extra
        result.push(line);
      } else if (isObjectContent) {
        // Faz parte de objeto: manter exatamente como está
        result.push(line);
      } else {
        // Linha 2+ sem indentação (ex: stack trace)
        result.push(INDENT + line);
      }
    } else {
      // Linha precisa de wrap
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

        // Quebrar em espaço se possível
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
 * Cria um card visual para o log (usado em telas pequenas)
 */
export function createLogCard(
  _level: string,
  badge: string,
  message: string,
): string {
  const lines: string[] = [];
  const terminalWidth = getTerminalWidth();
  const cardWidth = Math.min(terminalWidth - 4, 60);

  // Header: Timestamp
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

  // Conteúdo: Badge + Message
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

  // Footer
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
 * Renderiza um card vertical para um registro de tabela (interno)
 */
function createCard(
  row: Record<string, unknown>,
  index: number,
  terminalWidth: number,
): string {
  const lines: string[] = [];
  const cardWidth = Math.min(terminalWidth - 4, 60);
  const contentWidth = cardWidth - 2;

  // Título do card
  const title = ` Registro #${index + 1} `;
  const titleLine = "─".repeat(Math.max(0, cardWidth - title.length));
  lines.push(
    ansi.gray(
      `${TABLE_CHARS.top.left}${title}${titleLine}${TABLE_CHARS.top.right}`,
    ),
  );

  // Propriedades
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

  // Base
  lines.push(
    ansi.gray(
      `${TABLE_CHARS.bottom.left}${"─".repeat(cardWidth)}${
        TABLE_CHARS.bottom.right
      }`,
    ),
  );

  return lines.join("\n");
}

/**
 * Cria uma tabela ASCII bonita e responsiva
 * Se não couber no terminal, renderiza como cards verticais
 */
export function createTable(data: unknown[]): string {
  if (!data || data.length === 0) {
    return ansi.dim(ansi.gray(" (Tabela Vazia) "));
  }

  // 1. Normalizar Input
  const rows = data.map((d) =>
    typeof d === "object" && d !== null ? d : { value: d }
  );

  // 2. Headers
  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));

  // 3. Stringify Matrix
  const stringMatrix = rows.map((row) => {
    return headers.map((header) => {
      const val = (row as Record<string, unknown>)[header];
      if (typeof val === "object" && val !== null) return "[Obj]";
      if (val === undefined) return "-";
      return String(val);
    });
  });

  // 4. Calcular Larguras
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

  // 4.1 Decidir entre MODO TABELA vs MODO CARD
  const MIN_READABLE_COL_WIDTH = 10;
  const TOO_MANY_COLUMNS = headers.length > 6;

  const wouldNeedHeavyTruncation = totalWidth > maxTableWidth &&
    colWidths.some((w) => {
      const scaled = Math.floor(w * (maxTableWidth / totalWidth));
      return scaled < MIN_READABLE_COL_WIDTH;
    });

  if (TOO_MANY_COLUMNS || wouldNeedHeavyTruncation) {
    // MODO CARD
    return rows
      .map((row, i) =>
        createCard(row as Record<string, unknown>, i, terminalWidth)
      )
      .join("\n");
  }

  // 4.2 MODO TABELA: Ajustar larguras
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

  // 5. Funções de Desenho
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

  // 6. Renderização Final
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
