import * as ansi from "./ansi.ts";
import type { format } from "./formatter.ts";

// Configuração visual da tabela (Bordas Unicode Arredondadas/Suaves)
const CHARS = {
  top: { left: "┌", mid: "┬", right: "┐", h: "─" },
  middle: { left: "├", mid: "┼", right: "┤", h: "─" },
  bottom: { left: "└", mid: "┴", right: "┘", h: "─" },
  vertical: "│",
};

/**
 * Cria uma tabela ASCII bonita e responsiva
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
  // Pré-calculamos os valores formatados para medir o tamanho depois
  const stringMatrix = rows.map((row) => {
    return headers.map((header) => {
      const val = (row as any)[header];
      // Usamos uma versão simplificada do formatador para caber na célula
      if (typeof val === "object" && val !== null) return "[Obj]";
      if (val === undefined) return "-";
      return String(val);
    });
  });

  // 4. Calcular Largura das Colunas
  const colWidths = headers.map((header, i) => {
    let max = header.length; // Começa com o tamanho do título
    stringMatrix.forEach((row) => {
      const len = row[i].length;
      if (len > max) max = len;
    });
    return max + 2; // +2 para padding (um espaço de cada lado)
  });

  // 5. Funções de Desenho de Linhas
  const drawLine = (type: "top" | "middle" | "bottom") => {
    const chars = CHARS[type];
    const segments = colWidths.map((w) => chars.h.repeat(w));
    return `${chars.left}${segments.join(chars.mid)}${chars.right}`;
  };

  const drawRow = (cells: string[], colorFn?: (s: string) => string) => {
    const content = cells.map((cell, i) => {
      const pad = colWidths[i] - cell.length;
      // Estratégia de alinhamento: Números à direita, Texto à esquerda
      // (Simplificado aqui para tudo à esquerda com padding no final)
      const padding = " ".repeat(pad - 1);
      const cleanCell = ` ${cell}${padding}`;
      return colorFn ? colorFn(cleanCell) : cleanCell;
    });
    return `${CHARS.vertical}${content.join(CHARS.vertical)}${CHARS.vertical}`;
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
        const cleanLen = stringMatrix[i][idx].length;
        const pad = colWidths[idx] - cleanLen;
        return ` ${cellColorized}${" ".repeat(pad - 1)}`;
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
