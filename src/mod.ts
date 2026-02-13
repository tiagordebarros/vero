import * as ansi from "./ansi.ts";
import { format } from "./formatter.ts";
import { createTable } from "./table.ts";
import { endTimer, startTimer } from "./bench.ts";

/**
 * Configurações globais do Logger
 */
export interface LoggerConfig {
  showTimestamp: boolean;
  useIcons: boolean;
}

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
    const badge = ansi.bold(colorFn(level.padEnd(5)));
    parts.push(badge);

    // 3. Conteúdo
    // Se o argumento for string, imprime direto. Se for objeto, formata.
    const message = args
      .map((arg) => (typeof arg === "string" ? arg : format(arg)))
      .join(" ");

    parts.push(message);

    // 4. Output
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
    this.print("LOG", ansi.gray, args);
  }

  /**
   * Informação (Azul Vero)
   */
  info(...args: unknown[]) {
    const icon = this.config.useIcons ? "ℹ" : "INFO";
    this.print(icon, ansi.vero.info, args);
  }

  /**
   * Sucesso (Verde Menta)
   */
  success(...args: unknown[]) {
    const icon = this.config.useIcons ? "✔" : "OK";
    this.print(icon, ansi.vero.success, args);
  }

  /**
   * Aviso (Amarelo Pêssego)
   */
  warn(...args: unknown[]) {
    const icon = this.config.useIcons ? "⚠" : "WARN";
    this.print(icon, ansi.vero.warn, args);
  }

  /**
   * Erro (Rosa Pastel)
   * Usa stderr para que ferramentas de CI/CD detectem falhas.
   */
  error(...args: unknown[]) {
    const icon = this.config.useIcons ? "✖" : "ERR";
    this.print(icon, ansi.vero.error, args, "stderr");
  }

  /**
   * Debug (Roxo Lavanda)
   * Útil para inspeção profunda de objetos
   */
  debug(...args: unknown[]) {
    const icon = this.config.useIcons ? "⚙" : "DBG";
    this.print(icon, ansi.vero.type, args);
  }

  /**
   * Um separador visual elegante
   */
  hr() {
    const width = 60; // Largura padrão
    console.log(ansi.dim(ansi.gray("─".repeat(width))));
  }

  /**
   * Renderiza uma tabela ASCII inteligente
   */
  table(data: any[]) {
    // Se não for array, usa o log normal
    if (!Array.isArray(data)) {
      this.warn("table() espera um array. Usando log padrão:");
      this.log(data);
      return;
    }

    // Título opcional ou apenas renderiza
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
}

// Exporta uma instância padrão pronta para uso
export const logger = new Vero();

// Exporta a classe para quem quiser instâncias customizadas
export { Vero };
