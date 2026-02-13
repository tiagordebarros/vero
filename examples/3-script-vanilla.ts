console.log("Iniciando Smoke Test...");

const services = [
  { name: "User Service", url: "http://api.users", simulateFail: false },
  { name: "Payment Service", url: "http://api.payments", simulateFail: true }, // Vai falhar
  { name: "Notif Service", url: "http://api.notifs", simulateFail: false },
];

const results = [];

console.log("------------------------------------------------");

for (const service of services) {
  console.log(`Testando ${service.name}...`);
  const start = performance.now();

  // Simulação de Request
  await new Promise((r) => setTimeout(r, Math.random() * 200 + 50));

  const end = performance.now();
  const duration = (end - start).toFixed(2);

  if (service.simulateFail) {
    console.error(`[FALHA] ${service.name} retornou 500 (${duration}ms)`);
    results.push({ service: service.name, status: "FAIL", time: duration });
  } else {
    console.log(`[SUCESSO] ${service.name} retornou 200 (${duration}ms)`);
    results.push({ service: service.name, status: "OK", time: duration });
  }
}

console.log("------------------------------------------------");
console.log("Resumo dos Testes:");
console.table(results); // Tabela nativa
