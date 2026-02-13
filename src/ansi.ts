/**
 * Vero ANSI Engine
 * Um motor de colorização ultra-leve focado em performance e estética.
 */

import process from "node:process";

const ESC = "\x1b[";
const RESET = `${ESC}0m`;

// Detecção básica de ambiente (Deno/Node/Bun) para saber se devemos colorir
// No Deno, usamos Deno.noColor. No Node, process.env.NO_COLOR.
const isDeno = typeof Deno !== "undefined";
// @ts-ignore: Compatibilidade com Node/Bun sem types externos
const isNode = typeof process !== "undefined" && process.env;

export const state = {
  // Se NO_COLOR estiver definido, desativamos as cores automaticamente
  enabled: isDeno ? !Deno.noColor : isNode ? !process.env.NO_COLOR : true,
};

/**
 * Função helper para criar sequências ANSI
 */
function code(open: number | string, close: number): (text: string) => string {
  return (text: string) => {
    return state.enabled ? `${ESC}${open}m${text}${ESC}${close}m` : text;
  };
}

/**
 * Função para cores TrueColor (RGB) - A chave para os tons pastéis
 */
function rgb(r: number, g: number, b: number): (text: string) => string {
  return (text: string) => {
    return state.enabled ? `${ESC}38;2;${r};${g};${b}m${text}${RESET}` : text;
  };
}

// --- Modificadores de Texto ---
export const bold = code(1, 22);
export const dim = code(2, 22);
export const italic = code(3, 23);
export const underline = code(4, 24);
export const inverse = code(7, 27);

// --- Cores Básicas (Fallback) ---
export const red = code(31, 39);
export const green = code(32, 39);
export const yellow = code(33, 39);
export const blue = code(34, 39);
export const magenta = code(35, 39);
export const cyan = code(36, 39);
export const white = code(37, 39);
export const gray = code(90, 39);

// --- A PALETA VERO (Tons Pastéis Premium) ---
// Estes hexadecimais foram escolhidos para leitura suave em fundo escuro
export const vero = {
  // Rosa Pastel (Erros suaves)
  error: rgb(255, 175, 215),
  // Verde Menta (Sucesso/Strings)
  success: rgb(135, 255, 175),
  // Azul Céu Pálido (Informação/Propriedades)
  info: rgb(135, 215, 255),
  // Laranja Pêssego (Avisos/Números)
  warn: rgb(255, 215, 135),
  // Roxo Lavanda (Objetos/Tipos)
  type: rgb(175, 135, 255),
  // Cinza Pedra (Pontuação/Bordas de tabela)
  border: rgb(108, 108, 108),
};

/**
 * Utilitário para converter Hex para RGB (caso queira adicionar mais cores dinamicamente)
 */
export function hex(hexCode: string): (text: string) => string {
  const cleanHex = hexCode.replace("#", "");
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return rgb(r, g, b);
}
