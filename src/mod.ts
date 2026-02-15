import * as ansi from "./ansi.ts";
import { format } from "./formatter.ts";
import { createTable } from "./table.ts";
import {
  endTimer,
  incrementCounter,
  logTimer,
  resetCounter,
  startTimer,
} from "./bench.ts";
import { getTerminalWidth } from "./terminal.ts";
import { ICONS } from "./icons.ts";

/**
 * Configurações globais do Logger
 */
export interface LoggerConfig {
  showTimestamp: boolean;
  useIcons: boolean;
}

/**
 * Nível de indentação para grupos
 */
let groupIndentLevel = 0;

const defaultConfig: LoggerConfig = {
  showTimestamp: true,
  useIcons: true,
};

/**
 * Utilitário de Timestamp (HH:MM:ss.ms)
 * Cor: Cinza escuro para não roubar a atenção
 */
function getTimestamp(): string {
  const d = new Date();
  const time = d.toLocaleTimeString("pt-BR", { hour12: false });
  const ms = d.getMilliseconds().toString().padStart(3, "0");
  return ansi.dim(ansi.gray(`${time}.${ms}`));
}

/**
 * Retorna o timestamp sem formatação ANSI (para uso em headers de card)
 */
function getTimestampPlain(): string {
  const d = new Date();
  const time = d.toLocaleTimeString("pt-BR", { hour12: false });
  const ms = d.getMilliseconds().toString().padStart(3, "0");
  return `${time}.${ms}`;
}

/**
 * Configuração visual dos cards (bordas Unicode arredondadas)
 */
const CARD_CHARS = {
  top: { left: "╭", right: "╮", h: "─" },
  bottom: { left: "╰", right: "╯", h: "─" },
  vertical: "│",
};

/**
 * Classe principal do Vero
 */
class Vero {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * O motor interno de renderização
   */
  private print(
    level: string,
    colorFn: (t: string) => string,
    args: unknown[],
    stream: "stdout" | "stderr" = "stdout",
  ) {
    const terminalWidth = getTerminalWidth();
    const SMALL_SCREEN_THRESHOLD = 60;

    // Detectar se deve usar card view (telas pequenas + timestamp habilitado)
    const useCardView = this.config.showTimestamp &&
      terminalWidth < SMALL_SCREEN_THRESHOLD;

    if (useCardView) {
      // MODO CARD: Renderizar em box com timestamp no header
      const output = this.createLogCard(level, colorFn, args);
      if (stream === "stderr") {
        console.error(output);
      } else {
        console.log(output);
      }
      return;
    }

    // MODO NORMAL: Renderização linear tradicional
    const parts: string[] = [];

    // 1. Timestamp
    if (this.config.showTimestamp) {
      parts.push(getTimestamp());
    }

    // 2. Badge de Nível (Ex: INFO )
    // Usamos padEnd(7) para alinhar verticalmente todos os logs
    const badge = ansi.bold(colorFn(level.padEnd(2)));
    parts.push(badge);

    // 3. Indentação de grupo
    const indent = "  ".repeat(groupIndentLevel);

    // 4. Conteúdo
    // Se o argumento for string, imprime direto. Se for objeto, formata.
    const message = args
      .map((arg) => (typeof arg === "string" ? arg : format(arg)))
      .join(" ");

    parts.push(indent + message);

    // 5. Output
    const finalLog = parts.join("  "); // Dois espaços de respiro

    if (stream === "stderr") {
      console.error(finalLog);
    } else {
      console.log(finalLog);
    }
  }

