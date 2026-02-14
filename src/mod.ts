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
   * Log Genérico (Cinza/Padrão)
   */
  log(...args: unknown[]) {
    const icon = this.config.useIcons ? "•" : "LOG";
    this.print(icon, ansi.gray, args);
  }

  /**
   * Informação (Azul Vero)
   */
  info(...args: unknown[]) {
    const icon = this.config.useIcons ? "ℹ" : "INFO";
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
    const icon = this.config.useIcons ? "✔" : "OK";
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
    const icon = this.config.useIcons ? "⚠" : "WARN";
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
    const icon = this.config.useIcons ? "✖" : "ERR";
    this.print(icon, ansi.vero.error, coloredArgs, "stderr");
  }

  /**
   * Debug (Roxo Lavanda)
   * Útil para inspeção profunda de objetos
   */
  debug(...args: unknown[]) {
    const icon = this.config.useIcons ? "⚙" : "DBG";
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
    const visualization = endTimer(label);
    if (!visualization) {
      this.warn(`Cronómetro '${label}' não encontrado.`);
      return;
    }

    // Usamos console.log direto para evitar timestamp duplo,
    // ou usamos o this.print se quisermos manter o padrão.
    // Vamos usar um ícone de relógio para ficar bonito.
    const icon = this.config.useIcons ? "⏱" : "TIME";
    console.log(`${getTimestamp()}  ${icon}   ${visualization}`);
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
          ansi.gray("Generated with AI assistance, refined by human craft."),
        ),
    );

    this.hr();
  }

  /**
   * Heading Level 1 - Maximum emphasis
   * Large visual size with wide spacing + single large icon
   */
  h1(text: string) {
    const icon = "◆"; // Single large diamond
    const title = ansi.bold(ansi.hex("#8b5cf6")(text)); // Amethyst
    console.log(ansi.hex("#8b5cf6")("═".repeat(text.length + 6)));
    console.log(`${icon}  ${title}  ${icon}`);
    console.log(ansi.hex("#8b5cf6")("═".repeat(text.length + 6)));
  }

  /**
   * Heading Level 2 - Strong emphasis
   * Medium-large visual size with moderate spacing
   */
  h2(text: string) {
    const icon = "▸"; // Triangle
    const title = ansi.bold(ansi.hex("#10b981")(text)); // Emerald
    console.log(`\n${icon} ${title}`);
  }

  /**
   * Heading Level 3 - Moderate emphasis
   * Normal size with bold
   */
  h3(text: string) {
    const icon = "▸"; // Triangle
    const title = ansi.bold(ansi.hex("#3b82f6")(text)); // Sapphire
    console.log(`${icon} ${title}`);
  }

  /**
   * Heading Level 4 - Light emphasis
   * Normal size without bold
   */
  h4(text: string) {
    const icon = "▹"; // Outline triangle
    const title = ansi.hex("#f59e0b")(text); // Amber
    console.log(`${icon} ${title}`);
  }

  /**
   * Heading Level 5 - Minimal emphasis
   * Smaller visual appearance with cyan
   */
  h5(text: string) {
    const icon = "•"; // Bullet
    const title = ansi.cyan(text);
    console.log(`${icon} ${title}`);
  }

  /**
   * Heading Level 6 - Subtle emphasis
   * Smallest visual with dim gray + subtle dot
   */
  h6(text: string) {
    const icon = "·"; // Tiny dot
    const title = ansi.dim(ansi.gray(text));
    console.log(`${icon} ${title}`);
  }

  /**
   * Logs the time elapsed since a timer was started, without ending it
   */
  timeLog(label: string, ...args: unknown[]) {
    const visualization = logTimer(label);
    if (!visualization) {
      this.warn(`Timer '${label}' not found.`);
      return;
    }

    const icon = this.config.useIcons ? "⏱" : "TIME";
    const extraMessage = args.length > 0
      ? " " + args.map((arg) => (typeof arg === "string" ? arg : format(arg)))
        .join(" ")
      : "";
    console.log(`${getTimestamp()}  ${icon}   ${visualization}${extraMessage}`);
  }

  /**
   * Assertion logging - only logs if condition is false
   */
  assert(condition: boolean, ...args: unknown[]) {
    if (!condition) {
      const icon = this.config.useIcons ? "✖" : "ASSERT";
      const message = args.length > 0 ? args : ["Assertion failed"];
      const coloredArgs = message.map((arg) =>
        typeof arg === "string" ? ansi.vero.error(arg) : arg
      );
      this.print(icon, ansi.vero.error, coloredArgs, "stderr");

      // Get stack trace for assertion
      const stack = new Error().stack;
      if (stack) {
        const lines = stack.split("\n").slice(2).map((lines) => lines.trim()); // Remove Error and assert call
        console.error(ansi.dim(ansi.gray(lines.join("\n"))));
      }
    }
  }

  /**
   * Increments and logs a counter
   */
  count(label = "default") {
    const count = incrementCounter(label);
    const icon = this.config.useIcons ? "🔢" : "COUNT";
    const message = `${label}: ${count}`;
    this.print(icon, ansi.vero.info, [message]);
  }

  /**
   * Resets a counter to zero
   */
  countReset(label = "default") {
    resetCounter(label);
    const icon = this.config.useIcons ? "↺" : "RESET";
    const message = `${label}: reset`;
    this.print(icon, ansi.dim, [ansi.gray(message)]);
  }

  /**
   * Creates a new inline group - increases indentation level
   */
  group(...args: unknown[]) {
    const icon = this.config.useIcons ? "▼" : "GROUP";
    const message = args.length > 0 ? args : ["Group"];
    this.print(icon, ansi.vero.info, message);
    groupIndentLevel++;
  }

  /**
   * Creates a new collapsed group (same as group for terminal)
   */
  groupCollapsed(...args: unknown[]) {
    const icon = this.config.useIcons ? "▶" : "GROUP";
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
    const icon = this.config.useIcons ? "📋" : "DIR";
    const depth = options?.depth ?? 10;
    const formatted = format(obj, { maxDepth: depth });
    this.print(icon, ansi.vero.type, [formatted]);
  }

  /**
   * Displays an XML/HTML element representation (for terminal, same as dir)
   */
  dirxml(obj: unknown) {
    const icon = this.config.useIcons ? "📄" : "XML";
    const formatted = format(obj);
    this.print(icon, ansi.vero.type, [formatted]);
  }

  /**
   * Outputs a stack trace to the console
   */
  trace(...args: unknown[]) {
    const icon = this.config.useIcons ? "🔍" : "TRACE";
    const message = args.length > 0 ? args : ["Trace"];
    this.print(icon, ansi.vero.warn, message);

    // Get and display stack trace
    const stack = new Error().stack;
    if (stack) {
      const lines = stack.split("\n").slice(2).map((line) => line.trim()); // Remove Error and trace call
      console.log(ansi.dim(ansi.gray(lines.join("\n"))));
    }
  }
}

// Exporta uma instância padrão pronta para uso
export const logger: Vero = new Vero();

// Exporta a classe para quem quiser instâncias customizadas
export { Vero };
