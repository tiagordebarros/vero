import * as ansi from "./ansi.ts";

// Configuração de indentação (2 espaços é o padrão moderno)
const INDENT = "  ";

/**
 * Interface para opções de formatação (extensível no futuro)
 */
interface FormatOptions {
  depth: number;
  maxDepth: number;
  seen: WeakSet<object>; // Proteção contra referência circular
}

/**
 * Formata qualquer valor em uma string colorida ANSI
 */
export function format(
  value: unknown,
  options: Partial<FormatOptions> = {},
): string {
  // Configuração padrão
  const opts: FormatOptions = {
    depth: options.depth || 0,
    maxDepth: options.maxDepth || 10, // Evita objetos infinitamente profundos
    seen: options.seen || new WeakSet(),
  };

  // 1. Tipos Primitivos (Base da recursão)
  if (value === null) return ansi.bold(ansi.gray("null"));
  if (value === undefined) return ansi.dim(ansi.gray("undefined"));

  if (typeof value === "boolean") {
    // Booleans use yellow (true) and red (false) for clear distinction from strings
    return value ? ansi.yellow("true") : ansi.red("false");
  }

  if (typeof value === "number") {
    // Numbers use Amber (peach orange) for clear distinction from strings
    return ansi.hex("#f59e0b")(String(value));
  }

  if (typeof value === "string") {
    // Strings use basic green (distinct from success mint green)
    return ansi.green(`"${value}"`);
  }

  if (typeof value === "symbol") {
    return ansi.vero.type(value.toString());
  }

  if (typeof value === "function") {
    return ansi.vero.info(`[Function: ${value.name || "anonymous"}]`);
  }

  // 2. Objetos Complexos (Arrays, Objects, Maps, Errors)

  // Proteção de Profundidade
  if (opts.depth >= opts.maxDepth) {
    return ansi.dim(ansi.cyan("[Object]")); // Paramos aqui
  }

  // Proteção Circular
  if (typeof value === "object") {
    if (opts.seen.has(value)) {
      return ansi.vero.error("[Circular]");
    }
    opts.seen.add(value);
  }

  // Tratamento de Arrays
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";

    const items = value.map((item) => {
      return format(item, { ...opts, depth: opts.depth + 1 });
    });

    // Se for um array curto, tenta manter em uma linha
    const singleLine = `[ ${items.join(", ")} ]`;
    if (singleLine.length < 60) return singleLine;

    // Se for longo, quebra linha
    const indentStr = INDENT.repeat(opts.depth);
    const nestedIndent = INDENT.repeat(opts.depth + 1);
    return `[\n${items.map((i) => `${nestedIndent}${i}`).join(",\n")}\n${indentStr}]`;
  }

  // Tratamento de Datas
  if (value instanceof Date) {
    return ansi.magenta(value.toISOString());
  }

  // Tratamento de Erros (Stack Trace simplificado)
  if (value instanceof Error) {
    const stack = value.stack?.split("\n")[1]?.trim() || "";
    return `${ansi.vero.error(`${value.name}: ${value.message}`)}\n${ansi.dim(stack)}`;
  }

  // Tratamento de Objetos Genéricos
  const keys = Object.keys(value as object);
  if (keys.length === 0) return "{}";

  const indentStr = INDENT.repeat(opts.depth);
  const nestedIndent = INDENT.repeat(opts.depth + 1);

  const lines = keys.map((key) => {
    const val = (value as any)[key];
    const formattedVal = format(val, { ...opts, depth: opts.depth + 1 });

    // A chave é colorida sutilmente, o valor brilha
    // Se a chave for válida como identificador JS, não usa aspas
    const keyDisplay = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
      ? key
      : `"${key}"`;

    return `${nestedIndent}${ansi.white(keyDisplay)}: ${formattedVal}`;
  });

  return `{\n${lines.join(",\n")}\n${indentStr}}`;
}
