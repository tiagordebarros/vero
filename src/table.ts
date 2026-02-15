import * as ansi from "./ansi.ts";
import type { format } from "./formatter.ts";
import { getTerminalWidth } from "./terminal.ts";

// Configuração visual da tabela (Bordas Unicode Arredondadas - igual aos cards)
const CHARS = {
  top: { left: "╭", mid: "┬", right: "╮", h: "─" },
  middle: { left: "├", mid: "┼", right: "┤", h: "─" },
  bottom: { left: "╰", mid: "┴", right: "╯", h: "─" },
  vertical: "│",
};

/**
 * Renderiza um card vertical para um registro
 */
function createCard(row: any, index: number, terminalWidth: number): string {
  const lines: string[] = [];
  const cardWidth = Math.min(terminalWidth - 4, 60); // Máximo 60 colunas para cards
  const contentWidth = cardWidth - 2; // Espaço interno (sem bordas)

  // Título do card
  const title = ` Registro #${index + 1} `;
  const titleLine = "─".repeat(Math.max(0, cardWidth - title.length));
  lines.push(
    ansi.gray(`${CHARS.top.left}${title}${titleLine}${CHARS.top.right}`),
  );

  // Propriedades
  const entries = Object.entries(row);
  entries.forEach(([key, val]) => {
    // Formatar valor
    let valueStr: string;
    if (typeof val === "object" && val !== null) {
      valueStr = "[Obj]";
    } else if (val === undefined) {
      valueStr = "-";
    } else {
      valueStr = String(val);
    }

    // Colorir baseado no tipo
    let coloredValue: string;
    if (typeof val === "number") {
      coloredValue = ansi.vero.warn(valueStr);
    } else if (typeof val === "boolean") {
      coloredValue = val
        ? ansi.vero.success(valueStr)
        : ansi.vero.error(valueStr);
    } else if (val === null || val === undefined) {
      coloredValue = ansi.dim(valueStr);
    } else {
      coloredValue = ansi.vero.info(valueStr);
    }

    // Montar linha: "│ key: value │"
    const keyPart = ansi.bold(ansi.white(key));
    const separator = ansi.dim(": ");
    const display = `${keyPart}${separator}${coloredValue}`;

    // Calcular padding (precisa remover códigos ANSI do cálculo)
    const cleanLength = key.length + 2 + valueStr.length; // key + ": " + value
    const padding = " ".repeat(Math.max(0, contentWidth - cleanLength));

    lines.push(
      `${ansi.gray(CHARS.vertical)} ${display}${padding} ${
        ansi.gray(CHARS.vertical)
      }`,
    );
  });

  // Base
  lines.push(
    ansi.gray(
      `${CHARS.bottom.left}${"─".repeat(cardWidth)}${CHARS.bottom.right}`,
    ),
  );

  return lines.join("\n");
}

/**
 * Cria uma tabela ASCII bonita e responsiva
 * Se não couber no terminal, renderiza como cards verticais
 */
