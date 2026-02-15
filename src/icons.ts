/**
 * Vero Icon System - Unicode Glyphs (Monocromáticos)
 * 
 * Todos os ícones são glyphs Unicode com largura simples (1 caractere).
 * Evitamos emojis (2 caracteres, coloridos pelo SO) para manter:
 * - Alinhamento vertical perfeito
 * - Cores controladas via ANSI
 * - Identidade visual premium e consistente
 */

export const ICONS = {
  // Níveis de Log
  log: "•", // Bullet
  info: "ℹ", // Information Source
  warn: "⚠", // Warning Sign
  error: "✖", // Heavy Multiplication X
  debug: "◆", // Black Diamond (Identidade visual do Vero!)
  success: "✔", // Heavy Check Mark

  // Funcionalidades Específicas
  trace: "≡", // Identical To (representa stack/pilha)
  timer: "◷", // White Circle with Upper Right Quadrant
  count: "№", // Numero Sign

  // Agrupamento
  groupExpanded: "▼", // Black Down-Pointing Triangle
  groupCollapsed: "▶", // Black Right-Pointing Triangle

  // Tipos de Dados (Dir/Dirxml)
  dir: "☷", // Trigram for Earth (visual de lista/propriedades)
  dirxml: "⌗", // Viewdata Square (estrutura/markup)

  // Utilitários
  reset: "↺", // Anticlockwise Open Circle Arrow
  assert: "✖", // Same as error (assertion failure)
};
