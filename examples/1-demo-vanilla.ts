// VERSÃO "VANILLA" (SEM VERO) PARA COMPARAÇÃO

console.clear();
console.log("------------------------------------------------------------"); // hr() manual

// 1. Logs Informativos
console.info("Iniciando o Kernel do Sistema v2.4...");
console.info("Carregando variáveis de ambiente...");

// 2. Objetos Complexos
const mockUser = {
  id: "usr_8823_x99",
  profile: {
    name: "Camilo Developer",
    verified: true,
    plan: "PRO_TIER",
    stats: {
      logins: 42,
      lastSeen: new Date(),
      quota: null,
    },
  },
  tags: ["typescript", "deno", "backend", "cli"],
  metadata: {
    self: null as any,
  },
};

// Referência Circular (O console.log nativo lida com isso mostrando <ref *1>, mas é feio)
mockUser.metadata.self = mockUser;

console.log("Sessão de usuário recuperada:", mockUser);

// 3. Avisos
console.warn("Atenção: O certificado SSL expira em 3 dias.");
console.warn("Uso de memória: 84% (Heap Size: 140MB)");

// 4. Erros
try {
  function conectarBancoDeDados() {
    throw new Error(
      "ConnectionTimeout: Não foi possível atingir 127.0.0.1:5432",
    );
  }
  conectarBancoDeDados();
} catch (error) {
  // Console.error padrão imprime a stack trace vermelha/branca básica
  console.error(error);
}

// 5. Sucesso (Nativo não tem 'success', usamos log comum)
console.log("------------------------------------------------------------");
console.log("Servidor HTTP rodando na porta 8080");
console.log("Pronto para aceitar conexões 🚀");

console.log("------------------------------------------------------------");
console.log("Analisando performance dos endpoints...");

// Tabela
const endpoints = [
  { method: "GET", path: "/api/v1/users", status: 200, ms: 12 },
  { method: "POST", path: "/api/v1/auth", status: 201, ms: 45 },
  { method: "GET", path: "/health", status: 200, ms: 2 },
  { method: "DELETE", path: "/api/v1/temp", status: 403, ms: 8 },
  { method: "PATCH", path: "/legacy", status: 301, ms: 0, deprecated: true },
];

// O console.table nativo é bom, mas não ajusta larguras ou cores condicionalmente
console.table(endpoints);

console.log("Relatório gerado com sucesso.");

console.log("------------------------------------------------------------");
console.log("Executando Quick Benchmarks...");

// 1. Benchmark Nativo
console.time("Parse JSON");
const data = JSON.parse('{"a": 1, "b": 2}');
console.timeEnd("Parse JSON");

// 2. Benchmark Nativo (Wrapper manual para simular o .measure)
console.time("Leitura Disco");
await new Promise((r) => setTimeout(r, 120));
console.timeEnd("Leitura Disco");

// 3. Benchmark Nativo Lento
console.time("Conexão DB");
await new Promise((r) => setTimeout(r, 350));
console.timeEnd("Conexão DB");

console.log("------------------------------------------------------------");
// console.copilot() não existe nativamente
console.log("Fim da demonstração padrão.");

export {};