export function createTable(data: any[]): string {
  if (!data || data.length === 0) {
    return ansi.dim(ansi.gray(" (Tabela Vazia) "));
  }

  // 1. Normalizar Input (garantir que é array de objetos)
  const rows = data.map((d) =>
    typeof d === "object" && d !== null ? d : { value: d }
  );

  // 2. Descobrir todas as colunas únicas (headers)
  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));

  // 3. Matriz de Dados (Stringificada)
  const stringMatrix = rows.map((row) => {
    return headers.map((header) => {
      const val = (row as any)[header];
      if (typeof val === "object" && val !== null) return "[Obj]";
      if (val === undefined) return "-";
      return String(val);
    });
  });

  // 4. Calcular Largura das Colunas e verificar se cabe no terminal
  const terminalWidth = getTerminalWidth();
  const maxTableWidth = terminalWidth - 2;

  const colWidths = headers.map((header, i) => {
    let max = header.length;
    stringMatrix.forEach((row) => {
      const len = row[i].length;
      if (len > max) max = len;
    });
    return max + 2; // +2 para padding
  });

  const totalWidth = colWidths.reduce((sum, w) => sum + w, 0) +
    (headers.length + 1);

  // 4.1 Decidir entre MODO TABELA vs MODO CARD
  // Usar card view se:
  // a) Muitas colunas (>6) tornam a tabela ilegível
  // b) Tabela muito larga e precisaria de truncamento agressivo
  const MIN_READABLE_COL_WIDTH = 10;
  const TOO_MANY_COLUMNS = headers.length > 6;

  const wouldNeedHeavyTruncation = totalWidth > maxTableWidth &&
    colWidths.some((w) => {
      const scaled = Math.floor(w * (maxTableWidth / totalWidth));
      return scaled < MIN_READABLE_COL_WIDTH;
    });

  if (TOO_MANY_COLUMNS || wouldNeedHeavyTruncation) {
    // MODO CARD: Renderizar cada linha como um card vertical
    return rows.map((row, i) => createCard(row, i, terminalWidth)).join("\n");
  }

  // 4.2 MODO TABELA: Ajustar larguras
  const SMALL_SCREEN_THRESHOLD = 60;
  const isSmallScreen = terminalWidth < SMALL_SCREEN_THRESHOLD;
  const bordersWidth = headers.length + 1; // Separadores verticais
  
  if (totalWidth > maxTableWidth) {
    // Tabela muito larga: reduzir proporcionalmente
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
    // Em telas pequenas: expandir proporcionalmente até 60 colunas (igual aos cards)
    // Cards usam: cardWidth caracteres no meio + 2 cantos = cardWidth + 2 total
    const cardWidth = Math.min(terminalWidth - 4, 60);
    const targetInnerWidth = cardWidth; // Caracteres entre os cantos (sem contar ╰ e ╯)
    const currentContentWidth = colWidths.reduce((s, w) => s + w, 0);
    
    // Largura interna da tabela = soma das colunas + separadores internos
    // Exemplo: 3 colunas → colWidth1 + | + colWidth2 + | + colWidth3
    // Total entre cantos = colWidths.sum + (headers.length - 1)
    const currentInnerWidth = currentContentWidth + (headers.length - 1);
    
    if (currentInnerWidth < targetInnerWidth) {
      const targetContentWidth = targetInnerWidth - (headers.length - 1);
      const expansionFactor = targetContentWidth / currentContentWidth;
      
      for (let i = 0; i < colWidths.length; i++) {
        colWidths[i] = Math.floor(colWidths[i] * expansionFactor);
      }
      
      // Distribuir pixels restantes (devido aos arredondamentos)
      const newTotal = colWidths.reduce((s, w) => s + w, 0);
      const remainder = targetContentWidth - newTotal;
      
      if (remainder > 0) {
        // Adicionar pixels extras nas primeiras colunas
        for (let i = 0; i < remainder && i < colWidths.length; i++) {
          colWidths[i]++;
        }
      }
    }
  }

  // 5. Funções de Desenho de Linhas
  const drawLine = (type: "top" | "middle" | "bottom") => {
    const chars = CHARS[type];
    const segments = colWidths.map((w) => chars.h.repeat(w));
    return `${chars.left}${segments.join(chars.mid)}${chars.right}`;
  };

  const drawRow = (cells: string[], colorFn?: (s: string) => string) => {
    const content = cells.map((cell, i) => {
      // Truncar célula se for muito larga para a coluna
      let displayCell = cell;
      const maxCellWidth = colWidths[i] - 2; // -2 para padding

      if (cell.length > maxCellWidth) {
        // Truncar com "…" (ellipsis)
        displayCell = cell.substring(0, maxCellWidth - 1) + "…";
      }

      const pad = colWidths[i] - displayCell.length;
      const padding = " ".repeat(pad - 1);
      const cleanCell = ` ${displayCell}${padding}`;
      return colorFn ? colorFn(cleanCell) : cleanCell;
    });
    const separator = ansi.gray(CHARS.vertical); // Separadores sempre em cinza
    return `${separator}${content.join(separator)}${separator}`;
  };

  // 6. Renderização Final
  const lines: string[] = [];

  // Topo
  lines.push(ansi.gray(drawLine("top")));

  // Cabeçalho (Branco Brilhante e Negrito)
  lines.push(drawRow(headers, (t) => ansi.bold(ansi.white(t))));

  // Divisória
  lines.push(ansi.gray(drawLine("middle")));

  // Linhas de Dados
  stringMatrix.forEach((row, i) => {
    // Alternar cores de linha seria legal, mas vamos manter simples e limpo
    // Colorir valores específicos baseados no tipo original
    const visualRow = row.map((cellStr, colIndex) => {
      const originalVal = (rows[i] as any)[headers[colIndex]];

      // Aplica cores do Vero nas células
      if (typeof originalVal === "number") return ansi.vero.warn(cellStr);
      if (typeof originalVal === "boolean") {
        return originalVal
          ? ansi.vero.success(cellStr)
          : ansi.vero.error(cellStr);
      }
      if (originalVal === null || originalVal === undefined) {
        return ansi.dim(cellStr);
      }
      return ansi.vero.info(cellStr); // Strings normais
    });

    // Monta a linha manualmente para preservar os escapes ANSI das células
    const content = visualRow
      .map((cellColorized, idx) => {
        // Recalcular padding porque os códigos ANSI não contam para largura visual,
        // mas o stringMatrix[i][idx] tem o tamanho "limpo".
        let cleanLen = stringMatrix[i][idx].length;
        let displayCell = cellColorized;
        const maxCellWidth = colWidths[idx] - 2; // -2 para padding

        // Truncar se necessário
        if (cleanLen > maxCellWidth) {
          // Extrair apenas o texto limpo e truncar
          const cleanText = stringMatrix[i][idx];
          const truncated = cleanText.substring(0, maxCellWidth - 1) + "…";

          // Re-aplicar a cor ao texto truncado
          const originalVal = (rows[i] as any)[headers[idx]];
          if (typeof originalVal === "number") {
            displayCell = ansi.vero.warn(truncated);
          } else if (typeof originalVal === "boolean") {
            displayCell = originalVal
              ? ansi.vero.success(truncated)
              : ansi.vero.error(truncated);
          } else if (originalVal === null || originalVal === undefined) {
            displayCell = ansi.dim(truncated);
          } else {
            displayCell = ansi.vero.info(truncated);
          }

          cleanLen = truncated.length;
        }

        const pad = colWidths[idx] - cleanLen;
        return ` ${displayCell}${" ".repeat(pad - 1)}`;
      })
      .join(ansi.gray(CHARS.vertical));

    lines.push(
      `${ansi.gray(CHARS.vertical)}${content}${ansi.gray(CHARS.vertical)}`,
    );
  });

  // Base
  lines.push(ansi.gray(drawLine("bottom")));

  return lines.join("\n");
}
