import * as ansi from "./ansi.ts";

// Armazém global para os timers
const timers = new Map<string, number>();

// Configuração visual
const BAR_WIDTH = 20; // Largura da barra em caracteres
const CHAR_FILL = "■";
const CHAR_EMPTY = "·"; // Um ponto médio subtil

/**
 * Inicia um cronómetro
 */
export function startTimer(label: string) {
  timers.set(label, performance.now());
}

/**
 * Finaliza o cronómetro e retorna a string visual formatada
 */
export function endTimer(label: string): string | null {
  const startTime = timers.get(label);
  if (startTime === undefined) return null;

  const endTime = performance.now();
  const duration = endTime - startTime;
  timers.delete(label); // Limpeza

  return renderBar(label, duration);
}

/**
 * Desenha a barra de performance baseada num "budget" (orçamento) de tempo.
 * Assumimos que 500ms é o "máximo aceitável" para uma operação síncrona visual.
 */
function renderBar(label: string, ms: number): string {
  // 1. Determinar a cor baseada na lentidão
  let colorFn = ansi.vero.success; // Rápido (< 50ms)
  if (ms > 50) colorFn = ansi.vero.warn; // Médio (> 50ms)
  if (ms > 200) colorFn = ansi.vero.error; // Lento (> 200ms)

  // 2. Calcular preenchimento (escala logarítmica suave para caber na barra)
  // Se for > 500ms, enche a barra toda.
  const maxBudget = 500;
  const percent = Math.min(ms / maxBudget, 1);
  const fillCount = Math.ceil(percent * BAR_WIDTH);
  const emptyCount = BAR_WIDTH - fillCount;

  // 3. Construir a barra
  const filled = colorFn(CHAR_FILL.repeat(fillCount));
  const empty = ansi.dim(ansi.gray(CHAR_EMPTY.repeat(emptyCount)));

  // 4. Formatar o tempo (com precisão de 2 casas se < 10ms)
  const timeStr = ms < 10 ? ms.toFixed(3) : ms.toFixed(1);

  // Layout: [ LABEL ] [ BARRA ] TEMPO ms
  return `${ansi.bold(ansi.white(label.padEnd(15)))} ${filled}${empty} ${colorFn(timeStr + "ms")}`;
}
