import { logger } from "../src/mod.ts";

// Vamos simular o boot de uma aplicação backend moderna

console.clear(); // Limpa o terminal para o show começar
logger.hr(); // Linha horizontal elegante

// 1. Logs Informativos (Simples)
logger.info("Iniciando o Kernel do Sistema v2.4...");
logger.info("Carregando variáveis de ambiente...");

// 2. Teste de Objetos Complexos (A prova de fogo)
// Criamos um objeto com Tipos variados, Nulidade e Datas
const mockUser = {
  id: "usr_8823_x99",
  profile: {
    name: "Camilo Developer",
    verified: true,
    plan: "PRO_TIER",
    stats: {
      logins: 42,
      lastSeen: new Date(), // Teste de formatação de Data
      quota: null, // Teste de null (cinza)
    },
  },
  tags: ["typescript", "deno", "backend", "cli"], // Array compactado
  metadata: {
    // Vamos criar uma referência circular proposital para testar a proteção
    self: null as any,
  },
};

// Criando o ciclo infinito (Circular Reference)
mockUser.metadata.self = mockUser;

logger.info("Sessão de usuário recuperada:", mockUser);

// 3. Teste de Aviso (Warning)
logger.warn("Atenção: O certificado SSL expira em 3 dias.");
logger.warn("Uso de memória: 84% (Heap Size: 140MB)");

// 4. Teste de Erro com Stack Trace (A parte crítica)
try {
  // Simulando uma função que falha profundamente
  function conectarBancoDeDados() {
    throw new Error(
      "ConnectionTimeout: Não foi possível atingir 127.0.0.1:5432",
    );
  }
  conectarBancoDeDados();
} catch (error) {
  // O Vero vai capturar isso, colorir o erro de rosa e formatar a stack
  logger.error(error);
}

// 5. Sucesso Final
logger.hr();
logger.success("Servidor HTTP rodando na porta 8080");
logger.success("Pronto para aceitar conexões 🚀");

logger.hr();
logger.info("Analisando performance dos endpoints...");

// Dados mockados perfeitos para tabela
const endpoints = [
  { method: "GET", path: "/api/v1/users", status: 200, ms: 12 },
  { method: "POST", path: "/api/v1/auth", status: 201, ms: 45 },
  { method: "GET", path: "/health", status: 200, ms: 2 },
  { method: "DELETE", path: "/api/v1/temp", status: 403, ms: 8 }, // Erro simulado
  { method: "PATCH", path: "/legacy", status: 301, ms: 0, deprecated: true }, // Coluna extra
];

logger.table(endpoints);

logger.success("Relatório gerado com sucesso.");

logger.hr();
logger.info("Executando Quick Benchmarks...");

// 1. Teste Rápido (Verde)
logger.time("Parse JSON");
// Simula trabalho rápido
const data = JSON.parse('{"a": 1, "b": 2}');
logger.timeEnd("Parse JSON");

// 2. Teste Médio (Amarelo)
// Usando o helper .measure() que criámos
await logger.measure("Leitura Disco", async () => {
  // Simula delay de 120ms
  await new Promise((r) => setTimeout(r, 120));
});

// 3. Teste Lento (Vermelho/Rosa)
logger.time("Conexão DB");
await new Promise((r) => setTimeout(r, 350)); // 350ms
logger.timeEnd("Conexão DB");

logger.hr();

logger.copilot();
