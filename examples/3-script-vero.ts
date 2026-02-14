import { logger } from "../src/mod.ts";

const randomBoolean = Boolean(Math.floor(Math.random() * 2));

logger.hr();
logger.info("Iniciando Smoke Test de Infraestrutura 🏗️");
logger.hr();

const services = [
  { name: "User Service", url: "http://api.users", simulateFail: false },
  {
    name: "Payment Service",
    url: "http://api.payments",
    simulateFail: randomBoolean,
  },
  { name: "Notif Service", url: "http://api.notifs", simulateFail: false },
];

type ReportEntry = {
  service: string;
  status: "CRITICAL" | "HEALTHY";
  code: number;
};
const report: ReportEntry[] = [];

for (const service of services) {
  // O Vero mede o tempo e cria o log visual automaticamente
  // Usamos um bloco try/catch simulado para mostrar a elegância do erro

  // Label visual para o teste atual
  logger.info(`Conectando a ${service.name}...`);

  await logger.measure(service.name, async () => {
    // Simulação
    await new Promise((r) => setTimeout(r, Math.random() * 200 + 50));

    if (service.simulateFail) {
      // O Vero.error destaca o erro semanticamente sem poluir
      logger.error(`ConnectionRefused: ${service.url} is down.`);
      report.push({ service: service.name, status: "CRITICAL", code: 500 });
    } else {
      logger.success("Conexão estabelecida.");
      report.push({ service: service.name, status: "HEALTHY", code: 200 });
    }
  });

  // Um pequeno espaço para respirar entre testes
  console.log(""); // TODO: criar logger.br() para realziar essa função
}

logger.hr();
logger.info("Relatório Final de Execução:");

// A tabela do Vero vai colorir automaticamente:
// "CRITICAL" (string) -> Verde/Texto (ou podemos customizar)
// 500 (number) -> Amarelo/Destaque
logger.table(report);

const hasError = report.some((r: ReportEntry) => r.status === "CRITICAL");
if (hasError) {
  logger.error("❌ O deploy foi cancelado devido a falhas nos testes.");
  Deno.exit(1);
} else {
  logger.success("✅ Todos os sistemas operacionais. Deploy autorizado.");
}
