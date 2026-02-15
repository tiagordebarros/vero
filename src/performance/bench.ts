/**
 * Performance profiling utilities
 * Visual timers and counters for user profiling (NOT Deno.bench)
 * Used by Vero.time() method for measuring operations
 */

import * as ansi from "../formatting/ansi.ts";
import { vero } from "../formatting/colors.ts";

// Armazém global para os timers
const timers = new Map<string, number>();

// Armazém global para os contadores
const counters = new Map<string, number>();

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
export function endTimer(label: string, maxWidth?: number): string | null {
  const startTime = timers.get(label);
  if (startTime === undefined) return null;

  const endTime = performance.now();
  const duration = endTime - startTime;
  timers.delete(label); // Limpeza

  return renderBar(label, duration, maxWidth);
}

/**
 * Retorna o tempo intermediário sem finalizar o cronómetro
 */
export function logTimer(label: string, maxWidth?: number): string | null {
  const startTime = timers.get(label);
  if (startTime === undefined) return null;

  const currentTime = performance.now();
  const duration = currentTime - startTime;

  return renderBar(label, duration, maxWidth);
}

/**
 * Incrementa um contador
 */
export function incrementCounter(label: string): number {
  const current = counters.get(label) || 0;
  const next = current + 1;
  counters.set(label, next);
  return next;
}

/**
 * Reseta um contador
 */
export function resetCounter(label: string): void {
  counters.delete(label);
}

/**
 * Desenha a barra de performance baseada num "budget" (orçamento) de tempo.
 * Assumimos que 500ms é o "máximo aceitável" para uma operação síncrona visual.
 */
function renderBar(label: string, ms: number, maxWidth?: number): string {
  // 1. Determinar a cor baseada na lentidão
  let colorFn = vero.success; // Rápido (< 50ms)
  if (ms > 50) colorFn = vero.warn; // Médio (> 50ms)
  if (ms > 200) colorFn = vero.error; // Lento (> 200ms)

  // 2. Formatar o tempo (com precisão de 2 casas se < 10ms)
  const timeStr = ms < 10 ? ms.toFixed(3) : ms.toFixed(1);
  const timeLabel = colorFn(timeStr + "ms");

  // 3. Determinar largura da barra baseado no espaço disponível
  let barWidth = BAR_WIDTH;
  const labelPadded = label.padEnd(15);

  // Se maxWidth foi fornecido (tela pequena), ajustar
  if (maxWidth !== undefined) {
    const baseLabelLength = 15; // label.padEnd(15)
    const timeLabelLength = timeStr.length + 2; // "XXms"
    const spacesCount = 2; // espaços entre elementos
    const availableForBar = maxWidth - baseLabelLength - timeLabelLength -
      spacesCount;

    // Cada bloco ■ ocupa 2 células visuais, então dividir por 2
    // Suprimir barra se não houver espaço suficiente (< 10 células = 5 blocos)
    if (availableForBar < 10) {
      return `${ansi.bold(ansi.white(labelPadded))} ${timeLabel}`;
    }

    // Calcular número de blocos que cabem (cada bloco = 2 células)
    barWidth = Math.min(Math.floor(availableForBar / 2), BAR_WIDTH);
  }

  // 4. Calcular preenchimento (escala logarítmica suave para caber na barra)
  const maxBudget = 500;
  const percent = Math.min(ms / maxBudget, 1);
  const fillCount = Math.ceil(percent * barWidth);
  const emptyCount = barWidth - fillCount;

  // 5. Construir a barra com cores aplicadas
  const filled = colorFn(CHAR_FILL.repeat(fillCount));
  const empty = ansi.dim(ansi.gray(CHAR_EMPTY.repeat(emptyCount)));

  // Layout: [ LABEL ] [ BARRA ] TEMPO ms
  return `${ansi.bold(ansi.white(labelPadded))} ${filled}${empty} ${timeLabel}`;
}
