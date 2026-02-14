🔮 Vero (Visual Debugger)

[![ORCID](https://img.shields.io/badge/ORCID-0000--0001--6823--3562-A6CE39?logo=orcid&logoColor=white)](https://orcid.org/0000-0001-6823-3562)

    "console.log, mas com alma." O debugger visual universal, zero-dependências e focado em estética para Deno, Node.js e Bun.

📸 Demo (O Momento "Uau")

(TODO: Inserir um GIF animado ou um Screenshot do terminal mostrando a Tabela Colorida e o Benchmark.).
Snippet de código

[IMAGEM: Screenshot do terminal com fundo escuro, mostrando uma tabela Vero colorida em tons pastéis e uma barra de progresso]

⚡ O Problema

O console.log padrão é ruidoso, difícil de ler e feio. Bibliotecas existentes (Winston, Pino) são focadas em arquivos de log para servidores, pesadas e complexas de configurar para o dia a dia do desenvolvimento.

O Vero muda isso. Ele não é um logger de produção; é uma ferramenta de Developer Experience (DX) para iluminar o seu fluxo de trabalho.
✨ Diferenciais (Filosofia "Zero")

    Zero Dependências: 100% TypeScript nativo. Sem node_modules pesados.

    Zero Configuração: Funciona "out of the box" com suporte a cores TrueColor (RGB).

    Inteligência Visual: Detecta tipos (Strings, Numbers, Booleans) e aplica uma paleta de cores pastéis semanticamente correta.

    Circular Safe: Imprime objetos com referências circulares sem travar o terminal.

    Tabelas Responsivas: Recriação do console.table com algoritmos manuais de cálculo de largura e bordas Unicode.

🛠️ Instalação

Disponível no JSR (JavaScript Registry):
Bash

# Deno
deno add @seu-user/vero

# Node.js (via npx)
npx jsr add @seu-user/vero

# Bun
bunx jsr add @seu-user/vero

🚀 Uso Rápido
TypeScript

import { logger } from "@seu-user/vero";

// 1. Logs Bonitos
logger.info("Iniciando microserviço de pagamentos...");
logger.warn("Atenção: Cache não inicializado.");

// 2. Objetos Complexos (Formatados automaticamente)
const user = { 
  id: 1, 
  name: "Dev Hackathon", 
  roles: ["admin", "editor"],
  meta: { active: true, login: new Date() } 
};
logger.debug(user);

// 3. Tabelas Inteligentes
const metrics = [
  { endpoint: "/api/v1", latency: "12ms", status: 200 },
  { endpoint: "/api/auth", latency: "450ms", status: 500 },
];
logger.table(metrics);

// 4. Benchmark Visual
logger.time("DbQuery");
await database.connect();
logger.timeEnd("DbQuery"); // Saída: ⏱ DbQuery ■■■■■···· 450ms

🤖 A Jornada com GitHub Copilot CLI

Este projeto foi construído durante o GitHub Copilot CLI Hackathon 2026. O objetivo era testar os limites da geração de código nativo sem dependências externas.
Como o Copilot CLI acelerou o Vero:

O diferencial deste projeto foi utilizar o CLI para resolver algoritmos complexos de manipulação de string e visualização.

    Desafio 1: Cores ANSI Manuais (Sem Chalk) Prompt: gh copilot suggest "Generate a TypeScript function to convert Hex color to ANSI TrueColor escape sequence without libraries" Resultado: O Copilot gerou a lógica de bitwise operations para separar os canais RGB, economizando horas de pesquisa sobre especificações de terminal.

    Desafio 2: Tabela Responsiva Prompt: gh copilot suggest "Algorithm to calculate max column width of an array of objects for an ASCII table" Resultado: O CLI sugeriu uma abordagem de duas passadas (medição + renderização) que se tornou o núcleo do table.ts.

    Desafio 3: Detecção de Referência Circular Prompt: gh copilot explain "How to safely stringify a circular object in JavaScript using WeakSet" Resultado: A explicação ajudou a implementar o formatter.ts robusto que evita estouro de pilha.

📂 Estrutura do Projeto
Plaintext

src/
├── ansi.ts       # Motor de cores TrueColor (Zero Deps)
├── bench.ts      # Visualizador de performance
├── formatter.ts  # Recursão inteligente e colorização de tipos
├── table.ts      # Motor de renderização de tabelas ASCII
└── mod.ts        # Ponto de entrada (Public API)

📜 Licença

MIT © 2026 [Tiago R. de Barros]