  /**
   * Cria um card visual para o log (usado em telas pequenas)
   */
  private createLogCard(
    level: string,
    colorFn: (t: string) => string,
    args: unknown[],
  ): string {
    const lines: string[] = [];
    const terminalWidth = getTerminalWidth();
    const cardWidth = Math.min(terminalWidth - 4, 60);
    const contentWidth = cardWidth; // Largura total do conteúdo (incluindo bordas)

    // Header: Timestamp
    const timestamp = getTimestampPlain();
    const headerContent = ` ${timestamp} `;
    const headerLineWidth = cardWidth - headerContent.length; // Espaço restante após timestamp
    lines.push(
      ansi.gray(
        `${CARD_CHARS.top.left}${headerContent}${
          CARD_CHARS.top.h.repeat(Math.max(0, headerLineWidth))
        }${CARD_CHARS.top.right}`,
      ),
    );

    // Conteúdo: Badge + Message
    const badge = ansi.bold(colorFn(level)); // Removido padEnd para ícone único
    const message = args
      .map((arg) => (typeof arg === "string" ? arg : format(arg)))
      .join(" ");

    // Dividir mensagem em múltiplas linhas se necessário
    // Alinhamento: 1 espaço antes do ícone + 2 espaços após ícone para melhor legibilidade
    const fullContent = ` ${badge}  ${message}`;
    const rightPadding = 1; // Padding simétrico à direita
    const innerWidth = cardWidth - rightPadding; // Largura disponível (reservando espaço à direita)
    const contentLines = this.wrapText(fullContent, innerWidth);

    contentLines.forEach((line) => {
      // Calcular padding considerando códigos ANSI
      const cleanLine = line.replace(/\x1b\[[0-9;]*m/g, ""); // Remove ANSI codes
      const padding = " ".repeat(Math.max(0, innerWidth - cleanLine.length));
      // Adicionar padding à direita fixo para simetria
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
   * Remove códigos ANSI de uma string
   */
  private stripAnsi(text: string): string {
    return text.replace(/\x1b\[[0-9;]*m/g, "");
  }

  /**
   * Encontra a cor ANSI ativa em uma determinada posição visual da string
   * Retorna o último código ANSI de cor encontrado antes dessa posição
   */
  private getActiveAnsiAt(text: string, visualPosition: number): string {
    let lastAnsi = "";
    let visualIndex = 0;
    let i = 0;
    
    while (i < text.length && visualIndex <= visualPosition) {
      // Detectar código ANSI
      if (text.substring(i).match(/^\x1b\[[0-9;]*m/)) {
        const ansiMatch = text.substring(i).match(/^\x1b\[[0-9;]*m/)!;
        const code = ansiMatch[0];
        
        // Reset code limpa a cor ativa
        if (code === "\x1b[0m") {
          lastAnsi = "";
        } else {
          // Guardar último código de cor/estilo
          lastAnsi = code;
        }
        
        i += code.length;
        continue;
      }
      
      // Caractere normal
      visualIndex++;
      i++;
    }
    
    return lastAnsi;
  }

  /**
   * Extrai substring de texto com ANSI preservando os códigos de cor
   */
  private sliceWithAnsi(text: string, start: number, end?: number): string {
    const clean = this.stripAnsi(text);
    const targetStart = start;
    const targetEnd = end ?? clean.length;
    
    let result = "";
    let visualIndex = 0;
    let i = 0;
    
    while (i < text.length) {
      // Detectar código ANSI
      if (text.substring(i).match(/^\x1b\[[0-9;]*m/)) {
        const ansiMatch = text.substring(i).match(/^\x1b\[[0-9;]*m/)!;
        // Sempre inclui ANSI se já começamos a copiar
        if (visualIndex >= targetStart) {
          result += ansiMatch[0];
        }
        i += ansiMatch[0].length;
        continue;
      }
      
      // Caractere normal
      if (visualIndex >= targetStart && visualIndex < targetEnd) {
        result += text[i];
      }
      visualIndex++;
      i++;
      
      if (visualIndex >= targetEnd) break;
    }
    
    return result;
  }

  /**
   * Quebra texto em múltiplas linhas respeitando a largura máxima
   * Preserva quebras de linha existentes (como em objetos formatados)
   * Linhas subsequentes são indentadas para alinhar com o início do texto
   */
  private wrapText(text: string, maxWidth: number): string[] {
    const existingLines = text.split("\n");
    const result: string[] = [];
    const INDENT = "    "; // 4 espaços: alinha com início do texto após " ℹ  "

    // Detectar se é conteúdo de objeto (tem alguma linha com indentação)
    const isObjectContent = existingLines.some((line) => {
      const clean = this.stripAnsi(line);
      return clean.startsWith("  "); // 2 espaços = indentação de objeto
    });

    for (let i = 0; i < existingLines.length; i++) {
      const line = existingLines[i];
      const cleanLine = this.stripAnsi(line);

      // Detectar se a linha já tem indentação (objetos formatados, etc)
      const hasOwnIndent = cleanLine.startsWith(" ");

      if (cleanLine.length <= maxWidth) {
        // Linha cabe inteira
        if (i === 0) {
          // Primeira linha: sem indentação extra
          result.push(line);
        } else if (isObjectContent) {
          // Faz parte de objeto: manter exatamente como está (sem adicionar espaços)
          result.push(line);
        } else {
          // Linha 2+ sem indentação (ex: stack trace): adicionar
          result.push(INDENT + line);
        }
      } else {
        // Linha precisa de wrap - usar clean para cálculo, original para output
        let offset = 0; // Posição na string limpa
        let isFirstPart = true;

        while (offset < cleanLine.length) {
          let prefix = "";
          let width = maxWidth;

          if (i === 0) {
            // Primeira linha do conteúdo
            if (!isFirstPart) {
              // Continuação da primeira linha: indentar
              prefix = INDENT;
              width = maxWidth - INDENT.length;
            }
          } else if (!isObjectContent) {
            // Linhas 2+ que NÃO fazem parte de objeto (stack traces, etc)
            prefix = INDENT;
            width = maxWidth - INDENT.length;
          } else {
            // Linhas de objeto: manter indentação original
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
            // Última parte - pega do offset até o final
            let chunk = this.sliceWithAnsi(line, offset);
            
            // Reaplicar cor ativa se não for primeira parte e não for stack trace
            if (!isFirstPart && i === 0) {
              const cleanChunk = this.stripAnsi(chunk);
              const isStackTrace = cleanChunk.trimStart().startsWith("at ");
              
              if (!isStackTrace) {
                const activeColor = this.getActiveAnsiAt(line, offset);
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

          // Extrai chunk com ANSI preservado
          let chunk = this.sliceWithAnsi(line, offset, breakPoint);
          
          // Reaplicar cor ativa nas continuações (exceto stack traces)
          if (!isFirstPart && i === 0) {
            const cleanChunk = this.stripAnsi(chunk);
            const isStackTrace = cleanChunk.trimStart().startsWith("at ");
            
            if (!isStackTrace) {
              const activeColor = this.getActiveAnsiAt(line, offset);
              if (activeColor) {
                chunk = activeColor + chunk;
              }
            }
          }
          
          result.push(prefix + chunk);
          
          // Pular espaços no início da próxima parte
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
   * Log Genérico (Cinza/Padrão)
   */
  log(...args: unknown[]) {
    const icon = this.config.useIcons ? ICONS.log : "LOG";
    this.print(icon, ansi.gray, args);
  }

  /**
   * Informação (Azul Vero)
   */
  info(...args: unknown[]) {
    const icon = this.config.useIcons ? ICONS.info : "INFO";
    // Apply info color to the text content
    const coloredArgs = args.map((arg) =>
      typeof arg === "string" ? ansi.vero.info(arg) : arg
    );
    this.print(icon, ansi.vero.info, coloredArgs);
  }

  /**
   * Sucesso (Verde Menta)
   */
  success(...args: unknown[]) {
    const icon = this.config.useIcons ? ICONS.success : "OK";
    // Apply success color to the text content
    const coloredArgs = args.map((arg) =>
      typeof arg === "string" ? ansi.vero.success(arg) : arg
    );
    this.print(icon, ansi.vero.success, coloredArgs);
  }

  /**
   * Aviso (Amarelo Pêssego)
   */
  warn(...args: unknown[]) {
    const icon = this.config.useIcons ? ICONS.warn : "WARN";
    // Apply warn color to the text content
    const coloredArgs = args.map((arg) =>
      typeof arg === "string" ? ansi.vero.warn(arg) : arg
    );
    this.print(icon, ansi.vero.warn, coloredArgs);
  }

  /**
   * Erro (Rosa Pastel)
   * Usa stderr para que ferramentas de CI/CD detectem falhas.
   */
  error(...args: unknown[]) {
    // Apply error color to the text content
    const coloredArgs = args.map((arg) =>
      typeof arg === "string" ? ansi.vero.error(arg) : arg
    );
    const icon = this.config.useIcons ? ICONS.error : "ERR";
    this.print(icon, ansi.vero.error, coloredArgs, "stderr");
  }

  /**
   * Debug (Roxo Lavanda)
   * Útil para inspeção profunda de objetos
   */
  debug(...args: unknown[]) {
    const icon = this.config.useIcons ? ICONS.debug : "DBG";
    // Apply debug (type) color to the text content
    const coloredArgs = args.map((arg) =>
      typeof arg === "string" ? ansi.vero.type(arg) : arg
    );
    this.print(icon, ansi.vero.type, coloredArgs);
  }

  /**
   * Clear the console
   */
  clear() {
    console.clear();
  }

  /**
   * Adds a blank line for visual spacing
   */
  br() {
    console.log("");
  }

  /**
   * Um separador visual elegante
   */
  hr() {
    const width = getTerminalWidth();
    const line = "─".repeat(width);
    // Apply ANSI codes AFTER creating the string to avoid counting them in width
    console.log(ansi.dim(ansi.gray(line)));
  }

  /**
   * Renderiza uma tabela ASCII inteligente e responsiva
   *
   * Automatically switches between two rendering modes:
   * - **Table Mode** (≤6 columns): Traditional ASCII table with optional truncation
   * - **Card View** (>6 columns or narrow terminal): Vertical cards for better readability
   *
   * @param data Array of objects to render
   *
   * @example
   * // Small table (table mode)
   * logger.table([
   *   { id: 1, name: "Alice", active: true },
   *   { id: 2, name: "Bob", active: false }
   * ]);
   *
   * @example
   * // Wide table with many columns (automatic card view)
   * logger.table([
   *   {
   *     id: 1,
   *     name: "Alice Johnson",
   *     email: "alice@example.com",
   *     department: "Engineering",
   *     role: "Senior Engineer",
   *     location: "San Francisco",
   *     joined: "2021-03-15",
   *     active: true
   *   }
   * ]);
   */
  table(data: any[]) {
    // Se não for array, usa o log normal
    if (!Array.isArray(data)) {
      this.warn("table() espera um array. Usando log padrão:");
      this.log(data);
      return;
    }

    console.log(createTable(data));
  }

  /**
   * Inicia um cronómetro visual com uma etiqueta.
   */
  time(label: string) {
    startTimer(label);
    // Opcional: Avisar que começou, ou manter silêncio estilo UNIX
    // this.debug(`Cronómetro iniciado: ${label}`);
  }

  /**
   * Para o cronómetro e imprime a barra de performance.
   */
  timeEnd(label: string) {
    const terminalWidth = getTerminalWidth();
    const SMALL_SCREEN_THRESHOLD = 60;
    const useCardView = this.config.showTimestamp &&
      terminalWidth < SMALL_SCREEN_THRESHOLD;

    // Calcular largura máxima para a barra em card view
    const cardWidth = Math.min(terminalWidth - 4, 60);
    const innerWidth = cardWidth - 1; // Menos o padding direito
    const iconAndSpacing = 4; // " ⏱  " = 1 espaço + ícone + 2 espaços
    const maxBarWidth = useCardView ? innerWidth - iconAndSpacing : undefined;

    const visualization = endTimer(label, maxBarWidth);
    if (!visualization) {
      this.warn(`Cronómetro '${label}' não encontrado.`);
      return;
    }

    const icon = this.config.useIcons ? ICONS.timer : "TIME";

    if (useCardView) {
      const output = this.createLogCard(icon, ansi.vero.warn, [visualization]);
      console.log(output);
    } else {
      console.log(`${getTimestamp()}  ${icon}   ${visualization}`);
    }
  }

  /**
   * Helper para medir funções assíncronas facilmente
   * Ex: await logger.measure("DB Query", () => db.query());
   */
  async measure<T>(label: string, fn: () => Promise<T> | T): Promise<T> {
    this.time(label);
    try {
      const result = await fn();
      return result;
    } finally {
      this.timeEnd(label);
    }
  }

  /**
   * Easter Egg: O modo Hackathon
   */
  copilot() {
    const ghColor = ansi.hex("#ffffff"); // Branco GitHub
    const copilotColor = ansi.hex("#6f90ff"); // Azul Copilot (aproximado)

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
   * Uses double-line Unicode box characters
   */
  h1(text: string) {
    const width = getTerminalWidth();
    const MOBILE_THRESHOLD = 60;
    const isMobile = width < MOBILE_THRESHOLD;
    const color = ansi.hex("#8b5cf6"); // Amethyst

    if (isMobile) {
      // Mobile: left-aligned, 100% width
      const boxWidth = width - 1;
      const topBorder = color("╔" + "═".repeat(boxWidth - 2) + "╗");
      const textLine = color("║") + " " + text.padEnd(boxWidth - 4) + " " +
        color("║");
      const bottomBorder = color("╚" + "═".repeat(boxWidth - 2) + "╝");
      console.log("\n" + topBorder);
      console.log(textLine);
      console.log(bottomBorder + "\n");
    } else {
      // Desktop: centered text
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
   * Strong emphasis with bold text and horizontal line
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
   * Moderate emphasis with block prefix
   */
  h3(text: string) {
    const prefix = ansi.hex("#10b981")("▍"); // Emerald green block
    const title = ansi.bold(text);
    console.log(`${prefix} ${title}`);
  }

  /**
   * Heading Level 4 - The Underline
   * Light emphasis with underline
   */
  h4(text: string) {
    const underline = ansi.dim("─".repeat(text.length));
    console.log(text);
    console.log(underline);
  }

  /**
   * Heading Level 5 - The Label
   * Minimal emphasis with uppercase and suffix
   */
  h5(text: string) {
    const textUpper = text.toUpperCase();
    const title = ansi.dim(textUpper + " >");
    console.log(title);
  }

  /**
   * Heading Level 6 - The Item
   * Subtle emphasis with prefix and italic/dim
   */
  h6(text: string) {
    const prefix = "› "; // Single guillemet
    const title = ansi.dim(ansi.italic(text));
    console.log(`${prefix}${title}`);
  }

  /**
   * Logs the time elapsed since a timer was started, without ending it
   */
  timeLog(label: string, ...args: unknown[]) {
    const terminalWidth = getTerminalWidth();
    const SMALL_SCREEN_THRESHOLD = 60;
    const useCardView = this.config.showTimestamp &&
      terminalWidth < SMALL_SCREEN_THRESHOLD;

    // Calcular largura máxima para a barra em card view
    const cardWidth = Math.min(terminalWidth - 4, 60);
    const innerWidth = cardWidth - 1; // Menos o padding direito
    const iconAndSpacing = 4; // " ⏱  " = 1 espaço + ícone + 2 espaços
    const maxBarWidth = useCardView ? innerWidth - iconAndSpacing : undefined;

    const visualization = logTimer(label, maxBarWidth);
    if (!visualization) {
      this.warn(`Timer '${label}' not found.`);
      return;
    }

    const icon = this.config.useIcons ? ICONS.timer : "TIME";
    const extraMessage = args.length > 0
      ? " " + args.map((arg) => (typeof arg === "string" ? arg : format(arg)))
        .join(" ")
      : "";

    const fullMessage = `${visualization}${extraMessage}`;

    if (useCardView) {
      const output = this.createLogCard(icon, ansi.vero.warn, [fullMessage]);
      console.log(output);
    } else {
      console.log(`${getTimestamp()}  ${icon}   ${fullMessage}`);
    }
  }

  /**
   * Assertion logging - only logs if condition is false
   */
  assert(condition: boolean, ...args: unknown[]) {
    if (!condition) {
      const icon = this.config.useIcons ? ICONS.assert : "ASSERT";
      const message = args.length > 0 ? args : ["Assertion failed"];

      // Get stack trace for assertion
      const stack = new Error().stack;
      let stackLines: string[] = [];
      if (stack) {
        stackLines = stack.split("\n").slice(2).map((line) => line.trim()); // Remove Error and assert call
      }

      // Combinar mensagem com stack trace para card view
      const terminalWidth = getTerminalWidth();
      const SMALL_SCREEN_THRESHOLD = 60;
      const useCardView = this.config.showTimestamp &&
        terminalWidth < SMALL_SCREEN_THRESHOLD;

      if (useCardView && stackLines.length > 0) {
        // Incluir stack trace no card
        const allArgs = [
          ...message,
          "\n" + ansi.dim(ansi.gray(stackLines.join("\n"))),
        ];
        const coloredArgs = allArgs.map((arg) =>
          typeof arg === "string" ? ansi.vero.error(arg) : arg
        );
        this.print(icon, ansi.vero.error, coloredArgs, "stderr");
      } else {
        // Modo normal
        const coloredArgs = message.map((arg) =>
          typeof arg === "string" ? ansi.vero.error(arg) : arg
        );
        this.print(icon, ansi.vero.error, coloredArgs, "stderr");

        if (stackLines.length > 0) {
          console.error(ansi.dim(ansi.gray(stackLines.join("\n"))));
        }
      }
    }
  }

  /**
   * Increments and logs a counter
   */
  count(label = "default") {
    const count = incrementCounter(label);
    const icon = this.config.useIcons ? ICONS.count : "COUNT";
    const message = `${label}: ${count}`;
    this.print(icon, ansi.vero.info, [message]);
  }

  /**
   * Resets a counter to zero
   */
  countReset(label = "default") {
    resetCounter(label);
    const icon = this.config.useIcons ? ICONS.reset : "RESET";
    const message = `${label}: reset`;
    this.print(icon, ansi.dim, [ansi.gray(message)]);
  }

  /**
   * Creates a new inline group - increases indentation level
   */
  group(...args: unknown[]) {
    const icon = this.config.useIcons ? ICONS.groupExpanded : "GROUP";
    const message = args.length > 0 ? args : ["Group"];
    this.print(icon, ansi.vero.info, message);
    groupIndentLevel++;
  }

  /**
   * Creates a new collapsed group (same as group for terminal)
   */
  groupCollapsed(...args: unknown[]) {
    const icon = this.config.useIcons ? ICONS.groupCollapsed : "GROUP";
    const message = args.length > 0 ? args : ["Group"];
    this.print(icon, ansi.dim, message.map((m) => ansi.gray(String(m))));
    groupIndentLevel++;
  }

  /**
   * Exits the current inline group - decreases indentation level
   */
  groupEnd() {
    if (groupIndentLevel > 0) {
      groupIndentLevel--;
    }
  }

  /**
   * Displays an interactive listing of object properties
   */
  dir(obj: unknown, options?: { depth?: number; colors?: boolean }) {
    const icon = this.config.useIcons ? ICONS.dir : "DIR";
    const depth = options?.depth ?? 10;
    const formatted = format(obj, { maxDepth: depth });
    this.print(icon, ansi.vero.type, [formatted]);
  }

  /**
   * Displays an XML/HTML element representation (for terminal, same as dir)
   */
  dirxml(obj: unknown) {
    const icon = this.config.useIcons ? ICONS.dirxml : "XML";
    const formatted = format(obj);
    this.print(icon, ansi.vero.type, [formatted]);
  }

  /**
   * Outputs a stack trace to the console
   */
  trace(...args: unknown[]) {
    const icon = this.config.useIcons ? ICONS.trace : "TRACE";
    const message = args.length > 0 ? args : ["Trace"];

    // Get and display stack trace
    const stack = new Error().stack;
    let stackLines: string[] = [];
    if (stack) {
      stackLines = stack.split("\n").slice(2).map((line) => line.trim()); // Remove Error and trace call
    }

    // Combinar mensagem com stack trace para card view
    const terminalWidth = getTerminalWidth();
    const SMALL_SCREEN_THRESHOLD = 60;
    const useCardView = this.config.showTimestamp &&
      terminalWidth < SMALL_SCREEN_THRESHOLD;

    if (useCardView && stackLines.length > 0) {
      // Incluir stack trace no card
      const allArgs = [
        ...message,
        "\n" + ansi.dim(ansi.gray(stackLines.join("\n"))),
      ];
      this.print(icon, ansi.vero.warn, allArgs);
    } else {
      // Modo normal
      this.print(icon, ansi.vero.warn, message);

      if (stackLines.length > 0) {
        console.log(ansi.dim(ansi.gray(stackLines.join("\n"))));
      }
    }
  }
}

// Exporta uma instância padrão pronta para uso
export const logger: Vero = new Vero();

// Exporta a classe para quem quiser instâncias customizadas
export { Vero };

// Exporta ICONS para customização/referência
export { ICONS };
